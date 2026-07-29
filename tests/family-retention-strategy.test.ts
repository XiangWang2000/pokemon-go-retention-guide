import { describe, expect, it } from "vitest";
import { getDashboardRows } from "@/lib/data";
import {
  buildFamilyOverviews,
  calculateFamilyRetentionStrategy,
  calculateFamilyValue,
  findIndependentMemberUses,
  findPrimaryRetentionTargets,
  findVariantSpecificUses,
} from "@/presentation/family-overview";
import { buildFormOverviews, type FormOverview } from "@/presentation/form-overview";

const forms = buildFormOverviews(await getDashboardRows());
const families = buildFamilyOverviews(forms);

function familyContaining(formId: string) {
  const family = families.find((item) =>
    item.members.some((member) => member.form.formId === formId),
  );
  if (!family) throw new Error(`找不到包含 ${formId} 的進化家族`);
  return family;
}

function familyForms(formId: string) {
  return familyContaining(formId).members.map((member) => member.form);
}

function cloneForm(form: FormOverview, changes: Partial<FormOverview>): FormOverview {
  return { ...form, ...changes };
}

describe("家族價值與清包策略聚合", () => {
  it("8/10. 單純存在進化路徑且所有成員用途低，不會自動選擇性保留", () => {
    for (const formId of ["019-kanto", "019-alola"]) {
      const family = familyContaining(formId);
      expect(family.members.some((member) => member.roles.includes("EVOLUTION_MATERIAL"))).toBe(
        true,
      );
      expect(family.familyValue).toBe("LOW");
      expect(family.retentionStrategy).toBe("MOSTLY_TRANSFER");
    }
  });

  it("3. 只有 Mega 候選有價值時為 MEDIUM＋SELECTIVE_KEEP", () => {
    const family = familyContaining("015-kanto");
    expect(family.familyValue).toBe("MEDIUM");
    expect(family.retentionStrategy).toBe("SELECTIVE_KEEP");
    expect(family.primaryTargetSummaryZhTw).toBe("大針蜂（Mega 候選）");
    expect(findVariantSpecificUses(family.members)).toEqual(
      expect.arrayContaining([expect.objectContaining({ variantKey: "MEGA" })]),
    );
  });

  it("4. 最終進化同時具有明確 PvP 與 Mega 用途時為 HIGH＋KEEP_TARGETS", () => {
    const family = familyContaining("018-kanto");
    expect(family.familyValue).toBe("HIGH");
    expect(family.retentionStrategy).toBe("KEEP_TARGETS");
    expect(family.primaryTargetSummaryZhTw).toBe("大比鳥");
  });

  it("9. 綠毛蟲與波波前階只作進化候選，不會被視為獨立用途", () => {
    for (const formId of ["010-kanto", "016-kanto"]) {
      const family = familyContaining(formId);
      const member = family.members.find((item) => item.form.formId === formId)!;
      expect(member.roles).toContain("EVOLUTION_MATERIAL");
      expect(member.hasIndependentUse).toBe(false);
      expect(member.memberSummaryZhTw).toContain("前階主要作符合條件的進化候選。");
      expect(findIndependentMemberUses(family.members).map((item) => item.formId)).not.toContain(
        member.form.formId,
      );
      expect(findPrimaryRetentionTargets(family.members).map((item) => item.formId)).not.toContain(
        member.form.formId,
      );
    }
  });

  it("巴大蝶普通、極巨與超極巨分開，超極巨不能由前階替代", () => {
    const family = familyContaining("012-kanto");
    const butterfree = family.members.find((member) => member.form.formId === "012-kanto")!;
    expect(butterfree.form.variants.map((variant) => variant.row.variantKey)).toEqual(
      expect.arrayContaining(["NORMAL", "DYNAMAX", "GIGANTAMAX"]),
    );
    expect(family.primaryTargetSummaryZhTw).toBe("超極巨巴大蝶");
    expect(family.megaMax.detail).toContain("超極巨版本須直接取得");
    expect(family.megaMax.detail).toContain("極巨前階只能進化為極巨候選");
    expect(family.actionSummaryZhTw).toContain("超極巨個體不能由普通或極巨前階進化取得");
    expect(family.notices.join(" ")).toContain("超極巨個體不能由普通或極巨前階替代");
  });

  it("6/7. 小個體與中間進化的獨立 PvP 用途會同時保留在家族摘要", () => {
    const original = familyForms("001-kanto");
    const withPvpUse = (form: FormOverview) =>
      cloneForm(form, {
        pvp: { label: "中", detail: "測試用獨立用途", tone: "MEDIUM" },
        variants: form.variants.map((variant, index) =>
          index === 0
            ? {
                ...variant,
                primaryUseKeys: [...variant.primaryUseKeys, "GREAT_LEAGUE"],
              }
            : variant,
        ),
      });
    const family = buildFamilyOverviews([
      withPvpUse(original[0]!),
      withPvpUse(original[1]!),
      original[2]!,
    ])[0]!;

    expect(family.primaryRetentionTargets.map((target) => target.formId)).toEqual(
      expect.arrayContaining(["001-kanto", "002-kanto", "003-kanto"]),
    );
    expect(family.notices.join(" ")).toContain("小個體有獨立PvP用途");
    expect(family.notices.join(" ")).toContain("中間進化有獨立PvP用途");
    expect(family.actionSummaryZhTw).toContain("妙蛙種子");
    expect(family.actionSummaryZhTw).toContain("妙蛙草");
  });

  it("8. 次要資料缺失不會讓家族變成 HOLD_FOR_NOW", () => {
    const family = familyContaining("003-kanto");
    expect(
      family.members.some((member) =>
        member.form.variants.some((variant) =>
          variant.row.reviewIssues?.some((issue) => !issue.affectsFinalDecision),
        ),
      ),
    ).toBe(true);
    expect(family.familyValue).not.toBe("UNKNOWN");
    expect(family.retentionStrategy).not.toBe("HOLD_FOR_NOW");
  });

  it("9. 主要保留目標的關鍵來源衝突才會觸發 HOLD_FOR_NOW", () => {
    const original = familyForms("018-kanto");
    const conflicted = original.map((form) =>
      form.formId !== "018-kanto"
        ? form
        : cloneForm(form, {
            variants: form.variants.map((variant) =>
              variant.row.variantKey !== "NORMAL"
                ? variant
                : {
                    ...variant,
                    row: {
                      ...variant.row,
                      reviewIssues: [
                        ...(variant.row.reviewIssues ?? []),
                        {
                          id: "family-source-conflict-fixture",
                          issueType: "SOURCE_CONFLICT",
                          messageZhTw: "主要 PvP 來源互相衝突",
                          affectsFinalDecision: true,
                          provisionalDecision: "HOLD_FOR_NOW",
                          suggestedResearchActionZhTw: "重新核對聯盟與賽季",
                          lastResearchedAt: null,
                        },
                      ],
                    },
                  },
            ),
          }),
    );
    const family = buildFamilyOverviews(conflicted)[0]!;
    expect(calculateFamilyValue(family.members)).toBe("UNKNOWN");
    expect(calculateFamilyRetentionStrategy(family.familyValue)).toBe("HOLD_FOR_NOW");
    expect(family.actionSummaryZhTw).toContain("主要 PvP 來源互相衝突");
  });

  it("10. 每個家族摘要都明確列出主要保留目標或無目標", () => {
    for (const family of families) {
      expect(family.primaryTargetSummaryZhTw.trim()).not.toBe("");
      if (family.primaryRetentionTargets.length) {
        expect(family.primaryTargetSummaryZhTw).not.toBe("無主要保留目標");
      } else {
        expect(family.primaryTargetSummaryZhTw).toBe("無主要保留目標");
      }
    }
  });
});

describe("家族直接處理結論", () => {
  it("高價值家族直接列出聯盟、特殊版本與普通重複處理方式", () => {
    const family = familyContaining("003-kanto");
    expect(family.handlingSummaryZhTw).toContain("GL／UL 排名佳個體");
    expect(family.handlingSummaryZhTw).toContain("PvE 候選");
    expect(family.handlingSummaryZhTw).toContain("Mega 候選");
    expect(family.handlingSummaryZhTw).toContain("超極巨版本本身");
    expect(family.handlingSummaryZhTw).toContain("暗影版不設硬性 IV 下限");
    expect(family.handlingSummaryZhTw).toContain("其他普通重複可傳");
  });

  it("限定版本家族不會把普通或極巨版本誤列為主要目標", () => {
    const family = familyContaining("012-kanto");
    expect(family.handlingSummaryZhTw).toContain("只留巴大蝶（超極巨版本本身）");
    expect(family.handlingSummaryZhTw).not.toContain("極巨候選");
    expect(family.handlingSummaryZhTw).toContain("其他普通重複可傳");
  });

  it("低價值與資料未完整家族給出相反且安全的清包動作", () => {
    expect(familyContaining("020-kanto").handlingSummaryZhTw).toContain("普通重複可直接傳送");
    expect(familyContaining("030-kanto").handlingSummaryZhTw).toContain("先不要大量傳送");
  });
});
