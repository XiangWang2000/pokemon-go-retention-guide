export const pveUseLevels = [
  "CORE_INVESTMENT",
  "USABLE_OR_BUDGET",
  "SPECIAL_USE",
  "NO_SIGNIFICANT_USE",
] as const;

export type PveUseLevel = (typeof pveUseLevels)[number];

export const assessmentDispositions = [
  "CLEAR_USE",
  "LIMITED_USE",
  "NO_SIGNIFICANT_USE",
  "NOT_APPLICABLE_OR_UNRELEASED",
  "TRUE_DATA_PENDING",
] as const;

export type AssessmentDisposition = (typeof assessmentDispositions)[number];

export const pveUseLevelLabelZhTw: Record<PveUseLevel, string> = {
  CORE_INVESTMENT: "核心投資",
  USABLE_OR_BUDGET: "可用／預算型",
  SPECIAL_USE: "特殊用途",
  NO_SIGNIFICANT_USE: "無顯著用途",
};

export const assessmentDispositionLabelZhTw: Record<AssessmentDisposition, string> = {
  CLEAR_USE: "已有明確用途",
  LIMITED_USE: "用途有限",
  NO_SIGNIFICANT_USE: "無顯著用途",
  NOT_APPLICABLE_OR_UNRELEASED: "不適用／尚未推出",
  TRUE_DATA_PENDING: "真正待補資料",
};

export interface BattleUseEvidence {
  pveTiers?: Array<string | null | undefined>;
  pveRanks?: Array<number | null | undefined>;
  hasDirectPveEvidence?: boolean;
  hasDirectMajorPveValue?: boolean;
  hasShadowPveValue?: boolean;
  hasMegaPveValue?: boolean;
  hasMaxPveValue?: boolean;
  hasPvpValue?: boolean;
  hasGymValue?: boolean;
  hasLaterEvolutionValue?: boolean;
  laterEvolutionLevel?: PveUseLevel;
  hasSpecialAcquisition?: boolean;
  isReleased?: boolean;
  releaseStatus?: "RELEASED" | "UNRELEASED" | "UNKNOWN";
  hasTrueDataGap?: boolean;
}

const coreTiers = new Set(["SS", "S+", "S", "A+", "A", "TOP", "CORE"]);
const usableTiers = new Set(["B+", "B", "BUDGET_ONLY", "USABLE", "VIABLE"]);
const specialTiers = new Set(["LIMITED", "SPECIAL", "NICHE", "NARROW", "SPECIAL_CASE"]);
const noUseTiers = new Set(["C", "D", "F", "LOW", "NOT_RANKED", "NONE", "NO_USE"]);

function normalizedTier(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "_");
}

function bestTierLevel(tiers: Array<string | null | undefined>) {
  const normalized = tiers.map(normalizedTier).filter(Boolean);
  if (normalized.some((tier) => coreTiers.has(tier))) return "CORE_INVESTMENT" as const;
  if (normalized.some((tier) => usableTiers.has(tier))) return "USABLE_OR_BUDGET" as const;
  if (normalized.some((tier) => specialTiers.has(tier))) return "SPECIAL_USE" as const;
  if (normalized.some((tier) => noUseTiers.has(tier))) return "NO_SIGNIFICANT_USE" as const;
  return null;
}

function rankLevel(ranks: Array<number | null | undefined>) {
  const usable = ranks.filter((rank): rank is number => typeof rank === "number");
  if (!usable.length) return null;
  const best = Math.min(...usable);
  if (best <= 10) return "CORE_INVESTMENT" as const;
  if (best <= 100) return "USABLE_OR_BUDGET" as const;
  if (best <= 250) return "SPECIAL_USE" as const;
  return "NO_SIGNIFICANT_USE" as const;
}

const levelWeight: Record<PveUseLevel, number> = {
  NO_SIGNIFICANT_USE: 0,
  SPECIAL_USE: 1,
  USABLE_OR_BUDGET: 2,
  CORE_INVESTMENT: 3,
};

export function strongestPveUseLevel(levels: Array<PveUseLevel | null | undefined>) {
  return (
    levels
      .filter((level): level is PveUseLevel => Boolean(level))
      .sort((a, b) => levelWeight[b] - levelWeight[a])[0] ?? "NO_SIGNIFICANT_USE"
  );
}

export function classifyPveUse(evidence: BattleUseEvidence): PveUseLevel {
  if (evidence.hasDirectMajorPveValue || evidence.hasShadowPveValue || evidence.hasMegaPveValue) {
    return "CORE_INVESTMENT";
  }

  const directLevel = strongestPveUseLevel([
    bestTierLevel(evidence.pveTiers ?? []),
    rankLevel(evidence.pveRanks ?? []),
  ]);
  if (directLevel !== "NO_SIGNIFICANT_USE") return directLevel;

  if (evidence.hasMaxPveValue || evidence.hasGymValue || evidence.hasPvpValue) {
    return "SPECIAL_USE";
  }
  if (evidence.hasLaterEvolutionValue) {
    return evidence.laterEvolutionLevel ?? "SPECIAL_USE";
  }
  if (evidence.hasSpecialAcquisition) return "SPECIAL_USE";
  return "NO_SIGNIFICANT_USE";
}

export function classifyAssessmentDisposition(input: {
  releaseStatus?: "RELEASED" | "UNRELEASED" | "UNKNOWN";
  pveUseLevel: PveUseLevel;
  hasAnyActionableUse: boolean;
  hasTrueDataGap?: boolean;
}): AssessmentDisposition {
  if (input.releaseStatus === "UNRELEASED") return "NOT_APPLICABLE_OR_UNRELEASED";
  if (input.hasTrueDataGap || (input.releaseStatus === "UNKNOWN" && !input.hasAnyActionableUse)) {
    return "TRUE_DATA_PENDING";
  }
  if (input.hasAnyActionableUse) {
    return input.pveUseLevel === "CORE_INVESTMENT" ? "CLEAR_USE" : "LIMITED_USE";
  }
  return "NO_SIGNIFICANT_USE";
}

export function isTrueDataPending(disposition: AssessmentDisposition | null | undefined) {
  return disposition === "TRUE_DATA_PENDING";
}

export function missingDataSummaryZhTw(disposition: AssessmentDisposition) {
  switch (disposition) {
    case "CLEAR_USE":
      return "已有明確用途；次要欄位缺資料不覆蓋目前保留結論。";
    case "LIMITED_USE":
      return "用途有限或需特定版本／進化／招式；只保留符合條件的少量候選。";
    case "NO_SIGNIFICANT_USE":
      return "已有足夠資料判定目前無顯著用途；一般重複個體通常可傳送。";
    case "NOT_APPLICABLE_OR_UNRELEASED":
      return "此欄位不適用或版本尚未推出，不把它當成現有個體的待補資料。";
    case "TRUE_DATA_PENDING":
      return "無法判斷，暫時不要傳。";
  }
}
