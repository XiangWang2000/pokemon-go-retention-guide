import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

async function main() {
  const errors: string[] = [];
  const [
    species,
    forms,
    variants,
    raw,
    evaluations,
    sources,
    categoryEvaluations,
    issues,
    ivRecommendations,
  ] = await Promise.all([
    prisma.pokemonSpecies.findMany(),
    prisma.pokemonForm.findMany(),
    prisma.battleVariant.findMany(),
    prisma.rawEvaluationData.findMany(),
    prisma.retentionEvaluation.findMany({
      where: { rulesVersion: RULES_VERSION },
      include: { evaluationSources: true },
    }),
    prisma.sourceReference.findMany(),
    prisma.categoryEvaluation.findMany({ include: { sourceReferences: true } }),
    prisma.dataIssue.findMany({ where: { status: "OPEN" } }),
    prisma.ivRecommendation.findMany(),
  ]);
  const formIds = new Set(forms.map((item) => item.id));
  const variantIds = new Set(variants.map((item) => item.id));
  const sourceIds = new Set(sources.map((item) => item.id));
  const familyKeys = new Set(species.map((item) => item.familyKey));
  const speciesIds = new Set(species.map((item) => item.id));

  for (const item of species) {
    if (item.dexNumber < 1 || item.dexNumber > 9999) errors.push(`${item.id} 的圖鑑編號不合法。`);
  }
  for (const form of forms) {
    if (!form.formNameEn || !form.formNameZhTw) errors.push(`${form.id} 缺少中英文型態名稱。`);
    if (form.evolvesFromFormId && !formIds.has(form.evolvesFromFormId))
      errors.push(`${form.id} 引用不存在的進化前型態。`);
  }
  for (const item of variants) {
    if (!formIds.has(item.pokemonFormId)) errors.push(`${item.id} 引用不存在的型態。`);
    if (item.releaseStatus === "RELEASED" && item.isReleased !== true)
      errors.push(`${item.id} 的 RELEASED 與舊相容欄位不一致。`);
    if (item.releaseStatus === "UNRELEASED" && item.isReleased !== false)
      errors.push(`${item.id} 的 UNRELEASED 不可保留為 null。`);
    if (
      item.variantKey === "PURIFIED" &&
      item.releaseStatus === "RELEASED" &&
      (!item.inheritsFromVariantId || item.inheritanceMode === "NONE")
    )
      errors.push(`${item.id} 已推出的 Purified 版本缺少 Normal 繼承設定。`);
  }
  for (const item of raw) {
    if (!variantIds.has(item.battleVariantId)) errors.push(`${item.id} 引用不存在的戰鬥版本。`);
    if (!sourceIds.has(item.sourceId)) errors.push(`${item.id} 引用不存在的來源。`);
    if (!item.checkedAt) errors.push(`${item.id} 缺少 checkedAt。`);
    if (item.rank !== null && item.rank < 1) errors.push(`${item.id} 的 rank 必須是正整數。`);
    if (item.category === "PVP" && item.rank !== null) {
      if (
        !item.cup ||
        !item.pvpCategory ||
        !item.speciesKey ||
        !item.formKey ||
        !item.variantKey ||
        !item.extractionMethod ||
        !item.reproducible
      )
        errors.push(`${item.id} 的 PvP 精確 rank 缺少完整可重現 metadata。`);
    }
    if (item.category !== "PVP" && item.rank !== null)
      errors.push(`${item.id} 的情境／屬性名次不可寫入全域 rank 欄位。`);
  }
  const categoryCounts = new Map<string, number>();
  for (const item of categoryEvaluations)
    categoryCounts.set(item.battleVariantId, (categoryCounts.get(item.battleVariantId) ?? 0) + 1);
  for (const item of variants) {
    if (categoryCounts.get(item.id) !== 7) errors.push(`${item.id} 未完整建立七個類別資料狀態。`);
  }
  for (const item of evaluations) {
    if (item.provenance === "SOURCE_VERIFIED" && item.evaluationSources.length === 0)
      errors.push(`${item.id} 標記為 SOURCE_VERIFIED 但沒有結論來源。`);
    if (item.provenance === "MANUAL_CURATED" && !item.reasonZhTw.trim())
      errors.push(`${item.id} 標記為 MANUAL_CURATED 但缺少人工判斷理由。`);
  }
  for (const item of categoryEvaluations) {
    if (item.provenance === "SOURCE_VERIFIED" && item.sourceReferences.length === 0)
      errors.push(`${item.id} 標記為 SOURCE_VERIFIED 但沒有類別來源。`);
    if (item.provenance === "INHERITED") {
      const variant = variants.find((candidate) => candidate.id === item.battleVariantId);
      if (!variant?.inheritsFromVariantId || variant.inheritanceMode === "NONE")
        errors.push(`${item.id} 標記為 INHERITED 但戰鬥版本沒有繼承設定。`);
    }
  }
  if (
    issues.some(
      (item) =>
        item.battleVariantId === "012-kanto-gigantamax" && item.issueType === "SOURCE_CONFLICT",
    )
  )
    errors.push("GMax 巴大蝶仍被錯誤標記為同維度 SOURCE_CONFLICT。");

  for (const item of ivRecommendations) {
    const scopeExists =
      (item.scopeType === "GLOBAL" && item.scopeKey === "GLOBAL") ||
      (item.scopeType === "FAMILY" && familyKeys.has(item.scopeKey)) ||
      (item.scopeType === "MEMBER" && speciesIds.has(item.scopeKey)) ||
      (item.scopeType === "POKEMON_FORM" && formIds.has(item.scopeKey)) ||
      (item.scopeType === "BATTLE_VARIANT" && variantIds.has(item.scopeKey));
    if (!scopeExists) errors.push(`${item.id} 的 IV 建議引用不存在的 ${item.scopeType} 範圍。`);

    for (const [field, value] of [
      ["attackIvMin", item.attackIvMin],
      ["attackIvPriority", item.attackIvPriority],
      ["attackIvConditionalMin", item.attackIvConditionalMin],
      ["defenseIvMin", item.defenseIvMin],
      ["staminaIvMin", item.staminaIvMin],
    ] as const) {
      if (value !== null && (value < 0 || value > 15))
        errors.push(`${item.id} 的 ${field} 必須介於 0～15。`);
    }
    for (const [field, value] of [
      ["totalIvPercentMin", item.totalIvPercentMin],
      ["totalIvPercentPriority", item.totalIvPercentPriority],
      ["pvpPrMin", item.pvpPrMin],
    ] as const) {
      if (value !== null && (value < 0 || value > 100))
        errors.push(`${item.id} 的 ${field} 必須介於 0～100。`);
    }
    if (item.speciesSpecificOverride && !item.overrideReasonZhTw?.trim())
      errors.push(`${item.id} 是物種覆寫，但缺少 overrideReasonZhTw。`);
  }

  const uniqueSources = new Set<string>();
  for (const source of sources) {
    const key = `${source.sourceUrl}|${source.accessedAt.toISOString()}`;
    if (uniqueSources.has(key)) errors.push(`${source.id} 的來源網址與查閱時間重複。`);
    uniqueSources.add(key);
  }
  for (const file of [
    "research_notes/official-001-030.json",
    "research_notes/battle-001-015.json",
    "research_notes/battle-016-030.json",
    "research_notes/official-031-060.json",
    "research_notes/battle-031-060.json",
    "research_notes/official-061-090.json",
    "research_notes/battle-061-090.json",
    "research_notes/official-091-120.json",
    "research_notes/battle-091-120.json",
    "research_notes/official-121-151.json",
    "research_notes/battle-121-151.json",
  ]) {
    JSON.parse((await readFile(file, "utf8")).replace(/^\uFEFF/, ""));
  }
  if (errors.length) throw new Error(`資料驗證失敗：\n- ${errors.join("\n- ")}`);
  console.log(
    `資料驗證通過：${species.length} 個物種、${forms.length} 個型態、${variants.length} 個戰鬥版本、${raw.length} 筆原始資料、${categoryEvaluations.length} 筆類別狀態、${sources.length} 個來源。`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
