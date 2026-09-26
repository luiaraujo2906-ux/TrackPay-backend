import { describe, expect, it } from "vitest";

import { AsaasPaymentProvider } from "../providers/asaas-payment.provider";

const shouldRunAsaasTests = process.env.RUN_ASAAS_TESTS === "true";

describe.skipIf(!shouldRunAsaasTests)(
  "AsaasPaymentProvider - integration",
  () => {
    it("should create a real Pix payment in Asaas Sandbox", async () => {
      const provider = new AsaasPaymentProvider();

      const result = await provider.createPayment({
        amount: 50,
      });

      expect(result.providerQrCodeId).toBeDefined();
      expect(result.pixCode).toBeDefined();
    });
  },
);
