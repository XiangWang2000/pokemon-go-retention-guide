import { describe, expect, it } from "vitest";
import { matchesPokemonSearch, normalizeDexQuery, normalizeSearch } from "@/lib/search";

const meowth = {
  dexNumber: 52,
  nameEn: "Meowth",
  nameZhTw: "喵喵",
  formNameEn: "Galar",
  formNameZhTw: "伽勒爾",
  aliases: ["Galarian Meowth", "伽勒爾喵喵"],
  evolutionNames: ["Perrserker", "喵頭目"],
};

describe("搜尋正規化", () => {
  it.each(["052", "52", "０５２"])("把 %s 視為同一圖鑑編號", (query) => {
    expect(normalizeDexQuery(query)).toBe("52");
    expect(matchesPokemonSearch(meowth, query)).toBe(true);
  });

  it.each(["喵喵", "Meowth", "meOWTh", "伽勒爾喵喵", "Galarian Meowth", "喵頭目", "Perrserker"])(
    "可搜尋 %s",
    (query) => expect(matchesPokemonSearch(meowth, query)).toBe(true),
  );

  it("處理空白與常見標點差異", () => {
    expect(normalizeSearch("  Galarian   Meowth  ")).toBe("galarian meowth");
    expect(normalizeSearch("Mega—X")).toBe("mega-x");
  });
});
