export interface PaymentProvider {
  createPayment(data: { amount: number }): Promise<{
    providerPaymentId: string;
    pixCode: string;
  }>;
}
