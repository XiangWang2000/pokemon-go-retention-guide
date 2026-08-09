import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    ".tmp/**",
    "dist/**",
    ".wrangler/**",
    "site-data/**",
    "generated/**",
    "coverage/**",
    "prisma/migrations/**",
    ".vinext/**",
    ".sites/**/dist/**",
  ]),
]);
