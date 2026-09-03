import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile, readFileSync } from "node:fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { getBatchByKey, type BatchRegistryEntry } from "../../src/config/batch-registry";
import { getGen4BatchDefinition } from "../../src/data/batch-gen4";
import {
  buildGen4ImportPlan,
  type Gen4ImportPlanRow,
  type Gen4PlanLeague,
  type Gen4PvpRankingRow,
  type Gen4RankingSnapshots,
} from "../../src/data/gen4-import-plan";
import { assertEvolutionPathEndpoints, upsertEvolutionPath } from "../../src/data/evolution-path";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";
import { RULES_VERSION } from "../../src/rules/rules";

const checkedAt = new Date("2026-09-03T00:00:00+08:00");
const pvpokeCommit = "7b96d91fb553780653190ad32de001b5d9086a7f";
const pvpokeSnapshotRoot = "data/sources/pvpoke/2026-09-01";
const categories = [
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX_BATTLE",
  "EVOLUTION_VALUE",
] as const;
const leagueMeta: Record<Gen4PlanLeague, { cp: number; sourceId: string; label: string }> = {
  GREAT: { cp: 1500, sourceId: "pvpoke-gl-20260901", label: "Great League" },
  ULTRA: { cp: 2500, sourceId: "pvpoke-ul-20260901", label: "Ultra League" },
  MASTER: { cp: 10000, sourceId: "pvpoke-ml-20260901", label: "Master League" },
};
const legacyLeagueLabels: Record<Gen4PlanLeague, string> = {
  GREAT: "GL（超級聯盟）",
  ULTRA: "UL（高級聯盟）",
  MASTER: "ML（大師聯盟）",
};

type ResearchSource = {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceTitleOriginal?: string;
  sourceLanguage?: string;
  sourceUrl: string;
  accessedAt?: string;
  publishedAt?: string | null;
  sourceSummaryZhTw?: string;
  summaryZhTw?: string;
  supports?: string[];
};

type ResearchManifest = {
  checkedAt?: string;
  sources: ResearchSource[];
};

function optionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readManifest(path: string): ResearchManifest {
  const manifest = JSON.parse(
    readFileSync(path, "utf8").replace(/^\uFEFF/, ""),
  ) as ResearchManifest;
  for (const source of manifest.sources) {
    const summary = source.sourceSummaryZhTw ?? source.summaryZhTw;
    if (!summary)
      throw new Error(`Missing Traditional Chinese source summary: ${source.id} in ${path}`);
    if (!/[\u3400-\u9fff]/u.test(summary)) {
      throw new Error(`Source summary is not Traditional Chinese: ${source.id} in ${path}`);
    }
  }
  return manifest;
}

async function readRankings(): Promise<Gen4RankingSnapshots> {
  const result = {} as Record<Gen4PlanLeague, Gen4PvpRankingRow[]>;
  for (const league of Object.keys(leagueMeta) as Gen4PlanLeague[]) {
    const { cp } = leagueMeta[league];
    const json = await new Promise<string>((resolve, reject) =>
      readFile(`${pvpokeSnapshotRoot}/rankings-${cp}.json`, "utf8", (error, data) =>
        error ? reject(error) : resolve(data),
      ),
    );
    result[league] = JSON.parse(json.replace(/^\uFEFF/, "")) as Gen4PvpRankingRow[];
  }
  return result;
}

async function upsertSource(
  prisma: PrismaClient,
  source: ResearchSource,
  fallbackCheckedAt: string,
) {
  const accessedAt = optionalDate(source.accessedAt ?? fallbackCheckedAt) ?? checkedAt;
  const summary = source.sourceSummaryZhTw ?? source.summaryZhTw;
  if (!summary) throw new Error(`Missing Traditional Chinese source summary: ${source.id}`);
  const data = {
    sourceName: source.sourceName,
    sourceUrl: source.sourceUrl,
    sourceType: source.sourceType as never,
    sourceTitleOriginal: source.sourceTitleOriginal ?? source.sourceName,
    sourceLanguage: source.sourceLanguage ?? "en",
    sourceSummaryZhTw: summary,
    accessedAt,
    publishedAt: optionalDate(source.publishedAt),
    dataVersion: `accessed-${source.accessedAt ?? fallbackCheckedAt}`,
    notes: "Imported from a dated Gen4 research manifest.",
  };
  await prisma.sourceReference.upsert({
    where: { id: source.id },
    create: { id: source.id, ...data },
    update: data,
  });
}

async function upsertPvPokeSources(prisma: PrismaClient) {
  for (const league of Object.keys(leagueMeta) as Gen4PlanLeague[]) {
    const { cp, sourceId, label } = leagueMeta[league];
    const bytes = readFileSync(`${pvpokeSnapshotRoot}/rankings-${cp}.json`);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const data = {
      sourceName: "PvPoke fixed ranking snapshot",
      sourceUrl: `https://pvpoke.com/rankings/all/${cp}/overall/`,
      sourceType: "PVP" as const,
      sourceTitleOriginal: `PvPoke ${label} Open League Overall Rankings`,
      sourceLanguage: "en",
      sourceSummaryZhTw: "固定 PvPoke 排名快照，供決定性第四世代匯入使用。",
      accessedAt: checkedAt,
      publishedAt: null,
      dataVersion: `${pvpokeCommit}; sha256=${sha256}`,
      notes: "Rank is the stable array index plus one.",
    };
    await prisma.sourceReference.upsert({
      where: { id: sourceId },
      create: { id: sourceId, ...data },
      update: {
        dataVersion: data.dataVersion,
        accessedAt: data.accessedAt,
        notes: data.notes,
      },
    });
  }
}

type Gen4Definition = ReturnType<typeof getGen4BatchDefinition>;
type Gen4BatchRange = Pick<BatchRegistryEntry, "minDex" | "maxDex">;

function usesLegacyEvidenceAdapter(definition: Gen4Definition) {
  return definition.evidenceAdapter === "legacy-387-416";
}

function pvpSummary(row: Gen4ImportPlanRow, definition: Gen4Definition) {
  if (!row.ranks.length) {
    return usesLegacyEvidenceAdapter(definition)
      ? "固定 PvPoke Open／Overall 快照未列入可重現名次。"
      : "固定 PvPoke Open／Overall 快照未列入可重現名次。";
  }
  return row.ranks
    .map((rank) => {
      const label = usesLegacyEvidenceAdapter(definition)
        ? legacyLeagueLabels[rank.league]
        : legacyLeagueLabels[rank.league];
      return usesLegacyEvidenceAdapter(definition)
        ? `${label} Overall #${rank.rank}${rank.moves.length ? `；招式 ${rank.moves.join("／")}` : ""}`
        : `${label} Overall #${rank.rank}${rank.moves.length ? `；招式 ${rank.moves.join("／")}` : ""}`;
    })
    .join("；");
}

function decisionReason(row: Gen4ImportPlanRow, definition: Gen4Definition) {
  if (!usesLegacyEvidenceAdapter(definition)) {
    if (!row.released) return "此戰鬥版本目前尚未在 Pokémon GO 推出。";
    if (row.initialDecision === "KEEP")
      return "固定證據確認 PvP、PvE、Mega 或 Max 用途，支持保留此版本。";
    if (row.initialDecision === "CONDITIONAL_KEEP") return "有限的 PvP 或 PvE 證據支持有條件保留。";
    return "固定證據目前沒有確認的主要戰鬥用途。";
  }
  if (!row.released) return "此戰鬥版本尚未推出，不把現有個體誤當成此版本候選。";
  if (row.initialDecision === "KEEP") {
    return "目前已有明確 PvP、PvE 或 Max Battle 核心用途；保留符合版本與用途的候選。";
  }
  if (row.initialDecision === "CONDITIONAL_KEEP") {
    return "用途有限或需特定招式／版本；只留少量符合條件的個體。";
  }
  return "目前缺乏主要 PvP、PvE、道館、Mega、Max 或後續進化理由，一般重複個體大多可傳。";
}

function ruleTrace(row: Gen4ImportPlanRow) {
  if (!row.released) return { ruleKey: "UNRELEASED_VARIANT", priority: 950 };
  if (row.initialDecision === "KEEP") return { ruleKey: "MAJOR_BATTLE_VALUE", priority: 900 };
  if (row.initialDecision === "CONDITIONAL_KEEP")
    return { ruleKey: "CONDITIONAL_USE", priority: 700 };
  return { ruleKey: "LOW_GENERAL_VALUE", priority: 100 };
}

function variantNotes(row: Gen4ImportPlanRow, definition: Gen4Definition) {
  if (usesLegacyEvidenceAdapter(definition)) {
    if (row.variantKey === "SHADOW")
      return "暗影個體獨立評估；暗影標準較寬，不因低總 IV 自動淨化。";
    if (row.variantKey === "PURIFIED")
      return "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。";
    if (row.variantKey === "DYNAMAX" || row.variantKey === "GIGANTAMAX") {
      return row.released
        ? "此 Dynamax 版本已推出；普通個體不能替代 Max 個體。"
        : "此 Dynamax 版本尚未推出；普通個體不能替代 Max 個體。";
    }
    return "普通版本；與暗影、淨化及 Max 分開評估。";
  }
  if (row.variantKey === "SHADOW") return "暗影個體獨立評估；普通版本仍保留為獨立基礎身份。";
  if (row.variantKey === "PURIFIED") return "淨化版本沿用普通基底資訊；除非另有明確覆寫。";
  if (row.variantKey === "MEGA") return "Mega 版本與普通、暗影及淨化分開評估。";
  if (row.variantKey === "DYNAMAX" || row.variantKey === "GIGANTAMAX") {
    return row.released
      ? "此 Max 版本已推出；與普通、暗影及其他戰鬥版本分開評估。"
      : "此 Max 版本尚未推出；發布狀態仍按資料標示。";
  }
  return "第四世代普通版本；與暗影、淨化及特殊版本分開評估。";
}

function evaluationPresentation(row: Gen4ImportPlanRow, definition: Gen4Definition) {
  if (usesLegacyEvidenceAdapter(definition)) {
    return {
      pvpSummaryZhTw: pvpSummary(row, definition),
      pveSummaryZhTw:
        row.pveEvidence?.summaryZhTw ??
        "目前沒有記錄正向 PvE 證據；不因 100% IV 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一逐物種排名；缺少此欄不單獨覆蓋其他結論。",
      gymSummaryZhTw: "未列為主要道館保留用途；缺少次要欄位來源不覆蓋其他結論。",
      megaSummaryZhTw: "本批目前沒有已推出的 Mega／Primal 戰鬥版本。",
      maxBattleSummaryZhTw:
        row.variantKey === "DYNAMAX"
          ? row.released
            ? "此 Dynamax 版本已推出；與普通／暗影版本分開保留。"
            : "此 Dynamax 版本尚未推出。"
          : "普通、暗影或淨化個體不能替代 Dynamax 個體。",
      evolutionSummaryZhTw: "第四世代 #387～#416 進化圖已結構化；前階是否保留由後續目標用途決定。",
      requiredMovesSummaryZhTw: row.ranks.some((rank) => rank.rank <= 250)
        ? `依固定快照優先核對：${[...new Set(row.ranks.filter((rank) => rank.rank <= 250).flatMap((rank) => rank.moves))].join("／")}`
        : "沒有招式足以把低用途版本自動升格為必留；活動招式只作投入前條件。",
      recommendedIvStrategyZhTw:
        row.variantKey === "SHADOW"
          ? "暗影標準較寬；15攻優先，不設硬性最低 IV。"
          : row.initialDecision === "TRANSFER_CANDIDATE"
            ? "目前沒有主要用途時，不因 100% 自動產生保留理由。"
            : "依實際用途分開篩選；PvP 看同聯盟 IV Rank，PvE 先看招式、等級／CP與既有投入；15攻優先，14攻高整體 IV 亦可留。",
      reasonZhTw: decisionReason(row, definition),
      missingDataSummaryZhTw: !row.released
        ? "此版本尚未推出，不把它當成現有個體的待補資料。"
        : row.initialDecision === "TRANSFER_CANDIDATE"
          ? "已有足夠資料判定目前無顯著主要用途；一般重複個體通常可傳送。"
          : "已有明確用途；次要欄位缺資料不覆蓋目前保留結論。",
      reviewNotesZhTw:
        "已核對神奧型態、跨世代進化、普通／暗影／淨化／Dynamax 邊界、固定 PvPoke 快照與 variant-level PvE evidence。",
    };
  }
  return {
    pvpSummaryZhTw: pvpSummary(row, definition),
    pveSummaryZhTw:
      row.pveEvidence?.summaryZhTw ??
      "目前沒有記錄正向版本級 PvE 證據；不因 100% IV 自動升格為實戰必留。",
    rocketSummaryZhTw: "本批沒有逐物種火箭隊證據；資料缺口不單獨覆蓋其他結論。",
    gymSummaryZhTw: "本批沒有逐物種道館證據；資料缺口不單獨覆蓋其他結論。",
    megaSummaryZhTw:
      row.variantKey === "MEGA"
        ? "Mega 版本發布狀態與用途獨立核對。"
        : "此版本沒有獨立 Mega 型態。",
    maxBattleSummaryZhTw:
      row.variantKey === "DYNAMAX" || row.variantKey === "GIGANTAMAX"
        ? "Max 版本發布狀態與用途獨立核對。"
        : "此版本沒有獨立 Max 型態。",
    evolutionSummaryZhTw: "擁有該型態的第四世代批次提供正式進化身份與路徑。",
    requiredMovesSummaryZhTw: row.ranks.some((rank) => rank.rank <= 250)
      ? "請先核對固定 PvPoke 招式證據，再決定是否投入。"
      : "目前沒有記錄需要特別保留的招式結論。",
    recommendedIvStrategyZhTw:
      row.variantKey === "SHADOW"
        ? "依暗影 IV 規則並結合目前用途評估，再決定是否強化。"
        : "依目前版本的 IV 規則評估。",
    reasonZhTw: decisionReason(row, definition),
    missingDataSummaryZhTw: row.released
      ? "目前沒有未解決的資料依賴。"
      : "此版本目前尚未推出，發布狀態仍按資料標示。",
    reviewNotesZhTw: `由固定研究 manifest 的第四世代 ${definition.batch} 通用匯入器 產生。`,
  };
}

async function removeSupersededStubs(
  prisma: PrismaClient,
  definition: ReturnType<typeof getGen4BatchDefinition>,
  range: Gen4BatchRange,
) {
  const canonicalIds = new Set(definition.forms.map((form) => form.id));
  const stubs = await prisma.pokemonForm.findMany({
    where: {
      isEvolutionStub: true,
      species: { dexNumber: { gte: range.minDex, lte: range.maxDex } },
    },
    select: {
      id: true,
      _count: {
        select: {
          battleVariants: true,
          dataIssues: true,
          evolvesInto: true,
        },
      },
    },
  });
  const superseded = stubs.filter((stub) => !canonicalIds.has(stub.id));
  const protectedStubs = superseded.filter(
    (stub) =>
      stub._count.battleVariants > 0 || stub._count.dataIssues > 0 || stub._count.evolvesInto > 0,
  );
  if (protectedStubs.length) {
    throw new Error(
      `Cannot replace superseded evolution stubs with child data: ${protectedStubs
        .map((stub) => stub.id)
        .join(", ")}. Run an explicit migration before importing the owning batch.`,
    );
  }
  const supersededIds = superseded.map((stub) => stub.id);
  if (!supersededIds.length) return;
  await prisma.evolutionPath.deleteMany({
    where: { OR: [{ fromFormId: { in: supersededIds } }, { toFormId: { in: supersededIds } }] },
  });
  await prisma.pokemonForm.deleteMany({ where: { id: { in: supersededIds } } });
}

async function upsertSpeciesAndForms(
  prisma: PrismaClient,
  definition: ReturnType<typeof getGen4BatchDefinition>,
  range: Gen4BatchRange,
) {
  await removeSupersededStubs(prisma, definition, range);
  for (const species of definition.species) {
    const id = `species-${String(species.dexNumber).padStart(3, "0")}`;
    await prisma.pokemonSpecies.upsert({
      where: { id },
      create: {
        id,
        dexNumber: species.dexNumber,
        nameEn: species.nameEn,
        nameZhTw: species.nameZhTw,
        generation: 4,
        familyKey: species.familyKey,
      },
      update: {
        nameEn: species.nameEn,
        nameZhTw: species.nameZhTw,
        generation: 4,
        familyKey: species.familyKey,
      },
    });
  }
  for (const form of definition.forms) {
    const released = definition.releasedNormalForms.has(form.id);
    const speciesId = `species-${String(form.dexNumber).padStart(3, "0")}`;
    const existing = await prisma.pokemonForm.findUnique({
      where: { id: form.id },
      select: {
        evolutionTargetUseLevel: true,
        evolutionTargetNotesZhTw: true,
      },
    });
    // A cross-generation manifest may have created this identity as a future
    // stub before its owning batch arrived. Preserve that generic target
    // metadata while replacing the stub with the canonical real form.
    const inheritedTargetMetadata = {
      evolutionTargetUseLevel: existing?.evolutionTargetUseLevel ?? null,
      evolutionTargetNotesZhTw: existing?.evolutionTargetNotesZhTw ?? null,
    };
    await prisma.pokemonForm.upsert({
      where: { id: form.id },
      create: {
        id: form.id,
        speciesId,
        formKey: form.formKey,
        formNameEn: form.formNameEn,
        formNameZhTw: form.formNameZhTw,
        regionKey: form.regionKey,
        types: JSON.stringify(form.types),
        searchAliases: JSON.stringify([...new Set(form.aliases)]),
        evolvesFromFormId: null,
        evolutionFamilyNotesZhTw: form.evolutionFamilyNotesZhTw,
        isReleasedInPokemonGo: released,
        releaseStatus: released ? "RELEASED" : "UNRELEASED",
        releaseVerifiedAt: checkedAt,
        isEvolutionStub: false,
        ...inheritedTargetMetadata,
      },
      update: {
        speciesId,
        formKey: form.formKey,
        formNameEn: form.formNameEn,
        formNameZhTw: form.formNameZhTw,
        regionKey: form.regionKey,
        types: JSON.stringify(form.types),
        searchAliases: JSON.stringify([...new Set(form.aliases)]),
        evolutionFamilyNotesZhTw: form.evolutionFamilyNotesZhTw,
        isReleasedInPokemonGo: released,
        releaseStatus: released ? "RELEASED" : "UNRELEASED",
        releaseVerifiedAt: checkedAt,
        isEvolutionStub: false,
        ...inheritedTargetMetadata,
      },
    });
  }
  for (const form of definition.forms) {
    if (!form.evolvesFromFormId) continue;
    await prisma.pokemonForm.update({
      where: { id: form.id },
      data: { evolvesFromFormId: form.evolvesFromFormId },
    });
  }
}

async function materializeEvolutionPaths(
  prisma: PrismaClient,
  definition: Gen4Definition,
  releaseResearch: ResearchManifest,
) {
  const formIds = new Set(
    (await prisma.pokemonForm.findMany({ select: { id: true } })).map((form) => form.id),
  );
  assertEvolutionPathEndpoints(formIds, definition.evolutionPairs, `Gen4 ${definition.batch}`);
  for (const [fromFormId, toFormId] of definition.evolutionPairs) {
    await upsertEvolutionPath(prisma, {
      id: `evolution-gen4-${definition.batch}-${fromFormId}-${toFormId}`,
      fromFormId,
      toFormId,
      evolutionMethodZhTw: usesLegacyEvidenceAdapter(definition)
        ? "依 Pokémon GO 當期糖果、性別與特殊條件進化。"
        : "Pokémon GO 正式進化路徑；擁有批次提供型態身份。",
      availabilityNotesZhTw: usesLegacyEvidenceAdapter(definition)
        ? "第四世代進化圖已獨立核對；特殊分支依遊戲內介面為準。"
        : releaseResearch.sources.some(
              (source) =>
                source.id.startsWith("EVOLUTION-") &&
                source.supports?.includes(fromFormId) &&
                source.supports?.includes(toFormId),
            )
          ? `已由第四世代 ${definition.batch} 研究 manifest 的進化來源核對。`
          : `由第四世代 ${definition.batch} 研究 manifest 建立；型態身份由擁有批次提供。`,
      requiresEvent: false,
      verifiedAt: checkedAt,
    });
    // The importer that owns an evolution target also owns the parent's
    // canonical parent pointer. This is generic for all future-form stubs.
    if (definition.forms.some((form) => form.id === fromFormId)) {
      const target = await prisma.pokemonForm.findUnique({ where: { id: toFormId } });
      if (target?.isEvolutionStub) {
        await prisma.pokemonForm.update({
          where: { id: toFormId },
          data: { evolvesFromFormId: fromFormId },
        });
      }
    }
  }
  // A branch whose target is an existing form (for example Roselia -> Budew)
  // must still update that external form's parent pointer generically.
  for (const [fromFormId, toFormId] of definition.evolutionPairs) {
    if (!definition.forms.some((form) => form.id === fromFormId)) continue;
    if (definition.forms.some((form) => form.id === toFormId)) continue;
    if (!formIds.has(toFormId)) continue;
    await prisma.pokemonForm.update({
      where: { id: toFormId },
      data: { evolvesFromFormId: fromFormId },
    });
  }
}

async function writeBattleVariants(
  prisma: PrismaClient,
  definition: Gen4Definition,
  plan: readonly Gen4ImportPlanRow[],
) {
  const variantIds = plan.map((row) => row.id);
  await prisma.retentionEvaluation.deleteMany({ where: { battleVariantId: { in: variantIds } } });
  await prisma.categoryEvaluation.deleteMany({ where: { battleVariantId: { in: variantIds } } });
  await prisma.rawEvaluationData.deleteMany({ where: { battleVariantId: { in: variantIds } } });
  for (const row of plan) {
    const common = {
      pokemonFormId: row.formId,
      variantKey: row.variantKey,
      isReleased: row.released,
      releaseStatus: row.releaseStatus,
      releaseVerifiedAt: checkedAt,
      notesZhTw: variantNotes(row, definition),
      inheritsFromVariantId:
        row.variantKey === "PURIFIED" && row.released ? `${row.formId}-normal` : null,
      inheritanceMode:
        row.variantKey === "PURIFIED" && row.released
          ? ("NORMAL_BASE" as const)
          : ("NONE" as const),
      purificationCostModifier: row.variantKey === "PURIFIED" && row.released ? 0.9 : null,
      hasReturnAccess: row.variantKey === "PURIFIED" && row.released,
      purificationRiskZhTw:
        row.variantKey === "PURIFIED" && row.released
          ? usesLegacyEvidenceAdapter(definition)
            ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。"
            : "淨化版本沿用普通基底版本；淨化不可逆，需先確認暗影用途。"
          : "",
      purifiedOverrideRequired: false,
    };
    await prisma.battleVariant.upsert({
      where: { id: row.id },
      create: { id: row.id, ...common },
      update: common,
    });
  }
}

async function writeEvidence(
  prisma: PrismaClient,
  definition: Gen4Definition,
  releaseResearch: ResearchManifest,
  pveResearch: ResearchManifest,
  plan: readonly Gen4ImportPlanRow[],
) {
  const pveSourceByUrl = new Map(
    pveResearch.sources.map((source) => [source.sourceUrl, source.id]),
  );
  const megaSourceId = releaseResearch.sources.find((source) => source.id.startsWith("MEGA-"))?.id;
  const maxSourceId = releaseResearch.sources.find((source) => source.id.startsWith("MAX-"))?.id;
  const legacy = usesLegacyEvidenceAdapter(definition);
  const rawRows = plan.flatMap((row) => {
    const pvpRows = row.ranks.map((rank) => ({
      id: `raw-gen4-${definition.batch}-${row.id}-${rank.league.toLowerCase()}`,
      battleVariantId: row.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: rank.speciesId,
      formKey: row.formId,
      variantKey: row.variantKey,
      rank: rank.rank,
      rating: rank.rating === null ? null : String(rank.rating),
      recommendedMoves: JSON.stringify(rank.moves),
      rawNotes: usesLegacyEvidenceAdapter(definition)
        ? `${legacyLeagueLabels[rank.league]} Open／Overall；固定 JSON 陣列 index + 1 可重現。`
        : `${legacyLeagueLabels[rank.league]} Open／Overall；固定 JSON 陣列 index + 1 可重現。`,
      seasonOrVersion: `PvPoke commit ${pvpokeCommit}`,
      extractionMethod: usesLegacyEvidenceAdapter(definition)
        ? "固定 commit 的完整 rankings JSON 陣列索引（index + 1）"
        : "固定 rankings JSON 陣列索引加一。",
      reproducible: true,
      sourceId: leagueMeta[rank.league].sourceId,
      checkedAt,
    }));
    if (!row.pveEvidence) return pvpRows;
    const sourceId = pveSourceByUrl.get(row.pveEvidence.sourceUrl);
    if (!sourceId)
      throw new Error(`Missing PvE source for ${row.id}: ${row.pveEvidence.sourceUrl}`);
    return [
      ...pvpRows,
      {
        id: `raw-gen4-${definition.batch}-${row.id}-pve`,
        battleVariantId: row.id,
        category: "PVE" as const,
        status: "PARTIALLY_VERIFIED" as const,
        league: "NOT_APPLICABLE" as const,
        cup: null,
        pvpCategory: null,
        speciesKey: null,
        formKey: row.formId,
        variantKey: row.variantKey,
        rank: null,
        rating: row.pveEvidence.roles.join(usesLegacyEvidenceAdapter(definition) ? "；" : ", "),
        recommendedMoves: JSON.stringify([]),
        tier: row.pveEvidence.level,
        rawNotes: row.pveEvidence.summaryZhTw,
        seasonOrVersion: usesLegacyEvidenceAdapter(definition)
          ? "GO Hub accessed 2026-08-13"
          : `GO Hub accessed ${row.pveEvidence.checkedAt}`,
        extractionMethod: usesLegacyEvidenceAdapter(definition)
          ? "dated variant-level PvE research evidence"
          : "日期化的版本級 PvE 研究證據。",
        reproducible: false,
        sourceId,
        checkedAt,
      },
    ];
  });
  if (rawRows.length) await prisma.rawEvaluationData.createMany({ data: rawRows as never[] });

  const categoryRows = plan.flatMap((row) =>
    categories.map((category) => {
      let status:
        | "VERIFIED"
        | "PARTIALLY_VERIFIED"
        | "UNRANKED"
        | "NOT_APPLICABLE"
        | "DATA_UNAVAILABLE"
        | "UNRELEASED" = "NOT_APPLICABLE";
      let provenance: "SOURCE_VERIFIED" | "MANUAL_CURATED" | "DATA_UNAVAILABLE" = "MANUAL_CURATED";
      let summaryZhTw = "此欄位不適用，不影響可執行的保留或傳送建議。";
      let materialToDecision = false;
      let pveUseLevel:
        "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE" | null = null;
      if (category === "PVP") {
        if (!row.released || !["NORMAL", "SHADOW"].includes(row.variantKey)) {
          status = row.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (row.ranks.length) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = pvpSummary(row, definition);
          materialToDecision = row.ranks.some((rank) => rank.rank <= 250);
        } else {
          status = "UNRANKED";
          summaryZhTw = "固定 PvPoke Open／Overall 快照未列入可重現名次。";
        }
      } else if (category === "PVE") {
        pveUseLevel = row.pveEvidence?.level ?? "NO_SIGNIFICANT_USE";
        if (
          !row.released ||
          (legacy
            ? row.variantKey === "DYNAMAX"
            : ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey))
        ) {
          status = row.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (row.pveEvidence) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = row.pveEvidence.summaryZhTw;
          materialToDecision = true;
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          summaryZhTw = "目前沒有記錄正向 PvE 證據；不以資料空白虛構 IV 淘汰線。";
        }
      } else if (category === "ROCKET") {
        status = row.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = row.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "火箭隊沒有統一逐物種排名；此欄缺來源不單獨觸發暫時保留。";
      } else if (category === "GYM") {
        status = row.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = row.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "未列為主要道館保留用途；次要資料缺失不覆蓋其他結論。";
      } else if (category === "MEGA") {
        if (legacy) {
          summaryZhTw = "本批 #387～#416 目前沒有已推出的 Mega／Primal 戰鬥版本。";
        } else if (row.variantKey === "MEGA") {
          status = row.released ? "VERIFIED" : "UNRELEASED";
          provenance = row.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = row.released;
          summaryZhTw = row.released
            ? "已推出的 Mega 版本。"
            : "已建模但目前尚未推出的 Mega 版本。";
        }
      } else if (category === "MAX_BATTLE") {
        const isMaxVariant = row.variantKey === "DYNAMAX" || row.variantKey === "GIGANTAMAX";
        if (isMaxVariant) {
          status = row.released ? "VERIFIED" : "UNRELEASED";
          provenance =
            row.released && row.maxEvidence ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = row.released && Boolean(row.maxEvidence);
          summaryZhTw = !row.released
            ? "此 Max 版本尚未推出。"
            : row.maxEvidence?.summaryZhTw ??
              "此 Max 版本已推出，但目前沒有足以形成主要保留理由的 Max Battle 投資證據。";
        } else {
          status = row.released ? "NOT_APPLICABLE" : "UNRELEASED";
          summaryZhTw = "普通、暗影、淨化或 Mega 個體不能替代 Max 個體。";
        }
      } else if (category === "EVOLUTION_VALUE") {
        const form = definition.forms.find((candidate) => candidate.id === row.formId);
        const hasEvolution = legacy
          ? definition.evolutionPairs.some(([from]) => from === row.formId) ||
            Boolean(form?.evolvesFromFormId) ||
            row.formId === "315-hoenn"
          : definition.evolutionPairs.some(
              ([from, to]) => from === row.formId || to === row.formId,
            ) || Boolean(form?.evolvesFromFormId);
        status = hasEvolution ? "VERIFIED" : "NOT_APPLICABLE";
        materialToDecision = false;
        summaryZhTw = legacy
          ? hasEvolution
            ? "本批或既有家族的正式進化關係已結構化；是否保留仍取決於後續用途與版本。"
            : "沒有額外需要回推的本批進化用途。"
          : hasEvolution
            ? "正式進化圖包含此型態。"
            : "目前沒有與此型態相連的進化路徑。";
      } else {
        status = row.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = row.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
      }
      return {
        id: `category-${row.id}-${category.toLowerCase()}`,
        battleVariantId: row.id,
        category,
        status,
        provenance,
        summaryZhTw,
        materialToDecision,
        rocketRating: category === "ROCKET" ? ("DATA_UNAVAILABLE" as const) : null,
        rocketRoles: "[]",
        maxTypeRank: null,
        maxTypeTier: category === "MAX_BATTLE" ? (row.maxEvidence?.roles.join("；") ?? null) : null,
        maxTypeKey: null,
        maxOverallRating:
          category === "MAX_BATTLE" && row.maxEvidence
            ? row.maxEvidence.level === "CORE_INVESTMENT"
              ? "HIGH"
              : row.maxEvidence.level === "USABLE_OR_BUDGET"
                ? "MEDIUM"
                : "LOW"
            : null,
        maxInvestmentRating:
          category === "MAX_BATTLE" && row.maxEvidence
            ? row.maxEvidence.level === "CORE_INVESTMENT"
              ? "HIGH"
              : row.maxEvidence.level === "USABLE_OR_BUDGET"
                ? "MEDIUM"
                : "LOW"
            : null,
        maxUseCaseBreadth:
          category === "MAX_BATTLE" && row.maxEvidence
            ? row.maxEvidence.level === "CORE_INVESTMENT"
              ? "BROAD"
              : row.maxEvidence.level === "USABLE_OR_BUDGET"
                ? "MEDIUM"
                : "NARROW"
            : null,
        pveUseLevel,
        assessmentDisposition: null,
        checkedAt,
      };
    }),
  );
  await prisma.categoryEvaluation.createMany({ data: categoryRows });

  const categorySources: Array<{
    categoryEvaluationId: string;
    sourceId: string;
    usageZhTw: string;
  }> = [];
  const evaluationSources: Array<{ evaluationId: string; sourceId: string; usageZhTw: string }> =
    [];
  const categorySourceKeys = new Set<string>();
  const evaluationSourceKeys = new Set<string>();
  const addCategorySource = (value: (typeof categorySources)[number]) => {
    const key = `${value.categoryEvaluationId}|${value.sourceId}`;
    if (categorySourceKeys.has(key)) return;
    categorySourceKeys.add(key);
    categorySources.push(value);
  };
  const addEvaluationSource = (value: (typeof evaluationSources)[number]) => {
    const key = `${value.evaluationId}|${value.sourceId}`;
    if (evaluationSourceKeys.has(key)) return;
    evaluationSourceKeys.add(key);
    evaluationSources.push(value);
  };
  for (const row of plan) {
    for (const rank of row.ranks) {
      const usage = legacy
        ? "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。"
        : "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。";
      addCategorySource({
        categoryEvaluationId: `category-${row.id}-pvp`,
        sourceId: leagueMeta[rank.league].sourceId,
        usageZhTw: usage,
      });
      addEvaluationSource({
        evaluationId: `gen4-${definition.batch}-eval-${row.id}`,
        sourceId: leagueMeta[rank.league].sourceId,
        usageZhTw: usage,
      });
    }
    if (row.pveEvidence) {
      const sourceId = pveSourceByUrl.get(row.pveEvidence.sourceUrl)!;
      const usage = legacy
        ? "2026-08-13 版本級 PvE 用途與屬性榜證據。"
        : "日期化的版本級 PvE 證據。";
      addCategorySource({
        categoryEvaluationId: `category-${row.id}-pve`,
        sourceId,
        usageZhTw: usage,
      });
      addEvaluationSource({
        evaluationId: `gen4-${definition.batch}-eval-${row.id}`,
        sourceId,
        usageZhTw: usage,
      });
    }
    if (row.variantKey === "MEGA" && megaSourceId) {
      addCategorySource({
        categoryEvaluationId: `category-${row.id}-mega`,
        sourceId: megaSourceId,
        usageZhTw: "已推出 Mega 版本的發布狀態來源。",
      });
      addEvaluationSource({
        evaluationId: `gen4-${definition.batch}-eval-${row.id}`,
        sourceId: megaSourceId,
        usageZhTw: "已推出 Mega 版本的發布狀態來源。",
      });
    }
    const isReleasedMaxVariant = legacy
      ? row.variantKey === "DYNAMAX"
      : ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey);
    if (isReleasedMaxVariant && row.released && maxSourceId) {
      const usage = legacy
        ? "目前 Dynamax roster 的版本推出證據。"
        : "已推出 Max 版本的發布狀態來源。";
      addCategorySource({
        categoryEvaluationId: `category-${row.id}-max_battle`,
        sourceId: maxSourceId,
        usageZhTw: usage,
      });
      addEvaluationSource({
        evaluationId: `gen4-${definition.batch}-eval-${row.id}`,
        sourceId: maxSourceId,
        usageZhTw: usage,
      });
    }
  }
  for (const source of releaseResearch.sources) {
    for (const support of source.supports ?? []) {
      const row = plan.find(
        (candidate) => candidate.id === support || candidate.id === `${support}-normal`,
      );
      if (!row) continue;
      let category: (typeof categories)[number] | null = null;
      let usageZhTw = "";
      if (source.id.startsWith("SHADOW-")) {
        category = "ROCKET";
        usageZhTw = "暗影名單的直接遭遇發布證據；進化後型態由正式進化路徑推導。";
      } else if (source.id.startsWith("MEGA-") && row.variantKey === "MEGA") {
        category = "MEGA";
        usageZhTw = "已推出 Mega 版本的發布狀態來源。";
      } else if (
        source.id.startsWith("MAX-") &&
        ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey)
      ) {
        category = "MAX_BATTLE";
        usageZhTw = "已推出 Max 版本的發布狀態來源。";
      } else if (source.id.startsWith("EVOLUTION-")) {
        category = "EVOLUTION_VALUE";
        usageZhTw = "正式進化關係來源；不以此來源推論戰鬥強度。";
      } else if (
        row.variantKey === "NORMAL" &&
        (source.id.startsWith("PVP-SINNOH-") ||
          source.id.startsWith("SECONDARY-SINNOH-POKEDEX-") ||
          source.id.startsWith("GOFEST-"))
      ) {
        category = "EVOLUTION_VALUE";
        usageZhTw = source.id.startsWith("GOFEST-")
          ? "GO Snapshot 活動中的普通型態發布證據。"
          : "普通型態的 Pokémon GO 發布狀態參考。";
      }
      if (!category) continue;
      addCategorySource({
        categoryEvaluationId: `category-${row.id}-${category.toLowerCase()}`,
        sourceId: source.id,
        usageZhTw,
      });
      addEvaluationSource({
        evaluationId: `gen4-${definition.batch}-eval-${row.id}`,
        sourceId: source.id,
        usageZhTw,
      });
    }
  }
  if (categorySources.length)
    await prisma.categoryEvaluationSource.createMany({ data: categorySources });

  const evaluationRows = plan.map((row) => ({
    id: `gen4-${definition.batch}-eval-${row.id}`,
    battleVariantId: row.id,
    finalDecision: row.initialDecision,
    provenance: "MANUAL_CURATED" as const,
    gymRating: "NOT_APPLICABLE" as const,
    confidence: "HIGH" as const,
    rulesVersion: RULES_VERSION,
    generatedAt: checkedAt,
    reviewed: true,
    reviewedAt: checkedAt,
    reviewStatus: "RESOLVED" as const,
    assessmentDisposition: row.initialDisposition,
    ...evaluationPresentation(row, definition),
  }));
  await prisma.retentionEvaluation.createMany({ data: evaluationRows });
  await prisma.evaluationRuleTrace.createMany({
    data: plan.map((row) => {
      const trace = ruleTrace(row);
      return {
        id: `gen4-${definition.batch}-trace-${row.id}`,
        evaluationId: `gen4-${definition.batch}-eval-${row.id}`,
        ruleKey: trace.ruleKey,
        ruleVersion: RULES_VERSION,
        priority: trace.priority,
        matched: true,
        resultDecision: row.initialDecision,
        explanationZhTw: legacy
          ? "第四世代匯入初步評估；後續仍由共用重算與 review 流程確認。"
          : "決定性的第四世代匯入計畫提供此初步評估結論。",
      };
    }),
  });
  if (evaluationSources.length)
    await prisma.evaluationSource.createMany({ data: evaluationSources });
}

export async function runImportGen4(batch: string, databaseUrl = getDatabaseUrl()) {
  const entry = getBatchByKey(batch);
  if (entry.import.adapter !== "gen4")
    throw new Error(`Batch ${batch} is not owned by the Gen4 adapter.`);
  const definition = getGen4BatchDefinition(batch);
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
  try {
    const releaseResearch = readManifest(`research_notes/sources/official-${batch}.json`);
    const pveResearch = readManifest(`research_notes/sources/pve-${batch}.json`);
    for (const source of [...releaseResearch.sources, ...pveResearch.sources]) {
      await upsertSource(prisma, source, releaseResearch.checkedAt ?? "2026-09-03");
    }
    await upsertPvPokeSources(prisma);
    await upsertSpeciesAndForms(prisma, definition, entry);
    await materializeEvolutionPaths(prisma, definition, releaseResearch);
    const rankings = await readRankings();
    const plan = buildGen4ImportPlan(definition, rankings);
    await writeBattleVariants(prisma, definition, plan);
    await writeEvidence(prisma, definition, releaseResearch, pveResearch, plan);
    const sourceId =
      releaseResearch.sources.find((source) => source.id.includes("POKEDEX"))?.id ??
      releaseResearch.sources[0]?.id;
    if (!sourceId) throw new Error(`Missing release source for ${batch}.`);
    await prisma.changeLog.upsert({
      where: { id: `gen4-${batch}-batch` },
      create: {
        id: `gen4-${batch}-batch`,
        entityType: "Batch",
        entityId: batch,
        fieldName: "status",
        previousValue: null,
        newValue: "RESEARCHED",
        sourceId,
        changeReasonZhTw: `透過批次擁有的通用匯入器 匯入第四世代 ${batch}。`,
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      update: {
        newValue: "RESEARCHED",
        sourceId,
        changeReasonZhTw: `透過批次擁有的通用匯入器 重建第四世代 ${batch}。`,
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
    });
    return { prisma, plan };
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

export async function closeGen4Import(result: { prisma: PrismaClient }) {
  await result.prisma.$disconnect();
}

async function main() {
  assertDisposableDatabase(getDatabaseUrl());
  const batch = process.argv[2];
  if (!batch || process.argv.length > 3) {
    throw new Error("Usage: tsx scripts/data/import-gen4.ts <registered Gen4 batch>.");
  }
  const result = await runImportGen4(batch);
  try {
    console.log(
      JSON.stringify(
        {
          batch,
          planRows: result.plan.length,
          releasedRows: result.plan.filter((row) => row.released).length,
        },
        null,
        2,
      ),
    );
  } finally {
    await closeGen4Import(result);
  }
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/data/import-gen4.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
