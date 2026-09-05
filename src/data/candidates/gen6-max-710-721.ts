import type { CandidateMaxEvidence } from "./gen5-pve-types";

export const maxEvidence710721: Readonly<Record<string, CandidateMaxEvidence>> = {};

export function candidateMaxEvidence710721(variantId: string) {
  return maxEvidence710721[variantId] ?? null;
}
