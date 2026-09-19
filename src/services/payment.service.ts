import crypto from "node:crypto";

import { generatePixCode } from "./pix.service";
import { generateQRCode } from "./qr-code.service";
import * as paymentRepository from "../repositories/payment.repository";
import type { PaymentStatus, CreatePayment } from "../types/payment.types";

interface CreatePixPaymentData {
  amount: number;
}

const allowedTransition: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["PAID", "EXPIRED", "CANCELLED"],
  PAID: ["PAID"],
  EXPIRED: [],
  CANCELLED: [],
};

export function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus,
): boolean {
  return allowedTransition[currentStatus].includes(newStatus);
}

export async function createPixPayment(data: CreatePixPaymentData) {
  const paymentId = crypto.randomUUID();

  const pixCode = generatePixCode({
    amount: data.amount,
  });

  const paymentData: CreatePayment = {
    id: paymentId,
    amount: data.amount,
    status: "PENDING",
    pixCode,
  };

  await paymentRepository.createPayment(paymentData);

  const qrCode = await generateQRCode(pixCode);

  return { ...paymentData, qrCode };
}
