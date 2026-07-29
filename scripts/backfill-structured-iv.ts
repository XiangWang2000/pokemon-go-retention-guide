import { prisma } from "../src/lib/prisma";
import { getDashboardRows } from "../src/lib/data-prisma";
import { buildFormOverviews } from "../src/presentation/form-overview";

const changedAt = new Date("2026-07-28T12:00:00+08:00");
const rulesVersion = "2026.07.28-iv-v2";

async function main() {
  const forms = buildFormOverviews(await getDashboardRows());
  let updated = 0;
  for (const variant of forms.flatMap((form) => form.variants)) {
    const evaluationId = variant.row.evaluationId;
    if (!evaluationId) continue;
    const previousValue = variant.row.recommendedIvStrategyZhTw;
    const newValue = variant.ivDirection;
    if (previousValue === newValue) continue;
    await prisma.$transaction([
      prisma.retentionEvaluation.update({
        where: { id: evaluationId },
        data: { recommendedIvStrategyZhTw: newValue },
      }),
      prisma.changeLog.upsert({
        where: { id: `change-${evaluationId}-iv-20260728` },
        create: {
          id: `change-${evaluationId}-iv-20260728`,
          entityType: "RetentionEvaluation",
          entityId: evaluationId,
          fieldName: "recommendedIvStrategyZhTw",
          previousValue,
          newValue,
          sourceId: null,
          changeReasonZhTw:
            "基準驗收移除PvE與暗影硬性IV淘汰線；保留15攻同種排序優先，並明示14攻高整體IV、招式、等級、CP、投入與斷點仍需比較。",
          changedAt,
          rulesVersion,
        },
        update: {
          previousValue,
          newValue,
          changeReasonZhTw:
            "基準驗收移除PvE與暗影硬性IV淘汰線；保留15攻同種排序優先，並明示14攻高整體IV、招式、等級、CP、投入與斷點仍需比較。",
          changedAt,
          rulesVersion,
        },
      }),
    ]);
    updated += 1;
  }
  console.log(`結構化IV建議回填完成：更新 ${updated} 筆最新評估。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
