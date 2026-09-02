import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { getDatabaseUrl } from "../../src/lib/database";
import {
  LEGACY_CATEGORIES,
  assertDisposableDatabase,
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
  type LegacyForm,
  type LegacyLeagueKey as LeagueKey,
  type LegacyOfficialResearch,
  type LegacyPvpSnapshot,
  type LegacyRankResult as RankResult,
  type LegacyRankingRow as RankingRow,
  type LegacyVariantKey as VariantKey,
} from "./legacy-import-shared";
import {
  ensureCrossGenerationEvolutionTargets,
  loadCrossGenerationEvolutionData,
} from "../../src/data/cross-generation-evolution";
import { RULES_VERSION } from "../../src/rules/rules";
import type { PveUseLevel } from "../../src/rules/battle-assessment";
import type { RegionKey } from "../../src/data/region-key";

type LegacySpecies = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  familyKey: string;
};

type LegacyBatchForm = LegacyForm & { regionKey: RegionKey };

type LegacySpecialVariant = {
  id: string;
  formId: string;
  variantKey: "MEGA";
  released: boolean;
};

type LegacyVariantRecord<T extends LegacyBatchForm> = {
  id: string;
  form: T;
  variantKey: VariantKey;
  released: boolean;
};

type LegacyBatchTexts<T extends LegacyBatchForm> = {
  battleMega: string;
  battleDynamax: string | ((released: boolean) => string);
  retentionPveMega: string;
  retentionPveWithLevel?: string;
  retentionPveDefault: string;
  retentionMega: string;
  retentionMegaBase: string;
  retentionMax: string | ((variant: LegacyVariantRecord<T>) => string);
};

type LegacyChangeLog = {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  previousValue: string | null;
  newValue: string | null;
  sourceId: string | null;
  changeReasonZhTw: string;
};

type LegacyVariantUseOverride = {
  pveUseLevel?: PveUseLevel;
  pveSummaryZhTw?: string;
  gymSummaryZhTw?: string;
  maxUseLevel?: PveUseLevel;
  maxSummaryZhTw?: string;
  decision?: Decision;
  categorySourceIds?: Partial<Record<Category, ReadonlyArray<string>>>;
};

type LegacyEvidenceLinks = ReturnType<typeof buildLegacyEvidenceLinks>;

export type LegacyBatchConfig<T extends LegacyBatchForm> = {
  batchStart: number;
  batchEnd: number;
  batchLabel: string;
  checkedAt: Date;
  pvpokeCommit: string;
  pvpSnapshot?: LegacyPvpSnapshot;
  revision: "r19" | "r20";
  officialResearchPath: URL;
  sourceNotes: string;
  sourceOptions?: { includeMaxSource?: boolean };
  species: ReadonlyArray<LegacySpecies>;
  forms: ReadonlyArray<T>;
  evolutionPairs: readonly [string, string][];
  specialVariants: ReadonlyArray<LegacySpecialVariant>;
  pveUseLevels: Readonly<Record<string, PveUseLevel>>;
  variantUseOverrides?: Readonly<Record<string, LegacyVariantUseOverride>>;
  dynamaxDefaultDecision?: Decision;
  pvpokeSpeciesId: (form: T, shadow: boolean) => string;
  releaseSets: {
    shadow: ReadonlySet<string>;
    mega: ReadonlySet<string>;
    dynamax: ReadonlySet<string>;
    gigantamax: ReadonlySet<string>;
  };
  migratedStubIds: ReadonlySet<string>;
  resetEvolutionFromFormIds?: ReadonlyArray<string>;
  changeLogIds: ReadonlyArray<string>;
  changeLogs: ReadonlyArray<LegacyChangeLog>;
  expectedStaticCounts: {
    species: number;
    forms: number;
    variants: number;
    message: string;
  };
  expectedDatabaseCounts: {
    species: number;
    forms: number;
    variants: number;
    categoryEvaluations: number;
  };
  texts: LegacyBatchTexts<T>;
};

async function rebuildBatch<T extends LegacyBatchForm>(
  prisma: PrismaClient,
  config: LegacyBatchConfig<T>,
  rankings: Map<LeagueKey, RankingRow[]>,
  officialEvidenceLinks: LegacyEvidenceLinks,
) {
  await prisma.changeLog.deleteMany({
    where: {
      id: { in: [...config.changeLogIds] },
    },
  });
  await prisma.pokemonSpecies.deleteMany({
    where: { dexNumber: { gte: config.batchStart, lte: config.batchEnd } },
  });

  await prisma.pokemonSpecies.createMany({
    data: config.species.map((species) => ({
      id: `species-${String(species.dexNumber).padStart(3, "0")}`,
      dexNumber: species.dexNumber,
      nameEn: species.nameEn,
      nameZhTw: species.nameZhTw,
      generation: 2,
      familyKey: species.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: config.forms.map((form) => {
      const species = config.species.find((item) => item.dexNumber === form.dexNumber)!;
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
        releaseVerifiedAt: config.checkedAt,
        isEvolutionStub: form.isStub ?? false,
        evolutionTargetUseLevel: null,
        evolutionTargetNotesZhTw: form.isStub
          ? "伽勒爾分支 stub；完整戰鬥資料尚未納入本批。"
          : null,
      };
    }),
  });
  for (const form of config.forms) {
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
  await ensureCrossGenerationEvolutionTargets(prisma, config.checkedAt);

  // Migrate any pre-existing Kanto-named cross-generation stubs by rebuilding
  // their species/form rows in the formal JOHTO batch.  The species delete above
  // also removes their variants, evaluations, issues and old evolution paths.
  if (config.migratedStubIds.size) {
    const oldStubIds = Array.from(config.migratedStubIds);
    await prisma.evolutionPath.deleteMany({
      where: { OR: [{ fromFormId: { in: oldStubIds } }, { toFormId: { in: oldStubIds } }] },
    });
  }
  if (config.resetEvolutionFromFormIds?.length) {
    await prisma.pokemonForm.updateMany({
      where: { id: { in: Array.from(config.resetEvolutionFromFormIds) } },
      data: { evolvesFromFormId: null },
    });
  }

  const manifestEdges = new Set(
    (await loadCrossGenerationEvolutionData()).paths.map(
      (path) => `${path.fromFormId}->${path.toFormId}`,
    ),
  );
  await prisma.evolutionPath.createMany({
    data: config.evolutionPairs
      .filter(([fromFormId, toFormId]) => !manifestEdges.has(`${fromFormId}->${toFormId}`))
      .map(([fromFormId, toFormId]) => ({
        id: `evolution-${config.revision}-${fromFormId}-${toFormId}`,
        fromFormId,
        toFormId,
        evolutionMethodZhTw:
          fromFormId.startsWith("17") && ["025-kanto", "035-kanto", "039-kanto"].includes(toFormId)
            ? "提升友好度後消耗糖果進化"
            : "消耗糖果進化；特殊條件以遊戲內當期介面為準。",
        availabilityNotesZhTw:
          toFormId === "199-galar"
            ? "正式伽勒爾分支；與標準城都呆呆王分開評估。"
            : `此進化路徑已在 ${config.batchLabel} 整合資料中核對；批次外目標以正式 stub 保留。`,
        requiresEvent: false,
        verifiedAt: config.checkedAt,
      })),
  });

  const variants: LegacyVariantRecord<T>[] = [];
  for (const form of config.forms) {
    if (form.includeVariants === false || form.isStub) continue;
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        form,
        variantKey,
        released: isLegacyVariantReleased(form.id, variantKey, config.releaseSets),
      });
    }
  }
  for (const special of config.specialVariants) {
    const form = config.forms.find((item) => item.id === special.formId)!;
    variants.push({
      id: special.id,
      form,
      variantKey: special.variantKey,
      released: special.released,
    });
  }
  if (
    config.species.length !== config.expectedStaticCounts.species ||
    config.forms.length !== config.expectedStaticCounts.forms ||
    variants.length !== config.expectedStaticCounts.variants
  ) {
    throw new Error(config.expectedStaticCounts.message);
  }

  await prisma.battleVariant.createMany({
    data: variants.map(({ id, form, variantKey, released }) => ({
      id,
      pokemonFormId: form.id,
      variantKey,
      isReleased: released,
      releaseStatus: released ? ("RELEASED" as const) : ("UNRELEASED" as const),
      releaseVerifiedAt: config.checkedAt,
      notesZhTw:
        variantKey === "MEGA"
          ? config.texts.battleMega
          : variantKey === "DYNAMAX"
            ? typeof config.texts.battleDynamax === "function"
              ? config.texts.battleDynamax(released)
              : config.texts.battleDynamax
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
  await ensureCrossGenerationEvolutionTargets(prisma, config.checkedAt);

  const rankMap = new Map<string, RankResult[]>();
  for (const variant of variants) {
    rankMap.set(
      variant.id,
      variant.released && (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW")
        ? findLegacyRanks(
            variant.form,
            variant.variantKey,
            rankings,
            config.pvpokeSpeciesId,
            config.pvpSnapshot,
          )
        : [],
    );
  }
  const variantOverride = (variant: LegacyVariantRecord<T>) =>
    config.variantUseOverrides?.[variant.id];
  const pveUseLevelFor = (variant: LegacyVariantRecord<T>) =>
    variantOverride(variant)?.pveUseLevel ?? config.pveUseLevels[variant.form.id] ?? null;
  const maxUseLevelFor = (variant: LegacyVariantRecord<T>) =>
    variantOverride(variant)?.maxUseLevel ?? null;
  const useTier = (level: PveUseLevel | null) =>
    level === "CORE_INVESTMENT"
      ? "A"
      : level === "USABLE_OR_BUDGET"
        ? "B"
        : level === "SPECIAL_USE"
          ? "SPECIAL"
          : null;
  const decisionFor = (variant: LegacyVariantRecord<T>, ranks: RankResult[]): Decision => {
    const override = variantOverride(variant);
    if (!variant.released) return "TRANSFER_CANDIDATE";
    if (override?.decision) return override.decision;
    if (variant.variantKey === "DYNAMAX") {
      const level = maxUseLevelFor(variant);
      if (level === "CORE_INVESTMENT") return "KEEP";
      if (level && level !== "NO_SIGNIFICANT_USE") return "CONDITIONAL_KEEP";
      return config.dynamaxDefaultDecision ?? "KEEP";
    }
    if (override?.gymSummaryZhTw) return "CONDITIONAL_KEEP";
    if (override?.pveUseLevel !== undefined) {
      if (override.pveUseLevel === "CORE_INVESTMENT") return "KEEP";
      if (override.pveUseLevel !== "NO_SIGNIFICANT_USE") return "CONDITIONAL_KEEP";
      return legacyInitialDecision(
        variant.variantKey,
        variant.released,
        ranks,
        variant.form.id,
        {},
        { keepDynamax: false },
      );
    }
    return legacyInitialDecision(
      variant.variantKey,
      variant.released,
      ranks,
      variant.form.id,
      config.pveUseLevels,
      { keepDynamax: false },
    );
  };
  const rawRows = [
    ...buildLegacyPvpSourceRows(
      variants,
      rankMap,
      config.pvpokeSpeciesId,
      config.pvpokeCommit,
      config.pvpSnapshot?.checkedAt ?? config.checkedAt,
      config.revision,
    ),
    ...variants.flatMap((variant) => {
      const tier =
        variant.variantKey === "MEGA"
          ? "SPECIAL"
          : ["NORMAL", "SHADOW"].includes(variant.variantKey)
            ? useTier(pveUseLevelFor(variant))
            : null;
      if (!tier) return [];
      return [
        {
          id: `raw-${config.revision}-${variant.id}-pve`,
          battleVariantId: variant.id,
          category: "PVE" as const,
          status: "PARTIALLY_VERIFIED" as const,
          league: "NOT_APPLICABLE" as const,
          cup: null,
          pvpCategory: null,
          speciesKey: config.pvpokeSpeciesId(variant.form, variant.variantKey === "SHADOW"),
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
          checkedAt: config.checkedAt,
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
      decision: decisionFor(variant, ranks),
      ranks,
      released: variant.released,
    });
  }

  const categoryRows = variants.flatMap((variant) => {
    const result = decisions.get(variant.id)!;
    const links = officialEvidenceLinks.filter((link) => link.variantId === variant.id);
    return LEGACY_CATEGORIES.map((category) => {
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
        const configuredPveUse =
          variant.variantKey === "MEGA" ? "SPECIAL_USE" : pveUseLevelFor(variant);
        if (!variant.released || ["DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (configuredPveUse && configuredPveUse !== "NO_SIGNIFICANT_USE") {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          pveUseLevel = configuredPveUse;
          summaryZhTw =
            variantOverride(variant)?.pveSummaryZhTw ??
            "本批 PvE 用途依研究表與來源頁面分成核心投資、可用／預算型、特殊用途或無顯著用途；不把缺少精確斷點誤當成整個家族待判斷。";
        } else if (configuredPveUse === "NO_SIGNIFICANT_USE") {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          pveUseLevel = "NO_SIGNIFICANT_USE";
          summaryZhTw =
            variantOverride(variant)?.pveSummaryZhTw ??
            "來源已足以判定此版本目前沒有顯著 PvE 投資價值；不因高 IV 自動升格。";
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
        const gymSummary = variantOverride(variant)?.gymSummaryZhTw;
        if (!variant.released) {
          status = "UNRELEASED";
        } else if (gymSummary) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = gymSummary;
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          summaryZhTw = "未找到足以構成主要保留理由的道館用途；次要資料缺失不覆蓋其他結論。";
        }
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
          config.releaseSets.mega.has(variant.form.id)
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
          config.releaseSets.dynamax.has(variant.form.id) ||
          config.releaseSets.gigantamax.has(variant.form.id);
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
        summaryZhTw =
          variantOverride(variant)?.maxSummaryZhTw ??
          (isMaxVariant
            ? variant.released
              ? "此 Max 版本已由來源核對為已推出；與普通／暗影版本分開保留。"
              : "此 Max 版本尚未推出。"
            : hasReleasedMax
              ? "此普通型態是已推出 Max 的基底；只保留實際要投入的少量候選。"
              : "普通、暗影或 Mega 個體不等於極巨／超極巨個體。");
      } else {
        const outgoing = config.evolutionPairs.some(([from]) => from === variant.form.id);
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
        maxOverallRating:
          category === "MAX_BATTLE" && maxUseLevelFor(variant)
            ? maxUseLevelFor(variant) === "CORE_INVESTMENT"
              ? "HIGH"
              : maxUseLevelFor(variant) === "USABLE_OR_BUDGET"
                ? "MEDIUM"
                : "LOW"
            : null,
        maxInvestmentRating:
          category === "MAX_BATTLE" && maxUseLevelFor(variant)
            ? maxUseLevelFor(variant) === "CORE_INVESTMENT"
              ? "HIGH"
              : maxUseLevelFor(variant) === "USABLE_OR_BUDGET"
                ? "MEDIUM"
                : "LOW"
            : null,
        maxUseCaseBreadth:
          category === "MAX_BATTLE" && maxUseLevelFor(variant)
            ? maxUseLevelFor(variant) === "CORE_INVESTMENT"
              ? "BROAD"
              : maxUseLevelFor(variant) === "USABLE_OR_BUDGET"
                ? "MEDIUM"
                : "NARROW"
            : null,
        pveUseLevel,
        assessmentDisposition: null,
        checkedAt: config.checkedAt,
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
    const LEGACY_CATEGORIESForLink = new Set<Category>([link.category]);
    if (link.sourceId.startsWith("PVE-")) LEGACY_CATEGORIESForLink.add("PVE");
    const linkedVariant = variants.find((variant) => variant.id === link.variantId);
    if (
      linkedVariant?.variantKey === "NORMAL" &&
      config.releaseSets.mega.has(linkedVariant.form.id) &&
      link.sourceId.startsWith("PVE-")
    ) {
      LEGACY_CATEGORIESForLink.add("MEGA");
    }
    for (const categoryName of LEGACY_CATEGORIESForLink) {
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
  for (const variant of variants) {
    for (const categoryName of LEGACY_CATEGORIES) {
      for (const sourceId of variantOverride(variant)?.categorySourceIds?.[categoryName] ?? []) {
        categorySources.set(
          `category-${variant.id}-${categoryName.toLowerCase()}|${sourceId}`,
          {
            categoryEvaluationId: `category-${variant.id}-${categoryName.toLowerCase()}`,
            sourceId,
            usageZhTw: "Variant-specific research evidence for this category.",
          },
        );
      }
    }
  }
  if (categorySources.size)
    await prisma.categoryEvaluationSource.createMany({ data: [...categorySources.values()] });

  const evaluationRows = variants.map((variant) => {
    const result = decisions.get(variant.id)!;
    const pvpUseful = result.ranks.some((rank) => rank.rank <= 250);
    return {
      id: `${config.revision}-eval-${variant.id}`,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: legacyRankSummary(result.ranks),
      pveSummaryZhTw:
        variantOverride(variant)?.pveSummaryZhTw ??
        (variant.variantKey === "MEGA"
          ? config.texts.retentionPveMega
          : config.texts.retentionPveWithLevel &&
              pveUseLevelFor(variant) &&
              pveUseLevelFor(variant) !== "NO_SIGNIFICANT_USE"
            ? config.texts.retentionPveWithLevel
            : config.texts.retentionPveDefault),
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
      gymSummaryZhTw: variantOverride(variant)?.gymSummaryZhTw ?? "未列為主要道館保留用途。",
      gymRating: variantOverride(variant)?.gymSummaryZhTw
        ? ("SPECIAL_CASE" as const)
        : ("NOT_APPLICABLE" as const),
      megaSummaryZhTw:
        variant.variantKey === "MEGA"
          ? config.texts.retentionMega
          : config.releaseSets.mega.has(variant.form.id) && variant.variantKey === "NORMAL"
            ? config.texts.retentionMegaBase
            : "此版本沒有獨立 Mega 型態用途。",
      maxBattleSummaryZhTw:
        variantOverride(variant)?.maxSummaryZhTw ??
        (typeof config.texts.retentionMax === "function"
          ? config.texts.retentionMax(variant)
          : config.texts.retentionMax),
      evolutionSummaryZhTw: config.evolutionPairs.some(([from]) => from === variant.form.id)
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
      generatedAt: config.checkedAt,
      reviewed: true,
      reviewedAt: config.checkedAt,
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
        id: `${config.revision}-trace-${variant.id}`,
        evaluationId: `${config.revision}-eval-${variant.id}`,
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
        explanationZhTw: `${config.batchLabel} 批次初步評估，待共用重算流程依跨世代 family graph 再確認。`,
      };
    }),
  });

  const evaluationSources = new Map<
    string,
    { evaluationId: string; sourceId: string; usageZhTw: string }
  >();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      evaluationSources.set(`${config.revision}-eval-${variant.id}|${rank.sourceId}`, {
        evaluationId: `${config.revision}-eval-${variant.id}`,
        sourceId: rank.sourceId,
        usageZhTw: "Open League／Overall 名次與推薦招式。",
      });
    }
    for (const link of officialEvidenceLinks.filter(
      (candidate) => candidate.variantId === variant.id,
    )) {
      evaluationSources.set(`${config.revision}-eval-${variant.id}|${link.sourceId}`, {
        evaluationId: `${config.revision}-eval-${variant.id}`,
        sourceId: link.sourceId,
        usageZhTw: "官方或研究來源確認此精確型態、進化或用途邊界。",
      });
    }
    for (const categoryName of LEGACY_CATEGORIES) {
      for (const sourceId of variantOverride(variant)?.categorySourceIds?.[categoryName] ?? []) {
        evaluationSources.set(`${config.revision}-eval-${variant.id}|${sourceId}`, {
          evaluationId: `${config.revision}-eval-${variant.id}`,
          sourceId,
          usageZhTw: "此來源直接支援該版本的特定用途分類。",
        });
      }
    }
  }
  if (evaluationSources.size)
    await prisma.evaluationSource.createMany({ data: [...evaluationSources.values()] });

  await prisma.changeLog.createMany({
    data: config.changeLogs.map((changeLog) => ({
      ...changeLog,
      changedAt: config.checkedAt,
      rulesVersion: RULES_VERSION,
    })),
  });

  const counts = await Promise.all([
    prisma.pokemonSpecies.count({
      where: { dexNumber: { gte: config.batchStart, lte: config.batchEnd } },
    }),
    prisma.pokemonForm.count({
      where: { species: { dexNumber: { gte: config.batchStart, lte: config.batchEnd } } },
    }),
    prisma.battleVariant.count({
      where: {
        pokemonForm: { species: { dexNumber: { gte: config.batchStart, lte: config.batchEnd } } },
      },
    }),
    prisma.categoryEvaluation.count({
      where: {
        battleVariant: {
          pokemonForm: { species: { dexNumber: { gte: config.batchStart, lte: config.batchEnd } } },
        },
      },
    }),
  ]);
  const [speciesCount, formsCount, variantsCount, categoryEvaluationCount] = counts;
  const expected = config.expectedDatabaseCounts;
  if (
    speciesCount !== expected.species ||
    formsCount !== expected.forms ||
    variantsCount !== expected.variants ||
    categoryEvaluationCount !== expected.categoryEvaluations
  ) {
    throw new Error(
      `本批計數錯誤：${counts.join("/")}，預期 ${expected.species}/${expected.forms}/${expected.variants}/${expected.categoryEvaluations}。`,
    );
  }
  console.log(
    `${config.batchLabel} 匯入完成：本批 ${counts.join("/")}；raw rows ${rawRows.length}。`,
  );
}

export async function runLegacyBatchImport<T extends LegacyBatchForm>(
  config: LegacyBatchConfig<T>,
) {
  const databaseUrl = getDatabaseUrl();
  assertDisposableDatabase(databaseUrl);
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
  });

  try {
    const officialResearch = JSON.parse(
      readFileSync(config.officialResearchPath, "utf8"),
    ) as LegacyOfficialResearch;
    const officialEvidenceLinks = buildLegacyEvidenceLinks(officialResearch, config.sourceOptions);
    await upsertLegacySources(prisma, officialResearch, config.checkedAt, config.sourceNotes);
    const rankings = await readLegacyRankings(prisma, config.pvpokeCommit, config.pvpSnapshot);
    await rebuildBatch(prisma, config, rankings, officialEvidenceLinks);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
