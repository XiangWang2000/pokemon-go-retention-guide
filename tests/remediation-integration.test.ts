import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getDashboardRows } from "@/lib/data-prisma";
import { prisma } from "@/lib/prisma";
import { RULES_VERSION } from "@/rules/rules";

const hasCanonicalDb = existsSync("rebuild-ci.db");

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
      rank: 21,
      cup: "OPEN",
      pvpCategory: "OVERALL",
      speciesKey: "fearow",
      reproducible: true,
    });
    expect(change?.newValue).toContain("完整榜單可重現");
    expect(change?.changeReasonZhTw).toContain("固定 commit");
  });

  it("16. 已確認推出狀態後不再留下安全性待補", async () => {
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
          batchKey: "001-030",
        },
      }),
    ]);
    expect(evaluation?.finalDecision).not.toBe("HOLD_FOR_NOW");
    expect(issue?.affectsFinalDecision).toBe(false);
  });

  it("9. 次要 issue 不會製造 HOLD_FOR_NOW", async () => {
    const evaluation = await prisma.retentionEvaluation.findFirst({
      where: { battleVariantId: "020-kanto-shadow", rulesVersion: RULES_VERSION },
      orderBy: { generatedAt: "desc" },
    });
    const issues = await prisma.dataIssue.findMany({
      where: { battleVariantId: "020-kanto-shadow", status: "OPEN" },
    });
    expect(issues.some((issue) => !issue.affectsFinalDecision)).toBe(true);
    expect(evaluation?.finalDecision).not.toBe("HOLD_FOR_NOW");
  });

  it("10. 所有資料庫 HOLD_FOR_NOW 都有具體中文理由", async () => {
    const evaluations = await prisma.retentionEvaluation.findMany({
      where: { rulesVersion: RULES_VERSION },
      orderBy: { generatedAt: "desc" },
    });
    const latestByVariant = new Map<string, (typeof evaluations)[number]>();
    for (const evaluation of evaluations) {
      if (!latestByVariant.has(evaluation.battleVariantId)) {
        latestByVariant.set(evaluation.battleVariantId, evaluation);
      }
    }
    const currentHolds = [...latestByVariant.values()].filter(
      (evaluation) => evaluation.finalDecision === "HOLD_FOR_NOW",
    );
    expect(currentHolds).toHaveLength(0);
    for (const evaluation of currentHolds) {
      expect(evaluation.reasonZhTw.length).toBeGreaterThan(25);
      expect(evaluation.reasonZhTw).not.toBe("資料不足");
    }
  });

  it("10b. remediation metrics 只列出每個版本的最新 HOLD_FOR_NOW", () => {
    const metrics = JSON.parse(readFileSync("data/remediation/001-030-metrics.json", "utf8")) as {
      holdForNowReasons: Array<{ battleVariantId: string }>;
    };
    const variantIds = metrics.holdForNowReasons.map((item) => item.battleVariantId);
    expect(variantIds).toHaveLength(0);
    expect(new Set(variantIds).size).toBe(variantIds.length);
  });

  it("18. 已確認普通型態不會被 remediation 降回 UNKNOWN", async () => {
    const forms = await prisma.pokemonForm.findMany({
      where: { id: { in: ["011-kanto", "020-kanto", "022-kanto", "024-kanto", "026-kanto"] } },
      select: { id: true, releaseStatus: true, isReleasedInPokemonGo: true },
    });
    expect(forms).toHaveLength(5);
    expect(forms.every((form) => form.releaseStatus === "RELEASED")).toBe(true);
    expect(forms.every((form) => form.isReleasedInPokemonGo === true)).toBe(true);
  });

  it("19. 完整 Shadow roster 對未推出型態給出明確 UNRELEASED", async () => {
    const shadows = await prisma.battleVariant.findMany({
      where: {
        id: {
          in: [
            "021-kanto-shadow",
            "022-kanto-shadow",
            "025-kanto-shadow",
            "026-alola-shadow",
            "026-kanto-shadow",
          ],
        },
      },
      select: { id: true, releaseStatus: true, isReleased: true },
    });
    expect(shadows).toHaveLength(5);
    expect(shadows.every((variant) => variant.releaseStatus === "UNRELEASED")).toBe(true);
    expect(shadows.every((variant) => variant.isReleased === false)).toBe(true);
  });

  it("19b. Shadow 與 Purified 使用同一推出邊界，第一批沒有 UNKNOWN", async () => {
    const [releasedPair, unreleasedPair, unknownCount] = await Promise.all([
      prisma.battleVariant.findMany({
        where: { id: { in: ["020-kanto-shadow", "020-kanto-purified"] } },
        select: { releaseStatus: true, isReleased: true },
      }),
      prisma.battleVariant.findMany({
        where: { id: { in: ["021-kanto-shadow", "021-kanto-purified"] } },
        select: { releaseStatus: true, isReleased: true },
      }),
      prisma.battleVariant.count({
        where: {
          pokemonForm: { species: { dexNumber: { gte: 1, lte: 30 } } },
          releaseStatus: "UNKNOWN",
        },
      }),
    ]);
    expect(releasedPair).toHaveLength(2);
    expect(releasedPair.every((variant) => variant.releaseStatus === "RELEASED")).toBe(true);
    expect(releasedPair.every((variant) => variant.isReleased === true)).toBe(true);
    expect(unreleasedPair).toHaveLength(2);
    expect(unreleasedPair.every((variant) => variant.releaseStatus === "UNRELEASED")).toBe(true);
    expect(unreleasedPair.every((variant) => variant.isReleased === false)).toBe(true);
    expect(unknownCount).toBe(0);
  });

  it("19c. Dynamax 與 Gigantamax 推出狀態保持獨立", async () => {
    const [dynamax, gigantamax] = await Promise.all([
      prisma.battleVariant.findUnique({ where: { id: "025-kanto-dynamax" } }),
      prisma.battleVariant.findUnique({ where: { id: "025-kanto-gigantamax" } }),
    ]);
    expect(dynamax).toMatchObject({ releaseStatus: "UNRELEASED", isReleased: false });
    expect(gigantamax).toMatchObject({ releaseStatus: "RELEASED", isReleased: true });
  });

  it("19d. 第一批公開特殊型態不暴露 NEEDS_REVIEW 或未推出戰鬥原始資料", async () => {
    const trackedKeys = new Set(["SHADOW", "PURIFIED", "DYNAMAX", "GIGANTAMAX"]);
    const [dashboardRows, unreleasedGigantamaxCount] = await Promise.all([
      getDashboardRows(),
      prisma.battleVariant.count({
        where: {
          variantKey: "GIGANTAMAX",
          releaseStatus: "UNRELEASED",
          pokemonForm: { species: { dexNumber: { gte: 1, lte: 30 } } },
        },
      }),
    ]);
    const rows = dashboardRows.filter(
      (row) => row.dexNumber <= 30 && trackedKeys.has(row.variantKey),
    );
    const unreleasedWithRaw = rows
      .filter((row) => row.releaseStatus === "UNRELEASED" && row.raw.length > 0)
      .map((row) => row.id);
    const gigantamaxPikachu = rows.find((row) => row.id === "025-kanto-gigantamax");
    const maxCategory = gigantamaxPikachu?.categoryStatuses.find(
      (category) => category.category === "MAX_BATTLE",
    );

    expect(JSON.stringify(rows)).not.toContain("NEEDS_REVIEW");
    expect(unreleasedGigantamaxCount).toBe(0);
    expect(unreleasedWithRaw).toEqual([]);
    expect(maxCategory).toMatchObject({ maxTypeTier: null, maxOverallRating: null });
    expect(gigantamaxPikachu?.raw[0]?.tier).toBeNull();
  });

  it("20. 未解來源衝突保留在類別、結論與 Review Queue", async () => {
    const [
      fearowCategory,
      fearowEvaluation,
      fearowIssue,
      pidgeotCategory,
      pidgeotEvaluation,
      pidgeotIssue,
    ] = await Promise.all([
      prisma.categoryEvaluation.findUnique({
        where: {
          battleVariantId_category: { battleVariantId: "022-kanto-normal", category: "PVP" },
        },
      }),
      prisma.retentionEvaluation.findFirst({
        where: { battleVariantId: "022-kanto-normal", rulesVersion: RULES_VERSION },
        orderBy: { generatedAt: "desc" },
      }),
      prisma.dataIssue.findFirst({
        where: {
          battleVariantId: "022-kanto-normal",
          issueType: "SOURCE_CONFLICT",
          status: "OPEN",
        },
      }),
      prisma.categoryEvaluation.findUnique({
        where: {
          battleVariantId_category: { battleVariantId: "018-kanto-mega", category: "PVE" },
        },
      }),
      prisma.retentionEvaluation.findFirst({
        where: { battleVariantId: "018-kanto-mega", rulesVersion: RULES_VERSION },
        orderBy: { generatedAt: "desc" },
      }),
      prisma.dataIssue.findFirst({
        where: {
          battleVariantId: "018-kanto-mega",
          issueType: "SOURCE_CONFLICT",
          status: "OPEN",
        },
      }),
    ]);
    expect(fearowCategory).toMatchObject({ status: "SOURCE_CONFLICT", materialToDecision: false });
    expect(fearowEvaluation?.finalDecision).toBe("KEEP");
    expect(fearowEvaluation?.confidence).toBe("MEDIUM");
    expect(fearowIssue?.affectsFinalDecision).toBe(false);
    expect(pidgeotCategory).toMatchObject({ status: "SOURCE_CONFLICT", materialToDecision: false });
    expect(pidgeotEvaluation?.finalDecision).not.toBe("HOLD_FOR_NOW");
    expect(pidgeotIssue?.affectsFinalDecision).toBe(false);
  });

  it("21. #001～#030 與後續批次使用各自固定的 PvPoke 快照", async () => {
    const [firstBatch, laterBatch, currentSource] = await Promise.all([
      prisma.rawEvaluationData.findUnique({ where: { id: "raw-001-kanto-normal-great" } }),
      prisma.rawEvaluationData.findUnique({ where: { id: "raw-r8-031-kanto-normal-great" } }),
      prisma.sourceReference.findUnique({ where: { id: "pvpoke-gl-20260901" } }),
    ]);
    expect(firstBatch?.sourceId).toBe("pvpoke-gl-20260901");
    expect(laterBatch?.sourceId).toBe("pvpoke-gl-20260715");
    expect(currentSource?.dataVersion).toContain("7b96d91fb553780653190ad32de001b5d9086a7f");
  });

  it("22. 無 publishedAt 的新官方來源使用實際查閱日作版本", async () => {
    const source = await prisma.sourceReference.findUnique({
      where: { id: "OFF-GOFEST-MAX-FINALE-2025" },
    });
    expect(source?.dataVersion).toBe("live page accessed 2026-09-01");
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
