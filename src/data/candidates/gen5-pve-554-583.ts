import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence554583: Readonly<Record<string, CandidatePveEvidence>> = {
  "555-unova-standard-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fire attacker B tier #32"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/555",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "合眾普通模式達摩狒狒目前約為 B Tier #32 火系攻擊手，仍可作預算型團體戰輸出，但不列核心長期投資。",
  },
  "555-unova-standard-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Fire attacker A+ tier #19", "Raid attacker B tier #109"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/555-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影合眾普通模式達摩狒狒目前為 A+ Tier #19 火系攻擊手；考量暗影保留門檻較寬與高輸出定位，列為核心暗影 PvE 候選。",
  },
  "555-galar-standard-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Ice attacker A+ tier #17"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/555-Galarian",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "伽勒爾普通模式達摩狒狒目前約為 A+ Tier #17 冰系攻擊手，屬高實用但仍可被更高階冰系取代的 PvE 候選。",
  },
};

export function candidatePveEvidence554583(variantId: string) {
  return pveEvidence554583[variantId] ?? null;
}
