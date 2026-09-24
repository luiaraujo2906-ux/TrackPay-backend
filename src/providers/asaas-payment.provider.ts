import type { PaymentProvider } from "./payment.provider";

export class AsaasPaymentProvider implements PaymentProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    const apiUrl = process.env.ASAAS_API_URL;
    const apiKey = process.env.ASAAS_API_KEY;

    if (!apiUrl) {
      throw new Error("ASAAS_API_URL is not defined");
    }

    if (!apiKey) {
      throw new Error("ASAAS_API_KEY is not defined");
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TrackPay/1.0 (Node.js; sandbox)",
        access_token: this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();

      throw new Error(`Asaas API error: ${response.status} ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async createPayment(data: {
    amount: number;
    payer: {
      name: string;
      email: string;
      identification: {
        type: string;
        number: string;
      };
    };
  }) {
    const customer = await this.request<{
      id: string;
    }>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: data.payer.name,
        cpfCnpj: data.payer.identification.number,
        email: data.payer.email,
      }),
    });

    const payment = await this.request<{
      id: string;
    }>("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: customer.id,
        billingType: "PIX",
        value: data.amount,
        dueDate: new Date().toISOString().split("T")[0],
        description: "TrackPay payment",
      }),
    });

    const pixQrCode = await this.request<{
      payload: string;
    }>(`/payments/${payment.id}/pixQrCode`);

    return {
      providerPaymentId: payment.id,
      pixCode: pixQrCode.payload,
    };
  }
}
