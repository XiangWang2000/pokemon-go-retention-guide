export type EvaluationFilterState = {
  query: string;
  decision: string;
  variant: string;
  valueFilter: string;
  generation: string;
  region: string;
  freshness: string;
  reviewed: string;
};

export type EvaluationAdvancedControlState = Pick<
  EvaluationFilterState,
  "variant" | "valueFilter" | "generation" | "region" | "freshness" | "reviewed"
> & {
  sort: string;
};

export const clearedEvaluationFilterState: EvaluationFilterState = {
  query: "",
  decision: "ALL",
  variant: "ALL",
  valueFilter: "ALL",
  generation: "ALL",
  region: "ALL",
  freshness: "ALL",
  reviewed: "ALL",
};

export function countActiveEvaluationFilters(
  state: EvaluationFilterState,
  mode: "FAMILY" | "POKEDEX" | "AUDIT",
) {
  const values = [
    state.query,
    state.decision === "ALL" ? "" : state.decision,
    state.variant === "ALL" ? "" : state.variant,
    state.valueFilter === "ALL" ? "" : state.valueFilter,
    state.generation === "ALL" ? "" : state.generation,
    state.region === "ALL" ? "" : state.region,
  ];

  if (mode === "AUDIT") {
    values.push(state.freshness === "ALL" ? "" : state.freshness);
    values.push(state.reviewed === "ALL" ? "" : state.reviewed);
  }

  return values.filter((value) => value.length > 0).length;
}

export function countActiveAdvancedEvaluationControls(
  state: EvaluationAdvancedControlState,
  mode: "FAMILY" | "POKEDEX" | "AUDIT",
) {
  const values = [
    state.variant === "ALL" ? "" : state.variant,
    state.valueFilter === "ALL" ? "" : state.valueFilter,
    state.generation === "ALL" ? "" : state.generation,
    state.region === "ALL" ? "" : state.region,
    state.sort === "DEX_ASC" ? "" : state.sort,
  ];

  if (mode === "AUDIT") {
    values.push(state.freshness === "ALL" ? "" : state.freshness);
    values.push(state.reviewed === "ALL" ? "" : state.reviewed);
  }

  return values.filter((value) => value.length > 0).length;
}
