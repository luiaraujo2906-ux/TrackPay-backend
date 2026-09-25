import type { PaymentWebhookData } from "../types/payment.types";
import type { WebhookProvider } from "./webhook.provider";
import { fakeWebhookSchema } from "../schemas/webhook.schema";

export class FakeWebhookProvider implements WebhookProvider {
  parseWebhook(data: unknown): PaymentWebhookData {
    const result = fakeWebhookSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid webhook payload");
    }

    return result.data;
  }
}
