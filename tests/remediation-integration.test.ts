import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("#001～#030 修正後資料一致性", () => {
  it("5b. UNKNOWN_RELEASE_STATUS 會出現在 Review Queue 且影響結論", async () => {
    const issue = await prisma.dataIssue.findFirst({
      where: { issueType: "UNKNOWN_RELEASE_STATUS", status: "OPEN" },
    });
    expect(issue).not.toBeNull();
    expect(issue?.affectsFinalDecision).toBe(true);
    expect(issue?.suggestedActionZhTw.length).toBeGreaterThan(10);
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
      decision: "TRANSFER_CANDIDATE",
      provenance: "MANUAL_CURATED",
      confidence: "MEDIUM",
    });
    expect(issue?.affectsFinalDecision).toBe(false);
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
