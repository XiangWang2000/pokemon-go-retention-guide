import { readFile } from "node:fs/promises";
import type { PrismaClient, VariantKey } from "../../generated/prisma/client";
import { evaluateRetention } from "@/rules/engine";
import { RULES_VERSION } from "@/rules/rules";

type JsonRecord = Record<string, unknown>;

interface OfficialSource {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceTitleOriginal: string;
  sourceLanguage: string;
  sourceUrl: string;
  accessedAt: string;
  publishedAt?: string;
  sourceSummaryZhTw: string;
}

interface OfficialVariant {
  status: string;
  sourceIds: string[];
  noteZhTw: string;
}

interface OfficialForm {
  pokemonFormId: string;
  releaseStatus: string;
  releaseSourceIds: string[];
  variants: Record<string, OfficialVariant>;
}

interface OfficialResearch {
  sources: OfficialSource[];
  forms: OfficialForm[];
  evolutionPaths: Array<{
    fromFormId: string;
    toFormId: string;
    evolutionMethodZhTw: string;
    requiresEvent: boolean;
    verificationStatus: string;
    sourceIds: string[];
    availabilityNotesZhTw: string;
  }>;
  importantMoves: Array<{
    pokemonFormId: string;
    moveNameEn: string;
    moveNameZhTw: string;
    availabilityType: string;
    sourceIds: string[];
    verificationStatus: string;
    noteZhTw: string;
  }>;
  officialResearchGapsZhTw: string[];
}

interface BattleSource {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceTitleOriginal: string;
  sourceLanguage: string;
  sourceUrl: string;
  accessedAt: string;
  publishedAt?: string;
  sourceSummaryZhTw?: string;
  dataVersion?: string;
  sha256?: string;
}

interface NormalizedFinding {
  lane: string;
  battleVariant: string;
  category: "PVE" | "GYM" | "MAX_BATTLE" | "MEGA";
  tier: string | null;
  rank: number | null;
  rating: string | null;
  recommendedMoves: string[];
  rawNotes: string;
  sourceIds: string[];
  checkedAt: string;
}

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, "")) as T;
}

function databaseVariantId(value: string) {
  const [formId, key] = value.split(":");
  return `${formId}-${key.toLowerCase().replaceAll("_", "-")}`;
}

function databaseVariantKey(value: string) {
  return value.split(":")[1] as VariantKey;
}

function releasedValue(status: string) {
  if (
    ["RELEASED", "RELEASED_BY_EVOLUTION_INFERENCE", "AVAILABLE_FROM_PURIFICATION"].includes(status)
  )
    return true;
  if (status === "ANNOUNCED_NOT_YET_RELEASED") return false;
  return null;
}

function sanitize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function optionalDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function ensureEvaluation(prisma: PrismaClient, battleVariantId: string, checkedAt: Date) {
  const existing = await prisma.retentionEvaluation.findFirst({
    where: { battleVariantId },
    orderBy: { generatedAt: "desc" },
  });
  if (existing) return existing.id;
  const result = evaluateRetention({
    hasReliableSources: false,
    releaseStatusKnown: false,
    hasSourceConflict: false,
    hasStaleCriticalData: false,
    majorPvpValue: false,
    highPveValue: false,
    shadowPveAdvantage: false,
    importantMega: false,
    importantMaxBattle: false,
    highGymValue: false,
    valuableEvolution: false,
    specialCupOnly: false,
    requiresSpecificMove: false,
    requiresSpecificIv: false,
    megaCandidateOnly: false,
    maxCandidateOnly: false,
    limitedGymUse: false,
    speciesBattleValueLow: false,
  });
  const id = `evaluation-${battleVariantId}-20260715`;
  await prisma.retentionEvaluation.create({
    data: {
      id,
      battleVariantId,
      finalDecision: result.finalDecision,
      pvpSummaryZhTw: "尚未取得此戰鬥版本的主要聯盟原始資料。",
      pveSummaryZhTw: "尚未取得此戰鬥版本的團體戰原始資料。",
      rocketSummaryZhTw: "尚未取得可重現的當季逐物種火箭隊資料。",
      gymSummaryZhTw: "尚未取得此戰鬥版本的道館資料。",
      gymRating: "NOT_APPLICABLE",
      megaSummaryZhTw: "尚未完成 Mega 價值交叉確認。",
      maxBattleSummaryZhTw: "一般個體與 Max 個體分開；此版本尚待研究。",
      evolutionSummaryZhTw: "尚未完成後續進化價值交叉確認。",
      requiredMovesSummaryZhTw: "尚無已驗證的必要招式結論。",
      recommendedIvStrategyZhTw: result.recommendedIvStrategyZhTw,
      reasonZhTw: result.reasonZhTw,
      confidence: "LOW",
      rulesVersion: RULES_VERSION,
      generatedAt: checkedAt,
      reviewStatus: "DATA_PENDING",
      missingDataSummaryZhTw: "此版本的主要用途資料仍待補齊。",
      reviewed: false,
      reviewNotesZhTw: "由官方型態研究新增；尚待整合戰鬥資料。",
    },
  });
  return id;
}

async function attachSource(
  prisma: PrismaClient,
  evaluationId: string,
  sourceId: string,
  usageZhTw: string,
) {
  await prisma.evaluationSource.upsert({
    where: { evaluationId_sourceId: { evaluationId, sourceId } },
    create: { evaluationId, sourceId, usageZhTw },
    update: { usageZhTw },
  });
}

async function importOfficialResearch(
  prisma: PrismaClient,
  official: OfficialResearch,
  checkedAt: Date,
) {
  const sourceMap = new Map<string, string>();
  for (const source of official.sources) {
    const duplicate = await prisma.sourceReference.findUnique({
      where: {
        sourceUrl_accessedAt: {
          sourceUrl: source.sourceUrl,
          accessedAt: new Date(`${source.accessedAt}T00:00:00+08:00`),
        },
      },
    });
    const id = duplicate?.id ?? source.id;
    if (!duplicate) {
      await prisma.sourceReference.create({
        data: {
          id,
          sourceName: source.sourceName,
          sourceUrl: source.sourceUrl,
          sourceType: source.sourceType as never,
          sourceTitleOriginal: source.sourceTitleOriginal,
          sourceLanguage: source.sourceLanguage,
          sourceSummaryZhTw: source.sourceSummaryZhTw,
          accessedAt: new Date(`${source.accessedAt}T00:00:00+08:00`),
          publishedAt: optionalDate(source.publishedAt),
          dataVersion: source.publishedAt ?? "official live page",
          notes: "第一批官方研究原始頁；保存於 research_notes/official-001-030.json。",
        },
      });
    }
    sourceMap.set(source.id, id);
  }

  const baseKeys = new Set(["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"]);
  for (const form of official.forms) {
    await prisma.pokemonForm.update({
      where: { id: form.pokemonFormId },
      data: {
        isReleasedInPokemonGo: form.releaseStatus === "VERIFIED" ? true : null,
        releaseVerifiedAt: form.releaseStatus === "VERIFIED" ? checkedAt : null,
      },
    });
    const keys = Object.entries(form.variants)
      .filter(([key, value]) => baseKeys.has(key) || value.status !== "NEEDS_REVIEW")
      .map(([key]) => key as VariantKey);
    for (const key of keys) {
      const research = form.variants[key];
      const id = databaseVariantId(`${form.pokemonFormId}:${key}`);
      await prisma.battleVariant.upsert({
        where: { id },
        create: {
          id,
          pokemonFormId: form.pokemonFormId,
          variantKey: key,
          isReleased: releasedValue(research.status),
          releaseVerifiedAt: releasedValue(research.status) === null ? null : checkedAt,
          notesZhTw: `${research.noteZhTw}（官方研究狀態：${research.status}）`,
        },
        update: {
          isReleased: releasedValue(research.status),
          releaseVerifiedAt: releasedValue(research.status) === null ? null : checkedAt,
          notesZhTw: `${research.noteZhTw}（官方研究狀態：${research.status}）`,
        },
      });
      const evaluationId = await ensureEvaluation(prisma, id, checkedAt);
      for (const originalSourceId of research.sourceIds) {
        const sourceId = sourceMap.get(originalSourceId);
        if (sourceId)
          await attachSource(
            prisma,
            evaluationId,
            sourceId,
            "支持此型態／戰鬥版本的官方推出狀態。",
          );
      }
    }
    const normalEvaluation = await ensureEvaluation(
      prisma,
      databaseVariantId(`${form.pokemonFormId}:NORMAL`),
      checkedAt,
    );
    for (const originalSourceId of form.releaseSourceIds) {
      const sourceId = sourceMap.get(originalSourceId);
      if (sourceId)
        await attachSource(prisma, normalEvaluation, sourceId, "支持此 Pokémon GO 型態已推出。");
    }
  }

  for (const path of official.evolutionPaths) {
    const existing = await prisma.evolutionPath.findFirst({
      where: { fromFormId: path.fromFormId, toFormId: path.toFormId },
    });
    if (existing) {
      await prisma.evolutionPath.update({
        where: { id: existing.id },
        data: {
          evolutionMethodZhTw: path.evolutionMethodZhTw,
          availabilityNotesZhTw: path.availabilityNotesZhTw,
          requiresEvent: path.requiresEvent,
          verifiedAt: path.verificationStatus === "VERIFIED" ? checkedAt : null,
        },
      });
    }
  }

  for (const move of official.importantMoves) {
    const moveKey = sanitize(move.moveNameEn).replaceAll("-", "_").toUpperCase();
    const moveId = `move-${sanitize(move.moveNameEn)}`;
    await prisma.move.upsert({
      where: { moveKey },
      create: {
        id: moveId,
        moveKey,
        nameEn: move.moveNameEn,
        nameZhTw: move.moveNameZhTw,
        moveType: "UNKNOWN",
        moveCategory: "CHARGED",
        isLegacy: move.availabilityType !== "NORMAL",
        isEliteTmAvailable: /Elite/i.test(move.noteZhTw),
        notesZhTw: `${move.noteZhTw}（繁中譯名若未由 zh-TW 官方頁覆核，需再確認。）`,
        verifiedAt: checkedAt,
      },
      update: {
        nameEn: move.moveNameEn,
        nameZhTw: move.moveNameZhTw,
        notesZhTw: move.noteZhTw,
        verifiedAt: checkedAt,
      },
    });
    const variantId = databaseVariantId(`${move.pokemonFormId}:NORMAL`);
    await prisma.variantMove.upsert({
      where: {
        battleVariantId_moveId_availabilityType: {
          battleVariantId: variantId,
          moveId,
          availabilityType: move.availabilityType as never,
        },
      },
      create: {
        id: `variant-move-${move.pokemonFormId}-${sanitize(move.moveNameEn)}`,
        battleVariantId: variantId,
        moveId,
        availabilityType: move.availabilityType as never,
        sourceNotesZhTw: `${move.noteZhTw}；來源：${move.sourceIds.join("、")}`,
        verifiedAt: checkedAt,
      },
      update: { sourceNotesZhTw: move.noteZhTw, verifiedAt: checkedAt },
    });
  }
  return sourceMap;
}

function normalizeBattleFindings(battle1: JsonRecord, battle2: JsonRecord) {
  const output: NormalizedFinding[] = [];
  for (const item of (battle1.pveFindings as JsonRecord[]) ?? []) {
    output.push({
      lane: "battle1",
      battleVariant: String(item.battleVariantId),
      category: "PVE",
      tier: item.tier ? String(item.tier) : null,
      rank: typeof item.rank === "number" ? item.rank : null,
      rating: item.ratingScope ? String(item.ratingScope) : null,
      recommendedMoves: (item.recommendedMoves as string[]) ?? [],
      rawNotes: String(item.rawNotes ?? ""),
      sourceIds: [String(item.sourceId)],
      checkedAt: "2026-07-15",
    });
  }
  for (const item of (battle1.maxBattleFindings as JsonRecord[]) ?? []) {
    output.push({
      lane: "battle1",
      battleVariant: String(item.battleVariantId),
      category: "MAX_BATTLE",
      tier: item.tier ? String(item.tier) : null,
      rank: typeof item.rank === "number" ? item.rank : null,
      rating: item.ratingScope ? String(item.ratingScope) : null,
      recommendedMoves: (item.recommendedMoves as string[]) ?? [],
      rawNotes: String(item.rawNotes ?? ""),
      sourceIds: [String(item.sourceId)],
      checkedAt: "2026-07-15",
    });
  }
  for (const item of (battle1.gymFindings as JsonRecord[]) ?? []) {
    output.push({
      lane: "battle1",
      battleVariant: String(item.battleVariantId),
      category: "GYM",
      tier: item.tier ? String(item.tier) : null,
      rank: typeof item.rank === "number" ? item.rank : null,
      rating: item.ratingScope ? String(item.ratingScope) : null,
      recommendedMoves: [],
      rawNotes: String(item.rawNotes ?? ""),
      sourceIds: [String(item.sourceId)],
      checkedAt: "2026-07-15",
    });
  }
  const raw2 = battle2.rawEvaluationData as Record<string, JsonRecord[]>;
  for (const item of raw2.pveAndMega ?? []) {
    output.push({
      lane: "battle2",
      battleVariant: String(item.battleVariant),
      category: String(item.category) === "MEGA" ? "MEGA" : "PVE",
      tier: item.tier ? String(item.tier) : null,
      rank: typeof item.rank === "number" ? item.rank : null,
      rating: null,
      recommendedMoves: (item.moves as string[]) ?? [],
      rawNotes: String(item.rawNotesZhTw ?? ""),
      sourceIds: (item.sourceIds as string[]) ?? [],
      checkedAt: String(item.checkedAt ?? "2026-07-15"),
    });
  }
  for (const item of raw2.gym ?? []) {
    output.push({
      lane: "battle2",
      battleVariant: String(item.battleVariant),
      category: "GYM",
      tier: item.rawTier ? String(item.rawTier) : null,
      rank: null,
      rating: item.rating ? String(item.rating) : null,
      recommendedMoves: [],
      rawNotes: `整體厚度：${String(item.bulkMetric ?? "未提供")}。`,
      sourceIds: (item.sourceIds as string[]) ?? [],
      checkedAt: String(item.checkedAt ?? "2026-07-15"),
    });
  }
  for (const item of raw2.maxBattle ?? []) {
    output.push({
      lane: "battle2",
      battleVariant: String(item.battleVariant),
      category: "MAX_BATTLE",
      tier: item.status ? String(item.status) : null,
      rank: null,
      rating: null,
      recommendedMoves: [],
      rawNotes: String(item.rawNotesZhTw ?? ""),
      sourceIds: (item.sourceIds as string[]) ?? [],
      checkedAt: String(item.checkedAt ?? "2026-07-15"),
    });
  }
  return output;
}

async function importBattleSources(prisma: PrismaClient, lane: string, sources: BattleSource[]) {
  const map = new Map<string, string>();
  for (const source of sources) {
    const accessedAt = new Date(`${source.accessedAt}T00:00:00+08:00`);
    const duplicate = await prisma.sourceReference.findUnique({
      where: { sourceUrl_accessedAt: { sourceUrl: source.sourceUrl, accessedAt } },
    });
    const id = duplicate?.id ?? `${lane}-${source.id}`;
    if (!duplicate) {
      await prisma.sourceReference.create({
        data: {
          id,
          sourceName: source.sourceName,
          sourceUrl: source.sourceUrl,
          sourceType: source.sourceType as never,
          sourceTitleOriginal: source.sourceTitleOriginal,
          sourceLanguage: source.sourceLanguage,
          sourceSummaryZhTw: source.sourceSummaryZhTw ?? "第一批第三方戰鬥資料研究原始頁。",
          accessedAt,
          publishedAt: optionalDate(source.publishedAt),
          dataVersion: source.dataVersion ?? "live",
          notes: source.sha256 ? `原始資料 SHA-256：${source.sha256}` : `研究通道：${lane}`,
        },
      });
    }
    map.set(source.id, id);
  }
  return map;
}

async function importFindings(
  prisma: PrismaClient,
  findings: NormalizedFinding[],
  maps: Record<string, Map<string, string>>,
  checkedAt: Date,
) {
  for (const [index, finding] of findings.entries()) {
    const variantId = databaseVariantId(finding.battleVariant);
    const [formId] = finding.battleVariant.split(":");
    await prisma.battleVariant.upsert({
      where: { id: variantId },
      create: {
        id: variantId,
        pokemonFormId: formId,
        variantKey: databaseVariantKey(finding.battleVariant),
        isReleased: null,
        releaseVerifiedAt: null,
        notesZhTw: "由戰鬥研究發現，但推出狀態仍以官方研究為準。",
      },
      update: {},
    });
    const evaluationId = await ensureEvaluation(prisma, variantId, checkedAt);
    const sourceIds = finding.sourceIds
      .map((sourceId) => maps[finding.lane].get(sourceId))
      .filter((sourceId): sourceId is string => Boolean(sourceId));
    if (!sourceIds[0]) continue;
    const id = `research-${sanitize(variantId)}-${finding.category.toLowerCase()}-${index}`;
    await prisma.rawEvaluationData.upsert({
      where: { id },
      create: {
        id,
        battleVariantId: variantId,
        category: finding.category,
        league: "NOT_APPLICABLE",
        rank: finding.rank,
        rating: finding.rating,
        score: null,
        tier: finding.tier,
        recommendedMoves: JSON.stringify(finding.recommendedMoves),
        rawNotes: finding.rawNotes,
        seasonOrVersion: "即時研究快照 2026-07-15",
        sourceId: sourceIds[0],
        checkedAt: new Date(`${finding.checkedAt}T00:00:00+08:00`),
      },
      update: {
        rank: finding.rank,
        rating: finding.rating,
        tier: finding.tier,
        recommendedMoves: JSON.stringify(finding.recommendedMoves),
        rawNotes: finding.rawNotes,
        sourceId: sourceIds[0],
      },
    });
    for (const sourceId of sourceIds) {
      await attachSource(
        prisma,
        evaluationId,
        sourceId,
        `支持 ${finding.category} 原始資料或交叉確認。`,
      );
    }
  }
}

function highTier(tier: string | null, rank: number | null) {
  return Boolean((tier && /^(S|A\+)/i.test(tier)) || (rank !== null && rank <= 10));
}

async function recomputeEvaluations(
  prisma: PrismaClient,
  conflictEntities: Set<string>,
  checkedAt: Date,
) {
  const variants = await prisma.battleVariant.findMany({
    include: {
      pokemonForm: { include: { evolutionPathsFrom: true } },
      rawEvaluationData: true,
      retentionEvaluations: { orderBy: { generatedAt: "desc" }, take: 1 },
    },
  });
  const byForm = new Map<string, typeof variants>();
  for (const variant of variants) {
    byForm.set(variant.pokemonFormId, [...(byForm.get(variant.pokemonFormId) ?? []), variant]);
  }
  const formChildren = new Map<string, string[]>();
  for (const variant of variants) {
    if (formChildren.has(variant.pokemonFormId)) continue;
    formChildren.set(
      variant.pokemonFormId,
      variant.pokemonForm.evolutionPathsFrom.map((path) => path.toFormId),
    );
  }
  function descendants(formId: string): string[] {
    const direct = formChildren.get(formId) ?? [];
    return [...direct, ...direct.flatMap(descendants)];
  }

  for (const variant of variants) {
    const evaluation = variant.retentionEvaluations[0];
    if (!evaluation) continue;
    const pvp = variant.rawEvaluationData.filter((raw) => raw.category === "PVP");
    const pve = variant.rawEvaluationData.filter(
      (raw) => raw.category === "PVE" || raw.category === "MEGA",
    );
    const max = variant.rawEvaluationData.filter((raw) => raw.category === "MAX_BATTLE");
    const gym = variant.rawEvaluationData.filter((raw) => raw.category === "GYM");
    const bestPvp = pvp
      .map((raw) => raw.rank)
      .filter((rank): rank is number => rank !== null)
      .sort((a, b) => a - b)[0];
    const isHighPve = pve.some((raw) => highTier(raw.tier, raw.rank));
    const descendantsRaw = descendants(variant.pokemonFormId).flatMap((formId) =>
      (byForm.get(formId) ?? []).flatMap((item) => item.rawEvaluationData),
    );
    const valuableEvolution = descendantsRaw.some((raw) =>
      raw.category === "PVP"
        ? raw.rank !== null && raw.rank <= 100
        : ["PVE", "MEGA", "MAX_BATTLE"].includes(raw.category) && highTier(raw.tier, raw.rank),
    );
    const hasConflict = conflictEntities.has(`${variant.pokemonFormId}:${variant.variantKey}`);
    const enoughNegativeData =
      pvp.length > 0 &&
      (bestPvp ?? 9999) > 500 &&
      pve.length > 0 &&
      pve.every((raw) => !highTier(raw.tier, raw.rank)) &&
      !valuableEvolution;
    const result = evaluateRetention({
      hasReliableSources: variant.rawEvaluationData.length > 0,
      releaseStatusKnown: variant.isReleased !== null,
      hasSourceConflict: hasConflict,
      hasStaleCriticalData: false,
      majorPvpValue: bestPvp !== undefined && bestPvp <= 100,
      highPveValue: isHighPve && variant.variantKey !== "SHADOW",
      shadowPveAdvantage: variant.variantKey === "SHADOW" && isHighPve,
      importantMega: variant.variantKey.startsWith("MEGA") && isHighPve,
      importantMaxBattle: max.some(
        (raw) => highTier(raw.tier, raw.rank) || (raw.rank !== null && raw.rank <= 3),
      ),
      highGymValue: gym.some((raw) => raw.rating === "HIGH" || /^(S|A)$/i.test(raw.tier ?? "")),
      valuableEvolution,
      specialCupOnly: false,
      requiresSpecificMove: bestPvp !== undefined && bestPvp <= 250,
      requiresSpecificIv: bestPvp !== undefined && bestPvp > 100 && bestPvp <= 250,
      megaCandidateOnly: false,
      maxCandidateOnly: false,
      limitedGymUse: gym.some((raw) => raw.rating === "MEDIUM"),
      speciesBattleValueLow: enoughNegativeData,
      normalHighIvOnly: false,
    });
    const summarize = (rows: typeof variant.rawEvaluationData, fallback: string) =>
      rows.length
        ? rows
            .map((raw) =>
              [raw.rating, raw.tier, raw.rank !== null ? `#${raw.rank}` : null, raw.rawNotes]
                .filter(Boolean)
                .join(" · "),
            )
            .join("；")
        : fallback;
    await prisma.retentionEvaluation.update({
      where: { id: evaluation.id },
      data: {
        finalDecision: result.finalDecision,
        pvpSummaryZhTw: summarize(pvp, "尚未取得此版本的主要 PvP 聯盟資料。"),
        pveSummaryZhTw: summarize(pve, "尚未取得可完整驗證的 PvE 原始資料。"),
        gymSummaryZhTw: summarize(gym, "尚未取得足以支持物種級道館結論的資料。"),
        gymRating: gym.some((raw) => raw.rating === "HIGH")
          ? "HIGH"
          : gym.some((raw) => raw.rating === "MEDIUM")
            ? "MEDIUM"
            : gym.length
              ? "LOW"
              : "NOT_APPLICABLE",
        maxBattleSummaryZhTw: summarize(
          max,
          "一般老個體不會因該物種可 Dynamax 而自動擁有 Max 能力；此版本資料尚待確認。",
        ),
        evolutionSummaryZhTw: valuableEvolution
          ? "後續進化具有已驗證的主要 PvP、PvE、Mega 或 Max Battle 價值，前階不應直接視為可傳送。"
          : evaluation.evolutionSummaryZhTw,
        requiredMovesSummaryZhTw: pvp.some((raw) => raw.recommendedMoves !== "[]")
          ? `目前原始資料建議招式：${Array.from(
              new Set(
                pvp.flatMap((raw) => {
                  try {
                    return JSON.parse(raw.recommendedMoves) as string[];
                  } catch {
                    return [];
                  }
                }),
              ),
            ).join("／")}；取得方式須依官方招式來源確認。`
          : evaluation.requiredMovesSummaryZhTw,
        recommendedIvStrategyZhTw: result.recommendedIvStrategyZhTw,
        reasonZhTw: result.reasonZhTw,
        confidence:
          hasConflict || result.finalDecision === "HOLD_FOR_NOW"
            ? "LOW"
            : variant.rawEvaluationData.length > 1
              ? "MEDIUM"
              : "LOW",
        rulesVersion: RULES_VERSION,
        generatedAt: checkedAt,
        reviewed: false,
        reviewStatus: "DATA_PENDING",
        missingDataSummaryZhTw:
          result.finalDecision === "HOLD_FOR_NOW"
            ? "關鍵資料缺口可能改變保留結論，目前採保守暫時保留。"
            : "部分次要資料待補，不遮蓋目前正式建議。",
        reviewNotesZhTw: hasConflict
          ? "來源存在方法或敘述衝突，已降低信心並列入資料待補清單。"
          : "第一批研究整合結果；資料維護狀態與使用者建議分開。",
      },
    });
    await prisma.evaluationRuleTrace.deleteMany({ where: { evaluationId: evaluation.id } });
    await prisma.evaluationRuleTrace.createMany({
      data: result.traces.map((trace, index) => ({
        id: `trace-${sanitize(variant.id)}-research-${index}`,
        evaluationId: evaluation.id,
        ruleKey: trace.ruleKey,
        ruleVersion: RULES_VERSION,
        priority: trace.priority,
        matched: trace.matched,
        resultDecision: trace.resultDecision,
        explanationZhTw: trace.explanationZhTw,
      })),
    });
    await prisma.dataIssue.deleteMany({ where: { battleVariantId: variant.id } });
    const issues = [
      { type: "UNREVIEWED" as const, message: "第一批來源擷取尚待資料維護確認。" },
      ...(variant.isReleased === null
        ? [
            {
              type: "UNKNOWN_RELEASE_STATUS" as const,
              message: "官方研究未能確認此戰鬥版本推出狀態。",
            },
          ]
        : []),
      ...(hasConflict
        ? [
            {
              type: "SOURCE_CONFLICT" as const,
              message: "來源的版本、方法或敘述互相衝突，不能無說明地任選。",
            },
          ]
        : []),
      ...(result.finalDecision === "HOLD_FOR_NOW"
        ? [{ type: "RULE_NOT_COVERED" as const, message: "關鍵資料不足，系統目前採保守暫時保留。" }]
        : []),
      ...(pve.length === 0
        ? [{ type: "MISSING_SOURCE" as const, message: "缺少此版本的可重現 PvE 原始資料。" }]
        : []),
    ];
    await prisma.dataIssue.createMany({
      data: issues.map((issue, index) => ({
        id: `issue-${sanitize(variant.id)}-${issue.type.toLowerCase()}-${index}`,
        pokemonFormId: variant.pokemonFormId,
        battleVariantId: variant.id,
        issueType: issue.type,
        status: "OPEN",
        batchKey: "001-030",
        messageZhTw: issue.message,
        affectsFinalDecision: result.finalDecision === "HOLD_FOR_NOW",
        provisionalDecision: result.finalDecision,
        suggestedResearchActionZhTw: "查找並核對對應原始來源後重新執行規則引擎。",
        lastResearchedAt: checkedAt,
        detectedAt: checkedAt,
      })),
    });
  }
}

export async function integrateResearchData(prisma: PrismaClient, checkedAt: Date) {
  const [official, battle1, battle2] = await Promise.all([
    readJson<OfficialResearch>("research_notes/official-001-030.json"),
    readJson<JsonRecord>("research_notes/battle-001-015.json"),
    readJson<JsonRecord>("research_notes/battle-016-030.json"),
  ]);
  await importOfficialResearch(prisma, official, checkedAt);
  const battle1Map = await importBattleSources(
    prisma,
    "battle1",
    battle1.sources as BattleSource[],
  );
  const battle2Map = await importBattleSources(
    prisma,
    "battle2",
    battle2.sources as BattleSource[],
  );
  const findings = normalizeBattleFindings(battle1, battle2);
  await importFindings(prisma, findings, { battle1: battle1Map, battle2: battle2Map }, checkedAt);
  const conflicts = new Set<string>(
    ((battle2.sourceConflicts as JsonRecord[]) ?? []).map((item) => String(item.entity)),
  );
  await recomputeEvaluations(prisma, conflicts, checkedAt);
}
