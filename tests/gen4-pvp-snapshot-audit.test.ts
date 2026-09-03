import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms387416 } from "@/data/batch-387-416";
import { pvpokeSpeciesId387416 } from "@/data/batch-387-416-pvpoke";
import { forms417493, pvpokeSpeciesId417493 } from "@/data/batch-417-493";
import type { Gen4BatchForm } from "@/data/batch-gen4-types";

type RankingRow = { speciesId: string };
type Mapper = (form: Gen4BatchForm, shadow: boolean) => string;

const batches: Array<{ forms: Gen4BatchForm[]; mapper: Mapper }> = [
  { forms: forms387416, mapper: pvpokeSpeciesId387416 },
  { forms: forms417493, mapper: pvpokeSpeciesId417493 },
];

function rankings(path: string) {
  return JSON.parse(
    readFileSync(new URL(path, import.meta.url), "utf8").replace(/^\uFEFF/, ""),
  ) as RankingRow[];
}

function rankMap(rows: RankingRow[]) {
  return new Map(rows.map((row, index) => [row.speciesId, index + 1]));
}

function retentionBucket(rank: number | undefined) {
  if (rank === undefined) return "UNRANKED";
  if (rank <= 100) return "TOP_100";
  if (rank <= 250) return "101_250";
  return "OVER_250";
}

describe("Gen4 PvP snapshot audit", () => {
  it("reports every Gen4 normal/shadow retention-bucket crossing against 2026-09-01", () => {
    const crossings: string[] = [];
    for (const cp of [1500, 2500, 10000]) {
      const oldRanks = rankMap(rankings(`../data/sources/pvpoke/rankings-${cp}.json`));
      const newRanks = rankMap(
        rankings(`../data/sources/pvpoke/2026-09-01/rankings-${cp}.json`),
      );
      for (const batch of batches) {
        for (const form of batch.forms) {
          for (const shadow of [false, true]) {
            const speciesId = batch.mapper(form, shadow);
            const oldRank = oldRanks.get(speciesId);
            const newRank = newRanks.get(speciesId);
            const oldBucket = retentionBucket(oldRank);
            const newBucket = retentionBucket(newRank);
            if (oldBucket !== newBucket) {
              crossings.push(
                `${cp}:${form.id}:${shadow ? "SHADOW" : "NORMAL"}:${speciesId}:${oldRank ?? "unranked"}->${newRank ?? "unranked"}:${oldBucket}->${newBucket}`,
              );
            }
          }
        }
      }
    }

    expect(crossings).toEqual([]);
  });
});
