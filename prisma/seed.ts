import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database";
import {
  batchSpecies,
  evolutionPairs,
  extraForms,
  familyKeyByDex,
  gigantamaxCandidateForms,
  megaVariants,
  pvpokeSpeciesId,
  toFormId,
} from "../src/data/batch-001-030";
import { evaluateRetention } from "../src/rules/engine";
import { RULES_VERSION } from "../src/rules/rules";
import { integrateResearchData } from "../src/data/research-import";

const adapter = new PrismaBetterSqlite3({
  url: getDatabaseUrl(),
});
const prisma = new PrismaClient({ adapter });
const checkedAt = new Date("2026-07-15T00:00:00+08:00");

interface PvpokeEntry {
  speciesId: string;
  speciesName: string;
  rating: number;
  moveset?: string[];
}

interface RankingRecord extends PvpokeEntry {
  rank: number;
}

const cpLeague = [
  { cp: 1500, league: "GREAT", sourceId: "pvpoke-gl-20260715" },
  { cp: 2500, league: "ULTRA", sourceId: "pvpoke-ul-20260715" },
  { cp: 10000, league: "MASTER", sourceId: "pvpoke-ml-20260715" },
] as const;

async function readRankings() {
  const result = new Map<string, Map<string, RankingRecord>>();
  for (const item of cpLeague) {
    const json = await readFile(`data/sources/pvpoke/rankings-${item.cp}.json`, "utf8");
    const rows = JSON.parse(json.replace(/^\uFEFF/, "")) as PvpokeEntry[];
    result.set(
      item.league,
      new Map(rows.map((row, index) => [row.speciesId, { ...row, rank: index + 1 }])),
    );
  }
  return result;
}

async function seedSources() {
  let version = "pvpoke/master";
  try {
    const raw = await readFile("data/sources/pvpoke/source-version.json", "utf8");
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, "")) as Array<{ sha?: string }>;
    if (parsed[0]?.sha) version = parsed[0].sha;
  } catch {
    // 保留可重跑的分支版本；驗證工具會提示缺少快照版本。
  }

  const sources = cpLeague.map((item) => ({
    id: item.sourceId,
    sourceName: "PvPoke",
    sourceUrl: `https://raw.githubusercontent.com/pvpoke/pvpoke/${version}/src/data/rankings/all/overall/rankings-${item.cp}.json`,
    sourceType: "PVP" as const,
    sourceTitleOriginal: `PvPoke Open League Overall Rankings (${item.cp} CP JSON)`,
    sourceLanguage: "en",
    sourceSummaryZhTw: "PvPoke 公開儲存庫的物種整體排名資料；此排名不是個體 IV Rank。",
    accessedAt: checkedAt,
    publishedAt: null,
    dataVersion: version,
    notes: "本機原始快照保存於 data/sources/pvpoke。",
  }));
  await prisma.sourceReference.createMany({
    data: [
      ...sources,
      {
        id: "official-shadow-mechanic-20260715",
        sourceName: "Pokémon GO Help Center",
        sourceUrl:
          "https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/2396-shadow-pokemon-purified-pokemon/",
        sourceType: "OFFICIAL",
        sourceTitleOriginal: "Shadow Pokémon & Purified Pokémon",
        sourceLanguage: "en",
        sourceSummaryZhTw: "官方說明暗影輸出加成、承受傷害、遷怒、淨化與報恩機制。",
        accessedAt: checkedAt,
        publishedAt: null,
        dataVersion: "Help Center accessed 2026-07-15",
        notes: "機制來源；不單獨證明特定物種的暗影推出狀態。",
      },
      {
        id: "official-mega-mechanic-20260715",
        sourceName: "Pokémon GO Help Center",
        sourceUrl:
          "https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/3328-what-is-mega-evolution/",
        sourceType: "OFFICIAL",
        sourceTitleOriginal: "What is Mega Evolution?",
        sourceLanguage: "en",
        sourceSummaryZhTw: "官方說明 Mega 進化、能力提升與同時只能啟用一隻 Mega 的限制。",
        accessedAt: checkedAt,
        publishedAt: null,
        dataVersion: "Help Center accessed 2026-07-15",
        notes: "機制來源。",
      },
      {
        id: "official-mega-charizard-forms-20260715",
        sourceName: "Pokémon GO Help Center",
        sourceUrl:
          "https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/3332-how-to-mega-evolve-your-pokemon/",
        sourceType: "OFFICIAL",
        sourceTitleOriginal: "How can I Mega Evolve my Pokémon?",
        sourceLanguage: "en",
        sourceSummaryZhTw: "官方明確說明噴火龍可分別 Mega 進化成 X 與 Y 型態。",
        accessedAt: checkedAt,
        publishedAt: null,
        dataVersion: "Help Center accessed 2026-07-15",
        notes: "支援 Mega X／Y 分開建模。",
      },
    ],
  });
}

async function seedSpeciesAndForms() {
  const extraByDex = new Map<number, (typeof extraForms)[number][]>();
  for (const form of extraForms) {
    extraByDex.set(form.dexNumber, [...(extraByDex.get(form.dexNumber) ?? []), form]);
  }

  for (const species of batchSpecies) {
    const dex = String(species.dexNumber).padStart(3, "0");
    const speciesId = `species-${dex}`;
    await prisma.pokemonSpecies.create({
      data: {
        id: speciesId,
        dexNumber: species.dexNumber,
        nameEn: species.nameEn,
        nameZhTw: species.nameZhTw,
        generation: 1,
        familyKey: familyKeyByDex[species.dexNumber],
      },
    });
    const aliases = [species.nameEn, species.nameZhTw, ...(species.aliases ?? [])];
    await prisma.pokemonForm.create({
      data: {
        id: toFormId(species.dexNumber),
        speciesId,
        formKey: "KANTO",
        formNameEn: "Kanto",
        formNameZhTw: "關都",
        regionKey: "KANTO",
        types: JSON.stringify(species.types),
        searchAliases: JSON.stringify(aliases),
        evolutionFamilyNotesZhTw:
          species.dexNumber === 30
            ? "可繼續進化為 #031 尼多后；#031 不在本批研究範圍。"
            : "本批已將範圍內的進化關係結構化。",
        isReleasedInPokemonGo: true,
        releaseVerifiedAt: checkedAt,
      },
    });
    for (const form of extraByDex.get(species.dexNumber) ?? []) {
      await prisma.pokemonForm.create({
        data: {
          id: toFormId(species.dexNumber, form.suffix),
          speciesId,
          formKey: form.formKey,
          formNameEn: form.formNameEn,
          formNameZhTw: form.formNameZhTw,
          regionKey: form.regionKey,
          types: JSON.stringify(form.types),
          searchAliases: JSON.stringify(form.aliases),
          evolutionFamilyNotesZhTw: "地區型態與關都型態分開評估。",
          isReleasedInPokemonGo: true,
          releaseVerifiedAt: checkedAt,
        },
      });
    }
  }

  for (const [fromFormId, toFormIdValue] of evolutionPairs) {
    await prisma.evolutionPath.create({
      data: {
        id: `evo-${fromFormId}-${toFormIdValue}`,
        fromFormId,
        toFormId: toFormIdValue,
        evolutionMethodZhTw: "使用該進化家族糖果進化",
        availabilityNotesZhTw: "一般進化；實際糖果數與活動條件仍應依遊戲內顯示確認。",
        requiresEvent: false,
        verifiedAt: checkedAt,
      },
    });
    await prisma.pokemonForm.update({
      where: { id: toFormIdValue },
      data: { evolvesFromFormId: fromFormId },
    });
  }
}

function variantsForForm(formId: string) {
  const values = ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"];
  values.push(...(megaVariants[formId] ?? []));
  if (gigantamaxCandidateForms.has(formId)) values.push("GIGANTAMAX");
  return values;
}

function bestRankFor(rankings: Map<string, Map<string, RankingRecord>>, speciesId: string) {
  return cpLeague
    .map((item) => ({ ...item, row: rankings.get(item.league)?.get(speciesId) }))
    .filter((item): item is (typeof cpLeague)[number] & { row: RankingRecord } => Boolean(item.row))
    .sort((a, b) => a.row.rank - b.row.rank)[0];
}

function descendants(formId: string) {
  const output = new Set<string>();
  const queue = [formId];
  while (queue.length) {
    const cursor = queue.shift()!;
    for (const [, to] of evolutionPairs.filter(([from]) => from === cursor)) {
      if (output.has(to)) continue;
      output.add(to);
      queue.push(to);
    }
  }
  return [...output];
}

async function seedVariantsAndEvaluations(rankings: Map<string, Map<string, RankingRecord>>) {
  const forms = await prisma.pokemonForm.findMany({ include: { species: true } });
  for (const form of forms) {
    for (const variantKey of variantsForForm(form.id)) {
      const pvpokeId = pvpokeSpeciesId(form.id, variantKey);
      const best = bestRankFor(rankings, pvpokeId);
      const isNormal = variantKey === "NORMAL";
      const isShadow = variantKey === "SHADOW";
      const isPurified = variantKey === "PURIFIED";
      const isMega = variantKey.startsWith("MEGA");
      const released =
        isNormal || isMega ? true : isShadow || isPurified ? (best ? true : null) : null;
      const variantId = `${form.id}-${variantKey.toLowerCase().replaceAll("_", "-")}`;
      await prisma.battleVariant.create({
        data: {
          id: variantId,
          pokemonFormId: form.id,
          variantKey: variantKey as never,
          isReleased: released,
          releaseVerifiedAt: released === null ? null : checkedAt,
          notesZhTw:
            released === null
              ? "目前缺少能確認此戰鬥版本推出狀態的官方物種級來源。"
              : isPurified
                ? "淨化版本必須由已推出的暗影版本產生，與暗影分開評估。"
                : "此戰鬥版本以獨立記錄評估。",
        },
      });

      const rawRows: Array<{ sourceId: string; league: string; row: RankingRecord }> = [];
      if (isNormal || isShadow) {
        for (const item of cpLeague) {
          const row = rankings.get(item.league)?.get(pvpokeId);
          if (!row) continue;
          rawRows.push({ sourceId: item.sourceId, league: item.league, row });
          await prisma.rawEvaluationData.create({
            data: {
              id: `raw-${variantId}-${item.league.toLowerCase()}`,
              battleVariantId: variantId,
              category: "PVP",
              league: item.league,
              rank: row.rank,
              rating: String(row.rating),
              score: row.rating,
              tier: null,
              recommendedMoves: JSON.stringify(row.moveset ?? []),
              rawNotes:
                "PvPoke 物種整體排名；不代表此物種內部的個體 IV Rank。排名以 JSON 陣列位置計算。",
              seasonOrVersion: "PvPoke master snapshot 2026-07-15",
              sourceId: item.sourceId,
              checkedAt,
            },
          });
        }
      }

      const descendantBest = descendants(form.id)
        .map((id) => bestRankFor(rankings, pvpokeSpeciesId(id, "NORMAL")))
        .filter(Boolean)
        .sort((a, b) => a!.row.rank - b!.row.rank)[0];
      const majorPvp = Boolean(best && best.row.rank <= 100);
      const conditionalPvp = Boolean(best && best.row.rank > 100 && best.row.rank <= 250);
      const valuableEvolution = Boolean(descendantBest && descendantBest.row.rank <= 100);
      const result = evaluateRetention({
        hasReliableSources: rawRows.length > 0 || (isMega && form.id === "006-kanto"),
        releaseStatusKnown: released !== null,
        hasSourceConflict: false,
        hasStaleCriticalData: false,
        majorPvpValue: majorPvp,
        highPveValue: false,
        shadowPveAdvantage: false,
        importantMega: false,
        importantMaxBattle: false,
        highGymValue: false,
        valuableEvolution,
        specialCupOnly: false,
        requiresSpecificMove: Boolean(best?.row.moveset?.length),
        requiresSpecificIv: conditionalPvp,
        megaCandidateOnly: isMega,
        maxCandidateOnly: variantKey === "DYNAMAX" || variantKey === "GIGANTAMAX",
        limitedGymUse: false,
        speciesBattleValueLow: false,
        normalHighIvOnly: false,
      });
      const pvpSummary = rawRows.length
        ? rawRows
            .map(({ league, row }) => `${league} 物種排名 #${row.rank}（評分 ${row.rating}）`)
            .join("；")
        : "尚未取得此戰鬥版本可用的 PvPoke 主要聯盟資料。";
      const evaluationId = `evaluation-${variantId}-20260715`;
      await prisma.retentionEvaluation.create({
        data: {
          id: evaluationId,
          battleVariantId: variantId,
          finalDecision: result.finalDecision,
          pvpSummaryZhTw: pvpSummary,
          pveSummaryZhTw: "尚未取得可完整驗證的 Pokebattler 原始輸出，列入資料待補清單。",
          rocketSummaryZhTw: isShadow
            ? "暗影輸出與承傷機制已由官方說明確認；物種級火箭隊實用性仍待研究。"
            : "物種級火箭隊實用性尚待研究。",
          gymSummaryZhTw: "尚未取得足以支持物種級道館結論的資料。",
          gymRating: "NOT_APPLICABLE",
          megaSummaryZhTw: isMega
            ? "Mega 型態已獨立建模；物種級團體戰價值尚待 Pokebattler／GO Hub 交叉確認。"
            : megaVariants[form.id]
              ? "此型態具有 Mega 候選；只應保留少量符合15攻／96%以上優先門檻的個體，價值仍待交叉確認。"
              : "目前沒有本型態的 Mega 記錄。",
          maxBattleSummaryZhTw:
            variantKey === "DYNAMAX" || variantKey === "GIGANTAMAX"
              ? "Max 個體與一般老個體分開；推出與戰鬥價值仍待官方及可靠資料確認。"
              : "一般個體不會因物種可 Dynamax 而自動取得 Max 能力。",
          evolutionSummaryZhTw: valuableEvolution
            ? `後續進化在目前 PvPoke 主要聯盟中曾進入前 100 名，前階不可直接視為可傳送。`
            : descendants(form.id).length
              ? "具有範圍內後續進化，但進化後的完整戰鬥價值仍待審核。"
              : form.species.dexNumber === 30
                ? "可進化為本批範圍外的 #031 尼多后；本批不延伸研究。"
                : "本批範圍內沒有後續進化。",
          requiredMovesSummaryZhTw: best?.row.moveset?.length
            ? `PvPoke 建議招式代碼：${best.row.moveset.join("／")}；限定招式取得方式須另行確認。`
            : "尚無已驗證的必要招式結論。",
          recommendedIvStrategyZhTw: result.recommendedIvStrategyZhTw,
          reasonZhTw: result.reasonZhTw,
          confidence: result.confidence,
          rulesVersion: RULES_VERSION,
          generatedAt: checkedAt,
          reviewed: false,
          reviewedAt: null,
          reviewStatus: "DATA_PENDING",
          missingDataSummaryZhTw: "PvE、道館、Max、限定招式或推出狀態仍有資料待補。",
          reviewNotesZhTw: "系統已依現有證據產生暫定建議；資料維護者補齊來源後可重新計算。",
        },
      });
      await prisma.evaluationRuleTrace.createMany({
        data: result.traces.map((trace, index) => ({
          id: `trace-${variantId}-${index}`,
          evaluationId,
          ruleKey: trace.ruleKey,
          ruleVersion: RULES_VERSION,
          priority: trace.priority,
          matched: trace.matched,
          resultDecision: trace.resultDecision,
          explanationZhTw: trace.explanationZhTw,
        })),
      });
      if (rawRows.length) {
        await prisma.evaluationSource.createMany({
          data: rawRows.map(({ sourceId, league }) => ({
            evaluationId,
            sourceId,
            usageZhTw: `支持 ${league} PvP 物種排名與招式資料。`,
          })),
        });
      }
      if (isShadow || isPurified) {
        await prisma.evaluationSource.create({
          data: {
            evaluationId,
            sourceId: "official-shadow-mechanic-20260715",
            usageZhTw: "支持暗影、遷怒、淨化不可逆與報恩機制說明。",
          },
        });
      }
      if (isMega) {
        await prisma.evaluationSource.create({
          data: {
            evaluationId,
            sourceId:
              form.id === "006-kanto"
                ? "official-mega-charizard-forms-20260715"
                : "official-mega-mechanic-20260715",
            usageZhTw: "支持 Mega 機制與型態分離說明；不代表 PvE 排名已完成。",
          },
        });
      }

      const issues: Array<{
        type: "RULE_NOT_COVERED" | "MISSING_SOURCE" | "UNKNOWN_RELEASE_STATUS";
        message: string;
      }> = [];
      issues.push({ type: "RULE_NOT_COVERED", message: "初始資料仍待規則引擎重新計算。" });
      if (released === null) {
        issues.push({
          type: "UNKNOWN_RELEASE_STATUS",
          message: "戰鬥版本推出狀態缺少官方物種級證據。",
        });
      }
      if (!rawRows.length) {
        issues.push({ type: "MISSING_SOURCE", message: "缺少此戰鬥版本的主要 PvP 原始資料。" });
      }
      if (result.finalDecision === "HOLD_FOR_NOW") {
        issues.push({
          type: "MISSING_SOURCE",
          message: "缺少足以完成保留／傳送判斷的 PvE、道館或 Max 交叉資料。",
        });
      }
      await prisma.dataIssue.createMany({
        data: issues.map((issue, index) => ({
          id: `issue-${variantId}-${issue.type.toLowerCase()}-${index}`,
          pokemonFormId: form.id,
          battleVariantId: variantId,
          issueType: issue.type,
          status: "OPEN",
          batchKey: "001-030",
          messageZhTw: issue.message,
          affectsFinalDecision: result.finalDecision === "HOLD_FOR_NOW",
          provisionalDecision: result.finalDecision,
          suggestedResearchActionZhTw: "補齊對應原始來源後重新執行規則引擎。",
          lastResearchedAt: checkedAt,
          detectedAt: checkedAt,
        })),
      });
      await prisma.changeLog.create({
        data: {
          id: `change-${variantId}-decision-20260715`,
          entityType: "RetentionEvaluation",
          entityId: evaluationId,
          fieldName: "decision",
          previousValue: null,
          newValue: result.finalDecision,
          sourceId: rawRows[0]?.sourceId ?? null,
          changeReasonZhTw: "匯入第一批研究資料後由集中式規則引擎產生初始結論。",
          changedAt: checkedAt,
          rulesVersion: RULES_VERSION,
        },
      });
    }
  }
}

async function main() {
  const existingSpecies = await prisma.pokemonSpecies.count();
  if (existingSpecies > 0) {
    console.log(
      `資料庫已有 ${existingSpecies} 筆物種；為保留來源、歷史評估與變更紀錄，seed 不會清空或覆寫現有資料。`,
    );
    return;
  }
  const rankings = await readRankings();
  await seedSources();
  await seedSpeciesAndForms();
  await seedVariantsAndEvaluations(rankings);
  await integrateResearchData(prisma, checkedAt, { deferMissingEvolutionPaths: true });
  const counts = await Promise.all([
    prisma.pokemonSpecies.count(),
    prisma.pokemonForm.count(),
    prisma.battleVariant.count(),
    prisma.rawEvaluationData.count(),
    prisma.retentionEvaluation.count(),
  ]);
  console.log(
    `Seed 完成：${counts[0]} 物種、${counts[1]} 型態、${counts[2]} 戰鬥版本、${counts[3]} 筆原始資料、${counts[4]} 筆評估。`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
