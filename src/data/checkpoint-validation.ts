import {
  canonicalGen3Forms,
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
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: string;
  types: readonly string[];
  variantKeys: readonly string[];
};

const canonicalSpecies: readonly CanonicalSpecies[] = canonicalGen3Species;
const canonicalForms: readonly CanonicalForm[] = canonicalGen3Forms;

type SpeciesForValidation = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types?: unknown;
};

export type FormForValidation = {
  id: string;
  dexNumber?: number;
  speciesId?: string | null;
  formKey?: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey?: string;
  types: unknown;
  evolvesFromFormId?: string | null;
};

export type VariantForValidation = {
  id: string;
  pokemonFormId: string;
  variantKey: string;
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

function inRange(dexNumber: number, range: Gen3ValidationRange) {
  return dexNumber >= range.min && dexNumber <= range.max;
}

/**
 * Validate species identity and the canonical base form for each species.
 * Detailed alternate-form and variant-boundary validation lives in
 * validateGen3FormCompleteness so callers can use it independently for a
 * batch source and for database rows.
 */
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

  for (const species of canonicalSpecies.filter((item) => inRange(item.dexNumber, range))) {
    if (expectedSpeciesByDex.has(species.dexNumber)) {
      errors.push(`Duplicate canonical Gen3 species #${species.dexNumber}.`);
    }
    expectedSpeciesByDex.set(species.dexNumber, species);
  }
  for (const form of canonicalForms.filter((item) => inRange(item.dexNumber, range))) {
    if (form.formKey === "HOENN" || !expectedFormByDex.has(form.dexNumber)) {
      expectedFormByDex.set(form.dexNumber, form);
    }
  }

  const actualSpeciesByDex = new Map<number, SpeciesForValidation>();
  for (const species of speciesRecords.filter((item) => inRange(item.dexNumber, range))) {
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
      if (species.types !== undefined && !sameTypes(species.types, expectedSpecies.types)) {
        errors.push(
          `#${dexNumber} species types mismatch: expected ${JSON.stringify(expectedSpecies.types)}, got ${String(species.types)}.`,
        );
      }
    }

    const expectedForm = expectedFormByDex.get(dexNumber);
    if (!expectedForm) {
      errors.push(`Missing canonical Gen3 form for #${dexNumber}.`);
      continue;
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
    if (!sameTypes(form.types, expectedForm.types)) {
      errors.push(
        `${expectedForm.id} types mismatch: expected ${JSON.stringify(expectedForm.types)}, got ${String(form.types)}.`,
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

/**
 * Validate every canonical form, including alternate forms and the exact set
 * of BattleVariant keys. This is intentionally usable with either batch
 * source records or separately queried database records.
 */
export function validateGen3FormCompleteness(
  formRecords: readonly FormForValidation[],
  variantRecords: readonly VariantForValidation[] = [],
  range: Gen3ValidationRange = {
    min: GEN3_CANONICAL_MIN,
    max: GEN3_CANONICAL_MAX,
  },
) {
  const errors: string[] = [];
  const expected = canonicalForms.filter((form) => inRange(form.dexNumber, range));
  const expectedById = new Map(expected.map((form) => [form.id, form]));
  const actual = formRecords.filter(
    (form) => form.dexNumber === undefined || inRange(form.dexNumber, range),
  );
  const actualById = new Map<string, FormForValidation>();

  for (const form of actual) {
    if (actualById.has(form.id)) errors.push(`Duplicate database form ${form.id}.`);
    actualById.set(form.id, form);
  }
  for (const form of expected) {
    const actualForm = actualById.get(form.id);
    if (!actualForm) {
      errors.push(`Missing canonical Gen3 form ${form.id}.`);
      continue;
    }
    if (actualForm.dexNumber !== undefined && actualForm.dexNumber !== form.dexNumber) {
      errors.push(`${form.id} dexNumber mismatch: expected ${form.dexNumber}, got ${actualForm.dexNumber}.`);
    }
    if (actualForm.formKey !== undefined && actualForm.formKey !== form.formKey) {
      errors.push(`${form.id} formKey mismatch: expected ${form.formKey}, got ${actualForm.formKey}.`);
    }
    if (actualForm.regionKey !== undefined && actualForm.regionKey !== form.regionKey) {
      errors.push(`${form.id} region mismatch: expected ${form.regionKey}, got ${actualForm.regionKey}.`);
    }
    if (actualForm.formNameEn !== form.formNameEn) {
      errors.push(`${form.id} English form name mismatch: expected ${form.formNameEn}, got ${actualForm.formNameEn}.`);
    }
    if (actualForm.formNameZhTw !== form.formNameZhTw) {
      errors.push(`${form.id} Traditional Chinese form name mismatch: expected ${form.formNameZhTw}, got ${actualForm.formNameZhTw}.`);
    }
    if (!sameTypes(actualForm.types, form.types)) {
      errors.push(`${form.id} types mismatch: expected ${JSON.stringify(form.types)}, got ${String(actualForm.types)}.`);
    }
  }
  for (const form of actual) {
    if (!expectedById.has(form.id)) errors.push(`Unexpected Gen3 form in checkpoint: ${form.id}.`);
  }

  if (variantRecords.length) {
    const variantsByForm = new Map<string, VariantForValidation[]>();
    const scopeFormIds = new Set([...expectedById.keys(), ...actualById.keys()]);
    for (const variant of variantRecords) {
      if (!scopeFormIds.has(variant.pokemonFormId)) continue;
      const list = variantsByForm.get(variant.pokemonFormId) ?? [];
      list.push(variant);
      variantsByForm.set(variant.pokemonFormId, list);
    }
    for (const form of expected) {
      const actualKeys = variantsByForm.get(form.id) ?? [];
      const seen = new Set<string>();
      for (const variant of actualKeys) {
        if (seen.has(variant.variantKey)) {
          errors.push(`Duplicate ${form.id} variant key ${variant.variantKey}.`);
        }
        seen.add(variant.variantKey);
        const expectedId = `${form.id}-${variant.variantKey.toLowerCase()}`;
        if (variant.id !== expectedId) {
          errors.push(`${form.id} variant ${variant.variantKey} has unexpected id ${variant.id}; expected ${expectedId}.`);
        }
      }
      const expectedKeys = [...form.variantKeys].sort();
      const actualSorted = [...seen].sort();
      if (JSON.stringify(actualSorted) !== JSON.stringify(expectedKeys)) {
        errors.push(
          `${form.id} variant boundary mismatch: expected ${expectedKeys.join(",")}, got ${actualSorted.join(",")}.`,
        );
      }
    }
    for (const formId of variantsByForm.keys()) {
      if (!expectedById.has(formId)) errors.push(`Unexpected variant owner in Gen3 checkpoint: ${formId}.`);
    }
  }

  return errors;
}
