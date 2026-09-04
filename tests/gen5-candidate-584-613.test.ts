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
import {
  candidatePvpokeMapping584613,
  defaultGuideFormId584613,
  pvpokeMappings584613,
} from "@/data/candidates/gen5-pvp-584-613";

type RankingRow = { speciesId: string };

const snapshotPaths = {
  GL: "data/sources/pvpoke/2026-09-01/rankings-1500.json",
  UL: "data/sources/pvpoke/2026-09-01/rankings-2500.json",
  ML: "data/sources/pvpoke/2026-09-01/rankings-10000.json",
} as const;

function rankings(path: string) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as RankingRow[];
}

function rankOf(rows: readonly RankingRow[], speciesId: string) {
  const index = rows.findIndex((row) => row.speciesId === speciesId);
  return index < 0 ? null : index + 1;
}

function guideRows() {
  const markdown = readFileSync(
    "research_notes/history/generation-5-unova-retention.md",
    "utf8",
  );
  return [
    ...markdown.matchAll(
      /^\|\s*#(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/gm,
    ),
  ].map((match) => ({
    dexNumber: Number(match[1]),
    name: match[2].trim(),
    recommendation: match[3].trim(),
    ranks: match[4].trim(),
    reason: match[5].trim(),
  }));
}

describe("Gen5 #584-#613 publication candidate", () => {
  it("registers a contiguous fourth candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "584-613")).toMatchObject({
      minDex: 584,
      maxDex: 613,
      generation: 5,
      stage: "EVIDENCE",
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

  it("has no active deferred Cubchoo target after the #614 endpoint is owned", () => {
    expect(deferredEvolutionTargets584613).toEqual([]);
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
        resolvedByNextBatch: Array<{
          fromFormId: string;
          toFormId: string;
          owningBatch: string;
        }>;
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
    expect(manifest.expected.deferredEvolutionTargets).toEqual([]);
    expect(manifest.expected.resolvedByNextBatch).toEqual([
      { fromFormId: "613-unova", toFormId: "614-unova", owningBatch: "614-643" },
    ]);
    expect(manifest.boundary).toContain("matching-season Sawsbuck");
    expect(manifest.boundary).toContain("gender-matched");
    expect(manifest.boundary).toContain("materialized by the 614-643 candidate batch");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });

  it("maps all 38 Pokémon GO forms to pinned PvPoke battle identities without pretending generic IDs are exact", () => {
    expect(pvpokeMappings584613).toHaveLength(38);
    expect(new Set(pvpokeMappings584613.map((mapping) => mapping.formId)).size).toBe(38);
    expect(pvpokeMappings584613.filter((mapping) => mapping.mode === "EXACT")).toHaveLength(26);
    expect(
      pvpokeMappings584613.filter((mapping) => mapping.mode === "SHARED_UNDIFFERENTIATED"),
    ).toHaveLength(12);

    for (const form of forms584613) {
      expect(candidatePvpokeMapping584613(form).normal.length, form.id).toBeGreaterThan(0);
    }

    for (const formId of ["585-spring", "585-summer", "585-autumn", "585-winter"]) {
      expect(candidatePvpokeMapping584613({ id: formId })).toMatchObject({
        normal: "deerling",
        mode: "SHARED_UNDIFFERENTIATED",
      });
    }
    for (const formId of ["586-spring", "586-summer", "586-autumn", "586-winter"]) {
      expect(candidatePvpokeMapping584613({ id: formId })).toMatchObject({
        normal: "sawsbuck",
        mode: "SHARED_UNDIFFERENTIATED",
      });
    }
    for (const formId of ["592-male", "592-female"]) {
      expect(candidatePvpokeMapping584613({ id: formId })).toMatchObject({
        normal: "frillish",
        mode: "SHARED_UNDIFFERENTIATED",
      });
    }
    for (const formId of ["593-male", "593-female"]) {
      expect(candidatePvpokeMapping584613({ id: formId })).toMatchObject({
        normal: "jellicent",
        mode: "SHARED_UNDIFFERENTIATED",
      });
    }
  });

  it("records only pinned Shadow IDs and never synthesizes missing `_shadow` identities", () => {
    const expectedShadowFormIds = [
      "588-unova",
      "589-unova",
      "590-unova",
      "591-unova",
      "595-unova",
      "596-unova",
      "597-unova",
      "598-unova",
      "607-unova",
      "608-unova",
      "609-unova",
      "610-unova",
      "611-unova",
      "612-unova",
    ];
    expect(
      pvpokeMappings584613
        .filter((mapping) => mapping.shadow !== null)
        .map((mapping) => mapping.formId),
    ).toEqual(expectedShadowFormIds);
    for (const formId of [
      "584-unova",
      "585-spring",
      "586-spring",
      "587-unova",
      "592-male",
      "593-female",
      "599-unova",
      "602-unova",
      "613-unova",
    ]) {
      expect(candidatePvpokeMapping584613({ id: formId }).shadow, formId).toBeNull();
    }
  });

  it("keeps the species-level guide aligned to the pinned ordinary/shared PvPoke identity", () => {
    const snapshots = {
      GL: rankings(snapshotPaths.GL),
      UL: rankings(snapshotPaths.UL),
      ML: rankings(snapshotPaths.ML),
    };
    const guide = guideRows().filter((row) => row.dexNumber >= 584 && row.dexNumber <= 613);
    const mismatches: Array<{
      dexNumber: number;
      name: string;
      formId: string;
      mode: string;
      displayed: Record<string, number | null>;
      expected: Record<string, number | null>;
    }> = [];

    expect(guide).toHaveLength(30);
    for (const row of guide) {
      const formId = defaultGuideFormId584613[row.dexNumber];
      const mapping = candidatePvpokeMapping584613({ id: formId });
      const expected = {
        GL: rankOf(snapshots.GL, mapping.normal),
        UL: rankOf(snapshots.UL, mapping.normal),
        ML: rankOf(snapshots.ML, mapping.normal),
      };
      const displayed = { GL: null, UL: null, ML: null } as Record<string, number | null>;
      for (const match of row.ranks.matchAll(/(GL|UL|ML)#(\d+)/g)) {
        displayed[match[1]] = Number(match[2]);
      }
      if (JSON.stringify(displayed) !== JSON.stringify(expected)) {
        mismatches.push({
          dexNumber: row.dexNumber,
          name: row.name,
          formId,
          mode: mapping.mode,
          displayed,
          expected,
        });
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("records pinned PvP provenance and shared-form boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pvp-584-613.json", "utf8"),
    ) as {
      status: string;
      snapshot: { commit: string; gamemasterBlobSha: string };
      mappingSummary: {
        formCount: number;
        exactFormMappings: number;
        sharedUndifferentiatedMappings: number;
        pinnedShadowMappings: number;
      };
      sharedGroups: Record<string, string[]>;
      pinnedShadowFormIds: string[];
      sources: Array<{ sourceSummaryZhTw: string }>;
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVP");
    expect(manifest.snapshot.commit).toBe("7b96d91fb553780653190ad32de001b5d9086a7f");
    expect(manifest.snapshot.gamemasterBlobSha).toBe(
      "05abdcd6df42ee397367bf15e72bb5864c90a2b8",
    );
    expect(manifest.mappingSummary).toEqual({
      formCount: 38,
      exactFormMappings: 26,
      sharedUndifferentiatedMappings: 12,
      pinnedShadowMappings: 14,
    });
    expect(manifest.sharedGroups.deerling).toHaveLength(4);
    expect(manifest.sharedGroups.sawsbuck).toHaveLength(4);
    expect(manifest.sharedGroups.frillish).toHaveLength(2);
    expect(manifest.sharedGroups.jellicent).toHaveLength(2);
    expect(manifest.pinnedShadowFormIds).toHaveLength(14);
    expect(manifest.boundary).toContain("shared generic battle identities");
    expect(manifest.boundary).toContain("no `_shadow` ID is synthesized");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
