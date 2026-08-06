import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DataAuditTable } from "@/components/overview/data-audit-table";
import { QuickOverview } from "@/components/overview/quick-overview";
import { getDashboardRows } from "@/lib/data";
import {
  buildFormOverviews,
  buildPveOverview,
  compactDataStatus,
  type FormOverview,
} from "@/presentation/form-overview";

const rows = await getDashboardRows();
const forms = buildFormOverviews(rows);

function form(formId: string) {
  const result = forms.find((item) => item.formId === formId);
  if (!result) throw new Error(`找不到測試型態：${formId}`);
  return result;
}

describe("PokemonForm 快速總覽 presentation layer", () => {
  it("同一 PokemonForm 只產生一列，且不同地區型態保持分開", () => {
    expect(forms).toHaveLength(new Set(rows.map((row) => row.formId)).size);
    expect(forms).toHaveLength(188);
    expect(forms.filter((item) => item.dexNumber === 19).map((item) => item.formId)).toEqual([
      "019-kanto",
      "019-alola",
    ]);
  });

  it("分組後保留全部 BattleVariant，沒有合併或遺失評估", () => {
    const sourceIds = rows.map((row) => row.id).sort();
    const overviewIds = forms
      .flatMap((item) => item.variants.map((variant) => variant.row.id))
      .sort();
    expect(overviewIds).toEqual(sourceIds);
    expect(overviewIds).toHaveLength(783);
  });

  it("妙蛙種子總覽只顯示已推出徽章，展開仍保留所有版本", () => {
    const bulbasaur = form("001-kanto");
    expect(bulbasaur.releasedVariantKeys).toEqual(["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"]);
    expect(bulbasaur.variants.map((variant) => variant.row.variantKey)).toEqual([
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
    ]);
    expect(bulbasaur.decision).toBe("CONDITIONAL_KEEP");
    expect(bulbasaur.decisionReason).toContain("進化");
  });

  it("正式建議不會隱藏同型態內暫時保留的 BattleVariant", () => {
    const charmander = form("004-kanto");
    expect(charmander.decision).toBe("CONDITIONAL_KEEP");
    expect(
      charmander.variants.filter((variant) => variant.row.decision === "HOLD_FOR_NOW"),
    ).toHaveLength(1);
    expect(charmander.decisionReason).toContain("暫時保留");
  });

  it("資料狀態只輸出短版繁體中文，不洩漏內部 Enum 或長說明", () => {
    expect(compactDataStatus("NOT_APPLICABLE")).toBe("—");
    expect(compactDataStatus("DATA_UNAVAILABLE")).toBe("資料有限");
    expect(compactDataStatus("SOURCE_MISSING")).toBe("待補資料");
    expect(compactDataStatus("SOURCE_CONFLICT")).toBe("來源有差異");
    expect(compactDataStatus("UNKNOWN_RELEASE_STATUS")).toBe("推出狀態待確認");
    expect(compactDataStatus("DATA_UNAVAILABLE")).not.toContain("目前沒有可靠");
  });

  it("低 PvE Tier 的暗影版不會被整體 KEEP 誤標為高 PvE", () => {
    for (const formId of ["015-kanto", "018-kanto", "028-alola"]) {
      const shadow = form(formId).variants.find((variant) => variant.row.variantKey === "SHADOW")!;
      expect(buildPveOverview([shadow.row]).tone).not.toBe("HIGH");
      expect(buildPveOverview([shadow.row]).label).not.toContain("暗影打手");
    }
    const highShadow = form("003-kanto").variants.find(
      (variant) => variant.row.variantKey === "SHADOW",
    )!;
    expect(buildPveOverview([highShadow.row])).toMatchObject({
      tone: "HIGH",
      label: "核心投資",
      detail: expect.stringContaining("暗影"),
    });
  });

  it("高風險前階會保留後續進化用途與 PvE 四級標籤", () => {
    const expected = [
      ["081-kanto", "USABLE_OR_BUDGET", "可用／預算型", "自爆磁怪"],
      ["111-kanto", "CORE_INVESTMENT", "核心投資", "超甲狂犀"],
      ["114-kanto", "USABLE_OR_BUDGET", "可用／預算型", "巨蔓藤"],
      ["123-kanto", "SPECIAL_USE", "特殊用途", "巨鉗螳螂"],
      ["125-kanto", "USABLE_OR_BUDGET", "可用／預算型", "電擊魔獸"],
      ["126-kanto", "USABLE_OR_BUDGET", "可用／預算型", "鴨嘴炎獸"],
    ] as const;
    for (const [formId, pveUseLevel, pveLabel, target] of expected) {
      const normal = form(formId).variants.find((variant) => variant.row.variantKey === "NORMAL")!;
      expect(normal.row.decision, formId).not.toBe("HOLD_FOR_NOW");
      expect(
        normal.row.categoryStatuses.find((item) => item.category === "PVE"),
        formId,
      ).toMatchObject({
        pveUseLevel,
      });
      expect(normal.row.evolutionSummaryZhTw, formId).toContain(target);
      expect(buildPveOverview([normal.row]), formId).toMatchObject({ label: pveLabel });
    }
  });

  it("Max Battle 摘要使用 Max 原始評價，而不是整體保留結論", () => {
    expect(form("001-kanto").megaMax).toMatchObject({
      label: "極巨：—",
      tone: "NONE",
    });
    expect([form("003-kanto").megaMax.label, form("003-kanto").megaMax.detail]).toContain(
      "超極巨：中",
    );
    expect(form("006-kanto").megaMax).toMatchObject({ label: "Mega／Primal：高", tone: "HIGH" });
    expect([form("006-kanto").megaMax.label, form("006-kanto").megaMax.detail]).toContain(
      "超極巨：高",
    );
    expect(form("012-kanto").megaMax).toMatchObject({
      label: "超極巨：限定用途",
      tone: "SPECIAL",
    });
  });
});

describe("快速總覽與資料審核 UI", () => {
  it("快速總覽使用七欄、手機卡片，且不含 2600px 超寬表格", () => {
    const overview = form("001-kanto");
    const html = renderToStaticMarkup(
      createElement(QuickOverview, {
        forms: [overview],
        expanded: new Set<string>(),
        onToggle: () => undefined,
      }),
    );
    expect(html).toContain('data-testid="quick-overview-table"');
    expect(html).toContain('data-mobile-layout="cards"');
    expect(html).toContain("最終建議");
    expect(html).not.toContain("min-w-[2600px]");
    expect((html.match(/<th/g) ?? []).length).toBeGreaterThanOrEqual(7);
  });

  it("展開 PokemonForm 後可查看每個 BattleVariant、來源與資料狀態", () => {
    const overview = form("001-kanto");
    const html = renderToStaticMarkup(
      createElement(QuickOverview, {
        forms: [overview],
        expanded: new Set([overview.formId]),
        onToggle: () => undefined,
      }),
    );
    for (const variant of overview.variants) {
      expect(html).toContain(`data-variant-id="${variant.row.id}"`);
    }
    expect(html).toContain("來源與資料狀態");
    expect(html).toContain("各戰鬥版本");
    expect(html).toContain("完整詳細資料");
  });

  it("資料審核模式保留精確排名、信心、來源及原始資料", () => {
    const row = form("003-kanto").variants.find(
      (variant) => variant.row.variantKey === "SHADOW",
    )!.row;
    const html = renderToStaticMarkup(
      createElement(DataAuditTable, {
        rows: [row],
        expanded: new Set([row.id]),
        onToggle: () => undefined,
      }),
    );
    expect(html).toContain('data-testid="audit-table"');
    expect(html).toContain("GL");
    expect(html).toContain("UL");
    expect(html).toContain("ML");
    expect(html).toContain("信心");
    expect(html).toContain("原始資料與規則軌跡");
    expect(html).toContain("類別狀態");
    expect(html).toContain("此欄位待補，但不影響普通個體結論");
    expect(html).toContain("查看");
  });

  it("每個快速總覽項目仍可由搜尋層使用完整中英文與進化名稱", () => {
    const searchable = form("019-alola") as FormOverview;
    expect(searchable.nameZhTw).toBeTruthy();
    expect(searchable.nameEn).toBeTruthy();
    expect(searchable.formNameZhTw).toBeTruthy();
    expect(searchable.formNameEn).toBeTruthy();
    expect(searchable.evolutionNames.length).toBeGreaterThan(0);
  });
});
