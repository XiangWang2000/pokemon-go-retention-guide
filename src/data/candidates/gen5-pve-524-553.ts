import type { CandidatePveEvidence } from "./gen5-pve-types";

export const pveEvidence524553: Readonly<Record<string, CandidatePveEvidence>> = {
  "526-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Rock attacker A+ tier #13", "Budget Rock raid attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/526",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "龐岩怪搭配流星光束目前約為 A+ Tier #13 岩石系攻擊手，來源亦明確定位為優秀預算選項；保留實際會使用的少量高品質個體即可。",
  },
  "526-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Rock attacker S tier #5"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/526-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影龐岩怪搭配流星光束目前為 S Tier #5 岩石系攻擊手，來源明確評價值得投入資源，屬核心暗影 PvE 候選。",
  },
  "530-unova-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Ground attacker A+ tier #15", "Steel attacker A tier #24"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/530",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "龍頭地鼠兼具地面 A+ #15 與鋼 A #24 的雙屬性團戰用途，來源明確指出其值得投入資源；普通版本身即可成立核心 PvE 理由。",
  },
  "530-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Ground attacker S tier #7", "Steel attacker S tier #10"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/530-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影龍頭地鼠目前為地面 S #7、鋼 S #10 的高階輸出手，屬核心暗影 PvE 候選；此價值不回灌尚未推出的 Mega 版本。",
  },
  "534-unova-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fighting attacker A tier #22"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/534",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "修建老匠目前約為 A Tier #22 格鬥系攻擊手，仍具可靠團戰用途，但在更高階格鬥手存在下列為可用／預算型投資。",
  },
  "534-unova-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Fighting attacker S tier #8", "Raid attacker A tier #90"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/534-Shadow",
    checkedAt: "2026-09-04",
    summaryZhTw:
      "暗影修建老匠目前為 S Tier #8 格鬥系攻擊手，且整體團戰排名約 A Tier #90；屬值得優先保留與投資的暗影 PvE 候選。",
  },
};

export function candidatePveEvidence524553(variantId: string) {
  return pveEvidence524553[variantId] ?? null;
}
