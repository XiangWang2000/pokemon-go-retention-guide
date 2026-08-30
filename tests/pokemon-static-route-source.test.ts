import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Pokémon static route source", () => {
  it("enumerates detail routes and sitemap entries from the compact audit summary", () => {
    for (const sourcePath of ["src/app/pokemon/[variantId]/page.tsx", "src/app/sitemap.ts"]) {
      const source = readFileSync(sourcePath, "utf8");
      expect(source).toContain("site-data/auditSummary.json");
      expect(source).not.toContain("site-data/dashboard.json");
    }

    const manifest = JSON.parse(readFileSync("site-data/manifest.json", "utf8")) as {
      counts: { auditSummaryRows: number };
    };
    const auditSummary = JSON.parse(readFileSync("site-data/auditSummary.json", "utf8")) as {
      rows: Array<{ id: string }>;
    };

    expect(auditSummary.rows).toHaveLength(manifest.counts.auditSummaryRows);
    expect(new Set(auditSummary.rows.map((row) => row.id)).size).toBe(auditSummary.rows.length);

    const auditSummaryBytes = statSync("site-data/auditSummary.json").size;
    const dashboardBytes = statSync("site-data/dashboard.json").size;
    expect(auditSummaryBytes * 10).toBeLessThan(dashboardBytes);
  });
});
