import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms614643 } from "@/data/candidates/gen5-614-643";
import {
  evolutionPairs644649,
  forms644649,
  gen5Candidate644649,
  keldeoFormTransitions644649,
  kyuremFusionRelationships644649,
  nonInterchangeableFormGroups644649,
  species644649,
} from "@/data/candidates/gen5-644-649";

describe("Gen5 #644-#649 publication candidate", () => {
  it("registers the final contiguous Gen5 candidate slice without publishing it", () => {
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "644-649")).toMatchObject({
      minDex: 644,
      maxDex: 649,
      generation: 5,
      stage: "EVIDENCE",
      definitionModule: "src/data/candidates/gen5-644-649.ts",
    });
  });

  it("covers six National Dex identities as fifteen exact Pokémon GO forms", () => {
    expect(species644649.map((item) => item.dexNumber)).toEqual([644, 645, 646, 647, 648, 649]);
    expect(forms644649).toHaveLength(15);
    expect(new Set(forms644649.map((form) => form.id)).size).toBe(15);
    expect(gen5Candidate644649.key).toBe("644-649");
  });

  it("keeps Landorus Incarnate and Therian as separate non-interchangeable identities", () => {
    expect(forms644649.filter((form) => form.dexNumber === 645).map((form) => form.id)).toEqual([
      "645-incarnate",
      "645-therian",
    ]);
    expect(nonInterchangeableFormGroups644649).toContainEqual([
      "645-incarnate",
      "645-therian",
    ]);
    expect(evolutionPairs644649).toHaveLength(0);
  });

  it("models Black and White Kyurem as Fusion outputs, never evolution targets", () => {
    expect(forms644649.filter((form) => form.dexNumber === 646).map((form) => form.id)).toEqual([
      "646-unova",
      "646-black",
      "646-white",
    ]);
    expect(kyuremFusionRelationships644649).toEqual([
      expect.objectContaining({
        baseFormId: "646-unova",
        partnerFormId: "644-unova",
        resultFormId: "646-black",
        mechanic: "FUSION",
      }),
      expect.objectContaining({
        baseFormId: "646-unova",
        partnerFormId: "643-unova",
        resultFormId: "646-white",
        mechanic: "FUSION",
      }),
    ]);
    expect(forms614643.some((form) => form.id === "643-unova")).toBe(true);
    for (const relationship of kyuremFusionRelationships644649) {
      expect(evolutionPairs644649).not.toContainEqual([
        relationship.baseFormId,
        relationship.resultFormId,
      ]);
      expect(forms644649.find((form) => form.id === relationship.resultFormId)?.evolvesFromFormId).toBeNull();
      expect(relationship.reasonZhTw).toContain("不是進化");
    }
  });

  it("models Keldeo Ordinary/Resolute as reversible Change Form rather than evolution", () => {
    expect(forms644649.filter((form) => form.dexNumber === 647).map((form) => form.id)).toEqual([
      "647-ordinary",
      "647-resolute",
    ]);
    expect(forms644649.find((form) => form.id === "647-ordinary")?.formNameZhTw).toBe("平常的樣子");
    expect(forms644649.find((form) => form.id === "647-resolute")?.formNameZhTw).toBe("覺悟的樣子");
    expect(keldeoFormTransitions644649).toEqual([
      expect.objectContaining({
        fromFormId: "647-ordinary",
        toFormId: "647-resolute",
        reversible: true,
        candyCost: 50,
        stardustCost: 10_000,
        mechanic: "FORM_CHANGE",
      }),
    ]);
    expect(evolutionPairs644649).not.toContainEqual(["647-ordinary", "647-resolute"]);
    expect(keldeoFormTransitions644649[0].reasonZhTw).toContain("不是進化");
  });

  it("keeps Meloetta Aria and Pirouette distinct without inventing a transition", () => {
    expect(forms644649.filter((form) => form.dexNumber === 648).map((form) => form.id)).toEqual([
      "648-aria",
      "648-pirouette",
    ]);
    for (const formId of ["648-aria", "648-pirouette"]) {
      expect(forms644649.find((form) => form.id === formId)?.evolvesFromFormId).toBeNull();
    }
    expect(evolutionPairs644649).toEqual([]);
  });

  it("keeps all five Genesect Drive identities non-interchangeable", () => {
    const genesectForms = [
      "649-unova",
      "649-shock",
      "649-burn",
      "649-chill",
      "649-douse",
    ];
    expect(forms644649.filter((form) => form.dexNumber === 649).map((form) => form.id)).toEqual(
      genesectForms,
    );
    expect(nonInterchangeableFormGroups644649).toContainEqual(genesectForms);
    for (const formId of genesectForms) {
      expect(forms644649.find((form) => form.id === formId)?.evolvesFromFormId).toBeNull();
    }
  });

  it("records complete identity provenance and anti-pollution boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-644-649.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      expected: {
        dexCount: number;
        formCount: number;
        multiFormDex: Record<string, string[]>;
        evolutionPairs: unknown[];
        keldeoFormTransitions: unknown[];
        kyuremFusionRelationships: unknown[];
        nonInterchangeableFormGroups: string[][];
      };
      boundary: string;
    };

    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.expected.dexCount).toBe(6);
    expect(manifest.expected.formCount).toBe(15);
    expect(manifest.expected.multiFormDex["645"]).toEqual(["645-incarnate", "645-therian"]);
    expect(manifest.expected.multiFormDex["646"]).toEqual([
      "646-unova",
      "646-black",
      "646-white",
    ]);
    expect(manifest.expected.multiFormDex["647"]).toEqual(["647-ordinary", "647-resolute"]);
    expect(manifest.expected.multiFormDex["648"]).toEqual(["648-aria", "648-pirouette"]);
    expect(manifest.expected.multiFormDex["649"]).toEqual([
      "649-unova",
      "649-shock",
      "649-burn",
      "649-chill",
      "649-douse",
    ]);
    expect(manifest.expected.evolutionPairs).toEqual([]);
    expect(manifest.expected.keldeoFormTransitions).toHaveLength(1);
    expect(manifest.expected.kyuremFusionRelationships).toHaveLength(2);
    expect(manifest.expected.nonInterchangeableFormGroups).toHaveLength(2);
    expect(manifest.boundary).toContain("non-interchangeable in Pokémon GO");
    expect(manifest.boundary).toContain("reversible Change Form, not evolution");
    expect(manifest.boundary).toContain("reversible Fusion outputs");
    expect(manifest.boundary).toContain("Release state is deliberately deferred");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});