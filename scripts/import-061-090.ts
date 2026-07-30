import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import {
  evolutionPairs061090,
  forms061090,
  pvpokeSpeciesId061090,
  releasedShadowForms061090,
  species061090,
  truncatedForms061090,
  type Form061090,
} from "../src/data/batch-061-090";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const checkedAt = new Date("2026-07-30T23:45:00+08:00");
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
    sourceId: "OFF-GMAX-MACHAMP-2025",
    variantId: "068-kanto-gigantamax",
    category: "MAX_BATTLE",
    usageZhTw: "確認超極巨怪力已正式開放，並與普通、暗影及極巨版本分開評估。",
  },
  {
    sourceId: "OFF-MEGA-ALAKAZAM-2022",
    variantId: "065-kanto-mega",
    category: "MEGA",
    usageZhTw: "確認超級胡地已正式開放及其活動招式來源。",
  },
  {
    sourceId: "OFF-MEGA-ALAKAZAM-2022",
    variantId: "065-kanto-mega",
    category: "PVE",
    usageZhTw: "確認超級胡地型態已開放，支援其 Mega／PvE 投資評估。",
  },
  {
    sourceId: "OFF-MEGA-VICTREEBEL-2026",
    variantId: "071-kanto-mega",
    category: "MEGA",
    usageZhTw: "確認超級大食花已在全球正式開放。",
  },
  {
    sourceId: "OFF-MEGA-VICTREEBEL-2026",
    variantId: "071-kanto-mega",
    category: "PVE",
    usageZhTw: "確認超級大食花型態已開放，支援其 Mega／PvE 投資評估。",
  },
  {
    sourceId: "OFF-MEGA-SLOWBRO-2021",
    variantId: "080-kanto-mega",
    category: "MEGA",
    usageZhTw: "確認超級呆殼獸已正式開放，僅關都呆殼獸可作此 Mega 候選。",
  },
  {
    sourceId: "OFF-CD-DEC-2023",
    variantId: "062-kanto-normal",
    category: "PVP",
    usageZhTw: "確認蚊香泳士可取得雙倍奉還，供 PvP 招式檢查使用。",
  },
  {
    sourceId: "OFF-CD-DEC-2023",
    variantId: "076-alola-normal",
    category: "PVP",
    usageZhTw: "確認阿羅拉隆隆岩可取得滾動，並維持阿羅拉分支獨立。",
  },
  {
    sourceId: "OFF-CD-DEC-2023",
    variantId: "080-kanto-normal",
    category: "PVP",
    usageZhTw: "確認關都呆殼獸可取得衝浪，供招式檢查使用。",
  },
  {
    sourceId: "OFF-CD-DEC-2023",
    variantId: "080-galar-normal",
    category: "PVP",
    usageZhTw: "確認伽勒爾呆殼獸可取得衝浪，且不與關都型態混用。",
  },
  {
    sourceId: "OFF-CD-POLIWAG-2023",
    variantId: "060-kanto-normal",
    usageZhTw: "確認蚊香蝌蚪可接續蚊香君、蚊香泳士及後續蚊香蛙皇分支。",
  },
  {
    sourceId: "PVE-SHADOW-MACHAMP-20260730",
    variantId: "068-kanto-shadow",
    category: "PVE",
    usageZhTw: "確認暗影怪力目前仍具高價值格鬥系 PvE 用途。",
  },
  {
    sourceId: "PVE-DMAX-ALAKAZAM-20260730",
    variantId: "063-kanto-dynamax",
    category: "MAX_BATTLE",
    usageZhTw: "極巨凱西可進化為極巨胡地；普通凱西不能替代此 Max 版本。",
  },
  {
    sourceId: "PVE-DMAX-ALAKAZAM-20260730",
    variantId: "064-kanto-dynamax",
    category: "MAX_BATTLE",
    usageZhTw: "極巨勇基拉是極巨胡地的進化候選；普通勇基拉不能替代。",
  },
  {
    sourceId: "PVE-DMAX-ALAKAZAM-20260730",
    variantId: "065-kanto-dynamax",
    category: "MAX_BATTLE",
    usageZhTw: "確認極巨胡地版本已開放；普通胡地不能替代極巨版本。",
  },
  {
    sourceId: "OFF-DMAX-MACHOP-2026",
    variantId: "066-kanto-dynamax",
    category: "MAX_BATTLE",
    usageZhTw: "確認極巨腕力已正式提供，並可作極巨怪力進化候選。",
  },
  {
    sourceId: "OFF-DMAX-MACHOP-2026",
    variantId: "067-kanto-dynamax",
    category: "MAX_BATTLE",
    usageZhTw: "極巨豪力是極巨腕力的進化階段；普通豪力不能替代。",
  },
  {
    sourceId: "OFF-DMAX-MACHOP-2026",
    variantId: "068-kanto-dynamax",
    category: "MAX_BATTLE",
    usageZhTw: "極巨怪力由已開放的極巨腕力分支進化，與超極巨怪力分開。",
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
  form: Form061090,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
): RankResult[] {
  const speciesId = pvpokeSpeciesId061090(form, variantKey === "SHADOW");
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
      id: "OFF-GMAX-MACHAMP-2025",
      sourceUrl: "https://pokemongo.com/post/gigantamax-machamp-max-battle-day?hl=en",
      title: "Gigantamax Machamp Max Battle Day",
      summary: "確認超極巨怪力於 2025 年正式登場。",
      publishedAt: new Date("2025-05-08T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
    {
      id: "OFF-MEGA-ALAKAZAM-2022",
      sourceUrl: "https://pokemongo.com/post/psychic-spectacular-2022?hl=en",
      title: "Psychic Spectacular 2022",
      summary: "確認超級胡地首次登場及活動招式精神強念。",
      publishedAt: new Date("2022-08-30T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
    {
      id: "OFF-MEGA-VICTREEBEL-2026",
      sourceUrl: "https://pokemongo.com/news/mega-evolution-2026-update?hl=en",
      title: "Mega Evolution update 2026",
      summary: "確認超級大食花於 2026 年全球正式登場。",
      publishedAt: new Date("2026-02-20T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
    {
      id: "OFF-MEGA-SLOWBRO-2021",
      sourceUrl: "https://pokemongo.com/post/a-very-slow-discovery?hl=en",
      title: "A Very Slow Discovery",
      summary: "確認超級呆殼獸首次登場。",
      publishedAt: new Date("2021-06-01T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
    {
      id: "OFF-CD-POLIWAG-2023",
      sourceUrl: "https://pokemongo.com/en/post/communityday-july-2023-poliwag?hl=en",
      title: "July 2023 Community Day: Poliwag",
      summary: "確認蚊香蝌蚪可進化為蚊香君，之後分支為蚊香泳士與蚊香蛙皇。",
      publishedAt: new Date("2023-07-11T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
    {
      id: "OFF-CD-DEC-2023",
      sourceUrl: "https://pokemongo.com/en/post/community-day-december-2023",
      title: "December 2023 Community Day",
      summary: "確認蚊香泳士、阿羅拉隆隆岩及兩種呆殼獸的活動招式。",
      publishedAt: new Date("2023-11-29T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
    {
      id: "PVE-SHADOW-MACHAMP-20260730",
      sourceUrl: "https://db.pokemongohub.net/pokemon/68-Shadow",
      title: "Shadow Machamp database",
      summary: "目前格鬥系 PvE 評估與建議招式；用於暗影怪力的獨立寬鬆保留規則。",
      publishedAt: null,
      sourceType: "SECONDARY" as const,
    },
    {
      id: "PVE-DMAX-ALAKAZAM-20260730",
      sourceUrl: "https://db.pokemongohub.net/pokemon/65-Dynamax",
      title: "Dynamax Alakazam database",
      summary: "確認極巨胡地已開放；未以次要來源虛構精確屬性排名。",
      publishedAt: null,
      sourceType: "SECONDARY" as const,
    },
    {
      id: "OFF-DMAX-MACHOP-2026",
      sourceUrl: "https://pokemongo.com/news/gigantamax-meowth-max-battle-day-2026?hl=en",
      title: "Gigantamax Meowth Max Battle Day",
      summary: "確認活動限時調查可取得極巨腕力，支援極巨怪力進化線推出狀態。",
      publishedAt: new Date("2026-02-02T00:00:00Z"),
      sourceType: "OFFICIAL" as const,
    },
  ];
  for (const source of sources) {
    await prisma.sourceReference.upsert({
      where: { id: source.id },
      create: {
        id: source.id,
        sourceName: source.sourceType === "OFFICIAL" ? "Pokémon GO" : "Pokémon GO Hub",
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType,
        sourceTitleOriginal: source.title,
        sourceLanguage: "en",
        sourceSummaryZhTw: source.summary,
        accessedAt: checkedAt,
        publishedAt: source.publishedAt,
        dataVersion: "accessed-2026-07-30",
        notes: "第 #061～#090 批次的版本、進化、招式與 PvE 證據。",
      },
      update: {
        sourceSummaryZhTw: source.summary,
        accessedAt: checkedAt,
        publishedAt: source.publishedAt,
        dataVersion: "accessed-2026-07-30",
        notes: "第 #061～#090 批次的版本、進化、招式與 PvE 證據。",
      },
    });
  }
}

function variantRelease(formId: string, variantKey: VariantKey) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms061090.has(formId);
  }
  if (variantKey === "MEGA") {
    return ["065-kanto", "071-kanto", "080-kanto"].includes(formId);
  }
  if (variantKey === "DYNAMAX") {
    return ["063-kanto", "064-kanto", "065-kanto", "066-kanto", "067-kanto", "068-kanto"].includes(
      formId,
    );
  }
  if (variantKey === "GIGANTAMAX") return formId === "068-kanto";
  return false;
}

function isTruncatedComponent(formId: string) {
  return truncatedForms061090.has(formId);
}

function requiresScopedHold(formId: string) {
  return ["081-kanto", "082-kanto", "083-galar", "090-kanto"].includes(formId);
}

function hasMajorPveValue(formId: string, variantKey: VariantKey) {
  if (variantKey === "SHADOW" && formId === "068-kanto") return true;
  if (variantKey === "NORMAL" && formId === "068-kanto") return true;
  if (variantKey === "MEGA" && ["065-kanto", "071-kanto"].includes(formId)) return true;
  if (variantKey === "DYNAMAX" && ["065-kanto", "068-kanto"].includes(formId)) return true;
  if (variantKey === "GIGANTAMAX" && formId === "068-kanto") return true;
  return false;
}

function isMegaOrMaxCandidate(formId: string, variantKey: VariantKey) {
  return (
    (variantKey === "MEGA" && ["065-kanto", "071-kanto", "080-kanto"].includes(formId)) ||
    (variantKey === "DYNAMAX" &&
      ["063-kanto", "064-kanto", "065-kanto", "066-kanto", "067-kanto", "068-kanto"].includes(
        formId,
      )) ||
    (variantKey === "GIGANTAMAX" && formId === "068-kanto")
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
  for (const [from, to] of evolutionPairs061090) {
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
  form: Form061090;
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
      reason: "超極巨怪力是高價值獨立 Max 版本，至少保留一隻；普通或極巨怪力不能替代。",
    };
  }
  if (variantKey === "PURIFIED") {
    return {
      decision: "TRANSFER_CANDIDATE",
      ruleKey: "NO_MAJOR_USE",
      reason: "淨化沒有獨立榜單，且淨化不可逆；不因低總 IV 自動建議淨化。",
    };
  }
  if (requiresScopedHold(form.id)) {
    return {
      decision: "HOLD_FOR_NOW",
      ruleKey: "INCOMPLETE_EVOLUTION_FAMILY",
      reason: "後續重要進化可能影響保留安全；完整家族補齊前只留一隻最佳候選。",
    };
  }
  if (hasMajorPveValue(form.id, variantKey)) {
    return {
      decision: "KEEP",
      ruleKey: "MAJOR_BATTLE_VALUE",
      reason:
        variantKey === "SHADOW"
          ? "暗影怪力具高價值 PvE 用途；至少留一隻，不設攻擊或總 IV 硬性淘汰線。"
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
    where: { species: { dexNumber: { gte: 61, lte: 90 } } },
    select: { id: true },
  });
  const oldBatchFormIds = oldBatchForms.map((item) => item.id);
  if (oldBatchFormIds.length) {
    await prisma.pokemonSpecies.deleteMany({ where: { dexNumber: { gte: 61, lte: 90 } } });
  }
  await prisma.retentionEvaluation.deleteMany({ where: { id: { startsWith: "r10-cross-" } } });
  await prisma.changeLog.deleteMany({ where: { id: { startsWith: "r10-" } } });
  await prisma.dataIssue.deleteMany({
    where: { pokemonFormId: "060-kanto", batchKey: "031-060" },
  });

  await prisma.pokemonSpecies.createMany({
    data: species061090.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 1,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms061090.map((form) => {
      const species = species061090.find((item) => item.dexNumber === form.dexNumber)!;
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
  for (const form of forms061090) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }
  await prisma.pokemonForm.update({
    where: { id: "060-kanto" },
    data: {
      evolutionFamilyNotesZhTw:
        "已與 #061 蚊香君、#062 蚊香泳士整合；#186 蚊香蛙皇分支仍待後續批次。",
    },
  });

  await prisma.evolutionPath.createMany({
    data: evolutionPairs061090.map(([from, to]) => ({
      id: `evolution-${from}-${to}`,
      fromFormId: from,
      toFormId: to,
      evolutionMethodZhTw: "糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw: "此路徑已在 #001～#090 整合資料中核對。",
      requiresEvent: false,
      verifiedAt: checkedAt,
    })),
  });

  const variants: Array<{
    id: string;
    form: Form061090;
    variantKey: VariantKey;
    released: boolean;
  }> = [];
  for (const form of forms061090) {
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: variantRelease(form.id, variantKey),
      });
    }
  }
  for (const formId of ["065-kanto", "071-kanto", "080-kanto"]) {
    const form = forms061090.find((item) => item.id === formId)!;
    variants.push({
      id: `${formId}-mega`,
      form,
      variantKey: "MEGA",
      released: true,
    });
  }
  variants.push({
    id: "068-kanto-gigantamax",
    form: forms061090.find((form) => form.id === "068-kanto")!,
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
          ? "超極巨怪力是獨立 Max 版本；不得與普通、暗影或極巨怪力混為一談。"
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
      id: `raw-r10-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: pvpokeSpeciesId061090(variant.form, variant.variantKey === "SHADOW"),
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
          status = variant.variantKey === "NORMAL" ? "PARTIALLY_VERIFIED" : "VERIFIED";
          provenance = variant.variantKey === "NORMAL" ? "MANUAL_CURATED" : "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw =
            variant.variantKey === "SHADOW"
              ? "暗影怪力具高價值格鬥系 PvE 用途；暗影標準較寬，不設攻擊或總 IV 硬性最低門檻。"
              : variant.variantKey === "MEGA"
                ? "此 Mega 型態具明確 PvE 投資用途；先看物種、型態、招式、等級與既有投入。"
                : "怪力具可用的格鬥系 PvE 價值；15攻只作同種長期投資排序，不是淘汰線。";
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
        if (variant.variantKey === "MEGA") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw =
            variant.form.id === "080-kanto"
              ? "超級呆殼獸已開放，但投資優先度較低；只留實際要使用的候選。"
              : "此 Mega 型態已開放且有明確戰鬥用途；只保留對應型態候選，不回推全家族必留。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都值得保留。";
        }
      } else if (category === "MAX_BATTLE") {
        if (variant.variantKey === "GIGANTAMAX") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = "超極巨怪力已開放且具明確 Max 用途；普通或極巨怪力不能替代。";
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
        if (requiresScopedHold(variant.form.id)) {
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
    const evolutionText = requiresScopedHold(variant.form.id)
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
      id: `r10-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw:
        variant.form.id === "068-kanto" &&
        ["NORMAL", "SHADOW", "DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)
          ? variant.variantKey === "SHADOW"
            ? "暗影怪力具高價值 PvE 用途；暗影標準較寬，不設攻擊或總 IV 硬性最低門檻。"
            : "怪力具格鬥系 PvE／Max 用途；先看版本、招式、等級與投入，最後才用 IV 比同種候選。"
          : variant.variantKey === "MEGA" && ["065-kanto", "071-kanto"].includes(variant.form.id)
            ? "此 Mega 型態具明確 PvE 投資價值；15攻優先，但14攻高整體IV亦可留。"
            : "未列為本批主要 PvE 投資目標；低價值物種不因100%自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有排行不會單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留目標。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? variant.form.id === "080-kanto"
            ? "超級呆殼獸已開放但投資優先度較低；只留實際要使用的關都型態候選。"
            : "此 Mega 型態已開放且具明確用途；只留對應型態候選，不回推全家族必留。"
          : ["065-kanto", "071-kanto", "080-kanto"].includes(variant.form.id)
            ? "本體可作已開放 Mega 的候選，但仍只留實際要投入者。"
            : "此型態沒有已確認 Mega 用途；不因同家族其他版本有用途而升格。",
      maxBattleSummaryZhTw:
        variant.variantKey === "GIGANTAMAX"
          ? "超極巨怪力已開放；只保留真正的超極巨版本，普通與極巨版本不能替代。"
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
        id: `r10-trace-${variant.id}`,
        evaluationId: `r10-eval-${variant.id}`,
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
        evaluationId: `r10-eval-${variant.id}`,
        sourceId,
        usageZhTw: "Open League／Overall 名次與招式。",
      })),
      ...officialEvidenceLinks
        .filter((link) => link.variantId === variant.id)
        .map((link) => ({
          evaluationId: `r10-eval-${variant.id}`,
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
        id: `r10-issue-${variant.id}`,
        pokemonFormId: variant.form.id,
        battleVariantId: variant.id,
        issueType: "RULE_NOT_COVERED",
        status: "OPEN",
        batchKey: "061-090",
        messageZhTw: "此進化家族仍有 #061～#090 範圍外成員，可能影響安全傳送結論。",
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

async function refreshCrossBatchPoliwagFamily() {
  const crossVariants = await prisma.battleVariant.findMany({
    where: { pokemonFormId: "060-kanto" },
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
        id: `r10-cross-${variant.id}`,
        battleVariantId: variant.id,
        finalDecision: decision,
        provenance: "MANUAL_CURATED",
        pvpSummaryZhTw: "前階本體未列為本批主要 Open League 目標。",
        pveSummaryZhTw: "前階本體未列為主要 PvE 投資目標。",
        rocketSummaryZhTw: "火箭隊缺少統一排名不會觸發暫時保留。",
        gymSummaryZhTw: "未列為主要道館用途。",
        gymRating: "NOT_APPLICABLE",
        megaSummaryZhTw: "此家族目前沒有已確認 Mega 版本。",
        maxBattleSummaryZhTw: "普通個體不等於極巨個體；Max 版本分開評估。",
        evolutionSummaryZhTw:
          "已與 #061 蚊香君、#062 蚊香泳士整合；前階主要作符合條件的蚊香泳士或未來蚊香蛙皇候選。",
        requiredMovesSummaryZhTw: "進化為蚊香泳士後再核對雙倍奉還及 PvP 招式組。",
        recommendedIvStrategyZhTw:
          variant.variantKey === "SHADOW"
            ? "暗影標準較寬；先保留少量進化候選，不設硬性最低 IV。"
            : "依蚊香泳士 GL 候選的聯盟 IV Rank 比較；另留一隻後續分支候選即可。",
        reasonZhTw: eligible
          ? "只留符合蚊香泳士 PvP 或後續蚊香蛙皇用途的進化候選；其餘普通重複可傳。"
          : "此版本沒有獨立保留理由，亦不因家族有用途而自動升格。",
        confidence: "HIGH",
        rulesVersion: RULES_VERSION,
        generatedAt: checkedAt,
        reviewed: true,
        reviewedAt: checkedAt,
        reviewStatus: "RESOLVED",
        missingDataSummaryZhTw: "#060～#062 已整合；#186 分支未納入但不影響目前可執行結論。",
        reviewNotesZhTw: "#060、#061、#062 已使用同一 familyKey 與連續進化路徑。",
        ruleTraces: {
          create: {
            id: `r10-cross-trace-${variant.id}`,
            ruleKey,
            ruleVersion: RULES_VERSION,
            priority: 100,
            matched: true,
            resultDecision: decision,
            explanationZhTw: eligible
              ? "僅作後續進化候選，不把蚊香蝌蚪本體誤標為獨立用途。"
              : "家族用途不會自動套用到此版本。",
          },
        },
      },
    });
    if (variant.id === "060-kanto-normal") {
      await prisma.evaluationSource.create({
        data: {
          evaluationId: `r10-cross-${variant.id}`,
          sourceId: "OFF-CD-POLIWAG-2023",
          usageZhTw: "跨批次家族與雙分支進化證據。",
        },
      });
    }
  }
}

async function addChangeLogs() {
  const changes = [
    {
      id: "r10-batch-061-090",
      entityType: "Batch",
      entityId: "061-090",
      fieldName: "status",
      previousValue: null,
      newValue: "REVIEWED",
      sourceId: null,
      reason: "新增 #061～#090，沿用立即處理結論、用途、IV 與版本分層。",
    },
    {
      id: "r10-cross-family-060",
      entityType: "EvolutionFamily",
      entityId: "KANTO_FAMILY_060",
      fieldName: "members",
      previousValue: "#060",
      newValue: "#060-#062",
      sourceId: "OFF-CD-POLIWAG-2023",
      reason: "將 #061～#062 接回前批蚊香蝌蚪家族，同時保留 #186 後續分支提示。",
    },
    {
      id: "r10-gmax-machamp",
      entityType: "BattleVariant",
      entityId: "068-kanto-gigantamax",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-GMAX-MACHAMP-2025",
      reason: "普通、暗影、極巨與超極巨怪力分開評估。",
    },
    {
      id: "r10-mega-victreebel",
      entityType: "BattleVariant",
      entityId: "071-kanto-mega",
      fieldName: "releaseStatus",
      previousValue: null,
      newValue: "RELEASED",
      sourceId: "OFF-MEGA-VICTREEBEL-2026",
      reason: "新增已正式開放的超級大食花，不把 Mega 用途回推到全部前階。",
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
  await refreshCrossBatchPoliwagFamily();
  await addChangeLogs();
  const counts = await Promise.all([
    prisma.pokemonSpecies.count(),
    prisma.pokemonForm.count(),
    prisma.battleVariant.count(),
    prisma.categoryEvaluation.count(),
    prisma.rawEvaluationData.count(),
  ]);
  console.log(
    `#061～#090 匯入完成：${counts[0]} species、${counts[1]} forms、${counts[2]} variants、${counts[3]} category evaluations、${counts[4]} raw rows。`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
