import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { afterAll, describe, expect, it } from "vitest";
import { GET as exportRedirect } from "@/app/api/export/route";
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
  });

  it("manifest 保存核心筆數與來源資料庫雜湊", () => {
    expect(siteSnapshotManifest.counts).toMatchObject({
      pokemonSpecies: 30,
      pokemonForms: 35,
      battleVariants: 153,
      rawEvaluationData: 123,
      sourceReferences: 107,
      retentionEvaluations: 306,
      categoryEvaluations: 1071,
      dashboardRows: 153,
      openReviewIssues: 134,
    });
    expect(siteSnapshotManifest.sourceDatabase.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(siteSnapshotManifest.snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("預建 Excel 可開啟且包含十張繁中工作表", async () => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await readFile(
      path.join(process.cwd(), "public", "exports", "pokemon-go-retention-001-030.xlsx"),
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
      "需要重新確認",
      "資料來源",
      "變更紀錄",
    ]);
  });

  it("舊 Excel API 會轉址到靜態檔案", () => {
    const response = exportRedirect(new Request("https://example.test/api/export"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.test/exports/pokemon-go-retention-001-030.xlsx",
    );
  });
});
