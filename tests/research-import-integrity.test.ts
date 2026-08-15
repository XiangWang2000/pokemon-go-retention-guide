import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertOfficialEvolutionPathsMaterialized } from "@/data/research-import";

type EvolutionEndpoint = { fromFormId: string; toFormId: string };

const officialPaths = (
  JSON.parse(readFileSync("research_notes/official-001-030.json", "utf8")) as {
    evolutionPaths: EvolutionEndpoint[];
  }
).evolutionPaths;

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
