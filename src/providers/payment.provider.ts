import { CreatePixPaymentData } from "../types/payment.types";
import { FakePaymentProvider } from "./fake-payment.provider";
import { MercadoPagoPaymentProvider } from "./mercado-pago.provider";

export interface PaymentProvider {
  createPayment(data: CreatePixPaymentData): Promise<{
    providerPaymentId: string;
    pixCode: string;
  }>;
}

export function createPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "mercadopago":
      return new MercadoPagoPaymentProvider();

    case "fake":
      return new FakePaymentProvider();

    default:
      throw new Error("Invalid payment provider");
  }
}
