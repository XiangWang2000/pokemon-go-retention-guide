import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms387416 } from "@/data/batch-387-416";
import { releasedShadowForms387416 } from "@/data/batch-387-416-gameplay";
import {
  allPvpokeMappings387416,
  pvpokeSpeciesId387416,
} from "@/data/batch-387-416-pvpoke";

type RankingRow = { speciesId: string };

function fixedPvPokeSpeciesIds() {
  const ids = new Set<string>();
  for (const cp of [1500, 2500, 10000]) {
    const rows = JSON.parse(
      readFileSync(`data/sources/pvpoke/rankings-${cp}.json`, "utf8").replace(/^\uFEFF/, ""),
    ) as RankingRow[];
    for (const row of rows) ids.add(row.speciesId);
  }
  return ids;
}

describe("Gen 4 #387-#416 PvPoke mappings", () => {
  const fixedIds = fixedPvPokeSpeciesIds();

  it("has exactly one mapping for every batch form", () => {
    const mappings = allPvpokeMappings387416();
    expect(Object.keys(mappings).sort()).toEqual(forms387416.map((form) => form.id).sort());
  });

  it("resolves every normal form into the pinned PvPoke ranking snapshots", () => {
    const missing = forms387416
      .map((form) => pvpokeSpeciesId387416(form, false))
      .filter((speciesId) => !fixedIds.has(speciesId));
    expect(missing).toEqual([]);
  });

  it("resolves every currently released Shadow form into the same pinned snapshots", () => {
    const missing = forms387416
      .filter((form) => releasedShadowForms387416.has(form.id))
      .map((form) => pvpokeSpeciesId387416(form, true))
      .filter((speciesId) => !fixedIds.has(speciesId));
    expect(missing).toEqual([]);
  });
});
