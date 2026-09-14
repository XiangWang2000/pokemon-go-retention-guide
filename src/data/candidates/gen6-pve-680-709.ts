import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence680709: Readonly<Record<string, CandidatePveEvidence>> = {
  "697-kalos-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Rock attacker A+ tier #16"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/697",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "怪顎龍目前為岩石系 A+ Tier #16；可作團戰岩石補位，但整體 Raid Attacker 僅 C Tier，故列可用／預算型而非核心。",
  },
};

export function candidatePveEvidence680709(variantId: string) {
  return pveEvidence680709[variantId] ?? null;
}
