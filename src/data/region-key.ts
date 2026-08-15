/** Region values supported by prisma/schema.prisma. */
export const REGION_KEYS = [
  "KANTO",
  "JOHTO",
  "HOENN",
  "SINNOH",
  "UNOVA",
  "KALOS",
  "ALOLA",
  "GALAR",
  "HISUI",
  "PALDEA",
  "OTHER",
] as const;

export type RegionKey = (typeof REGION_KEYS)[number];

export function isRegionKey(value: string): value is RegionKey {
  return (REGION_KEYS as readonly string[]).includes(value);
}
