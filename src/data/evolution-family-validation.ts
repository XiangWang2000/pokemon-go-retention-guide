export type EvolutionFamilyExpectation = {
  fromFormId: string;
  toFormId: string;
  familyKey: string;
};

export type EvolutionFamilyPair = readonly [fromFormId: string, toFormId: string];

type EvolutionFamilyValidationInput = {
  evolutionPairs: readonly EvolutionFamilyPair[];
  canonicalExpectations: readonly EvolutionFamilyExpectation[];
  familyByFormId: ReadonlyMap<string, string>;
  expectedEvolutionPairs?: readonly EvolutionFamilyPair[];
};

/**
 * Validate the graph against an independent family fixture and the
 * materialized family identity map. The caller may provide pairs from more
 * than one importer; repeated declarations of the same endpoint pair are
 * harmless because the database upsert contract canonicalizes the pair.
 */
export function validateEvolutionFamilyConsistency({
  evolutionPairs,
  canonicalExpectations,
  familyByFormId,
  expectedEvolutionPairs,
}: EvolutionFamilyValidationInput) {
  const errors: string[] = [];
  const addError = (message: string) => {
    if (!errors.includes(message)) errors.push(message);
  };
  const actualEdges = new Set(
    evolutionPairs.map(([fromFormId, toFormId]) => `${fromFormId}->${toFormId}`),
  );

  if (expectedEvolutionPairs) {
    const expectedEdges = new Set(
      expectedEvolutionPairs.map(([fromFormId, toFormId]) => `${fromFormId}->${toFormId}`),
    );
    for (const edge of actualEdges) {
      if (!expectedEdges.has(edge)) addError(`Unexpected evolution edge ${edge}.`);
    }
    for (const edge of expectedEdges) {
      if (!actualEdges.has(edge)) addError(`Missing expected evolution edge ${edge}.`);
    }
  }

  for (const expectation of canonicalExpectations) {
    const edge = `${expectation.fromFormId}->${expectation.toFormId}`;
    if (!actualEdges.has(edge)) {
      addError(`Missing canonical evolution edge ${edge}.`);
    }
    const fromFamily = familyByFormId.get(expectation.fromFormId);
    const toFamily = familyByFormId.get(expectation.toFormId);
    if (!fromFamily)
      addError(`Missing family identity for evolution source ${expectation.fromFormId}.`);
    if (!toFamily)
      addError(`Missing family identity for evolution target ${expectation.toFormId}.`);
    if (fromFamily && fromFamily !== expectation.familyKey) {
      addError(
        `Canonical evolution source ${expectation.fromFormId} uses ${fromFamily}; expected ${expectation.familyKey}.`,
      );
    }
    if (toFamily && toFamily !== expectation.familyKey) {
      addError(
        `Canonical evolution target ${expectation.toFormId} uses ${toFamily}; expected ${expectation.familyKey}.`,
      );
    }
  }

  for (const edge of actualEdges) {
    const separator = edge.indexOf("->");
    const fromFormId = edge.slice(0, separator);
    const toFormId = edge.slice(separator + 2);
    const fromFamily = familyByFormId.get(fromFormId);
    const toFamily = familyByFormId.get(toFormId);
    if (!fromFamily) addError(`Missing family identity for evolution source ${fromFormId}.`);
    if (!toFamily) addError(`Missing family identity for evolution target ${toFormId}.`);
    if (!fromFamily || !toFamily) continue;
    if (fromFamily !== toFamily) {
      addError(
        `Evolution edge ${fromFormId}->${toFormId} splits family keys: ${fromFamily} -> ${toFamily}.`,
      );
    }
  }

  return errors;
}

export function validateEvolutionTargetFamilyKeys(
  targets: readonly { formId: string; familyKey: string }[],
  familyByFormId: ReadonlyMap<string, string>,
) {
  const errors: string[] = [];
  for (const target of targets) {
    const persistedFamily = familyByFormId.get(target.formId);
    if (!persistedFamily) {
      errors.push(`Missing persisted family identity for manifest target ${target.formId}.`);
    } else if (persistedFamily !== target.familyKey) {
      errors.push(
        `Manifest target ${target.formId} uses ${target.familyKey}; persisted family is ${persistedFamily}.`,
      );
    }
  }
  return errors;
}
