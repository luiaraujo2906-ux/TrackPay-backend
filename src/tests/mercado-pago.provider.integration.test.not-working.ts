import { describe, expect, test } from "vitest";

import { MercadoPagoPaymentProvider } from "../providers/mercado-pago.provider";

describe("MercadoPagoPaymentProvider integration", () => {
  test("should create a Pix payment", async () => {
    const provider = new MercadoPagoPaymentProvider();

    const result = await provider.createPayment({
      amount: 50,
    });

    console.log(result);

    expect(result.providerQrCodeId).toBeDefined();
    expect(result.providerQrCodeId).not.toBe("");

    expect(result.pixCode).toBeDefined();
    expect(result.pixCode).not.toBe("");
  });
});
