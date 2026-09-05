import { BATCH_REGISTRY } from "./batch-registry";
import type { CandidateGeneration } from "../data/candidates/types";

export type CandidateBatchStage = "IDENTITY" | "EVIDENCE" | "READY_FOR_PUBLICATION";
export type CandidateBatchRegistryEntry = {
  key: string;
  minDex: number;
  maxDex: number;
  generation: CandidateGeneration;
  stage: CandidateBatchStage;
  definitionModule: string;
};

/**
 * Candidate batches must begin immediately after the published registry.
 * Gen5 #494-#649 is now formally published, so no Gen5 candidate batch remains.
 */
export const CANDIDATE_BATCH_REGISTRY = [] as const satisfies readonly CandidateBatchRegistryEntry[];

export function assertCandidateBatchRegistry(
  entries: readonly CandidateBatchRegistryEntry[] = CANDIDATE_BATCH_REGISTRY,
) {
  const publishedMaxDex = BATCH_REGISTRY.at(-1)?.maxDex ?? 0;
  const keys = new Set<string>();
  let expectedStart = publishedMaxDex + 1;
  for (const entry of entries) {
    if (keys.has(entry.key)) throw new Error(`Duplicate candidate batch key: ${entry.key}`);
    keys.add(entry.key);
    const expectedKey = `${entry.minDex}-${entry.maxDex}`;
    if (entry.key !== expectedKey) throw new Error(`Candidate batch metadata does not match key: ${entry.key}`);
    if (entry.maxDex - entry.minDex + 1 > 30) throw new Error(`Candidate batch exceeds 30 National Dex numbers: ${entry.key}`);
    if (entry.minDex !== expectedStart) throw new Error(`Candidate registry is not contiguous after published data at ${entry.key}; expected #${expectedStart}.`);
    expectedStart = entry.maxDex + 1;
  }
}
assertCandidateBatchRegistry();
