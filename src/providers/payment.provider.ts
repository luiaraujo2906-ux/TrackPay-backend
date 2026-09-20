import { FakePaymentProvider } from "./fake-payment.provider";

export interface PaymentProvider {
  createPayment(data: {
    amount: number;
    payer: {
      email: string;
      identification: {
        type: string;
        number: string;
      };
    };
  }): Promise<{
    providerPaymentId: string;
    pixCode: string;
  }>;
}

export function createPaymentProvider(): PaymentProvider {
  return new FakePaymentProvider();
}
