import type { CandidateReleaseStatus, CandidateReleaseVariantKey } from "./candidates/gen5-release-494-523";
import type { CandidateMaxEvidence, CandidatePveEvidence } from "./candidates/gen5-pve-types";
import type { Gen5BatchDefinition } from "./batch-gen5";

export type Gen5PlanVariantKey = CandidateReleaseVariantKey;
export type Gen5PlanDecision = "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE";
export type Gen5PlanDisposition = "CLEAR_USE" | "LIMITED_USE" | "NO_SIGNIFICANT_USE" | "NOT_APPLICABLE_OR_UNRELEASED";
export type Gen5PlanLeague = "GREAT" | "ULTRA" | "MASTER";

export type Gen5PvpRankingRow = { speciesId: string; rating?: number; moveset?: string[] };
export type Gen5RankingSnapshots = Readonly<Record<Gen5PlanLeague, readonly Gen5PvpRankingRow[]>>;
export type Gen5PlanRank = {
  league: Gen5PlanLeague;
  speciesId: string;
  rank: number;
  rating: number | null;
  moves: string[];
  mappingMode: "EXACT" | "SHARED_UNDIFFERENTIATED";
};

export type Gen5ImportPlanRow = {
  id: string;
  formId: string;
  dexNumber: number;
  variantKey: Gen5PlanVariantKey;
  releaseStatus: CandidateReleaseStatus;
  releaseSourceIds: readonly string[];
  releaseNotesZhTw: string;
  ranks: Gen5PlanRank[];
  bestPvpRank: number | null;
  pveEvidence: CandidatePveEvidence | null;
  maxEvidence: CandidateMaxEvidence | null;
  initialDecision: Gen5PlanDecision;
  initialDisposition: Gen5PlanDisposition;
};

const leagues = ["GREAT", "ULTRA", "MASTER"] as const;
const baseVariantKeys = ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const;
const specialVariantKeys = ["MEGA", "GIGANTAMAX"] as const;

function findRanks(
  definition: Gen5BatchDefinition,
  form: Gen5BatchDefinition["forms"][number],
  variantKey: "NORMAL" | "SHADOW",
  rankings: Gen5RankingSnapshots,
): Gen5PlanRank[] {
  const mapping = definition.pvpMappingForForm(form);
  const speciesId = variantKey === "SHADOW" ? mapping.shadow : mapping.normal;
  if (!speciesId) return [];
  return leagues.flatMap((league) => {
    const rows = rankings[league];
    const index = rows.findIndex((row) => row.speciesId === speciesId);
    if (index < 0) return [];
    const row = rows[index]!;
    return [{
      league,
      speciesId,
      rank: index + 1,
      rating: row.rating ?? null,
      moves: row.moveset ?? [],
      mappingMode: mapping.mode,
    }];
  });
}

function initialDecision(
  status: CandidateReleaseStatus,
  bestPvpRank: number | null,
  pveEvidence: CandidatePveEvidence | null,
  maxEvidence: CandidateMaxEvidence | null,
): Gen5PlanDecision {
  if (status !== "RELEASED") return "TRANSFER_CANDIDATE";
  if (
    pveEvidence?.level === "CORE_INVESTMENT" ||
    maxEvidence?.level === "CORE_INVESTMENT" ||
    (bestPvpRank !== null && bestPvpRank <= 100)
  ) return "KEEP";
  if (pveEvidence || maxEvidence || (bestPvpRank !== null && bestPvpRank <= 250)) {
    return "CONDITIONAL_KEEP";
  }
  return "TRANSFER_CANDIDATE";
}

function disposition(decision: Gen5PlanDecision, status: CandidateReleaseStatus): Gen5PlanDisposition {
  if (status !== "RELEASED") return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

export function buildGen5ImportPlan(definition: Gen5BatchDefinition, rankings: Gen5RankingSnapshots) {
  const rows: Gen5ImportPlanRow[] = [];
  for (const form of definition.forms) {
    for (const variantKey of baseVariantKeys) {
      const release = definition.releaseEvidenceForVariant(form.id, variantKey);
      const id = `${form.id}-${variantKey.toLowerCase()}`;
      const ranks = release.status === "RELEASED" && (variantKey === "NORMAL" || variantKey === "SHADOW")
        ? findRanks(definition, form, variantKey, rankings)
        : [];
      const bestPvpRank = ranks.length ? Math.min(...ranks.map((rank) => rank.rank)) : null;
      const pveEvidence = definition.pveEvidenceForVariant(id);
      const maxEvidence = definition.maxEvidenceForVariant(id);
      const initial = initialDecision(release.status, bestPvpRank, pveEvidence, maxEvidence);
      rows.push({
        id, formId: form.id, dexNumber: form.dexNumber, variantKey,
        releaseStatus: release.status, releaseSourceIds: release.sourceIds,
        releaseNotesZhTw: release.notesZhTw, ranks, bestPvpRank,
        pveEvidence, maxEvidence, initialDecision: initial,
        initialDisposition: disposition(initial, release.status),
      });
    }
    for (const variantKey of specialVariantKeys) {
      const release = definition.releaseEvidenceForVariant(form.id, variantKey);
      if (release.status === "UNKNOWN") continue;
      const id = `${form.id}-${variantKey.toLowerCase()}`;
      const pveEvidence = definition.pveEvidenceForVariant(id);
      const maxEvidence = definition.maxEvidenceForVariant(id);
      const initial = initialDecision(release.status, null, pveEvidence, maxEvidence);
      rows.push({
        id, formId: form.id, dexNumber: form.dexNumber, variantKey,
        releaseStatus: release.status, releaseSourceIds: release.sourceIds,
        releaseNotesZhTw: release.notesZhTw, ranks: [], bestPvpRank: null,
        pveEvidence, maxEvidence, initialDecision: initial,
        initialDisposition: disposition(initial, release.status),
      });
    }
  }
  return rows;
}
