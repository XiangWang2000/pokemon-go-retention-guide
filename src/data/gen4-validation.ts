import type {
  CanonicalGen4Form,
  CanonicalGen4Species,
} from "./canonical/gen4-387-416";

const pokemonTypes = new Set([
  "NORMAL",
  "FIRE",
  "WATER",
  "ELECTRIC",
  "GRASS",
  "ICE",
  "FIGHTING",
  "POISON",
  "GROUND",
  "FLYING",
  "PSYCHIC",
  "BUG",
  "ROCK",
  "GHOST",
  "DRAGON",
  "DARK",
  "STEEL",
  "FAIRY",
]);

export function validateGen4CanonicalIdentity(
  species: readonly CanonicalGen4Species[],
  forms: readonly CanonicalGen4Form[],
  range: { min: number; max: number },
) {
  const errors: string[] = [];
  const expectedDex = Array.from(
    { length: range.max - range.min + 1 },
    (_, index) => range.min + index,
  );
  const speciesDex = species.map((item) => item.dexNumber);

  if (new Set(speciesDex).size !== speciesDex.length) {
    errors.push("Gen4 canonical species contains duplicate Pokédex numbers.");
  }
  if (JSON.stringify(speciesDex) !== JSON.stringify(expectedDex)) {
    errors.push(
      `Gen4 canonical species must cover every Pokédex number from ${range.min} through ${range.max} in order.`,
    );
  }

  const speciesByDex = new Map(species.map((item) => [item.dexNumber, item] as const));
  const formIds = new Set<string>();
  for (const form of forms) {
    if (!speciesByDex.has(form.dexNumber)) {
      errors.push(`${form.id} points to missing Gen4 species #${form.dexNumber}.`);
    }
    if (formIds.has(form.id)) errors.push(`Duplicate Gen4 canonical form id ${form.id}.`);
    formIds.add(form.id);
    if (form.regionKey !== "SINNOH") {
      errors.push(`${form.id} must use SINNOH as its canonical region.`);
    }
    if (!form.types.length || form.types.some((type) => !pokemonTypes.has(type))) {
      errors.push(`${form.id} has invalid elemental types: ${form.types.join(", ")}.`);
    }
  }

  for (const dexNumber of expectedDex) {
    if (!forms.some((form) => form.dexNumber === dexNumber)) {
      errors.push(`Missing Gen4 canonical form for #${dexNumber}.`);
    }
  }

  return errors;
}
