import { forms252281, species252281 } from "./batch-252-281";
import { forms282311, species282311 } from "./batch-282-311";

export const GEN3_CHECKPOINT_MIN = 252;
export const GEN3_CHECKPOINT_MAX = 311;

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

const canonicalSpecies: CanonicalSpecies[] = [...species252281, ...species282311].map((species) => ({
  dexNumber: species.dexNumber,
  nameEn: species.nameEn,
  nameZhTw: species.nameZhTw,
  types: species.types,
}));

const canonicalForms: CanonicalForm[] = [...forms252281, ...forms282311].map((form) => ({
  id: form.id,
  dexNumber: form.dexNumber,
  formNameEn: form.formNameEn,
  formNameZhTw: form.formNameZhTw,
  types: form.types,
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
) {
  const errors: string[] = [];
  const expectedSpeciesByDex = new Map<number, CanonicalSpecies>();
  const expectedFormByDex = new Map<number, CanonicalForm>();

  for (const species of canonicalSpecies) {
    if (expectedSpeciesByDex.has(species.dexNumber)) {
      errors.push(`Duplicate canonical Gen3 species #${species.dexNumber}.`);
    }
    expectedSpeciesByDex.set(species.dexNumber, species);
  }
  for (const form of canonicalForms) {
    if (expectedFormByDex.has(form.dexNumber)) {
      errors.push(`Duplicate canonical Gen3 form for #${form.dexNumber}.`);
    }
    expectedFormByDex.set(form.dexNumber, form);
  }

  const actualSpeciesByDex = new Map<number, SpeciesForValidation>();
  for (const species of speciesRecords.filter(
    (item) => item.dexNumber >= GEN3_CHECKPOINT_MIN && item.dexNumber <= GEN3_CHECKPOINT_MAX,
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
