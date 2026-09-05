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
import {
  candidatePvpokeMapping614643,
  defaultGuideFormId614643,
  pvpokeMappings614643,
} from "@/data/candidates/gen5-pvp-614-643";

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

describe("Gen5 #614-#643 publication candidate", () => {
  it("registers a contiguous fifth candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
    expect(CANDIDATE_BATCH_REGISTRY.map((entry) => entry.generation)).not.toContain(5);
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

  it("maps all 34 exact Pokémon GO forms to independent pinned PvPoke identities", () => {
    expect(pvpokeMappings614643).toHaveLength(34);
    expect(new Set(pvpokeMappings614643.map((mapping) => mapping.formId)).size).toBe(34);
    expect(new Set(pvpokeMappings614643.map((mapping) => mapping.normal)).size).toBe(34);
    for (const form of forms614643) {
      expect(candidatePvpokeMapping614643(form), form.id).toMatchObject({ mode: "EXACT" });
      expect(candidatePvpokeMapping614643(form).normal.length, form.id).toBeGreaterThan(0);
    }

    expect(candidatePvpokeMapping614643({ id: "618-unova" }).normal).toBe("stunfisk");
    expect(candidatePvpokeMapping614643({ id: "618-galar" }).normal).toBe("stunfisk_galarian");
    expect(candidatePvpokeMapping614643({ id: "628-unova" }).normal).toBe("braviary");
    expect(candidatePvpokeMapping614643({ id: "628-hisui" }).normal).toBe("braviary_hisuian");
    expect(candidatePvpokeMapping614643({ id: "641-incarnate" }).normal).toBe(
      "tornadus_incarnate",
    );
    expect(candidatePvpokeMapping614643({ id: "641-therian" }).normal).toBe(
      "tornadus_therian",
    );
    expect(candidatePvpokeMapping614643({ id: "642-incarnate" }).normal).toBe(
      "thundurus_incarnate",
    );
    expect(candidatePvpokeMapping614643({ id: "642-therian" }).normal).toBe(
      "thundurus_therian",
    );
  });

  it("records only the ten concrete Shadow IDs present in the pinned gamemaster", () => {
    const expectedShadowFormIds = [
      "616-unova",
      "617-unova",
      "622-unova",
      "623-unova",
      "633-unova",
      "634-unova",
      "635-unova",
      "641-incarnate",
      "642-incarnate",
      "643-unova",
    ];
    expect(
      pvpokeMappings614643
        .filter((mapping) => mapping.shadow !== null)
        .map((mapping) => mapping.formId),
    ).toEqual(expectedShadowFormIds);

    for (const formId of [
      "618-unova",
      "618-galar",
      "628-unova",
      "628-hisui",
      "638-unova",
      "639-unova",
      "640-unova",
      "641-therian",
      "642-therian",
    ]) {
      expect(candidatePvpokeMapping614643({ id: formId }).shadow, formId).toBeNull();
    }
    expect(candidatePvpokeMapping614643({ id: "641-incarnate" }).shadow).toBe(
      "tornadus_incarnate_shadow",
    );
    expect(candidatePvpokeMapping614643({ id: "642-incarnate" }).shadow).toBe(
      "thundurus_incarnate_shadow",
    );
    expect(candidatePvpokeMapping614643({ id: "643-unova" }).shadow).toBe("reshiram_shadow");
  });

  it("keeps the species-level guide aligned to the designated ordinary/Incarnate PvPoke identity", () => {
    const snapshots = {
      GL: rankings(snapshotPaths.GL),
      UL: rankings(snapshotPaths.UL),
      ML: rankings(snapshotPaths.ML),
    };
    const guide = guideRows().filter((row) => row.dexNumber >= 614 && row.dexNumber <= 643);
    const mismatches: Array<{
      dexNumber: number;
      name: string;
      formId: string;
      displayed: Record<string, number | null>;
      expected: Record<string, number | null>;
    }> = [];

    expect(guide).toHaveLength(30);
    for (const row of guide) {
      const formId = defaultGuideFormId614643[row.dexNumber];
      const mapping = candidatePvpokeMapping614643({ id: formId });
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
        mismatches.push({ dexNumber: row.dexNumber, name: row.name, formId, displayed, expected });
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("records pinned PvP provenance and exact-form boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pvp-614-643.json", "utf8"),
    ) as {
      status: string;
      snapshot: { commit: string; gamemasterBlobSha: string };
      mappingSummary: {
        formCount: number;
        exactFormMappings: number;
        sharedUndifferentiatedMappings: number;
        pinnedShadowMappings: number;
      };
      exactSpecialFormMappings: Record<string, string>;
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
      formCount: 34,
      exactFormMappings: 34,
      sharedUndifferentiatedMappings: 0,
      pinnedShadowMappings: 10,
    });
    expect(manifest.exactSpecialFormMappings["618-galar"]).toBe("stunfisk_galarian");
    expect(manifest.exactSpecialFormMappings["628-hisui"]).toBe("braviary_hisuian");
    expect(manifest.exactSpecialFormMappings["641-therian"]).toBe("tornadus_therian");
    expect(manifest.exactSpecialFormMappings["642-therian"]).toBe("thundurus_therian");
    expect(manifest.pinnedShadowFormIds).toHaveLength(10);
    expect(manifest.boundary).toContain("All 34 candidate forms have independent pinned PvPoke");
    expect(manifest.boundary).toContain("no `_shadow` ID is synthesized");
    expect(manifest.boundary).toContain("never Pokémon GO release evidence");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
