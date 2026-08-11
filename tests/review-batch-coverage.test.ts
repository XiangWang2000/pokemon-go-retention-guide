import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { REVIEW_BATCH_FILES, parseReviewBatchKey } from "@/config/review-batches";

describe("review batch coverage", () => {
  it("covers the current Pokédex scope contiguously", () => {
    const ranges = REVIEW_BATCH_FILES.map(([batch]) => parseReviewBatchKey(batch));

    expect(ranges[0]?.minDex).toBe(1);
    for (let index = 1; index < ranges.length; index += 1) {
      expect(ranges[index]?.minDex).toBe((ranges[index - 1]?.maxDex ?? 0) + 1);
    }
    expect(ranges.at(-1)?.maxDex).toBe(CURRENT_DATA_MAX_DEX);
  });

  it("keeps reports and generators aligned with every configured batch", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    const generateCommand = pkg.scripts["review:generate"] ?? "";

    for (const [batch, jsonPath] of REVIEW_BATCH_FILES) {
      expect(existsSync(jsonPath)).toBe(true);
      expect(existsSync(jsonPath.replace(/\.json$/, ".md"))).toBe(true);
      const generator = batch === "001-030" ? "scripts/generate-review.ts" : `scripts/generate-review-${batch}.ts`;
      expect(existsSync(generator)).toBe(true);
      expect(generateCommand).toContain(generator);
    }
  });
});
