import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile header navigation contract", () => {
  it("hides the redundant brand link only below the sm breakpoint", () => {
    const source = readFileSync("src/components/site-header.tsx", "utf8");

    expect(source).toContain('aria-label="Pokémon GO 保留指南首頁"');
    expect(source).toContain("hidden min-h-11 items-center");
    expect(source).toContain("sm:flex");
  });

  it("keeps concise phone labels and accessible full navigation names", () => {
    const source = readFileSync("src/components/site-navigation.tsx", "utf8");

    for (const [full, compact] of [
      ["圖鑑評估", "圖鑑"],
      ["資料待補清單", "待補"],
      ["資料來源", "來源"],
      ["變更紀錄", "變更"],
    ]) {
      expect(source).toContain(`label: "${full}"`);
      expect(source).toContain(`mobileLabel: "${compact}"`);
    }
    expect(source).toContain("aria-label={label}");
    expect(source).toContain('className="sm:hidden"');
    expect(source).toContain('className="hidden sm:inline"');
  });
});
