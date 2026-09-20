import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(),
  Payment: vi.fn().mockImplementation(function () {
    return {
      create: createMock,
    };
  }),
}));

import { MercadoPagoPaymentProvider } from "./mercado-pago.provider";

describe("MercadoPagoPaymentProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-access-token";
  });

  it("should create a Pix payment", async () => {
    createMock.mockResolvedValue({
      id: 123456,
      point_of_interaction: {
        transaction_data: {
          qr_code: "pix-code-123",
        },
      },
    });

    const provider = new MercadoPagoPaymentProvider();

    const result = await provider.createPayment({
      amount: 50,
      payer: {
        email: "test@example.com",
        identification: {
          type: "CPF",
          number: "12345678900",
        },
      },
    });

    expect(result).toEqual({
      providerPaymentId: "123456",
      pixCode: "pix-code-123",
    });
  });

  it("should send the correct payment data to Mercado Pago", async () => {
    createMock.mockResolvedValue({
      id: 123456,
      point_of_interaction: {
        transaction_data: {
          qr_code: "pix-code-123",
        },
      },
    });

    const provider = new MercadoPagoPaymentProvider();

    await provider.createPayment({
      amount: 50,
      payer: {
        email: "test@example.com",
        identification: {
          type: "CPF",
          number: "12345678900",
        },
      },
    });

    expect(createMock).toHaveBeenCalledTimes(1);

    const request = createMock.mock.calls[0]?.[0];

    expect(request).toBeDefined();
    expect(request!.body).toEqual({
      transaction_amount: 50,
      description: "TrackPay payment",
      payment_method_id: "pix",
      payer: {
        email: "test@example.com",
        identification: {
          type: "CPF",
          number: "12345678900",
        },
      },
    });
  });

  it("should send an idempotency key", async () => {
    createMock.mockResolvedValue({
      id: 123456,
      point_of_interaction: {
        transaction_data: {
          qr_code: "pix-code-123",
        },
      },
    });

    const provider = new MercadoPagoPaymentProvider();

    await provider.createPayment({
      amount: 50,
      payer: {
        email: "test@example.com",
        identification: {
          type: "CPF",
          number: "12345678900",
        },
      },
    });

    const request = createMock.mock.calls[0]?.[0];

    expect(request).toBeDefined();
    expect(request?.requestOptions?.idempotencyKey).toBeDefined();
    expect(request?.requestOptions?.idempotencyKey).not.toBe("");
  });
});
