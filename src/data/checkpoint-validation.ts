import {
  canonicalGen3Species,
  GEN3_CANONICAL_MAX,
  GEN3_CANONICAL_MIN,
} from "./canonical/gen3";

/** Backwards-compatible names for callers that validate the active Gen 3 scope. */
export const GEN3_CHECKPOINT_MIN = GEN3_CANONICAL_MIN;
export const GEN3_CHECKPOINT_MAX = GEN3_CANONICAL_MAX;

export type EvolutionFormForValidation = {
  id: string;
  evolvesFromFormId: string | null | undefined;
};

export type EvolutionPathForValidation = {
  fromFormId: string;
  toFormId: string;
};

export function validateEvolutionParentPaths(
  forms: readonly EvolutionFormForValidation[],
  paths: readonly EvolutionPathForValidation[],
) {
  const edges = new Set(paths.map((path) => `${path.fromFormId}->${path.toFormId}`));
  return forms
    .filter((form) => form.evolvesFromFormId !== null && form.evolvesFromFormId !== undefined)
    .filter((form) => !edges.has(`${form.evolvesFromFormId}->${form.id}`))
    .map(
      (form) =>
        `${form.id} has evolvesFromFormId ${form.evolvesFromFormId}, but no exact EvolutionPath ${form.evolvesFromFormId}->${form.id}.`,
    );
}

type CanonicalSpecies = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: readonly string[];
};

type CanonicalForm = {
  id: string;
  dexNumber: number;
  formNameEn: string;
  formNameZhTw: string;
  types: readonly string[];
};

const canonicalSpecies: readonly CanonicalSpecies[] = canonicalGen3Species;

const canonicalForms: readonly CanonicalForm[] = canonicalGen3Species.map((species) => ({
  id: `${String(species.dexNumber).padStart(3, "0")}-hoenn`,
  dexNumber: species.dexNumber,
  formNameEn: "Hoenn",
  formNameZhTw: "豐緣",
  types: species.types,
}));

type SpeciesForValidation = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
};

type FormForValidation = {
  id: string;
  speciesId?: string | null;
  formNameEn: string;
  formNameZhTw: string;
  types: unknown;
};

export type Gen3ValidationRange = {
  min: number;
  max: number;
};

function parseTypes(value: unknown) {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return [...value];
  }
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? [...parsed]
      : null;
  } catch {
    return null;
  }
}

function sameTypes(actual: unknown, expected: readonly string[]) {
  const parsed = parseTypes(actual);
  return parsed !== null && JSON.stringify(parsed) === JSON.stringify(expected);
}

export function validateGen3DexConsistency(
  speciesRecords: readonly SpeciesForValidation[],
  formRecords: readonly FormForValidation[],
  range: Gen3ValidationRange = {
    min: GEN3_CANONICAL_MIN,
    max: GEN3_CANONICAL_MAX,
  },
) {
  const errors: string[] = [];
  const expectedSpeciesByDex = new Map<number, CanonicalSpecies>();
  const expectedFormByDex = new Map<number, CanonicalForm>();

  for (const species of canonicalSpecies.filter(
    (item) => item.dexNumber >= range.min && item.dexNumber <= range.max,
  )) {
    if (expectedSpeciesByDex.has(species.dexNumber)) {
      errors.push(`Duplicate canonical Gen3 species #${species.dexNumber}.`);
    }
    expectedSpeciesByDex.set(species.dexNumber, species);
  }
  for (const form of canonicalForms.filter(
    (item) => item.dexNumber >= range.min && item.dexNumber <= range.max,
  )) {
    if (expectedFormByDex.has(form.dexNumber)) {
      errors.push(`Duplicate canonical Gen3 form for #${form.dexNumber}.`);
    }
    expectedFormByDex.set(form.dexNumber, form);
  }

  const actualSpeciesByDex = new Map<number, SpeciesForValidation>();
  for (const species of speciesRecords.filter(
    (item) => item.dexNumber >= range.min && item.dexNumber <= range.max,
  )) {
    if (actualSpeciesByDex.has(species.dexNumber)) {
      errors.push(`Duplicate database species for #${species.dexNumber}.`);
    }
    actualSpeciesByDex.set(species.dexNumber, species);
  }

  const actualFormsById = new Map<string, FormForValidation>();
  for (const form of formRecords) actualFormsById.set(form.id, form);

  for (const [dexNumber, expectedSpecies] of expectedSpeciesByDex) {
    const species = actualSpeciesByDex.get(dexNumber);
    if (!species) {
      errors.push(`Missing database species for #${dexNumber}.`);
    } else {
      if (species.nameEn !== expectedSpecies.nameEn) {
        errors.push(
          `#${dexNumber} English name mismatch: expected ${expectedSpecies.nameEn}, got ${species.nameEn}.`,
        );
      }
      if (species.nameZhTw !== expectedSpecies.nameZhTw) {
        errors.push(
          `#${dexNumber} Traditional Chinese name mismatch: expected ${expectedSpecies.nameZhTw}, got ${species.nameZhTw}.`,
        );
      }
    }

    const expectedForm = expectedFormByDex.get(dexNumber);
    if (!expectedForm) {
      errors.push(`Missing canonical Gen3 form for #${dexNumber}.`);
      continue;
    }
    if (JSON.stringify(expectedForm.types) !== JSON.stringify(expectedSpecies.types)) {
      errors.push(`Canonical Gen3 types mismatch for #${dexNumber}.`);
    }
    const form = actualFormsById.get(expectedForm.id);
    if (!form) {
      errors.push(`Missing database form ${expectedForm.id}.`);
      continue;
    }
    if (form.speciesId !== undefined && form.speciesId !== null) {
      const expectedSpeciesId = `species-${String(dexNumber).padStart(3, "0")}`;
      if (form.speciesId !== expectedSpeciesId) {
        errors.push(
          `${expectedForm.id} points to ${form.speciesId}; expected ${expectedSpeciesId}.`,
        );
      }
    }
    if (form.formNameEn !== expectedForm.formNameEn) {
      errors.push(
        `${expectedForm.id} English form name mismatch: expected ${expectedForm.formNameEn}, got ${form.formNameEn}.`,
      );
    }
    if (form.formNameZhTw !== expectedForm.formNameZhTw) {
      errors.push(
        `${expectedForm.id} Traditional Chinese form name mismatch: expected ${expectedForm.formNameZhTw}, got ${form.formNameZhTw}.`,
      );
    }
    if (!sameTypes(form.types, expectedSpecies.types)) {
      errors.push(
        `${expectedForm.id} types mismatch: expected ${JSON.stringify(expectedSpecies.types)}, got ${String(form.types)}.`,
      );
    }
  }

  for (const species of actualSpeciesByDex.values()) {
    if (!expectedSpeciesByDex.has(species.dexNumber)) {
      errors.push(`Unexpected database species in Gen3 checkpoint: #${species.dexNumber}.`);
    }
  }

  return errors;
}
