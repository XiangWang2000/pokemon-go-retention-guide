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
  species524553,
} from "@/data/candidates/gen5-524-553";
import {
  candidatePvpokeMapping524553,
  candidatePvpokeSpeciesId524553,
  pvpokeMappings524553,
} from "@/data/candidates/gen5-pvp-524-553";

type RankingRow = { speciesId: string; rating?: number; moveset?: string[] };
const snapshots = {
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
  return [
    ...readFileSync("research_notes/history/generation-5-unova-retention.md", "utf8").matchAll(
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
  it("keeps its registry entry valid as later candidate slices are appended", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CANDIDATE_BATCH_REGISTRY.map((entry) => entry.generation)).not.toContain(5);
  });

  it("covers 30 dex identities as 33 exact forms", () => {
    expect(species524553.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 524 + index),
    );
    expect(forms524553).toHaveLength(33);
    expect(new Set(forms524553.map((form) => form.id)).size).toBe(33);
  });

  it("keeps Lilligant and Basculin form identities isolated", () => {
    expect(forms524553.filter((form) => form.dexNumber === 549).map((form) => form.id)).toEqual([
      "549-unova",
      "549-hisui",
    ]);
    expect(forms524553.filter((form) => form.dexNumber === 550).map((form) => form.id)).toEqual([
      "550-red-striped",
      "550-blue-striped",
      "550-white-striped",
    ]);
    expect(evolutionPairs524553).toContainEqual(["548-unova", "549-unova"]);
    expect(evolutionPairs524553).not.toContainEqual(["548-unova", "549-hisui"]);
    expect(forms524553.find((form) => form.id === "549-hisui")?.evolvesFromFormId).toBeNull();
  });

  it("keeps local evolution edges family-consistent and defers #902", () => {
    const formById = new Map(forms524553.map((form) => [form.id, form]));
    const speciesByDex = new Map<number, (typeof species524553)[number]>(
      species524553.map((species) => [species.dexNumber, species]),
    );
    expect(evolutionPairs524553).toHaveLength(16);
    for (const [fromFormId, toFormId] of evolutionPairs524553) {
      const from = formById.get(fromFormId)!;
      const to = formById.get(toFormId)!;
      expect(speciesByDex.get(from.dexNumber)?.familyKey).toBe(
        speciesByDex.get(to.dexNumber)?.familyKey,
      );
    }
    expect(deferredEvolutionTargets524553).toEqual([
      expect.objectContaining({ fromFormId: "550-white-striped", targetDexNumber: 902 }),
    ]);
  });

  it("maps ordinary and Hisuian Lilligant exactly", () => {
    expect(pvpokeMappings524553).toHaveLength(33);
    expect(candidatePvpokeMapping524553({ id: "549-unova" })).toMatchObject({
      normal: "lilligant",
      shadow: "lilligant_shadow",
      mode: "EXACT",
    });
    expect(candidatePvpokeMapping524553({ id: "549-hisui" })).toMatchObject({
      normal: "lilligant_hisuian",
      shadow: "lilligant_hisuian_shadow",
      mode: "EXACT",
    });
  });

  it("marks all Basculin stripe PvP evidence as shared, not fabricated exact ranks", () => {
    for (const id of ["550-red-striped", "550-blue-striped", "550-white-striped"]) {
      expect(candidatePvpokeMapping524553({ id })).toMatchObject({
        normal: "basculin",
        shadow: "basculin_shadow",
        mode: "SHARED_UNDIFFERENTIATED",
      });
    }
  });

  it("rebuilds ordinary and Shadow Excadrill/Conkeldurr ranks independently", () => {
    const gl = rankings(snapshots.GL);
    const ul = rankings(snapshots.UL);
    const ml = rankings(snapshots.ML);
    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553({ id: "530-unova" }, "NORMAL")),
      rankOf(ul, candidatePvpokeSpeciesId524553({ id: "530-unova" }, "NORMAL")),
      rankOf(ml, candidatePvpokeSpeciesId524553({ id: "530-unova" }, "NORMAL")),
    ]).toEqual([440, 392, 171]);
    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553({ id: "530-unova" }, "SHADOW")),
      rankOf(ul, candidatePvpokeSpeciesId524553({ id: "530-unova" }, "SHADOW")),
      rankOf(ml, candidatePvpokeSpeciesId524553({ id: "530-unova" }, "SHADOW")),
    ]).toEqual([371, 296, 153]);
    expect([
      rankOf(gl, candidatePvpokeSpeciesId524553({ id: "534-unova" }, "NORMAL")),
      rankOf(ul, candidatePvpokeSpeciesId524553({ id: "534-unova" }, "NORMAL")),
      rankOf(ml, candidatePvpokeSpeciesId524553({ id: "534-unova" }, "NORMAL")),
    ]).toEqual([295, 234, 92]);
  });

  it("keeps guide ranks on ordinary forms rather than Shadow or Hisuian forms", () => {
    const leagueRows = {
      GL: rankings(snapshots.GL),
      UL: rankings(snapshots.UL),
      ML: rankings(snapshots.ML),
    };
    const mismatches: string[] = [];
    for (const row of guideRows().filter((item) => item.dexNumber >= 524 && item.dexNumber <= 553)) {
      const formId = row.dexNumber === 550 ? "550-red-striped" : `${String(row.dexNumber).padStart(3, "0")}-unova`;
      const mapping = pvpokeMappings524553.find((item) => item.formId === formId)!;
      const expected = {
        GL: rankOf(leagueRows.GL, mapping.normal),
        UL: rankOf(leagueRows.UL, mapping.normal),
        ML: rankOf(leagueRows.ML, mapping.normal),
      };
      const displayed = { GL: null, UL: null, ML: null } as Record<keyof typeof expected, number | null>;
      for (const match of row.ranks.matchAll(/(GL|UL|ML)#(\d+)/g)) {
        displayed[match[1] as keyof typeof displayed] = Number(match[2]);
      }
      if (JSON.stringify(displayed) !== JSON.stringify(expected)) {
        mismatches.push(`#${row.dexNumber} ${row.name}: ${row.ranks}`);
      }
    }
    expect(mismatches).toEqual([]);
    const lilligant = guideRows().find((row) => row.dexNumber === 549);
    expect(lilligant?.ranks).toBe("GL#1118 / UL#830");
    expect(lilligant?.reason).toContain("洗翠裙兒小姐");
    const basculin = guideRows().find((row) => row.dexNumber === 550);
    expect(basculin?.reason).toContain("共享");
  });

  it("retains identity and PvP provenance boundaries", () => {
    const identity = JSON.parse(readFileSync("research_notes/sources/identity-524-553.json", "utf8")) as { boundary: string };
    const pvp = JSON.parse(readFileSync("research_notes/sources/pvp-524-553.json", "utf8")) as { boundary: string; snapshot: { commit: string } };
    expect(identity.boundary).toContain("Hisuian Lilligant is an independent Pokémon GO form");
    expect(pvp.snapshot.commit).toBe("7b96d91fb553780653190ad32de001b5d9086a7f");
    expect(pvp.boundary).toContain("not exact per-form rankings");
  });
});
