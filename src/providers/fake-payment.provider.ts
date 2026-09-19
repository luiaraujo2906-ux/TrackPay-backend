import crypto from "node:crypto";

import type { PaymentProvider } from "./payment-provider";
import { generatePixCode } from "../services/pix.service";

export class FakePaymentProvider implements PaymentProvider {
  async createPayment(data: { amount: number }) {
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