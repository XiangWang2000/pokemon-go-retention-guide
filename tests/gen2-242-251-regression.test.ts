import { describe, expect, it } from "vitest";
import { getDashboardRows, getSources } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";

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

describe("Gen2 #242-#251 JOHTO integration", () => {
  it("uses only Johto standard forms and removes the migrated Blissey Kanto stub", () => {
    const batchRows = rows.filter((row) => row.dexNumber >= 242 && row.dexNumber <= 251);
    expect(new Set(batchRows.map((row) => row.dexNumber))).toEqual(
      new Set(Array.from({ length: 10 }, (_, index) => index + 242)),
    );
    expect(new Set(batchRows.map((row) => row.formId))).toEqual(
      new Set(
        Array.from({ length: 10 }, (_, index) => `${String(index + 242).padStart(3, "0")}-johto`),
      ),
    );
    expect(rows.some((row) => row.formId === "242-kanto")).toBe(false);
  });

  it("merges Blissey into Chansey and keeps the Larvitar evolution family intact", () => {
    expect(familyByMember("242-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["113-kanto", "242-johto"]),
    );
    expect(familyByMember("248-johto").members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["246-johto", "247-johto", "248-johto"]),
    );
  });

  it("keeps Mega, Shadow and released Max variants separate", () => {
    expect(rows.find((row) => row.id === "248-johto-mega")).toMatchObject({
      releaseStatus: "RELEASED",
    });
    for (const dex of [242, 243, 244, 245, 249, 250]) {
      expect(
        rows.find((row) => row.id === `${String(dex).padStart(3, "0")}-johto-dynamax`),
      ).toMatchObject({
        releaseStatus: "RELEASED",
      });
    }
    expect(rows.find((row) => row.id === "250-johto-shadow")).toMatchObject({
      releaseStatus: "RELEASED",
    });
  });

  it("has no safety hold or pending decision in the batch and records the Max source", async () => {
    const batchRows = rows.filter((row) => row.dexNumber >= 242 && row.dexNumber <= 251);
    expect(batchRows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING")).toBe(true);
    expect(batchRows.every((row) => row.decision !== "HOLD_FOR_NOW")).toBe(true);
    expect(await getSources()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "MAX-GEN2-20260808", sourceType: "MAX_BATTLE" }),
      ]),
    );
  });
});
