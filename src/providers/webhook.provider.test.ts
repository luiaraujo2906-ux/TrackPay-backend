import { describe, expect, it, vi } from "vitest";

import { AsaasWebhookProvider } from "./asaas-webhook.provider";
import { FakeWebhookProvider } from "./fake-webhook.provider";
import { createWebhookProvider } from "./webhook.provider";

describe("createWebhookProvider", () => {
  it("should create an AsaasWebhookProvider", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "asaas");

    const provider = createWebhookProvider();

    expect(provider).toBeInstanceOf(AsaasWebhookProvider);
  });

  it("should create a FakeWebhookProvider", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "fake");

    const provider = createWebhookProvider();

    expect(provider).toBeInstanceOf(FakeWebhookProvider);
  });

  it("should throw when payment provider is invalid", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "invalid");

    expect(() => createWebhookProvider()).toThrow("Invalid payment provider");
  });
});
