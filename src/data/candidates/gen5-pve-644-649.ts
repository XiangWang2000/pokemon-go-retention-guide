import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence644649: Readonly<Record<string, CandidatePveEvidence>> = {
  "644-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Electric attacker A+ tier #14", "Dragon attacker B tier #34"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/644",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "捷克羅姆搭配 Charge Beam／Fusion Bolt 目前為電系 A+ Tier #14；來源明確評價其電系表現優秀並指出 Fusion Bolt 對最佳輸出屬必要，支持核心 PvE 投資。",
  },
  "645-therian-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Ground attacker S tier #5"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/645-Therian",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "靈獸形態土地雲搭配 Mud Shot／Sandsear Storm 目前為地面系 S Tier #5；限定招 Sandsear Storm 是其頂級地面輸出的關鍵，支持核心 PvE 投資。",
  },
  "646-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Ice attacker A+ tier #16"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/646",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "通常酋雷姆搭配 Dragon Breath／Glaciate 目前為冰系 A+ Tier #16，來源稱其仍是很強的屠龍手；考量闇黑／焰白酋雷姆已推出且上限更高，因此列可用型而非核心。",
  },
  "646-black-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Dragon attacker S tier #5", "Ice attacker S tier #3"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/646-Black",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "闇黑酋雷姆目前為龍系 S Tier #5、冰系 S Tier #3；Freeze Shock 可建立頂級冰系輸出，融合形態本身具獨立核心 PvE 價值。",
  },
  "646-white-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Ice attacker S tier #1", "Dragon attacker S tier #6"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/646-White",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "焰白酋雷姆目前為冰系 S Tier #1、龍系 S Tier #6；Ice Burn 支持其頂級冰系輸出，融合形態本身具獨立核心 PvE 價值。",
  },
  "647-resolute-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Fighting attacker S tier #6"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/647-Resolute",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "覺悟的樣子凱路迪歐搭配 Low Kick／Secret Sword 目前為格鬥 S Tier #6；來源稱其為最強的非 Mega 格鬥系之一並明確列為 must-have，支持核心 PvE 投資。",
  },
  "649-shock-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug / Steel raid budget attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/649-Shock",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "閃電卡帶蓋諾賽克特的 exact-form PvE 分析指出蟲／鋼輸出可在缺少更強暗影或 Mega 時補位，但並非頂級，故列可用／預算型；Techno Blast 只被建議用於 PvP。",
  },
  "649-burn-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug / Steel raid budget attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/649-Burn",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "火焰卡帶蓋諾賽克特的 exact-form PvE 分析指出蟲／鋼輸出可在缺少更強暗影或 Mega 時補位，但並非頂級，故列可用／預算型；Techno Blast 只被建議用於 PvP。",
  },
  "649-chill-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug / Steel raid budget attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/649-Chill",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "冰凍卡帶蓋諾賽克特的 exact-form PvE 分析指出蟲／鋼輸出可在缺少更強暗影或 Mega 時補位，但並非頂級，故列可用／預算型；Techno Blast 只被建議用於 PvP。",
  },
  "649-douse-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug / Steel raid budget attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/649-Douse",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "水流卡帶蓋諾賽克特的 exact-form PvE 分析指出蟲／鋼輸出可在缺少更強暗影或 Mega 時補位，但並非頂級，故列可用／預算型；Techno Blast 只被建議用於 PvP。",
  },
};

export function candidatePveEvidence644649(variantId: string) {
  return pveEvidence644649[variantId] ?? null;
}
