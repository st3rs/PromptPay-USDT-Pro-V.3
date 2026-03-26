import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create Customer
  const customerPassword = await bcrypt.hash("user123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: customerPassword,
      name: "Test Customer",
      role: "CUSTOMER",
    },
  });

  // Create Bank Account
  await prisma.bankAccount.upsert({
    where: { accountNumber: "123-4-56789-0" },
    update: {},
    create: {
      bankName: "Kasikorn Bank",
      accountName: "PromptPay USDT Co., Ltd.",
      accountNumber: "123-4-56789-0",
      isActive: true,
    },
  });

  // Create Exchange Rate
  await prisma.exchangeRate.upsert({
    where: { pair: "USDT/THB" },
    update: { rate: 35.50 },
    create: {
      pair: "USDT/THB",
      rate: 35.50,
      source: "BITKUB",
    },
  });

  // Create App Settings
  const settings = [
    { key: "BITKUB_API_KEY", value: "" },
    { key: "BITKUB_API_SECRET", value: "" },
    { key: "BITKUB_BASE_URL", value: "https://api.bitkub.com" },
    { key: "BITKUB_SYMBOL", value: "THB_USDT" },
    { key: "BITKUB_AUTO_RATE_SYNC", value: "true" },
    { key: "NETWORK_FEE_TRC20", value: "1.0" },
    { key: "NETWORK_FEE_ERC20", value: "15.0" },
    { key: "NETWORK_FEE_BEP20", value: "0.8" },
    { key: "SERVICE_FEE_PERCENT", value: "1.5" },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
