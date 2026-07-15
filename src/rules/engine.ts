import { retentionRules, RULES_VERSION, type RuleDecision } from "./rules";

export type ReleaseStatusValue = "RELEASED" | "UNRELEASED" | "UNKNOWN";
export type EvaluationDataStatusValue =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "UNRANKED"
  | "NOT_APPLICABLE"
  | "DATA_UNAVAILABLE"
  | "SOURCE_MISSING"
  | "SOURCE_CONFLICT"
  | "UNRELEASED"
  | "UNKNOWN_RELEASE_STATUS";
export type MaterialCategory = "PVP" | "PVE" | "MEGA" | "MAX_BATTLE" | "EVOLUTION_VALUE";

export interface EvaluationFacts {
  releaseStatus?: ReleaseStatusValue;
  categoryStatuses?: Partial<
    Record<MaterialCategory | "ROCKET" | "GYM", EvaluationDataStatusValue>
  >;
  materialCategories?: MaterialCategory[];
  hasUnreproducibleCriticalRank?: boolean;
  possibleSpeciesMismatch?: boolean;
  ruleCovered?: boolean;
  hasOptionalDataGap?: boolean;
  hasStaleNonCriticalData?: boolean;
  hasReliableSources: boolean;
  releaseStatusKnown: boolean;
  hasSourceConflict: boolean;
  hasStaleCriticalData: boolean;
  majorPvpValue: boolean;
  highPveValue: boolean;
  shadowPveAdvantage: boolean;
  importantMega: boolean;
  importantMaxBattle: boolean;
  highGymValue: boolean;
  valuableEvolution: boolean;
  specialCupOnly: boolean;
  requiresSpecificMove: boolean;
  requiresSpecificIv: boolean;
  megaCandidateOnly: boolean;
  maxCandidateOnly: boolean;
  limitedGymUse: boolean;
  maxTypeSpecialistOnly?: boolean;
  speciesBattleValueLow: boolean;
  normalHighIvOnly?: boolean;
  purificationRisk?: boolean;
  unusualPvpIvProfile?: "WYNAUT_OR_WOBBUFFET" | "LEDIAN" | null;
}

export interface RuleTrace {
  ruleKey: string;
  priority: number;
  matched: boolean;
  resultDecision: RuleDecision | null;
  explanationZhTw: string;
}

export interface EngineResult {
  decision: RuleDecision;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasonZhTw: string;
  recommendedIvStrategyZhTw: string;
  rulesVersion: string;
  traces: RuleTrace[];
  materialDataGap: boolean;
}

const blockingStatuses = new Set<EvaluationDataStatusValue>([
  "SOURCE_MISSING",
  "SOURCE_CONFLICT",
  "UNKNOWN_RELEASE_STATUS",
]);

export function hasMaterialDataGap(facts: EvaluationFacts) {
  if (facts.releaseStatus === "UNKNOWN") return true;
  if (
    facts.possibleSpeciesMismatch ||
    facts.hasUnreproducibleCriticalRank ||
    facts.ruleCovered === false
  )
    return true;
  if (facts.categoryStatuses && facts.materialCategories) {
    return facts.materialCategories.some((category) =>
      blockingStatuses.has(facts.categoryStatuses?.[category] ?? "SOURCE_MISSING"),
    );
  }
  return (
    !facts.hasReliableSources ||
    !facts.releaseStatusKnown ||
    facts.hasSourceConflict ||
    facts.hasStaleCriticalData
  );
}

export function canGenerateRetentionDecision(facts: EvaluationFacts) {
  return !hasMaterialDataGap(facts);
}

export function calculateConfidence(
  facts: EvaluationFacts,
  decision: RuleDecision,
): "HIGH" | "MEDIUM" | "LOW" {
  if (decision === "NEEDS_REVIEW" || hasMaterialDataGap(facts)) return "LOW";
  const statuses = Object.values(facts.categoryStatuses ?? {});
  if (
    facts.hasOptionalDataGap ||
    facts.hasStaleNonCriticalData ||
    statuses.some((status) => status === "PARTIALLY_VERIFIED" || status === "DATA_UNAVAILABLE")
  )
    return "MEDIUM";
  if (
    facts.releaseStatus !== "UNKNOWN" &&
    statuses.every((status) =>
      ["VERIFIED", "UNRANKED", "NOT_APPLICABLE", "UNRELEASED"].includes(status),
    )
  )
    return "HIGH";
  return "LOW";
}

function ivRecommendation(facts: EvaluationFacts, decision: RuleDecision) {
  if (facts.unusualPvpIvProfile) {
    return "此物種可能需要偏高甚至接近滿 IV；請以該物種、型態、進化結果及指定聯盟的實際 PvP IV Rank 為準。";
  }
  if (facts.purificationRisk) {
    return "淨化會不可逆地失去暗影型態；只有報恩、成本或特定 IV 門檻確實改善用途時才考慮淨化。";
  }
  if (facts.importantMega || facts.megaCandidateOnly) {
    return "只需保留一隻高 IV／15 攻作為 Mega 候選，並確認必要特殊招式；不建議因此囤積大量普通個體。";
  }
  if (facts.shadowPveAdvantage) {
    return "優先保留暗影高攻個體並確認遷怒處理時機；淨化不可逆，請勿無條件淨化。";
  }
  if (facts.majorPvpValue || facts.specialCupOnly || facts.requiresSpecificIv) {
    return "超級／高級聯盟通常優先低攻高防高 HP，但不得固定套用 0/15/15；請查該物種與聯盟的實際 PvP IV Rank。";
  }
  if (facts.highPveValue || facts.importantMaxBattle) {
    return "優先正確招式、攻擊 IV 與整體 IV；高 IV 只有在物種本身具有戰鬥價值時才構成保留理由。";
  }
  if (decision === "TRANSFER_CANDIDATE") {
    return "普通高 IV 不會自動改變此物種目前的低戰鬥價值；收藏價值請另行判斷。";
  }
  return "資料不足，暫不提供具體 IV 保留門檻。";
}

export function evaluateRetention(facts: EvaluationFacts): EngineResult {
  const materialDataGap = hasMaterialDataGap(facts);
  const unreleased = facts.releaseStatus === "UNRELEASED";
  const major =
    facts.majorPvpValue ||
    facts.highPveValue ||
    facts.shadowPveAdvantage ||
    facts.importantMega ||
    facts.importantMaxBattle ||
    facts.highGymValue;
  const conditional = Boolean(
    facts.specialCupOnly ||
    facts.requiresSpecificMove ||
    facts.requiresSpecificIv ||
    facts.megaCandidateOnly ||
    facts.maxCandidateOnly ||
    facts.limitedGymUse ||
    facts.maxTypeSpecialistOnly,
  );

  const matchByKey: Record<string, boolean> = {
    MATERIAL_DATA_GAP: materialDataGap,
    UNRELEASED_VARIANT: unreleased && !materialDataGap,
    MAJOR_BATTLE_VALUE: major && !unreleased,
    VALUABLE_EVOLUTION: facts.valuableEvolution && !unreleased,
    CONDITIONAL_USE: conditional && !unreleased,
    LOW_GENERAL_VALUE:
      facts.speciesBattleValueLow && !major && !facts.valuableEvolution && !conditional,
  };
  const traces = retentionRules.map((rule) => ({
    ruleKey: rule.ruleKey,
    priority: rule.priority,
    matched: rule.enabled && Boolean(matchByKey[rule.ruleKey]),
    resultDecision: rule.enabled && matchByKey[rule.ruleKey] ? rule.resultingDecision : null,
    explanationZhTw: rule.condition,
  }));
  const matched = retentionRules
    .filter((rule) => rule.enabled && matchByKey[rule.ruleKey])
    .sort((a, b) => b.priority - a.priority)[0];
  const decision = matched?.resultingDecision ?? "NEEDS_REVIEW";
  return {
    decision,
    confidence: calculateConfidence(facts, decision),
    reasonZhTw: matched?.reasonTemplateZhTw ?? "規則引擎沒有覆蓋目前資料組合，必須進入人工審核。",
    recommendedIvStrategyZhTw: ivRecommendation(facts, decision),
    rulesVersion: RULES_VERSION,
    traces,
    materialDataGap,
  };
}
