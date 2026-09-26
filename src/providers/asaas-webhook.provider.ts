import { asaasWebhookSchema } from "../schemas/webhook.schema";

import type { PaymentWebhookData } from "../types/payment.types";
import type { WebhookProvider } from "./webhook.provider";

export class AsaasWebhookProvider implements WebhookProvider {
  parseWebhook(data: unknown): PaymentWebhookData {
    const result = asaasWebhookSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid webhook payload");
    }

    const payment = result.data.payment;
    const providerQrCodeId =
      payment.qrCodeId ?? payment.pixQrCode?.id ?? payment.id;

    if (
      result.data.event === "PAYMENT_RECEIVED" &&
      payment.status === "RECEIVED" &&
      providerQrCodeId
    ) {
      return {
        providerQrCodeId,
        status: "PAID",
      };
    }

    throw new Error("Unsupported webhook event");
  }
}
