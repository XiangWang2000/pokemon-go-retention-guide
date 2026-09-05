import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CANDIDATE_BATCH_REGISTRY } from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms644649 } from "@/data/candidates/gen5-644-649";
import {
  candidatePvpokeMapping644649,
  defaultGuideFormId644649,
  pvpokeMappings644649,
} from "@/data/candidates/gen5-pvp-644-649";

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

describe("Gen5 #644-#649 candidate PvP evidence", () => {
  it("keeps the final Gen5 candidate at evidence stage without expanding production", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
    expect(CANDIDATE_BATCH_REGISTRY.map((entry) => entry.generation)).not.toContain(5);
  });

  it("maps all fifteen exact Pokémon GO forms to independent pinned PvPoke identities", () => {
    expect(forms644649).toHaveLength(15);
    expect(pvpokeMappings644649).toHaveLength(15);
    expect(new Set(pvpokeMappings644649.map((mapping) => mapping.formId)).size).toBe(15);
    expect(new Set(pvpokeMappings644649.map((mapping) => mapping.normal)).size).toBe(15);

    for (const form of forms644649) {
      expect(candidatePvpokeMapping644649(form), form.id).toMatchObject({ mode: "EXACT" });
      expect(candidatePvpokeMapping644649(form).normal.length, form.id).toBeGreaterThan(0);
    }
  });

  it("keeps every special form on its own concrete PvPoke speciesId", () => {
    const expected = {
      "645-incarnate": "landorus_incarnate",
      "645-therian": "landorus_therian",
      "646-unova": "kyurem",
      "646-black": "kyurem_black",
      "646-white": "kyurem_white",
      "647-ordinary": "keldeo_ordinary",
      "647-resolute": "keldeo_resolute",
      "648-aria": "meloetta_aria",
      "648-pirouette": "meloetta_pirouette",
      "649-unova": "genesect",
      "649-shock": "genesect_shock",
      "649-burn": "genesect_burn",
      "649-chill": "genesect_chill",
      "649-douse": "genesect_douse",
    } as const;

    for (const [formId, speciesId] of Object.entries(expected)) {
      expect(candidatePvpokeMapping644649({ id: formId }).normal, formId).toBe(speciesId);
    }
  });

  it("records only the concrete Landorus Incarnate Shadow identity from the pinned gamemaster", () => {
    expect(
      pvpokeMappings644649
        .filter((mapping) => mapping.shadow !== null)
        .map((mapping) => mapping.formId),
    ).toEqual(["645-incarnate"]);
    expect(candidatePvpokeMapping644649({ id: "645-incarnate" }).shadow).toBe(
      "landorus_incarnate_shadow",
    );
    expect(candidatePvpokeMapping644649({ id: "645-therian" }).shadow).toBeNull();

    for (const mapping of pvpokeMappings644649.filter(
      (mapping) => mapping.formId !== "645-incarnate",
    )) {
      expect(mapping.shadow, mapping.formId).toBeNull();
    }
  });

  it("uses explicit species-level defaults that cannot borrow alternate-form ranks", () => {
    expect(defaultGuideFormId644649).toEqual({
      644: "644-unova",
      645: "645-incarnate",
      646: "646-unova",
      647: "647-ordinary",
      648: "648-aria",
      649: "649-unova",
    });
  });

  it("keeps the species-level guide aligned to the designated exact PvPoke identities", () => {
    const snapshots = {
      GL: rankings(snapshotPaths.GL),
      UL: rankings(snapshotPaths.UL),
      ML: rankings(snapshotPaths.ML),
    };
    const guide = guideRows().filter((row) => row.dexNumber >= 644 && row.dexNumber <= 649);
    const mismatches: Array<{
      dexNumber: number;
      name: string;
      formId: string;
      displayed: Record<string, number | null>;
      expected: Record<string, number | null>;
    }> = [];

    expect(guide).toHaveLength(6);
    for (const row of guide) {
      const formId = defaultGuideFormId644649[row.dexNumber];
      const mapping = candidatePvpokeMapping644649({ id: formId });
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

  it("records pinned PvP provenance and exact-form anti-leak boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pvp-644-649.json", "utf8"),
    ) as {
      status: string;
      snapshot: { commit: string; pokemonBlobSha: string };
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
    expect(manifest.snapshot.pokemonBlobSha).toBe(
      "9cd03d6495f4f7c4611267cd316234c191572935",
    );
    expect(manifest.mappingSummary).toEqual({
      formCount: 15,
      exactFormMappings: 15,
      sharedUndifferentiatedMappings: 0,
      pinnedShadowMappings: 1,
    });
    expect(manifest.exactSpecialFormMappings["645-therian"]).toBe("landorus_therian");
    expect(manifest.exactSpecialFormMappings["646-black"]).toBe("kyurem_black");
    expect(manifest.exactSpecialFormMappings["647-resolute"]).toBe("keldeo_resolute");
    expect(manifest.exactSpecialFormMappings["648-pirouette"]).toBe("meloetta_pirouette");
    expect(manifest.exactSpecialFormMappings["649-douse"]).toBe("genesect_douse");
    expect(manifest.pinnedShadowFormIds).toEqual(["645-incarnate"]);
    expect(manifest.boundary).toContain("All 15 candidate forms have independent pinned PvPoke");
    expect(manifest.boundary).toContain("no other `_shadow` ID is synthesized");
    expect(manifest.boundary).toContain("never Pokémon GO release evidence");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
