import { MercadoPagoConfig, Payment } from "mercadopago";

import type { PaymentProvider } from "./payment.provider";

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

  async createPayment(data: { amount: number }) {
    throw new Error("Not implemented");
  }
}
