import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  evolutionPairs710721,
  forms710721,
  hoopaFormTransitions710721,
  pumpkabooSizes710721,
  species710721,
  zygardeCellTransitions710721,
} from "@/data/candidates/gen6-710-721";

describe("Gen6 #710-#721 identity candidate", () => {
  it("completes Gen6 identity staging without expanding formal publication", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "710-721")).toMatchObject({
      minDex: 710,
      maxDex: 721,
      generation: 6,
      stage: "EVIDENCE",
    });
  });

  it("covers exactly #710-#721 as 22 exact forms", () => {
    expect(species710721.map((item) => item.dexNumber)).toEqual(Array.from({ length: 12 }, (_, index) => 710 + index));
    expect(forms710721).toHaveLength(22);
    expect(new Set(forms710721.map((form) => form.id)).size).toBe(22);
  });

  it("keeps all four Pumpkaboo/Gourgeist sizes matched", () => {
    expect(pumpkabooSizes710721).toHaveLength(4);
    for (const size of pumpkabooSizes710721) {
      expect(forms710721.find((form) => form.id === `710-${size.slug}`)?.evolvesFromFormId).toBeNull();
      expect(forms710721.find((form) => form.id === `711-${size.slug}`)?.evolvesFromFormId).toBe(`710-${size.slug}`);
      expect(evolutionPairs710721).toContainEqual([`710-${size.slug}`, `711-${size.slug}`]);
    }
  });

  it("does not treat Hisuian Avalugg as an ordinary Bergmite evolution", () => {
    expect(forms710721.filter((form) => form.dexNumber === 713).map((form) => form.id)).toEqual(["713-kalos", "713-hisui"]);
    expect(evolutionPairs710721).toContainEqual(["712-kalos", "713-kalos"]);
    expect(evolutionPairs710721).not.toContainEqual(["712-kalos", "713-hisui"]);
    expect(forms710721.find((form) => form.id === "713-hisui")?.evolvesFromFormId).toBeNull();
  });

  it("models Zygarde cell changes as form transitions, never evolution", () => {
    expect(forms710721.filter((form) => form.dexNumber === 718)).toHaveLength(3);
    expect(forms710721.filter((form) => form.dexNumber === 718).every((form) => form.evolvesFromFormId === null)).toBe(true);
    expect(zygardeCellTransitions710721).toEqual([
      { fromFormId: "718-10-percent", toFormId: "718-50-percent", mechanic: "ZYGARDE_CELL_FORM_CHANGE" },
      { fromFormId: "718-50-percent", toFormId: "718-complete", mechanic: "ZYGARDE_CELL_FORM_CHANGE" },
    ]);
  });

  it("keeps Hoopa Confined/Unbound as costed Form Change, not evolution", () => {
    expect(forms710721.filter((form) => form.dexNumber === 720).map((form) => form.id)).toEqual(["720-confined", "720-unbound"]);
    expect(hoopaFormTransitions710721).toEqual([
      { fromFormId: "720-confined", toFormId: "720-unbound", mechanic: "FORM_CHANGE", candyCost: 50, stardustCost: 10_000 },
      { fromFormId: "720-unbound", toFormId: "720-confined", mechanic: "FORM_CHANGE", candyCost: 10, stardustCost: 2_000 },
    ]);
    expect(evolutionPairs710721.some(([from, to]) => from.startsWith("720-") || to.startsWith("720-"))).toBe(false);
  });

  it("contains exactly six evolution edges and no Gen6 deferred endpoint after #721", () => {
    expect(evolutionPairs710721).toHaveLength(6);
  });

  it("records identity provenance without promoting identity into release or battle value", () => {
    const manifest = JSON.parse(readFileSync("research_notes/sources/identity-710-721.json", "utf8")) as {
      status: string;
      expected: Record<string, unknown>;
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected).toMatchObject({ dexCount: 12, formCount: 22, materializedEvolutionCount: 6, zygardeFormCount: 3, hoopaFormCount: 2 });
    expect(manifest.boundary).toContain("no PvP/release/PvE/Shadow/Mega/Max claim");
  });
});
