import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  deferredEvolutionTargets554583,
  evolutionPairs554583,
  forms554583,
  gen5Candidate554583,
  species554583,
} from "@/data/candidates/gen5-554-583";

describe("Gen5 #554-#583 publication candidate", () => {
  it("registers a contiguous third candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "554-583")).toMatchObject({
      minDex: 554,
      maxDex: 583,
      generation: 5,
      stage: "IDENTITY",
    });
  });

  it("covers 30 National Dex identities as 37 exact forms", () => {
    expect(species554583.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 554 + index),
    );
    expect(forms554583).toHaveLength(37);
    expect(new Set(forms554583.map((form) => form.id)).size).toBe(37);
    expect(gen5Candidate554583.key).toBe("554-583");
  });

  it("keeps Darumaka regional evolution paths separate from Zen Mode identities", () => {
    expect(forms554583.filter((form) => form.dexNumber === 554).map((form) => form.id)).toEqual([
      "554-unova",
      "554-galar",
    ]);
    expect(forms554583.filter((form) => form.dexNumber === 555).map((form) => form.id)).toEqual([
      "555-unova-standard",
      "555-unova-zen",
      "555-galar-standard",
      "555-galar-zen",
    ]);
    expect(evolutionPairs554583).toContainEqual(["554-unova", "555-unova-standard"]);
    expect(evolutionPairs554583).toContainEqual(["554-galar", "555-galar-standard"]);
    expect(evolutionPairs554583).not.toContainEqual(["554-unova", "555-unova-zen"]);
    expect(evolutionPairs554583).not.toContainEqual(["554-galar", "555-galar-zen"]);
    expect(forms554583.find((form) => form.id === "555-unova-zen")?.evolvesFromFormId).toBeNull();
    expect(forms554583.find((form) => form.id === "555-galar-zen")?.evolvesFromFormId).toBeNull();
  });

  it("keeps Galarian Yamask separate from ordinary Cofagrigus evolution", () => {
    expect(evolutionPairs554583).toContainEqual(["562-unova", "563-unova"]);
    expect(evolutionPairs554583.some(([from]) => from === "562-galar")).toBe(false);
    expect(forms554583.find((form) => form.id === "562-galar")).toMatchObject({
      regionKey: "GALAR",
      types: ["GROUND", "GHOST"],
      evolvesFromFormId: null,
    });
  });

  it("keeps ordinary and Hisuian Zorua evolution pairs isolated", () => {
    expect(evolutionPairs554583).toContainEqual(["570-unova", "571-unova"]);
    expect(evolutionPairs554583).toContainEqual(["570-hisui", "571-hisui"]);
    expect(evolutionPairs554583).not.toContainEqual(["570-unova", "571-hisui"]);
    expect(evolutionPairs554583).not.toContainEqual(["570-hisui", "571-unova"]);
  });

  it("keeps all local evolution edges family-consistent", () => {
    const formById = new Map(forms554583.map((form) => [form.id, form]));
    const speciesByDex = new Map<number, (typeof species554583)[number]>(
      species554583.map((species) => [species.dexNumber, species]),
    );
    expect(evolutionPairs554583).toHaveLength(17);
    for (const [fromFormId, toFormId] of evolutionPairs554583) {
      const from = formById.get(fromFormId);
      const to = formById.get(toFormId);
      expect(from, fromFormId).toBeDefined();
      expect(to, toFormId).toBeDefined();
      expect(speciesByDex.get(from!.dexNumber)?.familyKey).toBe(
        speciesByDex.get(to!.dexNumber)?.familyKey,
      );
    }
  });

  it("defers cross-batch and cross-generation endpoints instead of inventing stubs", () => {
    expect(deferredEvolutionTargets554583).toEqual([
      {
        fromFormId: "562-galar",
        targetDexNumber: 867,
        targetFormKey: "GALAR",
        reasonZhTw: expect.stringContaining("Gen8"),
      },
      {
        fromFormId: "583-unova",
        targetDexNumber: 584,
        targetFormKey: "UNOVA",
        reasonZhTw: expect.stringContaining("下一候選批次"),
      },
    ]);
    expect(forms554583.some((form) => form.dexNumber === 867)).toBe(false);
    expect(forms554583.some((form) => form.dexNumber === 584)).toBe(false);
  });

  it("records exact identity provenance and no-leak boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-554-583.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      expected: {
        dexCount: number;
        formCount: number;
        multiFormDex: Record<string, string[]>;
        deferredEvolutionTargets: Array<{ fromFormId: string; targetDexNumber: number }>;
      };
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected.dexCount).toBe(30);
    expect(manifest.expected.formCount).toBe(37);
    expect(manifest.expected.multiFormDex["555"]).toHaveLength(4);
    expect(manifest.expected.deferredEvolutionTargets).toHaveLength(2);
    expect(manifest.boundary).toContain("Zen Mode forms are independent identities");
    expect(manifest.boundary).toContain("Hisuian Zorua and Zoroark");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
