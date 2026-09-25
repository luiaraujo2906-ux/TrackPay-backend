import crypto from "node:crypto";

import { generateQRCode } from "./qr-code.service";

import { createPaymentProvider } from "../providers/payment.provider";
import * as paymentRepository from "../repositories/payment.repository";

import type {
  PaymentStatus,
  CreatePayment,
  CreatePaymentData,
} from "../types/payment.types";

const paymentProvider = createPaymentProvider();

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

export async function createPixPayment(data: CreatePaymentData) {
  const paymentId = crypto.randomUUID();

  /* PROVIDER GENERATES PAYMENT */
  const providerPayment = await paymentProvider.createPayment({
    amount: data.amount,
    payer: data.payer,
  });
  /* ********** END *********** */

  /* PERSIST ON DB AS PENDING*/
  const paymentData: CreatePayment = {
    id: paymentId,
    amount: data.amount,
    status: "PENDING",
    pixCode: providerPayment.pixCode,
    providerPaymentId: providerPayment.providerPaymentId,
  };

  await paymentRepository.createPayment(paymentData);
  /* ********** END *********** */

  /* RETURN QR CODE & GENERATED PAYMENT DATA */
  const qrCode = await generateQRCode(providerPayment.pixCode);

  return {
    ...paymentData,
    qrCode,
  };
  /* ********** END *********** */
}
