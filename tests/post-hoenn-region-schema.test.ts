import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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
    expect(values).toContain("SINNOH");
    expect(values).toContain("UNOVA");
    expect(values).toContain("KALOS");
  });

  it("preserves all currently published regional-form regions", () => {
    const values = regionEnumValues();
    for (const region of ["KANTO", "JOHTO", "HOENN", "ALOLA", "GALAR", "HISUI", "PALDEA", "OTHER"]) {
      expect(values).toContain(region);
    }
  });
});
