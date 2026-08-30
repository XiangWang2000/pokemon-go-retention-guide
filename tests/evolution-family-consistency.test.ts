import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  batchSpecies,
  evolutionPairs as evolutionPairs001030,
  familyKeyByDex,
} from "@/data/batch-001-030";
import { evolutionPairs031060, species031060 } from "@/data/batch-031-060";
import { evolutionPairs061090, species061090 } from "@/data/batch-061-090";
import { evolutionPairs091120, species091120 } from "@/data/batch-091-120";
import { evolutionPairs121151, species121151 } from "@/data/batch-121-151";
import { evolutionPairs152181, species152181 } from "@/data/batch-152-181";
import { evolutionPairs182211, species182211 } from "@/data/batch-182-211";
import { evolutionPairs212241, species212241 } from "@/data/batch-212-241";
import { evolutionPairs242251, species242251 } from "@/data/batch-242-251";
import { evolutionPairs252281, species252281 } from "@/data/batch-252-281";
import { evolutionPairs282311, species282311 } from "@/data/batch-282-311";
import { evolutionPairs312341, species312341 } from "@/data/batch-312-341";
import { evolutionPairs342371, species342371 } from "@/data/batch-342-371";
import { evolutionPairs372386, species372386 } from "@/data/batch-372-386";
import { evolutionPairs387416, species387416 } from "@/data/batch-387-416";
import { evolutionPairs417493, species417493 } from "@/data/batch-417-493";
import { canonicalGen2EvolutionFamilies212241 } from "@/data/canonical/gen2-212-241";
import { canonicalGen2EvolutionFamilies182211 } from "@/data/canonical/gen2-182-211";
import { canonicalGen4EvolutionFamilies417493 } from "@/data/canonical/gen4-417-493";
import {
  validateEvolutionFamilyConsistency,
  validateEvolutionTargetFamilyKeys,
} from "@/data/evolution-family-validation";

const allSpecies = [
  ...batchSpecies.map((species) => ({ ...species, familyKey: familyKeyByDex[species.dexNumber]! })),
  ...species031060,
  ...species061090,
  ...species091120,
  ...species121151,
  ...species152181,
  ...species182211,
  ...species212241,
  ...species242251,
  ...species252281,
  ...species282311,
  ...species312341,
  ...species342371,
  ...species372386,
  ...species387416,
  ...species417493,
];

const allEvolutionPairs = [
  ...evolutionPairs001030,
  ...evolutionPairs031060,
  ...evolutionPairs061090,
  ...evolutionPairs091120,
  ...evolutionPairs121151,
  ...evolutionPairs152181,
  ...evolutionPairs182211,
  ...evolutionPairs212241,
  ...evolutionPairs242251,
  ...evolutionPairs252281,
  ...evolutionPairs282311,
  ...evolutionPairs312341,
  ...evolutionPairs342371,
  ...evolutionPairs372386,
  ...evolutionPairs387416,
  ...evolutionPairs417493,
];

const canonicalExpectations = [
  ...canonicalGen2EvolutionFamilies182211,
  ...canonicalGen2EvolutionFamilies212241,
  ...canonicalGen4EvolutionFamilies417493,
];

function formIdForTarget(target: { dexNumber: number; formKey: string }) {
  return `${String(target.dexNumber).padStart(3, "0")}-${target.formKey.toLowerCase()}`;
}

const crossGenerationManifest = JSON.parse(
  readFileSync("research_notes/sources/cross-generation-evolution-targets.json", "utf8"),
) as {
  targets: Array<{ dexNumber: number; formKey: string; familyKey: string }>;
};

const speciesFamilyByDex = new Map(
  allSpecies.map((species) => [species.dexNumber, species.familyKey]),
);
const sourceFamilyByFormId = new Map<string, string>();
for (const [fromFormId, toFormId] of allEvolutionPairs) {
  for (const formId of [fromFormId, toFormId]) {
    const familyKey = speciesFamilyByDex.get(Number(formId.slice(0, 3)));
    if (familyKey) sourceFamilyByFormId.set(formId, familyKey);
  }
}
const manifestTargetFamilies = crossGenerationManifest.targets.map((target) => ({
  formId: formIdForTarget(target),
  familyKey: target.familyKey,
}));
const sourceAndManifestFamilyByFormId = new Map(sourceFamilyByFormId);
for (const target of manifestTargetFamilies) {
  if (!sourceAndManifestFamilyByFormId.has(target.formId)) {
    sourceAndManifestFamilyByFormId.set(target.formId, target.familyKey);
  }
}

function readMaterializedGraph() {
  const rows = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as Array<{
    formId: string;
    variantKey: string;
    familyKey: string;
    evolutionPaths?: Array<{ toFormId: string }>;
  }>;
  const normalRows = rows.filter((row) => row.variantKey === "NORMAL");
  const familyByFormId = new Map(normalRows.map((row) => [row.formId, row.familyKey]));
  const pairs = normalRows.flatMap((row) =>
    (row.evolutionPaths ?? []).map((path) => [row.formId, path.toFormId] as const),
  );
  return { familyByFormId, pairs };
}

describe("canonical evolution-family consistency", () => {
  it("validates every published source edge and independent canonical edge", () => {
    expect(
      validateEvolutionFamilyConsistency({
        evolutionPairs: allEvolutionPairs,
        canonicalExpectations,
        familyByFormId: sourceAndManifestFamilyByFormId,
      }),
    ).toEqual([]);
  });

  it("fails when a canonical same-family edge is omitted", () => {
    const withoutTeddiursa = allEvolutionPairs.filter(
      ([fromFormId, toFormId]) => fromFormId !== "216-johto" || toFormId !== "217-johto",
    );
    expect(
      validateEvolutionFamilyConsistency({
        evolutionPairs: withoutTeddiursa,
        canonicalExpectations,
        familyByFormId: sourceAndManifestFamilyByFormId,
      }),
    ).toContain("Missing canonical evolution edge 216-johto->217-johto.");
  });

  it("fails when an actual edge has an unknown endpoint", () => {
    expect(
      validateEvolutionFamilyConsistency({
        evolutionPairs: [...allEvolutionPairs, ["999-unknown", "001-kanto"]],
        canonicalExpectations,
        familyByFormId: sourceAndManifestFamilyByFormId,
      }),
    ).toContain("Missing family identity for evolution source 999-unknown.");
  });

  it("fails when an exact scoped edge set contains an extra edge", () => {
    expect(
      validateEvolutionFamilyConsistency({
        evolutionPairs: [
          ["001-kanto", "002-kanto"],
          ["002-kanto", "003-kanto"],
        ],
        canonicalExpectations: [
          { fromFormId: "001-kanto", toFormId: "002-kanto", familyKey: "KANTO_FAMILY_001" },
        ],
        expectedEvolutionPairs: [["001-kanto", "002-kanto"]],
        familyByFormId: sourceAndManifestFamilyByFormId,
      }),
    ).toContain("Unexpected evolution edge 002-kanto->003-kanto.");
  });

  it("fails when any persisted edge splits its family identity", () => {
    const brokenFamilies = new Map(sourceAndManifestFamilyByFormId);
    brokenFamilies.set("424-sinnoh", "SINNOH_FAMILY_424");
    expect(
      validateEvolutionFamilyConsistency({
        evolutionPairs: allEvolutionPairs,
        canonicalExpectations,
        familyByFormId: brokenFamilies,
      }),
    ).toContain(
      "Evolution edge 190-johto->424-sinnoh splits family keys: JOHTO_FAMILY_190 -> SINNOH_FAMILY_424.",
    );
  });

  it("matches the persisted graph and manifest target families after a clean rebuild", () => {
    const materialized = readMaterializedGraph();
    const materializedFamilyByFormId = new Map(materialized.familyByFormId);
    for (const target of manifestTargetFamilies) {
      if (!materializedFamilyByFormId.has(target.formId)) {
        materializedFamilyByFormId.set(target.formId, target.familyKey);
      }
    }
    expect(
      validateEvolutionFamilyConsistency({
        evolutionPairs: materialized.pairs,
        canonicalExpectations,
        familyByFormId: materializedFamilyByFormId,
      }),
    ).toEqual([]);
    expect(
      validateEvolutionTargetFamilyKeys(
        manifestTargetFamilies.filter((target) => materialized.familyByFormId.has(target.formId)),
        materialized.familyByFormId,
      ),
    ).toEqual([]);
    expect(
      validateEvolutionTargetFamilyKeys(
        manifestTargetFamilies.filter((target) => sourceFamilyByFormId.has(target.formId)),
        sourceFamilyByFormId,
      ),
    ).toEqual([]);
  });
});
