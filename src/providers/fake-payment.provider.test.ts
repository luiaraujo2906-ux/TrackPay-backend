import { describe, expect, it } from "vitest";

import { FakePaymentProvider } from "./fake-payment.provider";

describe("FakePaymentProvider", () => {
  it("should create a provider payment", async () => {
    const provider = new FakePaymentProvider();

    const result = await provider.createPayment({
      amount: 50,
    });

    expect(result.providerPaymentId).toBeDefined();
    expect(result.providerPaymentId).not.toBe("");

    expect(result.pixCode).toBeDefined();
    expect(result.pixCode).not.toBe("");
  });

  it("should generate a unique provider payment id", async () => {
    const provider = new FakePaymentProvider();

    const payment1 = await provider.createPayment({
      amount: 50,
    });

    const payment2 = await provider.createPayment({
      amount: 50,
    });

    expect(payment1.providerPaymentId).not.toBe(payment2.providerPaymentId);
  });
});
