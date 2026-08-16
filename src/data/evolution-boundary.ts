export type EvolutionBoundaryPath = {
  toFormId: string;
  isEvolutionStub?: boolean;
};

export type EvolutionBoundaryRow = {
  formId: string;
  evolutionPaths: readonly EvolutionBoundaryPath[];
};

/**
 * A cross-batch path is a stub only while its target form is outside the
 * published dataset.  Once the owning batch is imported, the same path must
 * point at the real form instead.
 */
export function hasEvolutionPathWithPublishedOwnership(
  rows: readonly EvolutionBoundaryRow[],
  targetFormId: string,
  publishedFormIds: ReadonlySet<string>,
) {
  const expectedStub = !publishedFormIds.has(targetFormId);
  return rows.some((row) =>
    row.evolutionPaths.some(
      (path) => path.toFormId === targetFormId && path.isEvolutionStub === expectedStub,
    ),
  );
}
