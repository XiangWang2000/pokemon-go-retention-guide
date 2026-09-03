import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";

type GuideSpec = {
  generation: number;
  path: string;
  minDex: number;
  maxDex: number;
};

const guides: GuideSpec[] = [
  {
    generation: 5,
    path: "research_notes/history/generation-5-unova-retention.md",
    minDex: 494,
    maxDex: 649,
  },
  {
    generation: 6,
    path: "research_notes/history/generation-6-kalos-retention.md",
    minDex: 650,
    maxDex: 721,
  },
  {
    generation: 7,
    path: "research_notes/history/generation-7-alola-retention.md",
    minDex: 722,
    maxDex: 809,
  },
  {
    generation: 8,
    path: "research_notes/history/generation-8-galar-hisui-retention.md",
    minDex: 810,
    maxDex: 905,
  },
  {
    generation: 9,
    path: "research_notes/history/generation-9-paldea-retention.md",
    minDex: 906,
    maxDex: 1025,
  },
];

function rows(markdown: string) {
  return [...markdown.matchAll(/^\|\s*#(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/gm)].map(
    (match) => ({
      dex: Number(match[1]),
      name: match[2].trim(),
      recommendation: match[3].trim(),
      ranks: match[4].trim(),
      reason: match[5].trim(),
    }),
  );
}

function summaryCount(markdown: string, label: string) {
  const match = new RegExp(`${label}：(\\d+) 隻`).exec(markdown);
  return match ? Number(match[1]) : null;
}

function tableCount(items: ReturnType<typeof rows>, marker: string) {
  return items.filter((item) => item.recommendation.includes(marker)).length;
}

describe("Gen 1-9 audit coverage", () => {
  it("keeps formal publication scope distinct from research-only Gen 5-9 audit notes", () => {
    // This is intentionally a QA assertion, not a success criterion for all-nine-generation
    // publication.  It prevents presentation-only notes from being mistaken for runtime data.
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
  });

  for (const guide of guides) {
    it(`Gen ${guide.generation} research guide covers every National Dex number exactly once`, () => {
      const markdown = readFileSync(guide.path, "utf8");
      const items = rows(markdown);
      const expected = Array.from(
        { length: guide.maxDex - guide.minDex + 1 },
        (_, index) => guide.minDex + index,
      );

      expect(items.map((item) => item.dex)).toEqual(expected);
      expect(new Set(items.map((item) => item.dex)).size).toBe(expected.length);
      expect(markdown).toContain("評估日期：2026-09-03");
      expect(markdown).toContain("101–250");
    });

    it(`Gen ${guide.generation} summary counts match its table`, () => {
      const markdown = readFileSync(guide.path, "utf8");
      const items = rows(markdown);
      expect(summaryCount(markdown, "🔴 優先保留")).toBe(tableCount(items, "🔴"));
      expect(summaryCount(markdown, "🟡 選擇性保留")).toBe(tableCount(items, "🟡"));
      expect(summaryCount(markdown, "⚪ 普通重複可傳")).toBe(tableCount(items, "⚪"));
    });

    it(`Gen ${guide.generation} does not transfer a row with a displayed Open rank <= 250`, () => {
      const markdown = readFileSync(guide.path, "utf8");
      const offenders = rows(markdown)
        .filter((item) => item.recommendation.includes("⚪"))
        .filter((item) => {
          const ranks = [...item.ranks.matchAll(/(?:GL|UL|ML)#(\d+)/g)].map((match) =>
            Number(match[1]),
          );
          return ranks.some((rank) => rank <= 250);
        })
        .map((item) => `#${item.dex} ${item.name}: ${item.ranks}`);
      expect(offenders).toEqual([]);
    });
  }
});
