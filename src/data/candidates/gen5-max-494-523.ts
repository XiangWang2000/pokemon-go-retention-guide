import type { CandidateMaxEvidence } from "./gen5-battle-evidence-types";

/**
 * #494-#523 has released Dynamax Pidove/Tranquill/Unfezant, but the current
 * Max investment audit does not assign a positive standalone Max value to
 * any of them. Release state is intentionally kept in gen5-release-494-523.
 */
export const maxEvidence494523: Readonly<Record<string, CandidateMaxEvidence>> = {};

export function maxEvidenceForVariant494523(variantId: string) {
  return maxEvidence494523[variantId] ?? null;
}
