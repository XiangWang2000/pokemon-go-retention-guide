import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence614643: Readonly<Record<string, CandidatePveEvidence>> = {
  "623-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Ground attacker A tier #27"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/623",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "普通泥偶巨人搭配 Mud-Slap／Earth Power 目前約為地面系 A Tier #27；來源明確指出仍可作團體戰地面補位，因此列為可用／預算型而非核心投資。",
  },
  "623-unova-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Ground attacker A+ tier #14"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/623-Shadow",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "暗影泥偶巨人搭配 Mud-Slap／Earth Power 目前約為地面系 A+ Tier #14，輸出明顯優於普通版；仍有更高階地面系選項，因此保守列為可用型暗影候選。",
  },
  "635-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Dark attacker A+ tier #15"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/635",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "普通三首惡龍搭配 Bite／Brutal Swing 目前為惡系 A+ Tier #15；來源明確描述 Brutal Swing 使其成為頂尖惡系之一，普通版本身即可成立核心 PvE 理由。",
  },
  "635-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Dark attacker S tier #6"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/635-Shadow",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "暗影三首惡龍搭配 Bite／Brutal Swing 目前為惡系 S Tier #6；來源明確指出 Elite Charged TM 值得投入，屬核心暗影 PvE 候選。",
  },
  "637-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Bug attacker S tier #8", "Fire attacker A tier #27"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/637",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "火神蛾目前為蟲系 S Tier #8、火系 A Tier #27，來源明確評價 400 糖果進化成本仍值得，且可兼任兩種團戰輸出，支持核心 PvE 投資。",
  },
  "639-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Fighting attacker A+ tier #12", "Rock attacker A+ tier #15"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/639",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "代拉基翁搭配 Double Kick／Sacred Sword 目前為格鬥 A+ Tier #12，同時可作岩石 A+ Tier #15；來源將其列為最優秀格鬥系之一，屬核心雙屬性 PvE 投資。",
  },
  "641-therian-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Flying attacker A tier #22"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/641-Therian",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "靈獸形態龍捲雲搭配 Gust／Bleakwind Storm 目前為飛行系 A Tier #22；來源稱其值得使用但仍被多個飛行系輸出手超越，因此列為可用型而非核心。",
  },
  "642-therian-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Electric attacker A+ tier #12"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/642-Therian",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "靈獸形態雷電雲搭配 Volt Switch／Wildbolt Storm 目前為電系 A+ Tier #12；來源明確描述為頂級電系 DPS 選擇，雖偏脆仍具核心 PvE 投資價值。",
  },
  "643-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Fire attacker S tier #9", "Dragon attacker B tier #37"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/643",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "萊希拉姆搭配 Fire Fang／Fusion Flare 目前為火系 S Tier #9；來源明確指出 Fusion Flare 對最佳表現屬必要招式，普通版本身即是核心火系 PvE 投資。",
  },
  "643-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Fire attacker S tier #4", "Dragon attacker A tier #21"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/643-Shadow",
    checkedAt: "2026-09-05",
    summaryZhTw:
      "暗影萊希拉姆搭配 Fire Fang／Fusion Flare 目前為火系 S Tier #4；來源將其列為頂尖火系暗影並明確建議投資，Fusion Flare 的限定招依賴需保留。",
  },
};

export function candidatePveEvidence614643(variantId: string) {
  return pveEvidence614643[variantId] ?? null;
}
