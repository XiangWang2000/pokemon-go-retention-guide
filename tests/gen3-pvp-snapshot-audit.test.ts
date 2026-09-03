import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms252281, pvpokeSpeciesId252281 } from "@/data/batch-252-281";
import { forms282311, pvpokeSpeciesId282311 } from "@/data/batch-282-311";
import { forms312341, pvpokeSpeciesId312341 } from "@/data/batch-312-341";
import { forms342371, pvpokeSpeciesId342371 } from "@/data/batch-342-371";
import { forms372386, pvpokeSpeciesId372386 } from "@/data/batch-372-386";
import type { Gen3Form } from "@/data/batch-gen3-types";

type RankingRow = { speciesId: string };
type Mapper = (form: Gen3Form, shadow: boolean) => string;

const batches: Array<{ forms: Gen3Form[]; mapper: Mapper }> = [
  { forms: forms252281, mapper: pvpokeSpeciesId252281 },
  { forms: forms282311, mapper: pvpokeSpeciesId282311 },
  { forms: forms312341, mapper: pvpokeSpeciesId312341 },
  { forms: forms342371, mapper: pvpokeSpeciesId342371 },
  { forms: forms372386, mapper: pvpokeSpeciesId372386 },
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

describe("Gen3 PvP snapshot audit", () => {
  it("has no Gen3 normal/shadow crossing of the keep buckets from the legacy snapshot to 2026-09-01", () => {
    const crossings: string[] = [];
    for (const cp of [1500, 2500, 10000]) {
      const oldRanks = rankMap(rankings(`../data/sources/pvpoke/rankings-${cp}.json`));
      const newRanks = rankMap(
        rankings(`../data/sources/pvpoke/2026-09-01/rankings-${cp}.json`),
      );
      for (const batch of batches) {
        for (const form of batch.forms.filter((item) => !item.isStub && item.includeVariants !== false)) {
          for (const shadow of [false, true]) {
            const speciesId = batch.mapper(form, shadow);
            const oldBucket = retentionBucket(oldRanks.get(speciesId));
            const newBucket = retentionBucket(newRanks.get(speciesId));
            if (oldBucket !== newBucket) {
              crossings.push(
                `${cp}:${speciesId}:${oldBucket}->${newBucket}`,
              );
            }
          }
        }
      }
    }
    expect(crossings).toEqual([]);
  });
});
