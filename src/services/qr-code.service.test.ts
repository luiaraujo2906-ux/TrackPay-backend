import { describe, expect, test } from "vitest";

import { generateQRCode } from "./qr-code.service";

describe("generateQRCode", () => {
  test("should generate a QR Code Data URL", async () => {
    const pixCode = "000201010212";

    const result = await generateQRCode(pixCode);

    expect(result).toBeDefined();
    expect(result).toMatch(/^data:image\/png;base64,/);
  });
});
