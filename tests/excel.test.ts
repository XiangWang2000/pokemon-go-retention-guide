import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import {
  buildExportWorkbook,
  createExportWorkbook,
  exportSheetNames,
  type ExportSheet,
} from "@/export/excel";
import { prisma } from "@/lib/prisma";

describe("Excel 匯出", () => {
  it("可開啟、工作表齊全、中文欄位與可重匯入 ID 正常", async () => {
    const sheets: ExportSheet[] = exportSheetNames.map((name) => ({
      name,
      columns: [
        { key: "id", header: "穩定ID", width: 20 },
        { key: "date", header: "更新日期", width: 14 },
        { key: "url", header: "來源網址", width: 30 },
      ],
      rows: [
        {
          id: "001-kanto-normal",
          date: new Date("2026-07-15T00:00:00Z"),
          url: { text: "原始頁面", hyperlink: "https://pvpoke.com/" },
        },
      ],
    }));
    const original = createExportWorkbook(sheets);
    const buffer = await original.xlsx.writeBuffer();
    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(buffer);
    expect(reopened.worksheets.map((sheet) => sheet.name)).toEqual([...exportSheetNames]);
    const sheet = reopened.getWorksheet("資料來源")!;
    expect(sheet.getCell("A1").value).toBe("穩定ID");
    expect(sheet.getCell("A2").value).toBe("001-kanto-normal");
    expect(sheet.getCell("B2").numFmt).toBe("yyyy-mm-dd");
    expect(sheet.getCell("C2").value).toMatchObject({ hyperlink: "https://pvpoke.com/" });
    expect(sheet.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(sheet.autoFilter).toBeTruthy();
  });

  it("實際匯出包含類別狀態、Review 影響欄與 GMax 拆分維度", async () => {
    const workbook = await buildExportWorkbook(prisma);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([...exportSheetNames]);

    const overviewHeaders = workbook.worksheets[1].getRow(1).values as unknown[];
    expect(overviewHeaders).toContain("火箭隊資料狀態");
    expect(overviewHeaders).toContain("Max資料狀態");

    const reviewHeaders = workbook.worksheets[7].getRow(1).values as unknown[];
    expect(reviewHeaders).toContain("影響最終結論");

    const maxSheet = workbook.worksheets[4];
    const butterfreeRow = maxSheet
      .getColumn("id")
      .values.findIndex((value) => value === "category-012-kanto-gigantamax-max_battle");
    expect(butterfreeRow).toBeGreaterThan(1);
    expect(maxSheet.getCell(butterfreeRow, maxSheet.getColumn("maxTypeRank").number).value).toBe(1);
    expect(
      maxSheet.getCell(butterfreeRow, maxSheet.getColumn("maxInvestmentRating").number).value,
    ).toBe("LOW");
  });
});
