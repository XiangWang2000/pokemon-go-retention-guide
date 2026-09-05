import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  aegislashBattleStance680709,
  evolutionPairs680709,
  forms680709,
  gen6Candidate680709,
  species680709,
} from "@/data/candidates/gen6-680-709";

describe("Gen6 #680-#709 identity candidate", () => {
  it("continues Gen6 candidate staging while formal publication remains #649", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "680-709")).toMatchObject({
      minDex: 680,
      maxDex: 709,
      generation: 6,
      stage: "IDENTITY",
    });
  });

  it("covers exactly 30 National Dex identities as 33 exact forms", () => {
    expect(species680709.map((item) => item.dexNumber)).toEqual(Array.from({ length: 30 }, (_, index) => 680 + index));
    expect(forms680709).toHaveLength(33);
    expect(new Set(forms680709.map((form) => form.id)).size).toBe(33);
    expect(gen6Candidate680709.key).toBe("680-709");
  });

  it("materializes the Honedge handoff into Doublade", () => {
    expect(evolutionPairs680709).toContainEqual(["679-kalos", "680-kalos"]);
    expect(evolutionPairs680709).toContainEqual(["680-kalos", "681-shield"]);
    expect(evolutionPairs680709).not.toContainEqual(["681-shield", "681-blade"]);
  });

  it("keeps Aegislash Blade and Shield as battle stances rather than evolution", () => {
    expect(forms680709.filter((form) => form.dexNumber === 681).map((form) => form.id)).toEqual(["681-shield", "681-blade"]);
    expect(aegislashBattleStance680709).toEqual([
      { fromFormId: "681-shield", toFormId: "681-blade", mechanic: "BATTLE_STANCE_CHANGE" },
      { fromFormId: "681-blade", toFormId: "681-shield", mechanic: "BATTLE_STANCE_CHANGE" },
    ]);
  });

  it("keeps Sylveon in the published Eevee family across generations", () => {
    expect(species680709.find((species) => species.dexNumber === 700)?.familyKey).toBe("KANTO_FAMILY_133");
    expect(forms680709.find((form) => form.id === "700-kalos")?.evolvesFromFormId).toBe("133-kanto");
    expect(evolutionPairs680709).toContainEqual(["133-kanto", "700-kalos"]);
  });

  it("isolates Kalos and Hisui Sliggoo/Goodra branches", () => {
    expect(forms680709.filter((form) => form.dexNumber === 705).map((form) => form.id)).toEqual(["705-kalos", "705-hisui"]);
    expect(forms680709.filter((form) => form.dexNumber === 706).map((form) => form.id)).toEqual(["706-kalos", "706-hisui"]);
    expect(evolutionPairs680709).toContainEqual(["704-kalos", "705-kalos"]);
    expect(evolutionPairs680709).toContainEqual(["705-kalos", "706-kalos"]);
    expect(evolutionPairs680709).toContainEqual(["705-hisui", "706-hisui"]);
    expect(evolutionPairs680709).not.toContainEqual(["704-kalos", "705-hisui"]);
    expect(evolutionPairs680709).not.toContainEqual(["705-kalos", "706-hisui"]);
  });

  it("contains exactly the intended 16 evolution edges", () => {
    expect(evolutionPairs680709).toHaveLength(16);
    expect(new Set(evolutionPairs680709.map(([from, to]) => `${from}->${to}`)).size).toBe(16);
  });

  it("records identity provenance without promoting it into battle or release evidence", () => {
    const manifest = JSON.parse(readFileSync("research_notes/sources/identity-680-709.json", "utf8")) as {
      status: string;
      expected: Record<string, unknown>;
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected).toMatchObject({ dexCount: 30, formCount: 33, materializedEvolutionCount: 16, aegislashFormCount: 2 });
    expect(manifest.boundary).toContain("no PvP/release/PvE/Shadow/Mega/Max claim");
  });
});
