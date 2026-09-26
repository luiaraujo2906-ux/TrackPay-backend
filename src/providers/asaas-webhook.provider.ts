import { asaasWebhookSchema } from "../schemas/webhook.schema";

import type { PaymentWebhookData } from "../types/payment.types";
import type { WebhookProvider } from "./webhook.provider";

export class AsaasWebhookProvider implements WebhookProvider {
  parseWebhook(data: unknown): PaymentWebhookData {
    const result = asaasWebhookSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid webhook payload");
    }

    const { event, payment } = result.data;

    if (
      event !== "PAYMENT_RECEIVED" ||
      payment.status !== "RECEIVED" ||
      !payment.pixQrCodeId
    ) {
      throw new Error("Unsupported webhook event");
    }

    return {
      providerQrCodeId: payment.pixQrCodeId,
      status: "PAID",
    };
  }
}
