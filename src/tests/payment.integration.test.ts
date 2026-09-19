import { describe, expect, test } from "vitest";
import { createPixPayment } from "../services/payment.service";
import { findPaymentById } from "../repositories/payment.repository";

describe("createPixPayment", () => {
  test("should create a pending Pix payment", async () => {
    const amount = 10;

    const result = await createPixPayment({
      amount,
    });

    expect(result.id).toBeDefined();
    expect(result.amount).toBe(amount);
    expect(result.status).toBe("PENDING");
    expect(result.pixCode).toBeDefined();
    expect(result.pixCode).not.toBe("");
    expect(result.qrCode).toBeDefined();
    expect(result.qrCode).not.toBe("");
  });

  test("should generate a unique payment id", async () => {
    const payment1 = await createPixPayment({
      amount: 10,
    });

    const payment2 = await createPixPayment({
      amount: 10,
    });

    expect(payment1.id).not.toBe(payment2.id);
  });

  test("should preserve the payment amount", async () => {
    const amount = 50.75;

    const result = await createPixPayment({
      amount,
    });

    expect(result.amount).toBe(amount);
  });
});

describe("createPixPayment integration", () => {
  test("should persist the payment in the database", async () => {
    const result = await createPixPayment({
      amount: 50.75,
    });

    const payment = await findPaymentById(result.id);

    expect(payment).not.toBeNull();
    expect(payment?.id).toBe(result.id);
    expect(Number(payment?.amount)).toBe(50.75);
    expect(payment?.status).toBe("PENDING");
    expect(payment?.pixCode).toBe(result.pixCode);
  });
});
