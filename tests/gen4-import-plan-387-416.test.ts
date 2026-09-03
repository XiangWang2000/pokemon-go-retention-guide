import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildGen4ImportPlan387416,
  type Gen4PlanLeague,
  type Gen4PvpRankingRow,
  type Gen4RankingSnapshots,
} from "@/data/gen4-import-plan";

function readRankings(cp: number) {
  return JSON.parse(
    readFileSync(`data/sources/pvpoke/2026-09-01/rankings-${cp}.json`, "utf8").replace(/^\uFEFF/, ""),
  ) as Gen4PvpRankingRow[];
}

const rankings: Gen4RankingSnapshots = {
  GREAT: readRankings(1500),
  ULTRA: readRankings(2500),
  MASTER: readRankings(10000),
};
const plan = buildGen4ImportPlan387416(rankings);

function byId(id: string) {
  const row = plan.find((item) => item.id === id);
  if (!row) throw new Error(`Missing Gen 4 import-plan row ${id}.`);
  return row;
}

describe("Gen 4 #387-#416 pure import plan", () => {
  it("creates four candidate BattleVariants for every one of the 34 forms", () => {
    expect(plan).toHaveLength(136);
    expect(new Set(plan.map((row) => row.id)).size).toBe(136);
    expect(plan.filter((row) => row.variantKey === "NORMAL")).toHaveLength(34);
    expect(plan.filter((row) => row.variantKey === "SHADOW")).toHaveLength(34);
    expect(plan.filter((row) => row.variantKey === "PURIFIED")).toHaveLength(34);
    expect(plan.filter((row) => row.variantKey === "DYNAMAX")).toHaveLength(34);
  });

  it("keeps the current release boundary exact", () => {
    expect(plan.filter((row) => row.variantKey === "NORMAL" && row.released)).toHaveLength(34);
    expect(plan.filter((row) => row.variantKey === "SHADOW" && row.released)).toHaveLength(21);
    expect(plan.filter((row) => row.variantKey === "PURIFIED" && row.released)).toHaveLength(21);
    expect(plan.filter((row) => row.variantKey === "DYNAMAX" && row.released)).toHaveLength(2);
    expect(plan.filter((row) => row.released)).toHaveLength(78);
  });

  it("only assigns pinned PvP ranks to released normal or Shadow variants", () => {
    for (const row of plan) {
      if (row.ranks.length) {
        expect(row.released).toBe(true);
        expect(["NORMAL", "SHADOW"]).toContain(row.variantKey);
        expect(row.bestPvpRank).toBe(Math.min(...row.ranks.map((rank) => rank.rank)));
        for (const rank of row.ranks) {
          expect(["GREAT", "ULTRA", "MASTER"] satisfies Gen4PlanLeague[]).toContain(rank.league);
        }
      } else {
        expect(row.bestPvpRank).toBeNull();
      }
    }
  });

  it("keeps PvE evidence variant-specific instead of leaking Shadow value into normal forms", () => {
    expect(byId("389-sinnoh-normal").pveEvidence).toBeNull();
    expect(byId("389-sinnoh-shadow").pveEvidence?.level).toBe("CORE_INVESTMENT");
    expect(byId("395-sinnoh-normal").pveEvidence).toBeNull();
    expect(byId("395-sinnoh-shadow").pveEvidence?.level).toBe("USABLE_OR_BUDGET");
    expect(byId("409-sinnoh-normal").pveEvidence?.level).toBe("CORE_INVESTMENT");
    expect(byId("409-sinnoh-shadow").pveEvidence?.level).toBe("CORE_INVESTMENT");
  });

  it("seeds decisions from the strongest confirmed use", () => {
    for (const row of plan) {
      if (!row.released) {
        expect(row.initialDecision).toBe("TRANSFER_CANDIDATE");
        expect(row.initialDisposition).toBe("NOT_APPLICABLE_OR_UNRELEASED");
        continue;
      }

      const hasCorePve = row.pveEvidence?.level === "CORE_INVESTMENT";
      const hasCoreMax = row.maxEvidence?.level === "CORE_INVESTMENT";
      const top100Pvp = row.bestPvpRank !== null && row.bestPvpRank <= 100;
      const top250Pvp = row.bestPvpRank !== null && row.bestPvpRank <= 250;
      if (hasCorePve || hasCoreMax || top100Pvp) {
        expect(row.initialDecision).toBe("KEEP");
        expect(row.initialDisposition).toBe("CLEAR_USE");
      } else if (
        row.pveEvidence !== null ||
        row.maxEvidence !== null ||
        top250Pvp ||
        row.variantKey === "MEGA"
      ) {
        expect(row.initialDecision).toBe("CONDITIONAL_KEEP");
        expect(row.initialDisposition).toBe("LIMITED_USE");
      } else {
        expect(row.initialDecision).toBe("TRANSFER_CANDIDATE");
        expect(row.initialDisposition).toBe("NO_SIGNIFICANT_USE");
      }
    }
  });

  it("does not equate a released Dynamax form with confirmed Max Battle value", () => {
    expect(byId("415-sinnoh-dynamax").releaseStatus).toBe("RELEASED");
    expect(byId("415-sinnoh-dynamax").maxEvidence).toBeNull();
    expect(byId("415-sinnoh-dynamax").initialDecision).toBe("TRANSFER_CANDIDATE");

    expect(byId("416-sinnoh-dynamax").releaseStatus).toBe("RELEASED");
    expect(byId("416-sinnoh-dynamax").maxEvidence?.level).toBe("SPECIAL_USE");
    expect(byId("416-sinnoh-dynamax").initialDecision).toBe("CONDITIONAL_KEEP");

    expect(byId("414-sinnoh-dynamax").releaseStatus).toBe("UNRELEASED");
  });
});
