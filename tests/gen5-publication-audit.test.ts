import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import type { DashboardRow } from "@/lib/data-read-model";
import { buildFormOverviews } from "@/presentation/form-overview";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { CURRENT_RELEASE_CONTRACT } from "@/config/release-contract";
import { auditDataFileName } from "@/lib/site-data-paths";

const rows = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as DashboardRow[];
const gen5 = rows.filter((row) => row.dexNumber >= 494 && row.dexNumber <= 649);
const rowById = new Map(gen5.map((row) => [row.id, row]));
const evolutionCases = ["633-unova-normal", "633-unova-shadow", "633-unova-dynamax", "634-unova-dynamax", "636-unova-normal"];

describe("Gen5 published decision and provenance acceptance", () => {
  it("keeps evolution candidates conditional in both dashboard and individual audit payloads", () => {
    for (const id of evolutionCases) {
      const row = rowById.get(id)!;
      expect(row.decision, id).toBe("CONDITIONAL_KEEP");
      expect(row.evolutionSummaryZhTw, id).toContain("進化候選");
      const category = row.categoryStatuses.find((item) => item.category === "EVOLUTION_VALUE")!;
      expect(category.materialToDecision, id).toBe(true);
      expect(category.sources.length, id).toBeGreaterThan(0);
      const audit = JSON.parse(readFileSync(`public/data/audit/${auditDataFileName(id)}`, "utf8"));
      expect(audit.row?.decision ?? audit.decision, id).toBe(row.decision);
    }
  });

  it("does not describe independently useful Dewott and Zweilous as evolution-only", () => {
    for (const id of ["502-unova-normal", "502-unova-shadow", "634-unova-normal", "634-unova-shadow"]) {
      const row = rowById.get(id)!;
      expect(row.decision, id).toBe("CONDITIONAL_KEEP");
      expect(row.reasonZhTw, id).not.toContain("只選留適合作進化");
      expect(row.pvpSummaryZhTw, id).toContain("Overall #");
    }
  });

  it("preserves unknown release and missing battle evidence without invented negative verdicts", () => {
    for (const row of gen5) {
      if (row.releaseStatus === "UNKNOWN") {
        expect(row.decision, row.id).toBe("HOLD_FOR_NOW");
        expect(row.assessmentDisposition, row.id).toBe("TRUE_DATA_PENDING");
        expect(row.reviewIssues.some((issue) => issue.affectsFinalDecision), row.id).toBe(true);
      }
      for (const category of row.categoryStatuses) {
        if (category.category === "PVE" && category.status === "DATA_UNAVAILABLE") {
          expect(category.pveUseLevel, row.id).toBeNull();
        }
      }
    }
    const cryogonal = rowById.get("615-unova-dynamax")!;
    const max = cryogonal.categoryStatuses.find((item) => item.category === "MAX_BATTLE")!;
    expect(max.status).toBe("DATA_UNAVAILABLE");
    expect(max.sources.some((source) => source.url === "https://db.pokemongohub.net/pokemon/615-Dynamax")).toBe(true);
  });

  it("keeps unknown special-version holds scoped to those versions", () => {
    const ordinary = rowById.get("644-unova-normal")!;
    const unknown = rowById.get("644-unova-dynamax")!;
    expect(unknown.releaseStatus).toBe("UNKNOWN");
    expect(unknown.decision).toBe("HOLD_FOR_NOW");
    const families = buildFamilyOverviews(buildFormOverviews([ordinary, unknown]));
    expect(families[0]?.retentionStrategy).not.toBe("HOLD_FOR_NOW");
  });

  it("keeps released material gaps on hold at family level", () => {
    const pending = gen5.filter((row) => row.variantKey === "NORMAL" && row.releaseStatus === "RELEASED" && row.decision === "HOLD_FOR_NOW");
    expect(pending.length).toBeGreaterThan(0);
    for (const row of pending) {
      expect(row.reviewIssues.some((issue) => issue.issueType === "MATERIAL_DATA_GAP" && issue.affectsFinalDecision), row.id).toBe(true);
      const family = buildFamilyOverviews(buildFormOverviews([row]))[0]!;
      expect(family.retentionStrategy, row.id).toBe("HOLD_FOR_NOW");
      expect(family.holdReasons.map((reason) => reason.key), row.id).toContain("KEY_DATA_PENDING");
    }
  });

  it("does not label unknown release as confirmed unreleased", () => {
    const unknown = rowById.get("644-unova-dynamax")!;
    const family = buildFamilyOverviews(buildFormOverviews([{ ...unknown, variantKey: "NORMAL" }]))[0]!;
    expect(family.retentionStrategy).toBe("HOLD_FOR_NOW");
    expect(family.holdReasons.map((reason) => reason.key)).not.toContain("UNRELEASED_VARIANT");
  });

  it("describes released gaps as missing data alongside evolution candidates", () => {
    const form = buildFormOverviews([rowById.get("633-unova-normal")!, rowById.get("633-unova-purified")!])[0]!;
    expect(JSON.stringify(form)).toContain("版本關鍵資料未確認");
    expect(JSON.stringify(form)).not.toContain("版本推出狀態未確認");
  });

  it("preserves exact positive target investment and move conditions", () => {
    expect(rowById.get("635-unova-normal")?.decision).toBe("KEEP");
    expect(rowById.get("635-unova-normal")?.requiredMovesSummaryZhTw).toContain("Brutal Swing");
    expect(rowById.get("637-unova-normal")?.decision).toBe("KEEP");
    expect(rowById.get("635-unova-dynamax")?.decision).toBe("CONDITIONAL_KEEP");
    expect(rowById.get("636-unova-normal")?.recommendedIvStrategyZhTw).toContain("14攻高整體IV亦可留");
  });

  it("exports the same candidate decisions and explanations to Excel", async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(CURRENT_RELEASE_CONTRACT.snapshot.exportPath);
    const sheet = workbook.worksheets.find((item) => item.getRow(1).values?.toString().includes("finalDecision Enum"))!;
    expect(sheet).toBeDefined();
    const header = sheet.getRow(1);
    let idColumn = 0, decisionColumn = 0, reasonColumn = 0;
    header.eachCell((cell, index) => {
      if (cell.text === "戰鬥版本ID") idColumn = index;
      if (cell.text === "finalDecision Enum") decisionColumn = index;
      if (cell.text === "判斷理由") reasonColumn = index;
    });
    const matched = new Set<string>();
    sheet.eachRow((row, index) => {
      const id = row.getCell(idColumn).text;
      if (index > 1 && evolutionCases.includes(id)) {
        expect(row.getCell(decisionColumn).text, id).toBe(rowById.get(id)!.decision);
        expect(row.getCell(reasonColumn).text, id).toBe(rowById.get(id)!.reasonZhTw);
        matched.add(id);
      }
    });
    expect(matched.size).toBe(evolutionCases.length);
  });
});
