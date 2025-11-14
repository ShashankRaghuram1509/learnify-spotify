import { z } from "zod";

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name too long"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(1, "Password is required"),
});

// Payment schemas
export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
  amount: z.number().positive().max(10000000),
  planName: z.enum(["Lite", "Premium", "Premium Pro"]),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;
