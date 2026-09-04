import type { CandidatePveEvidence } from "./gen5-battle-evidence-types";

export const pveEvidence494523: Readonly<Record<string, CandidatePveEvidence>> = {
  "500-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Fire attacker A+ tier #16"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/500-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影炎武王目前是 A+ 級火系團體戰攻擊手；Shadow 的高輸出價值只屬於暗影個體，不回灌普通炎武王。",
  },
  "503-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Water attacker A tier #24"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/503",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "普通大劍鬼搭配攀瀑／加農水炮仍是可用的水系團體戰攻擊手，但不是頂級核心；適合作為預算或既有高等級補位。",
  },
  "503-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Water attacker A+ tier #12"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/503-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影大劍鬼目前為 A+ 級水系攻擊手，屬高價值 Shadow PvE 候選；保留門檻應比普通版寬鬆。",
  },
  "521-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying attacker C tier #46"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/521",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "普通高傲雉雞目前僅屬 C 級飛行系預算攻擊手；沒有更高階飛行系隊伍時可補位，但不應視為核心長期投資。",
  },
  "521-unova-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying attacker B tier #31"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/521-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影高傲雉雞的飛行系輸出優於普通版、目前為 B 級補位，但仍非核心頂級攻擊手；只保留實際會使用的候選。",
  },
};

export function pveEvidenceForVariant494523(variantId: string) {
  return pveEvidence494523[variantId] ?? null;
}
