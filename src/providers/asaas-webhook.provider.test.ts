import { describe, expect, it } from "vitest";

import { AsaasWebhookProvider } from "./asaas-webhook.provider";

describe("AsaasWebhookProvider", () => {
  const provider = new AsaasWebhookProvider();

  it("should convert PAYMENT_RECEIVED into PAID", () => {
    const result = provider.parseWebhook({
      id: "evt_123",
      event: "PAYMENT_RECEIVED",
      payment: {
        id: "pay_123",
        status: "RECEIVED",
      },
    });

    expect(result).toEqual({
      providerPaymentId: "pay_123",
      status: "PAID",
    });
  });

  it("should reject an invalid webhook payload", () => {
    expect(() =>
      provider.parseWebhook({
        id: "",
        event: "PAYMENT_RECEIVED",
        payment: {
          id: "pay_123",
          status: "RECEIVED",
        },
      }),
    ).toThrow("Invalid webhook payload");
  });

  it("should reject an unsupported webhook event", () => {
    expect(() =>
      provider.parseWebhook({
        id: "evt_123",
        event: "PAYMENT_CREATED",
        payment: {
          id: "pay_123",
          status: "PENDING",
        },
      }),
    ).toThrow("Unsupported webhook event");
  });
});
