import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { PrismaDashboardRow } from "@/lib/data-prisma";

const dashboardRows = JSON.parse(
  readFileSync(new URL("../site-data/dashboard.json", import.meta.url), "utf8"),
) as PrismaDashboardRow[];

describe("#091～#120 部署快照安全回歸", () => {
  it("不會誤傳暗影海星星與已開放 Mega 的基底個體", () => {
    const rows = dashboardRows;
    const byId = Object.fromEntries(
      rows
        .filter((row) =>
          ["094-kanto-normal", "115-kanto-normal", "120-kanto-shadow"].includes(row.id),
        )
        .map((row) => [row.id, row]),
    );

    expect(Object.keys(byId).sort()).toEqual([
      "094-kanto-normal",
      "115-kanto-normal",
      "120-kanto-shadow",
    ]);
    expect(byId["094-kanto-normal"]?.decision).toBe("CONDITIONAL_KEEP");
    expect(byId["115-kanto-normal"]?.decision).toBe("CONDITIONAL_KEEP");
    expect(byId["120-kanto-shadow"]?.decision).toBe("CONDITIONAL_KEEP");
    expect(byId["094-kanto-normal"]?.reasonZhTw).toContain("其餘普通重複可傳");
    expect(byId["115-kanto-normal"]?.reasonZhTw).toContain("其餘普通重複可傳");
    expect(byId["120-kanto-shadow"]?.reasonZhTw).toContain("後續進化");
    expect(byId["120-kanto-shadow"]?.recommendedIvStrategyZhTw).toContain("不設硬性最低IV");
  });

  it("活動限定進化來源同時綁定起點與終點，且類別採一手來源", () => {
    const rows = dashboardRows;
    const expected = [
      ["OFF-EVENT-ALOLA-EXEGGUTOR-2024", "102-kanto"],
      ["OFF-EVENT-ALOLA-EXEGGUTOR-2024", "103-alola"],
      ["OFF-ALOLA-TO-ALOLA-2022", "104-kanto"],
      ["OFF-ALOLA-TO-ALOLA-2022", "105-alola"],
      ["OFF-LEGENDARY-HEROES-2024", "109-kanto"],
      ["OFF-LEGENDARY-HEROES-2024", "110-galar"],
    ] as const;

    for (const [sourceId, formId] of expected) {
      const row = rows.find((candidate) => candidate.id === `${formId}-normal`);
      const category = row?.categoryStatuses.find(
        (candidate) => candidate.category === "EVOLUTION_VALUE",
      );
      expect(
        row?.sources.some((source) => source.id === sourceId),
        `${sourceId}→${formId}`,
      ).toBe(true);
      expect(
        category?.sources.some((source) => source.id === sourceId),
        `${sourceId}→${formId}→EVOLUTION_VALUE`,
      ).toBe(true);
      expect(category?.provenance, `${formId}→EVOLUTION_VALUE`).toBe("SOURCE_VERIFIED");
    }
  });
});
