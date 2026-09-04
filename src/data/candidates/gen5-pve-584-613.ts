import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence584613: Readonly<Record<string, CandidatePveEvidence>> = {
  "589-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug attacker A tier #26"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/589",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "騎士蝸牛目前約為 A Tier #26 蟲系攻擊手；蟲系團戰需求較窄，因此列為可用／預算型而非核心投資。",
  },
  "589-unova-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug attacker S tier #9"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/589-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影騎士蝸牛目前約為 S Tier #9 蟲系攻擊手，但蟲系團戰用途仍偏窄；依暗影較寬保留門檻可保留少量實際會投入的候選。",
  },
  "609-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Ghost attacker A+ tier #20", "Fire attacker A tier #29"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/609",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "水晶燈火靈同時具幽靈 A+ #20 與火 A #29 的雙屬性團戰用途，來源明確評價為值得投資，普通版本身即可成立核心 PvE 理由。",
  },
  "609-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Ghost attacker S tier #6", "Fire attacker S tier #7"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/609-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影水晶燈火靈目前為幽靈 S #6、火 S #7 的頂尖雙屬性輸出手，來源亦明確指出非常值得強化，屬核心暗影 PvE 候選。",
  },
  "612-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Dragon attacker A tier #24"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/612",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "雙斧戰龍搭配廣域破壞目前約為 A Tier #24 龍系攻擊手，具高 DPS 與實用性，但在傳說／Mega／暗影龍系存在下列為可用型投資。",
  },
  "612-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Dragon attacker S tier #9", "Raid attacker A tier #69"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/612-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影雙斧戰龍搭配廣域破壞目前為 S Tier #9 龍系攻擊手，來源描述其登場時為最強暗影龍系輸出之一；屬核心暗影 PvE 候選。",
  },
};

export function candidatePveEvidence584613(variantId: string) {
  return pveEvidence584613[variantId] ?? null;
}
