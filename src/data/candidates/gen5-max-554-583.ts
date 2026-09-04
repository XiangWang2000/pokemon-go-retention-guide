import type { CandidateMaxEvidence } from "./gen5-pve-types";

export const maxEvidence554583: Readonly<Record<string, CandidateMaxEvidence>> = {
  "555-unova-standard-dynamax": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fire Max attacker B tier #3"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/555-Dynamax",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "極巨合眾普通模式達摩狒狒目前為 B Tier #3 火系 Max Battle 攻擊手，屬可用／預算型 Max 候選，不因排名靠前就升格為核心投資。",
  },
  "569-unova-gigantamax": {
    level: "CORE_INVESTMENT",
    roles: ["Poison Max attacker S tier #1"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/569-Gigantamax",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "超極巨灰塵山目前為 S Tier #1 毒系 Max Battle 攻擊手，屬本批明確的核心 Gigantamax 投資候選。",
  },
};

export function candidateMaxEvidence554583(variantId: string) {
  return maxEvidence554583[variantId] ?? null;
}
