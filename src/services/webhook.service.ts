import { z } from "zod";

import { paymentWebhookSchema } from "../schemas/webhook.schema";
import * as paymentRepository from "../repositories/payment.repository";
import { canTransitionPaymentStatus } from "./payment.service";

type PaymentWebhookData = z.infer<typeof paymentWebhookSchema>;

export async function processPaymentWebhook(data: PaymentWebhookData) {
  const payment = await paymentRepository.findPaymentByProviderId(
    data.providerPaymentId,
  );

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (!canTransitionPaymentStatus(payment.status, data.status)) {
    throw new Error("Invalid payment status transition");
  }

  await paymentRepository.updatePaymentStatus(payment.id, data.status);
}
