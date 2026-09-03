import type { Gen4MaxEvidence } from "./batch-gen4-types";

export const maxEvidenceGen4: Readonly<Record<string, Gen4MaxEvidence>> = {
  "416-sinnoh-dynamax": {
    level: "SPECIAL_USE",
    roles: ["Max defender niche"],
    sourceUrl: "https://pokemongohub.net/post/guide/max-defenders-tier-list/",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨蜂女王的直接輸出不突出，但防守端仍有較窄的 Max Battle 用途；只作特殊用途候選，不因已推出就升格為核心投資。",
  },
  "466-sinnoh-dynamax": {
    level: "SPECIAL_USE",
    roles: ["Max attacker C tier"],
    sourceUrl: "https://pokemongohub.net/post/guide/max-attackers-tier-list/",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨電擊魔獸在目前 Max 攻擊手榜屬 C 級；可作屬性補位，但不因已推出就視為核心投資。",
  },
  "467-sinnoh-dynamax": {
    level: "SPECIAL_USE",
    roles: ["Max attacker C tier"],
    sourceUrl: "https://pokemongohub.net/post/guide/max-attackers-tier-list/",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨鴨嘴炎獸在目前 Max 攻擊手榜屬 C 級；可作火系補位，但不是核心 Max 投資。",
  },
  "471-sinnoh-dynamax": {
    level: "SPECIAL_USE",
    roles: ["Max attacker C tier"],
    sourceUrl: "https://pokemongohub.net/post/guide/max-attackers-tier-list/",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨冰伊布在目前 Max 攻擊手榜屬 C 級；可作冰系補位，但不是核心 Max 投資。",
  },
  "475-sinnoh-dynamax": {
    level: "SPECIAL_USE",
    roles: ["Max defender / attacker niche"],
    sourceUrl: "https://pokemongohub.net/post/guide/max-defenders-tier-list/",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨艾路雷朵目前只屬較窄的 Max 防守／補位用途；保留少量實際會投入的候選即可。",
  },
};

export function maxEvidenceForVariantGen4(variantId: string) {
  return maxEvidenceGen4[variantId] ?? null;
}
