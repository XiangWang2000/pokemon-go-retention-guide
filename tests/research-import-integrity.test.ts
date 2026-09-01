import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertOfficialEvolutionPathsMaterialized } from "@/data/research-import";

type EvolutionEndpoint = { fromFormId: string; toFormId: string };

type ReleaseEvidence = { status: string; sourceIds: string[] };

const officialResearch = JSON.parse(
  readFileSync("research_notes/sources/official-001-030.json", "utf8"),
) as {
  evolutionPaths: EvolutionEndpoint[];
  forms: Array<{
    pokemonFormId: string;
    variants: Record<string, ReleaseEvidence>;
  }>;
  reviewQueue: Array<{ pokemonFormId: string; category: string }>;
};

const officialPaths = officialResearch.evolutionPaths;

function fakePrisma(rows: EvolutionEndpoint[]) {
  return {
    evolutionPath: {
      findMany: async () => rows,
    },
  } as never;
}

describe("official evolution path integrity", () => {
  it("accepts every official endpoint pair exactly once", async () => {
    await expect(
      assertOfficialEvolutionPathsMaterialized(fakePrisma(officialPaths)),
    ).resolves.toBeUndefined();
  });

  it("rejects missing and duplicate endpoint pairs generically", async () => {
    const rows = officialPaths.slice(1).concat(officialPaths[1]!);

    await expect(assertOfficialEvolutionPathsMaterialized(fakePrisma(rows))).rejects.toThrow(
      /001-kanto->002-kanto.*002-kanto->003-kanto/,
    );
  });
});

describe("complete roster release boundaries", () => {
  it("resolves every Shadow, Purified, Dynamax, and Gigantamax status", () => {
    const trackedKeys = ["SHADOW", "PURIFIED", "DYNAMAX", "GIGANTAMAX"];
    const trackedRows = officialResearch.forms.flatMap((form) =>
      trackedKeys.map((variantKey) => ({
        formId: form.pokemonFormId,
        variantKey,
        ...form.variants[variantKey],
      })),
    );

    expect(trackedRows.filter((row) => row.status === "NEEDS_REVIEW")).toEqual([]);
    expect(trackedRows.filter((row) => row.sourceIds.length === 0)).toEqual([]);
    expect(
      trackedRows.filter(
        (row) =>
          row.variantKey === "GIGANTAMAX" && row.status === "NOT_RELEASED_IN_COMPLETE_ROSTER",
      ),
    ).toHaveLength(30);
    expect(
      officialResearch.reviewQueue.filter((row) => trackedKeys.includes(row.category)),
    ).toEqual([]);
  });
});
