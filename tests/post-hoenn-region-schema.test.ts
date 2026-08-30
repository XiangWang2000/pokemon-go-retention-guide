import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REGION_KEYS, isRegionKey, type RegionKey } from "@/data/region-key";

const schema = readFileSync("prisma/schema.prisma", "utf8");

function regionEnumValues() {
  const match = schema.match(/enum RegionKey\s*\{([\s\S]*?)\}/);
  if (!match) throw new Error("RegionKey enum is missing from prisma/schema.prisma");
  return match[1]
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

describe("post-Hoenn Prisma region support", () => {
  it("can represent the main-series regions needed after Hoenn", () => {
    const values = regionEnumValues();
    expect(values).toEqual([...REGION_KEYS]);
    const sinnoh: RegionKey = "SINNOH";
    expect(isRegionKey(sinnoh)).toBe(true);
  });

  it("preserves all currently published regional-form regions", () => {
    const values = regionEnumValues();
    for (const region of [
      "KANTO",
      "JOHTO",
      "HOENN",
      "ALOLA",
      "GALAR",
      "HISUI",
      "PALDEA",
      "OTHER",
    ]) {
      expect(values).toContain(region);
    }
  });
});
