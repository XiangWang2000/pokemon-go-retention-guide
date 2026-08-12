import { forms387416 } from "./batch-387-416";
import {
  releasedDynamaxForms387416,
  releasedNormalForms387416,
  releasedShadowForms387416,
} from "./batch-387-416-gameplay";
import { pveEvidenceForVariant387416, type Gen4PveEvidence } from "./batch-387-416-pve";
import { pvpokeSpeciesId387416 } from "./batch-387-416-pvpoke";

export type Gen4PlanVariantKey = "NORMAL" | "SHADOW" | "PURIFIED" | "DYNAMAX";
export type Gen4PlanDecision = "KEEP" | "CONDITIONAL_KEEP" | "TRANSFER_CANDIDATE";
export type Gen4PlanDisposition =
  | "CLEAR_USE"
  | "LIMITED_USE"
  | "NO_SIGNIFICANT_USE"
  | "NOT_APPLICABLE_OR_UNRELEASED";
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
  variantKey: Gen4PlanVariantKey;
  released: boolean;
  releaseStatus: "RELEASED" | "UNRELEASED";
  ranks: Gen4PlanRank[];
  bestPvpRank: number | null;
  pveEvidence: Gen4PveEvidence | null;
  initialDecision: Gen4PlanDecision;
  initialDisposition: Gen4PlanDisposition;
};

const leagues = ["GREAT", "ULTRA", "MASTER"] as const;
const variantKeys = ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const;

function variantReleased(formId: string, variantKey: Gen4PlanVariantKey) {
  if (variantKey === "NORMAL") return releasedNormalForms387416.has(formId);
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms387416.has(formId);
  }
  return releasedDynamaxForms387416.has(formId);
}

function findRanks(
  form: (typeof forms387416)[number],
  variantKey: "NORMAL" | "SHADOW",
  rankings: Gen4RankingSnapshots,
): Gen4PlanRank[] {
  const speciesId = pvpokeSpeciesId387416(form, variantKey === "SHADOW");
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
  variantKey: Gen4PlanVariantKey,
  bestPvpRank: number | null,
  pveEvidence: Gen4PveEvidence | null,
): Gen4PlanDecision {
  if (!released) return "TRANSFER_CANDIDATE";

  // Import-stage seeding uses the strongest confirmed use instead of allowing a
  // weaker PvE classification to hide a top-100 PvP result.
  if (
    variantKey === "DYNAMAX" ||
    pveEvidence?.level === "CORE_INVESTMENT" ||
    (bestPvpRank !== null && bestPvpRank <= 100)
  ) {
    return "KEEP";
  }

  if (
    pveEvidence !== null ||
    (bestPvpRank !== null && bestPvpRank <= 250)
  ) {
    return "CONDITIONAL_KEEP";
  }

  return "TRANSFER_CANDIDATE";
}

function initialDisposition(
  decision: Gen4PlanDecision,
  released: boolean,
): Gen4PlanDisposition {
  if (!released) return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

export function buildGen4ImportPlan387416(rankings: Gen4RankingSnapshots): Gen4ImportPlanRow[] {
  return forms387416.flatMap((form) =>
    variantKeys.map((variantKey) => {
      const id = `${form.id}-${variantKey.toLowerCase()}`;
      const released = variantReleased(form.id, variantKey);
      const ranks =
        released && (variantKey === "NORMAL" || variantKey === "SHADOW")
          ? findRanks(form, variantKey, rankings)
          : [];
      const bestPvpRank = ranks.length ? Math.min(...ranks.map((rank) => rank.rank)) : null;
      const pveEvidence = pveEvidenceForVariant387416(id);
      const initialDecisionValue = initialDecision(
        released,
        variantKey,
        bestPvpRank,
        pveEvidence,
      );

      return {
        id,
        formId: form.id,
        dexNumber: form.dexNumber,
        variantKey,
        released,
        releaseStatus: released ? "RELEASED" : "UNRELEASED",
        ranks,
        bestPvpRank,
        pveEvidence,
        initialDecision: initialDecisionValue,
        initialDisposition: initialDisposition(initialDecisionValue, released),
      };
    }),
  );
}
