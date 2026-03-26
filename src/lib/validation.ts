import { z } from "zod";

// --- Auth ---
export const loginSchema = z.object({
  email: z.string().email("validation.email_invalid"),
  password: z.string().min(6, "validation.password_min"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "validation.name_min"),
  email: z.string().email("validation.email_invalid"),
  password: z.string().min(6, "validation.password_min"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "validation.passwords_mismatch",
  path: ["confirmPassword"],
});

// --- Orders ---
export const createOrderSchema = z.object({
  customerName: z.string().min(2, "validation.name_min").optional(),
  email: z.string().email("validation.email_invalid").optional(),
  phone: z.string().min(9, "validation.phone_invalid").optional(),
  amountTHB: z.number().min(100, "validation.amount_min"),
  network: z.enum(["TRC20", "ERC20", "BEP20"]),
  walletAddress: z.string().min(20, "validation.wallet_invalid"),
  paymentMethod: z.enum(["PROMPTPAY", "BANK_TRANSFER"]),
  customerNote: z.string().optional(),
});

export const adminCreateOrderSchema = z.object({
  userId: z.string().min(1, "validation.user_id_required"),
  amountTHB: z.number().min(100, "validation.amount_min"),
  exchangeRate: z.number().positive("validation.rate_positive"),
  serviceFeeTHB: z.number().nonnegative("validation.fee_nonnegative"),
  networkFeeUSDT: z.number().nonnegative("validation.fee_nonnegative"),
  walletAddress: z.string().min(20, "validation.wallet_invalid"),
  network: z.enum(["TRC20", "ERC20", "BEP20"]),
  paymentMethod: z.enum(["PROMPTPAY", "BANK_TRANSFER"]),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]),
  customerNote: z.string().optional(),
  adminNote: z.string().optional(),
});

// --- Admin ---
export const bitkubSettingsSchema = z.object({
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  symbol: z.string().default("THB_USDT"),
  autoRateSync: z.boolean().default(false),
  enabled: z.boolean().default(false),
});

export const adminOrderUpdateSchema = z.object({
  status: z.enum([
    "PENDING", "AWAITING_PAYMENT", "PAYMENT_UPLOADED", "UNDER_REVIEW", 
    "APPROVED", "USDT_SENT", "COMPLETED", "REJECTED", "EXPIRED"
  ]),
  adminNote: z.string().optional(),
  txHash: z.string().optional(),
  finalUSDT: z.number().optional(),
});

// --- Types ---
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminCreateOrderInput = z.infer<typeof adminCreateOrderSchema>;
export type BitkubSettingsInput = z.infer<typeof bitkubSettingsSchema>;
export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthResponse {
  user: User;
  token: string;
}
