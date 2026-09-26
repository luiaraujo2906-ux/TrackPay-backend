import { CreatePaymentData } from "../types/payment.types";
import type { PaymentProvider } from "./payment.provider";

export class AsaasPaymentProvider implements PaymentProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly pixKey: string;

  constructor() {
    const apiUrl = process.env.ASAAS_API_URL;
    const apiKey = process.env.ASAAS_API_KEY;
    const pixKey = process.env.PIX_KEY;

    if (!apiUrl) {
      throw new Error("ASAAS_API_URL is not defined");
    }

    if (!apiKey) {
      throw new Error("ASAAS_API_KEY is not defined");
    }

    if (!pixKey) {
      throw new Error("PIX_KEY is not defined");
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.pixKey = pixKey;
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

  async createPayment(data: CreatePaymentData) {
    const qrCode = await this.request<{
      id: string;
      payload: string;
    }>("/pix/qrCodes/static", {
      method: "POST",
      body: JSON.stringify({
        addressKey: this.pixKey,
        value: data.amount,
        format: "PAYLOAD",
        allowsMultiplePayments: false,
      }),
    });

    return {
      providerQrCodeId: qrCode.id,
      pixCode: qrCode.payload,
    };
  }
}
