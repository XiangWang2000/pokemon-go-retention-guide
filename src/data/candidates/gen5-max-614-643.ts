import type { CandidateMaxEvidence } from "./gen5-pve-types";

export const maxEvidence614643: Readonly<Record<string, CandidateMaxEvidence>> = {
  "635-unova-dynamax": {
    level: "USABLE_OR_BUDGET",
    roles: ["Dark Max attacker B tier #2"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/635-Dynamax",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "極巨三首惡龍搭配 Bite／Max Darkness 目前為惡系 Max Battle 攻擊手 #2，但整體僅 B Tier；因此列可用／預算型 Max 投資，不因排名 #2 就升格為核心。",
  },
};

export function candidateMaxEvidence614643(variantId: string) {
  return maxEvidence614643[variantId] ?? null;
}
