import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms584613, species584613 } from "@/data/candidates/gen5-584-613";
import {
  deferredEvolutionTargets614643,
  evolutionPairs614643,
  forms614643,
  gen5Candidate614643,
  species614643,
} from "@/data/candidates/gen5-614-643";

describe("Gen5 #614-#643 publication candidate", () => {
  it("registers a contiguous fifth candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "614-643")).toMatchObject({
      minDex: 614,
      maxDex: 643,
      generation: 5,
      stage: "IDENTITY",
    });
  });

  it("covers 30 National Dex identities as 34 exact Pokémon GO forms", () => {
    expect(species614643.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 614 + index),
    );
    expect(forms614643).toHaveLength(34);
    expect(new Set(forms614643.map((form) => form.id)).size).toBe(34);
    expect(gen5Candidate614643.key).toBe("614-643");
  });

  it("materializes the previous batch Cubchoo -> Beartic handoff exactly once", () => {
    expect(evolutionPairs614643).toContainEqual(["613-unova", "614-unova"]);
    expect(evolutionPairs614643.filter(([from]) => from === "613-unova")).toHaveLength(1);
    expect(forms614643.find((form) => form.id === "614-unova")?.evolvesFromFormId).toBe(
      "613-unova",
    );
  });

  it("keeps ordinary and Galarian Stunfisk exact identities separate", () => {
    expect(forms614643.filter((form) => form.dexNumber === 618).map((form) => form.id)).toEqual([
      "618-unova",
      "618-galar",
    ]);
    expect(forms614643.find((form) => form.id === "618-unova")).toMatchObject({
      regionKey: "UNOVA",
      types: ["GROUND", "ELECTRIC"],
    });
    expect(forms614643.find((form) => form.id === "618-galar")).toMatchObject({
      regionKey: "GALAR",
      types: ["GROUND", "STEEL"],
    });
  });

  it("allows Rufflet to evolve only into ordinary Braviary, never Hisuian Braviary", () => {
    expect(forms614643.filter((form) => form.dexNumber === 628).map((form) => form.id)).toEqual([
      "628-unova",
      "628-hisui",
    ]);
    expect(evolutionPairs614643).toContainEqual(["627-unova", "628-unova"]);
    expect(evolutionPairs614643).not.toContainEqual(["627-unova", "628-hisui"]);
    expect(forms614643.find((form) => form.id === "628-hisui")).toMatchObject({
      regionKey: "HISUI",
      types: ["PSYCHIC", "FLYING"],
      evolvesFromFormId: null,
    });
  });

  it("keeps Tornadus and Thundurus Incarnate/Therian forms non-interchangeable", () => {
    expect(forms614643.filter((form) => form.dexNumber === 641).map((form) => form.id)).toEqual([
      "641-incarnate",
      "641-therian",
    ]);
    expect(forms614643.filter((form) => form.dexNumber === 642).map((form) => form.id)).toEqual([
      "642-incarnate",
      "642-therian",
    ]);
    for (const formId of [
      "641-incarnate",
      "641-therian",
      "642-incarnate",
      "642-therian",
    ]) {
      expect(forms614643.find((form) => form.id === formId)?.evolvesFromFormId, formId).toBeNull();
      expect(evolutionPairs614643.some(([from, to]) => from === formId || to === formId), formId).toBe(
        false,
      );
    }
  });

  it("keeps every materialized evolution edge family-consistent across the batch boundary", () => {
    const allForms = [...forms584613, ...forms614643];
    const formById = new Map(allForms.map((form) => [form.id, form]));
    const familyByDex = new Map<number, string>(
      [...species584613, ...species614643].map((species) => [species.dexNumber, species.familyKey]),
    );

    expect(evolutionPairs614643).toHaveLength(10);
    for (const [fromFormId, toFormId] of evolutionPairs614643) {
      const from = formById.get(fromFormId);
      const to = formById.get(toFormId);
      expect(from, fromFormId).toBeDefined();
      expect(to, toFormId).toBeDefined();
      expect(familyByDex.get(from!.dexNumber), fromFormId).toBe(
        familyByDex.get(to!.dexNumber),
      );
    }
  });

  it("defers the real Bisharp -> Kingambit cross-generation edge until Gen9 owns #983", () => {
    expect(deferredEvolutionTargets614643).toEqual([
      {
        fromFormId: "625-unova",
        targetDexNumber: 983,
        targetFormKey: "PALDEA",
        reasonZhTw: expect.stringContaining("Gen9"),
      },
    ]);
    expect(forms614643.some((form) => form.dexNumber === 983)).toBe(false);
  });

  it("records exact identity provenance and anti-form-pollution boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-614-643.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      expected: {
        dexCount: number;
        formCount: number;
        multiFormDex: Record<string, string[]>;
        materializedIncomingEvolutionTargets: Array<{ fromFormId: string; toFormId: string }>;
        deferredEvolutionTargets: Array<{ fromFormId: string; targetDexNumber: number }>;
      };
      boundary: string;
    };

    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected.dexCount).toBe(30);
    expect(manifest.expected.formCount).toBe(34);
    expect(manifest.expected.multiFormDex["618"]).toEqual(["618-unova", "618-galar"]);
    expect(manifest.expected.multiFormDex["628"]).toEqual(["628-unova", "628-hisui"]);
    expect(manifest.expected.multiFormDex["641"]).toEqual([
      "641-incarnate",
      "641-therian",
    ]);
    expect(manifest.expected.multiFormDex["642"]).toEqual([
      "642-incarnate",
      "642-therian",
    ]);
    expect(manifest.expected.materializedIncomingEvolutionTargets).toEqual([
      { fromFormId: "613-unova", toFormId: "614-unova" },
    ]);
    expect(manifest.expected.deferredEvolutionTargets).toEqual([
      { fromFormId: "625-unova", targetDexNumber: 983, targetFormKey: "PALDEA" },
    ]);
    expect(manifest.boundary).toContain("Rufflet evolves only to ordinary Braviary");
    expect(manifest.boundary).toContain("non-interchangeable in Pokémon GO");
    expect(manifest.boundary).toContain("Bisharp -> #983 Kingambit");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
