import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence650679: Readonly<Record<string, CandidatePveEvidence>> = {
  "652-kalos-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Grass attacker A tier #25"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/652",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "普通布里卡隆搭配 Vine Whip／Frenzy Plant 目前為草系 A Tier #25；限定招 Frenzy Plant 是主要 PvE 價值來源，但已有更高階選項，因此列可用／預算型。",
  },
  "652-kalos-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Grass attacker S tier #5"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/652-Shadow",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "暗影布里卡隆搭配 Vine Whip／Frenzy Plant 目前為草系 S Tier #5；暗影輸出與限定招組合提供獨立核心 PvE 理由，不能回灌普通或 Mega。",
  },
  "652-kalos-mega": {
    level: "CORE_INVESTMENT",
    roles: ["Grass attacker S tier #1"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/652-Mega",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "Mega 布里卡隆目前為草系 S Tier #1；其高 TDO 與 Mega 團戰加成使 exact Mega variant 成為核心草系投資目標。",
  },
  "655-kalos-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fire attacker B tier #35"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/655",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "普通妖火紅狐搭配 Fire Spin／Blast Burn 目前為火系 B Tier #35；Blast Burn 依賴明確，但普通版本身只支持可用／預算型團戰價值。",
  },
  "655-kalos-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fire attacker A+ tier #13"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/655-Shadow",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "暗影妖火紅狐搭配 Fire Spin／Blast Burn 為火系 A+ Tier #13；來源同時明確指出不值得為此最大化投資，因 Mega 與其他火系選項上限更高，因此保守列可用型。",
  },
  "655-kalos-mega": {
    level: "CORE_INVESTMENT",
    roles: ["Fire attacker S tier #1", "Psychic attacker S tier #9"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/655-Mega",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "Mega 妖火紅狐搭配 Fire Spin／Mystical Fire+ 目前為火系 S Tier #1，並可作超能力 S Tier #9；雙屬性高階輸出支持核心投資。",
  },
  "658-kalos-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Water attacker A+ tier #20"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/658",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "普通甲賀忍蛙搭配 Water Shuriken／Hydro Cannon 目前為水系 A+ Tier #20；限定招 Hydro Cannon 關鍵，但 Mega 上限更高，因此普通版列可用型。",
  },
  "658-kalos-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Water attacker A+ tier #13"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/658-Shadow",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "暗影甲賀忍蛙搭配 Water Shuriken／Hydro Cannon 為水系 A+ Tier #13，輸出高但來源也強調非常脆弱且 Mega 上限更高；故保留價值高但不升格為核心最大化投資。",
  },
  "658-kalos-mega": {
    level: "CORE_INVESTMENT",
    roles: ["Water attacker S tier #2", "Dark attacker A+ tier #16"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/658-Mega",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "Mega 甲賀忍蛙搭配 Water Shuriken／Surf+ 為水系 S Tier #2，亦可作惡系 A+ Tier #16；來源稱其為最有價值的 Mega 之一，支持核心投資。",
  },
};

export function candidatePveEvidence650679(variantId: string) {
  return pveEvidence650679[variantId] ?? null;
}
