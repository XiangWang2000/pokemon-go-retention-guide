import { readFile, writeFile } from "node:fs/promises";
import { prisma } from "../src/lib/prisma";
import { RULES_VERSION } from "../src/rules/rules";

interface Metrics {
  originalNeedsReviewCount: number;
  reclassificationCounts: Record<
    "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE",
    number
  >;
  holdForNowReasons: Array<{ battleVariantId: string; reasonZhTw: string }>;
  nonImpactingOpenIssueCount: number;
  resolvedWithNotApplicable: number;
  decidedWithDataUnavailable: number;
  resolvedByPurifiedInheritance: number;
  resolvedByPracticalDecisionBasis: number;
  purifiedInheritedCategoryCount: number;
  purifiedOverrides: number;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, "")) as T;
}

async function main() {
  const metrics = await readJson<Metrics>("data/remediation/001-030-metrics.json");
  let validation: Record<string, string> = { status: "尚未執行最終驗證" };
  try {
    validation = await readJson<Record<string, string>>("data/remediation/validation-results.json");
  } catch {
    // 最終驗證完成後再寫入，不以猜測代替測試結果。
  }
  const [issues, decisions, sourceCount, rawCount, changeCount, gmax, fearow, purified] =
    await Promise.all([
      prisma.dataIssue.findMany({
        where: { batchKey: "001-030", status: "OPEN" },
        include: {
          pokemonForm: { include: { species: true } },
          battleVariant: true,
        },
        orderBy: [{ affectsFinalDecision: "desc" }, { issueType: "asc" }],
      }),
      prisma.retentionEvaluation.groupBy({
        by: ["finalDecision"],
        where: { rulesVersion: RULES_VERSION },
        _count: true,
      }),
      prisma.sourceReference.count(),
      prisma.rawEvaluationData.count(),
      prisma.changeLog.count(),
      prisma.categoryEvaluation.findUnique({
        where: {
          battleVariantId_category: {
            battleVariantId: "012-kanto-gigantamax",
            category: "MAX_BATTLE",
          },
        },
      }),
      prisma.rawEvaluationData.findUnique({ where: { id: "raw-022-kanto-normal-great" } }),
      prisma.battleVariant.count({
        where: { variantKey: "PURIFIED", inheritanceMode: { not: "NONE" } },
      }),
    ]);
  const payload = {
    batch: "001-030",
    updatedAt: "2026-07-17",
    rulesVersion: RULES_VERSION,
    originalProblem:
      "舊規則仍可能把個別類別缺資料提升為 NEEDS_REVIEW，即使已有足以作出實用保留判斷的人工整理或繼承資料。",
    schemaChanges: [
      "新增 EvaluationDataStatus 與 CategoryEvaluation／CategoryEvaluationSource。",
      "PokemonForm、BattleVariant 新增 RELEASED／UNRELEASED／UNKNOWN 三態。",
      "新增 Purified 繼承、Rocket 定性欄位、Max 拆分維度、PvP 擷取 metadata 與 Review reason。",
      "新增 EvaluationProvenance，區分 SOURCE_VERIFIED、MANUAL_CURATED、INHERITED、DATA_UNAVAILABLE。",
    ],
    ruleEngineChanges: [
      "finalDecision 不再包含 NEEDS_REVIEW；關鍵不確定性依不可逆風險原則產生 HOLD_FOR_NOW。",
      "SOURCE_MISSING、NOT_APPLICABLE、UNRANKED、DATA_UNAVAILABLE、PARTIALLY_VERIFIED 等次要缺口不會自動產生 HOLD_FOR_NOW。",
      "類別缺口保留在資料待補清單並視情況降低 confidence，不會自動覆蓋 finalDecision。",
    ],
    rocketStrategy:
      "火箭隊改存 DATA_UNAVAILABLE／定性 rocketRating／rocketRoles；未使用 PvP 或 PvE 排名替代。",
    pokebattlerStrategy:
      "不保存無法穩定重現的全域攻擊手名次；資料鍵需包含物種、型態、版本、雙招、Boss、等級、天氣、好友與排序方法。",
    purifiedStrategy: {
      inheritedVariants: purified,
      inheritedCategoryCount: metrics.purifiedInheritedCategoryCount,
      overrides: metrics.purifiedOverrides,
      note: "Normal 基礎評估加淨化 modifier 與 optional override；Return 已由普通版移至 Purified。",
    },
    maxStrategy: {
      fields: [
        "maxTypeRank",
        "maxTypeTier",
        "maxTypeKey",
        "maxOverallRating",
        "maxInvestmentRating",
        "maxUseCaseBreadth",
      ],
      gmaxButterfree: gmax,
      sourceConflict: false,
    },
    pvpokeStrategy: {
      snapshotCommit: "86847e535b7e0a0f4e91f9628b3fc713ae6adca7",
      category: "OVERALL",
      cup: "OPEN",
      extractionMethod: "固定 commit 的完整 JSON 陣列索引（index + 1）",
      fearow,
    },
    needsReviewStatistics: metrics,
    decisionCounts: Object.fromEntries(decisions.map((item) => [item.finalDecision, item._count])),
    preservedHistory: {
      sourceReferences: sourceCount,
      rawEvaluationData: rawCount,
      changeLogs: changeCount,
    },
    remainingReview: issues.map((issue) => ({
      id: issue.id,
      battleVariantId: issue.battleVariantId,
      dexNumber: issue.pokemonForm?.species.dexNumber ?? null,
      pokemon: issue.pokemonForm?.species.nameZhTw ?? null,
      variantKey: issue.battleVariant?.variantKey ?? null,
      issueType: issue.issueType,
      affectsFinalDecision: issue.affectsFinalDecision,
      messageZhTw: issue.messageZhTw,
      suggestedActionZhTw: issue.suggestedActionZhTw,
    })),
    tests: validation,
    knownLimitations: [
      "仍有部分 Shadow／Purified 推出狀態缺少可靠逐物種原始來源。",
      "部分 PvE 只有 GO Hub 屬性 Tier／角色定位，未聲稱為 Pokebattler 全域排名。",
      "火箭隊目前沒有可靠完整的當季全物種排名。",
      "#030 的後續進化 #031 超出本批範圍，仍保留 material review。",
    ],
  };

  const lines = [
    "# #001～#030 資料修正報告",
    "",
    `- 更新日期：${payload.updatedAt}`,
    `- rulesVersion：${RULES_VERSION}`,
    "",
    "## 1. 原問題摘要",
    "",
    payload.originalProblem,
    "",
    "## 2. Schema 修改",
    "",
    ...payload.schemaChanges.map((item) => `- ${item}`),
    "",
    "## 3. 規則引擎修改",
    "",
    ...payload.ruleEngineChanges.map((item) => `- ${item}`),
    "",
    "## 4. 火箭隊策略修改",
    "",
    payload.rocketStrategy,
    "",
    "## 5. Pokebattler 策略修改",
    "",
    payload.pokebattlerStrategy,
    "",
    "## 6. Purified 繼承策略",
    "",
    `- 繼承 Normal 的 Purified 版本：${purified}`,
    `- 免除重複建立的基礎類別評估：${metrics.purifiedInheritedCategoryCount}`,
    `- 需要 override：${metrics.purifiedOverrides}`,
    "- Return 從普通版重新歸類到 Purified；高價值 Shadow 顯示不可逆淨化風險。",
    "",
    "## 7. Max 評估維度拆分",
    "",
    `- GMax 巴大蝶：蟲屬性 #${gmax?.maxTypeRank ?? "—"}／${gmax?.maxTypeTier ?? "—"}；整體=${gmax?.maxOverallRating ?? "—"}；投資=${gmax?.maxInvestmentRating ?? "—"}；用途=${gmax?.maxUseCaseBreadth ?? "—"}。`,
    "- 這些是不同維度，不再標記為 SOURCE_CONFLICT。",
    "",
    "## 8. PvPoke 排名驗證策略",
    "",
    `- 固定 commit：${payload.pvpokeStrategy.snapshotCommit}`,
    "- 只接受 Open League／Overall 完整 JSON；保存 species、form、variant、league、cup、category、版本、擷取方法與 reproducible。",
    `- 大嘴雀 GL #${fearow?.rank ?? "—"}：${fearow?.reproducible ? "完整榜單可重現，因此保留" : "無法重現，已停用"}。`,
    "",
    "## 9. 原 NEEDS_REVIEW 重新分類統計",
    "",
    `- 原 NEEDS_REVIEW：${metrics.originalNeedsReviewCount}`,
    `- 轉為 KEEP：${metrics.reclassificationCounts.KEEP}`,
    `- 轉為 CONDITIONAL_KEEP：${metrics.reclassificationCounts.CONDITIONAL_KEEP}`,
    `- 轉為 HOLD_FOR_NOW：${metrics.reclassificationCounts.HOLD_FOR_NOW}`,
    `- 轉為 TRANSFER_CANDIDATE：${metrics.reclassificationCounts.TRANSFER_CANDIDATE}`,
    `- 不影響最終決策的資料待補：${metrics.nonImpactingOpenIssueCount}`,
    `- 含 NOT_APPLICABLE 而仍可判斷：${metrics.resolvedWithNotApplicable}`,
    `- 含 DATA_UNAVAILABLE 而仍可判斷：${metrics.decidedWithDataUnavailable}`,
    `- 因 Purified 繼承而解決：${metrics.resolvedByPurifiedInheritance}`,
    `- 因已有足夠實用判斷依據而解決：${metrics.resolvedByPracticalDecisionBasis}`,
    "",
    "## 10. HOLD_FOR_NOW 的具體原因",
    "",
    ...metrics.holdForNowReasons.map((item) => `- ${item.battleVariantId}：${item.reasonZhTw}`),
    "",
    "## 11. 資料待補項目",
    "",
    ...payload.remainingReview.map(
      (issue) => `- ${issue.battleVariantId ?? "未指定"}｜${issue.issueType}｜${issue.messageZhTw}`,
    ),
    "",
    "## 12. 資料問題是否影響最終保留結論",
    "",
    ...payload.remainingReview.map(
      (issue) =>
        `- ${issue.battleVariantId ?? "未指定"}：${issue.affectsFinalDecision ? "會" : "不會"}；建議：${issue.suggestedActionZhTw}`,
    ),
    "",
    "## 13. 測試結果",
    "",
    ...Object.entries(validation).map(([key, value]) => `- ${key}：${value}`),
    "",
    "## 13. 已知限制",
    "",
    ...payload.knownLimitations.map((item) => `- ${item}`),
  ];
  const json = `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`;
  await writeFile("review/001-030-remediation.json", json, "utf8");
  await writeFile("review/001-030-remediation.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log("已產生 review/001-030-remediation.md 與 .json。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
