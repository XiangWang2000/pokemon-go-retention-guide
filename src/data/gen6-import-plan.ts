import type { CandidateReleaseStatus, CandidateReleaseVariantKey } from "./candidates/gen5-release-494-523";
import type { CandidateMaxEvidence, CandidatePveEvidence } from "./candidates/gen5-pve-types";
import type { Gen6BatchDefinition } from "./batch-gen6";
import type { Gen6PvpMappingMode } from "./candidates/gen6-pvp";

export type Gen6PlanVariantKey = CandidateReleaseVariantKey;
export type Gen6PlanDecision = "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE";
export type Gen6PlanDisposition = "CLEAR_USE" | "LIMITED_USE" | "NO_SIGNIFICANT_USE" | "NOT_APPLICABLE_OR_UNRELEASED";
export type Gen6PlanLeague = "GREAT" | "ULTRA" | "MASTER";

export type Gen6PvpRankingRow = { speciesId: string; rating?: number; moveset?: string[] };
export type Gen6RankingSnapshots = Readonly<Record<Gen6PlanLeague, readonly Gen6PvpRankingRow[]>>;
export type Gen6PlanRank = {
  league: Gen6PlanLeague;
  speciesId: string;
  rank: number;
  rating: number | null;
  moves: string[];
  mappingMode: Gen6PvpMappingMode;
};

export type Gen6ImportPlanRow = {
  id: string;
  formId: string;
  dexNumber: number;
  variantKey: Gen6PlanVariantKey;
  releaseStatus: CandidateReleaseStatus;
  releaseSourceIds: readonly string[];
  releaseNotesZhTw: string;
  ranks: Gen6PlanRank[];
  bestPvpRank: number | null;
  pveEvidence: CandidatePveEvidence | null;
  maxEvidence: CandidateMaxEvidence | null;
  initialDecision: Gen6PlanDecision;
  initialDisposition: Gen6PlanDisposition;
};

const leagues = ["GREAT", "ULTRA", "MASTER"] as const;
const baseVariantKeys = ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const;
const specialVariantKeys = ["MEGA", "GIGANTAMAX"] as const;

function findRanks(
  definition: Gen6BatchDefinition,
  form: Gen6BatchDefinition["forms"][number],
  variantKey: "NORMAL" | "SHADOW",
  rankings: Gen6RankingSnapshots,
): Gen6PlanRank[] {
  const mapping = definition.pvpMappingForForm(form);
  const speciesId = variantKey === "SHADOW" ? mapping.shadowPvpokeSpeciesId : mapping.pvpokeSpeciesId;
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
      mappingMode: mapping.mappingMode,
    }];
  });
}

function initialDecision(
  status: CandidateReleaseStatus,
  bestPvpRank: number | null,
  pveEvidence: CandidatePveEvidence | null,
  maxEvidence: CandidateMaxEvidence | null,
): Gen6PlanDecision {
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

function disposition(decision: Gen6PlanDecision, status: CandidateReleaseStatus): Gen6PlanDisposition {
  if (status !== "RELEASED") return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

export function buildGen6ImportPlan(definition: Gen6BatchDefinition, rankings: Gen6RankingSnapshots) {
  const rows: Gen6ImportPlanRow[] = [];
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
        id,
        formId: form.id,
        dexNumber: form.dexNumber,
        variantKey,
        releaseStatus: release.status,
        releaseSourceIds: release.sourceIds,
        releaseNotesZhTw: release.notesZhTw,
        ranks,
        bestPvpRank,
        pveEvidence,
        maxEvidence,
        initialDecision: initial,
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
        id,
        formId: form.id,
        dexNumber: form.dexNumber,
        variantKey,
        releaseStatus: release.status,
        releaseSourceIds: release.sourceIds,
        releaseNotesZhTw: release.notesZhTw,
        ranks: [],
        bestPvpRank: null,
        pveEvidence,
        maxEvidence,
        initialDecision: initial,
        initialDisposition: disposition(initial, release.status),
      });
    }
  }
  return rows;
}
