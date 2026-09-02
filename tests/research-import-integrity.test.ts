import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertOfficialEvolutionPathsMaterialized } from "@/data/research-import";

type EvolutionEndpoint = { fromFormId: string; toFormId: string };

type ReleaseEvidence = { status: string; sourceIds: string[] };

const officialResearch = JSON.parse(
  readFileSync("research_notes/sources/official-001-030.json", "utf8"),
) as {
  evolutionPaths: EvolutionEndpoint[];
  forms: Array<{
    pokemonFormId: string;
    variants: Record<string, ReleaseEvidence>;
  }>;
  reviewQueue: Array<{ pokemonFormId: string; category: string }>;
};

const officialPaths = officialResearch.evolutionPaths;

const battleResearch = JSON.parse(
  readFileSync("research_notes/sources/battle-016-030.json", "utf8"),
) as {
  sources: Array<{
    id: string;
    sourceUrl: string;
    accessedAt: string;
    dataVersion?: string;
    sourceSummaryZhTw?: string;
  }>;
  rawEvaluationData: {
    pveAndMega: Array<{
      battleVariant: string;
      category: string;
      tier: string;
      rank?: number;
      typeRank?: number;
      overallRank?: number;
      alternateTypeRank?: { type: string; rank: number; tier: string };
      score?: { dps?: number; tdo?: number };
      moves: string[];
      sourceIds: string[];
      checkedAt: string;
    }>;
  };
  sourceConflicts: Array<{ entity: string; category: string }>;
  resolvedSourceConflicts: Array<{
    entity: string;
    category: string;
    status: string;
    resolvedAt: string;
    resolutionZhTw: string;
  }>;
};

function fakePrisma(rows: EvolutionEndpoint[]) {
  return {
    evolutionPath: {
      findMany: async () => rows,
    },
  } as never;
}

describe("official evolution path integrity", () => {
  it("accepts every official endpoint pair exactly once", async () => {
    await expect(
      assertOfficialEvolutionPathsMaterialized(fakePrisma(officialPaths)),
    ).resolves.toBeUndefined();
  });

  it("rejects missing and duplicate endpoint pairs generically", async () => {
    const rows = officialPaths.slice(1).concat(officialPaths[1]!);

    await expect(assertOfficialEvolutionPathsMaterialized(fakePrisma(rows))).rejects.toThrow(
      /001-kanto->002-kanto.*002-kanto->003-kanto/,
    );
  });
});

describe("complete roster release boundaries", () => {
  it("resolves every Shadow, Purified, Dynamax, and Gigantamax status", () => {
    const trackedKeys = ["SHADOW", "PURIFIED", "DYNAMAX", "GIGANTAMAX"];
    const trackedRows = officialResearch.forms.flatMap((form) =>
      trackedKeys.map((variantKey) => ({
        formId: form.pokemonFormId,
        variantKey,
        ...form.variants[variantKey],
      })),
    );

    expect(trackedRows.filter((row) => row.status === "NEEDS_REVIEW")).toEqual([]);
    expect(trackedRows.filter((row) => row.sourceIds.length === 0)).toEqual([]);
    expect(
      trackedRows.filter(
        (row) =>
          row.variantKey === "GIGANTAMAX" && row.status === "NOT_RELEASED_IN_COMPLETE_ROSTER",
      ),
    ).toHaveLength(30);
    expect(
      officialResearch.reviewQueue.filter((row) => trackedKeys.includes(row.category)),
    ).toEqual([]);
  });
});

describe("Mega 雷丘 Y PvE 證據", () => {
  it("保存2026-09-02可重現的電系第一名、標準輸出與額外招式邊界", () => {
    const row = battleResearch.rawEvaluationData.pveAndMega.find(
      (item) => item.battleVariant === "026-kanto:MEGA_Y" && item.category === "MEGA",
    );
    expect(row).toMatchObject({
      tier: "S",
      rank: 1,
      typeRank: 1,
      score: { dps: 18.64, tdo: 253.4 },
      checkedAt: "2026-09-02",
    });
    expect(row?.moves).toEqual(["THUNDER_SHOCK", "WILD_CHARGE", "ZAP_CANNON_PLUS"]);
    expect(row?.sourceIds).toEqual(
      expect.arrayContaining([
        "gohub-mega-raichu-y",
        "gohub-mega-ascension-pve-20260901",
        "official-more-mega-updates-2026",
      ]),
    );
    expect(battleResearch.sources.find((item) => item.id === "gohub-mega-raichu-y")).toMatchObject({
      accessedAt: "2026-09-02",
    });
  });
});

describe("#016～#030 五筆戰鬥資料補正", () => {
  it("補齊三個暗影 PvE 低價值結論與可重現數據", () => {
    const expected = [
      ["020-kanto:SHADOW", 116, 9.81, 94.3, ["QUICK_ATTACK", "HYPER_FANG"]],
      ["020-alola:SHADOW", 127, 9.07, 116.0, ["QUICK_ATTACK", "HYPER_FANG"]],
      ["024-kanto:SHADOW", 76, 9.39, 103.9, ["ACID", "GUNK_SHOT"]],
    ] as const;

    for (const [battleVariant, typeRank, dps, tdo, moves] of expected) {
      const row = battleResearch.rawEvaluationData.pveAndMega.find(
        (item) => item.battleVariant === battleVariant && item.category === "PVE",
      );
      expect(row).toMatchObject({
        tier: "F",
        rank: typeRank,
        typeRank,
        score: { dps, tdo },
        moves: [...moves],
        checkedAt: "2026-09-02",
      });
    }

    expect(
      battleResearch.rawEvaluationData.pveAndMega.find(
        (item) => item.battleVariant === "020-alola:SHADOW" && item.category === "PVE",
      )?.alternateTypeRank,
    ).toEqual({ type: "DARK", rank: 191, tier: "F" });
  });

  it("以相同範圍比較 Mega 大比鳥，並保存整體與飛行系排名", () => {
    const row = battleResearch.rawEvaluationData.pveAndMega.find(
      (item) => item.battleVariant === "018-kanto:MEGA" && item.category === "MEGA",
    );
    expect(row).toMatchObject({
      tier: "A+",
      rank: 17,
      typeRank: 17,
      overallRank: 172,
      score: { dps: 15.69, tdo: 290.0 },
      checkedAt: "2026-09-02",
    });
    expect(battleResearch.sourceConflicts.some((item) => item.entity === "018-kanto:MEGA")).toBe(
      false,
    );
    expect(
      battleResearch.resolvedSourceConflicts.find((item) => item.entity === "018-kanto:MEGA"),
    ).toMatchObject({ status: "RESOLVED", resolvedAt: "2026-09-02" });
  });

  it("固定快照與即時 Tier 欄一致後關閉大嘴雀 PvP 衝突", () => {
    expect(battleResearch.sourceConflicts.some((item) => item.entity === "022-kanto:NORMAL")).toBe(
      false,
    );
    expect(
      battleResearch.resolvedSourceConflicts.find((item) => item.entity === "022-kanto:NORMAL"),
    ).toMatchObject({ status: "RESOLVED", resolvedAt: "2026-09-02" });
    expect(battleResearch.sources.find((item) => item.id === "gohub-fearow")).toMatchObject({
      accessedAt: "2026-09-02",
      dataVersion: expect.stringContaining("GL S #21; UL B #353"),
    });
  });
});
