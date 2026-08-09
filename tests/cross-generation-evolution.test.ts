import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getDashboardRows } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";
import recalibrationReport from "../review/001-311-recalibration.json";

const forms = buildFormOverviews(await getDashboardRows());
const families = buildFamilyOverviews(forms);
const crossGenerationManifest = JSON.parse(
  readFileSync("research_notes/cross-generation-evolution-targets.json", "utf8"),
) as {
  targets: Array<Record<string, unknown>>;
  paths: Array<Record<string, unknown>>;
};

function familyContaining(formId: string) {
  const family = families.find((candidate) =>
    candidate.members.some((member) => member.form.formId === formId),
  );
  if (!family) throw new Error(`Missing family for ${formId}`);
  return family;
}

describe("cross-generation evolution targets", () => {
  it("keeps formal later-generation paths for high-risk families", () => {
    const expectedPaths = [
      ["042-kanto", "169-johto"],
      ["044-kanto", "182-johto"],
      ["052-galar", "863-galar"],
      ["082-kanto", "462-other"],
      ["112-kanto", "464-other"],
      ["114-kanto", "465-other"],
      ["123-kanto", "212-johto"],
      ["125-kanto", "466-other"],
      ["126-kanto", "467-other"],
    ];
    for (const [fromFormId, toFormId] of expectedPaths) {
      const form = forms.find((candidate) => candidate.formId === fromFormId);
      expect(form?.evolutionPaths.some((path) => path.toFormId === toFormId)).toBe(true);
    }
  });

  it("records an assessed use level for material out-of-batch targets", () => {
    const expectedTargets = {
      "042-kanto": ["169-johto", "NO_SIGNIFICANT_USE"],
      "044-kanto": ["182-johto", "SPECIAL_USE"],
      "052-galar": ["863-galar", "SPECIAL_USE"],
    } as const;
    for (const [formId, [targetId, targetUseLevel]] of Object.entries(expectedTargets)) {
      const path = forms
        .find((candidate) => candidate.formId === formId)
        ?.evolutionPaths.find((candidate) => candidate.toFormId === targetId);
      expect(path, `${formId}->${targetId}`).toMatchObject({ targetUseLevel });
    }
  });

  it("does not downgrade later-evolution families to mostly transfer", () => {
    for (const formId of [
      "081-kanto",
      "111-kanto",
      "114-kanto",
      "123-kanto",
      "125-kanto",
      "126-kanto",
    ]) {
      expect(familyContaining(formId).retentionStrategy).not.toBe("MOSTLY_TRANSFER");
    }
  });

  it("shows important external evolution targets in the first-layer handling summary", () => {
    const expectedTargets = {
      "081-kanto": "自爆磁怪",
      "111-kanto": "超甲狂犀",
      "114-kanto": "巨蔓藤",
      "125-kanto": "電擊魔獸",
      "126-kanto": "鴨嘴炎獸",
    } as const;

    for (const [formId, targetName] of Object.entries(expectedTargets)) {
      const summary = familyContaining(formId).handlingSummaryZhTw;
      expect(summary, formId).toContain(`可進化為${targetName}`);
      expect(summary, formId).toContain("優質普通候選");
      expect(summary, formId).toContain("暗影版本另按暗影用途判斷");
    }
  });

  it("uses descendant species names instead of regional form names", () => {
    const expectedTargets = {
      66: "怪力",
      92: "耿鬼",
      147: "快龍",
    } as const;

    for (const [dexNumber, targetName] of Object.entries(expectedTargets)) {
      const rows = recalibrationReport.highRiskReview.filter(
        (item) => item.dexNumber === Number(dexNumber) && ["NORMAL", "SHADOW"].includes(item.variantKey),
      );
      expect(rows, `#${dexNumber}`).toHaveLength(2);
      expect(rows.map((item) => item.laterEvolutionTarget), `#${dexNumber}`).toEqual([
        targetName,
        targetName,
      ]);
    }
  });

  it("never emits a pure region or form label as a later evolution target", () => {
    const invalidNames = new Set(["關都", "阿羅拉", "伽勒爾", "Kanto", "Alola", "Galar"]);
    for (const item of recalibrationReport.highRiskReview) {
      if (item.laterEvolutionTarget) {
        expect(invalidNames.has(item.laterEvolutionTarget), item.id).toBe(false);
      }
    }
  });

  it("keeps Eevee and Snowrunt cross-generation targets distinct", () => {
    const targetById = new Map(
      crossGenerationManifest.targets.map((target) => [
        `${String(target.dexNumber).padStart(3, "0")}-${String(target.formKey).toLowerCase()}`,
        target,
      ]),
    );
    expect(targetById.get("471-other")).toMatchObject({
      nameEn: "Glaceon",
      nameZhTw: "冰伊布",
      aliases: expect.arrayContaining(["Glaceon", "冰伊布"]),
    });
    expect(targetById.get("478-other")).toMatchObject({
      nameEn: "Froslass",
      nameZhTw: "雪妖女",
      aliases: expect.arrayContaining(["Froslass", "雪妖女"]),
    });
    expect(crossGenerationManifest.paths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fromFormId: "133-kanto", toFormId: "471-other" }),
        expect.objectContaining({ fromFormId: "361-hoenn", toFormId: "478-other" }),
      ]),
    );
  });

  it("keeps Deoxys Defense retention layers aligned", () => {
    const defense = forms.find((form) => form.formId === "386-defense");
    expect(defense?.decision).toBe("TRANSFER_CANDIDATE");
    expect(defense?.variants.find((variant) => variant.row.variantKey === "NORMAL")?.row)
      .toMatchObject({ assessmentDisposition: "NO_SIGNIFICANT_USE", decision: "TRANSFER_CANDIDATE" });

    const family = familyContaining("386-defense");
    expect(family.retentionStrategy).toBe("MOSTLY_TRANSFER");
    expect(family.primaryRetentionTargets).toEqual([]);
    expect(family.handlingSummaryZhTw).not.toContain("PvP");
  });
});
