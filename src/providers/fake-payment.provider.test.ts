import { describe, expect, it } from "vitest";

import { FakeWebhookProvider } from "./fake-webhook.provider";

describe("FakeWebhookProvider", () => {
  const provider = new FakeWebhookProvider();

  it("should convert a valid webhook payload", () => {
    const result = provider.parseWebhook({
      providerPaymentId: "pay_123",
      status: "PAID",
    });

    expect(result).toEqual({
      providerPaymentId: "pay_123",
      status: "PAID",
    });
  });

  it("should reject an invalid webhook payload", () => {
    expect(() =>
      provider.parseWebhook({
        providerPaymentId: "",
        status: "INVALID_STATUS",
      }),
    ).toThrow("Invalid webhook payload");
  });
});
