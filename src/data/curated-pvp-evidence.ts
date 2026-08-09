export interface CuratedPvpEvidence {
  formId: string;
  variantKey: string;
  leagueOrCup: string;
  source: string;
  checkedAt: string;
  reason: string;
}

/**
 * Independent, human-reviewed PvP exceptions.
 *
 * This is intentionally empty for r23. A previous retention decision or rule
 * trace is never a valid source for adding an exception here.
 */
export const CURATED_PVP_EVIDENCE: readonly CuratedPvpEvidence[] = [];

function isCompleteEvidence(item: CuratedPvpEvidence) {
  return Boolean(
    item.formId.trim() &&
      item.variantKey.trim() &&
      item.leagueOrCup.trim() &&
      item.source.trim() &&
      item.reason.trim() &&
      !Number.isNaN(Date.parse(item.checkedAt)),
  );
}

export interface CurrentPvpEvidenceInput {
  formId: string;
  variantKey: string;
  ranks: readonly number[];
  categoryStatus?: string | null;
  categoryMaterialToDecision?: boolean | null;
  /** Test-only context: this must not influence the current result. */
  previousDecision?: string | null;
  /** Test-only context: generated traces must not influence the current result. */
  previousRuleTrace?: unknown;
}

export function hasIndependentCuratedPvpUse(
  input: Pick<CurrentPvpEvidenceInput, "formId" | "variantKey">,
  evidence: readonly CuratedPvpEvidence[] = CURATED_PVP_EVIDENCE,
) {
  return evidence.some(
    (item) =>
      item.formId === input.formId &&
      item.variantKey === input.variantKey &&
      isCompleteEvidence(item),
  );
}

export function hasCurrentPvpUse(
  input: CurrentPvpEvidenceInput,
  evidence: readonly CuratedPvpEvidence[] = CURATED_PVP_EVIDENCE,
) {
  const hasRankedUse = input.ranks.some((rank) => Number.isFinite(rank) && rank <= 250);
  return hasRankedUse || hasIndependentCuratedPvpUse(input, evidence);
}

export function validateCuratedPvpEvidence(
  evidence: readonly CuratedPvpEvidence[] = CURATED_PVP_EVIDENCE,
) {
  return evidence.flatMap((item, index) =>
    isCompleteEvidence(item)
      ? []
      : [`curated PvP evidence ${index} is incomplete or has an invalid checkedAt`],
  );
}
