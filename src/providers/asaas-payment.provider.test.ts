import { beforeEach, describe, expect, it, vi } from "vitest";

import { AsaasPaymentProvider } from "./asaas-payment.provider";

const fakePayload = {
  amount: 50,
  payer: {
    name: "Cliente Teste",
    email: "test@example.com",
    document: "12345678900",
  },
};

describe("AsaasPaymentProvider", () => {
  beforeEach(() => {
    vi.stubEnv("ASAAS_API_URL", "https://api-sandbox.asaas.com/v3");
    vi.stubEnv("ASAAS_API_KEY", "test-api-key");

    vi.stubGlobal("fetch", vi.fn());
  });

  it("should create a Pix payment", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "pay_123",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
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
      providerPaymentId: "pay_123",
      pixCode: "000201010212268...",
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("should create the customer with the payer data", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "pay_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            payload: "pix-code",
          }),
          { status: 200 },
        ),
      );

    const provider = new AsaasPaymentProvider();

    await provider.createPayment(fakePayload);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api-sandbox.asaas.com/v3/customers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Cliente Teste",
          cpfCnpj: "12345678900",
          email: "test@example.com",
        }),
      }),
    );
  });

  it("should create a Pix payment using the customer id", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "pay_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            payload: "pix-code",
          }),
          { status: 200 },
        ),
      );

    const provider = new AsaasPaymentProvider();

    await provider.createPayment(fakePayload);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api-sandbox.asaas.com/v3/payments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringMatching(/"customer":"cus_123"/),
      }),
    );

    const secondRequest = fetchMock.mock.calls[1]?.[1];
    const paymentBody = JSON.parse(secondRequest?.body as string);

    expect(secondRequest).toBeDefined();

    expect(paymentBody).toEqual({
      customer: "cus_123",
      billingType: "PIX",
      value: 50,
      dueDate: expect.any(String),
      description: "TrackPay payment",
    });
  });

  it("should get the Pix QR Code using the payment id", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "pay_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            payload: "pix-code-123",
          }),
          { status: 200 },
        ),
      );

    const provider = new AsaasPaymentProvider();

    await provider.createPayment(fakePayload);

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://api-sandbox.asaas.com/v3/payments/pay_123/pixQrCode",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "User-Agent": "TrackPay/1.0 (Node.js; sandbox)",
          access_token: "test-api-key",
        }),
      }),
    );
  });

  it("should send the Asaas authentication headers", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "pay_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            payload: "pix-code",
          }),
          { status: 200 },
        ),
      );

    const provider = new AsaasPaymentProvider();

    await provider.createPayment(fakePayload);

    const firstRequest = fetchMock.mock.calls[0]?.[1];

    expect(firstRequest).toBeDefined();
    expect(firstRequest?.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "User-Agent": "TrackPay/1.0 (Node.js; sandbox)",
        access_token: "test-api-key",
      }),
    );
  });

  it("should throw an error when customer creation fails", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          errors: [
            {
              description: "Invalid customer",
            },
          ],
        }),
        {
          status: 400,
        },
      ),
    );

    const provider = new AsaasPaymentProvider();

    await expect(provider.createPayment(fakePayload)).rejects.toThrow(
      "Asaas API error: 400",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when payment creation fails", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errors: [
              {
                description: "Invalid payment",
              },
            ],
          }),
          {
            status: 400,
          },
        ),
      );

    const provider = new AsaasPaymentProvider();

    await expect(provider.createPayment(fakePayload)).rejects.toThrow(
      "Asaas API error: 400",
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("should throw an error when Pix QR Code retrieval fails", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "cus_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "pay_123",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errors: [
              {
                description: "Pix QR Code unavailable",
              },
            ],
          }),
          {
            status: 500,
          },
        ),
      );

    const provider = new AsaasPaymentProvider();

    await expect(provider.createPayment(fakePayload)).rejects.toThrow(
      "Asaas API error: 500",
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
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
