import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database";
import {
  evolutionPairs182211,
  forms182211,
  pvpokeSpeciesId182211,
  releasedDynamaxForms182211,
  releasedGigantamaxForms182211,
  releasedMegaForms182211,
  releasedShadowForms182211,
  specialVariants182211,
  species182211,
  pveUseLevels182211,
  migratedStubIds182211,
  type Form182211,
} from "../src/data/batch-182-211";
import {
  ensureCrossGenerationEvolutionTargets,
  loadCrossGenerationEvolutionData,
} from "../src/data/cross-generation-evolution";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: getDatabaseUrl() }),
});

const batchStart = 182;
const batchEnd = 211;
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
  readFileSync(new URL("../research_notes/official-182-211.json", import.meta.url), "utf8"),
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
        notes: "第 #182～#211 批次來源研究表。",
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
        notes: "第 #182～#211 批次來源研究表。",
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
    return releasedShadowForms182211.has(formId);
  }
  if (variantKey === "MEGA") return releasedMegaForms182211.has(formId);
  if (variantKey === "DYNAMAX") return releasedDynamaxForms182211.has(formId);
  if (variantKey === "GIGANTAMAX") return releasedGigantamaxForms182211.has(formId);
  return false;
}

function findRanks(
  form: Form182211,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
) {
  const speciesId = pvpokeSpeciesId182211(form, variantKey === "SHADOW");
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
  if (variantKey === "DYNAMAX" || pveUseLevels182211[formId] === "CORE_INVESTMENT") {
    return "KEEP" as const;
  }
  if (pveUseLevels182211[formId]) return "CONDITIONAL_KEEP" as const;
  const best = Math.min(...ranks.map((rank) => rank.rank), Number.POSITIVE_INFINITY);
  if (best <= 100) return "KEEP" as const;
  if (best <= 250 || (variantKey === "NORMAL" && formId === "181-johto")) {
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
      id: `raw-r19-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: pvpokeSpeciesId182211(variant.form, variant.variantKey === "SHADOW"),
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
  form: Form182211;
  variantKey: VariantKey;
  released: boolean;
};

async function rebuildBatch(rankings: Map<LeagueKey, RankingRow[]>) {
  await prisma.changeLog.deleteMany({
    where: {
      id: {
        in: [
          "r19-batch-182-211",
          "r19-family-baby-pikachu",
          "r19-family-baby-clefairy",
          "r19-family-baby-jigglypuff",
          "r19-family-crobat",
        ],
      },
    },
  });
  await prisma.pokemonSpecies.deleteMany({
    where: { dexNumber: { gte: batchStart, lte: batchEnd } },
  });

  await prisma.pokemonSpecies.createMany({
    data: species182211.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 2,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms182211.map((form) => {
      const species = species182211.find((item) => item.dexNumber === form.dexNumber)!;
      return {
        id: form.id,
        speciesId: `species-${String(form.dexNumber).padStart(3, "0")}`,
        formKey: form.formKey,
        formNameEn: form.formNameEn,
        formNameZhTw: form.formNameZhTw,
        regionKey: form.regionKey,
        types: JSON.stringify(form.types),
        searchAliases: JSON.stringify([...new Set([...form.aliases, species.nameEn, species.nameZhTw])]),
        // Insert the batch before wiring self-referencing evolution rows; SQLite
        // enforces this foreign key immediately during createMany.
        evolvesFromFormId: null,
        evolutionFamilyNotesZhTw: form.evolutionFamilyNotesZhTw,
        isReleasedInPokemonGo: form.isStub ? true : true,
        releaseStatus: "RELEASED" as const,
        releaseVerifiedAt: checkedAt,
        isEvolutionStub: form.isStub ?? false,
        evolutionTargetUseLevel: null,
        evolutionTargetNotesZhTw: form.isStub
          ? "伽勒爾分支 stub；完整戰鬥資料尚未納入本批。"
          : null,
      };
    }),
  });
  for (const form of forms182211) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }

  // Create cross-generation endpoints now that this batch's source forms are
  // present.  A second pass after variants are inserted marks formal targets
  // as non-stubs again.
  await ensureCrossGenerationEvolutionTargets(prisma, checkedAt);

  // Migrate any pre-existing Kanto-named cross-generation stubs by rebuilding
  // their species/form rows in the formal JOHTO batch.  The species delete above
  // also removes their variants, evaluations, issues and old evolution paths.
  if (migratedStubIds182211.size) {
    const oldStubIds = [...migratedStubIds182211];
    await prisma.evolutionPath.deleteMany({
      where: { OR: [{ fromFormId: { in: oldStubIds } }, { toFormId: { in: oldStubIds } }] },
    });
  }
  await prisma.pokemonForm.updateMany({
    where: { id: { in: ["106-kanto", "107-kanto"] } },
    data: { evolvesFromFormId: null },
  });

  const manifestEdges = new Set(
    (await loadCrossGenerationEvolutionData()).paths.map((path) => `${path.fromFormId}->${path.toFormId}`),
  );
  await prisma.evolutionPath.createMany({
    data: evolutionPairs182211
      .filter(([fromFormId, toFormId]) => !manifestEdges.has(`${fromFormId}->${toFormId}`))
      .map(([fromFormId, toFormId]) => ({
      id: `evolution-r19-${fromFormId}-${toFormId}`,
      fromFormId,
      toFormId,
      evolutionMethodZhTw:
        fromFormId.startsWith("17") && ["025-kanto", "035-kanto", "039-kanto"].includes(toFormId)
          ? "提升友好度後消耗糖果進化"
          : "消耗糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw:
        toFormId === "199-galar"
          ? "正式伽勒爾分支；與標準城都呆呆王分開評估。"
          : "此進化路徑已在 #182～#211 整合資料中核對；批次外目標以正式 stub 保留。",
      requiresEvent: false,
      verifiedAt: checkedAt,
    })),
  });

  const variants: VariantRecord[] = [];
  for (const form of forms182211) {
    if (form.includeVariants === false || form.isStub) continue;
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: variantReleased(form.id, variantKey),
      });
    }
  }
  for (const special of specialVariants182211) {
    const form = forms182211.find((item) => item.id === special.formId)!;
    variants.push({ id: special.id, form, variantKey: special.variantKey, released: special.released });
  }
  if (species182211.length !== 30 || forms182211.length !== 31 || variants.length !== 121) {
    throw new Error(`#182～#211 靜態計數不符 30 species／31 forms（含 Galar stub）／121 variants。`);
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
  // Upsert cross-generation stubs only after this batch's source forms and
  // variants exist; otherwise a new source form would be a dangling manifest
  // endpoint and a formal target would be mistaken for a stub.
  await ensureCrossGenerationEvolutionTargets(prisma, checkedAt);

  const rankMap = new Map<string, RankResult[]>();
  for (const variant of variants) {
    rankMap.set(
      variant.id,
      variant.released && (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW")
        ? findRanks(variant.form, variant.variantKey, rankings)
        : [],
    );
  }
  const pveTier = (formId: string) =>
    pveUseLevels182211[formId] === "CORE_INVESTMENT"
      ? "A"
      : pveUseLevels182211[formId] === "USABLE_OR_BUDGET"
        ? "B"
        : pveUseLevels182211[formId] === "SPECIAL_USE"
          ? "SPECIAL"
          : null;
  const rawRows = [
    ...pvpSourceRows(variants, rankMap),
    ...variants.flatMap((variant) => {
      const tier =
        variant.variantKey === "MEGA"
          ? "SPECIAL"
          : ["NORMAL", "SHADOW"].includes(variant.variantKey)
            ? pveTier(variant.form.id)
            : null;
      if (!tier) return [];
      return [
        {
          id: `raw-r19-${variant.id}-pve`,
          battleVariantId: variant.id,
          category: "PVE" as const,
          status: "PARTIALLY_VERIFIED" as const,
          league: "NOT_APPLICABLE" as const,
          cup: null,
          pvpCategory: null,
          speciesKey: pvpokeSpeciesId182211(variant.form, variant.variantKey === "SHADOW"),
          formKey: variant.form.id,
          variantKey: variant.variantKey,
          rank: null,
          rating: tier,
          recommendedMoves: JSON.stringify([]),
          tier,
          rawNotes: "本批 PvE 類別用途層級由研究表與 GO Hub Johto 版本狀態核對；不虛構 IV 硬門檻。",
          seasonOrVersion: "GO Hub accessed 2026-08-08",
          extractionMethod: "研究表中的用途層級與來源頁面發布狀態",
          reproducible: false,
          sourceId: "PVE-GEN2-20260808",
          checkedAt,
        },
      ];
    }),
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
        } else if (variant.variantKey === "MEGA" || pveUseLevels182211[variant.form.id]) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          pveUseLevel = variant.variantKey === "MEGA" ? "SPECIAL_USE" : pveUseLevels182211[variant.form.id]!;
          summaryZhTw = "本批 PvE 用途依研究表與來源頁面分成核心投資、可用／預算型、特殊用途或無顯著用途；不把缺少精確斷點誤當成整個家族待判斷。";
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
            ? `${variant.form.formNameZhTw} ${variant.form.dexNumber} 的 Mega 已推出；只保留實際 Mega 候選，與普通、暗影及 Max 分開。`
            : "此 Mega 版本尚未推出。";
        } else if (variant.variantKey === "NORMAL" && releasedMegaForms182211.has(variant.form.id)) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = "此普通型態是已推出 Mega 的基底；只留實際要投入的少量候選。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都必須保留。";
        }
      } else if (category === "MAX_BATTLE") {
        const isMaxVariant = variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX";
        const hasReleasedMax = releasedDynamaxForms182211.has(variant.form.id) || releasedGigantamaxForms182211.has(variant.form.id);
        if (isMaxVariant) {
          status = variant.released ? "VERIFIED" : "UNRELEASED";
          provenance = variant.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = variant.released;
        } else if (variant.variantKey === "NORMAL" && hasReleasedMax) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
        } else {
          status = "NOT_APPLICABLE";
        }
        summaryZhTw = isMaxVariant
          ? variant.released
            ? "此 Max 版本已由來源核對為已推出；與普通／暗影版本分開保留。"
            : "此 Max 版本尚未推出。"
          : hasReleasedMax
            ? "此普通型態是已推出 Max 的基底；只保留實際要投入的少量候選。"
            : "普通、暗影或 Mega 個體不等於極巨／超極巨個體。";
      } else {
        const outgoing = evolutionPairs182211.some(([from]) => from === variant.form.id);
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
    const linkedVariant = variants.find((variant) => variant.id === link.variantId);
    if (
      linkedVariant?.variantKey === "NORMAL" &&
      releasedMegaForms182211.has(linkedVariant.form.id) &&
      link.sourceId.startsWith("PVE-")
    ) {
      categoriesForLink.add("MEGA");
    }
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
      id: `r19-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "Mega 電龍有特殊 PvE 與 Mega boost 用途，非核心投資；先核對 Volt Switch／Zap Cannon、等級與投入。"
          : "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留用途。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "Mega 電龍已推出且與其他版本分開；只留實際投入候選。"
          : releasedMegaForms182211.has(variant.form.id) && variant.variantKey === "NORMAL"
            ? "普通電龍可作 Mega 基底候選；不把 Mega 用途回推成全家族必留。"
            : "此版本沒有獨立 Mega 型態用途。",
      maxBattleSummaryZhTw:
        variant.variantKey === "DYNAMAX"
          ? "本批未確認此極巨版本推出；普通個體不能替代極巨個體。"
          : "Max 用途與普通／暗影／Mega 分開評估。",
      evolutionSummaryZhTw: evolutionPairs182211.some(([from]) => from === variant.form.id)
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
        id: `r19-trace-${variant.id}`,
        evaluationId: `r19-eval-${variant.id}`,
        ruleKey: result.decision === "KEEP" ? "MAJOR_BATTLE_VALUE" : result.decision === "CONDITIONAL_KEEP" ? "CONDITIONAL_USE" : "LOW_GENERAL_VALUE",
        ruleVersion: RULES_VERSION,
        priority: result.decision === "KEEP" ? 900 : result.decision === "CONDITIONAL_KEEP" ? 700 : 100,
        matched: true,
        resultDecision: result.decision,
        explanationZhTw: "#182～#211 批次初步評估，待共用重算流程依跨世代 family graph 再確認。",
      };
    }),
  });

  const evaluationSources = new Map<string, { evaluationId: string; sourceId: string; usageZhTw: string }>();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      evaluationSources.set(`r19-eval-${variant.id}|${rank.sourceId}`, {
        evaluationId: `r19-eval-${variant.id}`,
        sourceId: rank.sourceId,
        usageZhTw: "Open League／Overall 名次與推薦招式。",
      });
    }
    for (const link of officialEvidenceLinks.filter((candidate) => candidate.variantId === variant.id)) {
      evaluationSources.set(`r19-eval-${variant.id}|${link.sourceId}`, {
        evaluationId: `r19-eval-${variant.id}`,
        sourceId: link.sourceId,
        usageZhTw: "官方或研究來源確認此精確型態、進化或用途邊界。",
      });
    }
  }
  if (evaluationSources.size) await prisma.evaluationSource.createMany({ data: [...evaluationSources.values()] });

  await prisma.changeLog.createMany({
    data: [
      {
        id: "r19-batch-182-211",
        entityType: "Batch",
        entityId: "182-211",
        fieldName: "status",
        previousValue: null,
        newValue: "RESEARCHED",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "新增 #182～#211，沿用共用保留規則與逐版本資料處置。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r19-family-baby-pikachu",
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
        id: "r19-family-baby-clefairy",
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
        id: "r19-family-baby-jigglypuff",
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
        id: "r19-family-crobat",
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
  if (counts[0] !== 30 || counts[1] !== 31 || counts[2] !== 121 || counts[3] !== 847) {
    throw new Error(`本批計數錯誤：${counts.join("/")}，預期 30/31/121/847。`);
  }
  console.log(`#182～#211 匯入完成：本批 ${counts.join("/")}；raw rows ${rawRows.length}。`);
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
