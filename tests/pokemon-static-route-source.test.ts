import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Pokémon static route source", () => {
  it("enumerates routes from the compact audit summary instead of the full dashboard", () => {
    const pageSource = readFileSync("src/app/pokemon/[variantId]/page.tsx", "utf8");
    expect(pageSource).toContain("site-data/auditSummary.json");
    expect(pageSource).not.toContain("site-data/dashboard.json");

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
