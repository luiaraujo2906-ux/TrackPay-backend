import { describe, expect, it } from "vitest";

import { FakeWebhookProvider } from "./fake-webhook.provider";

describe("FakeWebhookProvider", () => {
  const provider = new FakeWebhookProvider();

  it("should convert a valid webhook payload", () => {
    const result = provider.parseWebhook({
      providerQrCodeId: "qr_123",
      status: "PAID",
    });

    expect(result).toEqual({
      providerQrCodeId: "qr_123",
      status: "PAID",
    });
  });

  it("should reject an invalid webhook payload", () => {
    expect(() =>
      provider.parseWebhook({
        providerQrCodeId: "",
        status: "INVALID_STATUS",
      }),
    ).toThrow("Invalid webhook payload");
  });
});
