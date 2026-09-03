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
  "461-sinnoh-dynamax": {
    level: "CORE_INVESTMENT",
    roles: ["Ice Max attacker S tier"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/461-Dynamax",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨瑪狃拉目前是頂尖冰系 Max 攻擊手，屬核心 Max Battle 投資候選。",
  },
  "464-sinnoh-dynamax": {
    level: "CORE_INVESTMENT",
    roles: ["Rock Max attacker S tier"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/464-Dynamax",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨超甲狂犀目前是頂尖岩石系 Max 攻擊手，亦可提供地面系輸出，屬核心 Max Battle 投資。",
  },
  "466-sinnoh-dynamax": {
    level: "USABLE_OR_BUDGET",
    roles: ["Electric Max attacker B tier"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/466-Dynamax",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨電擊魔獸目前屬可用的電系 Max 攻擊手；保留實際會投入的少量候選。",
  },
  "471-sinnoh-dynamax": {
    level: "CORE_INVESTMENT",
    roles: ["Ice Max attacker A+ tier"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/471-Dynamax",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨冰伊布目前是高階冰系 Max 攻擊手，屬核心 Max Battle 投資候選。",
  },
  "475-sinnoh-dynamax": {
    level: "USABLE_OR_BUDGET",
    roles: ["Psychic Max attacker B tier", "Fighting Max attacker C tier"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/475-Dynamax",
    checkedAt: "2026-09-03",
    summaryZhTw:
      "極巨艾路雷朵在超能力系 Max 輸出屬可用等級，格鬥用途較窄；保留實際會投入的少量候選。",
  },
};

export function maxEvidenceForVariantGen4(variantId: string) {
  return maxEvidenceGen4[variantId] ?? null;
}
