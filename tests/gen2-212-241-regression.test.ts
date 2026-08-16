import { describe, expect, it } from "vitest";
import { getDashboardRows, getSources } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";
import { evolutionPairs212241, forms212241, species212241 } from "@/data/batch-212-241";

const rows = await getDashboardRows();
const forms = buildFormOverviews(rows);
const families = buildFamilyOverviews(forms);

function familyByMember(formId: string) {
  const family = families.find((candidate) =>
    candidate.members.some((member) => member.form.formId === formId),
  );
  if (!family) throw new Error(`Missing family for ${formId}`);
  return family;
}

describe("Gen2 #212-#241 JOHTO integration", () => {
  it("creates only JOHTO standard forms and removes migrated Kanto stubs", () => {
    const batchRows = rows.filter((row) => row.dexNumber >= 212 && row.dexNumber <= 241);
    expect(new Set(batchRows.map((row) => row.dexNumber))).toEqual(
      new Set(Array.from({ length: 30 }, (_, index) => index + 212)),
    );
    expect(new Set(batchRows.map((row) => row.formId))).toEqual(
      new Set(Array.from({ length: 30 }, (_, index) => `${String(index + 212).padStart(3, "0")}-johto`)),
    );
    for (const dex of [212, 230, 233]) {
      expect(rows.some((row) => row.formId === `${dex}-kanto`)).toBe(false);
    }
  });

  it("merges formal later species and baby or branch families without splitting them", () => {
    expect(familyByMember("212-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["123-kanto", "212-johto"]),
    );
    expect(familyByMember("230-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["117-kanto", "230-johto"]),
    );
    expect(familyByMember("233-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["137-kanto", "233-johto"]),
    );
    expect(familyByMember("237-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["106-kanto", "107-kanto", "236-johto", "237-johto"]),
    );
    expect(familyByMember("238-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["124-kanto", "238-johto"]),
    );
    expect(familyByMember("239-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["125-kanto", "239-johto"]),
    );
    expect(familyByMember("240-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["126-kanto", "240-johto"]),
    );
  });

  it("keeps future evolution stubs and released Mega or Max variants distinct", () => {
    for (const [formId, targetId] of [
      ["215-johto", "461-sinnoh"],
      ["217-johto", "901-hisui"],
      ["221-johto", "473-sinnoh"],
      ["234-johto", "899-hisui"],
    ]) {
      expect(
        forms.find((form) => form.formId === formId)?.evolutionPaths.some((path) => path.toFormId === targetId),
      ).toBe(true);
    }
    for (const id of ["212-johto-mega", "214-johto-mega", "227-johto-mega", "229-johto-mega"]) {
      expect(rows.find((row) => row.id === id)).toMatchObject({ releaseStatus: "RELEASED" });
    }
    for (const id of ["213-johto-dynamax", "237-johto-dynamax"]) {
      expect(rows.find((row) => row.id === id)).toMatchObject({ releaseStatus: "RELEASED" });
    }
  });

  it("keeps same-batch Johto evolution edges and family identity explicit", () => {
    expect(evolutionPairs212241).toEqual(
      expect.arrayContaining([
        ["216-johto", "217-johto"],
        ["218-johto", "219-johto"],
        ["220-johto", "221-johto"],
      ]),
    );
    for (const [dexNumber, familyKey, parentId] of [
      [217, "JOHTO_FAMILY_216", "216-johto"],
      [219, "JOHTO_FAMILY_218", "218-johto"],
      [221, "JOHTO_FAMILY_220", "220-johto"],
    ] as const) {
      expect(species212241.find((species) => species.dexNumber === dexNumber)?.familyKey).toBe(
        familyKey,
      );
      expect(forms212241.find((form) => form.dexNumber === dexNumber)?.evolvesFromFormId).toBe(
        parentId,
      );
    }
  });

  it("preserves scoped safety conclusions and records the new Max source", async () => {
    const batchRows = rows.filter((row) => row.dexNumber >= 212 && row.dexNumber <= 241);
    expect(batchRows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING")).toBe(true);
    expect(batchRows.every((row) => row.decision !== "HOLD_FOR_NOW")).toBe(true);
    const sources = await getSources();
    expect(sources.find((source) => source.id === "MAX-GEN2-20260808")).toMatchObject({
      sourceType: "MAX_BATTLE",
    });
  });
});
