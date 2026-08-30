import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { expectedReleaseReviewPaths } from "@/config/release-contract";

function entries(directory: string) {
  return readdirSync(directory).sort((left, right) => left.localeCompare(right));
}

function files(directory: string) {
  return entries(directory).filter((entry) => statSync(path.join(directory, entry)).isFile());
}

describe("repository organization", () => {
  it("keeps executable scripts grouped by responsibility", () => {
    expect(entries("scripts")).toEqual(["data", "pages", "release", "review", "verify.ps1"]);
    expect(files("scripts/data").length).toBeGreaterThan(0);
    expect(files("scripts/pages").every((file) => file.endsWith(".mjs"))).toBe(true);
    expect(files("scripts/release").every((file) => file.endsWith(".ts"))).toBe(true);
    expect(files("scripts/review").every((file) => file.endsWith(".ts"))).toBe(true);
  });

  it("names the repeatable IV phase as materialization rather than a one-off backfill", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["data:materialize-iv"]).toBe(
      "tsx scripts/data/materialize-structured-iv.ts",
    );
    expect(packageJson.scripts["data:backfill-iv"]).toBeUndefined();
    expect(files("scripts/data")).not.toContain("backfill-structured-iv.ts");
  });

  it("keeps current release reviews separate from historical checkpoints", () => {
    const current = files("review")
      .filter((file) => file.endsWith(".json") || file.endsWith(".md"))
      .map((file) => `review/${file}`)
      .sort();
    expect(current).toEqual([...expectedReleaseReviewPaths()].sort());
    expect(files("review/history")).toEqual(
      expect.arrayContaining(["001-386-recalibration.json", "001-386-recalibration.md"]),
    );
    expect(files("review/history")).toContain("family-aggregation-20260718.json");
    expect(files("review/history")).toContain("family-aggregation-20260718.md");
  });

  it("routes non-current recalibration reports to review/history", () => {
    const generators = [
      readFileSync("scripts/review/generate-current-recalibration-report.ts", "utf8"),
      readFileSync("scripts/data/recompute-retention.ts", "utf8"),
    ];
    for (const generator of generators) {
      expect(generator).toContain("const outputDirectory");
      expect(generator).toContain('"review/history"');
    }
    expect(generators[0]).toContain("`${outputDirectory}/${reportScope}-recalibration.json`");
    expect(generators[0]).toContain("`${outputDirectory}/${reportScope}-recalibration.md`");
  });

  it("separates source evidence, historical notes, and historical docs", () => {
    expect(entries("research_notes")).toEqual(
      ["README.md", "history", "sources"].sort((left, right) => left.localeCompare(right)),
    );
    expect(files("research_notes/sources").every((file) => file.endsWith(".json"))).toBe(true);
    expect(files("research_notes/history").every((file) => file.endsWith(".md"))).toBe(true);
    expect(entries("docs")).toContain("history");
    expect(files("docs/history")).toEqual(
      expect.arrayContaining([
        "README.md",
        "legacy-sites-migration.md",
        "r21-canonical-database-reset.md",
      ]),
    );
  });
});
