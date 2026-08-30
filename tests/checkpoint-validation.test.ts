import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms252281, species252281 } from "@/data/batch-252-281";
import { forms282311, species282311 } from "@/data/batch-282-311";
import {
  canonicalGen3Species,
  GEN3_CANONICAL_MAX,
  GEN3_CANONICAL_MIN,
} from "@/data/canonical/gen3";
import { DATA_VERSION } from "@/config/release";
import {
  validateEvolutionParentPaths,
  validateGen3DexConsistency,
} from "@/data/checkpoint-validation";
import { deriveShadowReleaseEvidence } from "@/data/evolution-release";
import { findSourceTextIntegrityIssues, findTextIntegrityIssues } from "@/data/text-integrity";

describe("checkpoint validation", () => {
  it("requires an exact EvolutionPath for every non-null parent form", () => {
    const forms = [{ id: "002-kanto", evolvesFromFormId: "001-kanto" }];
    expect(
      validateEvolutionParentPaths(forms, [{ fromFormId: "001-kanto", toFormId: "002-kanto" }]),
    ).toEqual([]);
    expect(validateEvolutionParentPaths(forms, [])).toEqual([
      expect.stringContaining("001-kanto->002-kanto"),
    ]);
  });

  it("checks batch source names and types against an independent Gen3 canonical fixture", () => {
    const species = [...species252281, ...species282311];
    const forms = [...forms252281, ...forms282311].map((form) => ({
      id: form.id,
      speciesId: `species-${String(form.dexNumber).padStart(3, "0")}`,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      types: JSON.stringify(form.types),
    }));
    expect([GEN3_CANONICAL_MIN, GEN3_CANONICAL_MAX]).toEqual([252, 386]);
    expect(validateGen3DexConsistency(species, forms, { min: 252, max: 311 })).toEqual([]);
    expect(
      validateGen3DexConsistency(
        species,
        forms.map((form) => (form.id === "311-hoenn" ? { ...form, types: '["WATER"]' } : form)),
        { min: 252, max: 311 },
      ),
    ).toEqual([expect.stringContaining("311-hoenn types mismatch")]);
    expect(
      validateGen3DexConsistency(
        species.map((item) => (item.dexNumber === 273 ? { ...item, nameZhTw: "長鼻葉" } : item)),
        forms,
        { min: 252, max: 311 },
      ),
    ).toEqual([expect.stringContaining("#273 Traditional Chinese name mismatch")]);
    expect(canonicalGen3Species).toHaveLength(135);
  });

  it("keeps Shadow roster provenance separate from evolution closure", () => {
    const evidence = deriveShadowReleaseEvidence(new Set(["283-hoenn"]), [
      ["283-hoenn", "284-hoenn"],
    ]);
    expect(evidence.directRosterFormIds).toEqual(["283-hoenn"]);
    expect(evidence.derivedFormIds).toEqual(["284-hoenn"]);
    expect(evidence.formalEvolutionEdges).toEqual([["283-hoenn", "284-hoenn"]]);
  });

  it("scans string literals without treating nullish coalescing as text", () => {
    expect(findSourceTextIntegrityIssues('const value = fallback ?? "正常";')).toEqual([]);
    expect(findSourceTextIntegrityIssues('const label = `${value ?? "正常"}`;')).toEqual([]);
    expect(findSourceTextIntegrityIssues('const label = "繁中名稱??";')).toHaveLength(1);
    expect(findSourceTextIntegrityIssues('const label = "繁中名稱\uFFFD";')).toHaveLength(1);
    expect(findSourceTextIntegrityIssues("<span>繁中名稱??</span>", "sample.tsx")).toHaveLength(1);
    expect(findSourceTextIntegrityIssues('const label = "Pok?mon";')).toHaveLength(1);
    expect(findSourceTextIntegrityIssues('const label = "正常？";')).toEqual([]);
    expect(findSourceTextIntegrityIssues('const label = "What is Mega Evolution?";')).toEqual([]);
    expect(findSourceTextIntegrityIssues('const href = "/data/home.json?v=r23";')).toEqual([]);
  });

  it("scans active review and runtime family JSON for visible text corruption", () => {
    const files = readdirSync("review")
      .filter((name) => name.endsWith(".json"))
      .map((name) => `review/${name}`)
      .filter((file) => {
        const value = JSON.parse(readFileSync(file, "utf8")) as { dataVersion?: string };
        return value.dataVersion === DATA_VERSION;
      })
      .concat([
        "research_notes/sources/cross-generation-evolution-targets.json",
        ...readdirSync("research_notes/sources")
          .filter((name) => /^(official|battle)-.*\.json$/.test(name))
          .map((name) => `research_notes/sources/${name}`),
        "site-data/manifest.json",
        "site-data/home.json",
        "site-data/details.json",
        "site-data/dashboard.json",
      ]);
    const issues = files.flatMap((file) =>
      findTextIntegrityIssues(JSON.parse(readFileSync(file, "utf8")), file),
    );
    expect(issues).toEqual([]);
  });
});
