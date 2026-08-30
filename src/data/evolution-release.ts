export function deriveEvolutionReleaseClosure(
  directReleaseIds: ReadonlySet<string>,
  evolutionPairs: ReadonlyArray<readonly [string, string]>,
  unavailableIds: ReadonlySet<string> = new Set(),
) {
  const released = new Set(directReleaseIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [fromFormId, toFormId] of evolutionPairs) {
      if (released.has(fromFormId) && !unavailableIds.has(toFormId) && !released.has(toFormId)) {
        released.add(toFormId);
        changed = true;
      }
    }
  }
  return released;
}

export type ShadowReleaseEvidence = {
  directRosterFormIds: readonly string[];
  derivedFormIds: readonly string[];
  formalEvolutionEdges: readonly (readonly [string, string])[];
  releasedFormIds: ReadonlySet<string>;
};

/**
 * Keep Shadow roster provenance separate from the release closure.  A form in
 * `derivedFormIds` is obtainable only because a direct roster form can reach
 * it through a formal evolution edge; it was not necessarily listed by the
 * roster source itself.
 */
export function deriveShadowReleaseEvidence(
  directReleaseIds: ReadonlySet<string>,
  evolutionPairs: readonly (readonly [string, string])[],
  unavailableIds: ReadonlySet<string> = new Set(),
): ShadowReleaseEvidence {
  const releasedFormIds = deriveEvolutionReleaseClosure(
    directReleaseIds,
    evolutionPairs,
    unavailableIds,
  );
  const directRosterFormIds = [...directReleaseIds];
  const derivedFormIds = [...releasedFormIds].filter((formId) => !directReleaseIds.has(formId));
  const formalEvolutionEdges = evolutionPairs.filter(
    ([fromFormId, toFormId]) => releasedFormIds.has(fromFormId) && releasedFormIds.has(toFormId),
  );
  return {
    directRosterFormIds,
    derivedFormIds,
    formalEvolutionEdges,
    releasedFormIds,
  };
}
