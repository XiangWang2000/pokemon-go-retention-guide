import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence494523: Readonly<Record<string, CandidatePveEvidence>> = {
  "494-unova-normal": {
    level: "SPECIAL_USE",
    roles: ["Fire raid attacker", "Psychic raid attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/494",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "比克提尼可作火／超能力系團體戰補位，其中 V-create 火系用途較佳；屬稀有特殊用途，不列核心星塵投資。",
  },
  "497-unova-shadow": {
    level: "SPECIAL_USE",
    roles: ["Grass attacker B tier #32"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/497-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影君主蛇搭配瘋狂植物可作草系特定對局補位，目前草系約 B Tier #32；價值有限且依賴限定招，不列核心投資。",
  },
  "500-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Fire attacker A+ tier #16"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/500-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影炎武王搭配爆炸烈焰目前為 A+ 級火系攻擊手（約 #16），在暗影個體保留門檻較寬的前提下屬高價值 PvE 候選；普通炎武王不承接此等級。",
  },
  "503-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Water attacker A tier #24"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/503",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "大劍鬼搭配水炮加農目前約為 A Tier #24 的水系攻擊手，屬可用／預算型團體戰選擇，但不是最高優先長期投資。",
  },
  "503-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Water attacker A+ tier #12"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/503-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影大劍鬼搭配水炮加農目前為 A+ 級水系攻擊手（約 #12），屬值得優先保留的暗影 PvE 候選。",
  },
  "521-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying attacker C tier #46", "Budget Flying raid attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/521",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "高傲雉雞可作預算型飛行系團體戰攻擊手；目前飛行系約 C Tier #46，只適合缺乏更高階選項時少量保留。",
  },
  "521-unova-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying attacker B tier #31"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/521-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影高傲雉雞目前約為 B Tier #31 飛行系攻擊手，較普通版有提升但仍屬有限用途；保留少量實際會投入的個體即可。",
  },
};

export function candidatePveEvidence494523(variantId: string) {
  return pveEvidence494523[variantId] ?? null;
}
