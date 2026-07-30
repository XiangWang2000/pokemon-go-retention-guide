import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import {
  evolutionPairs031060,
  forms031060,
  pvpokeSpeciesId031060,
  releasedShadowForms031060,
  species031060,
  truncatedForms031060,
  type Form031060,
} from "../src/data/batch-031-060";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const checkedAt = new Date("2026-07-30T16:00:00+08:00");
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
const leagues = [
  { key: "GREAT", cp: 1500, sourceId: "pvpoke-gl-20260715", label: "GL（超級聯盟）" },
  { key: "ULTRA", cp: 2500, sourceId: "pvpoke-ul-20260715", label: "UL（高級聯盟）" },
  { key: "MASTER", cp: 10000, sourceId: "pvpoke-ml-20260715", label: "ML（大師聯盟）" },
] as const;

type LeagueKey = (typeof leagues)[number]["key"];
type VariantKey = "NORMAL" | "SHADOW" | "PURIFIED" | "DYNAMAX" | "GIGANTAMAX";
type Decision = "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE";
type RankingRow = {
  speciesId: string;
  speciesName: string;
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

const officialEvidenceLinks: Array<{
  sourceId: string;
  variantId: string;
  category?: (typeof categories)[number];
  usageZhTw: string;
}> = [
  {
    sourceId: "OFF-GMAX-MEOWTH-2026",
    variantId: "052-kanto-gigantamax",
    category: "MAX_BATTLE",
    usageZhTw: "確認超極巨喵喵已開放、屬於獨立 Max 版本，且不能進化。",
  },
  {
    sourceId: "OFF-CD-VULPIX-2026",
    variantId: "037-kanto-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認關都六尾分支與進化為九尾的活動條件。",
  },
  {
    sourceId: "OFF-CD-VULPIX-2026",
    variantId: "037-alola-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認阿羅拉六尾是獨立地區分支，進化為阿羅拉九尾。",
  },
  {
    sourceId: "OFF-CD-VULPIX-2026",
    variantId: "038-kanto-normal",
    category: "PVP",
    usageZhTw: "確認九尾可取得活動招式能量球，供 PvP 招式檢查與保留結論使用。",
  },
  {
    sourceId: "OFF-CD-VULPIX-2026",
    variantId: "038-alola-normal",
    category: "PVP",
    usageZhTw: "確認阿羅拉九尾可取得活動招式冰凍水，供 PvP 招式檢查與保留結論使用。",
  },
  {
    sourceId: "OFF-RISING-SHADOWS-2023",
    variantId: "060-kanto-shadow",
    usageZhTw: "確認暗影蚊香蝌蚪曾正式開放，支援暗影版本與保留安全判斷。",
  },
  {
    sourceId: "OFF-AUTUMN-SHADOWS-2020",
    variantId: "050-kanto-shadow",
    usageZhTw: "確認暗影地鼠曾正式開放，支援暗影版本與保留安全判斷。",
  },
  {
    sourceId: "OFF-AUTUMN-SHADOWS-2020",
    variantId: "058-kanto-shadow",
    usageZhTw: "確認暗影卡蒂狗曾正式開放，支援暗影版本與保留安全判斷。",
  },
  {
    sourceId: "OFF-CD-POLIWAG-2023",
    variantId: "060-kanto-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認蚊香蝌蚪後續包含蚊香泳士與蚊香蛙皇分支，支援暫時保留結論。",
  },
];

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
        notes:
          "Open League／Overall 固定 commit 完整 JSON；名次以陣列索引加一重現，不使用搜尋摘要。",
      },
    });
  }
  return result;
}

function findRanks(
  form: Form031060,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
): RankResult[] {
  const speciesId = pvpokeSpeciesId031060(form, variantKey === "SHADOW");
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

async function upsertOfficialSources() {
  const sources = [
    {
      id: "OFF-GMAX-MEOWTH-2026",
      sourceUrl: "https://pokemongo.com/news/gigantamax-meowth-max-battle-day-2026?hl=en",
      title: "Gigantamax Meowth Max Battle Day",
      summary: "確認超極巨喵喵於 2026 年登場，且超極巨個體不能進化。",
      publishedAt: new Date("2026-02-02T00:00:00Z"),
    },
    {
      id: "OFF-CD-VULPIX-2026",
      sourceUrl: "https://pokemongo.com/en/news/202601_communityday-february-2026-vulpix",
      title: "February 2026 Community Day: Vulpix",
      summary: "確認六尾與阿羅拉六尾兩條分支，以及九尾的能量球、阿羅拉九尾的冰凍水招式來源。",
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      id: "OFF-RISING-SHADOWS-2023",
      sourceUrl: "https://pokemongo.com/en/post/rising-shadows",
      title: "Rising Shadows",
      summary: "確認暗影蚊香蝌蚪等火箭隊版本曾正式開放。",
      publishedAt: new Date("2023-05-19T00:00:00Z"),
    },
    {
      id: "OFF-AUTUMN-SHADOWS-2020",
      sourceUrl: "https://pokemongo.com/post/autumn-event-2020-strange-eggs?hl=en",
      title: "Strange Eggs and Team GO Rocket",
      summary: "確認暗影地鼠與暗影卡蒂狗等版本曾正式開放。",
      publishedAt: new Date("2020-10-12T00:00:00Z"),
    },
    {
      id: "OFF-CD-POLIWAG-2023",
      sourceUrl: "https://pokemongo.com/en/post/communityday-july-2023-poliwag?hl=en",
      title: "July 2023 Community Day: Poliwag",
      summary: "確認蚊香蝌蚪可進化為蚊香君，之後分支為蚊香泳士與蚊香蛙皇。",
      publishedAt: new Date("2023-07-11T00:00:00Z"),
    },
  ];
  for (const source of sources) {
    await prisma.sourceReference.upsert({
      where: { id: source.id },
      create: {
        id: source.id,
        sourceName: "Pokémon GO",
        sourceUrl: source.sourceUrl,
        sourceType: "OFFICIAL",
        sourceTitleOriginal: source.title,
        sourceLanguage: "en",
        sourceSummaryZhTw: source.summary,
        accessedAt: checkedAt,
        publishedAt: source.publishedAt,
        dataVersion: "accessed-2026-07-30",
        notes: "第 #031～#060 批次的官方版本、進化與招式證據。",
      },
      update: {
        sourceSummaryZhTw: source.summary,
        accessedAt: checkedAt,
        publishedAt: source.publishedAt,
        dataVersion: "accessed-2026-07-30",
        notes: "第 #031～#060 批次的官方版本、進化與招式證據。",
      },
    });
  }
}

function variantRelease(formId: string, variantKey: VariantKey) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms031060.has(formId);
  }
  if (variantKey === "GIGANTAMAX") return formId === "052-kanto";
  return false;
}

function isTruncatedComponent(formId: string) {
  if (["041-kanto", "042-kanto"].includes(formId)) return true;
  if (["043-kanto", "044-kanto", "045-kanto"].includes(formId)) return true;
  if (formId === "052-galar") return true;
  if (["056-kanto", "057-kanto"].includes(formId)) return true;
  if (formId === "060-kanto") return true;
  return truncatedForms031060.has(formId);
}

function rankSummary(ranks: RankResult[]) {
  if (!ranks.length) return "PvPoke Open League／Overall 快照未列入可重現名次。";
  return ranks
    .map(
      (item) =>
        `${item.leagueLabel} Overall #${item.rank}${
          item.moves.length ? `；招式 ${item.moves.join("／")}` : ""
        }`,
    )
    .join("；");
}

function hasDescendantTarget(
  formId: string,
  variantKey: "NORMAL" | "SHADOW",
  rankMap: Map<string, RankResult[]>,
) {
  const edges = new Map<string, string[]>();
  for (const [from, to] of evolutionPairs031060) {
    const children = edges.get(from) ?? [];
    children.push(to);
    edges.set(from, children);
  }
  const queue = [...(edges.get(formId) ?? [])];
  const seen = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    if ((rankMap.get(`${id}-${variantKey.toLowerCase()}`) ?? []).some((item) => item.rank <= 250)) {
      return true;
    }
    queue.push(...(edges.get(id) ?? []));
  }
  return false;
}

function decisionFor(input: {
  form: Form031060;
  variantKey: VariantKey;
  ranks: RankResult[];
  released: boolean;
  rankMap: Map<string, RankResult[]>;
}): { decision: Decision; ruleKey: string; reason: string } {
  const { form, variantKey, ranks, released, rankMap } = input;
  if (!released) {
    return {
      decision: "TRANSFER_CANDIDATE",
      ruleKey: "UNRELEASED_VARIANT",
      reason: "此版本尚未在 Pokémon GO 開放，不應把普通個體誤當成此版本候選。",
    };
  }
  if (variantKey === "GIGANTAMAX") {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "MAJOR_BATTLE_VALUE",
      reason: "超極巨喵喵是獨立 Max 版本，至少保留一隻；普通與極巨喵喵不能替代。",
    };
  }
  if (variantKey === "PURIFIED") {
    return {
      decision: "TRANSFER_CANDIDATE",
      ruleKey: "NO_MAJOR_USE",
      reason: "淨化沒有獨立榜單，且淨化不可逆；不因低總 IV 自動建議淨化。",
    };
  }
  if (isTruncatedComponent(form.id)) {
    return {
      decision: "HOLD_FOR_NOW",
      ruleKey: "INCOMPLETE_EVOLUTION_FAMILY",
      reason: "範圍外進化可能影響保留安全；完整家族補齊前先留一隻最佳候選。",
    };
  }
  const bestRank = Math.min(...ranks.map((item) => item.rank), Number.POSITIVE_INFINITY);
  if (bestRank <= 100) {
    return {
      decision: "KEEP",
      ruleKey: "MAJOR_BATTLE_VALUE",
      reason: "Open League／Overall 可重現名次進入前 100，保留符合聯盟 IV 的候選。",
    };
  }
  if (bestRank <= 250) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "CONDITIONAL_USE",
      reason: "Open League／Overall 可重現名次介於 101～250，只留少量符合聯盟 IV 的候選。",
    };
  }
  if (
    (variantKey === "NORMAL" || variantKey === "SHADOW") &&
    hasDescendantTarget(form.id, variantKey, rankMap)
  ) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "VALUABLE_EVOLUTION",
      reason: "本體沒有獨立主要用途，僅作符合條件的進化候選。",
    };
  }
  return {
    decision: "TRANSFER_CANDIDATE",
    ruleKey: "NO_MAJOR_USE",
    reason: "缺乏明確 PvP、PvE、道館、Mega 或 Max 主要用途，普通重複個體大多可傳。",
  };
}

function ivStrategy(variantKey: VariantKey, ranks: RankResult[], decision: Decision) {
  const usefulRanks = ranks.filter((item) => item.rank <= 250);
  if (decision === "HOLD_FOR_NOW") {
    return "先依最終進化可能用途留一隻最佳候選；資料補齊前不以單一 IV 門檻淘汰。";
  }
  if (variantKey === "SHADOW") {
    if (usefulRanks.some((item) => item.league === "GREAT" || item.league === "ULTRA")) {
      return "PvP 依同聯盟 IV Rank 比較；暗影取得成本高，先留用途候選再篩選。";
    }
    return "暗影標準較寬；15攻優先，不設硬性最低IV。";
  }
  if (usefulRanks.some((item) => item.league === "GREAT" || item.league === "ULTRA")) {
    return "依同聯盟 IV Rank 比較同物種、同型態候選；Rank≤100優先，101～250選擇性保留。";
  }
  if (usefulRanks.some((item) => item.league === "MASTER")) {
    return "15攻優先；14攻高整體IV亦可留。沒有可靠斷點時，不宣稱15/10/10一定優於14/15/15。";
  }
  if (variantKey === "GIGANTAMAX") {
    return "Max 用途先看版本、招式、等級與既有投入，再以 IV 比較同版本候選。";
  }
  return "100%僅可作收藏比較，不會把低實戰價值物種自動升格為必留。";
}

async function rebuildBatch(rankings: Map<LeagueKey, RankingRow[]>) {
  const oldBatchForms = await prisma.pokemonForm.findMany({
    where: { species: { dexNumber: { gte: 31, lte: 60 } } },
    select: { id: true },
  });
  const oldBatchFormIds = oldBatchForms.map((item) => item.id);
  if (oldBatchFormIds.length) {
    await prisma.pokemonSpecies.deleteMany({ where: { dexNumber: { gte: 31, lte: 60 } } });
  }
  await prisma.retentionEvaluation.deleteMany({ where: { id: { startsWith: "r8-cross-" } } });
  await prisma.changeLog.deleteMany({ where: { id: { startsWith: "r8-" } } });

  await prisma.pokemonSpecies.createMany({
    data: species031060.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 1,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms031060.map((form) => {
      const species = species031060.find((item) => item.dexNumber === form.dexNumber)!;
      return {
        id: form.id,
        speciesId: `species-${String(form.dexNumber).padStart(3, "0")}`,
        formKey: form.formKey,
        formNameEn: form.formNameEn,
        formNameZhTw: form.formNameZhTw,
        regionKey: form.regionKey,
        types: JSON.stringify(form.types),
        searchAliases: JSON.stringify([
          ...new Set([...form.aliases, species.nameEn, species.nameZhTw]),
        ]),
        evolutionFamilyNotesZhTw: form.evolutionFamilyNotesZhTw,
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED",
        releaseVerifiedAt: checkedAt,
      };
    }),
  });
  for (const form of forms031060) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }
  await prisma.pokemonForm.update({
    where: { id: "030-kanto" },
    data: {
      evolutionFamilyNotesZhTw: "已與 #031 尼多后整合為完整尼多蘭♀進化家族。",
    },
  });
  await prisma.pokemonForm.update({
    where: { id: "029-kanto" },
    data: {
      evolutionFamilyNotesZhTw: "已與 #030 尼多娜、#031 尼多后整合為完整進化家族。",
    },
  });

  await prisma.evolutionPath.createMany({
    data: evolutionPairs031060.map(([from, to]) => ({
      id: `evolution-${from}-${to}`,
      fromFormId: from,
      toFormId: to,
      evolutionMethodZhTw: "糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw: "此路徑已在 #001～#060 整合資料中核對。",
      requiresEvent: false,
      verifiedAt: checkedAt,
    })),
  });

  const variants: Array<{
    id: string;
    form: Form031060;
    variantKey: VariantKey;
    released: boolean;
  }> = [];
  for (const form of forms031060) {
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: variantRelease(form.id, variantKey),
      });
    }
  }
  variants.push({
    id: "052-kanto-gigantamax",
    form: forms031060.find((form) => form.id === "052-kanto")!,
    variantKey: "GIGANTAMAX",
    released: true,
  });

  await prisma.battleVariant.createMany({
    data: variants.map(({ id, form, variantKey, released }) => ({
      id,
      pokemonFormId: form.id,
      variantKey,
      isReleased: released,
      releaseStatus: released ? "RELEASED" : "UNRELEASED",
      releaseVerifiedAt: checkedAt,
      notesZhTw:
        variantKey === "GIGANTAMAX"
          ? "超極巨喵喵是獨立版本，不能進化；不得與普通或極巨喵喵混為一談。"
          : variantKey === "DYNAMAX"
            ? "普通個體不等於極巨個體；本批官方開放矩陣未確認此極巨版本。"
            : variantKey === "SHADOW"
              ? "暗影個體使用較寬鬆的獨立 IV 規則；不要因低總 IV 自動淨化。"
              : variantKey === "PURIFIED"
                ? "淨化不可逆；Purified 沒有獨立榜單，不因淨化本身升格為必留。"
                : "普通版本；與暗影、淨化、極巨及超極巨分開評估。",
      inheritsFromVariantId: variantKey === "PURIFIED" && released ? `${form.id}-normal` : null,
      inheritanceMode: variantKey === "PURIFIED" && released ? "NORMAL_BASE" : "NONE",
      purificationCostModifier: variantKey === "PURIFIED" && released ? 0.9 : null,
      hasReturnAccess: variantKey === "PURIFIED" && released,
      purificationRiskZhTw:
        variantKey === "PURIFIED" && released
          ? "淨化不可逆；低總 IV 不構成淨化理由，先確認暗影用途與招式。"
          : "",
      purifiedOverrideRequired: false,
    })),
  });

  const rankMap = new Map<string, RankResult[]>();
  for (const variant of variants) {
    const ranks =
      variant.released && (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW")
        ? findRanks(variant.form, variant.variantKey, rankings)
        : [];
    rankMap.set(variant.id, ranks);
  }

  const rawRows = variants.flatMap((variant) =>
    (rankMap.get(variant.id) ?? []).map((rank) => ({
      id: `raw-r8-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: pvpokeSpeciesId031060(variant.form, variant.variantKey === "SHADOW"),
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
  if (rawRows.length) await prisma.rawEvaluationData.createMany({ data: rawRows });

  const decisions = new Map<
    string,
    ReturnType<typeof decisionFor> & { ranks: RankResult[]; released: boolean }
  >();
  for (const variant of variants) {
    const ranks = rankMap.get(variant.id) ?? [];
    decisions.set(variant.id, {
      ...decisionFor({
        form: variant.form,
        variantKey: variant.variantKey,
        ranks,
        released: variant.released,
        rankMap,
      }),
      ranks,
      released: variant.released,
    });
  }

  const categoryRows = variants.flatMap((variant) => {
    const result = decisions.get(variant.id)!;
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
      let maxOverallRating: string | null = null;
      let maxInvestmentRating: string | null = null;
      let maxUseCaseBreadth: string | null = null;
      if (category === "PVP") {
        if (!variant.released || ["DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (result.ranks.length) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = rankSummary(result.ranks);
          materialToDecision = result.ranks.some((item) => item.rank <= 250);
        } else if (variant.variantKey === "PURIFIED") {
          status = "NOT_APPLICABLE";
          summaryZhTw = "Purified 沒有獨立 Open League 榜單，不以此缺項觸發暫時保留。";
        } else {
          status = "UNRANKED";
          summaryZhTw = "固定 PvPoke Open／Overall 快照未列入可重現名次。";
        }
      } else if (category === "PVE") {
        if (!variant.released || ["DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          summaryZhTw =
            "未列為本批主要 PvE 投資目標；缺少精確斷點資料時不虛構 15/10/10 與 14/15/15 的勝負。";
        }
      } else if (category === "ROCKET") {
        status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "火箭隊沒有統一排名；此缺項不會單獨觸發暫時保留。";
      } else if (category === "GYM") {
        status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "未找到足以構成主要保留理由的道館用途；次要資料缺失不覆蓋清包結論。";
      } else if (category === "MEGA") {
        status = "NOT_APPLICABLE";
        summaryZhTw = "#031～#060 本批沒有已確認的 Mega 版本保留目標。";
      } else if (category === "MAX_BATTLE") {
        if (variant.variantKey === "GIGANTAMAX") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw =
            "超極巨喵喵已開放；版本稀有且不可由普通或極巨喵喵替代，但整體投資價值與屬性內排名分開評估。";
          materialToDecision = true;
          maxOverallRating = "MEDIUM";
          maxInvestmentRating = "LOW";
          maxUseCaseBreadth = "NARROW";
        } else if (variant.variantKey === "DYNAMAX") {
          status = "UNRELEASED";
          summaryZhTw = "本批官方開放矩陣未確認此極巨版本；普通個體不能當成極巨候選。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "普通、暗影或淨化個體不等於極巨／超極巨個體。";
        }
      } else {
        if (isTruncatedComponent(variant.form.id)) {
          status = "PARTIALLY_VERIFIED";
          summaryZhTw = "家族仍有本批範圍外進化；此缺口可能影響誤傳，因此先保留少量候選。";
          materialToDecision = true;
        } else {
          status = "VERIFIED";
          summaryZhTw = variant.form.evolvesFromFormId
            ? "本批內進化關係已結構化，前階是否保留仍取決於末階用途。"
            : "單純存在進化路徑不會自動產生選擇性保留。";
        }
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
        maxOverallRating,
        maxInvestmentRating,
        maxUseCaseBreadth,
        checkedAt,
      };
    });
  });
  await prisma.categoryEvaluation.createMany({ data: categoryRows });

  const categorySources = variants.flatMap((variant) => {
    const rows = rankMap.get(variant.id) ?? [];
    return [...new Set(rows.map((item) => item.sourceId))].map((sourceId) => ({
      categoryEvaluationId: `category-${variant.id}-pvp`,
      sourceId,
      usageZhTw: "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。",
    }));
  });
  categorySources.push(
    ...officialEvidenceLinks.flatMap((link) =>
      link.category
        ? [
            {
              categoryEvaluationId: `category-${link.variantId}-${link.category.toLowerCase()}`,
              sourceId: link.sourceId,
              usageZhTw: link.usageZhTw,
            },
          ]
        : [],
    ),
  );
  if (categorySources.length) {
    await prisma.categoryEvaluationSource.createMany({ data: categorySources });
  }

  const evaluationRows = variants.map((variant) => {
    const result = decisions.get(variant.id)!;
    const pvpUseful = result.ranks.some((item) => item.rank <= 250);
    const evolutionText = isTruncatedComponent(variant.form.id)
      ? "仍有本批範圍外進化；完整家族補齊前先留一隻最佳候選。"
      : hasDescendantTarget(
            variant.form.id,
            variant.variantKey === "SHADOW" ? "SHADOW" : "NORMAL",
            rankMap,
          )
        ? "前階主要作符合條件的進化候選，本體不因此取得獨立用途。"
        : variant.form.evolvesFromFormId
          ? "此分支目前為已納入成員；是否保留由本體用途決定。"
          : "單純存在進化路徑不會自動產生保留理由。";
    return {
      id: `r8-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw:
        "本批未找到足以列為主要 PvE 投資目標的證據；先看物種、型態、招式、等級與投入，最後才用 IV 比同種候選。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有排行不會單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留目標。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw: "本批沒有已確認的 Mega 版本；家族不因假設 Mega 而整體升格。",
      maxBattleSummaryZhTw:
        variant.variantKey === "GIGANTAMAX"
          ? "超極巨喵喵已開放且不能進化；只保留真正的超極巨版本，普通與極巨版本不能替代。"
          : variant.variantKey === "DYNAMAX"
            ? "此極巨版本未確認開放；普通個體不等於極巨個體。"
            : "此版本不是 Max 版本；Max 用途不會回推普通個體必留。",
      evolutionSummaryZhTw: evolutionText,
      requiredMovesSummaryZhTw: pvpUseful
        ? `依固定快照優先核對：${[
            ...new Set(
              result.ranks.filter((item) => item.rank <= 250).flatMap((item) => item.moves),
            ),
          ].join("／")}`
        : "沒有招式足以把此低用途版本自動升格為必留。",
      recommendedIvStrategyZhTw: ivStrategy(variant.variantKey, result.ranks, result.decision),
      reasonZhTw: result.reason,
      confidence: result.decision === "HOLD_FOR_NOW" ? ("MEDIUM" as const) : ("HIGH" as const),
      rulesVersion: RULES_VERSION,
      generatedAt: checkedAt,
      reviewed: true,
      reviewedAt: checkedAt,
      reviewStatus:
        result.decision === "HOLD_FOR_NOW" ? ("DATA_PENDING" as const) : ("RESOLVED" as const),
      missingDataSummaryZhTw:
        result.decision === "HOLD_FOR_NOW"
          ? "範圍外進化成員尚未進入本批；此缺口可能造成重要候選被誤傳。"
          : "次要資料缺失不影響目前可執行結論。",
      reviewNotesZhTw:
        "已人工檢查型態、區域分支、普通／暗影／淨化／極巨／超極巨邊界及可重現 PvP 名次。",
    };
  });
  await prisma.retentionEvaluation.createMany({ data: evaluationRows });
  await prisma.evaluationRuleTrace.createMany({
    data: variants.map((variant) => {
      const result = decisions.get(variant.id)!;
      return {
        id: `r8-trace-${variant.id}`,
        evaluationId: `r8-eval-${variant.id}`,
        ruleKey: result.ruleKey,
        ruleVersion: RULES_VERSION,
        priority: 100,
        matched: true,
        resultDecision: result.decision,
        explanationZhTw: result.reason,
      };
    }),
  });

  const evaluationSources = variants.flatMap((variant) => {
    const rows = rankMap.get(variant.id) ?? [];
    const links = [...new Set(rows.map((item) => item.sourceId))].map((sourceId) => ({
      evaluationId: `r8-eval-${variant.id}`,
      sourceId,
      usageZhTw: "Open League／Overall 名次與招式。",
    }));
    links.push(
      ...officialEvidenceLinks
        .filter((link) => link.variantId === variant.id)
        .map((link) => ({
          evaluationId: `r8-eval-${variant.id}`,
          sourceId: link.sourceId,
          usageZhTw: link.usageZhTw,
        })),
    );
    return links;
  });
  if (evaluationSources.length) {
    await prisma.evaluationSource.createMany({ data: evaluationSources });
  }

  const holdVariants = variants.filter(
    (variant) => decisions.get(variant.id)?.decision === "HOLD_FOR_NOW",
  );
  if (holdVariants.length) {
    await prisma.dataIssue.createMany({
      data: holdVariants.map((variant) => ({
        id: `r8-issue-${variant.id}`,
        pokemonFormId: variant.form.id,
        battleVariantId: variant.id,
        issueType: "RULE_NOT_COVERED",
        status: "OPEN",
        batchKey: "031-060",
        messageZhTw: "此進化家族仍有 #031～#060 範圍外成員，可能影響安全傳送結論。",
        affectsFinalDecision: true,
        provisionalDecision: "HOLD_FOR_NOW",
        suggestedActionZhTw: "先保留一隻最佳候選，不需保留全部普通重複。",
        suggestedResearchActionZhTw: "在包含範圍外末階的後續批次完成家族整合。",
        lastResearchedAt: checkedAt,
        detectedAt: checkedAt,
      })),
    });
  }
}

async function refreshCrossBatchNidoranFamily() {
  const crossVariants = await prisma.battleVariant.findMany({
    where: { pokemonFormId: { in: ["029-kanto", "030-kanto"] } },
  });
  for (const variant of crossVariants) {
    const eligible = variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW";
    const released = variant.releaseStatus === "RELEASED";
    const decision: Decision =
      eligible && released
        ? "CONDITIONAL_KEEP"
        : variant.releaseStatus === "UNRELEASED"
          ? "TRANSFER_CANDIDATE"
          : "TRANSFER_CANDIDATE";
    const ruleKey = eligible && released ? "VALUABLE_EVOLUTION" : "NO_MAJOR_USE";
    await prisma.retentionEvaluation.create({
      data: {
        id: `r8-cross-${variant.id}`,
        battleVariantId: variant.id,
        finalDecision: decision,
        provenance: "MANUAL_CURATED",
        pvpSummaryZhTw: "前階本體未列為本批主要 Open League 目標。",
        pveSummaryZhTw: "前階本體未列為主要 PvE 投資目標。",
        rocketSummaryZhTw: "火箭隊缺少統一排名不會觸發暫時保留。",
        gymSummaryZhTw: "未列為主要道館用途。",
        gymRating: "NOT_APPLICABLE",
        megaSummaryZhTw: "此家族沒有已確認 Mega 版本。",
        maxBattleSummaryZhTw: "普通個體與未開放的極巨版本分開。",
        evolutionSummaryZhTw: "已與 #031 尼多后整合；前階主要作符合條件的尼多后進化候選。",
        requiredMovesSummaryZhTw: "進化後再依尼多后用途核對招式。",
        recommendedIvStrategyZhTw:
          variant.variantKey === "SHADOW"
            ? "先保留少量優質暗影進化候選；暗影不設硬性最低 IV。"
            : "依尼多后 GL／UL 候選的聯盟 IV Rank 比較，不因可進化而保留全部。",
        reasonZhTw: eligible
          ? "只留符合尼多后 PvP 用途的進化候選；其餘普通重複可傳。"
          : "此版本沒有獨立保留理由，亦不因家族有用途而自動升格。",
        confidence: "HIGH",
        rulesVersion: RULES_VERSION,
        generatedAt: checkedAt,
        reviewed: true,
        reviewedAt: checkedAt,
        reviewStatus: "RESOLVED",
        missingDataSummaryZhTw: "跨批次家族已整合完成。",
        reviewNotesZhTw: "#029、#030、#031 已使用同一 familyKey 與連續進化路徑。",
        ruleTraces: {
          create: {
            id: `r8-cross-trace-${variant.id}`,
            ruleKey,
            ruleVersion: RULES_VERSION,
            priority: 100,
            matched: true,
            resultDecision: decision,
            explanationZhTw: eligible
              ? "僅作尼多后進化候選，不把前階誤標為獨立用途。"
              : "家族用途不會自動套用到此版本。",
          },
        },
      },
    });
  }
}

async function addChangeLogs() {
  const changes = [
    {
      id: "r8-batch-031-060",
      entityType: "Batch",
      entityId: "031-060",
      fieldName: "status",
      previousValue: null,
      newValue: "REVIEWED",
      sourceId: null,
      reason: "新增 #031～#060，套用與前批一致的立即處理結論、用途、IV 與版本分層。",
    },
    {
      id: "r8-cross-family-029",
      entityType: "EvolutionFamily",
      entityId: "KANTO_FAMILY_029",
      fieldName: "members",
      previousValue: "#029-#030",
      newValue: "#029-#031",
      sourceId: null,
      reason: "將 #031 尼多后接回前批尼多蘭♀家族，移除範圍外提示與互相矛盾建議。",
    },
    {
      id: "r8-gmax-meowth",
      entityType: "BattleVariant",
      entityId: "052-kanto-gigantamax",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-GMAX-MEOWTH-2026",
      reason: "普通、極巨與超極巨喵喵分開；超極巨個體不能進化。",
    },
  ];
  for (const change of changes) {
    await prisma.changeLog.create({
      data: {
        id: change.id,
        entityType: change.entityType,
        entityId: change.entityId,
        fieldName: change.fieldName,
        previousValue: change.previousValue,
        newValue: change.newValue,
        sourceId: change.sourceId,
        changeReasonZhTw: change.reason,
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
    });
  }
}

async function main() {
  await upsertOfficialSources();
  const rankings = await readRankings();
  await rebuildBatch(rankings);
  await refreshCrossBatchNidoranFamily();
  await addChangeLogs();
  const counts = await Promise.all([
    prisma.pokemonSpecies.count(),
    prisma.pokemonForm.count(),
    prisma.battleVariant.count(),
    prisma.categoryEvaluation.count(),
    prisma.rawEvaluationData.count(),
  ]);
  console.log(
    `#031～#060 匯入完成：${counts[0]} species、${counts[1]} forms、${counts[2]} variants、${counts[3]} category evaluations、${counts[4]} raw rows。`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
