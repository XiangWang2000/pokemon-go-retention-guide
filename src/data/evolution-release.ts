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
