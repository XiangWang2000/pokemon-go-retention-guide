import { CURRENT_DATA_MAX_DEX } from "./data-scope";

export type BatchGeneration = 1 | 2 | 3 | 4 | 5;
export type BatchImportAdapter = "seed" | "legacy" | "gen3" | "gen4" | "gen5";
export type BatchImportPhase = "seed" | "pre-recompute" | "post-recompute";

type BatchImportSpec =
  | { adapter: "seed"; phase: "seed"; entrypoint: null; passBatchKey: false }
  | { adapter: Exclude<BatchImportAdapter, "seed">; phase: Exclude<BatchImportPhase, "seed">; entrypoint: string; passBatchKey: boolean };

type BatchReviewSpec = { generator: string; passBatchKey: boolean; jsonPath: string; markdownPath: string };
export type BatchRegistryEntry = { key: string; minDex: number; maxDex: number; generation: BatchGeneration; import: BatchImportSpec; review: BatchReviewSpec };

function review(key: string, generator: string, passBatchKey: boolean): BatchReviewSpec {
  return { generator, passBatchKey, jsonPath: `review/${key}.json`, markdownPath: `review/${key}.md` };
}
function published(
  key: string,
  generation: BatchGeneration,
  adapter: Exclude<BatchImportAdapter, "seed">,
  phase: Exclude<BatchImportPhase, "seed">,
  entrypoint: string,
  reviewGenerator: string,
  reviewPassBatchKey = true,
  importPassBatchKey = true,
): BatchRegistryEntry {
  const [minDex, maxDex] = key.split("-").map(Number);
  return {
    key, minDex: minDex!, maxDex: maxDex!, generation,
    import: { adapter, phase, entrypoint, passBatchKey: importPassBatchKey },
    review: review(key, reviewGenerator, reviewPassBatchKey),
  };
}

export const BATCH_REGISTRY = [
  {
    key: "001-030", minDex: 1, maxDex: 30, generation: 1,
    import: { adapter: "seed", phase: "seed", entrypoint: null, passBatchKey: false },
    review: review("001-030", "scripts/review/generate-review.ts", false),
  },
  published("031-060", 1, "legacy", "pre-recompute", "scripts/data/import-031-060.ts", "scripts/review/generate-review-031-060.ts", false, false),
  published("061-090", 1, "legacy", "pre-recompute", "scripts/data/import-061-090.ts", "scripts/review/generate-review-061-090.ts", false, false),
  published("091-120", 1, "legacy", "pre-recompute", "scripts/data/import-091-120.ts", "scripts/review/generate-review-091-120.ts", false, false),
  published("121-151", 1, "legacy", "pre-recompute", "scripts/data/import-121-151.ts", "scripts/review/generate-review-121-151.ts", false, false),
  published("152-181", 2, "legacy", "pre-recompute", "scripts/data/import-152-181.ts", "scripts/review/generate-review-152-181.ts", false, false),
  published("182-211", 2, "legacy", "pre-recompute", "scripts/data/import-182-211.ts", "scripts/review/generate-review-johto.ts", true, false),
  published("212-241", 2, "legacy", "pre-recompute", "scripts/data/import-212-241.ts", "scripts/review/generate-review-johto.ts", true, false),
  published("242-251", 2, "legacy", "pre-recompute", "scripts/data/import-242-251.ts", "scripts/review/generate-review-johto.ts", true, false),
  published("252-281", 3, "gen3", "pre-recompute", "scripts/data/import-gen3.ts", "scripts/review/generate-review-gen3.ts"),
  published("282-311", 3, "gen3", "pre-recompute", "scripts/data/import-gen3.ts", "scripts/review/generate-review-gen3.ts"),
  published("312-341", 3, "gen3", "pre-recompute", "scripts/data/import-gen3.ts", "scripts/review/generate-review-gen3.ts"),
  published("342-371", 3, "gen3", "pre-recompute", "scripts/data/import-gen3.ts", "scripts/review/generate-review-gen3.ts"),
  published("372-386", 3, "gen3", "pre-recompute", "scripts/data/import-gen3.ts", "scripts/review/generate-review-gen3.ts"),
  published("387-416", 4, "gen4", "post-recompute", "scripts/data/import-gen4.ts", "scripts/review/generate-review-gen4.ts"),
  published("417-446", 4, "gen4", "post-recompute", "scripts/data/import-gen4.ts", "scripts/review/generate-review-gen4.ts"),
  published("447-476", 4, "gen4", "post-recompute", "scripts/data/import-gen4.ts", "scripts/review/generate-review-gen4.ts"),
  published("477-493", 4, "gen4", "post-recompute", "scripts/data/import-gen4.ts", "scripts/review/generate-review-gen4.ts"),
  published("494-523", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),
  published("524-553", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),
  published("554-583", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),
  published("584-613", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),
  published("614-643", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),
  published("644-649", 5, "gen5", "post-recompute", "scripts/data/import-gen5.ts", "scripts/review/generate-review-gen5.ts"),
] as const satisfies readonly BatchRegistryEntry[];

export type PublishedBatchKey = (typeof BATCH_REGISTRY)[number]["key"];

export function parseBatchKey(batch: string) {
  const match = /^(\d{3,4})-(\d{3,4})$/.exec(batch);
  if (!match) throw new Error(`Invalid batch key: ${batch}`);
  const minDex = Number(match[1]); const maxDex = Number(match[2]);
  if (minDex < 1 || maxDex < minDex) throw new Error(`Invalid batch range: ${batch}`);
  return { minDex, maxDex };
}
export function getBatchByKey(batch: string): BatchRegistryEntry {
  const entry = BATCH_REGISTRY.find((candidate) => candidate.key === batch);
  if (!entry) throw new Error(`Unknown published batch: ${batch}`);
  return entry;
}

function defaultFormId(generation: BatchGeneration, dexNumber: number) {
  if (generation !== 5) {
    const region = { 1: "kanto", 2: "johto", 3: "hoenn", 4: "sinnoh" }[generation as 1 | 2 | 3 | 4];
    return `${String(dexNumber).padStart(3, "0")}-${region}`;
  }
  const exceptions: Readonly<Record<number, string>> = {
    550: "550-red-striped", 555: "555-unova-standard", 585: "585-spring", 586: "586-spring",
    592: "592-male", 593: "593-male", 641: "641-incarnate", 642: "642-incarnate",
    645: "645-incarnate", 647: "647-ordinary", 648: "648-aria",
  };
  return exceptions[dexNumber] ?? `${String(dexNumber).padStart(3, "0")}-unova`;
}

/** Default form identities for each published National Dex number. */
export function getPublishedDefaultFormIds(entries: readonly BatchRegistryEntry[] = BATCH_REGISTRY) {
  const formIds = new Set<string>();
  for (const entry of entries) {
    for (let dexNumber = entry.minDex; dexNumber <= entry.maxDex; dexNumber += 1) {
      formIds.add(defaultFormId(entry.generation, dexNumber));
    }
  }
  return formIds;
}

export function assertBatchRegistry(entries: readonly BatchRegistryEntry[] = BATCH_REGISTRY) {
  const keys = new Set<string>(); const jsonPaths = new Set<string>(); const markdownPaths = new Set<string>();
  let nextDex = 1; let previousPhase = -1;
  for (const entry of entries) {
    if (keys.has(entry.key)) throw new Error(`Duplicate batch key: ${entry.key}`); keys.add(entry.key);
    if (jsonPaths.has(entry.review.jsonPath)) throw new Error(`Duplicate review JSON path: ${entry.review.jsonPath}`); jsonPaths.add(entry.review.jsonPath);
    if (markdownPaths.has(entry.review.markdownPath)) throw new Error(`Duplicate review Markdown path: ${entry.review.markdownPath}`); markdownPaths.add(entry.review.markdownPath);
    const parsed = parseBatchKey(entry.key);
    if (parsed.minDex !== entry.minDex || parsed.maxDex !== entry.maxDex) throw new Error(`Batch metadata does not match its key: ${entry.key}`);
    if (entry.minDex !== nextDex) throw new Error(`Batch registry is not contiguous at ${entry.key}. Expected #${nextDex}.`);
    const phase = { seed: 0, "pre-recompute": 1, "post-recompute": 2 }[entry.import.phase];
    if (phase < previousPhase) throw new Error(`Batch import phases are out of order at ${entry.key}.`);
    previousPhase = phase; nextDex = entry.maxDex + 1;
  }
  if (nextDex - 1 !== CURRENT_DATA_MAX_DEX) throw new Error(`Batch registry ends at #${nextDex - 1}, expected #${CURRENT_DATA_MAX_DEX}.`);
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
