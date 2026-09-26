import { beforeEach, describe, expect, it, vi } from "vitest";

import { AsaasPaymentProvider } from "./asaas-payment.provider";

const fakePayload = {
  amount: 50,
};

describe("AsaasPaymentProvider", () => {
  beforeEach(() => {
    vi.stubEnv("ASAAS_API_URL", "https://api-sandbox.asaas.com/v3");
    vi.stubEnv("ASAAS_API_KEY", "test-api-key");
    vi.stubEnv("PIX_KEY", "62263520350");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("should create a static Pix QR Code", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "qr_123",
          payload: "000201010212268...",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const provider = new AsaasPaymentProvider();

    const result = await provider.createPayment(fakePayload);

    expect(result).toEqual({
      providerQrCodeId: "qr_123",
      pixCode: "000201010212268...",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-sandbox.asaas.com/v3/pix/qrCodes/static",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          addressKey: "62263520350",
          value: 50,
          format: "PAYLOAD",
          allowsMultiplePayments: false,
        }),
      }),
    );
  });

  it("should send the Asaas authentication headers", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "qr_123",
          payload: "pix-code",
        }),
        { status: 200 },
      ),
    );

    const provider = new AsaasPaymentProvider();

    await provider.createPayment(fakePayload);

    const request = fetchMock.mock.calls[0]?.[1];

    expect(request).toBeDefined();
    expect(request?.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "User-Agent": "TrackPay/1.0 (Node.js; sandbox)",
        access_token: "test-api-key",
      }),
    );
  });

  it("should throw an error when QR Code creation fails", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          errors: [{ description: "Invalid QR Code" }],
        }),
        { status: 400 },
      ),
    );

    const provider = new AsaasPaymentProvider();

    await expect(provider.createPayment(fakePayload)).rejects.toThrow(
      "Asaas API error: 400",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when PIX_KEY is not defined", () => {
    vi.stubEnv("PIX_KEY", "");

    expect(() => new AsaasPaymentProvider()).toThrow("PIX_KEY is not defined");
  });

  it("should throw an error when ASAAS_API_KEY is not defined", () => {
    vi.stubEnv("ASAAS_API_KEY", "");

    expect(() => new AsaasPaymentProvider()).toThrow(
      "ASAAS_API_KEY is not defined",
    );
  });

  it("should throw an error when ASAAS_API_URL is not defined", () => {
    vi.stubEnv("ASAAS_API_URL", "");

    expect(() => new AsaasPaymentProvider()).toThrow(
      "ASAAS_API_URL is not defined",
    );
  });
});
