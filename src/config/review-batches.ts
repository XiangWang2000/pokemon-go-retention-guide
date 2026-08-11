export const REVIEW_BATCH_FILES = [
  ["001-030", "review/001-030.json"],
  ["031-060", "review/031-060.json"],
  ["061-090", "review/061-090.json"],
  ["091-120", "review/091-120.json"],
  ["121-151", "review/121-151.json"],
  ["152-181", "review/152-181.json"],
  ["182-211", "review/182-211.json"],
  ["212-241", "review/212-241.json"],
  ["242-251", "review/242-251.json"],
  ["252-281", "review/252-281.json"],
  ["282-311", "review/282-311.json"],
  ["312-341", "review/312-341.json"],
  ["342-371", "review/342-371.json"],
  ["372-386", "review/372-386.json"],
] as const;

export function parseReviewBatchKey(batch: string) {
  const match = /^(\d{3,4})-(\d{3,4})$/.exec(batch);
  if (!match) throw new Error(`Invalid review batch key: ${batch}`);
  const minDex = Number(match[1]);
  const maxDex = Number(match[2]);
  if (minDex < 1 || maxDex < minDex) throw new Error(`Invalid review batch range: ${batch}`);
  return { minDex, maxDex };
}

export function reviewBatchGeneratorPath(batch: string) {
  parseReviewBatchKey(batch);
  return batch === "001-030" ? "scripts/generate-review.ts" : `scripts/generate-review-${batch}.ts`;
}
