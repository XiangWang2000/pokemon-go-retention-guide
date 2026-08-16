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
    level: "USABLE_OR_BUDGET",
    roles: ["Grass A+ #16", "Ground A #24"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/389-Shadow",
    checkedAt: "2026-08-13",
    summaryZhTw: "暗影土台龜是穩定的草系攻擊手，也可兼任地面系；仍有更高階選擇，因此不列核心投資。",
  },
  "395-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Water B #34"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/395",
    checkedAt: "2026-08-13",
    summaryZhTw: "帝王拿波靠加農水炮具備可用的水系 PvE 價值，但整體已有更強替代。",
  },
  "395-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Water attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/395-Shadow",
    checkedAt: "2026-08-13",
    summaryZhTw: "暗影帝王拿波目前屬頂尖水系團體戰攻擊手之一；有加農水炮時值得作為長期投資候選。",
  },
  "398-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying A #27"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/398",
    checkedAt: "2026-08-13",
    summaryZhTw: "姆克鷹是少數具完整飛行系輸出的非傳說選擇，適合缺少高階飛行攻擊手時使用。",
  },
  "398-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying A+ #16"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/398-Shadow",
    checkedAt: "2026-08-13",
    summaryZhTw: "暗影姆克鷹的飛行系輸出明顯高於普通版，但整體團體戰定位仍較偏屬性補位。",
  },
  "405-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Electric A #27"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/405",
    checkedAt: "2026-08-13",
    summaryZhTw: "倫琴貓具可用的電系團體戰輸出，但並非目前電系最優先投資。",
  },
  "405-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Electric A #21"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/405-Shadow",
    checkedAt: "2026-08-13",
    summaryZhTw: "暗影倫琴貓是可靠的電系團體戰攻擊手，但現行排名仍有更高階選擇。",
  },
  "407-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Grass A+ #17", "Poison S #8"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/407",
    checkedAt: "2026-08-13",
    summaryZhTw: "羅絲雷朵可同時擔任草系與毒系攻擊手；屬性榜表現高，但整體仍以實用型投資定位為主。",
  },
  "409-sinnoh-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Rock A+ #12"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/409",
    checkedAt: "2026-08-13",
    summaryZhTw: "戰槌龍具有頂尖非 Mega／非暗影岩石系 DPS，是明確的團體戰核心投資候選。",
  },
  "409-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Rock S #8"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/409-Shadow",
    checkedAt: "2026-08-13",
    summaryZhTw: "暗影戰槌龍目前具有頂級岩石系輸出，雖然很脆仍值得優先保留與投資。",
  },
};

export function pveEvidenceForVariant387416(variantId: string) {
  return pveEvidence387416[variantId] ?? null;
}
