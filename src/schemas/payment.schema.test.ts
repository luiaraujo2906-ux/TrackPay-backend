import { describe, expect, it } from "vitest";

import { createPaymentSchema } from "./payment.schema";

const validPayload = {
  amount: 50,
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

  it("should reject unexpected payload fields", () => {
    const result = createPaymentSchema.safeParse({
      amount: 50,
      payer: {
        name: "Cliente Teste",
      },
    });

    expect(result.success).toBe(false);
  });
});
