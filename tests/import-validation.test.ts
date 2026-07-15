import { describe, expect, it } from "vitest";
import { validateImportBatch } from "@/data/import-schema";

describe("資料匯入前驗證", () => {
  it("拒絕重複 PokemonForm ID 與缺少中英文名稱", () => {
    const invalid = {
      id: "052-galar",
      speciesId: "species-052",
      formKey: "GALAR",
      formNameEn: "",
      formNameZhTw: "",
      regionKey: "GALAR",
      types: [],
      searchAliases: [],
      evolvesFromFormId: null,
      evolutionFamilyNotesZhTw: "",
      isReleasedInPokemonGo: null,
    };
    const result = validateImportBatch("PokemonForm", [invalid, invalid]);
    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toContain("名稱");
  });
  it("拒絕沒有 checkedAt 或錯誤 rank", () => {
    const result = validateImportBatch("RawEvaluationData", [
      {
        id: "raw-x",
        battleVariantId: "x",
        category: "PVP",
        league: "GREAT",
        rank: 0,
        recommendedMoves: [],
        rawNotes: "",
        seasonOrVersion: "v",
        sourceId: "s",
      },
    ]);
    expect(result.success).toBe(false);
  });
  it("接受合法 http(s) 來源", () => {
    const result = validateImportBatch("SourceReference", [
      {
        id: "s",
        sourceName: "PvPoke",
        sourceUrl: "https://pvpoke.com/",
        sourceType: "PVP",
        sourceTitleOriginal: "Rankings",
        sourceLanguage: "en",
        sourceSummaryZhTw: "排名資料",
        accessedAt: "2026-07-15",
        notes: "",
      },
    ]);
    expect(result.success).toBe(true);
  });
});
