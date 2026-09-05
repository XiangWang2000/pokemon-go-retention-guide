import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getGen6BatchDefinition } from "@/data/batch-gen6";
import {
  buildGen6ImportPlan,
  type Gen6PlanLeague,
  type Gen6PvpRankingRow,
  type Gen6RankingSnapshots,
} from "@/data/gen6-import-plan";
import { GEN6_LOCAL_RANKING_PATHS } from "@/data/candidates/gen6-pvp";

function rankings(): Gen6RankingSnapshots {
  const paths: Record<Gen6PlanLeague, string> = {
    GREAT: GEN6_LOCAL_RANKING_PATHS.GL,
    ULTRA: GEN6_LOCAL_RANKING_PATHS.UL,
    MASTER: GEN6_LOCAL_RANKING_PATHS.ML,
  };
  const result = {} as Record<Gen6PlanLeague, Gen6PvpRankingRow[]>;
  for (const [league, sourcePath] of Object.entries(paths) as Array<[Gen6PlanLeague, string]>) {
    result[league] = JSON.parse(readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "")) as Gen6PvpRankingRow[];
  }
  return result;
}

function allRows() {
  const snapshot = rankings();
  return ["650-679", "680-709", "710-721"].flatMap((batch) =>
    buildGen6ImportPlan(getGen6BatchDefinition(batch), snapshot),
  );
}

describe("Gen6 formal import plan", () => {
  it("binds all three candidate definitions to exact PvP/release/PvE/Max evidence", () => {
    expect(getGen6BatchDefinition("650-679").forms).toHaveLength(106);
    expect(getGen6BatchDefinition("680-709").forms).toHaveLength(33);
    expect(getGen6BatchDefinition("710-721").forms).toHaveLength(22);
    expect(() => getGen6BatchDefinition("649-678")).toThrow(/Unknown Gen6 batch/);
  });

  it("materializes four base BattleVariants per exact form and only evidence-backed special variants", () => {
    const rows = allRows();
    expect(rows).toHaveLength(652);
    expect(new Set(rows.map((row) => row.id)).size).toBe(652);
    expect(rows.filter((row) => row.variantKey === "NORMAL")).toHaveLength(161);
    expect(rows.filter((row) => row.variantKey === "SHADOW")).toHaveLength(161);
    expect(rows.filter((row) => row.variantKey === "PURIFIED")).toHaveLength(161);
    expect(rows.filter((row) => row.variantKey === "DYNAMAX")).toHaveLength(161);
    expect(rows.filter((row) => row.variantKey === "MEGA")).toHaveLength(8);
    expect(rows.filter((row) => row.variantKey === "GIGANTAMAX")).toHaveLength(0);
  });

  it("preserves release tri-state instead of turning missing evidence into false", () => {
    const rows = allRows();
    expect(rows.filter((row) => row.releaseStatus === "RELEASED")).toHaveLength(215);
    expect(rows.filter((row) => row.releaseStatus === "UNRELEASED")).toHaveLength(4);
    expect(rows.filter((row) => row.releaseStatus === "UNKNOWN")).toHaveLength(433);

    const byId = new Map(rows.map((row) => [row.id, row]));
    expect(byId.get("705-hisui-normal")?.releaseStatus).toBe("UNKNOWN");
    expect(byId.get("706-hisui-normal")?.releaseStatus).toBe("UNRELEASED");
    expect(byId.get("706-kalos-normal")?.releaseStatus).toBe("RELEASED");
    expect(byId.has("718-50-percent-mega")).toBe(false);
    expect(byId.get("689-kalos-mega")?.releaseStatus).toBe("UNRELEASED");
  });

  it("never borrows PvP ranks for no-pinned-id Hisuian Sliggoo/Goodra", () => {
    const byId = new Map(allRows().map((row) => [row.id, row]));
    expect(byId.get("705-hisui-normal")?.ranks).toEqual([]);
    expect(byId.get("706-hisui-normal")?.ranks).toEqual([]);
    expect(byId.get("705-hisui-normal")?.bestPvpRank).toBeNull();
    expect(byId.get("706-hisui-normal")?.bestPvpRank).toBeNull();
  });

  it("marks shared battle mappings explicitly instead of presenting them as exact-form ranks", () => {
    const byId = new Map(allRows().map((row) => [row.id, row]));
    for (const id of ["666-ocean-normal", "671-blue-flower-normal", "668-female-normal", "676-kabuki-normal"]) {
      const ranks = byId.get(id)?.ranks ?? [];
      expect(ranks.length, id).toBeGreaterThan(0);
      expect(ranks.every((rank) => rank.mappingMode === "SHARED_UNDIFFERENTIATED"), id).toBe(true);
    }
    expect(byId.get("678-female-normal")?.ranks.every((rank) => rank.mappingMode === "EXACT")).toBe(true);
  });

  it("keeps high-value decisions tied to the exact variant that has the evidence", () => {
    const byId = new Map(allRows().map((row) => [row.id, row]));
    expect(byId.get("652-kalos-shadow")?.initialDecision).toBe("KEEP");
    expect(byId.get("652-kalos-mega")?.initialDecision).toBe("KEEP");
    expect(byId.get("655-kalos-mega")?.initialDecision).toBe("KEEP");
    expect(byId.get("658-kalos-mega")?.initialDecision).toBe("KEEP");
    expect(byId.get("700-kalos-dynamax")?.initialDecision).toBe("CONDITIONAL_KEEP");
    expect(byId.get("716-kalos-normal")?.initialDecision).toBe("KEEP");
    expect(byId.get("717-kalos-normal")?.initialDecision).toBe("KEEP");
    expect(byId.get("719-kalos-normal")?.initialDecision).toBe("CONDITIONAL_KEEP");
    expect(byId.get("719-kalos-mega")?.initialDecision).toBe("KEEP");
    expect(byId.get("720-unbound-normal")?.initialDecision).toBe("KEEP");
    expect(byId.get("720-confined-normal")?.pveEvidence).toBeNull();
  });

  it("does not let unreleased or unknown variants become keep decisions", () => {
    for (const row of allRows()) {
      if (row.releaseStatus !== "RELEASED") {
        expect(row.initialDecision, row.id).toBe("TRANSFER_CANDIDATE");
        expect(row.initialDisposition, row.id).toBe("NOT_APPLICABLE_OR_UNRELEASED");
        expect(row.ranks, row.id).toEqual([]);
      }
    }
  });
});
