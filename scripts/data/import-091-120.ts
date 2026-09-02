import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";
import {
  conditionalKeepOverrides091120,
  eventEvolutionPairs091120,
  evolutionPairs091120,
  forms091120,
  officialEventEvolutionEvidence091120,
  pvpokeSpeciesId091120,
  releasedShadowForms091120,
  species091120,
  truncatedForms091120,
  type Form091120,
} from "../../src/data/batch-091-120";
import { RULES_VERSION } from "../../src/rules/rules";

const databaseUrl = getDatabaseUrl();
assertDisposableDatabase(databaseUrl);

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

const checkedAt = new Date("2026-08-03T16:30:00+08:00");
const releaseAuditAt = new Date("2026-09-02T00:00:00+08:00");
const pvpCheckedAt = new Date("2026-09-01T00:00:00+08:00");
const pvpSnapshotRoot = "data/sources/pvpoke/2026-09-01";
const pvpokeCommit = "7b96d91fb553780653190ad32de001b5d9086a7f";
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
  { key: "GREAT", cp: 1500, sourceId: "pvpoke-gl-20260901", label: "GL（超級聯盟）" },
  { key: "ULTRA", cp: 2500, sourceId: "pvpoke-ul-20260901", label: "UL（高級聯盟）" },
  { key: "MASTER", cp: 10000, sourceId: "pvpoke-ml-20260901", label: "ML（大師聯盟）" },
] as const;

type LeagueKey = (typeof leagues)[number]["key"];
type VariantKey = "NORMAL" | "SHADOW" | "PURIFIED" | "MEGA" | "DYNAMAX" | "GIGANTAMAX";
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
    sourceId: "OFF-MEGA-GENGAR-2020",
    variantId: "094-kanto-mega",
    category: "MEGA",
    usageZhTw: "確認超級耿鬼已正式開放，且只綁定關都耿鬼型態。",
  },
  {
    sourceId: "OFF-MEGA-GENGAR-2020",
    variantId: "094-kanto-mega",
    category: "PVE",
    usageZhTw: "確認超級耿鬼版本已開放，支援獨立 Mega／PvE 投資評估。",
  },
  ...["092-kanto", "093-kanto", "094-kanto"].map((formId) => ({
    sourceId: "OFF-DMAX-GASTLY-2024",
    variantId: `${formId}-dynamax`,
    category: "MAX_BATTLE" as const,
    usageZhTw: "極巨鬼斯及其進化可在 Max 對戰使用；普通版本不能替代極巨版本。",
  })),
  {
    sourceId: "OFF-GMAX-GENGAR-2024",
    variantId: "094-kanto-gigantamax",
    category: "MAX_BATTLE",
    usageZhTw: "確認超極巨耿鬼已正式開放，並與普通、暗影、Mega 及極巨版本分開。",
  },
  ...["098-kanto", "099-kanto"].map((formId) => ({
    sourceId: "OFF-DMAX-KRABBY-2025",
    variantId: `${formId}-dynamax`,
    category: "MAX_BATTLE" as const,
    usageZhTw: "確認極巨大鉗蟹及其進化路徑已開放；普通版本不能替代極巨版本。",
  })),
  {
    sourceId: "OFF-GMAX-KINGLER-2025",
    variantId: "099-kanto-gigantamax",
    category: "MAX_BATTLE",
    usageZhTw: "確認超極巨巨鉗蟹已正式開放，且與普通、暗影及極巨版本分開。",
  },
  {
    sourceId: "OFF-HISUI-ELECTRODE-2022",
    variantId: "100-hisui-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認洗翠霹靂電球與關都型態不同，並可進化為洗翠頑皮雷彈。",
  },
  {
    sourceId: "OFF-HISUI-ELECTRODE-2022",
    variantId: "101-hisui-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認洗翠頑皮雷彈已正式登場，維持洗翠進化線獨立。",
  },
  {
    sourceId: "OFF-ALOLA-EXEGGUTOR-2018",
    variantId: "103-alola-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認阿羅拉椰蛋樹已正式登場；不與關都椰蛋樹混為同一型態。",
  },
  ...officialEventEvolutionEvidence091120
    .filter(({ sourceId }) => sourceId !== "OFF-LEGENDARY-HEROES-2024")
    .map(({ sourceId, formId }) => ({
      sourceId,
      variantId: `${formId}-normal`,
      category: "EVOLUTION_VALUE" as const,
      usageZhTw: "確認活動限定地區進化路徑的起點與終點；不當成常駐關都進化路徑。",
    })),
  {
    sourceId: "OFF-GALAR-WEEZING-2019",
    variantId: "110-galar-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認伽勒爾雙彈瓦斯已正式登場，並與關都型態分開。",
  },
  ...officialEventEvolutionEvidence091120
    .filter(({ sourceId }) => sourceId === "OFF-LEGENDARY-HEROES-2024")
    .map(({ sourceId, formId }) => ({
      sourceId,
      variantId: `${formId}-normal`,
      category: "EVOLUTION_VALUE" as const,
      usageZhTw: "確認活動限定瓦斯彈至伽勒爾雙彈瓦斯路徑的起點與終點；不當成常駐關都路徑。",
    })),
  {
    sourceId: "OFF-MEGA-KANGASKHAN-2022",
    variantId: "115-kanto-mega",
    category: "MEGA",
    usageZhTw: "確認超級袋獸已正式開放，且只保留真正要投入的袋獸候選。",
  },
  {
    sourceId: "OFF-CD-CHANSEY-2024",
    variantId: "113-kanto-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw: "確認吉利蛋可進化為幸福蛋；跨批次缺口只保留少量候選，不覆蓋本體結論。",
  },
  {
    sourceId: "OFF-MEGA-STARMIE-2026",
    variantId: "120-kanto-normal",
    category: "EVOLUTION_VALUE",
    usageZhTw:
      "官方活動頁確認超級寶石海星已於 2026-08-22 正式登場；海星星只需保留少量實際 Mega／進化候選。",
  },
  {
    sourceId: "OFF-SHADOW-STARYU-2025",
    variantId: "120-kanto-shadow",
    category: "ROCKET",
    usageZhTw: "確認暗影海星星已於 2025 年火箭隊活動正式開放；不把缺少排行榜誤寫成未推出。",
  },
  {
    sourceId: "OFF-SHADOW-STARYU-2025",
    variantId: "120-kanto-purified",
    category: "ROCKET",
    usageZhTw: "暗影海星星已開放，因此其淨化版本可存在；淨化仍不可逆且沒有獨立榜單。",
  },
];

async function readRankings() {
  const result = new Map<LeagueKey, RankingRow[]>();
  for (const league of leagues) {
    const bytes = await readFile(`${pvpSnapshotRoot}/rankings-${league.cp}.json`);
    const rows = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, "")) as RankingRow[];
    result.set(league.key, rows);
    const hash = createHash("sha256").update(bytes).digest("hex");
    await prisma.sourceReference.update({
      where: { id: league.sourceId },
      data: {
        dataVersion: `${pvpokeCommit}; sha256=${hash}`,
        notes:
          "Open League／Overall 2026-09-01 固定快照；名次以陣列索引加一重現，不使用搜尋摘要。",
      },
    });
  }
  return result;
}

function findRanks(
  form: Form091120,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
): RankResult[] {
  const speciesId = pvpokeSpeciesId091120(form, variantKey === "SHADOW");
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
      id: "OFF-MEGA-GENGAR-2020",
      sourceUrl: "https://pokemongo.com/en/post/megavenusaurraids",
      title: "Mega Venusaur leaves Mega Raids on October 23",
      summary: "確認超級耿鬼自 2020 年起可在 Mega 團體戰登場。",
      publishedAt: new Date("2020-10-19T00:00:00Z"),
    },
    {
      id: "OFF-DMAX-GASTLY-2024",
      sourceUrl: "https://pokemongo.com/en/post/halloween-part-1-2024?hl=en",
      title: "Halloween 2024 Part I",
      summary: "確認極巨鬼斯首次登場，且從 Max 對戰捕捉者及其進化可極巨化。",
      publishedAt: new Date("2024-10-09T00:00:00Z"),
    },
    {
      id: "OFF-GMAX-GENGAR-2024",
      sourceUrl: "https://pokemongo.com/en/post/halloween-part-2-2024?hl=en",
      title: "Halloween 2024 Part II",
      summary: "確認超極巨耿鬼於六星 Max 對戰正式登場。",
      publishedAt: new Date("2024-10-21T00:00:00Z"),
    },
    {
      id: "OFF-DMAX-KRABBY-2025",
      sourceUrl: "https://pokemongo.com/en/post/legendary-flight-2025?hl=en",
      title: "Legendary Flight",
      summary: "確認極巨大鉗蟹可從 Max 對戰及限時調查取得。",
      publishedAt: new Date("2025-01-15T00:00:00Z"),
    },
    {
      id: "OFF-GMAX-KINGLER-2025",
      sourceUrl: "https://pokemongo.com/en/post/gigantamax-kingler-max-battle-day?hl=en",
      title: "Gigantamax Kingler Max Battle Day",
      summary: "確認超極巨巨鉗蟹於 2025 年正式登場。",
      publishedAt: new Date("2025-01-13T00:00:00Z"),
    },
    {
      id: "OFF-HISUI-ELECTRODE-2022",
      sourceUrl: "https://pokemongo.com/post/pokeball-prep-go-tour-prep-event",
      title: "GO Tour Poké Ball Prep Rally",
      summary: "確認洗翠霹靂電球可進化為洗翠頑皮雷彈，且活動後仍可進化。",
      publishedAt: new Date("2022-02-15T00:00:00Z"),
    },
    {
      id: "OFF-ALOLA-EXEGGUTOR-2018",
      sourceUrl: "https://pokemongo.com/post/pokemonletsgo?hl=en",
      title: "Alolan Exeggutor arrives in Pokémon GO",
      summary: "確認阿羅拉椰蛋樹作為獨立阿羅拉型態正式登場。",
      publishedAt: new Date("2018-05-29T00:00:00Z"),
    },
    {
      id: "OFF-EVENT-ALOLA-EXEGGUTOR-2024",
      sourceUrl: "https://pokemongo.com/events/citysafari-tainan",
      title: "Pokémon GO City Safari: Tainan",
      summary: "確認指定活動時段曾允許蛋蛋進化為阿羅拉椰蛋樹。",
      publishedAt: null,
    },
    {
      id: "OFF-ALOLA-TO-ALOLA-2022",
      sourceUrl: "https://pokemongo.com/post/alola-to-alola?hl=en",
      title: "Alola to Alola",
      summary: "確認活動期間曾允許卡拉卡拉進化為阿羅拉嘎啦嘎啦。",
      publishedAt: new Date("2022-05-19T00:00:00Z"),
    },
    {
      id: "OFF-GALAR-WEEZING-2019",
      sourceUrl: "https://pokemongo.com/en/post/swordshield-galarianweezing",
      title: "Galarian Weezing appears in raids",
      summary: "確認伽勒爾雙彈瓦斯已正式登場，並標明毒／妖精屬性。",
      publishedAt: new Date("2019-11-15T00:00:00Z"),
    },
    {
      id: "OFF-LEGENDARY-HEROES-2024",
      sourceUrl: "https://pokemongo.com/en/post/legendary-heroes-2024",
      title: "Legendary Heroes",
      summary: "確認活動期間曾允許瓦斯彈進化為伽勒爾雙彈瓦斯。",
      publishedAt: new Date("2024-09-12T00:00:00Z"),
    },
    {
      id: "OFF-MEGA-KANGASKHAN-2022",
      sourceUrl: "https://pokemongo.com/post/mega-evolution-2022-update-global",
      title: "Mega Evolution update global launch",
      summary: "確認超級袋獸於 2022 年首次在 Mega 團體戰登場。",
      publishedAt: new Date("2022-04-28T00:00:00Z"),
    },
    {
      id: "OFF-CD-CHANSEY-2024",
      sourceUrl: "https://pokemongo.com/en/post/communityday-february-2024-chansey",
      title: "February 2024 Community Day: Chansey",
      summary: "確認吉利蛋可進化為幸福蛋並取得活動招式；不自行宣稱精確道館排名。",
      publishedAt: new Date("2024-01-09T00:00:00Z"),
    },
    {
      id: "OFF-MEGA-STARMIE-2026",
      sourceUrl: "https://pokemongo.com/en/news/starmie-super-mega-raid-day-2026",
      title: "Starmie Super Mega Raid Day 2026",
      summary: "官方活動頁確認超級寶石海星已於 2026-08-22 正式登場。",
      publishedAt: new Date("2026-07-14T00:00:00Z"),
    },
    {
      id: "OFF-SHADOW-STARYU-2025",
      sourceUrl: "https://pokemongo.com/post/delightful-days-tgr-2025",
      title: "Delightful Days: Taken Over",
      summary: "確認暗影海星星於 2025 年正式加入火箭隊救援名單。",
      publishedAt: new Date("2025-07-31T00:00:00Z"),
    },
  ];
  for (const source of sources) {
    const sourceCheckedAt = source.id === "OFF-MEGA-STARMIE-2026" ? releaseAuditAt : checkedAt;
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
        accessedAt: sourceCheckedAt,
        publishedAt: source.publishedAt,
        dataVersion: source.id === "OFF-MEGA-STARMIE-2026" ? "accessed-2026-09-02" : "accessed-2026-08-03",
        notes: "第 #091～#120 批次的型態、進化、Mega 與 Max 推出證據。",
      },
      update: {
        sourceSummaryZhTw: source.summary,
        accessedAt: sourceCheckedAt,
        publishedAt: source.publishedAt,
        dataVersion: source.id === "OFF-MEGA-STARMIE-2026" ? "accessed-2026-09-02" : "accessed-2026-08-03",
        notes: "第 #091～#120 批次的型態、進化、Mega 與 Max 推出證據。",
      },
    });
  }
}

function variantRelease(formId: string, variantKey: VariantKey) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms091120.has(formId);
  }
  if (variantKey === "MEGA") {
    return ["094-kanto", "115-kanto"].includes(formId);
  }
  if (variantKey === "DYNAMAX") {
    return ["092-kanto", "093-kanto", "094-kanto", "098-kanto", "099-kanto"].includes(formId);
  }
  if (variantKey === "GIGANTAMAX") return ["094-kanto", "099-kanto"].includes(formId);
  return false;
}

function isTruncatedComponent(formId: string) {
  return truncatedForms091120.has(formId);
}

function requiresScopedHold(formId: string) {
  return ["095-kanto", "111-kanto", "112-kanto", "114-kanto", "116-kanto", "117-kanto"].includes(
    formId,
  );
}

function hasMajorPveValue(formId: string, variantKey: VariantKey) {
  if (variantKey === "SHADOW" && formId === "094-kanto") return true;
  if (variantKey === "MEGA" && formId === "094-kanto") return true;
  if (variantKey === "DYNAMAX" && ["094-kanto", "099-kanto"].includes(formId)) return true;
  if (variantKey === "GIGANTAMAX" && ["094-kanto", "099-kanto"].includes(formId)) return true;
  return false;
}

function isMegaOrMaxCandidate(formId: string, variantKey: VariantKey) {
  return (
    (variantKey === "MEGA" && ["094-kanto", "115-kanto"].includes(formId)) ||
    (variantKey === "DYNAMAX" &&
      ["092-kanto", "093-kanto", "094-kanto", "098-kanto", "099-kanto"].includes(formId)) ||
    (variantKey === "GIGANTAMAX" && ["094-kanto", "099-kanto"].includes(formId))
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
  for (const [from, to] of evolutionPairs091120) {
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
  form: Form091120;
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
      reason: `超極巨${form.id === "094-kanto" ? "耿鬼" : "巨鉗蟹"}是獨立 Max 版本，至少保留一隻；普通或極巨版本不能替代。`,
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
          ? "暗影耿鬼具明確 PvE 用途；至少留一隻，不設攻擊或總 IV 硬性淘汰線。"
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
  const override = conditionalKeepOverrides091120.get(`${form.id}-${variantKey.toLowerCase()}`);
  if (override) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: override.ruleKey,
      reason: override.reason,
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
  if (variantKey === "NORMAL" && form.id === "113-kanto") {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "VALUABLE_EVOLUTION",
      reason:
        "吉利蛋本體可留少量道館／收藏候選，且官方已確認可進化為幸福蛋；不因跨批次缺口保留全部重複。",
    };
  }
  if (variantKey === "NORMAL" && form.id === "120-kanto") {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "VALUABLE_EVOLUTION",
      reason:
        "超級寶石海星已於 2026-08-22 正式登場；海星星只留少量實際 Mega／進化候選。",
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
  if (variantKey === "MEGA" || variantKey === "DYNAMAX" || variantKey === "GIGANTAMAX") {
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
    where: { species: { dexNumber: { gte: 91, lte: 120 } } },
    select: { id: true },
  });
  const oldBatchFormIds = oldBatchForms.map((item) => item.id);
  if (oldBatchFormIds.length) {
    await prisma.pokemonSpecies.deleteMany({ where: { dexNumber: { gte: 91, lte: 120 } } });
  }
  const crossVariantIds = (
    await prisma.battleVariant.findMany({
      where: { pokemonFormId: "090-kanto" },
      select: { id: true },
    })
  ).map((item) => item.id);
  await prisma.retentionEvaluation.deleteMany({
    where: { battleVariantId: { in: crossVariantIds } },
  });
  await prisma.changeLog.deleteMany({ where: { id: { startsWith: "r12-" } } });
  await prisma.dataIssue.deleteMany({ where: { pokemonFormId: "090-kanto" } });

  await prisma.pokemonSpecies.createMany({
    data: species091120.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 1,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms091120.map((form) => {
      const species = species091120.find((item) => item.dexNumber === form.dexNumber)!;
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
  for (const form of forms091120) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }
  await prisma.pokemonForm.update({
    where: { id: "090-kanto" },
    data: {
      evolutionFamilyNotesZhTw: "已與 #091 刺甲貝整合；#090～#091 分支已可執行清包結論。",
    },
  });
  await prisma.categoryEvaluation.updateMany({
    where: { battleVariant: { pokemonFormId: "090-kanto" }, category: "EVOLUTION_VALUE" },
    data: {
      status: "VERIFIED",
      summaryZhTw: "#090 大舌貝與 #091 刺甲貝已跨批次整合；前階不因進化存在而自動必留。",
      materialToDecision: false,
      checkedAt,
    },
  });

  await prisma.evolutionPath.createMany({
    data: evolutionPairs091120.map(([from, to]) => ({
      id: `evolution-${from}-${to}`,
      fromFormId: from,
      toFormId: to,
      evolutionMethodZhTw: "糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw: "此一般路徑已在 #001～#120 整合資料中核對。",
      requiresEvent: false,
      verifiedAt: checkedAt,
    })),
  });
  await prisma.evolutionPath.createMany({
    data: eventEvolutionPairs091120.map(([from, to]) => ({
      id: `evolution-event-${from}-${to}`,
      fromFormId: from,
      toFormId: to,
      evolutionMethodZhTw: "僅限官方指定活動期間進化；依遊戲內當期介面為準。",
      availabilityNotesZhTw: "此為已由官方活動頁確認的限定地區進化，不得偽裝成常駐關都進化路徑。",
      requiresEvent: true,
      verifiedAt: checkedAt,
    })),
  });

  const variants: Array<{
    id: string;
    form: Form091120;
    variantKey: VariantKey;
    released: boolean;
  }> = [];
  for (const form of forms091120) {
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: variantRelease(form.id, variantKey),
      });
    }
  }
  for (const formId of ["094-kanto", "115-kanto"]) {
    const form = forms091120.find((item) => item.id === formId)!;
    variants.push({
      id: `${formId}-mega`,
      form,
      variantKey: "MEGA",
      released: true,
    });
  }
  for (const formId of ["094-kanto", "099-kanto"]) {
    variants.push({
      id: `${formId}-gigantamax`,
      form: forms091120.find((form) => form.id === formId)!,
      variantKey: "GIGANTAMAX",
      released: true,
    });
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
          : variantKey === "MEGA"
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
      id: `raw-r12-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: pvpokeSpeciesId091120(variant.form, variant.variantKey === "SHADOW"),
      formKey: variant.form.id,
      variantKey: variant.variantKey,
      rank: rank.rank,
      rating: rank.rating === null ? null : String(rank.rating),
      recommendedMoves: JSON.stringify(rank.moves),
      rawNotes: `${rank.leagueLabel} Open／Overall；固定 JSON 陣列索引加一，可穩定重現。`,
      seasonOrVersion: `PvPoke snapshot 2026-09-01 (${pvpokeCommit})`,
      extractionMethod: "固定 2026-09-01 snapshot 的完整 rankings JSON 陣列索引（index + 1）",
      reproducible: true,
      sourceId: rank.sourceId,
      checkedAt: pvpCheckedAt,
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
        if (!variant.released || ["MEGA", "DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
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
          status = variant.variantKey === "MEGA" ? "VERIFIED" : "PARTIALLY_VERIFIED";
          provenance = variant.variantKey === "MEGA" ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = true;
          summaryZhTw =
            variant.variantKey === "SHADOW"
              ? "暗影耿鬼具明確幽靈／毒系 PvE 用途；暗影標準較寬，不設攻擊或總 IV 硬性最低門檻。"
              : variant.variantKey === "MEGA"
                ? "此 Mega 型態具明確 PvE 投資用途；先看物種、型態、招式、等級與既有投入。"
                : "此版本具明確 Max 投資價值；15攻只作同版本長期投資排序，不是淘汰線。";
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          summaryZhTw =
            "未列為本批主要 PvE 投資目標；缺少精確斷點資料時不虛構 15/10/10 與 14/15/15 的勝負。";
        }
      } else if (category === "ROCKET") {
        if (
          variant.form.id === "120-kanto" &&
          ["SHADOW", "PURIFIED"].includes(variant.variantKey)
        ) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw =
            variant.variantKey === "SHADOW"
              ? "官方已確認暗影海星星於 2025 年開放；沒有精確排行榜不等於未推出。"
              : "暗影海星星已開放，因此淨化版本可存在；淨化仍不可逆且沒有獨立榜單。";
        } else {
          status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
          provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
          summaryZhTw = "火箭隊沒有統一排名；此缺項不會單獨觸發暫時保留。";
        }
      } else if (category === "GYM") {
        if (variant.form.id === "113-kanto" && variant.variantKey === "NORMAL") {
          status = "PARTIALLY_VERIFIED";
          provenance = "MANUAL_CURATED";
          materialToDecision = true;
          summaryZhTw =
            "吉利蛋本體可留少量道館防守／收藏候選；不因幸福蛋尚在後批就覆蓋本體用途或保留全部重複。";
        } else {
          status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
          provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
          summaryZhTw = "未找到足以構成主要保留理由的道館用途；次要資料缺失不覆蓋清包結論。";
        }
      } else if (category === "MEGA") {
        if (variant.variantKey === "MEGA") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw =
            "此 Mega 型態已開放且與普通版本分開；只保留對應型態候選，不回推全家族必留。";
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
        if (variant.form.id === "120-kanto" && variant.variantKey === "NORMAL") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw =
            "超級寶石海星已於 2026-08-22 正式登場；海星星只留少量實際 Mega／進化候選。";
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
    const evolutionText =
      variant.form.id === "120-kanto" && variant.variantKey === "NORMAL"
        ? "超級寶石海星已於 2026-08-22 正式登場；普通海星星本身不是 Mega，只留少量可進化成實際 Mega 候選的個體。"
        : ["103-alola", "105-alola", "110-galar"].includes(variant.form.id)
          ? "此地區末階只曾由官方指定活動進化取得；已標為 requiresEvent，不偽裝成常駐關都路徑。"
          : requiresScopedHold(variant.form.id)
            ? "仍有本批範圍外進化；完整家族補齊前先留一隻最佳候選。"
            : isTruncatedComponent(variant.form.id)
              ? "仍有後續分支，但本批已有可執行用途；只另留一隻最佳分支候選，不需保留全部重複。"
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
      id: `r12-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw:
        variant.form.id === "094-kanto" &&
        ["SHADOW", "MEGA", "DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)
          ? variant.variantKey === "SHADOW"
            ? "暗影耿鬼具明確 PvE 用途；暗影標準較寬，不設攻擊或總 IV 硬性最低門檻。"
            : "耿鬼的 Mega／Max 版本具明確獨立用途；先看版本、招式、等級與投入，最後才用 IV 比同版本候選。"
          : variant.variantKey === "GIGANTAMAX" && variant.form.id === "099-kanto"
            ? "超極巨巨鉗蟹具獨立 Max 用途；普通或極巨版本不能替代。"
            : variant.variantKey === "MEGA" && variant.form.id === "094-kanto"
              ? "此 Mega 型態具明確 PvE 投資價值；15攻優先，但14攻高整體IV亦可留。"
              : "未列為本批主要 PvE 投資目標；低價值物種不因100%自動升格為實戰必留。",
      rocketSummaryZhTw:
        variant.form.id === "120-kanto" && variant.variantKey === "SHADOW"
          ? "官方已確認暗影海星星於 2025 年開放；沒有排行榜不等於未推出。"
          : variant.form.id === "120-kanto" && variant.variantKey === "PURIFIED"
            ? "暗影海星星已開放，因此淨化版本可存在；淨化不可逆且不因未來 Mega 自動建議淨化。"
            : "火箭隊沒有統一排名；沒有排行不會單獨觸發暫時保留。",
      gymSummaryZhTw:
        variant.form.id === "113-kanto" && variant.variantKey === "NORMAL"
          ? "吉利蛋本體可留少量道館防守／收藏候選；跨批次家族缺口不覆蓋本體用途。"
          : "未列為主要道館保留目標。",
      gymRating:
        variant.form.id === "113-kanto" && variant.variantKey === "NORMAL"
          ? ("SPECIAL_CASE" as const)
          : ("NOT_APPLICABLE" as const),
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "此 Mega 型態已開放且與普通版本分開；只留對應型態候選，不回推全家族必留。"
          : ["094-kanto", "115-kanto"].includes(variant.form.id)
            ? "本體可作已開放 Mega 的候選，但仍只留實際要投入者。"
            : variant.form.id === "120-kanto" && variant.variantKey === "NORMAL"
              ? "超級寶石海星已於 2026-08-22 正式登場；海星星只作少量進化／Mega 基底候選，普通個體本身仍不是 Mega。"
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
        id: `r12-trace-${variant.id}`,
        evaluationId: `r12-eval-${variant.id}`,
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
        evaluationId: `r12-eval-${variant.id}`,
        sourceId,
        usageZhTw: "Open League／Overall 名次與招式。",
      })),
      ...officialEvidenceLinks
        .filter((link) => link.variantId === variant.id)
        .map((link) => ({
          evaluationId: `r12-eval-${variant.id}`,
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
        id: `r12-issue-${variant.id}`,
        pokemonFormId: variant.form.id,
        battleVariantId: variant.id,
        issueType: "RULE_NOT_COVERED",
        status: "OPEN",
        batchKey: "091-120",
        messageZhTw: "此進化家族仍有 #091～#120 範圍外成員，可能影響安全傳送結論。",
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

async function refreshCrossBatchShellderFamily() {
  const crossVariants = await prisma.battleVariant.findMany({
    where: { pokemonFormId: "090-kanto" },
  });
  for (const variant of crossVariants) {
    const decision: Decision = "TRANSFER_CANDIDATE";
    await prisma.retentionEvaluation.create({
      data: {
        id: `r12-cross-${variant.id}`,
        battleVariantId: variant.id,
        finalDecision: decision,
        provenance: "MANUAL_CURATED",
        pvpSummaryZhTw: "固定 PvPoke Open League／Overall 快照未列為前 250 主要候選。",
        pveSummaryZhTw: "大舌貝與刺甲貝未列為本批主要 PvE 投資目標。",
        rocketSummaryZhTw: "火箭隊缺少統一排名不會觸發暫時保留。",
        gymSummaryZhTw: "未列為主要道館用途。",
        gymRating: "NOT_APPLICABLE",
        megaSummaryZhTw: "此家族沒有本批已確認 Mega 版本。",
        maxBattleSummaryZhTw: "普通個體不等於極巨個體；Max 版本分開評估。",
        evolutionSummaryZhTw: "已與 #091 刺甲貝整合為唯一 #090～#091 家族；跨批次缺口已解除。",
        requiredMovesSummaryZhTw: "沒有招式足以把低用途重複個體自動升格為必留。",
        recommendedIvStrategyZhTw:
          variant.variantKey === "SHADOW"
            ? "暗影取得較少仍可先比較用途；沒有主要用途者不因暗影身分自動必留。"
            : "100%僅可作收藏比較，不會把低實戰價值物種自動升格為必留。",
        reasonZhTw: "#090～#091 已完整且缺乏主要用途；普通重複個體大多可傳。",
        confidence: "HIGH",
        rulesVersion: RULES_VERSION,
        generatedAt: checkedAt,
        reviewed: true,
        reviewedAt: checkedAt,
        reviewStatus: "RESOLVED",
        missingDataSummaryZhTw: "#090～#091 已完整整合，沒有範圍缺口需要暫時保留。",
        reviewNotesZhTw: "#090、#091 已使用同一 familyKey 與連續進化路徑，舊 HOLD／issue 已移除。",
        ruleTraces: {
          create: {
            id: `r12-cross-trace-${variant.id}`,
            ruleKey: "NO_MAJOR_USE",
            ruleVersion: RULES_VERSION,
            priority: 100,
            matched: true,
            resultDecision: decision,
            explanationZhTw: "跨批次家族已完整；低用途家族不因可進化而自動保留。",
          },
        },
      },
    });
  }
}

async function addChangeLogs() {
  const changes = [
    {
      id: "r12-batch-091-120",
      entityType: "Batch",
      entityId: "091-120",
      fieldName: "status",
      previousValue: null,
      newValue: "REVIEWED",
      sourceId: null,
      reason: "新增 #091～#120，沿用立即處理結論、用途、IV 與版本分層。",
    },
    {
      id: "r12-cross-family-090",
      entityType: "EvolutionFamily",
      entityId: "KANTO_FAMILY_090",
      fieldName: "members",
      previousValue: "#090",
      newValue: "#090-#091",
      sourceId: null,
      reason: "將 #091 刺甲貝接回前批 #090 大舌貝，並移除已不必要的 HOLD／issue。",
    },
    {
      id: "r12-gmax-gengar",
      entityType: "BattleVariant",
      entityId: "094-kanto-gigantamax",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-GMAX-GENGAR-2024",
      reason: "普通、暗影、Mega、極巨與超極巨耿鬼分開評估。",
    },
    {
      id: "r12-gmax-kingler",
      entityType: "BattleVariant",
      entityId: "099-kanto-gigantamax",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-GMAX-KINGLER-2025",
      reason: "普通、暗影、極巨與超極巨巨鉗蟹分開評估。",
    },
    {
      id: "r31-gen1-staryu-mega-target-released",
      entityType: "EvolutionFamily",
      entityId: "KANTO_FAMILY_120",
      fieldName: "megaTargetStatus",
      previousValue: "ANNOUNCED_UNRELEASED_2026-08-22",
      newValue: "RELEASED",
      sourceId: "OFF-MEGA-STARMIE-2026",
      reason: "超級寶石海星已於 2026-08-22 正式登場；#120 海星星只需保留少量實際 Mega／進化候選。",
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
        changedAt: change.id === "r31-gen1-staryu-mega-target-released" ? releaseAuditAt : checkedAt,
        rulesVersion: RULES_VERSION,
      },
    });
  }
}

async function main() {
  const laterBatchCount = await prisma.pokemonSpecies.count({ where: { dexNumber: { gte: 121 } } });
  if (laterBatchCount > 0) {
    throw new Error(
      "偵測到 #121 之後的資料；不可單獨重跑 #091～#120，以免刪除跨批次進化關係。請使用完整重建流程依序匯入兩批。",
    );
  }
  await upsertOfficialSources();
  const rankings = await readRankings();
  await rebuildBatch(rankings);
  await refreshCrossBatchShellderFamily();
  await addChangeLogs();
  const counts = await Promise.all([
    prisma.pokemonSpecies.count(),
    prisma.pokemonForm.count(),
    prisma.battleVariant.count(),
    prisma.categoryEvaluation.count(),
    prisma.rawEvaluationData.count(),
  ]);
  console.log(
    `#091～#120 匯入完成：${counts[0]} species、${counts[1]} forms、${counts[2]} variants、${counts[3]} category evaluations、${counts[4]} raw rows。`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
