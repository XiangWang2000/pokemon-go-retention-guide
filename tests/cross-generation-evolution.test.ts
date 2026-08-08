import { describe, expect, it } from "vitest";
import { getDashboardRows } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";

const forms = buildFormOverviews(await getDashboardRows());
const families = buildFamilyOverviews(forms);

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
      ["082-kanto", "462-kanto"],
      ["112-kanto", "464-kanto"],
      ["114-kanto", "465-kanto"],
      ["123-kanto", "212-kanto"],
      ["125-kanto", "466-kanto"],
      ["126-kanto", "467-kanto"],
    ];
    for (const [fromFormId, toFormId] of expectedPaths) {
      const form = forms.find((candidate) => candidate.formId === fromFormId);
      expect(form?.evolutionPaths.some((path) => path.toFormId === toFormId)).toBe(true);
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
      "123-kanto": "巨鉗螳螂",
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
});
