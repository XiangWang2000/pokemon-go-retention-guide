import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FamilyOverview as FamilyOverviewComponent } from "@/components/overview/family-overview";
import { CURRENT_RELEASE_CONTRACT } from "@/config/release-contract";
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
    ).toHaveLength(CURRENT_RELEASE_CONTRACT.expectedCounts.battleVariants);
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
    expect(forms.map((form) => form.formId)).toContain("026-alola");
    expect(forms.map((form) => form.formId)).toContain("416-sinnoh");
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
    expect(html).toContain("有明確保留目標");
    expect(html).toContain('data-testid="family-member-decision-summary"');
    expect(html).toContain("逐隻快速判定");
    expect(html).toContain("符合條件才留");
    expect(html).toContain("妙蛙種子、妙蛙草");
    expect(html).toContain("妙蛙花");
    expect(html).toContain('data-testid="family-target-version-summary"');
    expect(html).toContain("保留目標與版本狀態");
    expect(html).toContain('aria-label="妙蛙花適用版本"');
    expect(html).toContain(">普通<");
    expect(html).toContain(">暗影<");
    expect(html).toContain(">Mega<");
    expect(html).toContain(">超極巨化<");
    expect(html).toContain('data-testid="family-keep-condition"');
    expect(html).toContain(">符合這些條件才留<");
    expect(html).toContain("PvP（UL Rank≤100）");
    expect(html).toContain('data-testid="family-transfer-condition"');
    expect(html).toContain("其他普通重複可傳");
    expect(html).toContain("其餘不符合上述用途的普通重複個體可傳");
    expect(html).toContain('data-testid="transfer-safety-note"');
    expect(html).toContain("傳送前排除");
    expect(html).toContain("異色、特殊造型、活動背卡、紀念與個人收藏個體");
    expect(html).toContain("text-lg leading-7");
    expect(html.indexOf('data-testid="family-keep-condition"')).toBeLessThan(
      html.indexOf('data-testid="family-transfer-condition"'),
    );
    expect(html.indexOf('aria-label="展開妙蛙花家族成員"')).toBeLessThan(
      html.indexOf('data-testid="family-handling-summary"'),
    );
    expect(html.indexOf(">直接判定<")).toBeLessThan(html.indexOf(">成員<"));
    expect(html).toContain('data-testid="family-term-glossary"');
    expect(html.indexOf('data-testid="family-handling-summary"')).toBeLessThan(
      html.indexOf('data-testid="family-term-glossary"'),
    );
    expect(html).toContain("GL");
    expect(html).toContain("超級聯盟，CP 上限 1500");
    expect(html).toContain("Rank");
    expect(html).toContain("同物種同型態同聯盟的個體 IV 排名");
    expect(html).toContain("物種排名不等於個體 IV Rank");
    expect(html).toContain("每秒傷害／倒下前預期總傷害");
    expect(html).toContain("妙蛙花");
    for (const vagueText of ["高攻個體", "高 IV", "高品質個體", "好的 PvP IV", "適合對戰的個體"]) {
      expect(html).not.toContain(vagueText);
    }
    expect(html).toContain("主要用途標籤");
    expect(html).not.toContain("數字 IV 門檻");
    expect(html).not.toContain('data-testid="iv-recommendation-details"');
    expect(html).not.toContain("來源與資料狀態");
  });

  it("雷丘家族會把 Mega Y 核心輸出呈現在 PvE 摘要", () => {
    const raichu = byMember("026-kanto");
    expect(raichu.pve).toMatchObject({ label: "核心投資", tone: "HIGH" });
    expect(raichu.pve.detail).toContain("Mega Y 雷丘");
    expect(raichu.primaryUses).toEqual(expect.arrayContaining(["PvE", "Mega"]));
  });

  it("Mega-only 家族不會再被 PvE 聚合成無顯著用途", () => {
    for (const formId of ["080-kanto", "115-kanto", "142-kanto"]) {
      expect(byMember(formId).pve.label, formId).not.toBe("無顯著用途");
    }
  });

  it("ML 摘要會區分物種榜主力與次要候選，不把個體 IV Rank 當物種名次", () => {
    const dragonite = byMember("149-kanto");
    const machamp = byMember("068-kanto");

    expect(dragonite.handlingSummaryZhTw).toContain("ML 主力候選");
    expect(dragonite.handlingSummaryZhTw).toContain("物種榜 #");
    expect(dragonite.handlingSummaryZhTw).toContain("高 IV 投資");

    expect(machamp.handlingSummaryZhTw).toContain("ML 次要候選");
    expect(machamp.handlingSummaryZhTw).toContain("物種榜 #");
    expect(machamp.handlingSummaryZhTw).toContain("少量高 IV 即可");
    expect(machamp.handlingSummaryZhTw).not.toContain("ML 高 IV 投資候選");
  });

  it("特殊取得家族不會顯示普通重複可傳標籤", () => {
    const mewFamily = byMember("151-kanto");
    const html = renderToStaticMarkup(
      createElement(FamilyOverviewComponent, {
        families: [mewFamily],
        expandedFamilies: new Set<string>(),
        expandedForms: new Set<string>(),
        onToggleFamily: () => undefined,
        onToggleForm: () => undefined,
      }),
    );

    expect(html).toContain("特殊取得不可傳");
    expect(html).toContain("特殊取得個體不以 IV 作傳送門檻");
    expect(html).not.toContain("其他普通重複可傳");
  });

  it("選擇性保留、暫緩與可傳家族都顯示不含糊的處理邊界", () => {
    const renderFamily = (targetFamily: (typeof families)[number]) =>
      renderToStaticMarkup(
        createElement(FamilyOverviewComponent, {
          families: [targetFamily],
          expandedFamilies: new Set<string>(),
          expandedForms: new Set<string>(),
          onToggleFamily: () => undefined,
          onToggleForm: () => undefined,
        }),
      );

    const selectiveHtml = renderFamily(byMember("012-kanto"));
    expect(selectiveHtml).toContain("只留符合條件者");
    expect(selectiveHtml).toContain("超極巨巴大蝶");
    expect(selectiveHtml).toContain(">超極巨化<");
    expect(selectiveHtml).toContain("不符合上述用途的普通重複個體可傳");

    const kantoRaticateHtml = renderFamily(byMember("019-kanto"));
    expect(kantoRaticateHtml).not.toContain("資料不足，先不要傳");
    expect(kantoRaticateHtml).toContain("普通重複可傳");
    expect(kantoRaticateHtml).toContain("排除收藏需求後，普通重複可直接傳送");
    expect(kantoRaticateHtml).toContain('data-testid="transfer-safety-note"');

    const transferHtml = renderFamily(byMember("019-alola"));
    expect(transferHtml).toContain("普通重複可傳");
    expect(transferHtml).toContain("排除收藏需求後，普通重複可直接傳送");

    const primalHtml = renderFamily(byMember("382-hoenn"));
    expect(primalHtml).toContain(">原始回歸<");
  });

  it("首頁摘要未載入 BattleVariant 時仍以保留目標顯示適用版本", () => {
    const summaryFamily = {
      ...family,
      detailsLoaded: false,
      members: family.members.map((member) => ({
        ...member,
        form: { ...member.form, variants: [], detailsLoaded: false },
      })),
    };
    const html = renderToStaticMarkup(
      createElement(FamilyOverviewComponent, {
        families: [summaryFamily],
        expandedFamilies: new Set<string>(),
        expandedForms: new Set<string>(),
        onToggleFamily: () => undefined,
        onToggleForm: () => undefined,
      }),
    );

    expect(html).toContain('data-testid="family-target-version-summary"');
    expect(html).toContain('aria-label="妙蛙花適用版本"');
    expect(html).toContain(">暗影<");
    expect(html).toContain(">Mega<");
    expect(html).toContain(">超極巨化<");
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
