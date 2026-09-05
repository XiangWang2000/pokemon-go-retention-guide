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

/** Candidate batches must begin immediately after the published registry. */
export const CANDIDATE_BATCH_REGISTRY = [
  {
    key: "650-679",
    minDex: 650,
    maxDex: 679,
    generation: 6,
    stage: "IDENTITY",
    definitionModule: "src/data/candidates/gen6-650-679.ts",
  },
  {
    key: "680-709",
    minDex: 680,
    maxDex: 709,
    generation: 6,
    stage: "IDENTITY",
    definitionModule: "src/data/candidates/gen6-680-709.ts",
  },
] as const satisfies readonly CandidateBatchRegistryEntry[];

export function assertCandidateBatchRegistry(entries: readonly CandidateBatchRegistryEntry[] = CANDIDATE_BATCH_REGISTRY) {
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
