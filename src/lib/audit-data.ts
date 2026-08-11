import { freshnessDays } from "@/config/freshness";
import type { DashboardRow } from "@/lib/data";
import { matchesPokemonGeneration } from "@/lib/pokemon-taxonomy";
import { matchesPokemonSearch } from "@/lib/search";
import {
  decisionFilterValues,
  freshnessFilterValues,
  generationFilterValues,
  normalizeFilterValue,
  regionFilterValues,
  reviewedFilterValues,
  sortFilterValues,
  useFilterValues,
  variantFilterValues,
} from "@/lib/evaluation-filters";

const rocketRatings = new Set(["HIGHLY_RECOMMENDED", "USEFUL", "NICHE"]);
const actionablePveLevels = new Set(["CORE_INVESTMENT", "USABLE_OR_BUDGET", "SPECIAL_USE"]);

export interface AuditRowSummary {
  id: string;
  formId: string;
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  formNameEn: string;
  formNameZhTw: string;
  aliases: string[];
  evolutionNames: string[];
  regionKey: DashboardRow["regionKey"];
  variantKey: DashboardRow["variantKey"];
  decision: DashboardRow["decision"];
  confidence: DashboardRow["confidence"];
  updatedAt: string | null;
  reviewed: boolean;
  pvpRanks: Record<"GREAT" | "ULTRA" | "MASTER", number | null>;
  sourceCount: number;
  hasPvpUse: boolean;
  hasSpecialCupUse?: boolean;
  hasCuratedPvpUse?: boolean;
  pveUseLevels: string[];
  hasRocketUse: boolean;
  gymRating: string;
  hasMegaUse: boolean;
  hasMaxUse: boolean;
  hasEvolutionUse: boolean;
}

export interface AuditSummarySnapshot {
  schemaVersion: 1;
  dataAsOf: string | null;
  rows: AuditRowSummary[];
}

export interface AuditPageResponse {
  schemaVersion: 1;
  dataAsOf: string | null;
  rows: AuditRowSummary[];
  total: number;
  overallTotal: number;
  page: number;
  pageSize: number;
}

export interface AuditQuery {
  query: string;
  decision: string;
  variant: string;
  use: string;
  generation: string;
  region: string;
  freshness: string;
  reviewed: string;
  sort: string;
  page: number;
  pageSize: number;
}

function rank(row: DashboardRow, league: "GREAT" | "ULTRA" | "MASTER") {
  return row.raw.find((item) => item.category === "PVP" && item.league === league)?.rank ?? null;
}

function matchedRule(row: DashboardRow, ruleKey: string) {
  return row.traces.some((trace) => trace.ruleKey === ruleKey && trace.matched);
}

function hasActionableRankedPvpUse(row: DashboardRow) {
  return row.raw.some(
    (item) =>
      item.category === "PVP" &&
      item.rank !== null &&
      (item.rank <= 250 || item.league === "SPECIAL_CUP"),
  );
}

function hasSpecialCupPvpUse(row: DashboardRow) {
  return row.raw.some(
    (item) => item.category === "PVP" && item.league === "SPECIAL_CUP" && item.rank !== null,
  );
}

function hasCuratedPvpUse(row: DashboardRow) {
  const pvp = row.categoryStatuses.find((status) => status.category === "PVP");
  return (
    row.variantKey === "NORMAL" &&
    row.decision === "CONDITIONAL_KEEP" &&
    matchedRule(row, "CONDITIONAL_USE") &&
    Boolean(pvp?.materialToDecision) &&
    ["VERIFIED", "PARTIALLY_VERIFIED"].includes(pvp?.status ?? "")
  );
}

export function toAuditRowSummary(row: DashboardRow): AuditRowSummary {
  const specialCupUse = hasSpecialCupPvpUse(row);
  const curatedPvpUse = hasCuratedPvpUse(row);
  return {
    id: row.id,
    formId: row.formId,
    dexNumber: row.dexNumber,
    nameEn: row.nameEn,
    nameZhTw: row.nameZhTw,
    formNameEn: row.formNameEn,
    formNameZhTw: row.formNameZhTw,
    aliases: row.aliases,
    evolutionNames: row.evolutionNames,
    regionKey: row.regionKey,
    variantKey: row.variantKey,
    decision: row.decision,
    confidence: row.confidence,
    updatedAt: row.updatedAt,
    reviewed: row.reviewed,
    pvpRanks: {
      GREAT: rank(row, "GREAT"),
      ULTRA: rank(row, "ULTRA"),
      MASTER: rank(row, "MASTER"),
    },
    sourceCount: row.sources.length,
    hasPvpUse: hasActionableRankedPvpUse(row) || curatedPvpUse,
    hasSpecialCupUse: specialCupUse,
    hasCuratedPvpUse: curatedPvpUse,
    pveUseLevels: row.categoryStatuses
      .filter((status) => status.category === "PVE" && status.pveUseLevel)
      .map((status) => status.pveUseLevel as string),
    hasRocketUse: row.categoryStatuses.some(
      (status) => status.category === "ROCKET" && rocketRatings.has(status.rocketRating ?? ""),
    ),
    gymRating: row.gymRating,
    hasMegaUse: row.variantKey.startsWith("MEGA"),
    hasMaxUse: ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey),
    hasEvolutionUse: row.evolutionSummaryZhTw.includes("後續進化"),
  };
}

export function buildAuditSummary(
  rows: DashboardRow[],
  dataAsOf: string | null,
): AuditSummarySnapshot {
  return { schemaVersion: 1, dataAsOf, rows: rows.map(toAuditRowSummary) };
}

export function normalizeAuditQuery(params: URLSearchParams): AuditQuery {
  const rawPage = Number(params.get("page"));
  return {
    query: params.get("q") ?? "",
    decision: normalizeFilterValue(params.get("decision"), decisionFilterValues, "ALL"),
    variant: normalizeFilterValue(params.get("variant"), variantFilterValues, "ALL"),
    use: normalizeFilterValue(params.get("use"), useFilterValues, "ALL"),
    generation: normalizeFilterValue(params.get("generation"), generationFilterValues, "ALL"),
    region: normalizeFilterValue(params.get("region"), regionFilterValues, "ALL"),
    freshness: normalizeFilterValue(params.get("freshness"), freshnessFilterValues, "ALL"),
    reviewed: normalizeFilterValue(params.get("reviewed"), reviewedFilterValues, "ALL"),
    sort: normalizeFilterValue(params.get("sort"), sortFilterValues, "DEX_ASC"),
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
    pageSize: 40,
  };
}

function hasActionablePvpUse(row: AuditRowSummary) {
  if (row.hasSpecialCupUse || row.hasCuratedPvpUse) return true;
  const standardLeagueRanks = Object.values(row.pvpRanks).filter(
    (rank): rank is number => rank !== null,
  );
  if (standardLeagueRanks.length) return standardLeagueRanks.some((rank) => rank <= 250);
  return row.hasPvpUse;
}

function matchesUse(row: AuditRowSummary, use: string) {
  if (use === "ALL") return true;
  if (use === "PVP") return hasActionablePvpUse(row);
  if (use === "PVE") return row.pveUseLevels.some((level) => actionablePveLevels.has(level));
  if (use === "ROCKET") return row.hasRocketUse;
  if (use === "GYM") return ["HIGH", "MEDIUM", "SPECIAL_CASE"].includes(row.gymRating);
  if (use === "MEGA") return row.hasMegaUse;
  if (use === "MAX") return row.hasMaxUse;
  if (use === "EVOLUTION") return row.hasEvolutionUse;
  return false;
}

export function filterAuditRows(
  rows: AuditRowSummary[],
  query: AuditQuery,
  referenceDate: string | null,
) {
  const now = Date.parse(referenceDate ?? "");
  return rows
    .filter((row) =>
      matchesPokemonSearch(
        {
          dexNumber: row.dexNumber,
          nameEn: row.nameEn,
          nameZhTw: row.nameZhTw,
          formNameEn: row.formNameEn,
          formNameZhTw: row.formNameZhTw,
          aliases: row.aliases,
          evolutionNames: row.evolutionNames,
        },
        query.query,
      ),
    )
    .filter((row) => query.decision === "ALL" || row.decision === query.decision)
    .filter((row) => query.variant === "ALL" || row.variantKey === query.variant)
    .filter((row) => matchesPokemonGeneration(row.dexNumber, query.generation))
    .filter((row) => query.region === "ALL" || row.regionKey === query.region)
    .filter((row) => matchesUse(row, query.use))
    .filter((row) => query.reviewed === "ALL" || row.reviewed === (query.reviewed === "YES"))
    .filter((row) => {
      if (query.freshness === "ALL") return true;
      const stale =
        !row.updatedAt ||
        !Number.isFinite(now) ||
        now - new Date(row.updatedAt).getTime() > freshnessDays.PVP * 86_400_000;
      return query.freshness === "STALE" ? stale : !stale;
    })
    .sort((left, right) => {
      if (query.sort === "DEX_DESC") return right.dexNumber - left.dexNumber;
      if (query.sort === "DECISION") return left.decision.localeCompare(right.decision);
      if (query.sort === "UPDATED")
        return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
      return left.dexNumber - right.dexNumber || left.formId.localeCompare(right.formId);
    });
}
