import crypto from "node:crypto";

import type { PaymentProvider } from "./payment.provider";
import { generatePixCode } from "../services/pix.service";
import { CreatePixPaymentData } from "../types/payment.types";

export class FakePaymentProvider implements PaymentProvider {
  async createPayment(data: CreatePixPaymentData) {
    const providerPaymentId = crypto.randomUUID();

    const pixCode = generatePixCode({
      amount: data.amount,
    });

    return {
      providerPaymentId,
      pixCode,
    };
  }
}
