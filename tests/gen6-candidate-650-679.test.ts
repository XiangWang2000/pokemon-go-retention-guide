import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  deferredEvolutionTargets650679,
  evolutionPairs650679,
  flowerColors650679,
  forms650679,
  furfrouFormTransitions650679,
  furfrouTrims650679,
  gen6Candidate650679,
  species650679,
  vivillonPatterns650679,
} from "@/data/candidates/gen6-650-679";

describe("Gen6 #650-#679 identity candidate", () => {
  it("stages immediately after the formal #649 release without expanding production", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "650-679")).toMatchObject({
      minDex: 650,
      maxDex: 679,
      generation: 6,
      stage: "IDENTITY",
    });
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
  });

  it("covers exactly 30 National Dex identities and 106 exact forms", () => {
    expect(species650679.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 650 + index),
    );
    expect(forms650679).toHaveLength(106);
    expect(new Set(forms650679.map((form) => form.id)).size).toBe(106);
    expect(forms650679.every((form) => form.regionKey === "KALOS")).toBe(true);
    expect(gen6Candidate650679.key).toBe("650-679");
  });

  it("keeps all 18 Vivillon pattern lineages isolated from Scatterbug through Vivillon", () => {
    expect(vivillonPatterns650679).toHaveLength(18);
    for (const pattern of vivillonPatterns650679) {
      const scatterbug = forms650679.find((form) => form.id === `664-${pattern.slug}`)!;
      const spewpa = forms650679.find((form) => form.id === `665-${pattern.slug}`)!;
      const vivillon = forms650679.find((form) => form.id === `666-${pattern.slug}`)!;
      expect(scatterbug.evolvesFromFormId).toBeNull();
      expect(spewpa.evolvesFromFormId).toBe(scatterbug.id);
      expect(vivillon.evolvesFromFormId).toBe(spewpa.id);
    }
    expect(forms650679.filter((form) => form.dexNumber === 664)).toHaveLength(18);
    expect(forms650679.filter((form) => form.dexNumber === 665)).toHaveLength(18);
    expect(forms650679.filter((form) => form.dexNumber === 666)).toHaveLength(18);
  });

  it("preserves gender-matched Litleo/Pyroar and Espurr/Meowstic evolution branches", () => {
    for (const [fromDex, toDex] of [[667, 668], [677, 678]] as const) {
      for (const gender of ["male", "female"] as const) {
        const from = forms650679.find((form) => form.id === `${fromDex}-${gender}`)!;
        const to = forms650679.find((form) => form.id === `${toDex}-${gender}`)!;
        expect(from.evolvesFromFormId).toBeNull();
        expect(to.evolvesFromFormId).toBe(from.id);
      }
    }
  });

  it("keeps all five Flabébé flower-color lines exact through Florges", () => {
    expect(flowerColors650679).toHaveLength(5);
    for (const color of flowerColors650679) {
      const flabebe = forms650679.find((form) => form.id === `669-${color.slug}`)!;
      const floette = forms650679.find((form) => form.id === `670-${color.slug}`)!;
      const florges = forms650679.find((form) => form.id === `671-${color.slug}`)!;
      expect(floette.evolvesFromFormId).toBe(flabebe.id);
      expect(florges.evolvesFromFormId).toBe(floette.id);
    }
  });

  it("models Furfrou trims as form changes, never evolution edges", () => {
    expect(furfrouTrims650679).toHaveLength(10);
    expect(forms650679.filter((form) => form.dexNumber === 676)).toHaveLength(10);
    expect(forms650679.filter((form) => form.dexNumber === 676).every((form) => form.evolvesFromFormId === null)).toBe(true);
    expect(furfrouFormTransitions650679).toHaveLength(9);
    for (const transition of furfrouFormTransitions650679) {
      expect(transition.fromFormId).toBe("676-natural");
      expect(transition.mechanic).toBe("FORM_CHANGE");
      expect(transition.reversible).toBe(true);
      expect(transition.candyCost).toBe(25);
      expect(transition.stardustCost).toBe(10_000);
    }
  });

  it("keeps every materialized evolution edge within one family", () => {
    expect(evolutionPairs650679).toHaveLength(61);
    const formById = new Map(forms650679.map((form) => [form.id, form]));
    const speciesByDex = new Map(species650679.map((species) => [species.dexNumber, species]));
    for (const [fromFormId, toFormId] of evolutionPairs650679) {
      const from = formById.get(fromFormId)!;
      const to = formById.get(toFormId)!;
      expect(speciesByDex.get(from.dexNumber)?.familyKey).toBe(speciesByDex.get(to.dexNumber)?.familyKey);
      expect(to.evolvesFromFormId).toBe(fromFormId);
    }
  });

  it("clears the Honedge handoff once #680 is owned by the next slice", () => {
    expect(deferredEvolutionTargets650679).toEqual([]);
  });

  it("records identity provenance without promoting identity into release or battle value", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-650-679.json", "utf8"),
    ) as {
      status: string;
      expected: Record<string, unknown>;
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected).toMatchObject({
      dexCount: 30,
      formCount: 106,
      vivillonPatternCount: 18,
      flowerColorCount: 5,
      furfrouFormCount: 10,
      materializedEvolutionCount: 61,
    });
    expect(manifest.boundary).toContain("does not assert PvP rank");
    expect(manifest.boundary).toContain("Form Change is never an evolution edge");
  });
});
