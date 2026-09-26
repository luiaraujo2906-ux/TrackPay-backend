import { describe, expect, it } from "vitest";

import { AsaasWebhookProvider } from "./asaas-webhook.provider";

describe("AsaasWebhookProvider", () => {
  const provider = new AsaasWebhookProvider();

  it("should convert PAYMENT_RECEIVED into PAID using the QR Code identifier", () => {
    const result = provider.parseWebhook({
      id: "evt_123",
      event: "PAYMENT_RECEIVED",
      payment: {
        id: "pay_123",
        qrCodeId: "qr_456",
        status: "RECEIVED",
      },
    });

    expect(result).toEqual({
      providerQrCodeId: "qr_456",
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
          qrCodeId: "qr_456",
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
          qrCodeId: "qr_456",
          status: "PENDING",
        },
      }),
    ).toThrow("Unsupported webhook event");
  });
});
