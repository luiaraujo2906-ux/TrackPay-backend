import { z } from "zod";
import { paymentStatusSchema } from "../schemas/payment.schema";

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export interface CreatePayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  pixCode: string;
  providerPaymentId: string;
}

export interface Payment extends CreatePayment {
  createdAt: Date;
  updatedAt: Date;
}
