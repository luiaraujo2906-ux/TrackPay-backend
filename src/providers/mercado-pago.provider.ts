import crypto from "node:crypto";

import { MercadoPagoConfig, Payment } from "mercadopago";

import type { PaymentProvider } from "./payment.provider";
import type { CreatePaymentData } from "../types/payment.types";

export class MercadoPagoPaymentProvider implements PaymentProvider {
  private readonly payment: Payment;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined");
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });

    this.payment = new Payment(client);
  }

  async createPayment(data: CreatePaymentData) {
    const response = await this.payment.create({
      body: {
        transaction_amount: data.amount,
        description: "TrackPay payment",
        payment_method_id: "pix",
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
      },
    });

    return {
      providerQrCodeId: String(response.id),
      pixCode: response.point_of_interaction?.transaction_data?.qr_code ?? "",
    };
  }
}
