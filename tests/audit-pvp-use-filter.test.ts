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
const committedAuditSummary = JSON.parse(
  readFileSync("public/data/audit-summary.json", "utf8"),
) as { rows: AuditRowSummary[] };
const committedBulbasaur = committedAuditSummary.rows.find(
  (row) => row.id === "001-kanto-normal",
);

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
  it("does not generate PvP use for a verified but non-actionable standard-league rank", () => {
    const summary = toAuditRowSummary(bulbasaur);

    expect(summary.pvpRanks.GREAT).toBe(1040);
    expect(summary.hasPvpUse).toBe(false);
    expect(summary.hasSpecialCupUse).toBe(false);
    expect(summary.hasCuratedPvpUse).toBe(false);
    expect(filtered([summary])).toEqual([]);
  });

  it("filters the current committed false positive without regenerating the snapshot", () => {
    expect(committedBulbasaur).toBeDefined();
    expect(committedBulbasaur?.hasPvpUse).toBe(true);
    expect(committedBulbasaur?.pvpRanks.GREAT).toBe(1040);
    expect(filtered([committedBulbasaur!])).toEqual([]);
  });

  it("keeps actionable standard-league ranks", () => {
    const summary = toAuditRowSummary(bulbasaur);
    summary.pvpRanks.GREAT = 100;

    expect(filtered([summary]).map((row) => row.id)).toEqual([summary.id]);
  });

  it("preserves legacy fallback when no standard-league rank exists", () => {
    const summary = toAuditRowSummary(bulbasaur);
    summary.pvpRanks = { GREAT: null, ULTRA: null, MASTER: null };
    summary.hasPvpUse = true;
    summary.hasSpecialCupUse = undefined;
    summary.hasCuratedPvpUse = undefined;

    expect(filtered([summary]).map((row) => row.id)).toEqual([summary.id]);
  });

  it("preserves explicit special-cup or curated use in future summaries", () => {
    const specialCup = toAuditRowSummary(bulbasaur);
    specialCup.hasSpecialCupUse = true;
    const curated = toAuditRowSummary(bulbasaur);
    curated.hasCuratedPvpUse = true;

    expect(filtered([specialCup]).map((row) => row.id)).toEqual([specialCup.id]);
    expect(filtered([curated]).map((row) => row.id)).toEqual([curated.id]);
  });
});
