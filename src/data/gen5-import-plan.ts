import type { CandidateReleaseStatus, CandidateReleaseVariantKey } from "./candidates/gen5-release-494-523";
import type { CandidateMaxEvidence, CandidatePveEvidence } from "./candidates/gen5-pve-types";
import { getGen5BatchDefinition, type Gen5BatchDefinition } from "./batch-gen5";

export type Gen5PlanVariantKey = CandidateReleaseVariantKey;
export type Gen5PlanDecision = "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE";
export type Gen5PlanDisposition = "CLEAR_USE" | "LIMITED_USE" | "NO_SIGNIFICANT_USE" | "NOT_APPLICABLE_OR_UNRELEASED" | "TRUE_DATA_PENDING";
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

export type Gen5EvolutionCandidate = {
  targetVariantId: string;
  targetFormId: string;
  pathFormIds: string[];
  conditionsZhTw: string;
  sourceUrls: string[];
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
  evolutionCandidates: Gen5EvolutionCandidate[];
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
  if (status === "UNKNOWN") return "HOLD_FOR_NOW";
  if (status === "UNRELEASED") return "TRANSFER_CANDIDATE";
  if (
    pveEvidence?.level === "CORE_INVESTMENT" ||
    maxEvidence?.level === "CORE_INVESTMENT" ||
    (bestPvpRank !== null && bestPvpRank <= 100)
  ) return "KEEP";
  if (pveEvidence || maxEvidence || (bestPvpRank !== null && bestPvpRank <= 250)) {
    return "CONDITIONAL_KEEP";
  }
  // The candidate evidence contract contains positive findings only. Absence from
  // those maps or a ranking snapshot cannot establish an audited negative.
  return "HOLD_FOR_NOW";
}

function disposition(decision: Gen5PlanDecision, status: CandidateReleaseStatus): Gen5PlanDisposition {
  if (status === "UNRELEASED") return "NOT_APPLICABLE_OR_UNRELEASED";
  if (status === "UNKNOWN" || decision === "HOLD_FOR_NOW") return "TRUE_DATA_PENDING";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

function buildDirectPlan(definition: Gen5BatchDefinition, rankings: Gen5RankingSnapshots) {
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
        pveEvidence, maxEvidence, evolutionCandidates: [], initialDecision: initial,
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
        pveEvidence, maxEvidence, evolutionCandidates: [], initialDecision: initial,
        initialDisposition: disposition(initial, release.status),
      });
    }
  }
  return rows;
}

const gen5BatchKeys = ["494-523", "524-553", "554-583", "584-613", "614-643", "644-649"] as const;

/** Resolve only explicit evolution edges and the same released battle variant.
 * The source rows keep their own battle evidence: descendants provide a separate
 * conditional evolution reason, never inherited core-investment or ranking data.
 */
export function buildGen5ImportPlan(
  definition: Gen5BatchDefinition,
  rankings: Gen5RankingSnapshots,
  catalogue: readonly Gen5BatchDefinition[] = gen5BatchKeys.map(getGen5BatchDefinition),
): Gen5ImportPlanRow[] {
  const definitions = new Map(catalogue.map((entry) => [entry.key, entry]));
  definitions.set(definition.key, definition);
  const ownRows = buildDirectPlan(definition, rankings);
  const directRows = new Map([...definitions.values()].flatMap((entry) =>
    (entry.key === definition.key ? ownRows : buildDirectPlan(entry, rankings))
      .map((row) => [row.id, row] as const)));
  const targetsByForm = new Map<string, Set<string>>();
  for (const entry of definitions.values()) {
    for (const [from, to] of entry.evolutionPairs) {
      const targets = targetsByForm.get(from) ?? new Set<string>();
      targets.add(to);
      targetsByForm.set(from, targets);
    }
  }

  // Finish discovery before changing any decisions, so an already-promoted
  // intermediate form can never be mistaken for direct positive evidence.
  const candidatesById = new Map<string, Gen5EvolutionCandidate[]>();
  for (const row of ownRows) {
    if (row.releaseStatus !== "RELEASED") continue;
    const candidates: Gen5EvolutionCandidate[] = [];
    const queue = [[row.formId]];
    const visited = new Set([row.formId]);
    for (let index = 0; index < queue.length; index++) {
      const path = queue[index]!;
      for (const targetFormId of targetsByForm.get(path.at(-1)!) ?? []) {
        if (visited.has(targetFormId)) continue;
        visited.add(targetFormId);
        const targetVariantId = `${targetFormId}-${row.variantKey.toLowerCase()}`;
        const target = directRows.get(targetVariantId);
        // Unknown/unreleased intermediate forms also block evolution closure.
        if (!target || target.releaseStatus !== "RELEASED") continue;
        const pathFormIds = [...path, targetFormId];
        queue.push(pathFormIds);
        if (target.initialDecision !== "KEEP" && target.initialDecision !== "CONDITIONAL_KEEP") continue;
        const evidence = [target.pveEvidence, target.maxEvidence].filter((item) => item !== null);
        const summaries = evidence.map((item) => item.summaryZhTw);
        if (target.bestPvpRank !== null && target.bestPvpRank <= 250) {
          summaries.push("進化後需依適用聯盟確認 CP 上限、個體 IV 與招式。");
        }
        candidates.push({
          targetVariantId, targetFormId, pathFormIds,
          conditionsZhTw: `僅作同版本進化候選；進化前確認糖果、進化條件與目標所需招式。${summaries.join(" ")}`,
          sourceUrls: [...new Set([...evidence.map((item) => item.sourceUrl),
            ...target.ranks.filter((rank) => rank.rank <= 250).map((rank) => `https://pvpoke.com/rankings/all/${rank.league === "GREAT" ? 1500 : rank.league === "ULTRA" ? 2500 : 10000}/overall/`),
          ])],
        });
      }
    }
    candidatesById.set(row.id, candidates);
  }
  for (const row of ownRows) {
    row.evolutionCandidates = candidatesById.get(row.id) ?? [];
    if (row.evolutionCandidates.length && (row.initialDecision === "TRANSFER_CANDIDATE" || row.initialDecision === "HOLD_FOR_NOW")) {
      row.initialDecision = "CONDITIONAL_KEEP";
      row.initialDisposition = "LIMITED_USE";
    }
  }
  return ownRows;
}
