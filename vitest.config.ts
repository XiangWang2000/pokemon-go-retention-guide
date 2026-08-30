import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: { DATABASE_URL: "file:./rebuild-ci.db" },
    include: ["src/**/*.test.ts", "tests/**/*.test.ts", "tests/**/*.test.mjs"],
  },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});
