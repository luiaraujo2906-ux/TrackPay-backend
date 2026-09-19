import crypto from "node:crypto";
import { test, describe, expect } from "vitest";
import { createPayment, findPaymentByProviderId } from "./payment.repository";

describe("createPayment", () => {
  test("should find a payment by provider payment id", async () => {
    const paymentId = crypto.randomUUID();
    const providerPaymentId = crypto.randomUUID();

    await createPayment({
      id: paymentId,
      amount: 50,
      status: "PENDING",
      pixCode: "pix-code",
      providerPaymentId,
    });

    const payment = await findPaymentByProviderId(providerPaymentId);

    expect(payment).not.toBeNull();
    expect(payment?.id).toBe(paymentId);
    expect(payment?.providerPaymentId).toBe(providerPaymentId);
  });

  test("should return null when provider payment id does not exist", async () => {
    const payment = await findPaymentByProviderId("does-not-exist");

    expect(payment).toBeNull();
  });
});
