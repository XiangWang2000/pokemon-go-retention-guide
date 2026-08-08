import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import {
  evolutionPairs152181,
  forms152181,
  pvpokeSpeciesId152181,
  releasedDynamaxForms152181,
  releasedGigantamaxForms152181,
  releasedMegaForms152181,
  releasedShadowForms152181,
  specialVariants152181,
  species152181,
  type Form152181,
} from "../src/data/batch-152-181";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const batchStart = 152;
const batchEnd = 181;
const checkedAt = new Date("2026-08-08T18:00:00+08:00");
const pvpokeCommit = "86847e535b7e0a0f4e91f9628b3fc713ae6adca7";
const categories = [
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX_BATTLE",
  "EVOLUTION_VALUE",
] as const;
type Category = (typeof categories)[number];
type VariantKey =
  | "NORMAL"
  | "SHADOW"
  | "PURIFIED"
  | "MEGA"
  | "MEGA_X"
  | "MEGA_Y"
  | "DYNAMAX"
  | "GIGANTAMAX";
type Decision = "KEEP" | "CONDITIONAL_KEEP" | "TRANSFER_CANDIDATE";
type Disposition =
  | "CLEAR_USE"
  | "LIMITED_USE"
  | "NO_SIGNIFICANT_USE"
  | "NOT_APPLICABLE_OR_UNRELEASED";
type LeagueKey = "GREAT" | "ULTRA" | "MASTER";

type RankingRow = {
  speciesId: string;
  rating?: number;
  moveset?: string[];
};

type RankResult = {
  league: LeagueKey;
  leagueLabel: string;
  sourceId: string;
  rank: number;
  rating: number | null;
  moves: string[];
};

type OfficialSource = {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceTitleOriginal: string;
  sourceLanguage: string;
  sourceUrl: string;
  accessedAt: string;
  publishedAt: string | null;
  sourceSummaryZhTw: string;
  supports: string[];
};

type OfficialResearch = {
  sources: OfficialSource[];
};

const leagues = [
  { key: "GREAT", cp: 1500, sourceId: "pvpoke-gl-20260715", label: "GL（超級聯盟）" },
  { key: "ULTRA", cp: 2500, sourceId: "pvpoke-ul-20260715", label: "UL（高級聯盟）" },
  { key: "MASTER", cp: 10000, sourceId: "pvpoke-ml-20260715", label: "ML（大師聯盟）" },
] as const;

const officialResearch = JSON.parse(
  readFileSync(new URL("../research_notes/official-152-181.json", import.meta.url), "utf8"),
) as OfficialResearch;

function optionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function evidenceCategory(variantId: string, sourceId: string): Category {
  if (sourceId.startsWith("OFF-MEGA-")) return "MEGA";
  if (variantId.endsWith("-mega")) return "MEGA";
  if (sourceId.startsWith("PVE-")) return "PVE";
  if (variantId.endsWith("-shadow") || variantId.endsWith("-purified")) return "ROCKET";
  if (variantId.endsWith("-dynamax") || variantId.endsWith("-gigantamax")) return "MAX_BATTLE";
  return "EVOLUTION_VALUE";
}

const officialEvidenceLinks = officialResearch.sources.flatMap((source) =>
  source.supports.map((variantId) => ({
    sourceId: source.id,
    variantId,
    category: evidenceCategory(variantId, source.id),
  })),
);

async function upsertSources() {
  for (const source of officialResearch.sources) {
    await prisma.sourceReference.upsert({
      where: { id: source.id },
      create: {
        id: source.id,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType as never,
        sourceTitleOriginal: source.sourceTitleOriginal,
        sourceLanguage: source.sourceLanguage,
        sourceSummaryZhTw: source.sourceSummaryZhTw,
        accessedAt: optionalDate(source.accessedAt) ?? checkedAt,
        publishedAt: optionalDate(source.publishedAt),
        dataVersion: `accessed-${source.accessedAt}`,
        notes: "第 #152～#181 批次來源研究表。",
      },
      update: {
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType as never,
        sourceTitleOriginal: source.sourceTitleOriginal,
        sourceLanguage: source.sourceLanguage,
        sourceSummaryZhTw: source.sourceSummaryZhTw,
        accessedAt: optionalDate(source.accessedAt) ?? checkedAt,
        publishedAt: optionalDate(source.publishedAt),
        dataVersion: `accessed-${source.accessedAt}`,
        notes: "第 #152～#181 批次來源研究表。",
      },
    });
  }
}

async function readRankings() {
  const result = new Map<LeagueKey, RankingRow[]>();
  for (const league of leagues) {
    const bytes = await readFile(`data/sources/pvpoke/rankings-${league.cp}.json`);
    const rows = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, "")) as RankingRow[];
    result.set(league.key, rows);
    const hash = createHash("sha256").update(bytes).digest("hex");
    await prisma.sourceReference.update({
      where: { id: league.sourceId },
      data: {
        dataVersion: `${pvpokeCommit}; sha256=${hash}`,
        notes: "Open League／Overall 固定 commit 完整 JSON；名次以陣列索引加一重現，不使用搜尋摘要。",
      },
    });
  }
  return result;
}

function variantReleased(formId: string, variantKey: VariantKey) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms152181.has(formId);
  }
  if (variantKey === "MEGA") return releasedMegaForms152181.has(formId);
  if (variantKey === "DYNAMAX") return releasedDynamaxForms152181.has(formId);
  if (variantKey === "GIGANTAMAX") return releasedGigantamaxForms152181.has(formId);
  return false;
}

function findRanks(
  form: Form152181,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
) {
  const speciesId = pvpokeSpeciesId152181(form, variantKey === "SHADOW");
  return leagues.flatMap((league) => {
    const rows = rankings.get(league.key) ?? [];
    const index = rows.findIndex((row) => row.speciesId === speciesId);
    if (index < 0) return [];
    const row = rows[index]!;
    return [
      {
        league: league.key,
        leagueLabel: league.label,
        sourceId: league.sourceId,
        rank: index + 1,
        rating: row.rating ?? null,
        moves: row.moveset ?? [],
      },
    ];
  });
}

function rankSummary(ranks: RankResult[]) {
  if (!ranks.length) return "PvPoke Open League／Overall 快照未列入可重現名次。";
  return ranks
    .map(
      (item) =>
        `${item.leagueLabel} Overall #${item.rank}${item.moves.length ? `；招式 ${item.moves.join("／")}` : ""}`,
    )
    .join("；");
}

function initialDecision(variantKey: VariantKey, released: boolean, ranks: RankResult[], formId: string) {
  if (!released) return "TRANSFER_CANDIDATE" as const;
  if (variantKey === "MEGA") return "KEEP" as const;
  const best = Math.min(...ranks.map((rank) => rank.rank), Number.POSITIVE_INFINITY);
  if (best <= 100) return "KEEP" as const;
  if (best <= 250 || (variantKey === "NORMAL" && formId === "181-kanto")) {
    return "CONDITIONAL_KEEP" as const;
  }
  return "TRANSFER_CANDIDATE" as const;
}

function initialDisposition(decision: Decision, released: boolean): Disposition {
  if (!released) return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

function pvpSourceRows(variants: VariantRecord[], rankMap: Map<string, RankResult[]>) {
  return variants.flatMap((variant) =>
    (rankMap.get(variant.id) ?? []).map((rank) => ({
      id: `raw-r18-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: pvpokeSpeciesId152181(variant.form, variant.variantKey === "SHADOW"),
      formKey: variant.form.id,
      variantKey: variant.variantKey,
      rank: rank.rank,
      rating: rank.rating === null ? null : String(rank.rating),
      recommendedMoves: JSON.stringify(rank.moves),
      rawNotes: `${rank.leagueLabel} Open／Overall；固定 JSON 陣列索引加一，可穩定重現。`,
      seasonOrVersion: `PvPoke commit ${pvpokeCommit}`,
      extractionMethod: "固定 commit 的完整 rankings JSON 陣列索引（index + 1）",
      reproducible: true,
      sourceId: rank.sourceId,
      checkedAt,
    })),
  );
}

type VariantRecord = {
  id: string;
  form: Form152181;
  variantKey: VariantKey;
  released: boolean;
};

async function rebuildBatch(rankings: Map<LeagueKey, RankingRow[]>) {
  await prisma.changeLog.deleteMany({ where: { id: { startsWith: "r18-batch-152-181" } } });
  await prisma.pokemonSpecies.deleteMany({
    where: { dexNumber: { gte: batchStart, lte: batchEnd } },
  });

  await prisma.pokemonSpecies.createMany({
    data: species152181.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 2,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms152181.map((form) => {
      const species = species152181.find((item) => item.dexNumber === form.dexNumber)!;
      return {
        id: form.id,
        speciesId: `species-${String(form.dexNumber).padStart(3, "0")}`,
        formKey: form.formKey,
        formNameEn: form.formNameEn,
        formNameZhTw: form.formNameZhTw,
        regionKey: form.regionKey,
        types: JSON.stringify(form.types),
        searchAliases: JSON.stringify([...new Set([...form.aliases, species.nameEn, species.nameZhTw])]),
        evolvesFromFormId: form.evolvesFromFormId ?? null,
        evolutionFamilyNotesZhTw: form.evolutionFamilyNotesZhTw,
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED" as const,
        releaseVerifiedAt: checkedAt,
        isEvolutionStub: false,
        evolutionTargetUseLevel: null,
        evolutionTargetNotesZhTw: null,
      };
    }),
  });

  await prisma.pokemonForm.update({
    where: { id: "042-kanto" },
    data: {
      evolutionFamilyNotesZhTw:
        forms152181.find((form) => form.id === "169-kanto")!.evolutionFamilyNotesZhTw,
    },
  });

  await prisma.evolutionPath.createMany({
    data: evolutionPairs152181.map(([fromFormId, toFormId]) => ({
      id: `evolution-r18-${fromFormId}-${toFormId}`,
      fromFormId,
      toFormId,
      evolutionMethodZhTw:
        fromFormId.startsWith("17") && ["025-kanto", "035-kanto", "039-kanto"].includes(toFormId)
          ? "提升友好度後消耗糖果進化"
          : "消耗糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw:
        toFormId === "169-kanto"
          ? "#169 叉字蝠為本批正式納入成員，接回 #041～#042 家族。"
          : "此進化路徑已在 #152～#181 整合資料中核對。",
      requiresEvent: false,
      verifiedAt: checkedAt,
    })),
  });

  const variants: VariantRecord[] = [];
  for (const form of forms152181) {
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: variantReleased(form.id, variantKey),
      });
    }
  }
  for (const special of specialVariants152181) {
    const form = forms152181.find((item) => item.id === special.formId)!;
    variants.push({ id: special.id, form, variantKey: special.variantKey, released: special.released });
  }
  if (species152181.length !== 30 || forms152181.length !== 30 || variants.length !== 121) {
    throw new Error(`#152～#181 靜態計數不符 30 species／30 forms／121 variants。`);
  }

  await prisma.battleVariant.createMany({
    data: variants.map(({ id, form, variantKey, released }) => ({
      id,
      pokemonFormId: form.id,
      variantKey,
      isReleased: released,
      releaseStatus: released ? ("RELEASED" as const) : ("UNRELEASED" as const),
      releaseVerifiedAt: checkedAt,
      notesZhTw:
        variantKey === "MEGA"
          ? "Mega 電龍是獨立戰鬥型態；只與普通基底、暗影及 Max 版本分開評估。"
          : variantKey === "DYNAMAX"
            ? "本批沒有來源確認此物種的極巨版本已推出；普通個體不能替代極巨個體。"
            : variantKey === "SHADOW"
              ? "暗影個體依獨立來源與 PvP 快照評估；暗影標準較寬，不因低總 IV 自動淨化。"
              : variantKey === "PURIFIED"
                ? "淨化不可逆；沒有獨立榜單，不因淨化本身升格為必留。"
                : "普通版本；與暗影、淨化、Mega 及 Max 分開評估。",
      inheritsFromVariantId: variantKey === "PURIFIED" && released ? `${form.id}-normal` : null,
      inheritanceMode: variantKey === "PURIFIED" && released ? ("NORMAL_BASE" as const) : ("NONE" as const),
      purificationCostModifier: variantKey === "PURIFIED" && released ? 0.9 : null,
      hasReturnAccess: variantKey === "PURIFIED" && released,
      purificationRiskZhTw:
        variantKey === "PURIFIED" && released
          ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。"
          : "",
      purifiedOverrideRequired: false,
    })),
  });

  const rankMap = new Map<string, RankResult[]>();
  for (const variant of variants) {
    rankMap.set(
      variant.id,
      variant.released && (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW")
        ? findRanks(variant.form, variant.variantKey, rankings)
        : [],
    );
  }
  const rawRows = [
    ...pvpSourceRows(variants, rankMap),
    {
    id: "raw-r18-181-kanto-mega-pve",
    battleVariantId: "181-kanto-mega",
    category: "PVE",
    status: "PARTIALLY_VERIFIED",
    league: "NOT_APPLICABLE",
    cup: null,
    pvpCategory: null,
    speciesKey: "ampharos",
    formKey: "181-kanto",
    variantKey: "MEGA",
    rank: null,
    rating: "A",
    recommendedMoves: JSON.stringify(["VOLT_SWITCH", "ZAP_CANNON"]),
    tier: "SPECIAL",
    rawNotes: "GO Hub 列 Mega Ampharos 為團體戰攻擊者 #74、電系 #11；有特定用途但非核心投資。",
    seasonOrVersion: "GO Hub accessed 2026-08-08",
    extractionMethod: "來源頁面保存的 tier、型別排名與 PvE 分析摘要",
    reproducible: false,
    sourceId: "PVE-MEGA-AMPHAROS-20260808",
    checkedAt,
    } as const,
  ];
  await prisma.rawEvaluationData.createMany({ data: rawRows });

  const decisions = new Map<string, { decision: Decision; ranks: RankResult[]; released: boolean }>();
  for (const variant of variants) {
    const ranks = rankMap.get(variant.id) ?? [];
    decisions.set(variant.id, {
      decision: initialDecision(variant.variantKey, variant.released, ranks, variant.form.id),
      ranks,
      released: variant.released,
    });
  }

  const categoryRows = variants.flatMap((variant) => {
    const result = decisions.get(variant.id)!;
    const links = officialEvidenceLinks.filter((link) => link.variantId === variant.id);
    return categories.map((category) => {
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
      let pveUseLevel: "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE" | null = null;

      if (category === "PVP") {
        if (!variant.released || !["NORMAL", "SHADOW"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (result.ranks.length) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = rankSummary(result.ranks);
          materialToDecision = result.ranks.some((rank) => rank.rank <= 250);
        } else {
          status = "UNRANKED";
          summaryZhTw = "固定 PvPoke Open／Overall 快照未列入可重現名次。";
        }
      } else if (category === "PVE") {
        if (!variant.released || ["DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (variant.id === "181-kanto-mega") {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          pveUseLevel = "SPECIAL_USE";
          summaryZhTw = "Mega 電龍有電系與 Mega boost 的特殊 PvE 用途，但不是核心投資；先看招式、等級與既有投入。";
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          pveUseLevel = "NO_SIGNIFICANT_USE";
          summaryZhTw = "本批未列為普通版本的核心 PvE 投資目標；不以缺少精確 PvE 斷點虛構 IV 淘汰線。";
        }
      } else if (category === "ROCKET") {
        status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "火箭隊沒有統一逐物種排名；此缺項不單獨觸發暫時保留。";
      } else if (category === "GYM") {
        status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "未找到足以構成主要保留理由的道館用途；次要資料缺失不覆蓋其他結論。";
      } else if (category === "MEGA") {
        if (variant.variantKey === "MEGA") {
          status = variant.released ? "VERIFIED" : "UNRELEASED";
          provenance = variant.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = variant.released;
          summaryZhTw = variant.released
            ? "Mega 電龍已推出；只保留實際 Mega 候選，與普通、暗影及 Max 分開。"
            : "此 Mega 版本尚未推出。";
        } else if (variant.variantKey === "NORMAL" && releasedMegaForms152181.has(variant.form.id)) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = "普通電龍是已推出 Mega 的基底；只留實際要投入的少量候選。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都必須保留。";
        }
      } else if (category === "MAX_BATTLE") {
        status = variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX"
          ? "UNRELEASED"
          : "NOT_APPLICABLE";
        summaryZhTw =
          variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX"
            ? "本批沒有來源確認此 Max 版本推出；普通個體不能當作 Max 個體。"
            : "普通、暗影或 Mega 個體不等於極巨／超極巨個體。";
      } else {
        const outgoing = evolutionPairs152181.some(([from]) => from === variant.form.id);
        status = outgoing ? "VERIFIED" : "NOT_APPLICABLE";
        provenance = outgoing ? "MANUAL_CURATED" : "MANUAL_CURATED";
        summaryZhTw = outgoing
          ? "本批或既有家族的正式進化關係已結構化；是否保留仍取決於後續用途與版本。"
          : "沒有額外需要回推的本批進化用途。";
      }
      if (links.some((link) => link.category === category) && status !== "UNRELEASED") {
        provenance = "SOURCE_VERIFIED";
      }
      return {
        id: `category-${variant.id}-${category.toLowerCase()}`,
        battleVariantId: variant.id,
        category,
        status,
        provenance,
        summaryZhTw,
        materialToDecision,
        rocketRating: category === "ROCKET" ? ("DATA_UNAVAILABLE" as const) : null,
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
    });
  });
  await prisma.categoryEvaluation.createMany({ data: categoryRows });

  const categorySources = new Map<string, { categoryEvaluationId: string; sourceId: string; usageZhTw: string }>();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      categorySources.set(`category-${variant.id}-pvp|${rank.sourceId}`, {
        categoryEvaluationId: `category-${variant.id}-pvp`,
        sourceId: rank.sourceId,
        usageZhTw: "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。",
      });
    }
  }
  for (const link of officialEvidenceLinks.filter((candidate) =>
    variants.some((variant) => variant.id === candidate.variantId),
  )) {
    const categoriesForLink = new Set<Category>([link.category]);
    if (link.sourceId.startsWith("PVE-")) categoriesForLink.add("PVE");
    for (const categoryName of categoriesForLink) {
      categorySources.set(`category-${link.variantId}-${categoryName.toLowerCase()}|${link.sourceId}`, {
        categoryEvaluationId: `category-${link.variantId}-${categoryName.toLowerCase()}`,
        sourceId: link.sourceId,
        usageZhTw: "Official batch evidence.",
      });
    }
  }
  if (categorySources.size) await prisma.categoryEvaluationSource.createMany({ data: [...categorySources.values()] });

  const evaluationRows = variants.map((variant) => {
    const result = decisions.get(variant.id)!;
    const pvpUseful = result.ranks.some((rank) => rank.rank <= 250);
    return {
      id: `r18-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw:
        variant.id === "181-kanto-mega"
          ? "Mega 電龍有特殊 PvE 與 Mega boost 用途，非核心投資；先核對 Volt Switch／Zap Cannon、等級與投入。"
          : "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留用途。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "Mega 電龍已推出且與其他版本分開；只留實際投入候選。"
          : variant.form.id === "181-kanto" && variant.variantKey === "NORMAL"
            ? "普通電龍可作 Mega 基底候選；不把 Mega 用途回推成全家族必留。"
            : "此版本沒有獨立 Mega 型態用途。",
      maxBattleSummaryZhTw:
        variant.variantKey === "DYNAMAX"
          ? "本批未確認此極巨版本推出；普通個體不能替代極巨個體。"
          : "Max 用途與普通／暗影／Mega 分開評估。",
      evolutionSummaryZhTw: evolutionPairs152181.some(([from]) => from === variant.form.id)
        ? "本批進化關係已結構化；前階是否保留由後續目標用途決定。"
        : "單純存在家族關係不會自動產生大量保留理由。",
      requiredMovesSummaryZhTw: pvpUseful
        ? `依固定快照優先核對：${[...new Set(result.ranks.filter((rank) => rank.rank <= 250).flatMap((rank) => rank.moves))].join("／")}`
        : "沒有招式足以把低用途版本自動升格為必留；活動招式只作投入前條件。",
      recommendedIvStrategyZhTw:
        variant.variantKey === "SHADOW"
          ? "暗影標準較寬；15攻優先，不設硬性最低IV。"
          : variant.variantKey === "MEGA"
            ? "先看精確 Mega 版本、招式、等級與投入；15攻優先，14攻高整體IV亦可留。"
            : result.decision === "TRANSFER_CANDIDATE"
              ? "目前沒有主要用途時，不因 100% 自動產生保留理由。"
              : "依實際用途分開篩選；PvP 看同聯盟 IV Rank，PvE／Mega 先看招式與投入；15攻優先，14攻高整體IV亦可留。",
      reasonZhTw:
        result.decision === "KEEP"
          ? "目前已有明確 PvP、Mega 或其他實戰用途；保留符合版本與用途的候選。"
          : result.decision === "CONDITIONAL_KEEP"
            ? "用途有限或屬進化／版本候選；只留少量符合條件的個體。"
            : variant.released
              ? "目前缺乏明確主要 PvP、PvE、道館、Mega、Max 或後續進化理由，一般重複個體大多可傳。"
              : "此版本尚未在 Pokémon GO 推出，不把現有個體誤當成此版本候選。",
      confidence: "HIGH" as const,
      rulesVersion: RULES_VERSION,
      generatedAt: checkedAt,
      reviewed: true,
      reviewedAt: checkedAt,
      reviewStatus: "RESOLVED" as const,
      missingDataSummaryZhTw: !variant.released
        ? "此欄位不適用或版本尚未推出，不把它當成現有個體的待補資料。"
        : result.decision === "TRANSFER_CANDIDATE"
          ? "已有足夠資料判定目前無顯著用途；一般重複個體通常可傳送。"
          : "用途有限或需特定版本／進化／招式；只保留符合條件的少量候選。",
      assessmentDisposition: initialDisposition(result.decision, variant.released),
      reviewNotesZhTw: "已核對第二世代家族、寶寶併入既有家族、普通／暗影／淨化／Mega／Max 邊界與固定 PvPoke 快照。",
    };
  });
  await prisma.retentionEvaluation.createMany({ data: evaluationRows });
  await prisma.evaluationRuleTrace.createMany({
    data: variants.map((variant) => {
      const result = decisions.get(variant.id)!;
      return {
        id: `r18-trace-${variant.id}`,
        evaluationId: `r18-eval-${variant.id}`,
        ruleKey: result.decision === "KEEP" ? "MAJOR_BATTLE_VALUE" : result.decision === "CONDITIONAL_KEEP" ? "CONDITIONAL_USE" : "LOW_GENERAL_VALUE",
        ruleVersion: RULES_VERSION,
        priority: result.decision === "KEEP" ? 900 : result.decision === "CONDITIONAL_KEEP" ? 700 : 100,
        matched: true,
        resultDecision: result.decision,
        explanationZhTw: "#152～#181 批次初步評估，待共用重算流程依跨世代 family graph 再確認。",
      };
    }),
  });

  const evaluationSources = new Map<string, { evaluationId: string; sourceId: string; usageZhTw: string }>();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      evaluationSources.set(`r18-eval-${variant.id}|${rank.sourceId}`, {
        evaluationId: `r18-eval-${variant.id}`,
        sourceId: rank.sourceId,
        usageZhTw: "Open League／Overall 名次與推薦招式。",
      });
    }
    for (const link of officialEvidenceLinks.filter((candidate) => candidate.variantId === variant.id)) {
      evaluationSources.set(`r18-eval-${variant.id}|${link.sourceId}`, {
        evaluationId: `r18-eval-${variant.id}`,
        sourceId: link.sourceId,
        usageZhTw: "官方或研究來源確認此精確型態、進化或用途邊界。",
      });
    }
  }
  evaluationSources.set("r18-eval-181-kanto-mega|PVE-MEGA-AMPHAROS-20260808", {
    evaluationId: "r18-eval-181-kanto-mega",
    sourceId: "PVE-MEGA-AMPHAROS-20260808",
    usageZhTw: "GO Hub PvE tier、團體戰攻擊者排名與 Mega 分析。",
  });
  if (evaluationSources.size) await prisma.evaluationSource.createMany({ data: [...evaluationSources.values()] });

  await prisma.changeLog.createMany({
    data: [
      {
        id: "r18-batch-152-181",
        entityType: "Batch",
        entityId: "152-181",
        fieldName: "status",
        previousValue: null,
        newValue: "RESEARCHED",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "新增 #152～#181，沿用共用保留規則與逐版本資料處置。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r18-family-baby-pikachu",
        entityType: "EvolutionFamily",
        entityId: "KANTO_FAMILY_025",
        fieldName: "members",
        previousValue: "#025～#026",
        newValue: "#172→#025→#026",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "皮丘使用既有皮卡丘 familyKey 與正式進化路徑，不因跨世代圖鑑號拆家族。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r18-family-baby-clefairy",
        entityType: "EvolutionFamily",
        entityId: "KANTO_FAMILY_035",
        fieldName: "members",
        previousValue: "#035～#036",
        newValue: "#173→#035→#036",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "皮寶寶使用既有皮皮 familyKey 與正式進化路徑。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r18-family-baby-jigglypuff",
        entityType: "EvolutionFamily",
        entityId: "KANTO_FAMILY_039",
        fieldName: "members",
        previousValue: "#039～#040",
        newValue: "#174→#039→#040",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "寶寶丁使用既有胖丁 familyKey 與正式進化路徑。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r18-family-crobat",
        entityType: "EvolutionFamily",
        entityId: "KANTO_FAMILY_041",
        fieldName: "members",
        previousValue: "#041～#042＋#169 stub",
        newValue: "#041→#042→#169",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "#169 叉字蝠改為本批正式成員，移除同 ID 的 evolution stub 狀態。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
    ],
  });

  const counts = await Promise.all([
    prisma.pokemonSpecies.count({ where: { dexNumber: { gte: batchStart, lte: batchEnd } } }),
    prisma.pokemonForm.count({ where: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } } } }),
    prisma.categoryEvaluation.count({ where: { battleVariant: { pokemonForm: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } } } } }),
  ]);
  if (counts[0] !== 30 || counts[1] !== 30 || counts[2] !== 121 || counts[3] !== 847) {
    throw new Error(`本批計數錯誤：${counts.join("/")}，預期 30/30/121/847。`);
  }
  console.log(`#152～#181 匯入完成：本批 ${counts.join("/")}；raw rows ${rawRows.length}。`);
}

async function main() {
  await upsertSources();
  const rankings = await readRankings();
  await rebuildBatch(rankings);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
