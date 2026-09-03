import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import {
  deferredEvolutionTargets524553,
  evolutionPairs524553,
  forms524553,
  gen5Candidate524553,
  species524553,
} from "@/data/candidates/gen5-524-553";

describe("Gen5 #524-#553 publication candidate", () => {
  it("registers a contiguous second candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CANDIDATE_BATCH_REGISTRY.map((entry) => entry.key)).toEqual([
      "494-523",
      "524-553",
    ]);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "524-553")).toMatchObject({
      minDex: 524,
      maxDex: 553,
      generation: 5,
      stage: "IDENTITY",
    });
  });

  it("covers 30 National Dex identities as 33 exact Pokémon GO forms", () => {
    expect(species524553.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 524 + index),
    );
    expect(forms524553).toHaveLength(33);
    expect(new Set(forms524553.map((form) => form.id)).size).toBe(33);
    expect(gen5Candidate524553.key).toBe("524-553");
  });

  it("splits Lilligant and Basculin forms instead of collapsing them by species", () => {
    expect(forms524553.filter((form) => form.dexNumber === 549).map((form) => form.id)).toEqual([
      "549-unova",
      "549-hisui",
    ]);
    expect(forms524553.filter((form) => form.dexNumber === 550).map((form) => form.id)).toEqual([
      "550-red-striped",
      "550-blue-striped",
      "550-white-striped",
    ]);

    expect(forms524553.find((form) => form.id === "549-hisui")).toMatchObject({
      regionKey: "HISUI",
      types: ["GRASS", "FIGHTING"],
      evolvesFromFormId: null,
    });
    expect(forms524553.find((form) => form.id === "550-white-striped")).toMatchObject({
      regionKey: "HISUI",
      types: ["WATER"],
    });
  });

  it("never invents a Petilil -> Hisuian Lilligant Pokémon GO evolution edge", () => {
    expect(evolutionPairs524553).toContainEqual(["548-unova", "549-unova"]);
    expect(evolutionPairs524553).not.toContainEqual(["548-unova", "549-hisui"]);
    expect(forms524553.find((form) => form.id === "549-hisui")?.evolvesFromFormId).toBeNull();
  });

  it("keeps local evolution edges family-consistent", () => {
    const formById = new Map(forms524553.map((form) => [form.id, form]));
    const speciesByDex = new Map(species524553.map((species) => [species.dexNumber, species]));
    expect(evolutionPairs524553).toHaveLength(16);

    for (const [fromFormId, toFormId] of evolutionPairs524553) {
      const from = formById.get(fromFormId);
      const to = formById.get(toFormId);
      expect(from, fromFormId).toBeDefined();
      expect(to, toFormId).toBeDefined();
      expect(speciesByDex.get(from!.dexNumber)?.familyKey).toBe(
        speciesByDex.get(to!.dexNumber)?.familyKey,
      );
    }
  });

  it("defers White-Striped Basculin -> #902 until the Gen8 endpoint is owned", () => {
    expect(deferredEvolutionTargets524553).toEqual([
      {
        fromFormId: "550-white-striped",
        targetDexNumber: 902,
        targetFormKey: "HISUI",
        reasonZhTw: expect.stringContaining("Gen8"),
      },
    ]);
    expect(forms524553.some((form) => form.dexNumber === 902)).toBe(false);
  });

  it("records exact Pokémon GO form provenance and boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-524-553.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      expected: {
        dexCount: number;
        formCount: number;
        multiFormDex: Record<string, string[]>;
        deferredEvolutionTargets: Array<{
          fromFormId: string;
          targetDexNumber: number;
          targetFormKey: string;
        }>;
      };
      boundary: string;
    };

    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected.dexCount).toBe(30);
    expect(manifest.expected.formCount).toBe(33);
    expect(manifest.expected.multiFormDex["549"]).toEqual(["549-unova", "549-hisui"]);
    expect(manifest.expected.multiFormDex["550"]).toEqual([
      "550-red-striped",
      "550-blue-striped",
      "550-white-striped",
    ]);
    expect(manifest.boundary).toContain("Hisuian Lilligant is an independent Pokémon GO form");
    expect(manifest.boundary).toContain("deferred until the Gen8 candidate");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
