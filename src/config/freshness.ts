export const freshnessDays = {
  PVP: 90,
  PVE: 180,
  MOVE: 180,
  RELEASE_STATUS: 365,
  OFFICIAL_MECHANIC: 365,
  GYM: 365,
  MAX_BATTLE: 180,
} as const;

export type FreshnessCategory = keyof typeof freshnessDays;

export function isStale(checkedAt: Date, category: FreshnessCategory, now = new Date()) {
  const ageMs = now.getTime() - checkedAt.getTime();
  return ageMs > freshnessDays[category] * 86_400_000;
}
