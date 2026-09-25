import { asaasWebhookSchema } from "../schemas/webhook.schema";

import type { PaymentWebhookData } from "../types/payment.types";
import type { WebhookProvider } from "./webhook.provider";

export class AsaasWebhookProvider implements WebhookProvider {
  parseWebhook(data: unknown): PaymentWebhookData {
    const result = asaasWebhookSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid webhook payload");
    }

    if (
      result.data.event === "PAYMENT_RECEIVED" &&
      result.data.payment.status === "RECEIVED"
    ) {
      return {
        providerPaymentId: result.data.payment.id,
        status: "PAID",
      };
    }

    throw new Error("Unsupported webhook event");
  }
}
