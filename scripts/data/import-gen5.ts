import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile, readFileSync } from "node:fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { getBatchByKey } from "../../src/config/batch-registry";
import { getGen5BatchDefinition } from "../../src/data/batch-gen5";
import { buildGen5ImportPlan, type Gen5ImportPlanRow, type Gen5PlanLeague, type Gen5PvpRankingRow, type Gen5RankingSnapshots } from "../../src/data/gen5-import-plan";
import { assertEvolutionPathEndpoints, upsertEvolutionPath } from "../../src/data/evolution-path";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";
import { RULES_VERSION } from "../../src/rules/rules";

const checkedAt = new Date("2026-09-05T00:00:00+09:00");
const pvpokeCommit = "7b96d91fb553780653190ad32de001b5d9086a7f";
const pvpokeSnapshotRoot = "data/sources/pvpoke/2026-09-01";
const categories = ["PVP", "PVE", "ROCKET", "GYM", "MEGA", "MAX_BATTLE", "EVOLUTION_VALUE"] as const;
const leagueMeta: Record<Gen5PlanLeague, { cp: number; sourceId: string; label: string }> = {
  GREAT: { cp: 1500, sourceId: "pvpoke-gl-20260901", label: "GL（超級聯盟）" },
  ULTRA: { cp: 2500, sourceId: "pvpoke-ul-20260901", label: "UL（高級聯盟）" },
  MASTER: { cp: 10000, sourceId: "pvpoke-ml-20260901", label: "ML（大師聯盟）" },
};

type ResearchSource = {
  id?: string;
  sourceName?: string;
  sourceType?: string;
  sourceTitleOriginal?: string;
  sourceLanguage?: string;
  sourceUrl: string;
  accessedAt?: string;
  publishedAt?: string | null;
  sourceSummaryZhTw?: string;
  summaryZhTw?: string;
  supports?: string[];
};
type ResearchManifest = { checkedAt?: string; sources: ResearchSource[] };

function optionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
function readManifest(path: string): ResearchManifest {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as ResearchManifest;
}
function fallbackSourceId(source: ResearchSource) {
  return `GEN5-PVE-${createHash("sha256").update(source.sourceUrl).digest("hex").slice(0, 16)}`;
}
async function upsertSource(prisma: PrismaClient, source: ResearchSource, fallbackCheckedAt: string, fallbackType = "SECONDARY") {
  const id = source.id ?? fallbackSourceId(source);
  const summary = source.sourceSummaryZhTw ?? source.summaryZhTw;
  if (!summary || !/[\u3400-\u9fff]/u.test(summary)) throw new Error(`Missing Traditional Chinese source summary: ${id}`);
  const accessedAt = optionalDate(source.accessedAt ?? fallbackCheckedAt) ?? checkedAt;
  const data = {
    sourceName: source.sourceName ?? "Pokémon GO Hub",
    sourceUrl: source.sourceUrl,
    sourceType: (source.sourceType ?? fallbackType) as never,
    sourceTitleOriginal: source.sourceTitleOriginal ?? source.sourceName ?? source.sourceUrl,
    sourceLanguage: source.sourceLanguage ?? "en",
    sourceSummaryZhTw: summary,
    accessedAt,
    publishedAt: optionalDate(source.publishedAt),
    dataVersion: `accessed-${source.accessedAt ?? fallbackCheckedAt}`,
    notes: "Imported from dated Gen5 candidate evidence during formal publication.",
  };
  await prisma.sourceReference.upsert({ where: { id }, create: { id, ...data }, update: data });
  return id;
}
async function upsertPvPokeSources(prisma: PrismaClient) {
  for (const league of Object.keys(leagueMeta) as Gen5PlanLeague[]) {
    const { cp, sourceId, label } = leagueMeta[league];
    const bytes = readFileSync(`${pvpokeSnapshotRoot}/rankings-${cp}.json`);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const data = {
      sourceName: "PvPoke fixed ranking snapshot",
      sourceUrl: `https://pvpoke.com/rankings/all/${cp}/overall/`,
      sourceType: "PVP" as const,
      sourceTitleOriginal: `PvPoke ${label} Open League Overall Rankings`,
      sourceLanguage: "en",
      sourceSummaryZhTw: "固定 PvPoke 排名快照，供第五世代正式匯入使用；exact form 與共享 mapping 邊界沿用 candidate evidence。",
      accessedAt: checkedAt,
      publishedAt: null,
      dataVersion: `${pvpokeCommit}; sha256=${sha256}`,
      notes: "Rank is stable array index plus one.",
    };
    await prisma.sourceReference.upsert({ where: { id: sourceId }, create: { id: sourceId, ...data }, update: data });
  }
}
async function readRankings(): Promise<Gen5RankingSnapshots> {
  const result = {} as Record<Gen5PlanLeague, Gen5PvpRankingRow[]>;
  for (const league of Object.keys(leagueMeta) as Gen5PlanLeague[]) {
    const json = await new Promise<string>((resolve, reject) => readFile(`${pvpokeSnapshotRoot}/rankings-${leagueMeta[league].cp}.json`, "utf8", (error, data) => error ? reject(error) : resolve(data)));
    result[league] = JSON.parse(json.replace(/^\uFEFF/, "")) as Gen5PvpRankingRow[];
  }
  return result;
}
function releaseBoolean(status: Gen5ImportPlanRow["releaseStatus"]) {
  return status === "RELEASED" ? true : status === "UNRELEASED" ? false : null;
}
function pvpSummary(row: Gen5ImportPlanRow) {
  if (!row.ranks.length) return "固定 PvPoke Open／Overall 快照未提供可用排名；不由其他 form 或 variant 借值。";
  return row.ranks.map((rank) => `${leagueMeta[rank.league].label} Overall #${rank.rank}${rank.mappingMode === "SHARED_UNDIFFERENTIATED" ? "（共享物種級 mapping，非 exact-form rank）" : ""}${rank.moves.length ? `；招式 ${rank.moves.join("／")}` : ""}`).join("；");
}
function reason(row: Gen5ImportPlanRow) {
  if (row.releaseStatus === "UNRELEASED") return "此 exact BattleVariant 已有明確未推出證據，不構成現有個體的保留理由。";
  if (row.releaseStatus === "UNKNOWN") return "此 exact BattleVariant 的推出狀態尚未由受控證據確認；不把普通版或其他 form 的價值回灌。";
  if (row.initialDecision === "KEEP") return "目前已有明確 PvP、PvE 或 Max Battle 核心用途，支持保留此 exact BattleVariant。";
  if (row.initialDecision === "CONDITIONAL_KEEP") return "目前有可用但非核心的 PvP／PvE／Max 證據，只需選擇性保留。";
  return "目前受控證據沒有確認主要戰鬥用途；一般重複個體可優先列為傳送候選。";
}

async function upsertSpeciesAndForms(prisma: PrismaClient, definition: ReturnType<typeof getGen5BatchDefinition>) {
  for (const species of definition.species) {
    const id = `species-${String(species.dexNumber).padStart(3, "0")}`;
    const data = { dexNumber: species.dexNumber, nameEn: species.nameEn, nameZhTw: species.nameZhTw, generation: 5, familyKey: species.familyKey };
    await prisma.pokemonSpecies.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
  for (const form of definition.forms) {
    const normal = definition.releaseEvidenceForVariant(form.id, "NORMAL");
    const speciesId = `species-${String(form.dexNumber).padStart(3, "0")}`;
    const data = {
      speciesId, formKey: form.formKey, formNameEn: form.formNameEn, formNameZhTw: form.formNameZhTw,
      regionKey: form.regionKey, types: JSON.stringify(form.types), searchAliases: JSON.stringify([...new Set(form.aliases)]),
      evolvesFromFormId: null, evolutionFamilyNotesZhTw: "第五世代 exact-form identity；只 materialize candidate 已核對的正式進化邊。",
      isReleasedInPokemonGo: releaseBoolean(normal.status), releaseStatus: normal.status, releaseVerifiedAt: checkedAt, isEvolutionStub: false,
    };
    await prisma.pokemonForm.upsert({ where: { id: form.id }, create: { id: form.id, ...data }, update: data });
  }
  for (const form of definition.forms) {
    if (form.evolvesFromFormId) await prisma.pokemonForm.update({ where: { id: form.id }, data: { evolvesFromFormId: form.evolvesFromFormId } });
  }
}
async function materializeEvolutionPaths(prisma: PrismaClient, definition: ReturnType<typeof getGen5BatchDefinition>) {
  const formIds = new Set((await prisma.pokemonForm.findMany({ select: { id: true } })).map((form) => form.id));
  assertEvolutionPathEndpoints(formIds, definition.evolutionPairs, `Gen5 ${definition.key}`);
  for (const [fromFormId, toFormId] of definition.evolutionPairs) {
    await upsertEvolutionPath(prisma, {
      id: `evolution-gen5-${definition.key}-${fromFormId}-${toFormId}`,
      fromFormId, toFormId,
      evolutionMethodZhTw: "Pokémon GO 正式進化路徑；型態切換、Fusion 與不可互換 form 不建立進化邊。",
      availabilityNotesZhTw: `第五世代 ${definition.key} identity evidence 已核對此正式進化 endpoint。`,
      requiresEvent: false, verifiedAt: checkedAt,
    });
  }
}
async function writeBattleVariants(prisma: PrismaClient, plan: readonly Gen5ImportPlanRow[]) {
  const ids = plan.map((row) => row.id);
  await prisma.retentionEvaluation.deleteMany({ where: { battleVariantId: { in: ids } } });
  await prisma.categoryEvaluation.deleteMany({ where: { battleVariantId: { in: ids } } });
  await prisma.rawEvaluationData.deleteMany({ where: { battleVariantId: { in: ids } } });
  for (const row of plan) {
    const released = releaseBoolean(row.releaseStatus);
    const purified = row.variantKey === "PURIFIED" && row.releaseStatus === "RELEASED";
    const data = {
      pokemonFormId: row.formId, variantKey: row.variantKey, isReleased: released, releaseStatus: row.releaseStatus, releaseVerifiedAt: checkedAt,
      notesZhTw: row.releaseNotesZhTw,
      inheritsFromVariantId: purified ? `${row.formId}-normal` : null,
      inheritanceMode: purified ? ("NORMAL_BASE" as const) : ("NONE" as const),
      purificationCostModifier: purified ? 0.9 : null, hasReturnAccess: purified,
      purificationRiskZhTw: purified ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。" : "",
      purifiedOverrideRequired: false,
    };
    await prisma.battleVariant.upsert({ where: { id: row.id }, create: { id: row.id, ...data }, update: data });
  }
}

async function writeEvidence(prisma: PrismaClient, definition: ReturnType<typeof getGen5BatchDefinition>, pveSourceByUrl: Map<string, string>, plan: readonly Gen5ImportPlanRow[], knownSources: Set<string>) {
  const raw: Array<Record<string, unknown>> = [];
  for (const row of plan) {
    for (const rank of row.ranks) raw.push({
      id: `raw-gen5-${definition.key}-${row.id}-${rank.league.toLowerCase()}`, battleVariantId: row.id, category: "PVP", status: rank.mappingMode === "EXACT" ? "VERIFIED" : "PARTIALLY_VERIFIED",
      league: rank.league, cup: "OPEN", pvpCategory: "OVERALL", speciesKey: rank.speciesId, formKey: row.formId, variantKey: row.variantKey,
      rank: rank.rank, rating: rank.rating === null ? null : String(rank.rating), recommendedMoves: JSON.stringify(rank.moves),
      rawNotes: pvpSummary(row), seasonOrVersion: `PvPoke commit ${pvpokeCommit}`, extractionMethod: "固定 rankings JSON index + 1；mapping mode 由 Gen5 candidate evidence 鎖定。",
      reproducible: true, sourceId: leagueMeta[rank.league].sourceId, checkedAt,
    });
    if (row.pveEvidence) raw.push({
      id: `raw-gen5-${definition.key}-${row.id}-pve`, battleVariantId: row.id, category: "PVE", status: "PARTIALLY_VERIFIED", league: "NOT_APPLICABLE",
      formKey: row.formId, variantKey: row.variantKey, rating: row.pveEvidence.roles.join("；"), tier: row.pveEvidence.level, recommendedMoves: "[]",
      rawNotes: row.pveEvidence.summaryZhTw, seasonOrVersion: `GO Hub accessed ${row.pveEvidence.checkedAt}`, extractionMethod: "日期化 exact-variant PvE evidence。", reproducible: false,
      sourceId: pveSourceByUrl.get(row.pveEvidence.sourceUrl)!, checkedAt,
    });
    if (row.maxEvidence) raw.push({
      id: `raw-gen5-${definition.key}-${row.id}-max`, battleVariantId: row.id, category: "MAX_BATTLE", status: "PARTIALLY_VERIFIED", league: "NOT_APPLICABLE",
      formKey: row.formId, variantKey: row.variantKey, rating: row.maxEvidence.roles.join("；"), tier: row.maxEvidence.level, recommendedMoves: "[]",
      rawNotes: row.maxEvidence.summaryZhTw, seasonOrVersion: `GO Hub accessed ${row.maxEvidence.checkedAt}`, extractionMethod: "日期化 exact Max Battle evidence。", reproducible: false,
      sourceId: pveSourceByUrl.get(row.maxEvidence.sourceUrl)!, checkedAt,
    });
  }
  if (raw.length) await prisma.rawEvaluationData.createMany({ data: raw as never[] });

  const categoryRows = plan.flatMap((row) => categories.map((category) => {
    const unavailable = row.releaseStatus === "UNKNOWN" ? "UNKNOWN_RELEASE_STATUS" : row.releaseStatus === "UNRELEASED" ? "UNRELEASED" : null;
    let status: string = unavailable ?? "NOT_APPLICABLE";
    let provenance: string = "MANUAL_CURATED";
    let summaryZhTw = "此欄位不適用。";
    let materialToDecision = false;
    let pveUseLevel: string | null = null;
    if (category === "PVP") {
      if (unavailable) { status = unavailable; summaryZhTw = row.releaseNotesZhTw; }
      else if (!["NORMAL", "SHADOW"].includes(row.variantKey)) { status = "NOT_APPLICABLE"; summaryZhTw = "此 BattleVariant 不使用一般 PvPoke ordinary／Shadow 排名。"; }
      else if (row.ranks.length) { status = row.ranks.every((rank) => rank.mappingMode === "EXACT") ? "VERIFIED" : "PARTIALLY_VERIFIED"; provenance = "SOURCE_VERIFIED"; summaryZhTw = pvpSummary(row); materialToDecision = row.ranks.some((rank) => rank.rank <= 250); }
      else { status = "UNRANKED"; summaryZhTw = pvpSummary(row); }
    } else if (category === "PVE") {
      pveUseLevel = row.pveEvidence?.level ?? "NO_SIGNIFICANT_USE";
      if (unavailable) { status = unavailable; summaryZhTw = row.releaseNotesZhTw; }
      else if (["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey)) { status = "NOT_APPLICABLE"; summaryZhTw = "Max Battle 用途在 MAX_BATTLE 類別獨立評估。"; }
      else if (row.pveEvidence) { status = "PARTIALLY_VERIFIED"; provenance = "SOURCE_VERIFIED"; summaryZhTw = row.pveEvidence.summaryZhTw; materialToDecision = true; }
      else { status = "DATA_UNAVAILABLE"; provenance = "DATA_UNAVAILABLE"; summaryZhTw = "目前沒有記錄正向 exact-variant PvE 證據；資料空白不產生虛構 IV 淘汰線。"; }
    } else if (category === "MAX_BATTLE") {
      if (!["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey)) { status = row.releaseStatus === "RELEASED" ? "NOT_APPLICABLE" : unavailable!; summaryZhTw = "普通、暗影、淨化或 Mega 個體不能替代 Max 個體。"; }
      else if (unavailable) { status = unavailable; summaryZhTw = row.releaseNotesZhTw; }
      else if (row.maxEvidence) { status = "PARTIALLY_VERIFIED"; provenance = "SOURCE_VERIFIED"; summaryZhTw = row.maxEvidence.summaryZhTw; materialToDecision = true; }
      else { status = "VERIFIED"; summaryZhTw = "此 Max 版本已推出，但目前沒有形成主要保留理由的正向 Max 投資證據。"; }
    } else if (category === "MEGA") {
      if (row.variantKey !== "MEGA") { status = row.releaseStatus === "RELEASED" ? "NOT_APPLICABLE" : unavailable!; summaryZhTw = "此 exact BattleVariant 不是 Mega。"; }
      else { status = row.releaseStatus === "RELEASED" ? "VERIFIED" : "UNRELEASED"; summaryZhTw = row.releaseNotesZhTw; materialToDecision = row.releaseStatus === "RELEASED"; }
    } else if (category === "EVOLUTION_VALUE") {
      const connected = definition.evolutionPairs.some(([from, to]) => from === row.formId || to === row.formId);
      status = connected ? "VERIFIED" : "NOT_APPLICABLE"; summaryZhTw = connected ? "正式進化圖包含此 exact form；跨 form change／Fusion 不視為進化。" : "目前沒有與此 exact form 相連的正式進化邊。";
    } else {
      status = unavailable ?? "DATA_UNAVAILABLE"; provenance = unavailable ? "MANUAL_CURATED" : "DATA_UNAVAILABLE";
      summaryZhTw = category === "ROCKET" ? "目前沒有逐 exact-form 火箭隊排名；此資料缺口不單獨覆蓋其他結論。" : "未列為主要道館保留用途；次要資料缺失不覆蓋其他結論。";
    }
    return {
      id: `category-${row.id}-${category.toLowerCase()}`, battleVariantId: row.id, category, status: status as never, provenance: provenance as never,
      summaryZhTw, materialToDecision, rocketRating: category === "ROCKET" ? "DATA_UNAVAILABLE" as const : null, rocketRoles: "[]",
      maxTypeRank: null, maxTypeTier: category === "MAX_BATTLE" ? (row.maxEvidence?.roles.join("；") ?? null) : null, maxTypeKey: null,
      maxOverallRating: category === "MAX_BATTLE" && row.maxEvidence ? (row.maxEvidence.level === "CORE_INVESTMENT" ? "HIGH" : "MEDIUM") : null,
      maxInvestmentRating: category === "MAX_BATTLE" && row.maxEvidence ? (row.maxEvidence.level === "CORE_INVESTMENT" ? "HIGH" : "MEDIUM") : null,
      maxUseCaseBreadth: category === "MAX_BATTLE" && row.maxEvidence ? (row.maxEvidence.level === "CORE_INVESTMENT" ? "BROAD" : "MEDIUM") : null,
      pveUseLevel: pveUseLevel as never, assessmentDisposition: null, checkedAt,
    };
  }));
  await prisma.categoryEvaluation.createMany({ data: categoryRows as never[] });

  const evaluations = plan.map((row) => ({
    id: `gen5-${definition.key}-eval-${row.id}`, battleVariantId: row.id, finalDecision: row.initialDecision, provenance: "MANUAL_CURATED" as const,
    pvpSummaryZhTw: pvpSummary(row), pveSummaryZhTw: row.pveEvidence?.summaryZhTw ?? "目前沒有記錄正向 exact-variant PvE 證據。",
    rocketSummaryZhTw: "火箭隊沒有統一逐 exact-form 排名；此欄不單獨覆蓋其他結論。", gymSummaryZhTw: "未列為主要道館保留用途。", gymRating: "NOT_APPLICABLE" as const,
    megaSummaryZhTw: row.variantKey === "MEGA" ? row.releaseNotesZhTw : "Mega 與此 exact BattleVariant 分開評估。",
    maxBattleSummaryZhTw: ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey) ? (row.maxEvidence?.summaryZhTw ?? row.releaseNotesZhTw) : "Max 個體與普通／暗影／淨化／Mega 分開評估。",
    evolutionSummaryZhTw: "只使用正式 evolutionPairs；季節／性別外觀、地區型態、Change Form、Fusion 與不可互換 form 不互借進化價值。",
    requiredMovesSummaryZhTw: row.ranks.some((rank) => rank.rank <= 250) ? `依固定 PvPoke 快照優先核對：${[...new Set(row.ranks.filter((rank) => rank.rank <= 250).flatMap((rank) => rank.moves))].join("／")}` : "限定招式只在 exact PvE evidence 明確提及時構成投入條件。",
    recommendedIvStrategyZhTw: row.variantKey === "SHADOW" ? "暗影標準較寬；15攻優先但不是硬門檻，並結合招式、等級與耐久斷點。" : "依實際用途分開篩選；PvP 看同聯盟 IV Rank，PvE 先看招式、等級／CP與既有投入，15攻不是硬性淘汰線。",
    reasonZhTw: reason(row), confidence: "HIGH" as const, rulesVersion: RULES_VERSION, generatedAt: checkedAt, reviewed: true, reviewedAt: checkedAt, reviewStatus: "RESOLVED" as const,
    missingDataSummaryZhTw: row.releaseStatus === "UNKNOWN" ? "推出狀態仍為 UNKNOWN，但不影響目前不把此 variant 當作現有保留理由。" : "目前沒有會阻止可執行保留／傳送判斷的未解決資料依賴。",
    assessmentDisposition: row.initialDisposition, reviewNotesZhTw: `由 Gen5 ${definition.key} formal publication importer 依 candidate evidence 產生。`,
  }));
  await prisma.retentionEvaluation.createMany({ data: evaluations });
  await prisma.evaluationRuleTrace.createMany({ data: plan.map((row) => ({
    id: `gen5-${definition.key}-trace-${row.id}`, evaluationId: `gen5-${definition.key}-eval-${row.id}`,
    ruleKey: row.releaseStatus === "UNKNOWN" ? "UNKNOWN_RELEASE_VARIANT" : row.releaseStatus === "UNRELEASED" ? "UNRELEASED_VARIANT" : row.initialDecision === "KEEP" ? "MAJOR_BATTLE_VALUE" : row.initialDecision === "CONDITIONAL_KEEP" ? "CONDITIONAL_USE" : "LOW_GENERAL_VALUE",
    ruleVersion: RULES_VERSION, priority: row.releaseStatus === "RELEASED" ? (row.initialDecision === "KEEP" ? 900 : row.initialDecision === "CONDITIONAL_KEEP" ? 700 : 100) : 950,
    matched: true, resultDecision: row.initialDecision, explanationZhTw: "第五世代正式匯入保留 exact form／variant 邊界；UNKNOWN 不會被改寫成 UNRELEASED。",
  })) });

  const categorySources: Array<{ categoryEvaluationId: string; sourceId: string; usageZhTw: string }> = [];
  const evaluationSources: Array<{ evaluationId: string; sourceId: string; usageZhTw: string }> = [];
  const seenCategory = new Set<string>(); const seenEvaluation = new Set<string>();
  const add = (row: Gen5ImportPlanRow, sourceId: string, category: string, usageZhTw: string) => {
    if (!knownSources.has(sourceId)) return;
    const c = `category-${row.id}-${category}`; const e = `gen5-${definition.key}-eval-${row.id}`;
    if (!seenCategory.has(`${c}|${sourceId}`)) { seenCategory.add(`${c}|${sourceId}`); categorySources.push({ categoryEvaluationId: c, sourceId, usageZhTw }); }
    if (!seenEvaluation.has(`${e}|${sourceId}`)) { seenEvaluation.add(`${e}|${sourceId}`); evaluationSources.push({ evaluationId: e, sourceId, usageZhTw }); }
  };
  for (const row of plan) {
    for (const rank of row.ranks) add(row, leagueMeta[rank.league].sourceId, "pvp", "固定 PvPoke Open／Overall ranking snapshot。" );
    if (row.pveEvidence) add(row, pveSourceByUrl.get(row.pveEvidence.sourceUrl)!, "pve", "日期化 exact-variant PvE evidence。" );
    if (row.maxEvidence) add(row, pveSourceByUrl.get(row.maxEvidence.sourceUrl)!, "max_battle", "日期化 exact Max Battle evidence。" );
    for (const sourceId of row.releaseSourceIds) add(row, sourceId, row.variantKey === "MEGA" ? "mega" : ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey) ? "max_battle" : "pvp", "exact BattleVariant release-state evidence。" );
  }
  if (categorySources.length) await prisma.categoryEvaluationSource.createMany({ data: categorySources });
  if (evaluationSources.length) await prisma.evaluationSource.createMany({ data: evaluationSources });
}

export async function runImportGen5(batch: string, databaseUrl = getDatabaseUrl()) {
  const entry = getBatchByKey(batch);
  if (entry.import.adapter !== "gen5") throw new Error(`Batch ${batch} is not owned by the Gen5 adapter.`);
  const definition = getGen5BatchDefinition(batch);
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
  try {
    const identity = readManifest(`research_notes/sources/identity-${batch}.json`);
    const release = readManifest(`research_notes/sources/release-${batch}.json`);
    const pve = readManifest(`research_notes/sources/pve-${batch}.json`);
    const knownSources = new Set<string>();
    for (const source of [...identity.sources, ...release.sources]) knownSources.add(await upsertSource(prisma, source, release.checkedAt ?? "2026-09-05"));
    const pveSourceByUrl = new Map<string, string>();
    for (const source of pve.sources) { const id = await upsertSource(prisma, source, pve.checkedAt ?? "2026-09-05", "PVE"); knownSources.add(id); pveSourceByUrl.set(source.sourceUrl, id); }
    await upsertPvPokeSources(prisma); Object.values(leagueMeta).forEach((meta) => knownSources.add(meta.sourceId));
    await upsertSpeciesAndForms(prisma, definition);
    await materializeEvolutionPaths(prisma, definition);
    const plan = buildGen5ImportPlan(definition, await readRankings());
    await writeBattleVariants(prisma, plan);
    await writeEvidence(prisma, definition, pveSourceByUrl, plan, knownSources);
    const sourceId = identity.sources[0]?.id ?? release.sources[0]?.id;
    if (!sourceId) throw new Error(`Missing identity/release source for ${batch}.`);
    await prisma.changeLog.upsert({
      where: { id: `gen5-${batch}-batch` },
      create: { id: `gen5-${batch}-batch`, entityType: "Batch", entityId: batch, fieldName: "status", previousValue: null, newValue: "PUBLISHED", sourceId, changeReasonZhTw: `將第五世代 ${batch} candidate evidence 接入正式 BattleVariant importer。`, changedAt: checkedAt, rulesVersion: RULES_VERSION },
      update: { newValue: "PUBLISHED", sourceId, changeReasonZhTw: `重建第五世代 ${batch} 正式 BattleVariant 資料。`, changedAt: checkedAt, rulesVersion: RULES_VERSION },
    });
    return { prisma, plan };
  } catch (error) { await prisma.$disconnect(); throw error; }
}
export async function closeGen5Import(result: { prisma: PrismaClient }) { await result.prisma.$disconnect(); }

async function main() {
  assertDisposableDatabase(getDatabaseUrl());
  const batch = process.argv[2];
  if (!batch || process.argv.length > 3) throw new Error("Usage: tsx scripts/data/import-gen5.ts <registered Gen5 batch>.");
  const result = await runImportGen5(batch);
  try { console.log(JSON.stringify({ batch, planRows: result.plan.length, releasedRows: result.plan.filter((row) => row.releaseStatus === "RELEASED").length, unknownRows: result.plan.filter((row) => row.releaseStatus === "UNKNOWN").length }, null, 2)); }
  finally { await closeGen5Import(result); }
}
const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/data/import-gen5.ts")) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
