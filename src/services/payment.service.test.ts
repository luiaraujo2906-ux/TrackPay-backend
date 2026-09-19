import { describe, expect, test } from "vitest";

import { canTransitionPaymentStatus } from "./payment.service";

describe("canTransitionPaymentStatus", () => {
  /* ALLOWED TRANSITIONS */
  test("should allow PENDING -> PAID", () => {
    expect(canTransitionPaymentStatus("PENDING", "PAID")).toBe(true);
  });

  test("should allow PENDING -> EXPIRED", () => {
    expect(canTransitionPaymentStatus("PENDING", "EXPIRED")).toBe(true);
  });

  test("should allow PENDING -> CANCELLED", () => {
    expect(canTransitionPaymentStatus("PENDING", "CANCELLED")).toBe(true);
  });

  test("should allow PAID -> PAID", () => {
    expect(canTransitionPaymentStatus("PAID", "PAID")).toBe(true);
  });

  /* REJECTED TRANSITIONS */
  test("should reject PAID -> CANCELLED", () => {
    expect(canTransitionPaymentStatus("PAID", "CANCELLED")).toBe(false);
  });

  test("should reject PAID -> EXPIRED", () => {
    expect(canTransitionPaymentStatus("PAID", "EXPIRED")).toBe(false);
  });

  test("should reject CANCELLED -> PAID", () => {
    expect(canTransitionPaymentStatus("CANCELLED", "PAID")).toBe(false);
  });

  test("should reject EXPIRED -> PAID", () => {
    expect(canTransitionPaymentStatus("EXPIRED", "PAID")).toBe(false);
  });
});
