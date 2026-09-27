import crypto from "node:crypto";
import { test, describe, expect } from "vitest";
import {
  createPayment,
  findPaymentByProviderReference,
} from "./payment.repository";

describe("createPayment", () => {
  test("should find a payment by provider Reference", async () => {
    const paymentId = crypto.randomUUID();
    const providerReference = "test_" + crypto.randomUUID();

    await createPayment({
      id: paymentId,
      providerReference,
      amount: 50,
      status: "PENDING",
      pixCode: "pix-code",
    });

    const payment = await findPaymentByProviderReference(providerReference);

    expect(payment).not.toBeNull();
    expect(payment?.id).toBe(paymentId);
    expect(payment?.providerReference).toBe(providerReference);
  });

  test("should return null when provider QR code id does not exist", async () => {
    const payment = await findPaymentByProviderReference("does-not-exist");

    expect(payment).toBeNull();
  });
});
