import { evolutionPairs387416, forms387416 } from "./batch-387-416";

export const releasedNormalForms387416 = new Set(forms387416.map((form) => form.id));

/** Shadow forms with direct encounter evidence in the current Shadow roster. */
export const directShadowEncounterForms387416 = new Set<string>([
  "387-sinnoh",
  "390-sinnoh",
  "393-sinnoh",
  "396-sinnoh",
  "399-sinnoh",
  "403-sinnoh",
  "408-sinnoh",
  "410-sinnoh",
]);

function deriveReleasedEvolutionForms(startForms: ReadonlySet<string>) {
  const released = new Set(startForms);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [fromFormId, toFormId] of evolutionPairs387416) {
      if (!released.has(fromFormId) || released.has(toFormId)) continue;
      // Cross-generation endpoints belong to a different published/import batch.
      if (!forms387416.some((form) => form.id === toFormId)) continue;
      released.add(toFormId);
      changed = true;
    }
  }
  return released;
}

/** Released Shadow forms, including descendants obtainable by evolving a directly released Shadow. */
export const releasedShadowForms387416 = deriveReleasedEvolutionForms(
  directShadowEncounterForms387416,
);

/** The current Max roster first exposes this family through Dynamax Combee. */
export const directDynamaxEncounterForms387416 = new Set<string>(["415-sinnoh"]);
export const releasedDynamaxForms387416 = deriveReleasedEvolutionForms(
  directDynamaxEncounterForms387416,
);

/** No Gigantamax form in #387-#416 is currently released in Pokémon GO. */
export const releasedGigantamaxForms387416 = new Set<string>();

/** No Mega/Primal form in #387-#416 is currently released in Pokémon GO. */
export const releasedMegaForms387416 = new Set<string>();
