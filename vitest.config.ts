import { defineConfig } from "vitest/config";

process.env.PAYMENT_PROVIDER = "fake";

export default defineConfig({
  test: {
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
    },
  },
});
