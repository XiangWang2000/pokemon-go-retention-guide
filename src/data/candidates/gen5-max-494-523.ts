import type { CandidateMaxEvidence } from "./gen5-pve-types";

export const maxEvidence494523: Readonly<Record<string, CandidateMaxEvidence>> = {
  "521-unova-dynamax": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying Max attacker B tier #2"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/521-Dynamax",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "極巨高傲雉雞目前是飛行系 Max Battle 攻擊手 #2，但整體僅 B Tier；屬可用／預算型 Max 候選，不因排名 #2 就升格為核心投資。",
  },
};

export function candidateMaxEvidence494523(variantId: string) {
  return maxEvidence494523[variantId] ?? null;
}
