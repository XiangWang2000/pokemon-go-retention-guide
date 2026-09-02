import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { PrismaClient } from "../../generated/prisma/client";
export { assertDisposableDatabase } from "../../src/lib/database";

export type LegacyCategory =
  "PVP" | "PVE" | "ROCKET" | "GYM" | "MEGA" | "MAX_BATTLE" | "EVOLUTION_VALUE";
export type LegacyVariantKey =
  "NORMAL" | "SHADOW" | "PURIFIED" | "MEGA" | "MEGA_X" | "MEGA_Y" | "DYNAMAX" | "GIGANTAMAX";
export type LegacyDecision = "KEEP" | "CONDITIONAL_KEEP" | "TRANSFER_CANDIDATE";
export type LegacyDisposition =
  "CLEAR_USE" | "LIMITED_USE" | "NO_SIGNIFICANT_USE" | "NOT_APPLICABLE_OR_UNRELEASED";
export type LegacyLeagueKey = "GREAT" | "ULTRA" | "MASTER";

export type LegacyForm = {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: string;
  types: string[];
  aliases: string[];
  evolvesFromFormId?: string | null;
  evolutionFamilyNotesZhTw: string;
  isStub?: boolean;
  includeVariants?: boolean;
};

export type LegacyRankingRow = {
  speciesId: string;
  rating?: number;
  moveset?: string[];
};

export type LegacyRankResult = {
  league: LegacyLeagueKey;
  leagueLabel: string;
  sourceId: string;
  rank: number;
  rating: number | null;
  moves: string[];
};

export type LegacyOfficialSource = {
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

export type LegacyOfficialResearch = {
  sources: LegacyOfficialSource[];
};

export const LEGACY_CATEGORIES = [
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX_BATTLE",
  "EVOLUTION_VALUE",
] as const;

export const LEGACY_LEAGUES = [
  { key: "GREAT", cp: 1500, sourceId: "pvpoke-gl-20260715", label: "GL（超級聯盟）" },
  { key: "ULTRA", cp: 2500, sourceId: "pvpoke-ul-20260715", label: "UL（高級聯盟）" },
  { key: "MASTER", cp: 10000, sourceId: "pvpoke-ml-20260715", label: "ML（大師聯盟）" },
] as const;

export type LegacyPvpSnapshot = {
  root: string;
  label: string;
  checkedAt: Date;
  sourceIds: Record<LegacyLeagueKey, string>;
};

function legacyLeagues(snapshot?: LegacyPvpSnapshot) {
  return LEGACY_LEAGUES.map((league) => ({
    ...league,
    sourceId: snapshot?.sourceIds[league.key] ?? league.sourceId,
  }));
}

type SourceReferenceClient = Pick<PrismaClient, "sourceReference">;

export function optionalLegacyDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildLegacyEvidenceLinks(
  research: LegacyOfficialResearch,
  options: { includeMaxSource?: boolean } = {},
) {
  return research.sources.flatMap((source) =>
    source.supports.map((variantId) => ({
      sourceId: source.id,
      variantId,
      category: legacyEvidenceCategory(variantId, source.id, options),
    })),
  );
}

function legacyEvidenceCategory(
  variantId: string,
  sourceId: string,
  options: { includeMaxSource?: boolean },
): LegacyCategory {
  if (sourceId.startsWith("OFF-MEGA-")) return "MEGA";
  if (options.includeMaxSource && sourceId.startsWith("MAX-")) return "MAX_BATTLE";
  if (variantId.endsWith("-mega")) return "MEGA";
  if (sourceId.startsWith("PVE-")) return "PVE";
  if (variantId.endsWith("-shadow") || variantId.endsWith("-purified")) return "ROCKET";
  if (variantId.endsWith("-dynamax") || variantId.endsWith("-gigantamax")) {
    return "MAX_BATTLE";
  }
  return "EVOLUTION_VALUE";
}

export async function upsertLegacySources(
  prisma: SourceReferenceClient,
  research: LegacyOfficialResearch,
  checkedAt: Date,
  notes: string,
) {
  for (const source of research.sources) {
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
        accessedAt: optionalLegacyDate(source.accessedAt) ?? checkedAt,
        publishedAt: optionalLegacyDate(source.publishedAt),
        dataVersion: `accessed-${source.accessedAt}`,
        notes,
      },
      update: {
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType as never,
        sourceTitleOriginal: source.sourceTitleOriginal,
        sourceLanguage: source.sourceLanguage,
        sourceSummaryZhTw: source.sourceSummaryZhTw,
        accessedAt: optionalLegacyDate(source.accessedAt) ?? checkedAt,
        publishedAt: optionalLegacyDate(source.publishedAt),
        dataVersion: `accessed-${source.accessedAt}`,
        notes,
      },
    });
  }
}

export async function readLegacyRankings(
  prisma: SourceReferenceClient,
  pvpokeCommit: string,
  snapshot?: LegacyPvpSnapshot,
) {
  const result = new Map<LegacyLeagueKey, LegacyRankingRow[]>();
  for (const league of legacyLeagues(snapshot)) {
    const root = snapshot?.root ?? "data/sources/pvpoke";
    const bytes = await readFile(`${root}/rankings-${league.cp}.json`);
    const rows = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, "")) as LegacyRankingRow[];
    result.set(league.key, rows);
    const hash = createHash("sha256").update(bytes).digest("hex");
    await prisma.sourceReference.update({
      where: { id: league.sourceId },
      data: {
        accessedAt: snapshot?.checkedAt,
        dataVersion: `${pvpokeCommit}; sha256=${hash}`,
        notes: snapshot
          ? `Open League／Overall ${snapshot.label} 固定快照；名次以陣列索引加一重現，不使用搜尋摘要。`
          : "Open League／Overall 固定 commit 完整 JSON；名次以陣列索引加一重現，不使用搜尋摘要。",
      },
    });
  }
  return result;
}

export type LegacyReleaseSets = {
  shadow: ReadonlySet<string>;
  mega: ReadonlySet<string>;
  dynamax: ReadonlySet<string>;
  gigantamax: ReadonlySet<string>;
};

export function isLegacyVariantReleased(
  formId: string,
  variantKey: LegacyVariantKey,
  released: LegacyReleaseSets,
) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") return released.shadow.has(formId);
  if (variantKey === "MEGA") return released.mega.has(formId);
  if (variantKey === "DYNAMAX") return released.dynamax.has(formId);
  if (variantKey === "GIGANTAMAX") return released.gigantamax.has(formId);
  return false;
}

export function findLegacyRanks<T extends LegacyForm>(
  form: T,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LegacyLeagueKey, LegacyRankingRow[]>,
  speciesIdFor: (form: T, shadow: boolean) => string,
  snapshot?: LegacyPvpSnapshot,
) {
  const speciesId = speciesIdFor(form, variantKey === "SHADOW");
  return legacyLeagues(snapshot).flatMap((league) => {
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

export function legacyRankSummary(ranks: LegacyRankResult[]) {
  if (!ranks.length) return "PvPoke Open League／Overall 快照未列入可重現名次。";
  return ranks
    .map(
      (item) =>
        `${item.leagueLabel} Overall #${item.rank}${item.moves.length ? `；招式 ${item.moves.join("／")}` : ""}`,
    )
    .join("；");
}

export function legacyInitialDecision(
  variantKey: LegacyVariantKey,
  released: boolean,
  ranks: LegacyRankResult[],
  formId: string,
  pveUseLevels: Readonly<Record<string, string>>,
  options: { keepDynamax?: boolean } = {},
): LegacyDecision {
  if (!released) return "TRANSFER_CANDIDATE";
  if (variantKey === "MEGA") return "KEEP";
  if ((options.keepDynamax ?? true) && variantKey === "DYNAMAX") return "KEEP";
  if (pveUseLevels[formId] === "CORE_INVESTMENT") return "KEEP";
  if (pveUseLevels[formId]) return "CONDITIONAL_KEEP";
  const best = Math.min(...ranks.map((rank) => rank.rank), Number.POSITIVE_INFINITY);
  if (best <= 100) return "KEEP";
  if (best <= 250 || (variantKey === "NORMAL" && formId === "181-johto")) {
    return "CONDITIONAL_KEEP";
  }
  return "TRANSFER_CANDIDATE";
}

export function legacyInitialDisposition(
  decision: LegacyDecision,
  released: boolean,
): LegacyDisposition {
  if (!released) return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

export function buildLegacyPvpSourceRows<T extends LegacyForm>(
  variants: Array<{ id: string; form: T; variantKey: LegacyVariantKey }>,
  rankMap: Map<string, LegacyRankResult[]>,
  speciesIdFor: (form: T, shadow: boolean) => string,
  pvpokeCommit: string,
  checkedAt: Date,
  rawSourceVersion = "r19",
) {
  return variants.flatMap((variant) =>
    (rankMap.get(variant.id) ?? []).map((rank) => ({
      id: `raw-${rawSourceVersion}-${variant.id}-${rank.league.toLowerCase()}`,
      battleVariantId: variant.id,
      category: "PVP" as const,
      status: "VERIFIED" as const,
      league: rank.league,
      cup: "OPEN",
      pvpCategory: "OVERALL" as const,
      speciesKey: speciesIdFor(variant.form, variant.variantKey === "SHADOW"),
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
