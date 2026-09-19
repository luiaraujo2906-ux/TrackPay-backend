import { beforeEach, describe, expect, test } from "vitest";

import { generatePixCode } from "./pix.service";

describe("generatePixCode", () => {
  beforeEach(() => {
    process.env.PIX_KEY = "teste@example.com";
    process.env.PIX_NAME = "JOAO DA SILVA";
    process.env.PIX_CITY = "IMPERATRIZ";
  });

  test("should generate a Pix code", () => {
    const result = generatePixCode({
      amount: 10,
    });

    expect(result).toBeDefined();
    expect(result).not.toBe("");
  });

  test("should throw an error when PIX_KEY is missing", () => {
    delete process.env.PIX_KEY;

    expect(() =>
      generatePixCode({
        amount: 10,
      }),
    ).toThrow("PIX_KEY is not configured");
  });

  test("should throw an error when PIX_NAME is missing", () => {
    delete process.env.PIX_NAME;

    expect(() =>
      generatePixCode({
        amount: 10,
      }),
    ).toThrow("PIX_NAME is not configured");
  });

  test("should throw an error when PIX_CITY is missing", () => {
    delete process.env.PIX_CITY;

    expect(() =>
      generatePixCode({
        amount: 10,
      }),
    ).toThrow("PIX_CITY is not configured");
  });
});
