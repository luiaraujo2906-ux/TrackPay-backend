import { z } from "zod";

export const paymentStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "CANCELLED",
  "EXPIRED",
]);

export const createPaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be at least R$ 1.00"),

  payer: z.object({
    name: z.string().min(1),
    email: z.email(),
    document: z.string().min(1),
  }),
});
