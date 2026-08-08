import type { FamilyRetentionStrategy } from "./family-overview";
import type { HomeSnapshot } from "./home-snapshot";

export const familyRetentionStrategies = [
  "KEEP_TARGETS",
  "SELECTIVE_KEEP",
  "MOSTLY_TRANSFER",
  "HOLD_FOR_NOW",
] as const satisfies readonly FamilyRetentionStrategy[];

export interface HomeSummary {
  schemaVersion: 1;
  dataVersion: string;
  dataAsOf: string | null;
  strategyCounts: Record<FamilyRetentionStrategy, number>;
}

function strategyCounts(families: HomeSnapshot["families"]) {
  return Object.fromEntries(
    familyRetentionStrategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  ) as Record<FamilyRetentionStrategy, number>;
}

export function buildHomeSummary(home: HomeSnapshot): HomeSummary {
  return {
    schemaVersion: 1,
    dataVersion: home.dataVersion,
    dataAsOf: home.dataAsOf,
    strategyCounts: strategyCounts(home.families),
  };
}
