import { describe, expect, it, vi } from "vitest";

import { canTransitionPaymentStatus } from "./payment.service";
import { createPixPayment } from "./payment.service";
import * as paymentRepository from "../repositories/payment.repository";

describe("canTransitionPaymentStatus", () => {
  /* ALLOWED TRANSITIONS */
  it("should allow PENDING -> PAID", () => {
    expect(canTransitionPaymentStatus("PENDING", "PAID")).toBe(true);
  });

  it("should allow PENDING -> EXPIRED", () => {
    expect(canTransitionPaymentStatus("PENDING", "EXPIRED")).toBe(true);
  });

  it("should allow PENDING -> CANCELLED", () => {
    expect(canTransitionPaymentStatus("PENDING", "CANCELLED")).toBe(true);
  });

  it("should allow PAID -> PAID", () => {
    expect(canTransitionPaymentStatus("PAID", "PAID")).toBe(true);
  });

  /* REJECTED TRANSITIONS */
  it("should reject PAID -> CANCELLED", () => {
    expect(canTransitionPaymentStatus("PAID", "CANCELLED")).toBe(false);
  });

  it("should reject PAID -> EXPIRED", () => {
    expect(canTransitionPaymentStatus("PAID", "EXPIRED")).toBe(false);
  });

  it("should reject CANCELLED -> PAID", () => {
    expect(canTransitionPaymentStatus("CANCELLED", "PAID")).toBe(false);
  });

  it("should reject EXPIRED -> PAID", () => {
    expect(canTransitionPaymentStatus("EXPIRED", "PAID")).toBe(false);
  });
});

describe("createPixPayment", () => {
  it("should create and persist a payment", async () => {
    vi.spyOn(paymentRepository, "createPayment").mockResolvedValue();

    const result = await createPixPayment({
      amount: 50,
    });

    expect(result.amount).toBe(50);
    expect(result.status).toBe("PENDING");
    expect(result.providerQrCodeId).toBeDefined();
    expect(result.pixCode).toBeDefined();
    expect(result.qrCode).toBeDefined();

    expect(paymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 50,
        status: "PENDING",
        providerQrCodeId: result.providerQrCodeId,
        pixCode: result.pixCode,
      }),
    );
  });
});
