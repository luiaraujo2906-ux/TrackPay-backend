import { describe, expect, it } from "vitest";

import { createPaymentSchema } from "./payment.schema";

const validPayload = {
  amount: 50,
  payer: {
    name: "Cliente Teste",
    email: "test@example.com",
    identification: {
      type: "CPF",
      number: "52998224725",
    },
  },
};

describe("createPaymentSchema", () => {
  it("should accept a valid payment", () => {
    const result = createPaymentSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it("should reject amount below R$ 1.00", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      amount: 0.99,
    });

    expect(result.success).toBe(false);
  });

  it("should accept amount equal to R$ 1.00", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      amount: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should accept amount above R$ 1.00", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      amount: 1.01,
    });

    expect(result.success).toBe(true);
  });

  it("should reject a negative amount", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      amount: -10,
    });

    expect(result.success).toBe(false);
  });

  it("should reject an invalid email", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      payer: {
        ...validPayload.payer,
        email: "invalid-email",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty payer name", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      payer: {
        ...validPayload.payer,
        name: "",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty identification type", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      payer: {
        ...validPayload.payer,
        identification: {
          ...validPayload.payer.identification,
          type: "",
        },
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty identification number", () => {
    const result = createPaymentSchema.safeParse({
      ...validPayload,
      payer: {
        ...validPayload.payer,
        identification: {
          ...validPayload.payer.identification,
          number: "",
        },
      },
    });

    expect(result.success).toBe(false);
  });
});
