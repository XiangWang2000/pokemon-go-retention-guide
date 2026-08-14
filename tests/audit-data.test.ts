import { describe, expect, it } from "vitest";
import { filterAuditRows, normalizeAuditQuery, type AuditSummarySnapshot } from "@/lib/audit-data";
import auditSummarySnapshot from "../site-data/auditSummary.json";

const snapshot = auditSummarySnapshot as unknown as AuditSummarySnapshot;

describe("Audit static data", () => {
  it("normalizes invalid URL filter values", () => {
    const query = normalizeAuditQuery(
      new URLSearchParams({
        decision: "OLD_DECISION",
        variant: "OLD_VARIANT",
        use: "OLD_USE",
        generation: "GEN0",
        region: "UNKNOWN",
        sort: "OLD_SORT",
      }),
    );

    expect(query).toMatchObject({
      decision: "ALL",
      variant: "ALL",
      use: "ALL",
      generation: "ALL",
      region: "ALL",
      sort: "DEX_ASC",
    });
  });

  it("filters the static audit summary without a server API", () => {
    const query = normalizeAuditQuery(new URLSearchParams({ decision: "KEEP" }));
    const filtered = filterAuditRows(snapshot.rows, query, snapshot.dataAsOf);

    expect(snapshot.rows).toHaveLength(1912);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(snapshot.rows.length);
  });

  it("paginates the complete static audit summary in the browser", () => {
    const query = normalizeAuditQuery(new URLSearchParams({ decision: "invalid", page: "999" }));
    const filtered = filterAuditRows(snapshot.rows, query, snapshot.dataAsOf);
    const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = filtered.slice((page - 1) * query.pageSize, page * query.pageSize);

    expect(filtered).toHaveLength(snapshot.rows.length);
    expect(rows.length).toBeLessThanOrEqual(query.pageSize);
    expect(page).toBe(pageCount);
  });
});
