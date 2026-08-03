import { describe, expect, it } from "vitest";
import {
  conditionalKeepOverrides091120,
  eventEvolutionPairs091120,
  evolutionPairs091120,
  forms091120,
  officialEventEvolutionEvidence091120,
  pvpokeSpeciesId091120,
  releasedShadowForms091120,
  species091120,
  truncatedForms091120,
} from "@/data/batch-091-120";

describe("#091～#120 批次來源資料", () => {
  it("涵蓋連續 30 個圖鑑編號與 35 個獨立型態", () => {
    expect(species091120.map((species) => species.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 91),
    );
    expect(forms091120).toHaveLength(35);
    expect(new Set(forms091120.map((form) => form.id)).size).toBe(35);
  });

  it("把 #090 接到 #091，並維持關都與洗翠電球進化線分開", () => {
    expect(evolutionPairs091120).toContainEqual(["090-kanto", "091-kanto"]);
    expect(evolutionPairs091120).toContainEqual(["100-kanto", "101-kanto"]);
    expect(evolutionPairs091120).toContainEqual(["100-hisui", "101-hisui"]);
    expect(evolutionPairs091120).not.toContainEqual(["100-kanto", "101-hisui"]);
  });

  it("三條地區特殊進化只存在於活動限定路徑", () => {
    expect(eventEvolutionPairs091120).toEqual([
      ["102-kanto", "103-alola"],
      ["104-kanto", "105-alola"],
      ["109-kanto", "110-galar"],
    ]);
    for (const pair of eventEvolutionPairs091120) {
      expect(evolutionPairs091120).not.toContainEqual(pair);
    }
  });

  it("地區型態產生精確 PvPoke speciesId，不與關都型態混用", () => {
    const ids = Object.fromEntries(forms091120.map((form) => [form.id, form]));
    expect(pvpokeSpeciesId091120(ids["101-hisui"]!, false)).toBe("electrode_hisuian");
    expect(pvpokeSpeciesId091120(ids["103-alola"]!, true)).toBe("exeggutor_alolan_shadow");
    expect(pvpokeSpeciesId091120(ids["105-alola"]!, false)).toBe("marowak_alolan");
    expect(pvpokeSpeciesId091120(ids["110-galar"]!, true)).toBe("weezing_galarian_shadow");
  });

  it("暗影與跨批次未完成狀態只採明確白名單", () => {
    expect(releasedShadowForms091120.has("094-kanto")).toBe(true);
    expect(releasedShadowForms091120.has("110-galar")).toBe(true);
    expect(releasedShadowForms091120.has("108-kanto")).toBe(false);
    expect(releasedShadowForms091120.has("113-kanto")).toBe(false);
    expect(releasedShadowForms091120.has("120-kanto")).toBe(true);
    expect(truncatedForms091120.has("120-kanto")).toBe(true);
    expect(truncatedForms091120.has("091-kanto")).toBe(false);
  });

  it("保護 Mega 基底與跨批次暗影進化候選，避免誤傳", () => {
    expect([...conditionalKeepOverrides091120.keys()]).toEqual([
      "094-kanto-normal",
      "115-kanto-normal",
      "120-kanto-shadow",
    ]);
    expect(conditionalKeepOverrides091120.get("094-kanto-normal")?.reason).toContain(
      "其餘普通重複可傳",
    );
    expect(conditionalKeepOverrides091120.get("115-kanto-normal")?.reason).toContain(
      "其餘普通重複可傳",
    );
    expect(conditionalKeepOverrides091120.get("120-kanto-shadow")?.reason).toContain(
      "Ultra League Overall #170",
    );
  });

  it("活動限定進化的一手來源同時綁定起點與終點", () => {
    expect(officialEventEvolutionEvidence091120).toEqual([
      { sourceId: "OFF-EVENT-ALOLA-EXEGGUTOR-2024", formId: "102-kanto" },
      { sourceId: "OFF-EVENT-ALOLA-EXEGGUTOR-2024", formId: "103-alola" },
      { sourceId: "OFF-ALOLA-TO-ALOLA-2022", formId: "104-kanto" },
      { sourceId: "OFF-ALOLA-TO-ALOLA-2022", formId: "105-alola" },
      { sourceId: "OFF-LEGENDARY-HEROES-2024", formId: "109-kanto" },
      { sourceId: "OFF-LEGENDARY-HEROES-2024", formId: "110-galar" },
    ]);
  });
});
