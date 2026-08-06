import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeDataLoader } from "@/components/home-data-loader";
import { FamilyOverview as FamilyOverviewComponent } from "@/components/overview/family-overview";
import { getChangeLogs, getDashboardRows, getSources } from "@/lib/data";
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

  it("後續世代進化已知時，不再把整個家族標成暫時保留", () => {
    expect(familyByMember("057-kanto")).toMatchObject({
      isBatchTruncated: true,
      retentionStrategy: "KEEP_TARGETS",
    });
    expect(familyByMember("060-kanto")).toMatchObject({
      isBatchTruncated: false,
      retentionStrategy: "KEEP_TARGETS",
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
    expect(html).toContain("主要用途標籤");
    expect(html).not.toContain("數字 IV 門檻");
  });

  it("暫時保留會列出實際待補原因，而不是只顯示通用缺資料", () => {
    const family = familyByMember("041-kanto");
    expect(family.retentionStrategy).toBe("HOLD_FOR_NOW");
    expect(family.holdReasons.map((reason) => reason.labelZhTw)).toEqual(
      expect.arrayContaining(["後續進化待補", "尚未推出版本"]),
    );
  });

  it("首頁資料尚未載入時以破折號取代四個零值統計", () => {
    const html = renderToStaticMarkup(createElement(HomeDataLoader));
    expect(html.match(/資料載入中/g)).toHaveLength(4);
    expect(html.match(/>—<\/p>/g)).toHaveLength(4);
    expect(html).not.toMatch(/>0<\/p>/);
  });

  it("本批新增官方來源皆綁定到對應版本與評估結論", async () => {
    const sources = await getSources();
    const ids = [
      "OFF-GMAX-MEOWTH-2026",
      "OFF-CD-VULPIX-2026",
      "OFF-RISING-SHADOWS-2023",
      "OFF-AUTUMN-SHADOWS-2020",
      "OFF-CD-POLIWAG-2023",
    ];
    for (const id of ids) {
      const source = sources.find((item) => item.id === id);
      expect(source, id).toBeDefined();
      expect(source!.evaluationCount, id).toBeGreaterThan(0);
      expect(source!.referencedPokemon.length, id).toBeGreaterThan(0);
      expect(source!.linkedEvidence.length, id).toBeGreaterThan(0);
      expect(source!.linkedEvidence.every((item) => item.target.includes("／"))).toBe(true);
    }
  });

  it("整批新增的變更紀錄不再誤用 Inteleon rankings", async () => {
    const logs = await getChangeLogs();
    const batchLog = logs.find((log) => log.id === "r8-batch-031-060");
    expect(batchLog).toBeDefined();
    expect(batchLog!.source).toBeNull();
    expect(JSON.stringify(batchLog)).not.toContain("Inteleon rankings");
  });
});
