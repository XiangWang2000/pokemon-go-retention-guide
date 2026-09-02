import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { PrismaSourceRow } from "@/lib/data-prisma";
import type { DashboardRow } from "@/lib/data-read-model";
import officialResearch from "../research_notes/sources/official-121-151.json";

const dashboardRows = JSON.parse(
  readFileSync(new URL("../site-data/dashboard.json", import.meta.url), "utf8"),
) as DashboardRow[];
const sourceRows = JSON.parse(
  readFileSync(new URL("../site-data/sources.json", import.meta.url), "utf8"),
) as PrismaSourceRow[];

describe("#121～#151 部署快照安全回歸", () => {
  it("維持批次計數、跨批進化與 Mega／Max 型態邊界", () => {
    const allRows = dashboardRows;
    const rows = allRows.filter((row) => row.dexNumber >= 121 && row.dexNumber <= 151);
    const species = new Set(rows.map((row) => row.speciesId));
    const forms = new Set(rows.map((row) => row.formId));
    const categoryCount = rows.reduce((sum, row) => sum + row.categoryStatuses.length, 0);
    const specialVariantIds = [
      "121-kanto-mega",
      "131-kanto-gigantamax",
      "143-kanto-gigantamax",
      "150-kanto-mega-x",
      "150-kanto-mega-y",
    ];
    const specialVariants = Object.fromEntries(
      allRows
        .filter((row) => specialVariantIds.includes(row.id))
        .map((row) => [row.id, row.releaseStatus]),
    );
    const crossPath = allRows
      .find((row) => row.id === "120-kanto-normal")
      ?.evolutionPaths.find(
        (path) => path.fromFormId === "120-kanto" && path.toFormId === "121-kanto",
      );

    expect([species.size, forms.size, rows.length, categoryCount]).toEqual([31, 39, 165, 1155]);
    expect(crossPath).toBeDefined();
    expect(specialVariants).toEqual({
      "121-kanto-mega": "RELEASED",
      "131-kanto-gigantamax": "RELEASED",
      "143-kanto-gigantamax": "RELEASED",
      "150-kanto-mega-x": "RELEASED",
      "150-kanto-mega-y": "RELEASED",
    });
    expect(
      allRows.some((row) => row.formId === "150-armored" && row.variantKey.startsWith("MEGA")),
    ).toBe(false);
  });

  it("保留高排名、重要暗影與特殊取得個體，並依用途套用不同 IV 規則", () => {
    const rows = dashboardRows;
    const ids = [
      "130-kanto-normal",
      "149-kanto-normal",
      "150-kanto-normal",
      "150-kanto-shadow",
      "151-kanto-normal",
    ];
    const byId = Object.fromEntries(
      rows.filter((row) => ids.includes(row.id)).map((row) => [row.id, row]),
    );

    for (const id of ids) expect(byId[id]?.decision, id).toBe("KEEP");
    expect(byId["150-kanto-normal"]?.recommendedIvStrategyZhTw).toContain(
      "15攻／96%以上為一般候選",
    );
    expect(byId["150-kanto-normal"]?.recommendedIvStrategyZhTw).toContain("CMP與攻防門檻");
    expect(byId["150-kanto-shadow"]?.recommendedIvStrategyZhTw).toContain("不設硬性最低IV");
    expect(byId["151-kanto-normal"]?.recommendedIvStrategyZhTw).toContain("不以 IV 作傳送門檻");
  });

  it("四種肯泰羅不會誤標暗影，且 19 筆官方來源均可追溯到本批評估", () => {
    const rows = dashboardRows;
    const sources = sourceRows;
    const taurosForms = new Set([
      "128-kanto",
      "128-paldea-combat",
      "128-paldea-blaze",
      "128-paldea-aqua",
    ]);
    expect(
      rows.some(
        (row) =>
          taurosForms.has(row.formId) &&
          ["SHADOW", "PURIFIED"].includes(row.variantKey) &&
          row.releaseStatus === "RELEASED",
      ),
    ).toBe(false);

    const bySourceId = new Map(sources.map((source) => [source.id, source]));
    for (const expected of officialResearch.sources) {
      const source = bySourceId.get(expected.id);
      expect(source?.evaluationCount, `${expected.id}→evaluationCount`).toBeGreaterThan(0);
      expect(source?.referencedPokemon.length, `${expected.id}→referencedPokemon`).toBeGreaterThan(
        0,
      );
      expect(source?.linkedEvidenceCount, `${expected.id}→linkedEvidenceCount`).toBeGreaterThan(0);
    }
  });
});
