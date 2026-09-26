import crypto from "node:crypto";
import { test, describe, expect } from "vitest";
import {
  createPayment,
  findPaymentByProviderQrCodeId,
} from "./payment.repository";

describe("createPayment", () => {
  test("should find a payment by provider QR code id", async () => {
    const paymentId = crypto.randomUUID();
    const providerQrCodeId = crypto.randomUUID();

    await createPayment({
      id: paymentId,
      amount: 50,
      status: "PENDING",
      pixCode: "pix-code",
      providerQrCodeId,
    });

    const payment = await findPaymentByProviderQrCodeId(providerQrCodeId);

    expect(payment).not.toBeNull();
    expect(payment?.id).toBe(paymentId);
    expect(payment?.providerQrCodeId).toBe(providerQrCodeId);
  });

  test("should return null when provider QR code id does not exist", async () => {
    const payment = await findPaymentByProviderQrCodeId("does-not-exist");

    expect(payment).toBeNull();
  });
});
