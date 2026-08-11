import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  filterAuditRows,
  toAuditRowSummary,
  type AuditQuery,
  type AuditRowSummary,
} from "@/lib/audit-data";
import type { DashboardRow } from "@/lib/data";

const bulbasaur = JSON.parse(
  readFileSync("public/data/audit/001-2d-kanto-2d-normal.json", "utf8"),
) as DashboardRow;

const pvpQuery: AuditQuery = {
  query: "",
  decision: "ALL",
  variant: "ALL",
  use: "PVP",
  generation: "ALL",
  region: "ALL",
  freshness: "ALL",
  reviewed: "ALL",
  sort: "DEX_ASC",
  page: 1,
  pageSize: 40,
};

function filtered(rows: AuditRowSummary[]) {
  return filterAuditRows(rows, pvpQuery, null);
}

describe("audit PvP use filtering", () => {
  it("does not treat a verified but non-actionable standard-league rank as PvP use", () => {
    const summary = toAuditRowSummary(bulbasaur);

    expect(summary.hasPvpUse).toBe(true);
    expect(summary.pvpRanks.GREAT).toBe(1040);
    expect(filtered([summary])).toEqual([]);
  });

  it("keeps actionable standard-league ranks", () => {
    const summary = toAuditRowSummary(bulbasaur);
    summary.pvpRanks.GREAT = 100;

    expect(filtered([summary]).map((row) => row.id)).toEqual([summary.id]);
  });

  it("preserves legacy or special-cup fallback when no standard-league rank exists", () => {
    const summary = toAuditRowSummary(bulbasaur);
    summary.pvpRanks = { GREAT: null, ULTRA: null, MASTER: null };
    summary.hasPvpUse = true;

    expect(filtered([summary]).map((row) => row.id)).toEqual([summary.id]);
  });
});
