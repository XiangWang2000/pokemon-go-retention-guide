import "dotenv/config";
import { readFileSync } from "node:fs";
import {
  LEGACY_CATEGORIES as categories,
  buildLegacyEvidenceLinks,
  buildLegacyPvpSourceRows,
  findLegacyRanks,
  isLegacyVariantReleased,
  legacyInitialDecision,
  legacyInitialDisposition,
  legacyRankSummary,
  readLegacyRankings,
  upsertLegacySources,
  type LegacyCategory as Category,
  type LegacyDecision as Decision,
  type LegacyLeagueKey as LeagueKey,
  type LegacyOfficialResearch as OfficialResearch,
  type LegacyRankResult as RankResult,
  type LegacyRankingRow as RankingRow,
  type LegacyVariantKey as VariantKey,
} from "./legacy-import-shared";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";
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
} from "../../src/data/batch-152-181";
import { RULES_VERSION } from "../../src/rules/rules";

const databaseUrl = getDatabaseUrl();
assertDisposableDatabase(databaseUrl);

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

const batchStart = 152;
const batchEnd = 181;
const checkedAt = new Date("2026-08-08T18:00:00+08:00");
const pvpokeCommit = "86847e535b7e0a0f4e91f9628b3fc713ae6adca7";
const officialResearch = JSON.parse(
  readFileSync(
    new URL("../../research_notes/sources/official-152-181.json", import.meta.url),
    "utf8",
  ),
) as OfficialResearch;

const officialEvidenceLinks = buildLegacyEvidenceLinks(officialResearch);

const variantReleaseSets = {
  shadow: releasedShadowForms152181,
  mega: releasedMegaForms152181,
  dynamax: releasedDynamaxForms152181,
  gigantamax: releasedGigantamaxForms152181,
};

type VariantRecord = {
  id: string;
  form: Form152181;
  variantKey: VariantKey;
  released: boolean;
};

async function rebuildBatch(rankings: Map<LeagueKey, RankingRow[]>) {
  await prisma.changeLog.deleteMany({
    where: {
      id: {
        in: [
          "r19-batch-152-181",
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
        searchAliases: JSON.stringify([
          ...new Set([...form.aliases, species.nameEn, species.nameZhTw]),
        ]),
        // Insert the batch before wiring self-referencing evolution rows; SQLite
        // enforces this foreign key immediately during createMany.
        evolvesFromFormId: null,
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
  for (const form of forms152181) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }

  await prisma.pokemonForm.update({
    where: { id: "042-kanto" },
    data: {
      evolutionFamilyNotesZhTw: forms152181.find((form) => form.id === "169-johto")!
        .evolutionFamilyNotesZhTw,
    },
  });

  await prisma.evolutionPath.createMany({
    data: evolutionPairs152181.map(([fromFormId, toFormId]) => ({
      id: `evolution-r19-${fromFormId}-${toFormId}`,
      fromFormId,
      toFormId,
      evolutionMethodZhTw:
        fromFormId.startsWith("17") && ["025-kanto", "035-kanto", "039-kanto"].includes(toFormId)
          ? "提升友好度後消耗糖果進化"
          : "消耗糖果進化；特殊條件以遊戲內當期介面為準。",
      availabilityNotesZhTw:
        toFormId === "169-johto"
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
        released: isLegacyVariantReleased(form.id, variantKey, variantReleaseSets),
      });
    }
  }
  for (const special of specialVariants152181) {
    const form = forms152181.find((item) => item.id === special.formId)!;
    variants.push({
      id: special.id,
      form,
      variantKey: special.variantKey,
      released: special.released,
    });
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
      inheritanceMode:
        variantKey === "PURIFIED" && released ? ("NORMAL_BASE" as const) : ("NONE" as const),
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
        ? findLegacyRanks(variant.form, variant.variantKey, rankings, pvpokeSpeciesId152181)
        : [],
    );
  }
  const rawRows = [
    ...buildLegacyPvpSourceRows(variants, rankMap, pvpokeSpeciesId152181, pvpokeCommit, checkedAt),
    {
      id: "raw-r19-181-johto-mega-pve",
      battleVariantId: "181-johto-mega",
      category: "PVE",
      status: "PARTIALLY_VERIFIED",
      league: "NOT_APPLICABLE",
      cup: null,
      pvpCategory: null,
      speciesKey: "ampharos",
      formKey: "181-johto",
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

  const decisions = new Map<
    string,
    { decision: Decision; ranks: RankResult[]; released: boolean }
  >();
  for (const variant of variants) {
    const ranks = rankMap.get(variant.id) ?? [];
    decisions.set(variant.id, {
      decision: legacyInitialDecision(
        variant.variantKey,
        variant.released,
        ranks,
        variant.form.id,
        {},
        { keepDynamax: false },
      ),
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
      let pveUseLevel:
        "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE" | null = null;

      if (category === "PVP") {
        if (!variant.released || !["NORMAL", "SHADOW"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (result.ranks.length) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = legacyRankSummary(result.ranks);
          materialToDecision = result.ranks.some((rank) => rank.rank <= 250);
        } else {
          status = "UNRANKED";
          summaryZhTw = "固定 PvPoke Open／Overall 快照未列入可重現名次。";
        }
      } else if (category === "PVE") {
        if (!variant.released || ["DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (variant.id === "181-johto-mega") {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          pveUseLevel = "SPECIAL_USE";
          summaryZhTw =
            "Mega 電龍有電系與 Mega boost 的特殊 PvE 用途，但不是核心投資；先看招式、等級與既有投入。";
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          pveUseLevel = "NO_SIGNIFICANT_USE";
          summaryZhTw =
            "本批未列為普通版本的核心 PvE 投資目標；不以缺少精確 PvE 斷點虛構 IV 淘汰線。";
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
        } else if (
          variant.variantKey === "NORMAL" &&
          releasedMegaForms152181.has(variant.form.id)
        ) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = "普通電龍是已推出 Mega 的基底；只留實際要投入的少量候選。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都必須保留。";
        }
      } else if (category === "MAX_BATTLE") {
        status =
          variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX"
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

  const categorySources = new Map<
    string,
    { categoryEvaluationId: string; sourceId: string; usageZhTw: string }
  >();
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
      categorySources.set(
        `category-${link.variantId}-${categoryName.toLowerCase()}|${link.sourceId}`,
        {
          categoryEvaluationId: `category-${link.variantId}-${categoryName.toLowerCase()}`,
          sourceId: link.sourceId,
          usageZhTw: "Official batch evidence.",
        },
      );
    }
  }
  if (categorySources.size)
    await prisma.categoryEvaluationSource.createMany({ data: [...categorySources.values()] });

  const evaluationRows = variants.map((variant) => {
    const result = decisions.get(variant.id)!;
    const pvpUseful = result.ranks.some((rank) => rank.rank <= 250);
    return {
      id: `r19-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: legacyRankSummary(result.ranks),
      pveSummaryZhTw:
        variant.id === "181-johto-mega"
          ? "Mega 電龍有特殊 PvE 與 Mega boost 用途，非核心投資；先核對 Volt Switch／Zap Cannon、等級與投入。"
          : "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留用途。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "Mega 電龍已推出且與其他版本分開；只留實際投入候選。"
          : variant.form.id === "181-johto" && variant.variantKey === "NORMAL"
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
      assessmentDisposition: legacyInitialDisposition(result.decision, variant.released),
      reviewNotesZhTw:
        "已核對第二世代家族、寶寶併入既有家族、普通／暗影／淨化／Mega／Max 邊界與固定 PvPoke 快照。",
    };
  });
  await prisma.retentionEvaluation.createMany({ data: evaluationRows });
  await prisma.evaluationRuleTrace.createMany({
    data: variants.map((variant) => {
      const result = decisions.get(variant.id)!;
      return {
        id: `r19-trace-${variant.id}`,
        evaluationId: `r19-eval-${variant.id}`,
        ruleKey:
          result.decision === "KEEP"
            ? "MAJOR_BATTLE_VALUE"
            : result.decision === "CONDITIONAL_KEEP"
              ? "CONDITIONAL_USE"
              : "LOW_GENERAL_VALUE",
        ruleVersion: RULES_VERSION,
        priority:
          result.decision === "KEEP" ? 900 : result.decision === "CONDITIONAL_KEEP" ? 700 : 100,
        matched: true,
        resultDecision: result.decision,
        explanationZhTw: "#152～#181 批次初步評估，待共用重算流程依跨世代 family graph 再確認。",
      };
    }),
  });

  const evaluationSources = new Map<
    string,
    { evaluationId: string; sourceId: string; usageZhTw: string }
  >();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      evaluationSources.set(`r19-eval-${variant.id}|${rank.sourceId}`, {
        evaluationId: `r19-eval-${variant.id}`,
        sourceId: rank.sourceId,
        usageZhTw: "Open League／Overall 名次與推薦招式。",
      });
    }
    for (const link of officialEvidenceLinks.filter(
      (candidate) => candidate.variantId === variant.id,
    )) {
      evaluationSources.set(`r19-eval-${variant.id}|${link.sourceId}`, {
        evaluationId: `r19-eval-${variant.id}`,
        sourceId: link.sourceId,
        usageZhTw: "官方或研究來源確認此精確型態、進化或用途邊界。",
      });
    }
  }
  evaluationSources.set("r19-eval-181-johto-mega|PVE-MEGA-AMPHAROS-20260808", {
    evaluationId: "r19-eval-181-johto-mega",
    sourceId: "PVE-MEGA-AMPHAROS-20260808",
    usageZhTw: "GO Hub PvE tier、團體戰攻擊者排名與 Mega 分析。",
  });
  if (evaluationSources.size)
    await prisma.evaluationSource.createMany({ data: [...evaluationSources.values()] });

  await prisma.changeLog.createMany({
    data: [
      {
        id: "r19-batch-152-181",
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
  if (counts[0] !== 30 || counts[1] !== 30 || counts[2] !== 121 || counts[3] !== 847) {
    throw new Error(`本批計數錯誤：${counts.join("/")}，預期 30/30/121/847。`);
  }
  console.log(`#152～#181 匯入完成：本批 ${counts.join("/")}；raw rows ${rawRows.length}。`);
}

async function main() {
  await upsertLegacySources(prisma, officialResearch, checkedAt, "第 #152～#181 批次來源研究表。");
  const rankings = await readLegacyRankings(prisma, pvpokeCommit);
  await rebuildBatch(rankings);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
