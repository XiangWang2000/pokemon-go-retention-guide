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
  | "POSSIBLE_SPECIES_MISMATCH"
  | "STALE"
  | "UNRELEASED"
  | "UNKNOWN_RELEASE_STATUS";
export type MaterialCategory = "PVP" | "PVE" | "MEGA" | "MAX_BATTLE" | "EVOLUTION_VALUE";
export type EvaluationProvenanceValue =
  "SOURCE_VERIFIED" | "MANUAL_CURATED" | "INHERITED" | "DATA_UNAVAILABLE";

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
  decisionProvenance?: EvaluationProvenanceValue;
  hasReliableQualitativeAssessment?: boolean;
  hasManualCuratedConclusion?: boolean;
  hasUnresolvedDecisionConflict?: boolean;
  hasUnconfirmedImportantMegaOrMaxOrEvolution?: boolean;
  hasUncertainRequiredMoveImpact?: boolean;
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
  finalDecision: RuleDecision;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasonZhTw: string;
  recommendedIvStrategyZhTw: string;
  rulesVersion: string;
  traces: RuleTrace[];
  materialUncertainty: boolean;
}

const materialGapStatuses = new Set<EvaluationDataStatusValue>([
  "SOURCE_CONFLICT",
  "POSSIBLE_SPECIES_MISMATCH",
  "UNKNOWN_RELEASE_STATUS",
  "STALE",
]);

export function hasEnoughEvidenceForKeep(facts: EvaluationFacts) {
  return Boolean(
    facts.majorPvpValue ||
    facts.highPveValue ||
    facts.shadowPveAdvantage ||
    facts.importantMega ||
    facts.importantMaxBattle ||
    facts.highGymValue ||
    facts.valuableEvolution ||
    facts.specialCupOnly ||
    facts.requiresSpecificMove ||
    facts.requiresSpecificIv ||
    facts.megaCandidateOnly ||
    facts.maxCandidateOnly ||
    facts.limitedGymUse ||
    facts.maxTypeSpecialistOnly,
  );
}

export function hasEnoughEvidenceForTransfer(facts: EvaluationFacts) {
  if (facts.releaseStatus === "UNRELEASED") return true;
  return Boolean(
    facts.releaseStatusKnown &&
    facts.speciesBattleValueLow &&
    !hasEnoughEvidenceForKeep(facts) &&
    !facts.hasUnresolvedDecisionConflict &&
    !facts.hasSourceConflict &&
    !facts.possibleSpeciesMismatch &&
    facts.ruleCovered !== false &&
    !facts.hasStaleCriticalData &&
    (facts.hasReliableSources ||
      facts.hasReliableQualitativeAssessment ||
      facts.hasManualCuratedConclusion ||
      facts.decisionProvenance === "MANUAL_CURATED" ||
      facts.decisionProvenance === "INHERITED"),
  );
}

export function hasMaterialUncertainty(facts: EvaluationFacts) {
  if (facts.releaseStatus === "UNKNOWN" || !facts.releaseStatusKnown) return true;
  if (facts.possibleSpeciesMismatch || facts.ruleCovered === false) return true;
  if (facts.hasUnresolvedDecisionConflict || facts.hasSourceConflict) return true;
  if (facts.hasStaleCriticalData) return true;
  if (facts.hasUnconfirmedImportantMegaOrMaxOrEvolution) return true;
  if (facts.hasUncertainRequiredMoveImpact) return true;

  const statuses = (facts.materialCategories ?? []).map(
    (category) => facts.categoryStatuses?.[category] ?? "SOURCE_MISSING",
  );
  if (statuses.some((status) => materialGapStatuses.has(status))) return true;

  const hasActionableEvidence =
    hasEnoughEvidenceForKeep(facts) || hasEnoughEvidenceForTransfer(facts);
  if (!hasActionableEvidence && facts.hasUnreproducibleCriticalRank) return true;
  if (
    !hasActionableEvidence &&
    statuses.some((status) => ["SOURCE_MISSING", "DATA_UNAVAILABLE"].includes(status))
  ) {
    return true;
  }
  return false;
}

export function shouldHoldForNow(facts: EvaluationFacts) {
  return facts.releaseStatus !== "UNRELEASED" && hasMaterialUncertainty(facts);
}

export function calculateDecisionConfidence(
  facts: EvaluationFacts,
  finalDecision: RuleDecision,
): "HIGH" | "MEDIUM" | "LOW" {
  if (finalDecision === "HOLD_FOR_NOW") return "LOW";
  if (
    facts.hasOptionalDataGap ||
    facts.hasStaleNonCriticalData ||
    facts.decisionProvenance === "MANUAL_CURATED" ||
    facts.decisionProvenance === "INHERITED" ||
    !facts.hasReliableSources ||
    Object.values(facts.categoryStatuses ?? {}).some((status) =>
      ["PARTIALLY_VERIFIED", "UNRANKED", "DATA_UNAVAILABLE", "SOURCE_MISSING"].includes(status),
    )
  ) {
    return "MEDIUM";
  }
  return "HIGH";
}

function holdReasonZhTw(facts: EvaluationFacts) {
  if (facts.releaseStatus === "UNKNOWN" || !facts.releaseStatusKnown) {
    return "此戰鬥版本是否已在 Pokémon GO 推出仍無法確認；若實際已推出，可能具有獨立用途。傳送不可逆，確認前建議暫時保留。";
  }
  if (facts.possibleSpeciesMismatch) {
    return "現有來源可能對應到錯誤物種或型態，無法安全套用用途判斷。傳送不可逆，確認來源物種前建議暫時保留。";
  }
  if (facts.hasUnresolvedDecisionConflict || facts.hasSourceConflict) {
    return "關鍵 PvP、PvE 或特殊版本資料互相衝突，差異可能改變保留結論。傳送不可逆，釐清來源前建議暫時保留。";
  }
  if (facts.hasUnconfirmedImportantMegaOrMaxOrEvolution) {
    return "Mega、Max Battle 或後續進化用途仍有關鍵未確認項目，補齊後可能改變保留建議。傳送不可逆，目前建議暫時保留。";
  }
  if (facts.hasUncertainRequiredMoveImpact) {
    return "尚無法確認限定招式是否會改變主要用途。傳送不可逆，確認招式狀態前建議暫時保留。";
  }
  if (facts.hasStaleCriticalData) {
    return "可左右保留結論的核心資料已過期，無法確認目前環境是否仍適用。傳送不可逆，更新資料前建議暫時保留。";
  }
  if (facts.ruleCovered === false) {
    return "此特殊型態尚未被現行規則完整處理，系統無法安全判定其用途。傳送不可逆，補齊規則前建議暫時保留。";
  }
  return "目前缺少可能改變主要用途判斷的關鍵證據，尚不足以安全建議傳送。傳送不可逆，資料補齊前建議暫時保留。";
}

function recommendedIvStrategy(facts: EvaluationFacts, finalDecision: RuleDecision) {
  if (finalDecision === "HOLD_FOR_NOW") return "先保留一隻代表個體；資料補齊前不要大量投入資源。";
  if (facts.unusualPvpIvProfile === "WYNAUT_OR_WOBBUFFET") {
    return "低最大CP例外：接近100%優先；仍以指定聯盟、型態與等級上限的個體PvP IV Rank為準。";
  }
  if (facts.unusualPvpIvProfile === "LEDIAN") {
    return "不要套用固定0/15/15；指定聯盟的個體PvP IV Rank≤100或PR≥97.5%優先。";
  }
  if (facts.shadowPveAdvantage)
    return "暗影：攻擊13以上建議保留，15攻優先；攻擊10～12依稀有度與替代品條件式保留。";
  if (facts.importantMega || facts.megaCandidateOnly)
    return "Mega：15攻／96%以上優先，15攻／91%以上可先留；通常只需一隻主要候選。";
  if (facts.importantMaxBattle || facts.maxCandidateOnly)
    return "只保留可極巨化／超極巨化版本；攻擊手15攻優先，坦克看防禦／HP，支援依物種門檻。";
  if (facts.majorPvpValue || facts.specialCupOnly || facts.requiresSpecificIv) {
    return "GL／UL個體PvP IV Rank≤100或PR≥97.5%優先；ML以15攻／98%以上優先。只有物種有用途時門檻才生效。";
  }
  if (facts.valuableEvolution)
    return "依目標進化結果挑選：GL／UL看個體Rank≤100；PvE／Mega以15攻／96%以上優先；Max依角色分開。";
  if (facts.highPveValue) return "PvE：15攻／96%以上優先；15攻／91%以上可留；14攻／96%以上為次選。";
  if (facts.limitedGymUse || facts.highGymValue)
    return "道館不設固定IV門檻；同物種比較時優先已高等級、高CP及較高防禦／HP的個體。";
  if (finalDecision === "TRANSFER_CANDIDATE")
    return "即使100%，也不能在物種缺乏戰鬥用途時單靠IV成為保留理由。";
  return "目前沒有會改變保留結論的通用IV門檻。";
}

function matches(ruleKey: string, facts: EvaluationFacts) {
  switch (ruleKey) {
    case "MATERIAL_UNCERTAINTY":
      return shouldHoldForNow(facts);
    case "UNRELEASED_VARIANT":
      return facts.releaseStatus === "UNRELEASED";
    case "MAJOR_BATTLE_VALUE":
      return Boolean(
        facts.majorPvpValue ||
        facts.highPveValue ||
        facts.shadowPveAdvantage ||
        facts.importantMega ||
        facts.importantMaxBattle ||
        facts.highGymValue,
      );
    case "VALUABLE_EVOLUTION":
      return facts.valuableEvolution;
    case "CONDITIONAL_USE":
      return Boolean(
        facts.specialCupOnly ||
        facts.requiresSpecificMove ||
        facts.requiresSpecificIv ||
        facts.megaCandidateOnly ||
        facts.maxCandidateOnly ||
        facts.limitedGymUse ||
        facts.maxTypeSpecialistOnly,
      );
    case "LOW_GENERAL_VALUE":
      return hasEnoughEvidenceForTransfer(facts);
    default:
      return false;
  }
}

export function evaluateRetention(facts: EvaluationFacts): EngineResult {
  const enabled = retentionRules
    .filter((rule) => rule.enabled)
    .sort((a, b) => b.priority - a.priority);
  const matched = enabled.find((rule) => matches(rule.ruleKey, facts));
  const finalDecision = matched?.resultingDecision ?? "HOLD_FOR_NOW";
  const materialUncertainty = hasMaterialUncertainty(facts);
  const reasonZhTw =
    finalDecision === "HOLD_FOR_NOW"
      ? holdReasonZhTw(facts)
      : (matched?.reasonTemplateZhTw ?? "規則尚未涵蓋此情況；傳送不可逆，目前建議暫時保留。");

  return {
    finalDecision,
    confidence: calculateDecisionConfidence(facts, finalDecision),
    reasonZhTw,
    recommendedIvStrategyZhTw: recommendedIvStrategy(facts, finalDecision),
    rulesVersion: RULES_VERSION,
    materialUncertainty,
    traces: enabled.map((rule) => ({
      ruleKey: rule.ruleKey,
      priority: rule.priority,
      matched: rule.ruleKey === matched?.ruleKey,
      resultDecision: rule.ruleKey === matched?.ruleKey ? rule.resultingDecision : null,
      explanationZhTw:
        rule.ruleKey === matched?.ruleKey ? `符合：${rule.condition}` : `不符合：${rule.condition}`,
    })),
  };
}
