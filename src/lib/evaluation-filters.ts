import { pokemonGenerationRanges } from "./pokemon-taxonomy";

export const familyDecisionFilterValues = [
  "ALL",
  "KEEP_TARGETS",
  "SELECTIVE_KEEP",
  "MOSTLY_TRANSFER",
  "HOLD_FOR_NOW",
] as const;

export const decisionFilterValues = [
  "ALL",
  "KEEP",
  "CONDITIONAL_KEEP",
  "HOLD_FOR_NOW",
  "TRANSFER_CANDIDATE",
] as const;

export const variantFilterValues = [
  "ALL",
  "NORMAL",
  "SHADOW",
  "PURIFIED",
  "MEGA",
  "MEGA_X",
  "MEGA_Y",
  "DYNAMAX",
  "GIGANTAMAX",
] as const;

export const useFilterValues = [
  "ALL",
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX",
  "EVOLUTION",
] as const;

export const generationFilterValues = [
  "ALL",
  ...pokemonGenerationRanges.map((item) => item.key),
] as const;

export const regionFilterValues = [
  "ALL",
  "KANTO",
  "JOHTO",
  "HOENN",
  "SINNOH",
  "ALOLA",
  "GALAR",
  "HISUI",
  "PALDEA",
  "OTHER",
] as const;

export const freshnessFilterValues = ["ALL", "FRESH", "STALE"] as const;
export const reviewedFilterValues = ["ALL", "YES", "NO"] as const;
export const sortFilterValues = ["DEX_ASC", "DEX_DESC", "UPDATED", "DECISION"] as const;

export function normalizeFilterValue(
  value: string | null | undefined,
  allowed: readonly string[],
  fallback: string,
) {
  return value && allowed.includes(value) ? value : fallback;
}
