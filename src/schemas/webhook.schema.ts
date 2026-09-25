import { z } from "zod";

import { paymentStatusSchema } from "./payment.schema";

export const paymentWebhookSchema = z.object({
  providerPaymentId: z.string().min(1),
  status: paymentStatusSchema,
});

export const asaasWebhookSchema = z.object({
  id: z.string().min(1),
  event: z.string().min(1),
  payment: z.object({
    id: z.string().min(1),
    status: z.string().min(1),
  }),
});

export const fakeWebhookSchema = z.object({
  providerPaymentId: z.string().min(1),
  status: paymentStatusSchema,
});
