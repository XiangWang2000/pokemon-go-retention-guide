import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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

describe("#061～#090 批次與跨批次家族", () => {
  it("完整涵蓋 30 個圖鑑編號與 40 個地區型態", () => {
    const batchRows = rows.filter((row) => row.dexNumber >= 61 && row.dexNumber <= 90);
    expect([...new Set(batchRows.map((row) => row.dexNumber))]).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 61),
    );
    expect(new Set(batchRows.map((row) => row.formId)).size).toBe(40);
    expect(
      [
        "074-alola",
        "075-alola",
        "076-alola",
        "077-galar",
        "078-galar",
        "079-galar",
        "080-galar",
        "083-galar",
        "088-alola",
        "089-alola",
      ].every((formId) => batchRows.some((row) => row.formId === formId)),
    ).toBe(true);
  });

  it("蚊香蝌蚪跨批次家族只出現一次，且不以範圍缺口覆蓋蚊香泳士結論", () => {
    const family = familyByMember("062-kanto");
    expect(family.members.map((member) => member.form.formId)).toEqual([
      "060-kanto",
      "061-kanto",
      "062-kanto",
    ]);
    expect(family.isBatchTruncated).toBe(false);
    expect(family.retentionStrategy).toBe("KEEP_TARGETS");
    expect(
      families.filter((item) => item.members.some((member) => member.form.formId === "062-kanto")),
    ).toHaveLength(1);
    expect(rows.find((row) => row.id === "060-kanto-normal")?.decision).toBe("CONDITIONAL_KEEP");
  });

  it("普通、暗影、極巨與超極巨怪力明確分開", () => {
    const variants = forms
      .find((form) => form.formId === "068-kanto")!
      .variants.map((variant) => variant.row);
    for (const key of ["NORMAL", "SHADOW", "DYNAMAX", "GIGANTAMAX"]) {
      expect(variants.find((row) => row.variantKey === key)).toMatchObject({
        releaseStatus: "RELEASED",
        decision: "KEEP",
      });
    }
    expect(variants.find((row) => row.variantKey === "GIGANTAMAX")?.maxBattleSummaryZhTw).toContain(
      "普通與極巨版本不能替代",
    );
  });

  it("Mega 胡地、大食花與呆殼獸只綁定正確關都型態", () => {
    expect(rows.find((row) => row.id === "065-kanto-mega")).toMatchObject({
      releaseStatus: "RELEASED",
      decision: "KEEP",
    });
    expect(rows.find((row) => row.id === "071-kanto-mega")).toMatchObject({
      releaseStatus: "RELEASED",
      decision: "KEEP",
    });
    expect(rows.find((row) => row.id === "080-kanto-mega")).toMatchObject({
      releaseStatus: "RELEASED",
      decision: "CONDITIONAL_KEEP",
    });
    expect(rows.some((row) => row.id === "080-galar-mega")).toBe(false);
  });

  it("阿羅拉與伽勒爾進化分支不會和關都分支混成同一卡", () => {
    expect(familyByMember("074-kanto").members.map((member) => member.form.formId)).toEqual([
      "074-kanto",
      "075-kanto",
      "076-kanto",
    ]);
    expect(familyByMember("074-alola").members.map((member) => member.form.formId)).toEqual([
      "074-alola",
      "075-alola",
      "076-alola",
    ]);
    expect(familyByMember("079-kanto").members.map((member) => member.form.formId)).toEqual([
      "079-kanto",
      "080-kanto",
    ]);
    expect(familyByMember("079-galar").members.map((member) => member.form.formId)).toEqual([
      "079-galar",
      "080-galar",
    ]);
  });

  it("前階僅作進化候選時不標成本體獨立用途", () => {
    const family = familyByMember("063-kanto");
    for (const formId of ["063-kanto", "064-kanto"]) {
      const member = family.members.find((item) => item.form.formId === formId)!;
      expect(member.hasIndependentUse).toBe(false);
      expect(member.roles).toContain("EVOLUTION_MATERIAL");
    }
  });

  it("完整低價值家族與地區分支可判定為大多可傳", () => {
    expect(familyByMember("074-kanto").retentionStrategy).toBe("MOSTLY_TRANSFER");
    expect(familyByMember("074-alola").retentionStrategy).toBe("MOSTLY_TRANSFER");
    expect(familyByMember("088-kanto").retentionStrategy).toBe("MOSTLY_TRANSFER");
    expect(familyByMember("088-alola").retentionStrategy).toBe("MOSTLY_TRANSFER");
  });

  it("只有後續重要進化可能造成誤傳時才暫時保留", () => {
    expect(familyByMember("081-kanto").retentionStrategy).toBe("HOLD_FOR_NOW");
    expect(familyByMember("083-galar").retentionStrategy).toBe("HOLD_FOR_NOW");
    expect(familyByMember("090-kanto").retentionStrategy).toBe("HOLD_FOR_NOW");
    expect(familyByMember("062-kanto").retentionStrategy).not.toBe("HOLD_FOR_NOW");
    expect(familyByMember("080-kanto").retentionStrategy).not.toBe("HOLD_FOR_NOW");
  });

  it("高價值暗影怪力不設硬性最低 IV，低總 IV 不觸發淨化", () => {
    const shadow = rows.find((row) => row.id === "068-kanto-shadow")!;
    const purified = rows.find((row) => row.id === "068-kanto-purified")!;
    expect(shadow.decision).toBe("KEEP");
    expect(shadow.recommendedIvStrategyZhTw).toContain("先留用途候選");
    expect(shadow.pveSummaryZhTw).toContain("不設攻擊或總 IV 硬性最低門檻");
    expect(purified.decision).toBe("TRANSFER_CANDIDATE");
    expect(purified.inheritance?.purificationRiskZhTw).toContain("低總 IV 不構成淨化理由");
  });

  it("PvE 的 15攻只作同種排序，14攻高整體IV仍可留", () => {
    for (const id of [
      "068-kanto-dynamax",
      "068-kanto-gigantamax",
      "065-kanto-mega",
      "071-kanto-mega",
    ]) {
      const row = rows.find((item) => item.id === id)!;
      expect(row.recommendedIvStrategyZhTw, id).toContain("15攻優先");
      expect(row.recommendedIvStrategyZhTw, id).toContain("14攻高整體IV亦可留");
    }
  });

  it("卡片第一層仍同時顯示保留條件與其他普通重複可傳", () => {
    const html = renderToStaticMarkup(
      createElement(FamilyOverviewComponent, {
        families: [familyByMember("068-kanto")],
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

  it("本批新增來源皆實際綁定到版本與評估結論", async () => {
    const sources = await getSources();
    const ids = [
      "OFF-GMAX-MACHAMP-2025",
      "OFF-MEGA-ALAKAZAM-2022",
      "OFF-MEGA-VICTREEBEL-2026",
      "OFF-MEGA-SLOWBRO-2021",
      "OFF-CD-POLIWAG-2023",
      "OFF-CD-DEC-2023",
      "PVE-SHADOW-MACHAMP-20260730",
      "PVE-DMAX-ALAKAZAM-20260730",
      "OFF-DMAX-MACHOP-2026",
    ];
    for (const id of ids) {
      const source = sources.find((item) => item.id === id);
      expect(source, id).toBeDefined();
      expect(source!.evaluationCount, id).toBeGreaterThan(0);
      expect(source!.referencedPokemon.length, id).toBeGreaterThan(0);
      expect(source!.linkedEvidence.length, id).toBeGreaterThan(0);
    }
  });

  it("批次變更紀錄使用本批來源，不出現無關排行榜", async () => {
    const logs = await getChangeLogs();
    const batchLog = logs.find((log) => log.id === "r10-batch-061-090");
    const crossLog = logs.find((log) => log.id === "r10-cross-family-060");
    expect(batchLog?.source).toBeNull();
    expect(crossLog?.sourceId).toBe("OFF-CD-POLIWAG-2023");
    expect(JSON.stringify([batchLog, crossLog])).not.toContain("Inteleon rankings");
  });
});
