import { getGen4BatchDefinition } from "./batch-gen4";
import type {
  Gen4BatchDefinition,
  Gen4BatchForm,
  Gen4MaxEvidence,
  Gen4PveEvidence,
  Gen4VariantKey,
} from "./batch-gen4-types";

export type { Gen4VariantKey as Gen4PlanVariantKey } from "./batch-gen4-types";
export type Gen4PlanDecision = "KEEP" | "CONDITIONAL_KEEP" | "TRANSFER_CANDIDATE";
export type Gen4PlanDisposition =
  "CLEAR_USE" | "LIMITED_USE" | "NO_SIGNIFICANT_USE" | "NOT_APPLICABLE_OR_UNRELEASED";
export type Gen4PlanLeague = "GREAT" | "ULTRA" | "MASTER";

export type Gen4PvpRankingRow = {
  speciesId: string;
  rating?: number;
  moveset?: string[];
};

export type Gen4PlanRank = {
  league: Gen4PlanLeague;
  speciesId: string;
  rank: number;
  rating: number | null;
  moves: string[];
};

export type Gen4RankingSnapshots = Readonly<Record<Gen4PlanLeague, readonly Gen4PvpRankingRow[]>>;

export type Gen4ImportPlanRow = {
  id: string;
  formId: string;
  dexNumber: number;
  variantKey: Gen4VariantKey;
  released: boolean;
  releaseStatus: "RELEASED" | "UNRELEASED";
  ranks: Gen4PlanRank[];
  bestPvpRank: number | null;
  pveEvidence: Gen4PveEvidence | null;
  maxEvidence: Gen4MaxEvidence | null;
  initialDecision: Gen4PlanDecision;
  initialDisposition: Gen4PlanDisposition;
};

const leagues = ["GREAT", "ULTRA", "MASTER"] as const;
const baseVariantKeys = ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const;

function variantReleased(
  definition: Gen4BatchDefinition,
  formId: string,
  variantKey: Gen4VariantKey,
) {
  if (variantKey === "NORMAL") return definition.releasedNormalForms.has(formId);
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return definition.releasedShadowForms.has(formId);
  }
  if (variantKey === "DYNAMAX") return definition.releasedDynamaxForms.has(formId);
  if (variantKey === "MEGA") return definition.releasedMegaForms.has(formId);
  return definition.releasedGigantamaxForms.has(formId);
}

function findRanks(
  definition: Gen4BatchDefinition,
  form: Gen4BatchForm,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Gen4RankingSnapshots,
): Gen4PlanRank[] {
  const speciesId = definition.pvpokeSpeciesId(form, variantKey === "SHADOW");
  return leagues.flatMap((league) => {
    const rows = rankings[league];
    const index = rows.findIndex((row) => row.speciesId === speciesId);
    if (index < 0) return [];
    const row = rows[index]!;
    return [
      {
        league,
        speciesId,
        rank: index + 1,
        rating: row.rating ?? null,
        moves: row.moveset ?? [],
      },
    ];
  });
}

function initialDecision(
  released: boolean,
  variantKey: Gen4VariantKey,
  bestPvpRank: number | null,
  pveEvidence: Gen4PveEvidence | null,
  maxEvidence: Gen4MaxEvidence | null,
): Gen4PlanDecision {
  if (!released) return "TRANSFER_CANDIDATE";
  if (
    pveEvidence?.level === "CORE_INVESTMENT" ||
    maxEvidence?.level === "CORE_INVESTMENT" ||
    (bestPvpRank !== null && bestPvpRank <= 100)
  ) {
    return "KEEP";
  }
  if (
    pveEvidence !== null ||
    maxEvidence !== null ||
    (bestPvpRank !== null && bestPvpRank <= 250) ||
    variantKey === "MEGA"
  ) {
    return "CONDITIONAL_KEEP";
  }
  return "TRANSFER_CANDIDATE";
}

function initialDisposition(decision: Gen4PlanDecision, released: boolean): Gen4PlanDisposition {
  if (!released) return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

export function buildGen4ImportPlan(
  definition: Gen4BatchDefinition,
  rankings: Gen4RankingSnapshots,
): Gen4ImportPlanRow[] {
  const rows: Gen4ImportPlanRow[] = definition.forms.flatMap((form) => {
    if (form.includeVariants === false || form.isStub) return [];
    return baseVariantKeys.map((variantKey) => {
      const id = `${form.id}-${variantKey.toLowerCase()}`;
      const released = variantReleased(definition, form.id, variantKey);
      const ranks =
        released && (variantKey === "NORMAL" || variantKey === "SHADOW")
          ? findRanks(definition, form, variantKey, rankings)
          : [];
      const bestPvpRank = ranks.length ? Math.min(...ranks.map((rank) => rank.rank)) : null;
      const pveEvidence = definition.pveEvidenceForVariant(id);
      const maxEvidence = definition.maxEvidenceForVariant(id);
      const decision = initialDecision(
        released,
        variantKey,
        bestPvpRank,
        pveEvidence,
        maxEvidence,
      );
      return {
        id,
        formId: form.id,
        dexNumber: form.dexNumber,
        variantKey,
        released,
        releaseStatus: released ? ("RELEASED" as const) : ("UNRELEASED" as const),
        ranks,
        bestPvpRank,
        pveEvidence,
        maxEvidence,
        initialDecision: decision,
        initialDisposition: initialDisposition(decision, released),
      };
    });
  });

  for (const special of definition.specialVariants) {
    const form = definition.forms.find((candidate) => candidate.id === special.formId);
    if (!form) throw new Error(`Special Gen4 variant ${special.id} references ${special.formId}.`);
    const released = special.released;
    const pveEvidence = definition.pveEvidenceForVariant(special.id);
    const maxEvidence = definition.maxEvidenceForVariant(special.id);
    const decision = initialDecision(
      released,
      special.variantKey,
      null,
      pveEvidence,
      maxEvidence,
    );
    rows.push({
      id: special.id,
      formId: form.id,
      dexNumber: form.dexNumber,
      variantKey: special.variantKey,
      released,
      releaseStatus: released ? "RELEASED" : "UNRELEASED",
      ranks: [],
      bestPvpRank: null,
      pveEvidence,
      maxEvidence,
      initialDecision: decision,
      initialDisposition: initialDisposition(decision, released),
    });
  }

  return rows;
}

export function buildGen4ImportPlan387416(rankings: Gen4RankingSnapshots) {
  return buildGen4ImportPlan(getGen4BatchDefinition("387-416"), rankings);
}
