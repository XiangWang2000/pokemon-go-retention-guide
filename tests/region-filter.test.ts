import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { filterAuditRows, type AuditQuery, type AuditRowSummary } from "@/lib/audit-data";
import { normalizeFilterValue, regionFilterValues } from "@/lib/evaluation-filters";
import { zhTw } from "@/locales/zh-TW";

const hoennRow: AuditRowSummary = {
  id: "252-hoenn-normal",
  formId: "252-hoenn",
  dexNumber: 252,
  nameEn: "Treecko",
  nameZhTw: "木守宮",
  formNameEn: "Hoenn",
  formNameZhTw: "豐緣",
  aliases: [],
  evolutionNames: [],
  regionKey: "HOENN",
  variantKey: "NORMAL",
  decision: "CONDITIONAL_KEEP",
  confidence: "MEDIUM",
  updatedAt: "2026-08-08T16:00:00.000Z",
  reviewed: true,
  pvpRanks: { GREAT: null, ULTRA: null, MASTER: null },
  sourceCount: 0,
  hasPvpUse: false,
  pveUseLevels: [],
  hasRocketUse: false,
  gymRating: "NOT_APPLICABLE",
  hasMegaUse: false,
  hasMaxUse: false,
  hasEvolutionUse: false,
};

const hoennQuery: AuditQuery = {
  query: "",
  decision: "ALL",
  variant: "ALL",
  use: "ALL",
  generation: "ALL",
  region: "HOENN",
  freshness: "ALL",
  reviewed: "ALL",
  sort: "DEX_ASC",
  page: 1,
  pageSize: 40,
};

describe("region filtering", () => {
  it("keeps every localized region available to the filter", () => {
    for (const region of Object.keys(zhTw.region)) {
      expect(regionFilterValues).toContain(region);
      expect(normalizeFilterValue(region, regionFilterValues, "ALL")).toBe(region);
    }
  });

  it("keeps every committed runtime region filterable and localized", () => {
    const auditSummary = JSON.parse(readFileSync("site-data/auditSummary.json", "utf8")) as {
      rows: Array<{ regionKey: string }>;
    };
    const runtimeRegions = new Set(auditSummary.rows.map((row) => row.regionKey));

    for (const region of runtimeRegions) {
      expect(regionFilterValues).toContain(region);
      expect(normalizeFilterValue(region, regionFilterValues, "ALL")).toBe(region);
      expect(zhTw.region).toHaveProperty(region);
    }
  });

  it("matches current Hoenn runtime rows", () => {
    expect(filterAuditRows([hoennRow], hoennQuery, null)).toEqual([hoennRow]);
  });
});
