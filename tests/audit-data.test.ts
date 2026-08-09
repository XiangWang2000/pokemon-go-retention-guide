import { describe, expect, it } from "vitest";
import { GET as homeApi } from "@/app/api/home/route";
import { filterAuditRows, normalizeAuditQuery, type AuditSummarySnapshot } from "@/lib/audit-data";
import auditSummarySnapshot from "../site-data/auditSummary.json";

const snapshot = auditSummarySnapshot as unknown as AuditSummarySnapshot;

describe("Audit 分頁資料", () => {
  it("會將未知網址參數回復到合法預設值", () => {
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

  it("篩選索引不需要載入完整 dashboard，且總數仍保留完整分母", () => {
    const query = normalizeAuditQuery(new URLSearchParams({ decision: "KEEP" }));
    const filtered = filterAuditRows(snapshot.rows, query, snapshot.dataAsOf);

    expect(snapshot.rows).toHaveLength(1752);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(snapshot.rows.length);
  });

  it("Audit API 回傳頁面筆數與完整總數", async () => {
    const response = await homeApi(
      new Request("https://example.test/api/home?scope=audit&decision=invalid&page=999"),
    );
    const payload = (await response.json()) as {
      rows: unknown[];
      total: number;
      overallTotal: number;
      page: number;
      pageSize: number;
    };

    expect(response.ok).toBe(true);
    expect(payload.overallTotal).toBe(1752);
    expect(payload.total).toBe(1752);
    expect(payload.rows.length).toBeLessThanOrEqual(payload.pageSize);
    expect(payload.page).toBe(44);
  });
});
