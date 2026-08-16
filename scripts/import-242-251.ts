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
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database";
import {
  evolutionPairs242251,
  forms242251,
  pvpokeSpeciesId242251,
  releasedDynamaxForms242251,
  releasedGigantamaxForms242251,
  releasedMegaForms242251,
  releasedShadowForms242251,
  specialVariants242251,
  species242251,
  pveUseLevels242251,
  migratedStubIds242251,
  type Form242251,
} from "../src/data/batch-242-251";
import {
  ensureCrossGenerationEvolutionTargets,
  loadCrossGenerationEvolutionData,
} from "../src/data/cross-generation-evolution";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: getDatabaseUrl() }),
});

const batchStart = 242;
const batchEnd = 251;
const checkedAt = new Date("2026-08-08T18:00:00+08:00");
const pvpokeCommit = "86847e535b7e0a0f4e91f9628b3fc713ae6adca7";
const officialResearch = JSON.parse(
  readFileSync(new URL("../research_notes/official-242-251.json", import.meta.url), "utf8"),
) as OfficialResearch;

const officialEvidenceLinks = buildLegacyEvidenceLinks(officialResearch, {
  includeMaxSource: true,
});

const variantReleaseSets = {
  shadow: releasedShadowForms242251,
  mega: releasedMegaForms242251,
  dynamax: releasedDynamaxForms242251,
  gigantamax: releasedGigantamaxForms242251,
};

type VariantRecord = {
  id: string;
  form: Form242251;
  variantKey: VariantKey;
  released: boolean;
};

async function rebuildBatch(rankings: Map<LeagueKey, RankingRow[]>) {
  await prisma.changeLog.deleteMany({
    where: {
      id: {
        in: [
          "r19-batch-242-251",
          "r19-family-blissey",
          "r19-family-larvitar",
          "r20-batch-242-251",
          "r20-family-blissey",
          "r20-family-larvitar",
        ],
      },
    },
  });
  await prisma.pokemonSpecies.deleteMany({
    where: { dexNumber: { gte: batchStart, lte: batchEnd } },
  });

  await prisma.pokemonSpecies.createMany({
    data: species242251.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 2,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: forms242251.map((form) => {
      const species = species242251.find((item) => item.dexNumber === form.dexNumber)!;
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
  for (const form of forms242251) {
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
  if (migratedStubIds242251.size) {
    const oldStubIds = [...migratedStubIds242251];
    await prisma.evolutionPath.deleteMany({
      where: { OR: [{ fromFormId: { in: oldStubIds } }, { toFormId: { in: oldStubIds } }] },
    });
  }

  const manifestEdges = new Set(
    (await loadCrossGenerationEvolutionData()).paths.map(
      (path) => `${path.fromFormId}->${path.toFormId}`,
    ),
  );
  await prisma.evolutionPath.createMany({
    data: evolutionPairs242251
      .filter(([fromFormId, toFormId]) => !manifestEdges.has(`${fromFormId}->${toFormId}`))
      .map(([fromFormId, toFormId]) => ({
        id: `evolution-r20-${fromFormId}-${toFormId}`,
        fromFormId,
        toFormId,
        evolutionMethodZhTw:
          fromFormId.startsWith("17") && ["025-kanto", "035-kanto", "039-kanto"].includes(toFormId)
            ? "提升友好度後消耗糖果進化"
            : "消耗糖果進化；特殊條件以遊戲內當期介面為準。",
        availabilityNotesZhTw:
          toFormId === "199-galar"
            ? "正式伽勒爾分支；與標準城都呆呆王分開評估。"
            : "此進化路徑已在 #242～#251 整合資料中核對；批次外目標以正式 stub 保留。",
        requiresEvent: false,
        verifiedAt: checkedAt,
      })),
  });

  const variants: VariantRecord[] = [];
  for (const form of forms242251) {
    if (form.includeVariants === false || form.isStub) continue;
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: isLegacyVariantReleased(form.id, variantKey, variantReleaseSets),
      });
    }
  }
  for (const special of specialVariants242251) {
    const form = forms242251.find((item) => item.id === special.formId)!;
    variants.push({
      id: special.id,
      form,
      variantKey: special.variantKey,
      released: special.released,
    });
  }
  if (species242251.length !== 10 || forms242251.length !== 10 || variants.length !== 41) {
    throw new Error(`#242～#251 靜態計數不符 10 species／10 forms／41 variants。`);
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
          ? "Mega 型態是獨立戰鬥版本；只與普通、暗影及 Max 版本分開評估。"
          : variantKey === "DYNAMAX"
            ? released
              ? "此 Max 版本已由來源核對為已推出；普通個體不能替代 Max 個體。"
              : "此 Max 版本尚未推出；普通個體不能替代 Max 個體。"
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
  // Upsert cross-generation stubs only after this batch's source forms and
  // variants exist; otherwise a new source form would be a dangling manifest
  // endpoint and a formal target would be mistaken for a stub.
  await ensureCrossGenerationEvolutionTargets(prisma, checkedAt);

  const rankMap = new Map<string, RankResult[]>();
  for (const variant of variants) {
    rankMap.set(
      variant.id,
      variant.released && (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW")
        ? findLegacyRanks(variant.form, variant.variantKey, rankings, pvpokeSpeciesId242251)
        : [],
    );
  }
  const pveTier = (formId: string) =>
    pveUseLevels242251[formId] === "CORE_INVESTMENT"
      ? "A"
      : pveUseLevels242251[formId] === "USABLE_OR_BUDGET"
        ? "B"
        : pveUseLevels242251[formId] === "SPECIAL_USE"
          ? "SPECIAL"
          : null;
  const rawRows = [
    ...buildLegacyPvpSourceRows(
      variants,
      rankMap,
      pvpokeSpeciesId242251,
      pvpokeCommit,
      checkedAt,
      "r20",
    ),
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
          id: `raw-r20-${variant.id}-pve`,
          battleVariantId: variant.id,
          category: "PVE" as const,
          status: "PARTIALLY_VERIFIED" as const,
          league: "NOT_APPLICABLE" as const,
          cup: null,
          pvpCategory: null,
          speciesKey: pvpokeSpeciesId242251(variant.form, variant.variantKey === "SHADOW"),
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
        pveUseLevels242251,
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
        } else if (variant.variantKey === "MEGA" || pveUseLevels242251[variant.form.id]) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          pveUseLevel =
            variant.variantKey === "MEGA" ? "SPECIAL_USE" : pveUseLevels242251[variant.form.id]!;
          summaryZhTw =
            "本批 PvE 用途依研究表與來源頁面分成核心投資、可用／預算型、特殊用途或無顯著用途；不把缺少精確斷點誤當成整個家族待判斷。";
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
            ? `${variant.form.formNameZhTw} ${variant.form.dexNumber} 的 Mega 已推出；只保留實際 Mega 候選，與普通、暗影及 Max 分開。`
            : "此 Mega 版本尚未推出。";
        } else if (
          variant.variantKey === "NORMAL" &&
          releasedMegaForms242251.has(variant.form.id)
        ) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = "此普通型態是已推出 Mega 的基底；只留實際要投入的少量候選。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都必須保留。";
        }
      } else if (category === "MAX_BATTLE") {
        const isMaxVariant =
          variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX";
        const hasReleasedMax =
          releasedDynamaxForms242251.has(variant.form.id) ||
          releasedGigantamaxForms242251.has(variant.form.id);
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
        const outgoing = evolutionPairs242251.some(([from]) => from === variant.form.id);
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
    const linkedVariant = variants.find((variant) => variant.id === link.variantId);
    if (
      linkedVariant?.variantKey === "NORMAL" &&
      releasedMegaForms242251.has(linkedVariant.form.id) &&
      link.sourceId.startsWith("PVE-")
    ) {
      categoriesForLink.add("MEGA");
    }
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
      id: `r20-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: legacyRankSummary(result.ranks),
      pveSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "此 Mega 版本有獨立 PvE 與 Mega boost 用途；先核對招式、等級與實際投入。"
          : pveUseLevels242251[variant.form.id]
            ? "本批 PvE 用途依研究表分成核心投資、可用／預算型或特殊用途；不把缺少精確斷點誤當成整個家族待判斷。"
            : "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留用途。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? "此 Mega 版本已推出且與其他版本分開；只留實際投入候選。"
          : releasedMegaForms242251.has(variant.form.id) && variant.variantKey === "NORMAL"
            ? "此普通型態可作 Mega 基底候選；不把 Mega 用途回推成全家族必留。"
            : "此版本沒有獨立 Mega 型態用途。",
      maxBattleSummaryZhTw:
        variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX"
          ? variant.released
            ? "此 Max 版本已由來源核對為已推出；與普通／暗影版本分開保留。"
            : "此 Max 版本尚未推出；普通個體不能替代 Max 個體。"
          : "Max 用途與普通、暗影、Mega 分開評估。",
      evolutionSummaryZhTw: evolutionPairs242251.some(([from]) => from === variant.form.id)
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
        id: `r20-trace-${variant.id}`,
        evaluationId: `r20-eval-${variant.id}`,
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
        explanationZhTw: "#242～#251 批次初步評估，待共用重算流程依跨世代 family graph 再確認。",
      };
    }),
  });

  const evaluationSources = new Map<
    string,
    { evaluationId: string; sourceId: string; usageZhTw: string }
  >();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      evaluationSources.set(`r20-eval-${variant.id}|${rank.sourceId}`, {
        evaluationId: `r20-eval-${variant.id}`,
        sourceId: rank.sourceId,
        usageZhTw: "Open League／Overall 名次與推薦招式。",
      });
    }
    for (const link of officialEvidenceLinks.filter(
      (candidate) => candidate.variantId === variant.id,
    )) {
      evaluationSources.set(`r20-eval-${variant.id}|${link.sourceId}`, {
        evaluationId: `r20-eval-${variant.id}`,
        sourceId: link.sourceId,
        usageZhTw: "官方或研究來源確認此精確型態、進化或用途邊界。",
      });
    }
  }
  if (evaluationSources.size)
    await prisma.evaluationSource.createMany({ data: [...evaluationSources.values()] });

  await prisma.changeLog.createMany({
    data: [
      {
        id: "r20-batch-242-251",
        entityType: "Batch",
        entityId: "242-251",
        fieldName: "status",
        previousValue: null,
        newValue: "RESEARCHED",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw: "新增 #242～#251，沿用共用保留規則與逐版本資料處置。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r20-family-blissey",
        entityType: "EvolutionFamily",
        entityId: "KANTO_FAMILY_113",
        fieldName: "members",
        previousValue: "#113",
        newValue: "#113→#242",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw:
          "幸福蛋正式併入吉利蛋既有家族；由舊 Kanto cross-generation stub 遷移為正式 Johto form。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
      {
        id: "r20-family-larvitar",
        entityType: "EvolutionFamily",
        entityId: "JOHTO_FAMILY_246",
        fieldName: "members",
        previousValue: "#246→#247",
        newValue: "#246→#247→#248",
        sourceId: "OFF-JOHTO-TOUR-2022",
        changeReasonZhTw:
          "幼基拉斯、沙基拉斯與班基拉斯維持同一跨世代進化家族，並分開評估 Mega、Shadow 與 Max。",
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
  if (counts[0] !== 10 || counts[1] !== 10 || counts[2] !== 41 || counts[3] !== 287) {
    throw new Error(`本批計數錯誤：${counts.join("/")}，預期 10/10/41/287。`);
  }
  console.log(`#242～#251 匯入完成：本批 ${counts.join("/")}；raw rows ${rawRows.length}。`);
}

async function main() {
  await upsertLegacySources(prisma, officialResearch, checkedAt, "第 #242～#251 批次來源研究表。");
  const rankings = await readLegacyRankings(prisma, pvpokeCommit);
  await rebuildBatch(rankings);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
