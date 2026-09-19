import crypto from "node:crypto";

import { generateQRCode } from "./qr-code.service";

import { createPaymentProvider } from "../providers/payment-provider.factory";
import * as paymentRepository from "../repositories/payment.repository";

import type { PaymentStatus, CreatePayment } from "../types/payment.types";

const paymentProvider = createPaymentProvider();

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

  const providerPayment = await paymentProvider.createPayment({
    amount: data.amount,
  });

  const paymentData: CreatePayment = {
    id: paymentId,
    amount: data.amount,
    status: "PENDING",
    pixCode: providerPayment.pixCode,
    providerPaymentId: providerPayment.providerPaymentId,
  };

  await paymentRepository.createPayment(paymentData);

  const qrCode = await generateQRCode(providerPayment.pixCode);

  return {
    ...paymentData,
    qrCode,
  };
}
