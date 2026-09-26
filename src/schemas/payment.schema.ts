import { z } from "zod";

export const paymentStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "CANCELLED",
  "EXPIRED",
]);

export const createPaymentSchema = z
  .object({
    amount: z.number().min(1, "Amount must be at least R$ 1.00"),
  })
  .strict();
