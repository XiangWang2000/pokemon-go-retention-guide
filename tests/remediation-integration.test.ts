import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { RULES_VERSION } from "@/rules/rules";

const hasCanonicalDb = existsSync("dev.db");

describe.skipIf(!hasCanonicalDb)("#001～#030 修正後資料一致性", () => {
  it("8. 暗影推出狀態補證後不再留下會影響結論的開放 issue", async () => {
    const [openMaterialCount, openUnknownRelease] = await Promise.all([
      prisma.dataIssue.count({
        where: {
          battleVariantId: "019-kanto-shadow",
          status: "OPEN",
          affectsFinalDecision: true,
        },
      }),
      prisma.dataIssue.findFirst({
        where: {
          battleVariantId: "019-kanto-shadow",
          issueType: "UNKNOWN_RELEASE_STATUS",
          status: "OPEN",
        },
      }),
    ]);
    expect(openMaterialCount).toBe(0);
    expect(openUnknownRelease).toBeNull();
  });

  it("6b. Purified 資料庫記錄指向同型態 Normal", async () => {
    const purified = await prisma.battleVariant.findUnique({ where: { id: "003-kanto-purified" } });
    expect(purified).toMatchObject({
      inheritsFromVariantId: "003-kanto-normal",
      hasReturnAccess: true,
    });
    expect(purified?.inheritanceMode).not.toBe("NONE");
  });

  it("9b. GMax 巴大蝶拆分 Max 維度且沒有開放中的假衝突", async () => {
    const [max, conflictCount] = await Promise.all([
      prisma.categoryEvaluation.findUnique({
        where: {
          battleVariantId_category: {
            battleVariantId: "012-kanto-gigantamax",
            category: "MAX_BATTLE",
          },
        },
      }),
      prisma.dataIssue.count({
        where: {
          battleVariantId: "012-kanto-gigantamax",
          issueType: "SOURCE_CONFLICT",
          status: "OPEN",
        },
      }),
    ]);
    expect(max).toMatchObject({
      maxTypeRank: 1,
      maxTypeTier: "S",
      maxOverallRating: "LIMITED",
      maxInvestmentRating: "LOW",
      maxUseCaseBreadth: "NARROW",
    });
    expect(conflictCount).toBe(0);
  });

  it("15. 大嘴雀候選排名重新驗證的 Change Log 有完整記錄", async () => {
    const [rank, change] = await Promise.all([
      prisma.rawEvaluationData.findUnique({ where: { id: "raw-022-kanto-normal-great" } }),
      prisma.changeLog.findUnique({ where: { id: "remediation-fearow-gl-rank-verification" } }),
    ]);
    expect(rank).toMatchObject({
      rank: 20,
      cup: "OPEN",
      pvpCategory: "OVERALL",
      speciesKey: "fearow",
      reproducible: true,
    });
    expect(change?.newValue).toContain("完整榜單可重現");
    expect(change?.changeReasonZhTw).toContain("固定 commit");
  });

  it("16. 類別缺資料不會覆蓋已可合理作出的人工結論", async () => {
    const [evaluation, issue] = await Promise.all([
      prisma.retentionEvaluation.findFirst({
        where: { battleVariantId: "020-kanto-shadow" },
        orderBy: { generatedAt: "desc" },
      }),
      prisma.dataIssue.findFirst({
        where: {
          battleVariantId: "020-kanto-shadow",
          issueType: "MATERIAL_DATA_GAP",
          status: "OPEN",
        },
      }),
    ]);
    expect(evaluation).toMatchObject({
      finalDecision: "TRANSFER_CANDIDATE",
      provenance: "MANUAL_CURATED",
      confidence: "MEDIUM",
    });
    expect(issue?.affectsFinalDecision).toBe(false);
    expect(issue?.provisionalDecision).toBe("TRANSFER_CANDIDATE");
  });

  it("9. affectsFinalDecision=false 不會覆蓋正式結論", async () => {
    const evaluation = await prisma.retentionEvaluation.findFirst({
      where: { battleVariantId: "020-kanto-shadow", rulesVersion: RULES_VERSION },
    });
    const issues = await prisma.dataIssue.findMany({
      where: { battleVariantId: "020-kanto-shadow", status: "OPEN" },
    });
    expect(issues.some((issue) => !issue.affectsFinalDecision)).toBe(true);
    expect(evaluation?.finalDecision).toBe("TRANSFER_CANDIDATE");
  });

  it("10. 所有資料庫 HOLD_FOR_NOW 都有具體中文理由", async () => {
    const evaluations = await prisma.retentionEvaluation.findMany({
      where: { rulesVersion: RULES_VERSION, finalDecision: "HOLD_FOR_NOW" },
    });
    expect(evaluations.length).toBeGreaterThan(0);
    for (const evaluation of evaluations) {
      expect(evaluation.reasonZhTw.length).toBeGreaterThan(25);
      expect(evaluation.reasonZhTw).not.toBe("資料不足");
    }
  });

  it("17. Purified 類別以 INHERITED 明確標示繼承 Normal", async () => {
    const category = await prisma.categoryEvaluation.findUnique({
      where: {
        battleVariantId_category: {
          battleVariantId: "003-kanto-purified",
          category: "PVP",
        },
      },
    });
    expect(category?.provenance).toBe("INHERITED");
  });
});
