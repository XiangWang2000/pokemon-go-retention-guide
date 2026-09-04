import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms554583, species554583 } from "@/data/candidates/gen5-554-583";
import {
  deferredEvolutionTargets584613,
  evolutionPairs584613,
  forms584613,
  gen5Candidate584613,
  species584613,
} from "@/data/candidates/gen5-584-613";

describe("Gen5 #584-#613 publication candidate", () => {
  it("registers a contiguous fourth candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "584-613")).toMatchObject({
      minDex: 584,
      maxDex: 613,
      generation: 5,
      stage: "IDENTITY",
    });
  });

  it("covers 30 National Dex identities as 38 exact Pokémon GO forms", () => {
    expect(species584613.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 584 + index),
    );
    expect(forms584613).toHaveLength(38);
    expect(new Set(forms584613.map((form) => form.id)).size).toBe(38);
    expect(gen5Candidate584613.key).toBe("584-613");
  });

  it("materializes the previous batch Vanillish -> Vanilluxe handoff exactly once", () => {
    expect(evolutionPairs584613).toContainEqual(["583-unova", "584-unova"]);
    expect(evolutionPairs584613.filter(([from]) => from === "583-unova")).toHaveLength(1);
    expect(forms584613.find((form) => form.id === "584-unova")?.evolvesFromFormId).toBe(
      "583-unova",
    );
  });

  it("keeps all four Deerling seasonal forms and matching Sawsbuck evolutions isolated", () => {
    const seasons = ["spring", "summer", "autumn", "winter"] as const;
    expect(forms584613.filter((form) => form.dexNumber === 585).map((form) => form.id)).toEqual(
      seasons.map((season) => `585-${season}`),
    );
    expect(forms584613.filter((form) => form.dexNumber === 586).map((form) => form.id)).toEqual(
      seasons.map((season) => `586-${season}`),
    );

    for (const season of seasons) {
      expect(evolutionPairs584613).toContainEqual([`585-${season}`, `586-${season}`]);
      for (const otherSeason of seasons.filter((item) => item !== season)) {
        expect(evolutionPairs584613).not.toContainEqual([
          `585-${season}`,
          `586-${otherSeason}`,
        ]);
      }
    }
  });

  it("keeps Frillish and Jellicent male/female forms and evolution paths isolated", () => {
    expect(forms584613.filter((form) => form.dexNumber === 592).map((form) => form.id)).toEqual([
      "592-male",
      "592-female",
    ]);
    expect(forms584613.filter((form) => form.dexNumber === 593).map((form) => form.id)).toEqual([
      "593-male",
      "593-female",
    ]);
    expect(evolutionPairs584613).toContainEqual(["592-male", "593-male"]);
    expect(evolutionPairs584613).toContainEqual(["592-female", "593-female"]);
    expect(evolutionPairs584613).not.toContainEqual(["592-male", "593-female"]);
    expect(evolutionPairs584613).not.toContainEqual(["592-female", "593-male"]);
  });

  it("keeps every materialized evolution edge family-consistent across the batch boundary", () => {
    const allForms = [...forms554583, ...forms584613];
    const formById = new Map(allForms.map((form) => [form.id, form]));
    const familyByDex = new Map<number, string>(
      [...species554583, ...species584613].map((species) => [species.dexNumber, species.familyKey]),
    );

    expect(evolutionPairs584613).toHaveLength(20);
    for (const [fromFormId, toFormId] of evolutionPairs584613) {
      const from = formById.get(fromFormId);
      const to = formById.get(toFormId);
      expect(from, fromFormId).toBeDefined();
      expect(to, toFormId).toBeDefined();
      expect(familyByDex.get(from!.dexNumber), fromFormId).toBe(
        familyByDex.get(to!.dexNumber),
      );
    }
  });

  it("defers Cubchoo -> Beartic until the next candidate batch owns #614", () => {
    expect(deferredEvolutionTargets584613).toEqual([
      {
        fromFormId: "613-unova",
        targetDexNumber: 614,
        targetFormKey: "UNOVA",
        reasonZhTw: expect.stringContaining("下一候選批次"),
      },
    ]);
    expect(forms584613.some((form) => form.dexNumber === 614)).toBe(false);
  });

  it("records exact identity provenance and explicit no-cross-form boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-584-613.json", "utf8"),
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
    expect(manifest.expected.formCount).toBe(38);
    expect(manifest.expected.multiFormDex["585"]).toHaveLength(4);
    expect(manifest.expected.multiFormDex["586"]).toHaveLength(4);
    expect(manifest.expected.multiFormDex["592"]).toHaveLength(2);
    expect(manifest.expected.multiFormDex["593"]).toHaveLength(2);
    expect(manifest.expected.materializedIncomingEvolutionTargets).toEqual([
      { fromFormId: "583-unova", toFormId: "584-unova" },
    ]);
    expect(manifest.expected.deferredEvolutionTargets).toHaveLength(1);
    expect(manifest.boundary).toContain("matching-season Sawsbuck");
    expect(manifest.boundary).toContain("gender-matched");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
