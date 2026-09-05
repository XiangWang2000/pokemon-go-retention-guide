import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CANDIDATE_BATCH_REGISTRY } from "@/config/candidate-batch-registry";
import {
  GEN6_LOCAL_RANKING_PATHS,
  GEN6_PRESENTATION_FORM_BY_DEX,
  GEN6_PVPOKE_COMMIT,
  gen6PvpMappingByFormId,
  gen6PvpMappings,
  getGen6PresentationPvpokeSpeciesId,
} from "@/data/candidates/gen6-pvp";

type RankingRow = { speciesId: string };
type GuideRow = { dex: number; rankText: string };

function rankingIndex(path: string) {
  const rows = JSON.parse(readFileSync(path, "utf8")) as RankingRow[];
  return new Map(rows.map((row, index) => [row.speciesId, index + 1]));
}

function guideRows() {
  const markdown = readFileSync("research_notes/history/generation-6-kalos-retention.md", "utf8");
  return [...markdown.matchAll(/^\|\s*#(\d+)\s*\|\s*[^|]+\|\s*[^|]+\|\s*([^|]+?)\s*\|/gm)].map(
    (match) => ({ dex: Number(match[1]), rankText: match[2].trim() }),
  ) as GuideRow[];
}

function expectedRankText(speciesId: string | null, indexes: Record<"GL" | "UL" | "ML", Map<string, number>>) {
  if (!speciesId) return "—";
  const parts = (["GL", "UL", "ML"] as const)
    .map((league) => {
      const rank = indexes[league].get(speciesId);
      return rank ? `${league}#${rank}` : null;
    })
    .filter((value): value is string => value !== null);
  return parts.length > 0 ? parts.join(" / ") : "—";
}

describe("Gen6 pinned PvP exact-form evidence", () => {
  it("advances all Gen6 candidate slices to evidence while production is still #649", () => {
    expect(CANDIDATE_BATCH_REGISTRY.filter((entry) => entry.generation === 6)).toHaveLength(3);
    expect(CANDIDATE_BATCH_REGISTRY.filter((entry) => entry.generation === 6).every((entry) => entry.stage === "EVIDENCE")).toBe(true);
  });

  it("maps all 161 exact PokemonForm identities without pretending missing/shared IDs are exact", () => {
    expect(gen6PvpMappings).toHaveLength(161);
    expect(new Set(gen6PvpMappings.map((mapping) => mapping.formId)).size).toBe(161);
    expect(gen6PvpMappings.filter((mapping) => mapping.mappingMode === "EXACT")).toHaveLength(74);
    expect(gen6PvpMappings.filter((mapping) => mapping.mappingMode === "SHARED_UNDIFFERENTIATED")).toHaveLength(85);
    expect(gen6PvpMappings.filter((mapping) => mapping.mappingMode === "NO_PINNED_ID").map((mapping) => mapping.formId).sort()).toEqual(["705-hisui", "706-hisui"]);
  });

  it("keeps shared Vivillon/flower/gender/Furfrou mappings explicitly undifferentiated", () => {
    for (const formId of ["664-elegant", "666-ocean", "667-female", "668-male", "669-blue-flower", "671-white-flower", "676-kabuki", "677-female"]) {
      const mapping = gen6PvpMappingByFormId.get(formId)!;
      expect(mapping.mappingMode).toBe("SHARED_UNDIFFERENTIATED");
      expect(mapping.noteZhTw).toMatch(/共享|未分開|generic|壓成/);
    }
  });

  it("uses pinned exact identities for Meowstic, Aegislash, sizes, Zygarde and Hoopa", () => {
    expect(gen6PvpMappingByFormId.get("678-male")?.pvpokeSpeciesId).toBe("meowstic");
    expect(gen6PvpMappingByFormId.get("678-female")?.pvpokeSpeciesId).toBe("meowstic_female");
    expect(gen6PvpMappingByFormId.get("681-shield")?.pvpokeSpeciesId).toBe("aegislash_shield");
    expect(gen6PvpMappingByFormId.get("681-blade")?.pvpokeSpeciesId).toBe("aegislash_blade");
    expect(gen6PvpMappingByFormId.get("710-average")?.pvpokeSpeciesId).toBe("pumpkaboo_average");
    expect(gen6PvpMappingByFormId.get("711-super")?.pvpokeSpeciesId).toBe("gourgeist_super");
    expect(gen6PvpMappingByFormId.get("718-10-percent")?.pvpokeSpeciesId).toBe("zygarde_10");
    expect(gen6PvpMappingByFormId.get("718-50-percent")?.pvpokeSpeciesId).toBe("zygarde");
    expect(gen6PvpMappingByFormId.get("718-complete")?.pvpokeSpeciesId).toBe("zygarde_complete");
    expect(gen6PvpMappingByFormId.get("720-confined")?.pvpokeSpeciesId).toBe("hoopa");
    expect(gen6PvpMappingByFormId.get("720-unbound")?.pvpokeSpeciesId).toBe("hoopa_unbound");
  });

  it("records only the 26 Shadow battle identities actually present in the pinned gamemaster", () => {
    const shadowMappings = gen6PvpMappings.filter((mapping) => mapping.shadowPvpokeSpeciesId !== null);
    expect(shadowMappings).toHaveLength(26);
    expect(shadowMappings.map((mapping) => mapping.shadowPvpokeSpeciesId)).toContain("greninja_shadow");
    expect(shadowMappings.map((mapping) => mapping.shadowPvpokeSpeciesId)).toContain("noivern_shadow");
    expect(gen6PvpMappingByFormId.get("705-hisui")?.shadowPvpokeSpeciesId).toBeNull();
    expect(gen6PvpMappingByFormId.get("713-hisui")?.shadowPvpokeSpeciesId).toBeNull();
  });

  it("pins the same source commit used by the repository ranking snapshot", () => {
    const source = JSON.parse(readFileSync("data/sources/pvpoke/2026-09-01/source-version.json", "utf8")) as { commit: string };
    expect(GEN6_PVPOKE_COMMIT).toBe(source.commit);
  });

  it("keeps species-level guide ranks tied to designated ordinary/default forms, never best alternate or Shadow", () => {
    const indexes = {
      GL: rankingIndex(GEN6_LOCAL_RANKING_PATHS.GL),
      UL: rankingIndex(GEN6_LOCAL_RANKING_PATHS.UL),
      ML: rankingIndex(GEN6_LOCAL_RANKING_PATHS.ML),
    };
    const rows = guideRows();
    expect(rows).toHaveLength(72);
    const mismatches: string[] = [];
    for (const row of rows) {
      const formId = GEN6_PRESENTATION_FORM_BY_DEX[row.dex];
      if (!formId) {
        mismatches.push(`#${row.dex}: missing presentation form`);
        continue;
      }
      const speciesId = getGen6PresentationPvpokeSpeciesId(row.dex);
      const expected = expectedRankText(speciesId, indexes);
      if (row.rankText !== expected) mismatches.push(`#${row.dex}: ${row.rankText} -> ${expected} (${formId}/${speciesId ?? "NO_ID"})`);
    }
    expect(mismatches, mismatches.join("\n")).toEqual([]);
  });

  it("documents battle evidence as non-release evidence", () => {
    const manifest = JSON.parse(readFileSync("research_notes/sources/pvp-650-721.json", "utf8")) as { expected: Record<string, unknown>; boundary: string };
    expect(manifest.expected).toMatchObject({ formCount: 161, exactMappingCount: 74, sharedUndifferentiatedCount: 85, noPinnedIdCount: 2, shadowBattleIdentityCount: 26 });
    expect(manifest.boundary).toContain("never imply Pokémon GO release state");
  });
});
