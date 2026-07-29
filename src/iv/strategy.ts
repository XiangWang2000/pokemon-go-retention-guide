export type IvRecommendationScope =
  "GLOBAL" | "FAMILY" | "MEMBER" | "POKEMON_FORM" | "BATTLE_VARIANT";

export type IvStrategyKey =
  | "PVE_ATTACKER"
  | "MEGA_ATTACKER"
  | "MASTER_LEAGUE"
  | "GREAT_LEAGUE_RANK"
  | "ULTRA_LEAGUE_RANK"
  | "SHADOW_PVE"
  | "GYM_DEFENDER"
  | "MAX_ATTACKER"
  | "MAX_TANK"
  | "MAX_SUPPORT"
  | "MAX_FLEX"
  | "HIGH_GENERAL_IV"
  | "HUNDO_PREFERRED"
  | "CUSTOM";

export type PrimaryUseKey =
  | "PVE"
  | "MEGA"
  | "MASTER_LEAGUE"
  | "GREAT_LEAGUE"
  | "ULTRA_LEAGUE"
  | "SHADOW_PVE"
  | "GYM_DEFENSE"
  | "MAX_ATTACK"
  | "MAX_TANK"
  | "MAX_SUPPORT"
  | "MAX_FLEX"
  | "GENERAL"
  | "EVOLUTION";

export type MaxBattleRole = "ATTACKER" | "TANK" | "SUPPORT" | "FLEX";

export interface IvRecommendation {
  id: string;
  scopeType: IvRecommendationScope;
  scopeKey: string;
  primaryUseKey: PrimaryUseKey;
  ivStrategyKey: IvStrategyKey;
  maxBattleRole: MaxBattleRole | null;
  attackIvMin: number | null;
  attackIvPriority: number | null;
  defenseIvMin: number | null;
  staminaIvMin: number | null;
  totalIvPercentMin: number | null;
  totalIvPercentPriority: number | null;
  /** 個體在指定物種、型態、進化結果及聯盟中的 PvP IV Rank；不是 PvPoke 物種排名。 */
  pvpRankMax: number | null;
  /** 個體 PvP Stat Product 百分位；不是 PvPoke 物種評分。 */
  pvpPrMin: number | null;
  recommendedQuantity: number | null;
  speciesSpecificOverride: boolean;
  overrideReasonZhTw: string;
  ivRecommendationZhTw: string;
  shortIvLabelZhTw: string;
  rulesVersion: string;
}

export interface IvCandidate {
  attackIv: number;
  defenseIv: number;
  staminaIv: number;
  /** 個體 PvP IV Rank。不得傳入或代用 PvPoke 物種聯盟排名。 */
  pvpIvRank?: number | null;
  /** 個體 PvP Stat Product 百分位。 */
  pvpPr?: number | null;
  /** 對應物種／型態已確認具有此用途時才可套用 IV 門檻。 */
  hasRelevantUse: boolean;
  isRareOrHighValueShadow?: boolean;
  isOnlyAvailableCopy?: boolean;
}

export type IvCandidateLevel =
  | "TOP_PRIORITY"
  | "PRIORITY"
  | "RECOMMENDED"
  | "CONDITIONAL"
  | "SECONDARY"
  | "INSUFFICIENT"
  | "NOT_APPLICABLE";

export interface IvCandidateEvaluation {
  level: IvCandidateLevel;
  labelZhTw: string;
  totalIvPercent: number;
  totalIvPercentLabel: string;
}

export interface IvResolutionContext {
  familyKey?: string | null;
  /** MEMBER scope 使用 PokemonSpecies.id。 */
  memberId?: string | null;
  /** memberId 的語意化別名，方便資料層直接傳入 speciesId。 */
  speciesId?: string | null;
  pokemonFormId?: string | null;
  battleVariantId?: string | null;
}

export const IV_RULES_VERSION = "2026.07.28-v2";
export const GLOBAL_IV_SCOPE_KEY = "GLOBAL";

function globalRecommendation(
  primaryUseKey: PrimaryUseKey,
  ivStrategyKey: IvStrategyKey,
  values: Partial<
    Omit<IvRecommendation, "id" | "scopeType" | "scopeKey" | "primaryUseKey" | "ivStrategyKey">
  >,
): IvRecommendation {
  return {
    id: `iv-global-${primaryUseKey.toLowerCase().replaceAll("_", "-")}`,
    scopeType: "GLOBAL",
    scopeKey: GLOBAL_IV_SCOPE_KEY,
    primaryUseKey,
    ivStrategyKey,
    maxBattleRole: null,
    attackIvMin: null,
    attackIvPriority: null,
    defenseIvMin: null,
    staminaIvMin: null,
    totalIvPercentMin: null,
    totalIvPercentPriority: null,
    pvpRankMax: null,
    pvpPrMin: null,
    recommendedQuantity: null,
    speciesSpecificOverride: false,
    overrideReasonZhTw: "",
    ivRecommendationZhTw: "",
    shortIvLabelZhTw: "",
    rulesVersion: IV_RULES_VERSION,
    ...values,
  };
}

/**
 * 通用門檻只描述「已確認具有該用途」的候選選法，不會提升物種本身的保留價值。
 */
export const GLOBAL_IV_RECOMMENDATIONS: readonly IvRecommendation[] = [
  globalRecommendation("PVE", "PVE_ATTACKER", {
    attackIvPriority: 15,
    ivRecommendationZhTw:
      "PvE：先看物種與型態、招式、等級／CP與既有投入，再看攻防耐久斷點，最後才以IV比較同種候選。15攻優先；14攻高整體IV亦可留。不設硬性IV淘汰線。",
    shortIvLabelZhTw: "PvE：15攻優先；14攻高整體IV亦可留",
  }),
  globalRecommendation("MEGA", "MEGA_ATTACKER", {
    attackIvPriority: 15,
    recommendedQuantity: 1,
    ivRecommendationZhTw:
      "Mega／PvE：先看物種、招式、等級／CP與既有投入，再看斷點，最後才以IV比較同種候選。15攻優先；14攻高整體IV亦可留。通常只需保留少量候選。",
    shortIvLabelZhTw: "Mega：15攻優先；14攻高整體IV亦可留",
  }),
  globalRecommendation("MASTER_LEAGUE", "MASTER_LEAGUE", {
    attackIvMin: 15,
    attackIvPriority: 15,
    totalIvPercentMin: 95.6,
    totalIvPercentPriority: 97.8,
    ivRecommendationZhTw:
      "ML：15攻／96%以上為一般候選，15攻／98%以上優先，100%最優先；仍需確認物種特定CMP與攻防門檻。",
    shortIvLabelZhTw: "ML：15攻／98%優先",
  }),
  globalRecommendation("GREAT_LEAGUE", "GREAT_LEAGUE_RANK", {
    pvpRankMax: 100,
    pvpPrMin: 97.5,
    ivRecommendationZhTw:
      "GL：目標物種與型態的個體PvP IV Rank≤100或PR≥97.5%優先；Rank 101～200條件式保留。",
    shortIvLabelZhTw: "GL：Rank≤100",
  }),
  globalRecommendation("ULTRA_LEAGUE", "ULTRA_LEAGUE_RANK", {
    pvpRankMax: 100,
    pvpPrMin: 97.5,
    ivRecommendationZhTw:
      "UL：目標物種與型態的個體PvP IV Rank≤100或PR≥97.5%優先；Rank 101～200條件式保留。",
    shortIvLabelZhTw: "UL：Rank≤100",
  }),
  globalRecommendation("SHADOW_PVE", "SHADOW_PVE", {
    attackIvPriority: 15,
    ivRecommendationZhTw:
      "暗影標準較寬；15攻優先，不設硬性最低IV。高價值暗影不得只因攻擊或總IV偏低而傳送或淨化；只有一隻或取得稀有時原則上至少保留一隻。淨化不可逆。",
    shortIvLabelZhTw: "暗影標準較寬；15攻優先，不設硬性最低IV",
  }),
  globalRecommendation("GYM_DEFENSE", "GYM_DEFENDER", {
    ivRecommendationZhTw: "道館：不設固定IV門檻；同物種比較時再參考既有等級、CP、防禦、HP與總IV。",
    shortIvLabelZhTw: "道館：無固定門檻",
  }),
  globalRecommendation("MAX_ATTACK", "MAX_ATTACKER", {
    maxBattleRole: "ATTACKER",
    attackIvPriority: 15,
    ivRecommendationZhTw: "Max攻擊：15攻優先；不以單一總IV百分比取代攻擊角色判斷。",
    shortIvLabelZhTw: "Max攻擊：15攻優先",
  }),
  globalRecommendation("MAX_TANK", "MAX_TANK", {
    maxBattleRole: "TANK",
    ivRecommendationZhTw: "Max坦克：防禦／HP優先；依實際耐久與物種角色比較，不套攻擊手門檻。",
    shortIvLabelZhTw: "Max坦克：防禦／HP優先",
  }),
  globalRecommendation("MAX_SUPPORT", "MAX_SUPPORT", {
    maxBattleRole: "SUPPORT",
    ivRecommendationZhTw: "Max支援：依物種角色與Max招式設定專屬門檻，不套單一總IV門檻。",
    shortIvLabelZhTw: "Max支援：依角色門檻",
  }),
  globalRecommendation("MAX_FLEX", "MAX_FLEX", {
    maxBattleRole: "FLEX",
    ivRecommendationZhTw: "Max彈性角色：依實際攻擊、坦克或支援任務分開比較。",
    shortIvLabelZhTw: "Max：依角色分開保留",
  }),
  globalRecommendation("GENERAL", "HIGH_GENERAL_IV", {
    totalIvPercentMin: 91.1,
    totalIvPercentPriority: 95.6,
    ivRecommendationZhTw: "只有物種特定規則明確採一般高IV時才套用：96%以上優先，91%以上條件式。",
    shortIvLabelZhTw: "一般：96%+優先",
  }),
  globalRecommendation("EVOLUTION", "CUSTOM", {
    ivRecommendationZhTw: "依目標進化結果的實際用途套用對應聯盟、PvE、Mega或Max門檻。",
    shortIvLabelZhTw: "依目標進化用途",
  }),
] as const;

function assertIv(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0 || value > 15) {
    throw new RangeError(`${field} 必須是 0～15 的整數。`);
  }
}

/** 回傳四捨五入至小數一位的精確比較值，例如 43/45 = 95.6。 */
export function calculateTotalIvPercent(
  attackIv: number,
  defenseIv: number,
  staminaIv: number,
): number {
  assertIv(attackIv, "attackIv");
  assertIv(defenseIv, "defenseIv");
  assertIv(staminaIv, "staminaIv");
  return Math.round((((attackIv + defenseIv + staminaIv) / 45) * 100 + Number.EPSILON) * 10) / 10;
}

/** Pokemon GO 慣用整數顯示，例如 44/45 顯示 98%。 */
export function formatTotalIvPercent(
  attackIv: number,
  defenseIv: number,
  staminaIv: number,
): string {
  return `${Math.round(calculateTotalIvPercent(attackIv, defenseIv, staminaIv))}%`;
}

function result(
  candidate: IvCandidate,
  level: IvCandidateLevel,
  labelZhTw: string,
): IvCandidateEvaluation {
  return {
    level,
    labelZhTw,
    totalIvPercent: calculateTotalIvPercent(
      candidate.attackIv,
      candidate.defenseIv,
      candidate.staminaIv,
    ),
    totalIvPercentLabel: formatTotalIvPercent(
      candidate.attackIv,
      candidate.defenseIv,
      candidate.staminaIv,
    ),
  };
}

function validatePvpCandidate(candidate: IvCandidate) {
  if (
    candidate.pvpIvRank != null &&
    (!Number.isInteger(candidate.pvpIvRank) || candidate.pvpIvRank < 1)
  ) {
    throw new RangeError("pvpIvRank 必須是正整數，且只代表個體 PvP IV Rank。");
  }
  if (candidate.pvpPr != null && (candidate.pvpPr < 0 || candidate.pvpPr > 100)) {
    throw new RangeError("pvpPr 必須介於 0～100。");
  }
}

/**
 * 評估單一個體是否符合已確認用途的 IV 門檻；不產生 KEEP／TRANSFER 決策。
 * `hasRelevantUse=false` 時，即使 100% 也不會成為保留理由。
 */
export function evaluateIvCandidate(
  recommendation: IvRecommendation,
  candidate: IvCandidate,
): IvCandidateEvaluation {
  const total = calculateTotalIvPercent(
    candidate.attackIv,
    candidate.defenseIv,
    candidate.staminaIv,
  );
  if (!candidate.hasRelevantUse) {
    return result(candidate, "NOT_APPLICABLE", "物種本身無此用途，IV不構成保留理由");
  }

  switch (recommendation.ivStrategyKey) {
    case "PVE_ATTACKER":
    case "MEGA_ATTACKER": {
      const prefix = recommendation.ivStrategyKey === "MEGA_ATTACKER" ? "Mega：" : "PvE：";
      if (candidate.attackIv === 15 && total >= 95.6)
        return result(candidate, "PRIORITY", `${prefix}15攻高整體IV為同種長期投資優先`);
      if (candidate.attackIv === 14 && total >= 95.6)
        return result(candidate, "RECOMMENDED", `${prefix}14攻高整體IV亦可留，不得只因非15攻淘汰`);
      return result(
        candidate,
        "CONDITIONAL",
        `${prefix}先比較招式、等級／CP、既有投入與斷點；IV不設硬性淘汰線`,
      );
    }

    case "MASTER_LEAGUE":
      if (candidate.attackIv === 15 && total === 100)
        return result(candidate, "TOP_PRIORITY", "ML：100%優先");
      if (candidate.attackIv === 15 && total >= 97.8)
        return result(candidate, "PRIORITY", "ML：15攻／98%以上優先");
      if (candidate.attackIv === 15 && total >= 95.6)
        return result(candidate, "RECOMMENDED", "ML：15攻／96%以上");
      return result(candidate, "INSUFFICIENT", "ML：未達15攻，需另查CMP與物種攻防門檻");

    case "GREAT_LEAGUE_RANK":
    case "ULTRA_LEAGUE_RANK": {
      validatePvpCandidate(candidate);
      const league = recommendation.ivStrategyKey === "GREAT_LEAGUE_RANK" ? "GL" : "UL";
      // pvpIvRank 是個體排名；RawEvaluationData.rank（物種排名）不得傳入此欄位。
      if (
        (candidate.pvpIvRank != null && candidate.pvpIvRank <= 100) ||
        (candidate.pvpPr != null && candidate.pvpPr >= 97.5)
      ) {
        return result(candidate, "PRIORITY", `${league}：個體Rank≤100優先`);
      }
      if (candidate.pvpIvRank != null && candidate.pvpIvRank <= 200)
        return result(candidate, "CONDITIONAL", `${league}：Rank 101～200條件式`);
      return result(candidate, "INSUFFICIENT", `${league}：不能只靠目前個體Rank保留`);
    }

    case "SHADOW_PVE":
      if (candidate.attackIv === 15) return result(candidate, "PRIORITY", "暗影：15攻優先");
      if (candidate.isRareOrHighValueShadow || candidate.isOnlyAvailableCopy) {
        return result(candidate, "RECOMMENDED", "暗影：高價值、稀有或只有一隻時至少保留一隻");
      }
      return result(candidate, "RECOMMENDED", "暗影：不設硬性最低IV，不得只依IV自動傳送或淨化");

    case "GYM_DEFENDER":
      return result(candidate, "RECOMMENDED", "道館：不設固定IV門檻");

    case "MAX_ATTACKER":
      return candidate.attackIv === 15
        ? result(candidate, "PRIORITY", "Max攻擊：15攻優先")
        : result(candidate, "CONDITIONAL", "Max攻擊：未達15攻，依稀有度與既有投入比較");

    case "MAX_TANK":
      return candidate.defenseIv === 15 && candidate.staminaIv === 15
        ? result(candidate, "PRIORITY", "Max坦克：防禦／HP皆15優先")
        : result(candidate, "RECOMMENDED", "Max坦克：防禦／HP優先，不套攻擊手門檻");

    case "MAX_SUPPORT":
      return result(candidate, "RECOMMENDED", "Max支援：依物種角色與Max招式門檻");

    case "MAX_FLEX":
      return result(candidate, "RECOMMENDED", "Max：依實際角色分開比較IV");

    case "HUNDO_PREFERRED":
      if (total === 100) return result(candidate, "TOP_PRIORITY", "100%最優先");
      if (total >= (recommendation.totalIvPercentMin ?? 97.8))
        return result(candidate, "RECOMMENDED", "接近100%可優先比較");
      return result(candidate, "INSUFFICIENT", "未達物種特定高IV門檻");

    case "HIGH_GENERAL_IV":
      if (total >= (recommendation.totalIvPercentPriority ?? 95.6))
        return result(candidate, "PRIORITY", "96%以上優先");
      if (total >= (recommendation.totalIvPercentMin ?? 91.1))
        return result(candidate, "CONDITIONAL", "91%以上條件式");
      return result(candidate, "INSUFFICIENT", "低於91%，不能只靠總IV保留");

    case "CUSTOM":
      return result(candidate, "RECOMMENDED", recommendation.shortIvLabelZhTw);
  }
}

/**
 * 同一用途採整筆覆寫，不進行欄位級 merge：
 * BattleVariant → PokemonForm → Member → Family → Global。
 */
export function resolveIvRecommendation(
  recommendations: readonly IvRecommendation[],
  context: IvResolutionContext,
  primaryUseKey: PrimaryUseKey,
): IvRecommendation | undefined {
  const memberId = context.memberId ?? context.speciesId;
  const scopes: ReadonlyArray<[IvRecommendationScope, string | null | undefined]> = [
    ["BATTLE_VARIANT", context.battleVariantId],
    ["POKEMON_FORM", context.pokemonFormId],
    ["MEMBER", memberId],
    ["FAMILY", context.familyKey],
  ];

  for (const [scopeType, scopeKey] of scopes) {
    if (!scopeKey) continue;
    const match = recommendations.find(
      (item) =>
        item.primaryUseKey === primaryUseKey &&
        item.scopeType === scopeType &&
        item.scopeKey === scopeKey,
    );
    if (match) return match;
  }

  return recommendations.find(
    (item) => item.primaryUseKey === primaryUseKey && item.scopeType === "GLOBAL",
  );
}

export function getGlobalIvRecommendation(primaryUseKey: PrimaryUseKey) {
  return resolveIvRecommendation(GLOBAL_IV_RECOMMENDATIONS, {}, primaryUseKey);
}
