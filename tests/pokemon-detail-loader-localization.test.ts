import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/pokemon-detail-loader.tsx", "utf8");

describe("Pokémon detail loader localization", () => {
  it("keeps loading, error, retry, and unavailable states in Traditional Chinese", () => {
    for (const text of [
      "詳細資料載入失敗",
      "寶可夢詳細資料載入失敗，請重新載入後再試一次。",
      "重新載入",
      "正在載入寶可夢詳細資料…",
      "此型態的詳細資料目前無法使用。",
    ]) {
      expect(source).toContain(text);
    }

    for (const legacyEnglish of [
      "Detail data failed to load",
      "Static Pokémon detail data failed to load.",
      ">Reload<",
      "Loading Pokémon detail data...",
      "This form detail is unavailable.",
    ]) {
      expect(source).not.toContain(legacyEnglish);
    }
  });

  it("announces asynchronous loading and error states accessibly", () => {
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-busy="true"');
  });
});
