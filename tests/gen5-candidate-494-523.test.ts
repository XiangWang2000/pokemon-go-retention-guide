import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import {
  evolutionPairs494523,
  forms494523,
  gen5Candidate494523,
  species494523,
} from "@/data/candidates/gen5-494-523";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";

describe("Gen5 #494-#523 publication candidate", () => {
  it("does not change the formal published scope", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY).toHaveLength(1);
    expect(CANDIDATE_BATCH_REGISTRY[0]).toMatchObject({
      key: "494-523",
      stage: "IDENTITY",
      generation: 5,
    });
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
  });

  it("covers exactly 30 National Dex identities with one canonical Unova form each", () => {
    expect(species494523.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 494 + index),
    );
    expect(forms494523).toHaveLength(30);
    expect(new Set(forms494523.map((form) => form.id)).size).toBe(30);
    expect(forms494523.every((form) => form.regionKey === "UNOVA")).toBe(true);
    expect(forms494523.every((form) => form.formKey === "UNOVA")).toBe(true);
    expect(gen5Candidate494523.key).toBe("494-523");
  });

  it("keeps family identities consistent across every evolution edge", () => {
    const formById = new Map(forms494523.map((form) => [form.id, form]));
    const speciesByDex = new Map(species494523.map((species) => [species.dexNumber, species]));
    for (const [fromFormId, toFormId] of evolutionPairs494523) {
      const from = formById.get(fromFormId);
      const to = formById.get(toFormId);
      expect(from, fromFormId).toBeDefined();
      expect(to, toFormId).toBeDefined();
      expect(speciesByDex.get(from!.dexNumber)?.familyKey).toBe(
        speciesByDex.get(to!.dexNumber)?.familyKey,
      );
      expect(to!.evolvesFromFormId).toBe(fromFormId);
    }
  });

  it("contains only canonical same-generation evolution edges for this first slice", () => {
    expect(evolutionPairs494523).toEqual([
      ["495-unova", "496-unova"],
      ["496-unova", "497-unova"],
      ["498-unova", "499-unova"],
      ["499-unova", "500-unova"],
      ["501-unova", "502-unova"],
      ["502-unova", "503-unova"],
      ["504-unova", "505-unova"],
      ["506-unova", "507-unova"],
      ["507-unova", "508-unova"],
      ["509-unova", "510-unova"],
      ["511-unova", "512-unova"],
      ["513-unova", "514-unova"],
      ["515-unova", "516-unova"],
      ["517-unova", "518-unova"],
      ["519-unova", "520-unova"],
      ["520-unova", "521-unova"],
      ["522-unova", "523-unova"],
    ]);
  });

  it("records identity provenance without claiming GO release or battle value", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-494-523.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string; supports: string[] }>;
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.sources[0]?.id).toBe("POKEAPI-CANONICAL-UNOVA-494-523");
    expect(manifest.sources[0]?.supports).toHaveLength(30);
    expect(manifest.sources[0]?.sourceSummaryZhTw).toContain("不作為 Pokémon GO 推出狀態");
    expect(manifest.boundary).toContain("No BattleVariant release state");
  });
});
