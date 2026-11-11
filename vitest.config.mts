import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for pure library code. The browser audits are separate
// (scripts/audit, `npm run audit`).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
