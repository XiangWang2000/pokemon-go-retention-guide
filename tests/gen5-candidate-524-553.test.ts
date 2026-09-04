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
import {
  candidatePvpokeMapping524553,
  candidatePvpokeSpeciesId524553,
  pvpokeMappings524553,
} from "@/data/candidates/gen5-pvp-524-553";

type RankingRow = {
  speciesId: string;
  rating?: number;
  moveset?: string[];
};

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
      stage: "EVIDENCE",
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
    const speciesByDex = new Map<number, (typeof species524553)[number]>(
      species524553.map((species) => [species.dexNumber, species]),
    );
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

  it("maps Lilligant forms exactly and keeps Basculin evidence visibly shared", () => {
    expect(pvpokeMappings524553).toHaveLength(33);
    expect(new Set(pvpokeMappings524553.map((mapping) => mapping.formId)).size).toBe(33);

    const normalLilligant = forms524553.find((form) => form.id === "549-unova")!;
    const hisuianLilligant = forms524553.find((form) => form.id === "549-hisui")!;
    expect(candidatePvpokeMapping524553(normalLilligant)).toMatchObject({
      normal: "lilligant",
      shadow: "lilligant_shadow",
      mode: "EXACT",
    });
    expect(candidatePvpokeMapping524553(hisuianLilligant)).toMatchObject({
      normal: "lilligant_hisuian",
      shadow: "lilligant_hisuian_shadow",
      mode: "EXACT",
    });

    for (const formId of ["550-red-striped", "550-blue-striped", "550-white-striped"]) {
      const form = forms524553.find((candidate) => candidate.id === formId)!;
      expect(candidatePvpokeMapping524553(form)).toMatchObject({
        normal: "basculin",
        shadow: "basculin_shadow",
        mode: "SHARED_UNDIFFERENTIATED",
      });
    }
  });

  it("rebuilds ordinary and Shadow ranks independently from the pinned snapshots", () => {
    const gl = rankings(snapshotPaths.GL);
    const ul = rankings(snapshotPaths.UL);
    const ml = rankings(snapshotPaths.ML);
    const excadrill = forms524553.find((form) => form.id === "530-unova")!;
    const conkeldurr = forms524553.find((form) => form.id === "534-unova")!;

    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553(excadrill, "NORMAL")),
      rankOf(ul, candidatePvpokeSpeciesId524553(excadrill, "NORMAL")),
      rankOf(ml, candidatePvpokeSpeciesId524553(excadrill, "NORMAL")),
    ]).toEqual([440, 392, 171]);
    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553(excadrill, "SHADOW")),
      rankOf(ul, candidatePvpokeSpeciesId524553(excadrill, "SHADOW")),
      rankOf(ml, candidatePvpokeSpeciesId524553(excadrill, "SHADOW")),
    ]).toEqual([371, 296, 153]);

    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553(conkeldurr, "NORMAL")),
      rankOf(ul, candidatePvpokeSpeciesId524553(conkeldurr, "NORMAL")),
      rankOf(ml, candidatePvpokeSpeciesId524553(conkeldurr, "NORMAL")),
    ]).toEqual([295, 234, 92]);
    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553(conkeldurr, "SHADOW")),
      rankOf(ul, candidatePvpokeSpeciesId524553(conkeldurr, "SHADOW")),
      rankOf(ml, candidatePvpokeSpeciesId524553(conkeldurr, "SHADOW")),
    ]).toEqual([285, 170, 78]);
  });

  it("keeps the species-level guide aligned to ordinary forms, not Shadow or Hisuian forms", () => {
    const snapshots = {
      GL: rankings(snapshotPaths.GL),
      UL: rankings(snapshotPaths.UL),
      ML: rankings(snapshotPaths.ML),
    };
    const guide = guideRows().filter(
      (row) => row.dexNumber >= 524 && row.dexNumber <= 553,
    );

    for (const row of guide) {
      const form =
        row.dexNumber === 550
          ? forms524553.find((candidate) => candidate.id === "550-red-striped")!
          : forms524553.find(
              (candidate) => candidate.dexNumber === row.dexNumber && candidate.regionKey === "UNOVA",
            )!;
      const normalId = candidatePvpokeSpeciesId524553(form, "NORMAL");
      const expected = {
        GL: rankOf(snapshots.GL, normalId),
        UL: rankOf(snapshots.UL, normalId),
        ML: rankOf(snapshots.ML, normalId),
      };
      const displayed = { GL: null, UL: null, ML: null } as Record<
        keyof typeof expected,
        number | null
      >;
      for (const match of row.ranks.matchAll(/(GL|UL|ML)#(\d+)/g)) {
        displayed[match[1] as keyof typeof displayed] = Number(match[2]);
      }
      expect(displayed, `#${row.dexNumber} ${row.name}`).toEqual(expected);
    }

    const lilligant = guide.find((row) => row.dexNumber === 549);
    expect(lilligant?.recommendation).toContain("⚪");
    expect(lilligant?.ranks).toBe("GL#1118 / UL#830");
    expect(lilligant?.reason).toContain("洗翠裙兒小姐");
    expect(lilligant?.reason).toContain("不得");

    const basculin = guide.find((row) => row.dexNumber === 550);
    expect(basculin?.reason).toContain("generic Basculin");
    expect(basculin?.reason).toContain("共享");
    expect(basculin?.reason).toContain("不能假裝");
  });

  it("records pinned PvP provenance and the Basculin precision boundary", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pvp-524-553.json", "utf8"),
    ) as {
      status: string;
      snapshot: {
        commit: string;
        gamemasterBlobSha: string;
        leagues: Record<string, { cp: number; blobSha: string }>;
      };
      exactFormMappings: Record<string, string>;
      sharedUndifferentiatedMappings: Record<string, string>;
      notesZhTw: string;
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVP");
    expect(manifest.snapshot.commit).toBe("7b96d91fb553780653190ad32de001b5d9086a7f");
    expect(manifest.snapshot.gamemasterBlobSha).toBe(
      "05abdcd6df42ee397367bf15e72bb5864c90a2b8",
    );
    expect(manifest.exactFormMappings).toEqual({
      "549-unova": "lilligant",
      "549-hisui": "lilligant_hisuian",
    });
    expect(Object.values(manifest.sharedUndifferentiatedMappings)).toEqual([
      "basculin",
      "basculin",
      "basculin",
    ]);
    expect(manifest.notesZhTw).toContain("不得被假裝");
    expect(manifest.boundary).toContain("never release evidence");
    expect(manifest.boundary).toContain("not exact per-form rankings");
  });
});
