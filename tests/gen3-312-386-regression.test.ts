import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  evolutionPairs312386,
  pveClassifications312386,
  forms312386,
  releasedMegaForms312386,
  releasedShadowForms312386,
  specialVariants312386,
  species312386,
} from "@/data/batch-312-386";
import { forms312341, species312341 } from "@/data/batch-312-341";
import { forms342371, species342371 } from "@/data/batch-342-371";
import { forms372386, species372386 } from "@/data/batch-372-386";
import { canonicalGen3Forms, canonicalGen3Species } from "@/data/canonical/gen3";
import {
  validateGen3DexConsistency,
  validateGen3FormCompleteness,
} from "@/data/checkpoint-validation";
import { deriveShadowReleaseEvidence } from "@/data/evolution-release";
import { findTextIntegrityIssues } from "@/data/text-integrity";

describe("Gen3 #312-#386 canonical and graph regression", () => {
  it("keeps formal Gen3 importer boundaries in the Batch Registry", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(packageJson.scripts["data:import:batch"]).toBe("tsx scripts/data/import-batch.ts");
    expect(packageJson.scripts["data:import:312-386"]).toBeUndefined();
    expect(packageJson.scripts["data:import:312-341"]).toBeUndefined();
    expect(packageJson.scripts["data:import:342-371"]).toBeUndefined();
    expect(packageJson.scripts["data:import:372-386"]).toBeUndefined();
  });

  it("keeps the three independent batch units bounded at 30 dex numbers", () => {
    expect(species312341).toHaveLength(30);
    expect(species342371).toHaveLength(30);
    expect(species372386).toHaveLength(15);
    expect(forms312341.every((form) => form.dexNumber >= 312 && form.dexNumber <= 341)).toBe(true);
    expect(forms342371.every((form) => form.dexNumber >= 342 && form.dexNumber <= 371)).toBe(true);
    expect(forms372386.every((form) => form.dexNumber >= 372 && form.dexNumber <= 386)).toBe(true);
    expect(
      new Set([
        ...species312341.map((species) => species.dexNumber),
        ...species342371.map((species) => species.dexNumber),
        ...species372386.map((species) => species.dexNumber),
      ]).size,
    ).toBe(75);
  });

  it("matches the independent canonical fixture for every species and Hoenn form", () => {
    expect(validateGen3DexConsistency(species312386, forms312386, { min: 312, max: 386 })).toEqual(
      [],
    );
    expect(species312386).toHaveLength(75);
    expect(new Set(forms312386.map((form) => form.id)).size).toBe(81);
    expect(forms312386.every((form) => form.regionKey === "HOENN")).toBe(true);
    const variantRecords = forms312386
      .flatMap((form) =>
        ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"].map((variantKey) => ({
          id: `${form.id}-${variantKey.toLowerCase()}`,
          pokemonFormId: form.id,
          variantKey,
        })),
      )
      .concat(
        specialVariants312386.map((variant) => ({
          id: variant.id,
          pokemonFormId: variant.formId,
          variantKey: variant.variantKey,
        })),
      );
    expect(
      validateGen3FormCompleteness(forms312386, variantRecords, { min: 312, max: 386 }),
    ).toEqual([]);
    expect(forms312386.filter((form) => form.dexNumber === 351).map((form) => form.id)).toEqual([
      "351-normal",
      "351-rainy",
      "351-snowy",
      "351-sunny",
    ]);
    expect(forms312386.filter((form) => form.dexNumber === 386).map((form) => form.id)).toEqual([
      "386-attack",
      "386-defense",
      "386-normal",
      "386-speed",
    ]);
    expect(forms312386.find((form) => form.id === "351-sunny")?.types).toEqual(["FIRE"]);
    expect(forms312386.find((form) => form.id === "351-rainy")?.types).toEqual(["WATER"]);
    expect(forms312386.find((form) => form.id === "351-snowy")?.types).toEqual(["ICE"]);
    expect(forms312386.some((form) => form.id === "351-hoenn" || form.id === "386-hoenn")).toBe(
      false,
    );
    expect(canonicalGen3Species.find((item) => item.dexNumber === 326)?.nameZhTw).toBe("噗噗豬");
    expect(canonicalGen3Species.find((item) => item.dexNumber === 328)?.nameZhTw).toBe("大顎蟻");
    expect(canonicalGen3Species.find((item) => item.dexNumber === 340)?.nameZhTw).toBe("鯰魚王");
    expect(canonicalGen3Species.find((item) => item.dexNumber === 374)?.nameZhTw).toBe("鐵啞鈴");
  });

  it("rejects a batch identity typo instead of accepting a self-generated expectation", () => {
    const brokenForms = forms312386.map((form) =>
      form.id === "313-hoenn" ? { ...form, formNameZhTw: "錯誤名稱" } : form,
    );
    expect(validateGen3FormCompleteness(brokenForms, [], { min: 312, max: 386 })).toEqual(
      expect.arrayContaining([
        expect.stringContaining("313-hoenn Traditional Chinese form name mismatch"),
      ]),
    );
  });

  it("models branching, baby-family merge, cross-generation targets, and Mega candidates", () => {
    const formIds = new Set(forms312386.map((form) => form.id));
    const allowedStubIds = new Set(["202-johto", "407-sinnoh", "477-sinnoh", "478-sinnoh"]);
    expect(
      evolutionPairs312386.every(
        ([fromFormId]) => formIds.has(fromFormId) || allowedStubIds.has(fromFormId),
      ),
    ).toBe(true);
    expect(
      evolutionPairs312386.every(
        ([, toFormId]) => formIds.has(toFormId) || allowedStubIds.has(toFormId),
      ),
    ).toBe(true);
    expect(evolutionPairs312386).toEqual(
      expect.arrayContaining([
        ["366-hoenn", "367-hoenn"],
        ["366-hoenn", "368-hoenn"],
        ["360-hoenn", "202-johto"],
        ["315-hoenn", "407-sinnoh"],
        ["356-hoenn", "477-sinnoh"],
        ["361-hoenn", "478-sinnoh"],
      ]),
    );
    expect(forms312386.some((form) => form.id === "407-other")).toBe(false);
    expect(
      evolutionPairs312386.filter(
        ([fromFormId, toFormId]) => fromFormId === "315-hoenn" && toFormId === "407-sinnoh",
      ),
    ).toHaveLength(1);
    expect([...releasedMegaForms312386]).toEqual(
      expect.arrayContaining([
        "319-hoenn",
        "323-hoenn",
        "334-hoenn",
        "354-hoenn",
        "359-hoenn",
        "362-hoenn",
        "373-hoenn",
        "376-hoenn",
        "380-hoenn",
        "381-hoenn",
        "382-hoenn",
        "383-hoenn",
        "384-hoenn",
      ]),
    );
    expect(pveClassifications312386["317-hoenn"]).toBe("NO_SIGNIFICANT_USE");
    expect(pveClassifications312386["326-hoenn"]).toBe("NO_SIGNIFICANT_USE");
    expect(canonicalGen3Forms.find((form) => form.id === "386-defense")?.variantKeys).toEqual([
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
    ]);
  });

  it("keeps completed Gen4 targets distinct from legacy stubs", () => {
    const dashboard = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as Array<{
      formId: string;
      variantKey: string;
      evolutionPaths?: Array<{ toFormId: string; isEvolutionStub: boolean }>;
    }>;
    const expectations = [
      ["315-hoenn", "407-sinnoh", false],
      ["356-hoenn", "477-sinnoh", false],
      ["361-hoenn", "478-sinnoh", false],
    ] as const;

    for (const [fromFormId, toFormId, expectedStub] of expectations) {
      const row = dashboard.find(
        (item) => item.formId === fromFormId && item.variantKey === "NORMAL",
      );
      const paths = row?.evolutionPaths?.filter((path) => path.toFormId === toFormId) ?? [];
      expect(paths).toHaveLength(1);
      expect(paths[0]?.isEvolutionStub).toBe(expectedStub);
    }
    expect(dashboard.some((item) => item.formId === "407-other")).toBe(false);
  });

  it("keeps Shadow direct roster entries distinct from derived descendants", () => {
    const evidence = deriveShadowReleaseEvidence(releasedShadowForms312386, evolutionPairs312386);
    expect(evidence.directRosterFormIds).toContain("356-hoenn");
    expect(evidence.directRosterFormIds).not.toContain("477-sinnoh");
    expect(evidence.derivedFormIds).toContain("477-sinnoh");
    expect(evidence.formalEvolutionEdges).toContainEqual(["356-hoenn", "477-sinnoh"]);
  });

  it("keeps Primal Kyogre/Groudon labels separate from Mega Rayquaza", () => {
    expect(specialVariants312386.find((variant) => variant.id === "382-hoenn-mega")?.nameZhTw).toBe(
      "原始蓋歐卡",
    );
    expect(specialVariants312386.find((variant) => variant.id === "383-hoenn-mega")?.nameZhTw).toBe(
      "原始固拉多",
    );
    expect(specialVariants312386.find((variant) => variant.id === "384-hoenn-mega")?.nameZhTw).toBe(
      "Mega 烈空坐",
    );
    const dashboard = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as Array<
      Record<string, unknown>
    >;
    const visibleFields = [
      "evolutionFamilyNotesZhTw",
      "notesZhTw",
      "pveSummaryZhTw",
      "megaSummaryZhTw",
      "maxBattleSummaryZhTw",
      "evolutionSummaryZhTw",
      "recommendedIvStrategyZhTw",
      "reasonZhTw",
      "ivDirection",
      "ivShortLabels",
      "ivRecommendations",
    ];
    for (const dexNumber of [382, 383]) {
      for (const row of dashboard.filter((item) => item.dexNumber === dexNumber)) {
        for (const field of visibleFields) {
          expect(JSON.stringify(row[field] ?? "")).not.toContain("Mega");
        }
      }
    }
  });

  it("exports direct, mechanism, and formal-path Shadow evidence roles at runtime", () => {
    const dashboard = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as Array<{
      id: string;
      sources?: Array<{ usageZhTw?: string }>;
    }>;
    const direct = dashboard.find((row) => row.id === "283-hoenn-shadow")?.sources ?? [];
    const derived = dashboard.find((row) => row.id === "284-hoenn-shadow")?.sources ?? [];
    expect(direct.some((source) => source.usageZhTw?.includes("direct roster source"))).toBe(true);
    expect(derived.some((source) => source.usageZhTw?.includes("derived/inherited closure"))).toBe(
      true,
    );
    expect(derived.some((source) => source.usageZhTw?.includes("formal evolution edge"))).toBe(
      true,
    );
  });

  it("does not contain visible source-text corruption", () => {
    expect(findTextIntegrityIssues({ species312386, forms312386 })).toEqual([]);
  });
});
