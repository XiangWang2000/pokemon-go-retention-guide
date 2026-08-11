import { describe, expect, it } from "vitest";
import {
  clearedEvaluationFilterState,
  countActiveAdvancedEvaluationControls,
  countActiveEvaluationFilters,
} from "@/lib/evaluation-filter-state";

describe("evaluation filter state", () => {
  it("does not count the default state", () => {
    expect(countActiveEvaluationFilters(clearedEvaluationFilterState, "FAMILY")).toBe(0);
  });

  it("counts visible search and filter conditions", () => {
    expect(
      countActiveEvaluationFilters(
        {
          ...clearedEvaluationFilterState,
          query: "皮卡丘",
          generation: "GEN_1",
          valueFilter: "PVE",
        },
        "POKEDEX",
      ),
    ).toBe(3);
  });

  it("only counts audit-only filters while audit mode is visible", () => {
    const state = {
      ...clearedEvaluationFilterState,
      freshness: "STALE",
      reviewed: "NO",
    };

    expect(countActiveEvaluationFilters(state, "FAMILY")).toBe(0);
    expect(countActiveEvaluationFilters(state, "AUDIT")).toBe(2);
  });

  it("counts non-default controls hidden behind the mobile advanced disclosure", () => {
    const state = {
      ...clearedEvaluationFilterState,
      sort: "UPDATED",
      generation: "GEN_3",
      variant: "SHADOW",
    };

    expect(countActiveAdvancedEvaluationControls(state, "FAMILY")).toBe(3);
  });

  it("includes audit-only advanced controls only in audit mode", () => {
    const state = {
      ...clearedEvaluationFilterState,
      sort: "DEX_ASC",
      freshness: "STALE",
      reviewed: "NO",
    };

    expect(countActiveAdvancedEvaluationControls(state, "POKEDEX")).toBe(0);
    expect(countActiveAdvancedEvaluationControls(state, "AUDIT")).toBe(2);
  });
});
