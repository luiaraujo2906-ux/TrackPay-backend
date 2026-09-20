import { describe, expect, test } from "vitest";
import { createPixPayment } from "../services/payment.service";
import { findPaymentById } from "../repositories/payment.repository";

const fakePayload = {
  amount: 50,
  payer: {
    email: "test@example.com",
    identification: {
      type: "CPF",
      number: "12345678900",
    },
  },
};

describe("createPixPayment", () => {
  test("should create a pending Pix payment", async () => {
    const result = await createPixPayment(fakePayload);

    expect(result.id).toBeDefined();
    expect(result.amount).toBe(fakePayload.amount);
    expect(result.status).toBe("PENDING");
    expect(result.pixCode).toBeDefined();
    expect(result.pixCode).not.toBe("");
    expect(result.qrCode).toBeDefined();
    expect(result.qrCode).not.toBe("");
  });

  test("should generate a unique payment id", async () => {
    const payment1 = await createPixPayment(fakePayload);

    const payment2 = await createPixPayment(fakePayload);

    expect(payment1.id).not.toBe(payment2.id);
  });

  test("should preserve the payment amount", async () => {
    const result = await createPixPayment(fakePayload);

    expect(result.amount).toBe(fakePayload.amount);
  });
});

describe("createPixPayment integration", () => {
  test("should persist the payment in the database", async () => {
    const result = await createPixPayment(fakePayload);

    const payment = await findPaymentById(result.id);

    expect(payment).not.toBeNull();
    expect(payment?.id).toBe(result.id);
    expect(Number(payment?.amount)).toBe(fakePayload.amount);
    expect(payment?.status).toBe("PENDING");
    expect(payment?.pixCode).toBe(result.pixCode);
  });
});
