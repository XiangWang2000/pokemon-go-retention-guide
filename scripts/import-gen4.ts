import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile, readFileSync } from "node:fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { forms387416, evolutionPairs387416, species387416 } from "../src/data/batch-387-416";
import { upsertEvolutionPath } from "../src/data/evolution-path";
import {
  buildGen4ImportPlan387416,
  type Gen4ImportPlanRow,
  type Gen4PlanLeague,
  type Gen4PvpRankingRow,
  type Gen4RankingSnapshots,
} from "../src/data/gen4-import-plan";
import { RULES_VERSION } from "../src/rules/rules";
import { getDatabaseUrl } from "../src/lib/database";

const checkedAt = new Date("2026-08-13T00:00:00+08:00");
const pvpokeCommit = "86847e535b7e0a0f4e91f9628b3fc713ae6adca7";
const categories = ["PVP", "PVE", "ROCKET", "GYM", "MEGA", "MAX_BATTLE", "EVOLUTION_VALUE"] as const;
const leagueMeta: Record<Gen4PlanLeague, { cp: number; sourceId: string; label: string }> = {
  GREAT: { cp: 1500, sourceId: "pvpoke-gl-20260715", label: "GL（超級聯盟）" },
  ULTRA: { cp: 2500, sourceId: "pvpoke-ul-20260715", label: "UL（高級聯盟）" },
  MASTER: { cp: 10000, sourceId: "pvpoke-ml-20260715", label: "ML（大師聯盟）" },
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
  return JSON.parse(readFileSync(path, "utf8")) as ResearchManifest;
}

async function readRankings(): Promise<Gen4RankingSnapshots> {
  const result = {} as Record<Gen4PlanLeague, Gen4PvpRankingRow[]>;
  for (const league of Object.keys(leagueMeta) as Gen4PlanLeague[]) {
    const { cp } = leagueMeta[league];
    const json = await new Promise<string>((resolve, reject) =>
      readFile(`data/sources/pvpoke/rankings-${cp}.json`, "utf8", (error, data) =>
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
  const summary = source.sourceSummaryZhTw ?? source.summaryZhTw ?? "第四世代 #387～#416 研究來源。";
  await prisma.sourceReference.upsert({
    where: { id: source.id },
    create: {
      id: source.id,
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      sourceType: source.sourceType as never,
      sourceTitleOriginal: source.sourceTitleOriginal ?? source.sourceName,
      sourceLanguage: source.sourceLanguage ?? "en",
      sourceSummaryZhTw: summary,
      accessedAt,
      publishedAt: optionalDate(source.publishedAt),
      dataVersion: `accessed-${source.accessedAt ?? fallbackCheckedAt}`,
      notes: "第四世代 #387～#416 匯入研究來源。",
    },
    update: {
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      sourceType: source.sourceType as never,
      sourceTitleOriginal: source.sourceTitleOriginal ?? source.sourceName,
      sourceLanguage: source.sourceLanguage ?? "en",
      sourceSummaryZhTw: summary,
      accessedAt,
      publishedAt: optionalDate(source.publishedAt),
      dataVersion: `accessed-${source.accessedAt ?? fallbackCheckedAt}`,
      notes: "第四世代 #387～#416 匯入研究來源。",
    },
  });
}

async function upsertPvPokeSources(prisma: PrismaClient) {
  for (const league of Object.keys(leagueMeta) as Gen4PlanLeague[]) {
    const { cp, sourceId, label } = leagueMeta[league];
    const bytes = readFileSync(`data/sources/pvpoke/rankings-${cp}.json`);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    await prisma.sourceReference.upsert({
      where: { id: sourceId },
      create: {
        id: sourceId,
        sourceName: "PvPoke fixed ranking snapshot",
        sourceUrl: "https://pvpoke.com/rankings/",
        sourceType: "PVP",
        sourceTitleOriginal: `PvPoke ${label} Open League Overall Rankings`,
        sourceLanguage: "en",
        sourceSummaryZhTw: "固定 commit 的 Open League／Overall 排名快照。",
        accessedAt: checkedAt,
        publishedAt: null,
        dataVersion: `${pvpokeCommit}; sha256=${sha256}`,
        notes: "完整 JSON 陣列 index + 1 可重現名次。",
      },
      update: {
        dataVersion: `${pvpokeCommit}; sha256=${sha256}`,
        notes: "完整 JSON 陣列 index + 1 可重現名次。",
      },
    });
  }
}

function pvpSummary(row: Gen4ImportPlanRow) {
  if (!row.ranks.length) return "固定 PvPoke Open／Overall 快照未列入可重現名次。";
  return row.ranks
    .map((rank) => {
      const label = leagueMeta[rank.league].label;
      return `${label} Overall #${rank.rank}${rank.moves.length ? `；招式 ${rank.moves.join("／")}` : ""}`;
    })
    .join("；");
}

function decisionReason(row: Gen4ImportPlanRow) {
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
  if (row.initialDecision === "CONDITIONAL_KEEP") return { ruleKey: "CONDITIONAL_USE", priority: 700 };
  return { ruleKey: "LOW_GENERAL_VALUE", priority: 100 };
}

export async function runImport387416(databaseUrl = getDatabaseUrl()) {
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
  });
  try {
    const releaseResearch = readManifest("research_notes/official-387-416.json");
    const pveResearch = readManifest("research_notes/pve-387-416.json");
    for (const source of releaseResearch.sources) {
      await upsertSource(prisma, source, releaseResearch.checkedAt ?? "2026-08-13");
    }
    for (const source of pveResearch.sources) {
      await upsertSource(prisma, source, pveResearch.checkedAt ?? "2026-08-13");
    }
    await upsertPvPokeSources(prisma);

    const roselia = await prisma.pokemonForm.findUnique({ where: { id: "315-hoenn" } });
    if (!roselia) {
      throw new Error("Gen4 #387-#416 import requires existing form 315-hoenn for the Budew/Roserade family.");
    }

    for (const species of species387416) {
      await prisma.pokemonSpecies.upsert({
        where: { id: `species-${String(species.dexNumber).padStart(3, "0")}` },
        create: {
          id: `species-${String(species.dexNumber).padStart(3, "0")}`,
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

    for (const form of forms387416) {
      const speciesId = `species-${String(form.dexNumber).padStart(3, "0")}`;
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
          isReleasedInPokemonGo: true,
          releaseStatus: "RELEASED",
          releaseVerifiedAt: checkedAt,
          isEvolutionStub: false,
          evolutionTargetUseLevel: null,
          evolutionTargetNotesZhTw: null,
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
          isReleasedInPokemonGo: true,
          releaseStatus: "RELEASED",
          releaseVerifiedAt: checkedAt,
          isEvolutionStub: false,
          evolutionTargetUseLevel: null,
          evolutionTargetNotesZhTw: null,
        },
      });
    }

    for (const form of forms387416) {
      if (form.evolvesFromFormId) {
        await prisma.pokemonForm.update({
          where: { id: form.id },
          data: { evolvesFromFormId: form.evolvesFromFormId },
        });
      }
    }
    await prisma.pokemonForm.update({
      where: { id: "315-hoenn" },
      data: { evolvesFromFormId: "406-sinnoh" },
    });

    for (const [fromFormId, toFormId] of evolutionPairs387416) {
      const id = `evolution-gen4-387-416-${fromFormId}-${toFormId}`;
      await upsertEvolutionPath(prisma, {
        id,
        fromFormId,
        toFormId,
        evolutionMethodZhTw: "依 Pokémon GO 當期糖果、性別與特殊條件進化。",
        availabilityNotesZhTw: "第四世代 #387～#416 進化圖已獨立核對；特殊分支依遊戲內介面為準。",
        requiresEvent: false,
        verifiedAt: checkedAt,
      });
    }

    const rankings = await readRankings();
    const plan = buildGen4ImportPlan387416(rankings);
    const variantIds = plan.map((row) => row.id);

    await prisma.retentionEvaluation.deleteMany({ where: { battleVariantId: { in: variantIds } } });
    await prisma.categoryEvaluation.deleteMany({ where: { battleVariantId: { in: variantIds } } });
    await prisma.rawEvaluationData.deleteMany({ where: { battleVariantId: { in: variantIds } } });

    for (const row of plan) {
      await prisma.battleVariant.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          pokemonFormId: row.formId,
          variantKey: row.variantKey,
          isReleased: row.released,
          releaseStatus: row.releaseStatus,
          releaseVerifiedAt: checkedAt,
          notesZhTw:
            row.variantKey === "SHADOW"
              ? "暗影個體獨立評估；暗影標準較寬，不因低總 IV 自動淨化。"
              : row.variantKey === "PURIFIED"
                ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。"
                : row.variantKey === "DYNAMAX"
                  ? row.released
                    ? "此 Dynamax 版本已推出；普通個體不能替代 Max 個體。"
                    : "此 Dynamax 版本尚未推出；普通個體不能替代 Max 個體。"
                  : "普通版本；與暗影、淨化及 Max 分開評估。",
          inheritsFromVariantId:
            row.variantKey === "PURIFIED" && row.released ? `${row.formId}-normal` : null,
          inheritanceMode: row.variantKey === "PURIFIED" && row.released ? "NORMAL_BASE" : "NONE",
          purificationCostModifier: row.variantKey === "PURIFIED" && row.released ? 0.9 : null,
          hasReturnAccess: row.variantKey === "PURIFIED" && row.released,
          purificationRiskZhTw:
            row.variantKey === "PURIFIED" && row.released
              ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。"
              : "",
          purifiedOverrideRequired: false,
        },
        update: {
          pokemonFormId: row.formId,
          variantKey: row.variantKey,
          isReleased: row.released,
          releaseStatus: row.releaseStatus,
          releaseVerifiedAt: checkedAt,
          inheritsFromVariantId:
            row.variantKey === "PURIFIED" && row.released ? `${row.formId}-normal` : null,
          inheritanceMode: row.variantKey === "PURIFIED" && row.released ? "NORMAL_BASE" : "NONE",
          purificationCostModifier: row.variantKey === "PURIFIED" && row.released ? 0.9 : null,
          hasReturnAccess: row.variantKey === "PURIFIED" && row.released,
          purificationRiskZhTw:
            row.variantKey === "PURIFIED" && row.released
              ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。"
              : "",
          purifiedOverrideRequired: false,
        },
      });
    }

    const pveSourceByUrl = new Map(pveResearch.sources.map((source) => [source.sourceUrl, source.id]));
    const rawRows = plan.flatMap((row) => {
      const pvpRows = row.ranks.map((rank) => ({
        id: `raw-gen4-387-416-${row.id}-${rank.league.toLowerCase()}`,
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
        rawNotes: `${leagueMeta[rank.league].label} Open／Overall；固定 JSON 陣列 index + 1 可重現。`,
        seasonOrVersion: `PvPoke commit ${pvpokeCommit}`,
        extractionMethod: "固定 commit 的完整 rankings JSON 陣列索引（index + 1）",
        reproducible: true,
        sourceId: leagueMeta[rank.league].sourceId,
        checkedAt,
      }));
      if (!row.pveEvidence) return pvpRows;
      const sourceId = pveSourceByUrl.get(row.pveEvidence.sourceUrl);
      if (!sourceId) throw new Error(`Missing PvE source for ${row.id}: ${row.pveEvidence.sourceUrl}`);
      return [
        ...pvpRows,
        {
          id: `raw-gen4-387-416-${row.id}-pve`,
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
          rating: row.pveEvidence.roles.join("；"),
          recommendedMoves: JSON.stringify([]),
          tier: row.pveEvidence.level,
          rawNotes: row.pveEvidence.summaryZhTw,
          seasonOrVersion: "GO Hub accessed 2026-08-13",
          extractionMethod: "dated variant-level PvE research evidence",
          reproducible: false,
          sourceId,
          checkedAt,
        },
      ];
    });
    if (rawRows.length) await prisma.rawEvaluationData.createMany({ data: rawRows as never[] });

    const maxSourceId = "MAX-SINNOH-20260813";
    const categoryRows = plan.flatMap((row) =>
      categories.map((category) => {
        let status: "VERIFIED" | "PARTIALLY_VERIFIED" | "UNRANKED" | "NOT_APPLICABLE" | "DATA_UNAVAILABLE" | "UNRELEASED" = "NOT_APPLICABLE";
        let provenance: "SOURCE_VERIFIED" | "MANUAL_CURATED" | "DATA_UNAVAILABLE" = "MANUAL_CURATED";
        let summaryZhTw = "此欄位不適用，不影響可執行的保留或傳送建議。";
        let materialToDecision = false;
        let pveUseLevel: "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE" | null = null;
        if (category === "PVP") {
          if (!row.released || !["NORMAL", "SHADOW"].includes(row.variantKey)) {
            status = row.released ? "NOT_APPLICABLE" : "UNRELEASED";
          } else if (row.ranks.length) {
            status = "VERIFIED";
            provenance = "SOURCE_VERIFIED";
            summaryZhTw = pvpSummary(row);
            materialToDecision = row.ranks.some((rank) => rank.rank <= 250);
          } else {
            status = "UNRANKED";
            summaryZhTw = "固定 PvPoke Open／Overall 快照未列入可重現名次。";
          }
        } else if (category === "PVE") {
          pveUseLevel = row.pveEvidence?.level ?? "NO_SIGNIFICANT_USE";
          if (!row.released || row.variantKey === "DYNAMAX") {
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
          status = "NOT_APPLICABLE";
          summaryZhTw = "本批 #387～#416 目前沒有已推出的 Mega／Primal 戰鬥版本。";
        } else if (category === "MAX_BATTLE") {
          if (row.variantKey === "DYNAMAX") {
            status = row.released ? "VERIFIED" : "UNRELEASED";
            provenance = row.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
            materialToDecision = row.released;
            summaryZhTw = row.released ? "此 Dynamax 版本已推出；與普通／暗影版本分開保留。" : "此 Dynamax 版本尚未推出。";
          } else {
            status = row.released ? "NOT_APPLICABLE" : "UNRELEASED";
            summaryZhTw = "普通、暗影或淨化個體不能替代 Dynamax 個體。";
          }
        } else {
          const form = forms387416.find((candidate) => candidate.id === row.formId)!;
          const hasEvolution = evolutionPairs387416.some(([from]) => from === row.formId) || Boolean(form.evolvesFromFormId) || row.formId === "315-hoenn";
          status = hasEvolution ? "VERIFIED" : "NOT_APPLICABLE";
          summaryZhTw = hasEvolution ? "本批或既有家族的正式進化關係已結構化；是否保留仍取決於後續用途與版本。" : "沒有額外需要回推的本批進化用途。";
        }
        return {
          id: `category-${row.id}-${category.toLowerCase()}`,
          battleVariantId: row.id,
          category,
          status,
          provenance,
          summaryZhTw,
          materialToDecision,
          rocketRating: category === "ROCKET" ? "DATA_UNAVAILABLE" as const : null,
          rocketRoles: "[]",
          maxTypeRank: null,
          maxTypeTier: null,
          maxTypeKey: null,
          maxOverallRating: null,
          maxInvestmentRating: null,
          maxUseCaseBreadth: null,
          pveUseLevel,
          assessmentDisposition: null,
          checkedAt,
        };
      }),
    );
    await prisma.categoryEvaluation.createMany({ data: categoryRows });

    const categorySources: Array<{ categoryEvaluationId: string; sourceId: string; usageZhTw: string }> = [];
    for (const row of plan) {
      for (const rank of row.ranks) {
        categorySources.push({
          categoryEvaluationId: `category-${row.id}-pvp`,
          sourceId: leagueMeta[rank.league].sourceId,
          usageZhTw: "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。",
        });
      }
      if (row.pveEvidence) {
        categorySources.push({
          categoryEvaluationId: `category-${row.id}-pve`,
          sourceId: pveSourceByUrl.get(row.pveEvidence.sourceUrl)!,
          usageZhTw: "2026-08-13 variant-level PvE 用途與屬性榜證據。",
        });
      }
      if (row.variantKey === "DYNAMAX" && row.released) {
        categorySources.push({
          categoryEvaluationId: `category-${row.id}-max_battle`,
          sourceId: maxSourceId,
          usageZhTw: "目前 Dynamax roster 的版本推出證據。",
        });
      }
    }
    if (categorySources.length) await prisma.categoryEvaluationSource.createMany({ data: categorySources });

    const evaluationRows = plan.map((row) => ({
      id: `gen4-387-416-eval-${row.id}`,
      battleVariantId: row.id,
      finalDecision: row.initialDecision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: pvpSummary(row),
      pveSummaryZhTw: row.pveEvidence?.summaryZhTw ?? "目前沒有記錄正向 PvE 證據；不因 100% IV 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一逐物種排名；缺少此欄不單獨覆蓋其他結論。",
      gymSummaryZhTw: "未列為主要道館保留用途；缺少次要欄位來源不覆蓋其他結論。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw: "本批目前沒有已推出的 Mega／Primal 戰鬥版本。",
      maxBattleSummaryZhTw:
        row.variantKey === "DYNAMAX"
          ? row.released
            ? "此 Dynamax 版本已推出；與普通／暗影版本分開保留。"
            : "此 Dynamax 版本尚未推出。"
          : "普通、暗影或淨化個體不能替代 Dynamax 個體。",
      evolutionSummaryZhTw: "第四世代 #387～#416 進化圖已結構化；前階是否保留由後續目標用途決定。",
      requiredMovesSummaryZhTw:
        row.ranks.some((rank) => rank.rank <= 250)
          ? `依固定快照優先核對：${[...new Set(row.ranks.filter((rank) => rank.rank <= 250).flatMap((rank) => rank.moves))].join("／")}`
          : "沒有招式足以把低用途版本自動升格為必留；活動招式只作投入前條件。",
      recommendedIvStrategyZhTw:
        row.variantKey === "SHADOW"
          ? "暗影標準較寬；15攻優先，不設硬性最低 IV。"
          : row.initialDecision === "TRANSFER_CANDIDATE"
            ? "目前沒有主要用途時，不因 100% 自動產生保留理由。"
            : "依實際用途分開篩選；PvP 看同聯盟 IV Rank，PvE 先看招式、等級／CP與既有投入；15攻優先，14攻高整體 IV 亦可留。",
      reasonZhTw: decisionReason(row),
      confidence: "HIGH" as const,
      rulesVersion: RULES_VERSION,
      generatedAt: checkedAt,
      reviewed: true,
      reviewedAt: checkedAt,
      reviewStatus: "RESOLVED" as const,
      missingDataSummaryZhTw:
        !row.released
          ? "此版本尚未推出，不把它當成現有個體的待補資料。"
          : row.initialDecision === "TRANSFER_CANDIDATE"
            ? "已有足夠資料判定目前無顯著主要用途；一般重複個體通常可傳送。"
            : "已有明確用途；次要欄位缺資料不覆蓋目前保留結論。",
      assessmentDisposition: row.initialDisposition,
      reviewNotesZhTw: "已核對神奧型態、跨世代進化、普通／暗影／淨化／Dynamax 邊界、固定 PvPoke 快照與 variant-level PvE evidence。",
    }));
    await prisma.retentionEvaluation.createMany({ data: evaluationRows });

    await prisma.evaluationRuleTrace.createMany({
      data: plan.map((row) => {
        const trace = ruleTrace(row);
        return {
          id: `gen4-387-416-trace-${row.id}`,
          evaluationId: `gen4-387-416-eval-${row.id}`,
          ruleKey: trace.ruleKey,
          ruleVersion: RULES_VERSION,
          priority: trace.priority,
          matched: true,
          resultDecision: row.initialDecision,
          explanationZhTw: "第四世代匯入初步評估；後續仍由共用重算與 review 流程確認。",
        };
      }),
    });

    const evaluationSources: Array<{ evaluationId: string; sourceId: string; usageZhTw: string }> = [];
    for (const row of plan) {
      for (const rank of row.ranks) {
        evaluationSources.push({
          evaluationId: `gen4-387-416-eval-${row.id}`,
          sourceId: leagueMeta[rank.league].sourceId,
          usageZhTw: "固定 PvPoke Open League／Overall JSON 的可重現名次。",
        });
      }
      if (row.pveEvidence) {
        evaluationSources.push({
          evaluationId: `gen4-387-416-eval-${row.id}`,
          sourceId: pveSourceByUrl.get(row.pveEvidence.sourceUrl)!,
          usageZhTw: "2026-08-13 variant-level PvE evidence。",
        });
      }
      if (row.variantKey === "DYNAMAX" && row.released) {
        evaluationSources.push({
          evaluationId: `gen4-387-416-eval-${row.id}`,
          sourceId: maxSourceId,
          usageZhTw: "Dynamax 版本推出證據。",
        });
      }
    }
    if (evaluationSources.length) await prisma.evaluationSource.createMany({ data: evaluationSources });

    await prisma.changeLog.upsert({
      where: { id: "gen4-387-416-batch" },
      create: {
        id: "gen4-387-416-batch",
        entityType: "Batch",
        entityId: "387-416",
        fieldName: "status",
        previousValue: null,
        newValue: "RESEARCHED",
        sourceId: "SECONDARY-SINNOH-POKEDEX-20260813",
        changeReasonZhTw: "新增第四世代 #387～#416 的神奧型態、跨世代進化、版本發布、固定 PvPoke 與 variant-level PvE evidence。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      update: {
        newValue: "RESEARCHED",
        sourceId: "SECONDARY-SINNOH-POKEDEX-20260813",
        changeReasonZhTw: "更新第四世代 #387～#416 研究資料。",
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
