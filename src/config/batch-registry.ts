import { CURRENT_DATA_MAX_DEX } from "./data-scope";

export type BatchGeneration = 1 | 2 | 3 | 4;
export type BatchImportAdapter = "seed" | "legacy" | "gen3" | "gen4";
export type BatchImportPhase = "seed" | "pre-recompute" | "post-recompute";

type BatchImportSpec =
  | {
      adapter: "seed";
      phase: "seed";
      entrypoint: null;
      passBatchKey: false;
    }
  | {
      adapter: Exclude<BatchImportAdapter, "seed">;
      phase: Exclude<BatchImportPhase, "seed">;
      entrypoint: string;
      passBatchKey: boolean;
    };

type BatchReviewSpec = {
  generator: string;
  passBatchKey: boolean;
  jsonPath: string;
  markdownPath: string;
};

export type BatchRegistryEntry = {
  key: string;
  minDex: number;
  maxDex: number;
  generation: BatchGeneration;
  import: BatchImportSpec;
  review: BatchReviewSpec;
};

export const BATCH_REGISTRY = [
  {
    key: "001-030",
    minDex: 1,
    maxDex: 30,
    generation: 1,
    import: { adapter: "seed", phase: "seed", entrypoint: null, passBatchKey: false },
    review: {
      generator: "scripts/generate-review.ts",
      passBatchKey: false,
      jsonPath: "review/001-030.json",
      markdownPath: "review/001-030.md",
    },
  },
  {
    key: "031-060",
    minDex: 31,
    maxDex: 60,
    generation: 1,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-031-060.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-031-060.ts",
      passBatchKey: false,
      jsonPath: "review/031-060.json",
      markdownPath: "review/031-060.md",
    },
  },
  {
    key: "061-090",
    minDex: 61,
    maxDex: 90,
    generation: 1,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-061-090.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-061-090.ts",
      passBatchKey: false,
      jsonPath: "review/061-090.json",
      markdownPath: "review/061-090.md",
    },
  },
  {
    key: "091-120",
    minDex: 91,
    maxDex: 120,
    generation: 1,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-091-120.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-091-120.ts",
      passBatchKey: false,
      jsonPath: "review/091-120.json",
      markdownPath: "review/091-120.md",
    },
  },
  {
    key: "121-151",
    minDex: 121,
    maxDex: 151,
    generation: 1,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-121-151.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-121-151.ts",
      passBatchKey: false,
      jsonPath: "review/121-151.json",
      markdownPath: "review/121-151.md",
    },
  },
  {
    key: "152-181",
    minDex: 152,
    maxDex: 181,
    generation: 2,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-152-181.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-152-181.ts",
      passBatchKey: false,
      jsonPath: "review/152-181.json",
      markdownPath: "review/152-181.md",
    },
  },
  {
    key: "182-211",
    minDex: 182,
    maxDex: 211,
    generation: 2,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-182-211.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-182-211.ts",
      passBatchKey: false,
      jsonPath: "review/182-211.json",
      markdownPath: "review/182-211.md",
    },
  },
  {
    key: "212-241",
    minDex: 212,
    maxDex: 241,
    generation: 2,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-212-241.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-212-241.ts",
      passBatchKey: false,
      jsonPath: "review/212-241.json",
      markdownPath: "review/212-241.md",
    },
  },
  {
    key: "242-251",
    minDex: 242,
    maxDex: 251,
    generation: 2,
    import: {
      adapter: "legacy",
      phase: "pre-recompute",
      entrypoint: "scripts/import-242-251.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-242-251.ts",
      passBatchKey: false,
      jsonPath: "review/242-251.json",
      markdownPath: "review/242-251.md",
    },
  },
  {
    key: "252-281",
    minDex: 252,
    maxDex: 281,
    generation: 3,
    import: {
      adapter: "gen3",
      phase: "pre-recompute",
      entrypoint: "scripts/import-gen3.ts",
      passBatchKey: true,
    },
    review: {
      generator: "scripts/generate-review-gen3.ts",
      passBatchKey: true,
      jsonPath: "review/252-281.json",
      markdownPath: "review/252-281.md",
    },
  },
  {
    key: "282-311",
    minDex: 282,
    maxDex: 311,
    generation: 3,
    import: {
      adapter: "gen3",
      phase: "pre-recompute",
      entrypoint: "scripts/import-gen3.ts",
      passBatchKey: true,
    },
    review: {
      generator: "scripts/generate-review-gen3.ts",
      passBatchKey: true,
      jsonPath: "review/282-311.json",
      markdownPath: "review/282-311.md",
    },
  },
  {
    key: "312-341",
    minDex: 312,
    maxDex: 341,
    generation: 3,
    import: {
      adapter: "gen3",
      phase: "pre-recompute",
      entrypoint: "scripts/import-gen3.ts",
      passBatchKey: true,
    },
    review: {
      generator: "scripts/generate-review-gen3.ts",
      passBatchKey: true,
      jsonPath: "review/312-341.json",
      markdownPath: "review/312-341.md",
    },
  },
  {
    key: "342-371",
    minDex: 342,
    maxDex: 371,
    generation: 3,
    import: {
      adapter: "gen3",
      phase: "pre-recompute",
      entrypoint: "scripts/import-gen3.ts",
      passBatchKey: true,
    },
    review: {
      generator: "scripts/generate-review-342-371.ts",
      passBatchKey: false,
      jsonPath: "review/342-371.json",
      markdownPath: "review/342-371.md",
    },
  },
  {
    key: "372-386",
    minDex: 372,
    maxDex: 386,
    generation: 3,
    import: {
      adapter: "gen3",
      phase: "pre-recompute",
      entrypoint: "scripts/import-gen3.ts",
      passBatchKey: true,
    },
    review: {
      generator: "scripts/generate-review-gen3.ts",
      passBatchKey: true,
      jsonPath: "review/372-386.json",
      markdownPath: "review/372-386.md",
    },
  },
  {
    key: "387-416",
    minDex: 387,
    maxDex: 416,
    generation: 4,
    import: {
      adapter: "gen4",
      phase: "post-recompute",
      entrypoint: "scripts/import-gen4.ts",
      passBatchKey: false,
    },
    review: {
      generator: "scripts/generate-review-387-416.ts",
      passBatchKey: false,
      jsonPath: "review/387-416.json",
      markdownPath: "review/387-416.md",
    },
  },
] as const satisfies readonly BatchRegistryEntry[];

export type PublishedBatchKey = (typeof BATCH_REGISTRY)[number]["key"];

export function parseBatchKey(batch: string) {
  const match = /^(\d{3,4})-(\d{3,4})$/.exec(batch);
  if (!match) throw new Error(`Invalid batch key: ${batch}`);
  const minDex = Number(match[1]);
  const maxDex = Number(match[2]);
  if (minDex < 1 || maxDex < minDex) throw new Error(`Invalid batch range: ${batch}`);
  return { minDex, maxDex };
}

export function getBatchByKey(batch: string): BatchRegistryEntry {
  const entry = BATCH_REGISTRY.find((candidate) => candidate.key === batch);
  if (!entry) throw new Error(`Unknown published batch: ${batch}`);
  return entry;
}

export function assertBatchRegistry(entries: readonly BatchRegistryEntry[] = BATCH_REGISTRY) {
  const keys = new Set<string>();
  const jsonPaths = new Set<string>();
  const markdownPaths = new Set<string>();
  let nextDex = 1;
  let previousPhase = -1;

  for (const entry of entries) {
    if (keys.has(entry.key)) throw new Error(`Duplicate batch key: ${entry.key}`);
    keys.add(entry.key);
    if (jsonPaths.has(entry.review.jsonPath)) {
      throw new Error(`Duplicate review JSON path: ${entry.review.jsonPath}`);
    }
    jsonPaths.add(entry.review.jsonPath);
    if (markdownPaths.has(entry.review.markdownPath)) {
      throw new Error(`Duplicate review Markdown path: ${entry.review.markdownPath}`);
    }
    markdownPaths.add(entry.review.markdownPath);

    const parsed = parseBatchKey(entry.key);
    if (parsed.minDex !== entry.minDex || parsed.maxDex !== entry.maxDex) {
      throw new Error(`Batch metadata does not match its key: ${entry.key}`);
    }
    if (entry.minDex !== nextDex) {
      throw new Error(`Batch registry is not contiguous at ${entry.key}. Expected #${nextDex}.`);
    }
    const phase = { seed: 0, "pre-recompute": 1, "post-recompute": 2 }[entry.import.phase];
    if (phase < previousPhase) {
      throw new Error(`Batch import phases are out of order at ${entry.key}.`);
    }
    previousPhase = phase;
    nextDex = entry.maxDex + 1;
  }

  if (nextDex - 1 !== CURRENT_DATA_MAX_DEX) {
    throw new Error(`Batch registry ends at #${nextDex - 1}, expected #${CURRENT_DATA_MAX_DEX}.`);
  }
}

export function batchImportArgs(batch: string | BatchRegistryEntry) {
  const entry = typeof batch === "string" ? getBatchByKey(batch) : batch;
  if (entry.import.entrypoint === null) return ["prisma", "db", "seed"];
  return ["tsx", entry.import.entrypoint, ...(entry.import.passBatchKey ? [entry.key] : [])];
}

export function batchReviewArgs(batch: string | BatchRegistryEntry) {
  const entry = typeof batch === "string" ? getBatchByKey(batch) : batch;
  return [entry.review.generator, ...(entry.review.passBatchKey ? [entry.key] : [])];
}

assertBatchRegistry();
