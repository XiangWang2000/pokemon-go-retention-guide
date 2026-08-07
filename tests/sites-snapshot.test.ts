import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";
import { GET as exportRedirect } from "@/app/api/export/route";
import { HomeDataLoader } from "@/components/home-data-loader";
import {
  getChangeLogs as getSnapshotChangeLogs,
  getDashboardRows as getSnapshotDashboardRows,
  getReviewIssues as getSnapshotReviewIssues,
  getSources as getSnapshotSources,
  siteSnapshotManifest,
} from "@/lib/data";
import {
  getChangeLogs as getPrismaChangeLogs,
  getDashboardRows as getPrismaDashboardRows,
  getReviewIssues as getPrismaReviewIssues,
  getSources as getPrismaSources,
} from "@/lib/data-prisma";
import { prisma } from "@/lib/prisma";
import type { HomeSnapshot } from "@/presentation/home-snapshot";
import { buildHomeSummary } from "@/presentation/home-summary";
import homeSnapshot from "../site-data/home.json";

function canonicalHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

describe("Sites 唯讀 snapshot", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("與本機 Prisma read model 完全一致", async () => {
    const [snapshotDashboard, prismaDashboard, snapshotReview, prismaReview] = await Promise.all([
      getSnapshotDashboardRows(),
      getPrismaDashboardRows(),
      getSnapshotReviewIssues(),
      getPrismaReviewIssues(),
    ]);
    const [snapshotSources, prismaSources, snapshotChanges, prismaChanges] = await Promise.all([
      getSnapshotSources(),
      getPrismaSources(),
      getSnapshotChangeLogs(),
      getPrismaChangeLogs(),
    ]);
    expect(canonicalHash(snapshotDashboard)).toBe(canonicalHash(prismaDashboard));
    expect(canonicalHash(snapshotReview)).toBe(canonicalHash(prismaReview));
    expect(canonicalHash(snapshotSources)).toBe(canonicalHash(prismaSources));
    expect(canonicalHash(snapshotChanges)).toBe(canonicalHash(prismaChanges));
  }, 30_000);

  it("manifest 保存核心筆數與來源資料庫雜湊", () => {
    expect((siteSnapshotManifest as { dataVersion?: string }).dataVersion).toBe("2026.08.06-r15");
    expect(siteSnapshotManifest.counts).toMatchObject({
      pokemonSpecies: 151,
      pokemonForms: 188,
      battleVariants: 783,
      rawEvaluationData: 542,
      sourceReferences: 151,
      retentionEvaluations: 1407,
      categoryEvaluations: 5481,
      ivRecommendations: 11,
      dashboardRows: 783,
      homeFamilies: 101,
      openReviewIssues: 181,
    });
    expect(siteSnapshotManifest.sourceDatabase.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(siteSnapshotManifest.snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("預建 Excel 可開啟且包含十張繁中工作表", async () => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await readFile(
      path.join(process.cwd(), "public", "exports", "pokemon-go-retention-001-151.xlsx"),
    );
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    expect(workbook.worksheets).toHaveLength(10);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "寶可夢型態",
      "評估總覽",
      "PvP原始資料",
      "PvE原始資料",
      "道館與Max Battle",
      "招式資料",
      "進化關係",
      "資料待補清單",
      "資料來源",
      "變更紀錄",
    ]);
  });

  it("首頁使用精簡 SSR 摘要，完整 snapshot 仍由 runtime API 載入", async () => {
    const [pageSource, compactHome, prettyHome] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "app", "page.tsx"), "utf8"),
      readFile(path.join(process.cwd(), "public", "data", "home.json")),
      readFile(path.join(process.cwd(), "site-data", "home.json")),
    ]);
    expect(pageSource).toContain("homeSummarySnapshot");
    expect(pageSource).not.toContain("getDashboardRows");
    expect(pageSource).toContain("HomeDataLoader");
    expect(compactHome.byteLength).toBeLessThan(prettyHome.byteLength);
    expect(compactHome.byteLength).toBeLessThan(1_000_000);
    const runtimeHome = JSON.parse(compactHome.toString("utf8")) as {
      schemaVersion: number;
      families: Array<{
        detailsLoaded?: boolean;
        members: Array<{ form: { variants: unknown[]; detailsLoaded?: boolean } }>;
      }>;
    };
    expect(runtimeHome.schemaVersion).toBe(2);
    expect(
      runtimeHome.families.every(
        (family) =>
          family.detailsLoaded === false &&
          family.members.every(
            (member) => member.form.detailsLoaded === false && member.form.variants.length === 0,
          ),
      ),
    ).toBe(true);
  });

  it("首頁初始 HTML 直接輸出日期與搜尋入口，不重複輸出家族摘要", () => {
    const home = homeSnapshot as unknown as HomeSnapshot;
    const summary = buildHomeSummary(home);
    const html = renderToStaticMarkup(createElement(HomeDataLoader, { initialSummary: summary }));

    expect(html).toContain("資料更新日期：2026/08/06");
    expect(html).toContain("搜尋編號、名稱、型態或進化名稱");
    expect(html).toContain("所有世代");
    expect(html).toContain("所有用途");
    expect(html).not.toContain("首頁摘要");
    expect(html).not.toContain("重要家族速覽");
    expect(html).not.toContain("三合一磁怪家族");
    expect(html).not.toContain("?v=");
  });

  it("dashboard snapshot 保留家族、進化路徑與結構化 IV 資料", async () => {
    const rows = await getSnapshotDashboardRows();
    const bulbasaur = rows.find((row) => row.formId === "001-kanto");

    expect(bulbasaur?.familyKey).toBe("KANTO_FAMILY_001");
    expect(bulbasaur?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fromFormId: "001-kanto", toFormId: "002-kanto" }),
      ]),
    );
    expect(bulbasaur?.ivRecommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ scopeType: "GLOBAL", primaryUseKey: "PVE" }),
      ]),
    );
  }, 30_000);
  it("舊 Excel API 會轉址到靜態檔案", () => {
    const response = exportRedirect(new Request("https://example.test/api/export"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.test/exports/pokemon-go-retention-001-151.xlsx",
    );
  });
});

describe("首頁 snapshot", () => {
  it("保留已解析 IV 建議但不重複攜帶全域規則", () => {
    const home = homeSnapshot as unknown as HomeSnapshot;
    const forms = home.families.flatMap((family) => family.members.map((member) => member.form));
    const variants = forms.flatMap((form) => form.variants);

    expect(home.schemaVersion).toBe(1);
    expect(home.families).toHaveLength(101);
    expect(forms).toHaveLength(188);
    expect(variants).toHaveLength(783);
    expect(variants.every((variant) => variant.row.ivRecommendations.length === 0)).toBe(true);
    expect(forms.some((form) => form.ivRecommendations.length > 0)).toBe(true);
    expect(variants.some((variant) => variant.ivRecommendations.length > 0)).toBe(true);
  });

  it("把 released Mega 候選與特殊取得夢幻帶入第一層安全結論", () => {
    const home = homeSnapshot as unknown as HomeSnapshot;
    const familyContaining = (formId: string) =>
      home.families.find((family) =>
        family.members.some((member) => member.form.formId === formId),
      );
    const aerodactyl = familyContaining("142-kanto");
    const mew = familyContaining("151-kanto");
    const mewForm = mew?.members.find((member) => member.form.formId === "151-kanto")?.form;

    expect(aerodactyl?.retentionStrategy).toBe("SELECTIVE_KEEP");
    expect(aerodactyl?.handlingSummaryZhTw).toContain("Mega 候選");
    expect(aerodactyl?.handlingSummaryZhTw).toContain("普通重複個體可傳");
    expect(mew?.retentionStrategy).toBe("KEEP_TARGETS");
    expect(mew?.handlingSummaryZhTw).toContain("特殊取得");
    expect(mew?.handlingSummaryZhTw).not.toContain("普通重複個體可傳");
    expect(mewForm?.decision).toBe("KEEP");
    expect(mewForm?.decisionReason).toContain("不以 IV 作傳送門檻");
  });
});
