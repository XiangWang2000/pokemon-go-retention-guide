import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FamilyOverview as FamilyOverviewComponent } from "@/components/overview/family-overview";
import { getDashboardRows } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews, type FormOverview } from "@/presentation/form-overview";

const rows = await getDashboardRows();
const forms = buildFormOverviews(rows);
const families = buildFamilyOverviews(forms);

function byMember(formId: string) {
  const result = families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
  if (!result) throw new Error(`找不到家族成員：${formId}`);
  return result;
}

function cloneForm(form: FormOverview, changes: Partial<FormOverview>): FormOverview {
  return { ...form, ...changes };
}

describe("EvolutionPath 進化家族分組", () => {
  it("1. 同一 Evolution Family 在家族總覽只出現一個群組", () => {
    const bulbasaurFamily = families.filter((family) =>
      family.members.some((member) => member.form.formId === "001-kanto"),
    );
    expect(bulbasaurFamily).toHaveLength(1);
    expect(bulbasaurFamily[0]?.members.map((member) => member.form.formId)).toEqual([
      "001-kanto",
      "002-kanto",
      "003-kanto",
    ]);
    expect(bulbasaurFamily[0]?.familyNameZhTw).toBe("妙蛙花家族");
  });

  it("2/7. 展開資料仍保留全部成員與 BattleVariant", () => {
    expect(families.flatMap((family) => family.members)).toHaveLength(forms.length);
    expect(
      families.flatMap((family) =>
        family.members.flatMap((member) => member.form.variants.map((variant) => variant.row.id)),
      ),
    ).toEqual(expect.arrayContaining(rows.map((row) => row.id)));
    expect(
      families.flatMap((family) => family.members.flatMap((member) => member.form.variants)),
    ).toHaveLength(783);
  });

  it("3. 相同 familyKey 的不同地區進化路徑形成不同子群組", () => {
    const rattataGroups = families.filter((family) => family.familyKey === "KANTO_FAMILY_019");
    expect(rattataGroups).toHaveLength(2);
    expect(rattataGroups.map((family) => family.regionHintZhTw).sort()).toEqual([null, "阿羅拉"]);
    expect(
      rattataGroups.map((family) => family.members.map((member) => member.form.formId)),
    ).toEqual(
      expect.arrayContaining([
        ["019-kanto", "020-kanto"],
        ["019-alola", "020-alola"],
      ]),
    );
  });

  it("4. 分支進化 fixture 不會遺失任何分支", () => {
    const original = byMember("001-kanto").members.map((member) => member.form);
    const middle = original.find((form) => form.formId === "002-kanto")!;
    const terminal = original.find((form) => form.formId === "003-kanto")!;
    const branch = cloneForm(terminal, {
      formId: "003-branch-fixture",
      speciesId: "species-branch-fixture",
      dexNumber: 999,
      nameEn: "Branch Fixture",
      nameZhTw: "分支測試",
      evolvesFromFormId: middle.formId,
      evolutionPaths: [],
      variants: terminal.variants.map((variant) => ({
        ...variant,
        row: { ...variant.row, id: `${variant.row.id}-branch`, formId: "003-branch-fixture" },
      })),
    });
    const middleWithBranch = cloneForm(middle, {
      evolutionPaths: [
        ...middle.evolutionPaths,
        {
          id: "evo-fixture-branch",
          fromFormId: middle.formId,
          toFormId: branch.formId,
          requiresEvent: false,
          verifiedAt: null,
        },
      ],
    });
    const fixtureFamilies = buildFamilyOverviews([
      original[0]!,
      middleWithBranch,
      terminal,
      branch,
    ]);
    expect(fixtureFamilies).toHaveLength(1);
    expect(fixtureFamilies[0]?.branchCount).toBe(2);
    expect(fixtureFamilies[0]?.members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["001-kanto", "002-kanto", "003-kanto", "003-branch-fixture"]),
    );
    expect(fixtureFamilies[0]?.notices.join(" ")).toContain("2個進化分支");
  });

  it("5/6. 小個體與中間進化的獨立 PvP 用途會進入家族摘要", () => {
    const original = byMember("001-kanto").members.map((member) => member.form);
    const withPvpUse = (form: FormOverview) =>
      cloneForm(form, {
        pvp: { label: "中", detail: "超級聯盟", tone: "MEDIUM" },
        variants: form.variants.map((variant, index) =>
          index === 0
            ? {
                ...variant,
                primaryUseKeys: [...variant.primaryUseKeys, "GREAT_LEAGUE"],
              }
            : variant,
        ),
      });
    const fixture = buildFamilyOverviews([
      withPvpUse(original[0]!),
      withPvpUse(original[1]!),
      original[2]!,
    ])[0]!;
    expect(fixture.notices).toEqual(
      expect.arrayContaining([
        "小個體有獨立PvP用途，不要將最好的個體全部進化",
        "中間進化有獨立PvP用途，不要將最好的個體全部進化",
      ]),
    );
    expect(fixture.pvp.detail).toContain("中間進化");
  });

  it("8. 單隻圖鑑模式的 FormOverview 數量保持不變", () => {
    expect(forms).toHaveLength(188);
    expect(forms.map((form) => form.formId)).toContain("026-alola");
  });
});

describe("家族總覽 UI", () => {
  const family = byMember("001-kanto");

  it("23～26. 桌面表格不需超寬最小寬度，手機使用卡片，長說明在展開層", () => {
    const html = renderToStaticMarkup(
      createElement(FamilyOverviewComponent, {
        families: [family],
        expandedFamilies: new Set<string>(),
        expandedForms: new Set<string>(),
        onToggleFamily: () => undefined,
        onToggleForm: () => undefined,
      }),
    );
    expect(html).toContain('data-testid="family-overview-table"');
    expect(html).toContain('data-mobile-layout="family-cards"');
    expect(html).not.toContain("min-w-[");
    expect(html).not.toContain("用途廣度：高");
    expect(html).not.toContain("建議保留");
    expect(html).toContain('data-testid="family-handling-summary"');
    expect(html).toContain("立即處理結論");
    expect(html).toContain("先留再篩");
    expect(html).toContain('data-testid="family-keep-condition"');
    expect(html).toContain(">要保留的條件<");
    expect(html).toContain("PvP（GL Rank≤100、UL Rank≤100）");
    expect(html).toContain('data-testid="family-transfer-condition"');
    expect(html).toContain("其他普通重複可傳");
    expect(html).toContain("其餘不符合上述用途的普通重複個體可傳");
    expect(html).toContain("text-lg leading-7");
    expect(html.indexOf('data-testid="family-keep-condition"')).toBeLessThan(
      html.indexOf('data-testid="family-transfer-condition"'),
    );
    expect(html.indexOf('data-testid="family-handling-summary"')).toBeLessThan(
      html.indexOf('aria-label="展開妙蛙花家族成員"'),
    );
    expect(html).toContain('data-testid="family-term-glossary"');
    expect(html).toContain("GL");
    expect(html).toContain("超級聯盟，CP 上限 1500");
    expect(html).toContain("Rank");
    expect(html).toContain("同物種同聯盟的 IV 排名");
    expect(html).toContain("主要留");
    expect(html).toContain("妙蛙花");
    for (const vagueText of ["高攻個體", "高 IV", "高品質個體", "好的 PvP IV", "適合對戰的個體"]) {
      expect(html).not.toContain(vagueText);
    }
    expect(html).toContain("數字 IV 門檻");
    expect(html).toContain('data-testid="iv-recommendation-details"');
    expect(html).not.toContain("來源與資料狀態");
  });

  it("2/7/27. 展開家族及成員後仍能查看各版本、來源與資料狀態", () => {
    const targetForm = family.members[0]!.form;
    const html = renderToStaticMarkup(
      createElement(FamilyOverviewComponent, {
        families: [family],
        expandedFamilies: new Set([family.familyId]),
        expandedForms: new Set([targetForm.formId]),
        onToggleFamily: () => undefined,
        onToggleForm: () => undefined,
      }),
    );
    expect(html).toContain("來源與資料狀態");
    for (const variant of targetForm.variants) {
      expect(html).toContain(`data-variant-id="${variant.row.id}"`);
    }
    expect(html).toContain("size-11");
  });
});
