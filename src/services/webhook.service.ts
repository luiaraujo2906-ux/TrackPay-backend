import * as paymentRepository from "../repositories/payment.repository";
import { canTransitionPaymentStatus } from "./payment.service";

import type { PaymentWebhookData } from "../types/payment.types";

export async function processPaymentWebhook(data: PaymentWebhookData) {
  const payment = await paymentRepository.findPaymentByProviderQrCodeId(
    data.providerQrCodeId,
  );

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (!canTransitionPaymentStatus(payment.status, data.status)) {
    throw new Error("Invalid payment status transition");
  }

  await paymentRepository.updatePaymentStatus(payment.id, data.status);
}
