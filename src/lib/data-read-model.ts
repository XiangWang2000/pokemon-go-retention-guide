import type { RegionKey } from "../data/region-key";
import type {
  IvRecommendationScope,
  IvStrategyKey,
  MaxBattleRole,
  PrimaryUseKey,
} from "../iv/strategy";
import type { AssessmentDisposition, PveUseLevel } from "../rules/battle-assessment";
import type {
  EvaluationDataStatusValue,
  EvaluationProvenanceValue,
  ReleaseStatusValue,
} from "../rules/engine";
import type { RuleDecision } from "../rules/rules";

export type DashboardVariantKey =
  "NORMAL" | "SHADOW" | "PURIFIED" | "MEGA" | "MEGA_X" | "MEGA_Y" | "DYNAMAX" | "GIGANTAMAX";

export type DashboardEvaluationCategory =
  "PVP" | "PVE" | "ROCKET" | "GYM" | "MEGA" | "MAX_BATTLE" | "EVOLUTION_VALUE";

export type DashboardReviewIssueType =
  | "MATERIAL_DATA_GAP"
  | "UNKNOWN_RELEASE_STATUS"
  | "UNREPRODUCIBLE_RANK"
  | "POSSIBLE_SPECIES_MISMATCH"
  | "SOURCE_CONFLICT"
  | "STALE_DATA"
  | "MISSING_PRIMARY_SOURCE"
  | "RULE_NOT_COVERED"
  | "LOW_CONFIDENCE"
  | "OPTIONAL_DATA_MISSING"
  | "MISSING_SOURCE"
  | "STALE_SOURCE"
  | "UNASSESSED_FORM"
  | "UNHANDLED_MOVE"
  | "UNREVIEWED"
  | "LOW_TRUST_SOURCE";

export type DashboardConfidence = "HIGH" | "MEDIUM" | "LOW";
export type DashboardReviewStatus = "NOT_REQUIRED" | "DATA_PENDING" | "RESOLVED";
export type DashboardGymRating = "HIGH" | "MEDIUM" | "LOW" | "SPECIAL_CASE" | "NOT_APPLICABLE";
export type DashboardLeague = "GREAT" | "ULTRA" | "MASTER" | "SPECIAL_CUP" | "NOT_APPLICABLE";
export type DashboardPvpCategory =
  "OVERALL" | "LEAD" | "CLOSER" | "SWITCH" | "CHARGER" | "ATTACKER" | "CONSISTENCY";
export type DashboardRocketRating =
  | "HIGHLY_RECOMMENDED"
  | "USEFUL"
  | "NICHE"
  | "NOT_RECOMMENDED"
  | "DATA_UNAVAILABLE"
  | "NOT_APPLICABLE";
export type DashboardSourceType =
  "OFFICIAL" | "PVP" | "PVE" | "GYM" | "MAX_BATTLE" | "SECONDARY" | "COMMUNITY";
export type DashboardMoveAvailabilityType =
  | "NORMAL"
  | "LEGACY"
  | "EVENT_EVOLUTION"
  | "ELITE_TM"
  | "RAID_EXCLUSIVE"
  | "COMMUNITY_DAY"
  | "UNKNOWN";

export interface DashboardEvolutionPath {
  id: string;
  fromFormId: string;
  toFormId: string;
  requiresEvent: boolean;
  verifiedAt: string | null;
  isEvolutionStub: boolean;
  targetUseLevel: PveUseLevel | null;
  targetNameEn: string;
  targetNameZhTw: string;
}

export interface DashboardReviewIssue {
  id: string;
  issueType: DashboardReviewIssueType;
  messageZhTw: string;
  affectsFinalDecision: boolean;
  provisionalDecision: RuleDecision;
  suggestedResearchActionZhTw: string;
  lastResearchedAt: string | null;
}

export interface DashboardIvRecommendation {
  id: string;
  scopeType: IvRecommendationScope;
  scopeKey: string;
  primaryUseKey: PrimaryUseKey;
  ivStrategyKey: IvStrategyKey;
  maxBattleRole: MaxBattleRole | null;
  attackIvMin: number | null;
  attackIvPriority: number | null;
  attackIvConditionalMin: number | null;
  secondaryAttackIv: number | null;
  defenseIvMin: number | null;
  defenseIvPriority: number | null;
  staminaIvMin: number | null;
  staminaIvPriority: number | null;
  totalIvPercentMin: number | null;
  totalIvPercentPriority: number | null;
  secondaryTotalIvPercentMin: number | null;
  pvpRankMax: number | null;
  pvpRankConditionalMax: number | null;
  pvpPrMin: number | null;
  recommendedQuantity: number | null;
  hundoPriority: boolean;
  appliesOnlyWhenUseConfirmed: boolean;
  speciesSpecificOverride: boolean;
  overrideReasonZhTw: string;
  ivRecommendationZhTw: string;
  shortIvLabelZhTw: string;
  rulesVersion: string;
}

export interface DashboardInheritance {
  inheritsFromVariantId: string | null;
  inheritanceMode: "NONE" | "NORMAL_BASE" | "NORMAL_BASE_WITH_OVERRIDE";
  purificationCostModifier: number | null;
  hasReturnAccess: boolean;
  purificationRiskZhTw: string;
  purifiedOverrideRequired: boolean;
}

export interface DashboardCategorySource {
  id: string;
  title: string;
  url: string;
  usageZhTw: string;
}

export interface DashboardCategoryStatus {
  category: DashboardEvaluationCategory;
  status: EvaluationDataStatusValue;
  provenance: EvaluationProvenanceValue;
  summaryZhTw: string;
  materialToDecision: boolean;
  rocketRating: DashboardRocketRating | null;
  rocketRoles: string[];
  maxTypeRank: number | null;
  maxTypeTier: string | null;
  maxTypeKey: string | null;
  maxOverallRating: string | null;
  maxInvestmentRating: string | null;
  maxUseCaseBreadth: string | null;
  pveUseLevel: PveUseLevel | null;
  assessmentDisposition: AssessmentDisposition | null;
  checkedAt: string;
  sources: DashboardCategorySource[];
}

export interface DashboardRawSource {
  id: string;
  name: string;
  title: string;
  url: string;
}

export interface DashboardRawEvaluation {
  id: string;
  category: DashboardEvaluationCategory;
  status: EvaluationDataStatusValue;
  league: DashboardLeague;
  cup: string | null;
  pvpCategory: DashboardPvpCategory | null;
  speciesKey: string | null;
  formKey: string | null;
  variantKey: DashboardVariantKey | null;
  rank: number | null;
  rating: string | null;
  score: number | null;
  tier: string | null;
  recommendedMoves: string[];
  rawNotes: string;
  seasonOrVersion: string;
  extractionMethod: string | null;
  reproducible: boolean;
  migrationNote: string | null;
  checkedAt: string;
  source: DashboardRawSource;
}

export interface DashboardEvaluationSource {
  id: string;
  name: string;
  title: string;
  url: string;
  type: DashboardSourceType;
  accessedAt: string;
  usageZhTw: string;
}

export interface DashboardRuleTrace {
  ruleKey: string;
  priority: number;
  matched: boolean;
  resultDecision: RuleDecision | null;
  explanationZhTw: string;
}

export interface DashboardMove {
  moveKey: string;
  nameEn: string;
  nameZhTw: string;
  availabilityType: DashboardMoveAvailabilityType;
  sourceNotesZhTw: string;
}

export interface DashboardRow {
  id: string;
  formId: string;
  speciesId: string;
  familyKey: string;
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  evolvesFromFormId: string | null;
  evolutionFamilyNotesZhTw: string;
  evolutionPaths: DashboardEvolutionPath[];
  types: string[];
  aliases: string[];
  evolutionNames: string[];
  variantKey: DashboardVariantKey;
  isReleased: boolean | null;
  releaseStatus: ReleaseStatusValue;
  releaseVerifiedAt: string | null;
  notesZhTw: string;
  decision: RuleDecision;
  assessmentDisposition: AssessmentDisposition;
  provenance: EvaluationProvenanceValue;
  confidence: DashboardConfidence;
  dataStatus: EvaluationDataStatusValue;
  reviewStatus: DashboardReviewStatus;
  reviewIssues: DashboardReviewIssue[];
  missingDataSummaryZhTw: string;
  reviewed: boolean;
  updatedAt: string | null;
  pvpSummaryZhTw: string;
  pveSummaryZhTw: string;
  rocketSummaryZhTw: string;
  gymSummaryZhTw: string;
  gymRating: DashboardGymRating;
  megaSummaryZhTw: string;
  maxBattleSummaryZhTw: string;
  evolutionSummaryZhTw: string;
  requiredMovesSummaryZhTw: string;
  recommendedIvStrategyZhTw: string;
  ivRecommendations: DashboardIvRecommendation[];
  reasonZhTw: string;
  evaluationId: string | null;
  rulesVersion: string;
  reviewNotesZhTw: string;
  inheritance: DashboardInheritance;
  categoryStatuses: DashboardCategoryStatus[];
  raw: DashboardRawEvaluation[];
  sources: DashboardEvaluationSource[];
  traces: DashboardRuleTrace[];
  moves: DashboardMove[];
}
