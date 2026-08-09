import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database";
import { loadCrossGenerationEvolutionData } from "../src/data/cross-generation-evolution";
import {
  findSourceTextIntegrityIssues,
  findTextIntegrityIssues,
} from "../src/data/text-integrity";
import {
  validateEvolutionParentPaths,
  validateGen3DexConsistency,
  validateGen3FormCompleteness,
} from "../src/data/checkpoint-validation";
import { DATA_VERSION } from "../src/config/release";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: getDatabaseUrl() }),
});

async function collectTypeScriptFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTypeScriptFiles(file)));
    } else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      files.push(file);
    }
  }
  return files;
}

async function main() {
  const errors: string[] = [];
  const sourceFiles = [
    ...(await collectTypeScriptFiles("src")),
    ...(await collectTypeScriptFiles("scripts")),
  ];
  for (const file of sourceFiles) {
    errors.push(
      ...(findSourceTextIntegrityIssues(await readFile(file, "utf8"), file).map(
        (issue) => `Corrupted source text at ${issue.path}: ${issue.value}`,
      )),
    );
  }
  const [
    species,
    forms,
    variants,
    raw,
    allEvaluations,
    sources,
    categoryEvaluations,
    issues,
    ivRecommendations,
    evolutionPaths,
  ] = await Promise.all([
    prisma.pokemonSpecies.findMany(),
    prisma.pokemonForm.findMany({ include: { species: true } }),
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
    prisma.evolutionPath.findMany({
      select: { id: true, fromFormId: true, toFormId: true },
    }),
  ]);
  // Historical evaluations are retained for auditability. Validate only the
  // newest current-rules evaluation per variant so an old conclusion cannot
  // fail validation after a later recomputation has replaced it.
  const evaluations = [
    ...new Map(
      allEvaluations
        .sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime())
        .map((item) => [item.battleVariantId, item]),
    ).values(),
  ];
  const evolutionData = await loadCrossGenerationEvolutionData();
  const databaseTextIssues = findTextIntegrityIssues(
    { species, forms, variants, raw, evaluations, sources, categoryEvaluations, issues, ivRecommendations },
    "$database",
  );
  errors.push(
    ...databaseTextIssues.map(
      (issue) => `Corrupted database text at ${issue.path}: ${issue.value}`,
    ),
  );
  const formIds = new Set(forms.map((item) => item.id));
  const variantIds = new Set(variants.map((item) => item.id));
  const sourceIds = new Set(sources.map((item) => item.id));
  const familyKeys = new Set(species.map((item) => item.familyKey));
  const speciesIds = new Set(species.map((item) => item.id));
  const formsById = new Map(forms.map((item) => [item.id, item]));
  const variantCountByForm = new Map<string, number>();
  for (const variant of variants) {
    variantCountByForm.set(
      variant.pokemonFormId,
      (variantCountByForm.get(variant.pokemonFormId) ?? 0) + 1,
    );
  }

  for (const item of species) {
    if (item.dexNumber < 1 || item.dexNumber > 9999) errors.push(`${item.id} 的圖鑑編號不合法。`);
  }
  for (const form of forms) {
    if (!form.formNameEn || !form.formNameZhTw) errors.push(`${form.id} 缺少中英文型態名稱。`);
    if (form.evolvesFromFormId && !formIds.has(form.evolvesFromFormId))
      errors.push(`${form.id} 引用不存在的進化前型態。`);
  }
  const evolutionEdges = new Set<string>();
  for (const path of evolutionPaths) {
    if (!formIds.has(path.fromFormId) || !formIds.has(path.toFormId)) {
      errors.push(`${path.id} has a dangling evolution endpoint.`);
    }
    if (path.fromFormId === path.toFormId) {
      errors.push(`${path.id} is a self-referential evolution path.`);
    }
    const edge = `${path.fromFormId}->${path.toFormId}`;
    if (evolutionEdges.has(edge)) errors.push(`Duplicate evolution path: ${edge}.`);
    evolutionEdges.add(edge);
  }
  errors.push(...validateEvolutionParentPaths(forms, evolutionPaths));
  errors.push(...validateGen3DexConsistency(species, forms));
  errors.push(
    ...validateGen3FormCompleteness(
      forms.map((form) => ({
        id: form.id,
        dexNumber: form.species.dexNumber,
        speciesId: form.speciesId,
        formKey: form.formKey,
        formNameEn: form.formNameEn,
        formNameZhTw: form.formNameZhTw,
        regionKey: form.regionKey,
        types: form.types,
      })),
      variants.map((variant) => ({
        id: variant.id,
        pokemonFormId: variant.pokemonFormId,
        variantKey: variant.variantKey,
      })),
    ),
  );
  const manifestTargetIds = new Set(
    evolutionData.targets.map(
      (target) => `${String(target.dexNumber).padStart(3, "0")}-${target.formKey.toLowerCase()}`,
    ),
  );
  for (const target of evolutionData.targets) {
    const targetId = `${String(target.dexNumber).padStart(3, "0")}-${target.formKey.toLowerCase()}`;
    const form = formsById.get(targetId);
    if (!form) {
      errors.push(`Missing cross-generation evolution target: ${targetId}.`);
      continue;
    }
    if (form.evolvesFromFormId !== target.fromFormId) {
      errors.push(`${targetId} has an unexpected evolvesFromFormId.`);
    }
    if (!["KANTO", "JOHTO", "HOENN", "ALOLA", "GALAR", "HISUI", "PALDEA", "OTHER"].includes(target.regionKey)) {
      errors.push(`${targetId} has an invalid region.`);
    }
    if (target.generation >= 4 && target.formKey === "KANTO") {
      errors.push(`${targetId} incorrectly uses KANTO for a future-generation target.`);
    }
    if (form.isEvolutionStub && (variantCountByForm.get(targetId) ?? 0) !== 0) {
      errors.push(`${targetId} is marked as a stub but has battle variants.`);
    }
    if (!evolutionEdges.has(`${target.fromFormId}->${targetId}`)) {
      errors.push(`Missing manifest evolution path: ${target.fromFormId}->${targetId}.`);
    }
  }
  for (const path of evolutionData.paths) {
    if (!formIds.has(path.fromFormId)) {
      errors.push(`Missing manifest evolution source: ${path.fromFormId}.`);
    }
    if (!manifestTargetIds.has(path.toFormId)) {
      errors.push(`Manifest evolution target is not declared: ${path.toFormId}.`);
    }
    if (!evolutionEdges.has(`${path.fromFormId}->${path.toFormId}`)) {
      errors.push(
        `Manifest evolution path is absent from the database: ${path.fromFormId}->${path.toFormId}.`,
      );
    }
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
    if (item.assessmentDisposition === "TRUE_DATA_PENDING" && item.finalDecision !== "HOLD_FOR_NOW")
      errors.push(`${item.id} 的真正待補資料狀態必須使用 HOLD_FOR_NOW。`);
    if (item.assessmentDisposition !== "TRUE_DATA_PENDING" && item.finalDecision === "HOLD_FOR_NOW")
      errors.push(`${item.id} 只有真正待補資料才能使用 HOLD_FOR_NOW。`);
  }
  for (const item of categoryEvaluations) {
    if (item.provenance === "SOURCE_VERIFIED" && item.sourceReferences.length === 0)
      errors.push(`${item.id} 標記為 SOURCE_VERIFIED 但沒有類別來源。`);
    if (item.provenance === "INHERITED") {
      const variant = variants.find((candidate) => candidate.id === item.battleVariantId);
      if (!variant?.inheritsFromVariantId || variant.inheritanceMode === "NONE")
        errors.push(`${item.id} 標記為 INHERITED 但戰鬥版本沒有繼承設定。`);
    }
    if (item.category === "PVE" && !item.pveUseLevel)
      errors.push(`${item.id} 的 PvE 類別缺少四級用途判斷。`);
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
    "research_notes/official-152-181.json",
    "research_notes/battle-152-181.json",
    "research_notes/official-182-211.json",
    "research_notes/battle-182-211.json",
    "research_notes/official-212-241.json",
    "research_notes/battle-212-241.json",
    "research_notes/official-242-251.json",
    "research_notes/battle-242-251.json",
    "research_notes/official-252-281.json",
    "research_notes/battle-252-281.json",
    "research_notes/official-282-311.json",
    "research_notes/battle-282-311.json",
    "research_notes/cross-generation-evolution-targets.json",
  ]) {
    const parsed = JSON.parse((await readFile(file, "utf8")).replace(/^\uFEFF/, ""));
    const textIssues = findTextIntegrityIssues(parsed, file);
    errors.push(
      ...textIssues.map(
        (issue) => `Corrupted source text at ${issue.path}: ${issue.value}`,
      ),
    );
  }
  for (const file of (await readdir("review")).filter((name) => name.endsWith(".json"))) {
    const parsed = JSON.parse((await readFile(join("review", file), "utf8")).replace(/^\uFEFF/, "")) as {
      dataVersion?: string;
    };
    if (parsed.dataVersion !== DATA_VERSION) continue;
    const textIssues = findTextIntegrityIssues(parsed, `review/${file}`);
    errors.push(
      ...textIssues.map(
        (issue) => `Corrupted active review text at ${issue.path}: ${issue.value}`,
      ),
    );
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
