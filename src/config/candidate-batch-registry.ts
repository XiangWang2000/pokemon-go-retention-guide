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

export const CANDIDATE_BATCH_REGISTRY = [
  {
    key: "494-523",
    minDex: 494,
    maxDex: 523,
    generation: 5,
    stage: "EVIDENCE",
    definitionModule: "src/data/candidates/gen5-494-523.ts",
  },
  {
    key: "524-553",
    minDex: 524,
    maxDex: 553,
    generation: 5,
    stage: "EVIDENCE",
    definitionModule: "src/data/candidates/gen5-524-553.ts",
  },
  {
    key: "554-583",
    minDex: 554,
    maxDex: 583,
    generation: 5,
    stage: "EVIDENCE",
    definitionModule: "src/data/candidates/gen5-554-583.ts",
  },
  {
    key: "584-613",
    minDex: 584,
    maxDex: 613,
    generation: 5,
    stage: "EVIDENCE",
    definitionModule: "src/data/candidates/gen5-584-613.ts",
  },
  {
    key: "614-643",
    minDex: 614,
    maxDex: 643,
    generation: 5,
    stage: "EVIDENCE",
    definitionModule: "src/data/candidates/gen5-614-643.ts",
  },
] as const satisfies readonly CandidateBatchRegistryEntry[];

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
    if (entry.key !== expectedKey) {
      throw new Error(`Candidate batch metadata does not match key: ${entry.key}`);
    }
    if (entry.maxDex - entry.minDex + 1 > 30) {
      throw new Error(`Candidate batch exceeds 30 National Dex numbers: ${entry.key}`);
    }
    if (entry.minDex !== expectedStart) {
      throw new Error(
        `Candidate registry is not contiguous after published data at ${entry.key}; expected #${expectedStart}.`,
      );
    }
    expectedStart = entry.maxDex + 1;
  }
}

assertCandidateBatchRegistry();
