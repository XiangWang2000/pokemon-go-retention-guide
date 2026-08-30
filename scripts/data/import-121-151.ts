import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";
import {
  announcedUnreleasedMegaForms121151,
  conditionalKeepOverrides121151,
  evolutionPairs121151,
  forms121151,
  pvpokeSpeciesId121151,
  releasedDynamaxForms121151,
  releasedGigantamaxForms121151,
  releasedMegaForms121151,
  releasedMegaXForms121151,
  releasedMegaYForms121151,
  releasedShadowForms121151,
  specialAcquisitionForms121151,
  specialVariants121151,
  species121151,
  truncatedForms121151,
  type Form121151,
} from "../../src/data/batch-121-151";
import { RULES_VERSION } from "../../src/rules/rules";

const databaseUrl = getDatabaseUrl();
assertDisposableDatabase(databaseUrl);

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

const batchKey = "121-151";
const batchStart = 121;
const batchEnd = 151;
const expectedCounts = { species: 31, forms: 39, variants: 165 } as const;
const crossBatchEvolution = ["120-kanto", "121-kanto"] as const;
const checkedAt = new Date("2026-08-03T18:30:00+08:00");
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
type VariantKey =
  "NORMAL" | "SHADOW" | "PURIFIED" | "MEGA" | "MEGA_X" | "MEGA_Y" | "DYNAMAX" | "GIGANTAMAX";
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

type OfficialResearch = {
  sources: Array<{ id: string; url: string; supports: string[] }>;
};

const officialSourceMetadata: Record<
  string,
  { title: string; summary: string; publishedAt: string | null }
> = {
  "OFF-MEGA-STARMIE-2026": {
    title: "Starmie Super Mega Raid Day 2026",
    summary: "公告超級寶石海星將於 2026-08-22 登場；截至 2026-08-03 查閱時尚未開放。",
    publishedAt: "2026-07-14",
  },
  "OFF-GALAR-MR-MIME-2020": {
    title: "Where’s that cold air coming from? What’s that tapping noise?",
    summary: "確認伽勒爾魔牆人偶首次登場，且可進化為踏冰人偶。",
    publishedAt: "2020-12-11",
  },
  "OFF-KLEAVOR-2023": {
    title: "Kleavor makes its Pokémon GO debut during Kleavor Raid Day!",
    summary: "確認劈斧螳螂已登場，但飛天螳螂目前不能直接進化為劈斧螳螂。",
    publishedAt: "2023-04-28",
  },
  "OFF-CD-ELECTABUZZ-MAGMAR-2020": {
    title: "Electabuzz and Magmar will be featured during November’s Community Day events!",
    summary: "確認電擊獸與鴨嘴火獸可分別進化為電擊魔獸與鴨嘴炎獸。",
    publishedAt: "2020-10-27",
  },
  "OFF-MEGA-PINSIR-2023": {
    title: "Trainers! Help out Candela during the upcoming A Valorous Hero event!",
    summary: "確認超級凱羅斯於 2023 年正式登場；普通凱羅斯僅作實際 Mega 投資候選。",
    publishedAt: "2023-05-04",
  },
  "OFF-PALDEA-TAUROS-2025": {
    title: "Embark on a Paldean adventure during the Journey to Paldea event!",
    summary: "確認帕底亞肯泰羅的鬥戰、水瀾及火熾種分開登場，不能與關都型態混為一談。",
    publishedAt: null,
  },
  "OFF-MEGA-GYARADOS-2025": {
    title: "Mega Gyarados zooms in for a ferocious Raid Day!",
    summary: "確認超級暴鯉龍已開放；普通鯉魚王與暴鯉龍仍只留實際用途候選。",
    publishedAt: null,
  },
  "OFF-GMAX-LAPRAS-2024": {
    title: "Brace yourselves—Gigantamax Lapras is coming.",
    summary: "確認超極巨拉普拉斯正式登場，且普通、極巨與超極巨版本必須分開。",
    publishedAt: "2024-11-26",
  },
  "OFF-DMAX-EEVEE-2025": {
    title: "Dynamax Eevee makes its Pokémon GO debut!",
    summary: "確認極巨伊布及其可用進化分支的 Max 取得邊界；普通個體不能替代極巨個體。",
    publishedAt: null,
  },
  "OFF-CD-PORYGON-2024": {
    title: "January 2024 Community Day Classic: Porygon",
    summary: "確認多邊獸可依序進化為多邊獸Ⅱ與多邊獸Ｚ，活動招式另行核對。",
    publishedAt: "2024-01-02",
  },
  "OFF-MEGA-AERODACTYL-2026": {
    title: "Celebrate with Pokémon GO at the Pokémon Fossil Museum in Chicago!",
    summary: "確認超級化石翼龍已可在官方活動的 Mega 團體戰登場。",
    publishedAt: null,
  },
  "OFF-GMAX-SNORLAX-2025": {
    title:
      "Don’t sleep on this giant opportunity! Gigantamax Snorlax emerges in a new Max Battle Day.",
    summary: "確認超極巨卡比獸正式登場；普通、極巨及超極巨版本分開評估。",
    publishedAt: null,
  },
  "OFF-DMAX-BIRDS-2025": {
    title:
      "Dynamax Articuno, Dynamax Zapdos, and Dynamax Moltres arrive during the Legendary Flight event!",
    summary: "確認極巨急凍鳥、閃電鳥與火焰鳥分別登場，普通個體不能當作極巨個體。",
    publishedAt: "2025-01-16",
  },
  "OFF-GALAR-BIRDS-2024": {
    title: "Discover updates to Daily Adventure Incense during the Galarian Expedition event!",
    summary: "確認伽勒爾急凍鳥、閃電鳥與火焰鳥為分開的地區型態。",
    publishedAt: "2024-09-19",
  },
  "OFF-MEGA-DRAGONITE-2026": {
    title: "Pokémon GO Tour’s Road to Kalos has arrived with early purchase bonuses!",
    summary: "確認超級快龍已全球推出；普通快龍只因實際 PvP、PvE 或 Mega 候選用途保留。",
    publishedAt: "2026-02-23",
  },
  "OFF-ARMORED-MEWTWO-2020": {
    title: "Celebrate Pokémon Day 2020 with Pokémon GO!",
    summary: "確認裝甲超夢是獨立型態；不能作超級超夢 X／Y 候選。",
    publishedAt: "2020-02-05",
  },
  "OFF-MEGA-MEWTWO-2026": {
    title: "Mewtwo Mega Evolves and more exciting GO Fest updates!",
    summary: "確認超級超夢 X 與超級超夢 Y 已分別登場，並與裝甲超夢分開。",
    publishedAt: null,
  },
  "OFF-MEW-TRADING-2023": {
    title: "Developer Insights: Inside the Philosophy of Friends and Trading",
    summary: "確認夢幻須由特殊調查取得且不能交換，因此不套用一般普通重複個體清理規則。",
    publishedAt: "2018-06-20",
  },
  "OFF-SHADOW-STARYU-2025": {
    title: "Delightful Days: Taken Over",
    summary: "確認暗影海星星已正式加入火箭隊救援名單，進而可存在暗影與淨化寶石海星。",
    publishedAt: "2025-07-31",
  },
};

const officialResearch = JSON.parse(
  readFileSync(
    new URL("../../research_notes/sources/official-121-151.json", import.meta.url),
    "utf8",
  ),
) as OfficialResearch;

function evidenceCategory(variantId: string): (typeof categories)[number] {
  if (variantId.endsWith("-shadow") || variantId.endsWith("-purified")) return "ROCKET";
  if (variantId.endsWith("-dynamax") || variantId.endsWith("-gigantamax")) return "MAX_BATTLE";
  if (/-mega(?:-x|-y)?$/.test(variantId)) return "MEGA";
  return "EVOLUTION_VALUE";
}

const officialEvidenceLinks = officialResearch.sources.flatMap((source) =>
  source.supports.flatMap((variantId) => {
    const links = [
      {
        sourceId: source.id,
        variantId,
        category: evidenceCategory(variantId),
        usageZhTw: "官方頁確認此精確型態／版本的推出、進化或取得邊界。",
      },
    ];
    if (
      variantId.endsWith("-normal") &&
      source.supports.some((candidate) =>
        candidate.startsWith(`${variantId.slice(0, -"-normal".length)}-mega`),
      )
    ) {
      links.push({
        sourceId: source.id,
        variantId,
        category: "MEGA",
        usageZhTw: "官方頁確認此普通型態是對應 Mega 的基底；不回推同家族其他型態。",
      });
    }
    return links;
  }),
);

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
  form: Form121151,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
): RankResult[] {
  const speciesId = pvpokeSpeciesId121151(form, variantKey === "SHADOW");
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
  for (const source of officialResearch.sources) {
    const metadata = officialSourceMetadata[source.id];
    if (!metadata) throw new Error(`官方來源缺少可追溯中繼資料：${source.id}`);
    const publishedAt = metadata.publishedAt ? new Date(`${metadata.publishedAt}T00:00:00Z`) : null;
    await prisma.sourceReference.upsert({
      where: { id: source.id },
      create: {
        id: source.id,
        sourceName: "Pokémon GO",
        sourceUrl: source.url,
        sourceType: "OFFICIAL",
        sourceTitleOriginal: metadata.title,
        sourceLanguage: "en",
        sourceSummaryZhTw: metadata.summary,
        accessedAt: checkedAt,
        publishedAt,
        dataVersion: "accessed-2026-08-03",
        notes: "第 #121～#151 批次官方研究表。",
      },
      update: {
        sourceUrl: source.url,
        sourceTitleOriginal: metadata.title,
        sourceSummaryZhTw: metadata.summary,
        accessedAt: checkedAt,
        publishedAt,
        dataVersion: "accessed-2026-08-03",
        notes: "第 #121～#151 批次官方研究表。",
      },
    });
  }
}

function variantRelease(formId: string, variantKey: VariantKey) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms121151.has(formId);
  }
  if (variantKey === "MEGA") return releasedMegaForms121151.has(formId);
  if (variantKey === "MEGA_X") return releasedMegaXForms121151.has(formId);
  if (variantKey === "MEGA_Y") return releasedMegaYForms121151.has(formId);
  if (variantKey === "DYNAMAX") return releasedDynamaxForms121151.has(formId);
  if (variantKey === "GIGANTAMAX") return releasedGigantamaxForms121151.has(formId);
  return false;
}

function isTruncatedComponent(formId: string) {
  return truncatedForms121151.has(formId);
}

function requiresScopedHold(formId: string) {
  return ["122-galar", "123-kanto", "125-kanto", "126-kanto", "137-kanto"].includes(formId);
}

function hasMajorPveValue(formId: string, variantKey: VariantKey) {
  if (formId === "150-kanto" && ["SHADOW", "MEGA_X", "MEGA_Y"].includes(variantKey)) {
    return true;
  }
  return variantKey === "GIGANTAMAX" && releasedGigantamaxForms121151.has(formId);
}

function isMegaOrMaxCandidate(formId: string, variantKey: VariantKey) {
  return (
    variantRelease(formId, variantKey) &&
    ["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(variantKey)
  );
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
  for (const [from, to] of evolutionPairs121151) {
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
  form: Form121151;
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
      decision: "KEEP",
      ruleKey: "MAJOR_BATTLE_VALUE",
      reason: `超極巨${form.id === "131-kanto" ? "拉普拉斯" : "卡比獸"}是獨立 Max 版本，至少保留一隻；普通或極巨版本不能替代。`,
    };
  }
  if (variantKey === "PURIFIED") {
    return {
      decision: "TRANSFER_CANDIDATE",
      ruleKey: "NO_MAJOR_USE",
      reason: "淨化沒有獨立榜單，且淨化不可逆；不因低總 IV 自動建議淨化。",
    };
  }
  if (hasMajorPveValue(form.id, variantKey)) {
    return {
      decision: "KEEP",
      ruleKey: "MAJOR_BATTLE_VALUE",
      reason:
        variantKey === "SHADOW"
          ? "暗影超夢具明確 PvE 用途；至少留一隻，不設攻擊或總 IV 硬性淘汰線。"
          : "此版本具明確 PvE、Mega 或 Max 投資價值；先留用途候選，再以招式、等級與 IV 比較。",
    };
  }
  if (isMegaOrMaxCandidate(form.id, variantKey)) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "CONDITIONAL_USE",
      reason: "此為已開放的 Mega／Max 候選版本；只留少量實際要投入的版本。",
    };
  }
  if (variantKey === "NORMAL" && specialAcquisitionForms121151.has(form.id)) {
    return {
      decision: "KEEP",
      ruleKey: "SPECIAL_ACQUISITION",
      reason: "夢幻是一次性／特殊調查取得且不可交換的幻之寶可夢，應保留。",
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
  const override = conditionalKeepOverrides121151.get(`${form.id}-${variantKey.toLowerCase()}`);
  if (override) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: override.ruleKey,
      reason: override.reason,
    };
  }
  if (requiresScopedHold(form.id)) {
    return {
      decision: "HOLD_FOR_NOW",
      ruleKey: "INCOMPLETE_EVOLUTION_FAMILY",
      reason: "後續重要進化可能影響保留安全；完整家族補齊前只留一隻最佳候選。",
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

function ivStrategy(
  formId: string,
  variantKey: VariantKey,
  ranks: RankResult[],
  decision: Decision,
) {
  const usefulRanks = ranks.filter((item) => item.rank <= 250);
  if (variantKey === "NORMAL" && specialAcquisitionForms121151.has(formId)) {
    return "特殊取得個體一律保留；若要投入 PvP 再依聯盟 IV Rank 比較，不以 IV 作傳送門檻。";
  }
  if (decision === "HOLD_FOR_NOW") {
    return "先依最終進化可能用途留一隻最佳候選；資料補齊前不以單一 IV 門檻淘汰。";
  }
  if (variantKey === "SHADOW") {
    if (usefulRanks.some((item) => item.league === "GREAT" || item.league === "ULTRA")) {
      return "PvP 依同聯盟 IV Rank 比較；暗影取得成本高，先留用途候選再篩選。";
    }
    return "暗影標準較寬；15攻優先，不設硬性最低IV。";
  }
  if (
    variantKey === "MEGA" ||
    variantKey === "MEGA_X" ||
    variantKey === "MEGA_Y" ||
    variantKey === "DYNAMAX" ||
    variantKey === "GIGANTAMAX"
  ) {
    return "15攻優先；14攻高整體IV亦可留。先看版本、招式、等級與既有投入，最後才以IV比較同版本候選。";
  }
  if (usefulRanks.some((item) => item.league === "GREAT" || item.league === "ULTRA")) {
    return "依同聯盟 IV Rank 比較同物種、同型態候選；Rank≤100優先，101～250選擇性保留。";
  }
  if (usefulRanks.some((item) => item.league === "MASTER")) {
    return "15攻優先；14攻高整體IV亦可留。沒有可靠斷點時，不宣稱15/10/10一定優於14/15/15。";
  }
  if (decision === "KEEP" || decision === "CONDITIONAL_KEEP") {
    return "15攻優先；14攻高整體IV亦可留。沒有可靠斷點時，不宣稱15/10/10一定優於14/15/15。";
  }
  return "100%僅可作收藏比較，不會把低實戰價值物種自動升格為必留。";
}

async function rebuildBatch(rankings: Map<LeagueKey, RankingRow[]>) {
  const oldBatchForms = await prisma.pokemonForm.findMany({
    where: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } },
    select: { id: true },
  });
  const oldBatchFormIds = oldBatchForms.map((item) => item.id);
  if (oldBatchFormIds.length) {
    await prisma.pokemonSpecies.deleteMany({
      where: { dexNumber: { gte: batchStart, lte: batchEnd } },
    });
  }
  await prisma.retentionEvaluation.deleteMany({ where: { id: { startsWith: "r13-" } } });
  await prisma.changeLog.deleteMany({ where: { id: { startsWith: "r13-" } } });
  await prisma.dataIssue.deleteMany({ where: { batchKey } });

  await prisma.pokemonSpecies.createMany({
    data: species121151.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 1,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms121151.map((form) => {
      const species = species121151.find((item) => item.dexNumber === form.dexNumber)!;
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
  for (const form of forms121151) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }
  await prisma.pokemonForm.update({
    where: { id: crossBatchEvolution[0] },
    data: {
      evolutionFamilyNotesZhTw: "已與 #121 寶石海星整合；超級寶石海星已公告但截至查閱日尚未開放。",
    },
  });
  await prisma.categoryEvaluation.updateMany({
    where: {
      battleVariant: { pokemonFormId: crossBatchEvolution[0] },
      category: "EVOLUTION_VALUE",
    },
    data: {
      status: "VERIFIED",
      summaryZhTw: "#120 海星星已接到 #121 寶石海星；只留實際 PvP／未來 Mega 候選。",
      materialToDecision: true,
      checkedAt,
    },
  });

  await prisma.evolutionPath.createMany({
    data: evolutionPairs121151.map(([from, to]) => ({
      id: `evolution-${from}-${to}`,
      fromFormId: from,
      toFormId: to,
      evolutionMethodZhTw: "糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw: "此一般路徑已在 #001～#151 整合資料中核對。",
      requiresEvent: false,
      verifiedAt: checkedAt,
    })),
  });
  const variants: Array<{
    id: string;
    form: Form121151;
    variantKey: VariantKey;
    released: boolean;
  }> = [];
  for (const form of forms121151) {
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: variantRelease(form.id, variantKey),
      });
    }
  }
  for (const special of specialVariants121151) {
    const form = forms121151.find((item) => item.id === special.formId)!;
    variants.push({
      id: special.id,
      form,
      variantKey: special.variantKey,
      released: special.released,
    });
  }
  if (
    species121151.length !== expectedCounts.species ||
    forms121151.length !== expectedCounts.forms ||
    variants.length !== expectedCounts.variants
  ) {
    throw new Error("#121～#151 靜態計數不符 31 species／39 forms／165 variants。");
  }

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
          ? "超極巨是獨立 Max 版本；不得與普通、暗影、Mega 或極巨版本混為一談。"
          : variantKey === "MEGA" || variantKey === "MEGA_X" || variantKey === "MEGA_Y"
            ? "Mega 是戰鬥型態；只把對應關都型態列為 Mega 候選，不回推全家族必留。"
            : variantKey === "DYNAMAX"
              ? released
                ? "極巨是獨立捕捉版本；普通個體不能替代已開放的極巨個體。"
                : "普通個體不等於極巨個體；本批證據未確認此極巨版本開放。"
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
      id: `raw-r13-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: pvpokeSpeciesId121151(variant.form, variant.variantKey === "SHADOW"),
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
        if (
          !variant.released ||
          ["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)
        ) {
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
        } else if (hasMajorPveValue(variant.form.id, variant.variantKey)) {
          const isMega = ["MEGA", "MEGA_X", "MEGA_Y"].includes(variant.variantKey);
          status = "PARTIALLY_VERIFIED";
          provenance = "MANUAL_CURATED";
          materialToDecision = true;
          summaryZhTw =
            variant.variantKey === "SHADOW"
              ? "暗影超夢具明確 PvE 用途；暗影標準較寬，不設攻擊或總 IV 硬性最低門檻。"
              : isMega
                ? "此 Mega 型態具明確 PvE 投資用途；先看精確版本、招式、等級與既有投入；無可靠斷點時不虛構 IV 勝負。"
                : "此版本具明確 Max 投資價值；15攻只作同版本長期投資排序，不是淘汰線。";
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          summaryZhTw =
            "未列為本批主要 PvE 投資目標；缺少精確斷點資料時不虛構 15/10/10 與 14/15/15 的勝負。";
        }
      } else if (category === "ROCKET") {
        if (
          variant.form.id === "121-kanto" &&
          ["SHADOW", "PURIFIED"].includes(variant.variantKey) &&
          officialEvidenceLinks.some(
            (link) => link.variantId === variant.id && link.category === "ROCKET",
          )
        ) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw =
            variant.variantKey === "SHADOW"
              ? "官方已確認暗影寶石海星進化線已開放；沒有精確火箭隊排名不等於未推出。"
              : "暗影寶石海星已開放，因此淨化版本可存在；淨化仍不可逆且不會自動升格為必留。";
        } else {
          status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
          provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
          summaryZhTw = "火箭隊沒有統一排名；此缺項不會單獨觸發暫時保留。";
        }
      } else if (category === "GYM") {
        if (variant.form.id === "143-kanto" && variant.variantKey === "NORMAL") {
          status = "PARTIALLY_VERIFIED";
          provenance = "MANUAL_CURATED";
          materialToDecision = true;
          summaryZhTw = "卡比獸可留少量道館防守候選；此為人工定性，不虛構精確道館名次。";
        } else {
          status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
          provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
          summaryZhTw = "未找到足以構成主要保留理由的道館用途；次要資料缺失不覆蓋清包結論。";
        }
      } else if (category === "MEGA") {
        if (["MEGA", "MEGA_X", "MEGA_Y"].includes(variant.variantKey)) {
          status = variant.released ? "VERIFIED" : "UNRELEASED";
          provenance = officialEvidenceLinks.some(
            (link) => link.variantId === variant.id && link.category === "MEGA",
          )
            ? "SOURCE_VERIFIED"
            : "MANUAL_CURATED";
          materialToDecision = variant.released;
          summaryZhTw = variant.released
            ? "此 Mega 型態已開放且與其他版本分開；只保留精確版本候選，不回推全家族必留。"
            : "超級寶石海星已公告於 2026-08-22 登場；截至查閱日仍為 UNRELEASED。";
        } else if (variant.form.id === "150-armored") {
          status = "NOT_APPLICABLE";
          summaryZhTw = "裝甲超夢是獨立型態，不能作超級超夢 X／Y 候選。";
        } else if (
          variant.variantKey === "NORMAL" &&
          (releasedMegaForms121151.has(variant.form.id) ||
            releasedMegaXForms121151.has(variant.form.id) ||
            releasedMegaYForms121151.has(variant.form.id))
        ) {
          status = "PARTIALLY_VERIFIED";
          provenance = officialEvidenceLinks.some(
            (link) => link.variantId === variant.id && link.category === "MEGA",
          )
            ? "SOURCE_VERIFIED"
            : "MANUAL_CURATED";
          materialToDecision = true;
          summaryZhTw = "此普通型態是已開放 Mega 的基底；只留實際要投入者，其餘普通重複可傳。";
        } else if (
          variant.variantKey === "NORMAL" &&
          announcedUnreleasedMegaForms121151.has(variant.form.id)
        ) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = "Mega 已公告但截至查閱日尚未開放；普通個體只作少量未來候選。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都值得保留。";
        }
      } else if (category === "MAX_BATTLE") {
        if (variant.variantKey === "GIGANTAMAX") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = "此超極巨版本已開放且具明確 Max 用途；普通或極巨版本不能替代。";
          materialToDecision = true;
          maxOverallRating = "HIGH";
          maxInvestmentRating = "HIGH";
          maxUseCaseBreadth = "BROAD";
        } else if (variant.variantKey === "DYNAMAX") {
          status = variant.released ? "VERIFIED" : "UNRELEASED";
          provenance = variant.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          summaryZhTw = variant.released
            ? "此極巨版本已開放；普通個體不能替代，前階只作極巨進化候選。"
            : "本批證據未確認此極巨版本；普通個體不能當成極巨候選。";
          materialToDecision = variant.released;
          maxOverallRating = variant.released ? "MEDIUM" : null;
          maxInvestmentRating = variant.released ? "MEDIUM" : null;
          maxUseCaseBreadth = variant.released ? "NARROW" : null;
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "普通、暗影或淨化個體不等於極巨／超極巨個體。";
        }
      } else {
        if (variant.form.id === "121-kanto" && variant.variantKey === "NORMAL") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = "已由 #120 海星星接回本批；Mega 將於 2026-08-22 登場且截至查閱日尚未開放。";
          materialToDecision = true;
        } else if (requiresScopedHold(variant.form.id)) {
          status = "PARTIALLY_VERIFIED";
          summaryZhTw = "家族仍有本批範圍外進化；此缺口可能影響誤傳，因此先保留少量候選。";
          materialToDecision = true;
        } else if (isTruncatedComponent(variant.form.id)) {
          status = "PARTIALLY_VERIFIED";
          summaryZhTw =
            "家族仍有後續分支，但本批已有可執行主要目標；只另留一隻後續分支候選，不需保留全部。";
        } else {
          status = "VERIFIED";
          summaryZhTw = variant.form.evolvesFromFormId
            ? "本批內進化關係已結構化，前階是否保留仍取決於末階用途。"
            : "單純存在進化路徑不會自動產生選擇性保留。";
        }
      }
      if (
        officialEvidenceLinks.some(
          (link) => link.variantId === variant.id && link.category === category,
        ) &&
        status !== "UNRELEASED" &&
        status !== "NOT_APPLICABLE"
      ) {
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
        maxOverallRating,
        maxInvestmentRating,
        maxUseCaseBreadth,
        checkedAt,
      };
    });
  });
  await prisma.categoryEvaluation.createMany({ data: categoryRows });

  const batchVariantIds = new Set(variants.map((variant) => variant.id));
  const categorySources = variants.flatMap((variant) => {
    const rows = rankMap.get(variant.id) ?? [];
    return [...new Set(rows.map((item) => item.sourceId))].map((sourceId) => ({
      categoryEvaluationId: `category-${variant.id}-pvp`,
      sourceId,
      usageZhTw: "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。",
    }));
  });
  categorySources.push(
    ...officialEvidenceLinks
      .filter((link) => batchVariantIds.has(link.variantId))
      .flatMap((link) =>
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
    const evolutionText =
      variant.form.id === "121-kanto" && variant.variantKey === "NORMAL"
        ? "已接回 #120 海星星；Mega 於 2026-08-22 登場且截至查閱日尚未開放。"
        : requiresScopedHold(variant.form.id)
          ? "仍有 #151 範圍外進化；完整家族補齊前只留少量候選。"
          : isTruncatedComponent(variant.form.id)
            ? "仍有後續分支，但本批已有可執行用途；不需保留全部重複。"
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
      id: `r13-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw:
        variant.form.id === "150-kanto" && variant.variantKey === "SHADOW"
          ? "暗影超夢具明確 PvE 用途；暗影標準較寬，不設攻擊或總 IV 硬性最低門檻。"
          : ["MEGA", "MEGA_X", "MEGA_Y"].includes(variant.variantKey)
            ? variant.released
              ? "此 Mega 型態具獨立用途；先看精確版本、招式、等級與投入，無可靠斷點時不虛構 IV 勝負。"
              : "此 Mega 型態截至查閱日仍未開放。"
            : variant.variantKey === "GIGANTAMAX"
              ? "此超極巨版本具獨立 Max 用途；普通或極巨版本不能替代。"
              : "未列為本批主要 PvE 投資目標；低價值物種不因100%自動升格為實戰必留。",
      rocketSummaryZhTw:
        variant.form.id === "121-kanto" && variant.variantKey === "SHADOW"
          ? "官方已確認暗影寶石海星進化線已開放；沒有火箭隊排名不等於未推出。"
          : variant.form.id === "121-kanto" && variant.variantKey === "PURIFIED"
            ? "淨化版本可存在，但淨化不可逆且不因未來 Mega 自動建議淨化。"
            : "火箭隊沒有統一排名；沒有排行不會單獨觸發暫時保留。",
      gymSummaryZhTw:
        variant.form.id === "143-kanto" && variant.variantKey === "NORMAL"
          ? "卡比獸可留少量道館防守候選；不虛構精確道館名次。"
          : "未列為主要道館保留目標。",
      gymRating:
        variant.form.id === "143-kanto" && variant.variantKey === "NORMAL"
          ? ("SPECIAL_CASE" as const)
          : ("NOT_APPLICABLE" as const),
      megaSummaryZhTw: ["MEGA", "MEGA_X", "MEGA_Y"].includes(variant.variantKey)
        ? variant.released
          ? "此 Mega 型態已開放且與其他版本分開；不回推全家族必留。"
          : "超級寶石海星已公告於 2026-08-22 登場但截至查閱日尚未開放。"
        : variant.form.id === "150-armored"
          ? "裝甲超夢不能作超級超夢 X／Y 候選。"
          : variant.variantKey === "NORMAL" &&
              (releasedMegaForms121151.has(variant.form.id) ||
                releasedMegaXForms121151.has(variant.form.id) ||
                releasedMegaYForms121151.has(variant.form.id))
            ? "本體可作已開放 Mega 的候選；只留實際投入者，其餘普通重複可傳。"
            : variant.form.id === "121-kanto" && variant.variantKey === "NORMAL"
              ? "Mega 已公告但尚未開放；普通寶石海星只作少量未來候選。"
              : "此型態沒有已確認 Mega 用途；不因同家族其他版本有用途而升格。",
      maxBattleSummaryZhTw:
        variant.variantKey === "GIGANTAMAX"
          ? "此超極巨版本已開放；只保留真正的超極巨版本，普通與極巨版本不能替代。"
          : variant.variantKey === "DYNAMAX"
            ? variant.released
              ? "此極巨版本已開放；普通個體不能替代，前階只作符合條件的極巨進化候選。"
              : "此極巨版本未確認開放；普通個體不等於極巨個體。"
            : "此版本不是 Max 版本；Max 用途不會回推普通個體必留。",
      evolutionSummaryZhTw: evolutionText,
      requiredMovesSummaryZhTw: pvpUseful
        ? `依固定快照優先核對：${[
            ...new Set(
              result.ranks.filter((item) => item.rank <= 250).flatMap((item) => item.moves),
            ),
          ].join("／")}`
        : "沒有招式足以把此低用途版本自動升格為必留。",
      recommendedIvStrategyZhTw: ivStrategy(
        variant.form.id,
        variant.variantKey,
        result.ranks,
        result.decision,
      ),
      reasonZhTw: result.reason,
      confidence: result.decision === "HOLD_FOR_NOW" ? ("MEDIUM" as const) : ("HIGH" as const),
      rulesVersion: RULES_VERSION,
      generatedAt: checkedAt,
      reviewed: result.decision !== "HOLD_FOR_NOW",
      reviewedAt: result.decision === "HOLD_FOR_NOW" ? null : checkedAt,
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
        id: `r13-trace-${variant.id}`,
        evaluationId: `r13-eval-${variant.id}`,
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
    const links = [
      ...[...new Set(rows.map((item) => item.sourceId))].map((sourceId) => ({
        evaluationId: `r13-eval-${variant.id}`,
        sourceId,
        usageZhTw: "Open League／Overall 名次與招式。",
      })),
      ...officialEvidenceLinks
        .filter((link) => link.variantId === variant.id)
        .map((link) => ({
          evaluationId: `r13-eval-${variant.id}`,
          sourceId: link.sourceId,
          usageZhTw: link.usageZhTw,
        })),
    ];
    return Array.from(new Map(links.map((link) => [link.sourceId, link])).values());
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
        id: `r13-issue-${variant.id}`,
        pokemonFormId: variant.form.id,
        battleVariantId: variant.id,
        issueType: "RULE_NOT_COVERED",
        status: "OPEN",
        batchKey,
        messageZhTw: "此進化家族仍有 #151 範圍外成員，可能影響安全傳送結論。",
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

async function addChangeLogs() {
  const changes = [
    {
      id: "r13-batch-121-151",
      entityType: "Batch",
      entityId: "121-151",
      fieldName: "status",
      previousValue: null,
      newValue: "REVIEWED",
      sourceId: null,
      reason: "新增 #121～#151，沿用立即處理結論、用途、IV 與版本分層。",
    },
    {
      id: "r13-cross-family-120",
      entityType: "EvolutionFamily",
      entityId: "KANTO_FAMILY_120",
      fieldName: "members",
      previousValue: "#120",
      newValue: "#120-#121",
      sourceId: "OFF-MEGA-STARMIE-2026",
      reason: "將 #121 寶石海星接回前批 #120 海星星。",
    },
    {
      id: "r13-mega-starmie-announced",
      entityType: "BattleVariant",
      entityId: "121-kanto-mega",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "ANNOUNCED_UNRELEASED_2026-08-22",
      sourceId: "OFF-MEGA-STARMIE-2026",
      reason: "保留公告證據，但不把尚未登場的 Mega 寫成已開放。",
    },
    {
      id: "r13-mega-mewtwo-x",
      entityType: "BattleVariant",
      entityId: "150-kanto-mega-x",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-MEGA-MEWTWO-2026",
      reason: "超級超夢 X 與普通、裝甲及超級超夢 Y 分開評估。",
    },
    {
      id: "r13-mega-mewtwo-y",
      entityType: "BattleVariant",
      entityId: "150-kanto-mega-y",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-MEGA-MEWTWO-2026",
      reason: "超級超夢 Y 與普通、裝甲及超級超夢 X 分開評估。",
    },
    {
      id: "r13-gmax-lapras",
      entityType: "BattleVariant",
      entityId: "131-kanto-gigantamax",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-GMAX-LAPRAS-2024",
      reason: "超極巨拉普拉斯與普通、暗影及極巨版本分開。",
    },
    {
      id: "r13-gmax-snorlax",
      entityType: "BattleVariant",
      entityId: "143-kanto-gigantamax",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-GMAX-SNORLAX-2025",
      reason: "超極巨卡比獸與普通、暗影及極巨版本分開。",
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

async function auditOfficialSourceBindings() {
  for (const source of officialResearch.sources) {
    const [evaluations, categoriesBound, changes] = await Promise.all([
      prisma.evaluationSource.count({
        where: {
          sourceId: source.id,
          evaluation: {
            battleVariant: {
              pokemonForm: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } },
            },
          },
        },
      }),
      prisma.categoryEvaluationSource.count({
        where: {
          sourceId: source.id,
          categoryEvaluation: {
            battleVariant: {
              pokemonForm: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } },
            },
          },
        },
      }),
      prisma.changeLog.count({ where: { sourceId: source.id } }),
    ]);
    if (evaluations + categoriesBound + changes === 0) {
      throw new Error(`官方來源未綁定本批 evaluation/category/change log：${source.id}`);
    }
  }
}

async function main() {
  await upsertOfficialSources();
  const rankings = await readRankings();
  await rebuildBatch(rankings);
  await addChangeLogs();
  await auditOfficialSourceBindings();
  const batchCounts = await Promise.all([
    prisma.pokemonSpecies.count({ where: { dexNumber: { gte: batchStart, lte: batchEnd } } }),
    prisma.pokemonForm.count({
      where: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } },
    }),
    prisma.battleVariant.count({
      where: { pokemonForm: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } } },
    }),
    prisma.categoryEvaluation.count({
      where: {
        battleVariant: {
          pokemonForm: { species: { dexNumber: { gte: batchStart, lte: batchEnd } } },
        },
      },
    }),
  ]);
  const globalCounts = await Promise.all([
    prisma.pokemonSpecies.count(),
    prisma.pokemonForm.count(),
    prisma.battleVariant.count(),
    prisma.categoryEvaluation.count(),
  ]);
  const rawCount = await prisma.rawEvaluationData.count();
  const expectedBatch = [31, 39, 165, 1155];
  const expectedGlobal = [151, 188, 783, 5481];
  if (batchCounts.some((count, index) => count !== expectedBatch[index])) {
    throw new Error(`本批計數錯誤：${batchCounts.join("/")}，預期 ${expectedBatch.join("/")}。`);
  }
  if (globalCounts.some((count, index) => count !== expectedGlobal[index])) {
    throw new Error(`全站計數錯誤：${globalCounts.join("/")}，預期 ${expectedGlobal.join("/")}。`);
  }
  console.log(
    `#121～#151 匯入完成：本批 ${batchCounts.join("/")}；全站 ${globalCounts.join("/")}；raw rows ${rawCount}。`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
