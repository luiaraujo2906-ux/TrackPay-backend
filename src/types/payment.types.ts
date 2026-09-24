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

export interface CreatePixPaymentData {
  amount: number;
  payer: {
    name: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

export interface PaymentWebhookData {
  providerPaymentId: string;
  status: PaymentStatus;
}
