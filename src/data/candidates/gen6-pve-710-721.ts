import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence710721: Readonly<Record<string, CandidatePveEvidence>> = {
  "716-kalos-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Fairy attacker S tier #7"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/716",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "哲爾尼亞斯搭配 Geomancy／Moonblast 目前為妖精系 S Tier #7；限定快招 Geomancy 是核心輸出條件，兼具傳說級團戰與 Master League 價值，支持核心投資。",
  },
  "717-kalos-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Flying attacker S tier #8", "Dark attacker A+ tier #20"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/717",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "伊裴爾塔爾搭配 Gust／Oblivion Wing 為飛行系 S Tier #8，Snarl／Dark Pulse 亦為惡系 A+ Tier #20；Oblivion Wing 為限定招依賴，雙屬性團戰價值支持核心投資。",
  },
  "719-kalos-normal": {
    level: "SPECIAL_USE",
    roles: ["Mega Diancie base investment"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/719",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "普通蒂安希本身僅岩石 D Tier #56、妖精 F Tier #97，不應因 Mega 的輸出回灌成普通團戰核心；但它是 Mega Diancie 的實際基礎個體，因此保留為特殊 Mega 投資用途。",
  },
  "719-kalos-mega": {
    level: "CORE_INVESTMENT",
    roles: ["Rock attacker S tier #1", "Fairy attacker A+ tier #20"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/719-Mega",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "Mega 蒂安希目前為岩石系 S Tier #1、妖精系 A+ Tier #20；高攻擊與 Mega 團戰加成使其成為核心岩石系 PvE 投資。",
  },
  "720-unbound-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Psychic attacker A+ tier #13", "Dark attacker A tier #23"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/720-Unbound",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "解放胡帕目前為超能力 A+ Tier #13、惡系 A Tier #23；來源明確評價其為優秀團戰輸出手。此價值只屬 Unbound exact form，不回灌 Confined。",
  },
};

export function candidatePveEvidence710721(variantId: string) {
  return pveEvidence710721[variantId] ?? null;
}
