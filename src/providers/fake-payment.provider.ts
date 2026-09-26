import crypto from "node:crypto";

import type { PaymentProvider } from "./payment.provider";
import { generatePixCode } from "../services/pix.service";
import type { CreatePaymentData } from "../types/payment.types";

export class FakePaymentProvider implements PaymentProvider {
  async createPayment(data: CreatePaymentData) {
    const providerQrCodeId = crypto.randomUUID();

    const pixCode = generatePixCode({
      amount: data.amount,
    });

    return {
      providerQrCodeId,
      pixCode,
    };
  }
}
