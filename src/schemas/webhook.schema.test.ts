import { describe, expect, it } from "vitest";

import { asaasWebhookSchema } from "./webhook.schema";

const validPayload = {
  id: "evt_123",
  event: "PAYMENT_RECEIVED",
  payment: {
    id: "pay_123",
    status: "RECEIVED",
  },
};

describe("asaasWebhookSchema", () => {
  it("should accept a valid Asaas webhook", () => {
    const result = asaasWebhookSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it("should reject a webhook without event id", () => {
    const result = asaasWebhookSchema.safeParse({
      ...validPayload,
      id: "",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a webhook without event", () => {
    const result = asaasWebhookSchema.safeParse({
      ...validPayload,
      event: "",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a webhook without payment id", () => {
    const result = asaasWebhookSchema.safeParse({
      ...validPayload,
      payment: {
        ...validPayload.payment,
        id: "",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject a webhook without payment status", () => {
    const result = asaasWebhookSchema.safeParse({
      ...validPayload,
      payment: {
        ...validPayload.payment,
        status: "",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject a webhook without payment", () => {
    const result = asaasWebhookSchema.safeParse({
      id: "evt_123",
      event: "PAYMENT_RECEIVED",
    });

    expect(result.success).toBe(false);
  });
});
