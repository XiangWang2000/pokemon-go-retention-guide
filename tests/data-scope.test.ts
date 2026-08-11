import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CURRENT_DATA_MAX_DEX, CURRENT_DATA_SCOPE } from "@/config/data-scope";

describe("published data scope", () => {
  it("derives the scope from the current maximum Pokédex number", () => {
    expect(CURRENT_DATA_SCOPE).toBe(`001-${String(CURRENT_DATA_MAX_DEX).padStart(3, "0")}`);
  });

  it("keeps the committed snapshot and workbook aligned with the derived scope", () => {
    const manifest = JSON.parse(readFileSync("site-data/manifest.json", "utf8")) as {
      batch: string;
      excel: { path: string };
    };

    expect(manifest.batch).toBe(CURRENT_DATA_SCOPE);
    expect(manifest.excel.path).toContain(`pokemon-go-retention-${CURRENT_DATA_SCOPE}.xlsx`);
  });
});
