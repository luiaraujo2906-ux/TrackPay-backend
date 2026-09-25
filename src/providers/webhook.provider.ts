import type { PaymentWebhookData } from "../types/payment.types";
import { AsaasWebhookProvider } from "./asaas-webhook.provider";
import { FakeWebhookProvider } from "./fake-webhook.provider";

export interface WebhookProvider {
  parseWebhook(data: unknown): PaymentWebhookData;
}

export function createWebhookProvider(): WebhookProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "asaas":
      return new AsaasWebhookProvider();

    case "fake":
      return new FakeWebhookProvider();

    default:
      throw new Error("Invalid payment provider");
  }
}
