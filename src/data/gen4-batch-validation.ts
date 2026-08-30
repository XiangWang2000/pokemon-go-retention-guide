import { canonicalGen4Forms387416, canonicalGen4Species387416 } from "./canonical/gen4-387-416";
import { getPublishedDefaultFormIds } from "../config/batch-registry";
import type { Gen4BatchForm, Gen4BatchSpecies, Gen4EvolutionPair } from "./batch-gen4-types";
import { getCrossGenerationEvolutionFormIds } from "./cross-generation-evolution";

function sameStrings(left: readonly string[], right: readonly string[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateGen4BatchSource(
  species: readonly Gen4BatchSpecies[],
  forms: readonly Gen4BatchForm[],
  evolutionPairs: readonly Gen4EvolutionPair[],
  canonical: {
    species: readonly { dexNumber: number; nameEn: string; nameZhTw: string }[];
    forms: readonly {
      id: string;
      dexNumber: number;
      formKey: string;
      formNameEn: string;
      formNameZhTw: string;
      regionKey: string;
      types: readonly string[];
    }[];
  } = {
    species: canonicalGen4Species387416,
    forms: canonicalGen4Forms387416,
  },
) {
  const errors: string[] = [];
  const speciesByDex = new Map(species.map((item) => [item.dexNumber, item] as const));
  const formsById = new Map(forms.map((item) => [item.id, item] as const));
  const edges = new Set(evolutionPairs.map(([from, to]) => `${from}->${to}`));

  if (speciesByDex.size !== species.length)
    errors.push("Gen4 batch has duplicate species dex numbers.");
  if (formsById.size !== forms.length) errors.push("Gen4 batch has duplicate form ids.");

  for (const canonicalSpecies of canonical.species) {
    const actual = speciesByDex.get(canonicalSpecies.dexNumber);
    if (!actual) {
      errors.push(`Missing Gen4 batch species #${canonicalSpecies.dexNumber}.`);
      continue;
    }
    if (actual.nameEn !== canonicalSpecies.nameEn) {
      errors.push(`#${canonicalSpecies.dexNumber} English name mismatch: ${actual.nameEn}.`);
    }
    if (actual.nameZhTw !== canonicalSpecies.nameZhTw) {
      errors.push(
        `#${canonicalSpecies.dexNumber} Traditional Chinese name mismatch: ${actual.nameZhTw}.`,
      );
    }
    if (!actual.familyKey) errors.push(`#${canonicalSpecies.dexNumber} has no familyKey.`);
  }

  for (const canonicalForm of canonical.forms) {
    const actual = formsById.get(canonicalForm.id);
    if (!actual) {
      errors.push(`Missing Gen4 batch form ${canonicalForm.id}.`);
      continue;
    }
    if (actual.dexNumber !== canonicalForm.dexNumber)
      errors.push(`${canonicalForm.id} dex number mismatch.`);
    if (actual.formKey !== canonicalForm.formKey)
      errors.push(`${canonicalForm.id} form key mismatch.`);
    if (actual.formNameEn !== canonicalForm.formNameEn)
      errors.push(`${canonicalForm.id} English form name mismatch.`);
    if (actual.formNameZhTw !== canonicalForm.formNameZhTw) {
      errors.push(`${canonicalForm.id} Traditional Chinese form name mismatch.`);
    }
    if (actual.regionKey !== canonicalForm.regionKey)
      errors.push(`${canonicalForm.id} region mismatch.`);
    if (!sameStrings(actual.types, canonicalForm.types))
      errors.push(`${canonicalForm.id} type mismatch.`);
  }

  if (forms.length !== canonical.forms.length) {
    errors.push(
      `Gen4 batch form count ${forms.length} does not match canonical ${canonical.forms.length}.`,
    );
  }

  const validEndpoints = new Set([
    ...formsById.keys(),
    ...getPublishedDefaultFormIds(),
    ...getCrossGenerationEvolutionFormIds(),
  ]);
  for (const [from, to] of evolutionPairs) {
    if (from.endsWith("-other")) {
      errors.push(`Evolution path uses a legacy OTHER identity as its source: ${from}.`);
    }
    if (to.endsWith("-other")) {
      errors.push(`Evolution path uses a legacy OTHER identity as its target: ${to}.`);
    }
    if (!validEndpoints.has(from)) errors.push(`Evolution path has unknown source ${from}.`);
    if (!validEndpoints.has(to)) errors.push(`Evolution path has unknown target ${to}.`);
    if (from === to) errors.push(`Evolution path cannot self-loop: ${from}.`);
  }

  for (const form of forms) {
    if (form.evolvesFromFormId && !edges.has(`${form.evolvesFromFormId}->${form.id}`)) {
      errors.push(
        `${form.id} declares parent ${form.evolvesFromFormId} without an exact evolution pair.`,
      );
    }
  }

  return errors;
}
