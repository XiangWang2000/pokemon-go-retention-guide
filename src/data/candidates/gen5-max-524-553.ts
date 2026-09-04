import type { CandidateMaxEvidence } from "./gen5-pve-types";

export const maxEvidence524553: Readonly<Record<string, CandidateMaxEvidence>> = {
  "526-unova-dynamax": {
    level: "CORE_INVESTMENT",
    roles: ["Rock Max attacker A tier #2"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/526-Dynamax",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "極巨龐岩怪目前為 A Tier #2 岩石系 Max Battle 攻擊手，屬高階且可實際長期使用的 Max 投資候選。",
  },
  "530-unova-dynamax": {
    level: "CORE_INVESTMENT",
    roles: ["Ground Max attacker S tier #1"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/530-Dynamax",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "極巨龍頭地鼠目前為 S Tier #1 地面系 Max Battle 攻擊手，屬本批最明確的核心 Max 投資候選之一。",
  },
};

export function candidateMaxEvidence524553(variantId: string) {
  return maxEvidence524553[variantId] ?? null;
}
