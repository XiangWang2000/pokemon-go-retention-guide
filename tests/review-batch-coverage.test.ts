import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  BATCH_REGISTRY,
  assertBatchRegistry,
  batchImportArgs,
  batchReviewArgs,
  getBatchByKey,
  parseBatchKey,
} from "@/config/batch-registry";
import { getBatchImportInvocation } from "../scripts/import-batch";

describe("review batch coverage", () => {
  it("keeps the published registry ordered, unique, and contiguous", () => {
    assertBatchRegistry();
    const keys = BATCH_REGISTRY.map((entry) => entry.key);
    const ranges = BATCH_REGISTRY.map(({ minDex, maxDex }) => ({ minDex, maxDex }));

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(BATCH_REGISTRY.map((entry) => entry.review.jsonPath)).size).toBe(keys.length);
    expect(new Set(BATCH_REGISTRY.map((entry) => entry.review.markdownPath)).size).toBe(
      keys.length,
    );
    expect(ranges[0]?.minDex).toBe(1);
    for (let index = 1; index < ranges.length; index += 1) {
      expect(ranges[index]?.minDex).toBe((ranges[index - 1]?.maxDex ?? 0) + 1);
    }
    expect(ranges.at(-1)?.maxDex).toBe(CURRENT_DATA_MAX_DEX);
  });

  it("supports batch ranges that cross into four-digit Pokédex numbers", () => {
    expect(parseBatchKey("990-1019")).toEqual({ minDex: 990, maxDex: 1019 });
    expect(parseBatchKey("1000-1025")).toEqual({ minDex: 1000, maxDex: 1025 });
  });

  it("rejects malformed or reversed batch ranges", () => {
    expect(() => parseBatchKey("99-120")).toThrow();
    expect(() => parseBatchKey("1000-999")).toThrow();
    expect(() => parseBatchKey("000-030")).toThrow();
  });

  it("keeps reports and generators aligned with every configured batch", () => {
    for (const entry of BATCH_REGISTRY) {
      expect(existsSync(entry.review.jsonPath)).toBe(true);
      expect(existsSync(entry.review.markdownPath)).toBe(true);
      expect(existsSync(entry.review.generator)).toBe(true);
      const payload = JSON.parse(readFileSync(entry.review.jsonPath, "utf8")) as {
        batch?: string;
      };
      expect(payload.batch).toBe(entry.key);
    }
  });

  it("looks up and dispatches imports through the same registry", () => {
    const phases = BATCH_REGISTRY.map((entry) => entry.import.phase);
    const phaseOrder = { seed: 0, "pre-recompute": 1, "post-recompute": 2 } as const;
    expect(phases[0]).toBe("seed");
    expect(phases.filter((phase) => phase === "seed")).toHaveLength(1);
    for (let index = 1; index < phases.length; index += 1) {
      expect(phaseOrder[phases[index]]).toBeGreaterThanOrEqual(phaseOrder[phases[index - 1]]);
    }
    for (const entry of BATCH_REGISTRY) {
      const invocation = getBatchImportInvocation(entry.key);
      const expectedArgs =
        entry.import.entrypoint === null
          ? ["prisma", "db", "seed"]
          : ["tsx", entry.import.entrypoint, ...(entry.import.passBatchKey ? [entry.key] : [])];
      expect(invocation.entry).toBe(entry);
      expect(invocation.args).toEqual(expectedArgs);
      expect(batchImportArgs(entry.key)).toEqual(expectedArgs);
      if (entry.import.entrypoint !== null) expect(existsSync(entry.import.entrypoint)).toBe(true);
      expect(batchReviewArgs(entry)).toEqual([
        entry.review.generator,
        ...(entry.review.passBatchKey ? [entry.key] : []),
      ]);
    }
    expect(() => getBatchByKey("not-a-batch")).toThrow();
  });

  it("runs review generation through the shared registry runner", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    const runner = readFileSync("scripts/generate-all-reviews.ts", "utf8");

    expect(pkg.scripts["review:generate"]).toBe("tsx scripts/generate-all-reviews.ts");
    expect(pkg.scripts["data:import:batch"]).toBe("tsx scripts/import-batch.ts");
    expect(Object.keys(pkg.scripts).filter((name) => name.startsWith("data:import:"))).toEqual([
      "data:import:batch",
    ]);
    expect(
      BATCH_REGISTRY.filter((entry) => ["182-211", "212-241", "242-251"].includes(entry.key)).map(
        (entry) => [entry.review.generator, entry.review.passBatchKey],
      ),
    ).toEqual([
      ["scripts/generate-review-johto.ts", true],
      ["scripts/generate-review-johto.ts", true],
      ["scripts/generate-review-johto.ts", true],
    ]);
    expect(runner).toContain("BATCH_REGISTRY");
    expect(runner).toContain("batchReviewArgs");
    expect(runner).not.toContain("REVIEW_BATCH_FILES");
    expect(runner).not.toContain("spawnSync");
  });
});
