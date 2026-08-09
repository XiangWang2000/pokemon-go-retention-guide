import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms252281, species252281 } from "@/data/batch-252-281";
import { forms282311, species282311 } from "@/data/batch-282-311";
import { DATA_VERSION } from "@/config/release";
import {
  validateEvolutionParentPaths,
  validateGen3DexConsistency,
} from "@/data/checkpoint-validation";
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

  it("checks the Gen3 dex, names, and types against the checkpoint definitions", () => {
    const species = [...species252281, ...species282311];
    const forms = [...forms252281, ...forms282311].map((form) => ({
      id: form.id,
      speciesId: `species-${String(form.dexNumber).padStart(3, "0")}`,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      types: JSON.stringify(form.types),
    }));
    expect(validateGen3DexConsistency(species, forms)).toEqual([]);
    expect(
      validateGen3DexConsistency(
        species,
        forms.map((form) => (form.id === "311-hoenn" ? { ...form, types: '["WATER"]' } : form)),
      ),
    ).toEqual([expect.stringContaining("311-hoenn types mismatch")]);
  });

  it("scans string literals without treating nullish coalescing as text", () => {
    expect(findSourceTextIntegrityIssues('const value = fallback ?? "正常";')).toEqual([]);
    expect(findSourceTextIntegrityIssues('const label = `${value ?? "正常"}`;')).toEqual([]);
    expect(findSourceTextIntegrityIssues('const label = "繁中名稱??";')).toHaveLength(1);
    expect(findSourceTextIntegrityIssues('const label = "繁中名稱\uFFFD";')).toHaveLength(1);
    expect(findSourceTextIntegrityIssues('<span>繁中名稱??</span>', "sample.tsx")).toHaveLength(1);
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
        "research_notes/cross-generation-evolution-targets.json",
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
