import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import { bitkub, BitkubAdapter } from "./src/lib/exchanges/bitkub";
import { getLiveUsdtRate } from "./src/lib/exchanges/index";
import { sendEmail, emailTemplates } from "./src/lib/email";
import { prisma } from "./src/lib/prisma";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Multer setup for slip uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "./uploads";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Middleware: Auth
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware: Admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });
  next();
};

// --- API Routes ---

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "errors.registration_failed" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "errors.email_exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "CUSTOMER" },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "errors.server_error" });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "errors.invalid_credentials" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "errors.invalid_credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: "errors.server_error" });
  }
});

// Orders: Create
app.post("/api/orders", authenticate, async (req: any, res) => {
  const { amountTHB, network, walletAddress, paymentMethod, customerNote, customerName, email, phone } = req.body;
  try {
    const liveRate = await getLiveUsdtRate();
    const currentRate = liveRate.sellingRate;
    
    // Fetch fee settings
    const settings = await prisma.appSetting.findMany({
      where: {
        key: {
          in: ["NETWORK_FEE_TRC20", "NETWORK_FEE_ERC20", "NETWORK_FEE_BEP20", "SERVICE_FEE_PERCENT"]
        }
      }
    });

    const getSetting = (key: string, defaultValue: string) => 
      settings.find(s => s.key === key)?.value || defaultValue;

    const networkFeeUSDT = parseFloat(getSetting(`NETWORK_FEE_${network}`, "1.0"));
    const serviceFeePercent = parseFloat(getSetting("SERVICE_FEE_PERCENT", "1.5"));
    
    const serviceFeeTHB = (amountTHB * serviceFeePercent) / 100;
    const amountAfterServiceFee = amountTHB - serviceFeeTHB;
    
    const usdtBeforeNetworkFee = amountAfterServiceFee / currentRate;
    const estimatedUSDT = Math.max(0, usdtBeforeNetworkFee - networkFeeUSDT);

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        customerName: customerName || req.user.name || "Customer",
        email: email || req.user.email,
        phone: phone || "",
        amountTHB,
        exchangeRate: currentRate,
        serviceFeeTHB,
        networkFeeUSDT,
        estimatedUSDT,
        walletAddress,
        network,
        paymentMethod,
        customerNote,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
      },
    });

    // Send email notification (async, don't block response)
    if (order.email) {
      sendEmail({
        to: order.email,
        ...emailTemplates.orderCreated(order),
      });
    }

    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Orders: List (User)
app.get("/api/orders", authenticate, async (req: any, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Orders: Detail
app.get("/api/orders/:id", authenticate, async (req: any, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });
    if (!order || (order.userId !== req.user.id && req.user.role !== "ADMIN")) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Orders: Upload Slip
app.post("/api/orders/:id/upload-slip", authenticate, upload.single("slip"), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id, userId: req.user.id },
      data: {
        proofImageUrl: `/uploads/${req.file.filename}`,
        status: "PAYMENT_UPLOADED",
      },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// User: Stats
app.get("/api/user/stats", authenticate, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({ where: { userId: req.user.id } });
    const stats = {
      totalUsdt: orders.filter(o => o.status === "COMPLETED").reduce((acc, o) => acc + (o.finalUSDT || o.estimatedUSDT), 0),
      totalThb: orders.filter(o => o.status === "COMPLETED").reduce((acc, o) => acc + o.amountTHB, 0),
      pendingCount: orders.filter(o => ["PENDING", "AWAITING_PAYMENT", "PAYMENT_UPLOADED", "UNDER_REVIEW"].includes(o.status)).length,
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Exchange Rate: Get
app.get("/api/exchange-rate", async (req, res) => {
  try {
    const liveRate = await getLiveUsdtRate();
    res.json({
      rate: liveRate.sellingRate,
      marketRate: liveRate.marketRate,
      source: liveRate.source,
      timestamp: liveRate.timestamp
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fee Settings: Get Public
app.get("/api/fee-settings", async (req, res) => {
  try {
    const settings = await prisma.appSetting.findMany({
      where: {
        key: {
          in: ["NETWORK_FEE_TRC20", "NETWORK_FEE_ERC20", "NETWORK_FEE_BEP20", "SERVICE_FEE_PERCENT"]
        }
      }
    });
    
    const config = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Bank Accounts: Get Active
app.get("/api/bank-accounts/active", async (req, res) => {
  try {
    const bank = await prisma.bankAccount.findFirst({ where: { isActive: true } });
    res.json(bank);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- Admin Routes ---

// Admin: List Orders
app.get("/api/admin/orders", authenticate, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Create Order Manually
app.post("/api/admin/orders", authenticate, isAdmin, async (req: any, res) => {
  const { 
    userId, 
    amountTHB, 
    exchangeRate, 
    serviceFeeTHB, 
    networkFeeUSDT, 
    estimatedUSDT, 
    walletAddress, 
    network, 
    paymentMethod, 
    status, 
    customerNote, 
    adminNote 
  } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: user.name || "Customer",
        email: user.email,
        phone: "",
        amountTHB: Number(amountTHB),
        exchangeRate: Number(exchangeRate),
        serviceFeeTHB: Number(serviceFeeTHB),
        networkFeeUSDT: Number(networkFeeUSDT),
        estimatedUSDT: Number(estimatedUSDT),
        walletAddress,
        network,
        paymentMethod,
        status: status || "PENDING",
        customerNote,
        adminNote,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
      },
    });

    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        orderId: order.id,
        action: "CREATED",
        details: "Order manually created by admin",
      },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Failed to create order manually", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Order Detail
app.get("/api/admin/orders/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { 
        user: { select: { name: true, email: true } },
        adminActions: {
          include: { admin: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Update Order Status
app.patch("/api/admin/orders/:id/status", authenticate, isAdmin, async (req: any, res) => {
  const { status, txHash, adminNote } = req.body;
  try {
    const oldOrder = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!oldOrder) return res.status(404).json({ message: "Order not found" });

    let finalAdminNote = adminNote;
    if (status === "EXPIRED") {
      const expirationNote = "Expired due to inactivity";
      if (!adminNote) {
        finalAdminNote = expirationNote;
      } else if (!adminNote.includes(expirationNote)) {
        finalAdminNote = `${adminNote}\n${expirationNote}`;
      }
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, txHash, adminNote: finalAdminNote },
      include: { user: { select: { name: true, email: true } } },
    });

    // Log the action
    const actions: string[] = [];
    if (status !== oldOrder.status) {
      actions.push(`Status: ${oldOrder.status} -> ${status}`);
    }
    if (txHash !== oldOrder.txHash) {
      actions.push(oldOrder.txHash ? "Updated Transaction Hash" : "Added Transaction Hash");
    }
    if (adminNote !== oldOrder.adminNote) {
      actions.push(oldOrder.adminNote ? "Updated Admin Note" : "Added Admin Note");
    }

    if (actions.length > 0) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          orderId: order.id,
          action: actions.join(", "),
          details: `Updated by ${req.user.name || req.user.email}`,
        },
      });
    }

    // Send email notifications based on status
    const recipient = order.email || order.user?.email;
    if (recipient) {
      if (status === "APPROVED") {
        sendEmail({
          to: recipient,
          ...emailTemplates.paymentApproved(order),
        });
      } else if (status === "USDT_SENT" || status === "COMPLETED") {
        sendEmail({
          to: recipient,
          ...emailTemplates.usdtSent(order),
        });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Delete Order
app.delete("/api/admin/orders/:id", authenticate, isAdmin, async (req: any, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Log the action first because order will be gone
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: `Deleted Order ${order.orderNumber}`,
        details: `Deleted by ${req.user.name || req.user.email}`,
      },
    });

    await prisma.order.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: List Users
app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Update User Role
app.patch("/api/admin/users/:id/role", authenticate, isAdmin, async (req, res) => {
  const { role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Delete User
app.delete("/api/admin/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    // Check if user has orders
    const orderCount = await prisma.order.count({ where: { userId: req.params.id } });
    if (orderCount > 0) {
      return res.status(400).json({ message: "Cannot delete user with existing orders" });
    }
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Get Bank Accounts
app.get("/api/admin/bank-accounts", authenticate, isAdmin, async (req, res) => {
  try {
    const banks = await prisma.bankAccount.findMany();
    res.json(banks);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Update Bank Account
app.patch("/api/admin/bank-accounts/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const bank = await prisma.bankAccount.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(bank);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Create Bank Account
app.post("/api/admin/bank-accounts", authenticate, isAdmin, async (req, res) => {
  try {
    const bank = await prisma.bankAccount.create({
      data: req.body,
    });
    res.json(bank);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Delete Bank Account
app.delete("/api/admin/bank-accounts/:id", authenticate, isAdmin, async (req, res) => {
  try {
    await prisma.bankAccount.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Bank account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Get Exchange Rates
app.get("/api/admin/exchange-rates", authenticate, isAdmin, async (req, res) => {
  try {
    // Ensure default manual rate exists
    let rates = await prisma.exchangeRate.findMany();
    if (!rates.some(r => r.pair === "USDT/THB")) {
      const defaultRate = await prisma.exchangeRate.create({
        data: { pair: "USDT/THB", rate: 35.50, source: "MANUAL" }
      });
      rates.push(defaultRate);
    }
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Create Exchange Rate
app.post("/api/admin/exchange-rates", authenticate, isAdmin, async (req, res) => {
  try {
    const { pair, rate, source } = req.body;
    const newRate = await prisma.exchangeRate.upsert({
      where: { pair },
      update: { rate, source },
      create: { pair, rate, source },
    });
    res.json(newRate);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Update Exchange Rate
app.patch("/api/admin/exchange-rates/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const rate = await prisma.exchangeRate.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(rate);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Get Bitkub Config
app.get("/api/admin/bitkub-config", authenticate, isAdmin, async (req, res) => {
  try {
    const settings = await prisma.appSetting.findMany({
      where: { key: { startsWith: "BITKUB_" } },
    });
    const config = settings.reduce((acc: any, s) => {
      const key = s.key.replace("BITKUB_", "").toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[key] = s.value;
      return acc;
    }, {});
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Save Bitkub Config
app.post("/api/admin/bitkub-config", authenticate, isAdmin, async (req, res) => {
  const config = req.body;
  try {
    const updates = Object.entries(config).map(([key, value]) => {
      const dbKey = "BITKUB_" + key.replace(/([A-Z])/g, "_$1").toUpperCase();
      return prisma.appSetting.upsert({
        where: { key: dbKey },
        update: { value: String(value) },
        create: { key: dbKey, value: String(value) },
      });
    });
    await Promise.all(updates);
    
    // Update the live instance
    bitkub.updateConfig(config.apiKey, config.apiSecret, config.baseUrl);
    
    res.json({ message: "Config saved" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Get Fee Settings
app.get("/api/admin/fee-settings", authenticate, isAdmin, async (req, res) => {
  try {
    const settings = await prisma.appSetting.findMany({
      where: {
        key: {
          in: ["NETWORK_FEE_TRC20", "NETWORK_FEE_ERC20", "NETWORK_FEE_BEP20", "SERVICE_FEE_PERCENT"]
        }
      }
    });
    
    const config = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Save Fee Settings
app.post("/api/admin/fee-settings", authenticate, isAdmin, async (req, res) => {
  const config = req.body;
  try {
    const updates = Object.entries(config).map(([key, value]) => {
      return prisma.appSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });
    await Promise.all(updates);
    res.json({ message: "Fee settings saved" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- Vite Middleware ---

async function loadBitkubConfig() {
  try {
    const settings = await prisma.appSetting.findMany({
      where: { key: { startsWith: "BITKUB_" } },
    });
    const config = settings.reduce((acc: any, s) => {
      const key = s.key.replace("BITKUB_", "").toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[key] = s.value;
      return acc;
    }, {});
    
    if (config.apiKey || config.apiSecret || config.baseUrl) {
      bitkub.updateConfig(config.apiKey, config.apiSecret, config.baseUrl);
    }
  } catch (err) {
    console.error("Failed to load Bitkub config", err);
  }
}

async function startAutoRateSync() {
  const sync = async () => {
    try {
      const autoSyncSetting = await prisma.appSetting.findUnique({
        where: { key: "BITKUB_AUTO_RATE_SYNC" },
      });
      
      if (autoSyncSetting?.value === "true") {
        console.log("Auto Rate Sync: Fetching latest rate from Bitkub...");
        const liveRate = await getLiveUsdtRate();
        
        if (liveRate.source === "Bitkub") {
          await prisma.exchangeRate.upsert({
            where: { pair: "USDT/THB" },
            update: { rate: liveRate.marketRate, source: "BITKUB" },
            create: { pair: "USDT/THB", rate: liveRate.marketRate, source: "BITKUB" },
          });
          console.log(`Auto Rate Sync: Updated USDT/THB rate to ${liveRate.marketRate}`);
        } else {
          console.log("Auto Rate Sync: Skipped update (source is not Bitkub or fetch failed)");
        }
      }
    } catch (err) {
      console.error("Auto Rate Sync Error:", err);
    }
  };

  // Run every 1 minute
  setInterval(sync, 60 * 1000);
  // Initial run
  sync();
}

async function startServer() {
  await loadBitkubConfig();
  startAutoRateSync();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
