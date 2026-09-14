import type { CandidateMaxEvidence } from "./gen5-pve-types";

export const maxEvidence680709: Readonly<Record<string, CandidateMaxEvidence>> = {
  "700-kalos-dynamax": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fairy Max attacker B tier #3"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/700-Dynamax",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "極巨仙子伊布搭配 Charm／Max Starfall 目前為妖精系 Max Battle 攻擊手 #3、B Tier；依專案既有規則，排名高但整體層級仍只支持可用／預算型 Max 投資。",
  },
};

export function candidateMaxEvidence680709(variantId: string) {
  return maxEvidence680709[variantId] ?? null;
}
