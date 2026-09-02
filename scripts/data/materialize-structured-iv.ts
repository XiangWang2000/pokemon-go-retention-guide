import { createHash } from "node:crypto";
import { prisma } from "../../src/lib/prisma";
import { getDashboardRows } from "../../src/lib/data-prisma";
import { buildFormOverviews } from "../../src/presentation/form-overview";
import { GLOBAL_IV_RECOMMENDATIONS, IV_RULES_VERSION } from "../../src/iv/strategy";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";

const policyAdoptedAt = new Date("2026-09-02T12:00:00+08:00");
const changeReasonZhTw =
  "PvE與Mega新增可執行的資源分配線：91%以上可投入，96%以上且15攻優先長期／XL投資；低於91%仍保留急用、唯一候選、既有投入與斷點例外，不作自動傳送線。";

async function ensureGlobalIvRecommendations() {
  for (const recommendation of GLOBAL_IV_RECOMMENDATIONS) {
    const data = {
      scopeType: recommendation.scopeType,
      scopeKey: recommendation.scopeKey,
      primaryUseKey: recommendation.primaryUseKey,
      ivStrategyKey: recommendation.ivStrategyKey,
      maxBattleRole: recommendation.maxBattleRole,
      attackIvMin: recommendation.attackIvMin,
      attackIvPriority: recommendation.attackIvPriority,
      defenseIvMin: recommendation.defenseIvMin,
      staminaIvMin: recommendation.staminaIvMin,
      totalIvPercentMin: recommendation.totalIvPercentMin,
      totalIvPercentPriority: recommendation.totalIvPercentPriority,
      pvpRankMax: recommendation.pvpRankMax,
      pvpPrMin: recommendation.pvpPrMin,
      recommendedQuantity: recommendation.recommendedQuantity,
      speciesSpecificOverride: recommendation.speciesSpecificOverride,
      overrideReasonZhTw: recommendation.overrideReasonZhTw,
      ivRecommendationZhTw: recommendation.ivRecommendationZhTw,
      shortIvLabelZhTw: recommendation.shortIvLabelZhTw,
      rulesVersion: recommendation.rulesVersion,
    };
    await prisma.ivRecommendation.upsert({
      where: { id: recommendation.id },
      create: { id: recommendation.id, ...data },
      update: data,
    });
  }
}

async function main() {
  assertDisposableDatabase(getDatabaseUrl());
  // A clean research rebuild starts from schema + importers, so the canonical
  // global IV policy must be materialized before presentation derives the
  // structured per-variant guidance. Otherwise the rebuild silently falls
  // back to generic text and the published snapshot loses the IV rules.
  await ensureGlobalIvRecommendations();

  const forms = buildFormOverviews(await getDashboardRows());
  let updated = 0;
  for (const variant of forms.flatMap((form) => form.variants)) {
    const evaluationId = variant.row.evaluationId;
    if (!evaluationId) continue;
    const previousValue = variant.row.recommendedIvStrategyZhTw;
    const newValue = variant.ivDirection;
    if (previousValue === newValue) continue;
    const transitionKey = [evaluationId, IV_RULES_VERSION, previousValue ?? "", newValue].join(
      "\0",
    );
    const changeId = `change-${evaluationId}-iv-${createHash("sha256").update(transitionKey).digest("hex").slice(0, 16)}`;
    await prisma.$transaction([
      prisma.retentionEvaluation.update({
        where: { id: evaluationId },
        data: { recommendedIvStrategyZhTw: newValue },
      }),
      prisma.changeLog.upsert({
        where: { id: changeId },
        create: {
          id: changeId,
          entityType: "RetentionEvaluation",
          entityId: evaluationId,
          fieldName: "recommendedIvStrategyZhTw",
          previousValue,
          newValue,
          sourceId: null,
          changeReasonZhTw,
          changedAt: policyAdoptedAt,
          rulesVersion: IV_RULES_VERSION,
        },
        // This row records the original policy adoption event. A repeatable
        // rebuild may recreate it, but must never rewrite historical values.
        update: {},
      }),
    ]);
    updated += 1;
  }
  console.log(`結構化 IV 建議寫入完成：更新 ${updated} 筆最新評估。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
