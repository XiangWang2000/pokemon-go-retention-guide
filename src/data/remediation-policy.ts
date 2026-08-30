import type { EvaluationDataStatusValue } from "@/rules/engine";

export type RemediationReleaseStatus = "RELEASED" | "UNRELEASED" | "UNKNOWN";

export function resolveReleaseStatus(
  officialStatus: RemediationReleaseStatus | null | undefined,
): RemediationReleaseStatus {
  return officialStatus ?? "UNKNOWN";
}

export function resolveCategoryProvenance(input: {
  status: EvaluationDataStatusValue;
  explicit?: "SOURCE_VERIFIED" | "MANUAL_CURATED" | "INHERITED" | "DATA_UNAVAILABLE";
  linkedSourceCount: number;
}) {
  if (input.explicit) return input.explicit;
  if (["DATA_UNAVAILABLE", "SOURCE_MISSING", "UNKNOWN_RELEASE_STATUS"].includes(input.status)) {
    return "DATA_UNAVAILABLE" as const;
  }
  return input.linkedSourceCount > 0 ? ("SOURCE_VERIFIED" as const) : ("MANUAL_CURATED" as const);
}

export function stableReviewIssueKey(input: {
  type: string;
  category?: string | null;
  categories?: readonly string[];
}) {
  const scope = input.category
    ? `category-${input.category}`
    : input.categories?.length
      ? `categories-${[...new Set(input.categories)].sort().join("-")}`
      : "variant";
  return `${input.type}-${scope}`;
}

export interface PvpRankInput {
  league?: string;
  cup?: string;
  category?: string;
  seasonOrVersion?: string;
  speciesKey?: string;
  formKey?: string;
  variantKey?: string;
  rank?: number | null;
  sourceUrl?: string;
  checkedAt?: Date | string;
  extractionMethod?: string;
  reproducible?: boolean;
}

export function normalizePvpRank(input: PvpRankInput) {
  const required = [
    input.league,
    input.cup,
    input.category,
    input.seasonOrVersion,
    input.speciesKey,
    input.formKey,
    input.variantKey,
    input.sourceUrl,
    input.checkedAt,
    input.extractionMethod,
  ];
  const valid =
    input.rank !== null &&
    input.rank !== undefined &&
    input.rank > 0 &&
    input.reproducible === true &&
    required.every(Boolean);
  return {
    rank: valid ? input.rank! : null,
    status: (valid ? "VERIFIED" : "SOURCE_MISSING") as EvaluationDataStatusValue,
  };
}

export function pvpCategoryCanPopulateOverall(category: string | null | undefined) {
  return category === "OVERALL";
}

export function unknownReleaseIssueDetails(variantKey: string) {
  const affectsFamily =
    variantKey === "NORMAL" || variantKey.startsWith("MEGA") || variantKey === "GIGANTAMAX";
  const scopedVariantLabel =
    variantKey === "PURIFIED" ? "淨化" : variantKey === "SHADOW" ? "暗影" : "戰鬥";
  return {
    affectsFamily,
    messageZhTw: affectsFamily
      ? "此版本是否已在 Pokémon GO 推出仍無法由可靠原始來源確認，可能影響家族總結。"
      : `此${scopedVariantLabel}版本是否已推出仍待確認；僅影響此版本，不影響家族總結。`,
  } as const;
}

export interface PokebattlerIdentity {
  speciesKey: string;
  formKey: string;
  variantKey: string;
  fastMoveKey: string;
  chargedMoveKey: string;
  bossKey: string;
  simulationLevel: string;
  weather: string;
  friendship: string;
  rankingMethod: string;
}

export function pokebattlerIdentityKey(value: PokebattlerIdentity) {
  return [
    value.speciesKey,
    value.formKey,
    value.variantKey,
    value.fastMoveKey,
    value.chargedMoveKey,
    value.bossKey,
    value.simulationLevel,
    value.weather,
    value.friendship,
    value.rankingMethod,
  ].join("|");
}

export interface PurifiedInheritanceInput {
  normalStatus: EvaluationDataStatusValue;
  overrideStatus?: EvaluationDataStatusValue | null;
  hasReturnUse?: boolean;
  shadowHasHighValue?: boolean;
}

export function resolvePurifiedInheritance(input: PurifiedInheritanceInput) {
  const overrideRequired = Boolean(input.hasReturnUse || input.shadowHasHighValue);
  return {
    status: input.overrideStatus ?? input.normalStatus,
    inheritanceMode: overrideRequired ? "NORMAL_BASE_WITH_OVERRIDE" : "NORMAL_BASE",
    overrideRequired,
    riskZhTw: input.shadowHasHighValue
      ? "淨化不可逆，且會失去此暗影型態的主要戰鬥價值。"
      : "淨化不可逆；應同時評估報恩、成本與 IV 變化。",
  } as const;
}

export function splitMaxEvaluation(input: {
  maxTypeRank: number | null;
  maxTypeTier: string | null;
  maxTypeKey: string | null;
  maxOverallRating: string | null;
  maxInvestmentRating: string | null;
  maxUseCaseBreadth: string | null;
}) {
  return {
    ...input,
    sourceConflict: false,
    typeSpecialistOnly:
      input.maxTypeRank !== null &&
      input.maxTypeRank <= 3 &&
      ["LOW", "LIMITED"].includes(input.maxInvestmentRating ?? ""),
  };
}
