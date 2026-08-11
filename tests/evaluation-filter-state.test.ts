import { describe, expect, it } from "vitest";
import {
  clearedEvaluationFilterState,
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
});
