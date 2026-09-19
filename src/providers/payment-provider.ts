import { FakePaymentProvider } from "./fake-payment.provider";

export interface PaymentProvider {
  createPayment(data: { amount: number }): Promise<{
    providerPaymentId: string;
    pixCode: string;
  }>;
}

export function createPaymentProvider() {
  return new FakePaymentProvider();
}
