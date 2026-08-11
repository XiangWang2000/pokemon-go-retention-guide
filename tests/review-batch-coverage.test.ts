import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  REVIEW_BATCH_FILES,
  parseReviewBatchKey,
  reviewBatchGeneratorPath,
} from "@/config/review-batches";

describe("review batch coverage", () => {
  it("covers the current Pokédex scope contiguously", () => {
    const ranges = REVIEW_BATCH_FILES.map(([batch]) => parseReviewBatchKey(batch));

    expect(ranges[0]?.minDex).toBe(1);
    for (let index = 1; index < ranges.length; index += 1) {
      expect(ranges[index]?.minDex).toBe((ranges[index - 1]?.maxDex ?? 0) + 1);
    }
    expect(ranges.at(-1)?.maxDex).toBe(CURRENT_DATA_MAX_DEX);
  });

  it("supports review ranges that cross into four-digit Pokédex numbers", () => {
    expect(parseReviewBatchKey("990-1019")).toEqual({ minDex: 990, maxDex: 1019 });
    expect(parseReviewBatchKey("1000-1025")).toEqual({ minDex: 1000, maxDex: 1025 });
  });

  it("rejects malformed or reversed review ranges", () => {
    expect(() => parseReviewBatchKey("99-120")).toThrow();
    expect(() => parseReviewBatchKey("1000-999")).toThrow();
    expect(() => parseReviewBatchKey("000-030")).toThrow();
  });

  it("keeps reports and generators aligned with every configured batch", () => {
    for (const [batch, jsonPath] of REVIEW_BATCH_FILES) {
      expect(existsSync(jsonPath)).toBe(true);
      expect(existsSync(jsonPath.replace(/\.json$/, ".md"))).toBe(true);
      expect(existsSync(reviewBatchGeneratorPath(batch))).toBe(true);
    }
  });

  it("runs review generation through the shared batch-driven runner", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    const runner = readFileSync("scripts/generate-all-reviews.ts", "utf8");

    expect(pkg.scripts["review:generate"]).toBe("tsx scripts/generate-all-reviews.ts");
    expect(runner).toContain("REVIEW_BATCH_FILES");
    expect(runner).toContain("reviewBatchGeneratorPath");
    expect(runner).not.toContain("generate-review-372-386.ts");
  });
});
