import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { afterAll, describe, expect, it } from "vitest";
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
import { resolveDatabaseLocation } from "@/lib/database";
import { CURRENT_RELEASE_CONTRACT } from "@/config/release-contract";
import { prisma } from "@/lib/prisma";
import type { DashboardRow } from "@/lib/data-read-model";
import type { HomeSnapshot } from "@/presentation/home-snapshot";
import homeSnapshot from "../site-data/home.json";

const hasCanonicalDb = (() => {
  const location = resolveDatabaseLocation();
  const sourceDatabase = siteSnapshotManifest.sourceDatabase;

  if (location.manifestPath !== sourceDatabase.path || !existsSync(location.absolutePath)) {
    return false;
  }

  const database = readFileSync(location.absolutePath);
  return (
    database.byteLength === sourceDatabase.bytes &&
    createHash("sha256").update(database).digest("hex") === sourceDatabase.sha256
  );
})();

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

function canonicalHash(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

describe("static 唯讀 snapshot", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it.skipIf(!hasCanonicalDb)(
    "與本機 Prisma read model 完全一致",
    async () => {
      const [snapshotDashboard, prismaDashboard, snapshotReview, prismaReview]: [
        DashboardRow[],
        DashboardRow[],
        Awaited<ReturnType<typeof getSnapshotReviewIssues>>,
        Awaited<ReturnType<typeof getPrismaReviewIssues>>,
      ] = await Promise.all([
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
    },
    60_000,
  );

  it("manifest 保存核心筆數與來源資料庫雜湊", () => {
    expect((siteSnapshotManifest as { dataVersion?: string }).dataVersion).toBe(
      CURRENT_RELEASE_CONTRACT.dataVersion,
    );
    expect(siteSnapshotManifest.counts).toMatchObject({
      pokemonSpecies: 502,
      pokemonForms: 579,
      battleVariants: CURRENT_RELEASE_CONTRACT.expectedCounts.battleVariants,
      rawEvaluationData: 1507,
      sourceReferences: 220,
      retentionEvaluations: 2509,
      categoryEvaluations: 16408,
      ivRecommendations: CURRENT_RELEASE_CONTRACT.expectedCounts.ivRecommendations,
      dashboardRows: CURRENT_RELEASE_CONTRACT.expectedCounts.battleVariants,
      homeFamilies: CURRENT_RELEASE_CONTRACT.expectedCounts.families,
      openReviewIssues: 160,
    });
    expect(siteSnapshotManifest.sourceDatabase.path).toBe("rebuild-ci.db");
    expect(siteSnapshotManifest.sourceDatabase.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(siteSnapshotManifest.snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("預建 Excel 可開啟且包含十張繁中工作表", async () => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await readFile(
      path.join(process.cwd(), CURRENT_RELEASE_CONTRACT.snapshot.exportPath),
    );
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    expect(workbook.subject).toBe(CURRENT_RELEASE_CONTRACT.dataVersion);
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

  it("uses browser-side static data loaders instead of server APIs", async () => {
    const [pageSource, loaderSource, compactHome, prettyHome] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "app", "page.tsx"), "utf8"),
      readFile(path.join(process.cwd(), "src", "components", "home-data-loader.tsx"), "utf8"),
      readFile(path.join(process.cwd(), "public", "data", "home.json")),
      readFile(path.join(process.cwd(), "site-data", "home.json")),
    ]);
    expect(pageSource).not.toContain("homeSummarySnapshot");
    expect(pageSource).not.toContain("getDashboardRows");
    expect(pageSource).toContain("HomeDataLoader");
    expect(loaderSource).toContain('fetchStaticJson<HomeRuntimeSnapshot>("/data/home.json")');
    expect(loaderSource).not.toContain("/api/home");
    expect(compactHome.byteLength).toBeLessThan(prettyHome.byteLength);
    const compactHomeBudget = Math.ceil(
      1_250_000 * (siteSnapshotManifest.counts.homeFamilies / 245),
    );
    expect(compactHome.byteLength).toBeLessThan(compactHomeBudget);
    const runtimeHome = JSON.parse(compactHome.toString("utf8")) as {
      schemaVersion: number;
      dataVersion: string;
      families: Array<{
        detailsLoaded?: boolean;
        members: Array<{ form: { variants: unknown[]; detailsLoaded?: boolean } }>;
      }>;
    };
    expect(runtimeHome.schemaVersion).toBe(2);
    expect(runtimeHome.dataVersion).toBe(CURRENT_RELEASE_CONTRACT.dataVersion);
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
});

describe("首頁 snapshot", () => {
  it("保留已解析 IV 建議但不重複攜帶全域規則", () => {
    const home = homeSnapshot as unknown as HomeSnapshot;
    const forms = home.families.flatMap((family) => family.members.map((member) => member.form));
    const variants = forms.flatMap((form) => form.variants);

    expect(home.schemaVersion).toBe(1);
    expect(home.families).toHaveLength(CURRENT_RELEASE_CONTRACT.expectedCounts.families);
    expect(variants).toHaveLength(CURRENT_RELEASE_CONTRACT.expectedCounts.battleVariants);
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
