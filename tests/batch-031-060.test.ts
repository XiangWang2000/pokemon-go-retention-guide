import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FamilyOverview as FamilyOverviewComponent } from "@/components/overview/family-overview";
import { getDashboardRows } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";

const rows = await getDashboardRows();
const forms = buildFormOverviews(rows);
const families = buildFamilyOverviews(forms);

function familyByMember(formId: string) {
  const family = families.find((item) =>
    item.members.some((member) => member.form.formId === formId),
  );
  if (!family) throw new Error(`找不到 ${formId} 家族`);
  return family;
}

describe("#031～#060 批次與跨批次家族", () => {
  it("完整涵蓋 30 個圖鑑編號與 39 個地區型態", () => {
    const batchRows = rows.filter((row) => row.dexNumber >= 31 && row.dexNumber <= 60);
    expect([...new Set(batchRows.map((row) => row.dexNumber))]).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 31),
    );
    expect(new Set(batchRows.map((row) => row.formId)).size).toBe(39);
    expect(
      [
        "037-alola",
        "038-alola",
        "050-alola",
        "051-alola",
        "052-alola",
        "052-galar",
        "053-alola",
        "058-hisui",
        "059-hisui",
      ].every((formId) => batchRows.some((row) => row.formId === formId)),
    ).toBe(true);
  });

  it("尼多蘭♀跨批次家族只出現一次且不再標為截斷", () => {
    const family = familyByMember("031-kanto");
    expect(family.members.map((member) => member.form.formId)).toEqual([
      "029-kanto",
      "030-kanto",
      "031-kanto",
    ]);
    expect(family.isBatchTruncated).toBe(false);
    expect(
      families.filter((item) => item.members.some((member) => member.form.formId === "031-kanto")),
    ).toHaveLength(1);
    expect(family.retentionStrategy).toBe("KEEP_TARGETS");
  });

  it("普通、極巨、超極巨喵喵分開，只有超極巨版本套用 Max 結論", () => {
    const variants = forms
      .find((form) => form.formId === "052-kanto")!
      .variants.map((variant) => variant.row);
    expect(variants.find((row) => row.variantKey === "NORMAL")?.decision).toBe(
      "TRANSFER_CANDIDATE",
    );
    expect(variants.find((row) => row.variantKey === "DYNAMAX")).toMatchObject({
      releaseStatus: "UNRELEASED",
      decision: "TRANSFER_CANDIDATE",
    });
    expect(variants.find((row) => row.variantKey === "GIGANTAMAX")).toMatchObject({
      releaseStatus: "RELEASED",
      decision: "CONDITIONAL_KEEP",
    });
    expect(variants.find((row) => row.variantKey === "GIGANTAMAX")?.maxBattleSummaryZhTw).toContain(
      "不能進化",
    );
  });

  it("前階只作進化候選，不因存在進化路徑取得獨立用途", () => {
    const family = familyByMember("035-kanto");
    const clefairy = family.members.find((member) => member.form.formId === "035-kanto")!;
    expect(clefairy.hasIndependentUse).toBe(false);
    expect(clefairy.roles).toContain("EVOLUTION_MATERIAL");
    expect(clefairy.memberSummaryZhTw).toContain("進化");
  });

  it("完整低價值家族可判定為大多可傳", () => {
    expect(familyByMember("046-kanto").retentionStrategy).toBe("MOSTLY_TRANSFER");
    expect(familyByMember("048-kanto").retentionStrategy).toBe("MOSTLY_TRANSFER");
  });

  it("只有範圍外進化可能造成誤傳時才暫時保留", () => {
    expect(familyByMember("057-kanto")).toMatchObject({
      isBatchTruncated: true,
      retentionStrategy: "HOLD_FOR_NOW",
    });
    expect(familyByMember("060-kanto")).toMatchObject({
      isBatchTruncated: true,
      retentionStrategy: "HOLD_FOR_NOW",
    });
    expect(familyByMember("047-kanto").retentionStrategy).not.toBe("HOLD_FOR_NOW");
  });

  it("高用途暗影不設硬性最低 IV，低用途 100% 不自動升格", () => {
    const ninetalesShadow = rows.find((row) => row.id === "038-kanto-shadow")!;
    const parasectNormal = rows.find((row) => row.id === "047-kanto-normal")!;
    expect(ninetalesShadow.decision).toBe("KEEP");
    expect(ninetalesShadow.recommendedIvStrategyZhTw).toContain("先留用途候選");
    expect(parasectNormal.decision).toBe("TRANSFER_CANDIDATE");
    expect(parasectNormal.recommendedIvStrategyZhTw).toContain("100%");
  });

  it("ML 的 15攻只作排序，沒有斷點資料時不虛構 15/10/10 勝負", () => {
    const arcanine = rows.find((row) => row.id === "059-kanto-normal")!;
    expect(arcanine.decision).toBe("CONDITIONAL_KEEP");
    expect(arcanine.recommendedIvStrategyZhTw).toContain("14攻高整體IV亦可留");
    expect(arcanine.recommendedIvStrategyZhTw).toContain("15/10/10");
    expect(arcanine.recommendedIvStrategyZhTw).toContain("14/15/15");
  });

  it("卡片第一層同時顯示保留條件與其他普通重複可傳", () => {
    const html = renderToStaticMarkup(
      createElement(FamilyOverviewComponent, {
        families: [familyByMember("038-kanto")],
        expandedFamilies: new Set<string>(),
        expandedForms: new Set<string>(),
        onToggleFamily: () => undefined,
        onToggleForm: () => undefined,
      }),
    );
    expect(html).toContain("立即處理結論");
    expect(html).toContain("要保留的條件");
    expect(html).toContain("其他普通重複可傳");
  });
});
