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
  it("keeps Gen6-9 research notes distinct after Gen5 publication", () => {
    // Gen5 is now formally published through #649; later-generation audit notes remain
    // research-only and must not be mistaken for additional runtime publication.
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
  });

  it("keeps Gen5-9 species-level notes explicit about variant isolation", () => {
    for (const guide of guides) {
      const markdown = readFileSync(guide.path, "utf8");
      expect(markdown).toContain("型態隔離");
      expect(markdown).toContain("不得互相回灌");
      expect(markdown).toContain("2026-09-01 PvPoke 快照");
    }
  });

  it("does not claim ordinary Gen5 base species can evolve into unavailable Hisuian branches", () => {
    const markdown = readFileSync("research_notes/history/generation-5-unova-retention.md", "utf8");
    const rufflet = rows(markdown).find((row) => row.dex === 627);
    expect(rufflet?.reason).toContain("洗翠勇士雄鷹為獨立地區型態");
    expect(rufflet?.reason).not.toContain("可進化為勇士雄鷹／洗翠勇士雄鷹");
    const petilil = rows(markdown).find((row) => row.dex === 548);
    expect(petilil?.reason).toContain("洗翠裙兒小姐");
    expect(petilil?.reason).toMatch(/獨立(?:地區)?型態/);
    expect(petilil?.reason).toMatch(/不能.*(?:進化理由|回灌)/);
    expect(petilil?.reason).not.toContain("可進化為裙兒小姐／洗翠裙兒小姐");
  });

  it("does not promote Forces of Nature rows by leaking alternate-form value", () => {
    const markdown = readFileSync("research_notes/history/generation-5-unova-retention.md", "utf8");
    const tornadus = rows(markdown).find((row) => row.dex === 641);
    expect(tornadus?.recommendation).toContain("⚪");
    expect(tornadus?.ranks).toBe("GL#1132 / UL#832 / ML#400");
    expect(tornadus?.reason).toContain("化身形態");
    expect(tornadus?.reason).toMatch(/回灌/);

    const thundurus = rows(markdown).find((row) => row.dex === 642);
    expect(thundurus?.recommendation).toContain("🟡");
    expect(thundurus?.reason).toContain("化身形態");
    expect(thundurus?.reason).toMatch(/回灌|不能直接套用/);

    const landorus = rows(markdown).find((row) => row.dex === 645);
    expect(landorus?.recommendation).toContain("🔴");
    expect(landorus?.ranks).toBe("GL#712 / UL#522 / ML#98");
    expect(landorus?.reason).toContain("化身形態");
    expect(landorus?.reason).toMatch(/回灌|不能直接套用/);
  });

  it("does not use Gigantamax value as an automatic ordinary Gen8 keep reason", () => {
    const markdown = readFileSync("research_notes/history/generation-8-galar-hisui-retention.md", "utf8");
    expect(markdown).not.toContain("可進化為轟擂金剛猩／GMAX");
    expect(markdown).not.toContain("可進化為閃焰王牌／GMAX");
    expect(markdown).not.toContain("可進化為千面避役／GMAX");
    for (const dex of [812, 815, 818, 849, 861]) {
      const item = rows(markdown).find((row) => row.dex === dex);
      expect(item?.recommendation).toContain("🟡");
      expect(item?.reason).toContain("普通個體不得因 Gigantamax 版本價值自動升級");
    }
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
