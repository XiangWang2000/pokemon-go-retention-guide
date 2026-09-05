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
import {
  candidatePvpokeMapping554583,
  defaultGuideFormId554583,
  pvpokeMappings554583,
} from "@/data/candidates/gen5-pvp-554-583";

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

describe("Gen5 #554-#583 publication candidate", () => {
  it("registers a contiguous third candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
    expect(CANDIDATE_BATCH_REGISTRY.map((entry) => entry.generation)).not.toContain(5);
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

  it("defers only the still-unowned cross-generation endpoint", () => {
    expect(deferredEvolutionTargets554583).toEqual([
      {
        fromFormId: "562-galar",
        targetDexNumber: 867,
        targetFormKey: "GALAR",
        reasonZhTw: expect.stringContaining("Gen8"),
      },
    ]);
    expect(forms554583.some((form) => form.dexNumber === 867)).toBe(false);
    expect(forms554583.some((form) => form.dexNumber === 584)).toBe(false);
  });

  it("records exact identity provenance and the resolved next-batch handoff", () => {
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
        resolvedByNextBatch: Array<{ fromFormId: string; toFormId: string; owningBatch: string }>;
      };
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected.dexCount).toBe(30);
    expect(manifest.expected.formCount).toBe(37);
    expect(manifest.expected.multiFormDex["555"]).toHaveLength(4);
    expect(manifest.expected.deferredEvolutionTargets).toHaveLength(1);
    expect(manifest.expected.resolvedByNextBatch).toContainEqual({
      fromFormId: "583-unova",
      toFormId: "584-unova",
      owningBatch: "584-613",
    });
    expect(manifest.boundary).toContain("Zen Mode forms are independent identities");
    expect(manifest.boundary).toContain("Vanillish -> #584 is now materialized");
    expect(manifest.boundary).toContain("Hisuian Zorua and Zoroark");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });

  it("maps all 37 candidate forms to pinned exact NORMAL PvPoke identities", () => {
    expect(pvpokeMappings554583).toHaveLength(37);
    expect(new Set(pvpokeMappings554583.map((mapping) => mapping.formId)).size).toBe(37);
    for (const form of forms554583) {
      const mapping = candidatePvpokeMapping554583(form);
      expect(mapping.mode, form.id).toBe("EXACT");
      expect(mapping.normal.length, form.id).toBeGreaterThan(0);
    }

    expect(candidatePvpokeMapping554583({ id: "555-unova-standard" }).normal).toBe(
      "darmanitan_standard",
    );
    expect(candidatePvpokeMapping554583({ id: "555-unova-zen" }).normal).toBe(
      "darmanitan_zen",
    );
    expect(candidatePvpokeMapping554583({ id: "555-galar-standard" }).normal).toBe(
      "darmanitan_galarian_standard",
    );
    expect(candidatePvpokeMapping554583({ id: "555-galar-zen" }).normal).toBe(
      "darmanitan_galarian_zen",
    );
    expect(candidatePvpokeMapping554583({ id: "562-galar" }).normal).toBe(
      "yamask_galarian",
    );
    expect(candidatePvpokeMapping554583({ id: "570-hisui" }).normal).toBe(
      "zorua_hisuian",
    );
    expect(candidatePvpokeMapping554583({ id: "571-hisui" }).normal).toBe(
      "zoroark_hisuian",
    );
  });

  it("never synthesizes Shadow IDs for regional or Zen forms without pinned evidence", () => {
    for (const formId of [
      "554-galar",
      "555-unova-zen",
      "555-galar-standard",
      "555-galar-zen",
      "562-galar",
      "570-hisui",
      "571-hisui",
    ]) {
      expect(candidatePvpokeMapping554583({ id: formId }).shadow, formId).toBeNull();
    }
    expect(candidatePvpokeMapping554583({ id: "554-unova" }).shadow).toBe("darumaka_shadow");
    expect(candidatePvpokeMapping554583({ id: "555-unova-standard" }).shadow).toBe(
      "darmanitan_standard_shadow",
    );
  });

  it("keeps the species-level guide aligned to the ordinary/default pinned form", () => {
    const snapshots = {
      GL: rankings(snapshotPaths.GL),
      UL: rankings(snapshotPaths.UL),
      ML: rankings(snapshotPaths.ML),
    };
    const guide = guideRows().filter((row) => row.dexNumber >= 554 && row.dexNumber <= 583);
    const mismatches: Array<{
      dexNumber: number;
      name: string;
      formId: string;
      displayed: Record<string, number | null>;
      expected: Record<string, number | null>;
    }> = [];

    for (const row of guide) {
      const formId = defaultGuideFormId554583[row.dexNumber];
      const mapping = candidatePvpokeMapping554583({ id: formId });
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

  it("records pinned PvP provenance without allowing battle presence to imply release", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pvp-554-583.json", "utf8"),
    ) as {
      status: string;
      snapshot: { commit: string; gamemasterBlobSha: string };
      exactSpecialFormMappings: Record<string, string>;
      shadowBoundary: { rule: string; examplesWithoutShadowMapping: string[] };
      boundary: string;
    };
    expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVP");
    expect(manifest.snapshot.commit).toBe("7b96d91fb553780653190ad32de001b5d9086a7f");
    expect(manifest.snapshot.gamemasterBlobSha).toBe(
      "05abdcd6df42ee397367bf15e72bb5864c90a2b8",
    );
    expect(manifest.exactSpecialFormMappings["555-galar-zen"]).toBe(
      "darmanitan_galarian_zen",
    );
    expect(manifest.shadowBoundary.examplesWithoutShadowMapping).toContain("562-galar");
    expect(manifest.boundary).toContain("never release evidence");
  });
});
