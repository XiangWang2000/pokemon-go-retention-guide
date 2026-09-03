import type { Gen4PveEvidence } from "./batch-gen4-types";

export type { Gen4PveEvidence, Gen4PveUseLevel } from "./batch-gen4-types";

/**
 * Positive PvE evidence is keyed by BattleVariant ID rather than form ID.
 * Absence means "no positive evidence recorded here", not an assertion that the
 * variant has zero PvE value. This prevents Shadow-only strength from leaking into
 * the normal form and leaves unsupported variants for the importer to mark as data pending/unavailable.
 */
export const pveEvidence387416: Readonly<Record<string, Gen4PveEvidence>> = {
  "389-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Current raid tier A"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "暗影土台龜目前仍有高階團體戰輸出，列為核心 PvE 投資候選。",
  },
  "392-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Current raid tier B+"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "暗影烈焰猴屬可用的團體戰補位；保留實際會投入的少量候選即可。",
  },
  "395-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Current raid tier B"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "暗影帝王拿波仍有水系 PvE 補位價值，但不再列為核心投資。",
  },
  "398-sinnoh-normal": {
    level: "SPECIAL_USE",
    roles: ["Current raid tier C"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "姆克鷹目前屬較窄的飛行系團體戰用途，只需少量特殊用途候選。",
  },
  "398-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Current raid tier B+"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "暗影姆克鷹具可用的飛行系團體戰輸出，但不是核心投資。",
  },
  "405-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Current raid tier B+"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "暗影倫琴貓仍可作電系團體戰補位；普通倫琴貓不再承接此用途。",
  },
  "407-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Current raid tier B+"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "羅絲雷朵仍有可用的草／毒系團體戰價值，但不列核心投資。",
  },
  "409-sinnoh-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Current raid tier A"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "戰槌龍目前仍是高輸出的岩石系團體戰攻擊手，屬核心投資。",
  },
  "409-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Current raid tier A"],
    sourceUrl: "https://db.pokemongohub.net/best/raid-attackers?includeMegas=false",
    checkedAt: "2026-09-03",
    summaryZhTw: "暗影戰槌龍維持頂尖岩石系輸出，屬核心 PvE 投資。",
  },
};

export function pveEvidenceForVariant387416(variantId: string) {
  return pveEvidence387416[variantId] ?? null;
}
