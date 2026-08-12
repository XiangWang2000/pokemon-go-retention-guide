import {
  canonicalGen4Forms387416,
  canonicalGen4Species387416,
} from "./canonical/gen4-387-416";
import type { Gen4BatchForm, Gen4BatchSpecies, Gen4EvolutionPair } from "./batch-gen4-types";

function sameStrings(left: readonly string[], right: readonly string[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateGen4BatchSource(
  species: readonly Gen4BatchSpecies[],
  forms: readonly Gen4BatchForm[],
  evolutionPairs: readonly Gen4EvolutionPair[],
) {
  const errors: string[] = [];
  const speciesByDex = new Map(species.map((item) => [item.dexNumber, item] as const));
  const formsById = new Map(forms.map((item) => [item.id, item] as const));
  const edges = new Set(evolutionPairs.map(([from, to]) => `${from}->${to}`));

  if (speciesByDex.size !== species.length) errors.push("Gen4 batch has duplicate species dex numbers.");
  if (formsById.size !== forms.length) errors.push("Gen4 batch has duplicate form ids.");

  for (const canonical of canonicalGen4Species387416) {
    const actual = speciesByDex.get(canonical.dexNumber);
    if (!actual) {
      errors.push(`Missing Gen4 batch species #${canonical.dexNumber}.`);
      continue;
    }
    if (actual.nameEn !== canonical.nameEn) {
      errors.push(`#${canonical.dexNumber} English name mismatch: ${actual.nameEn}.`);
    }
    if (actual.nameZhTw !== canonical.nameZhTw) {
      errors.push(`#${canonical.dexNumber} Traditional Chinese name mismatch: ${actual.nameZhTw}.`);
    }
    if (!actual.familyKey) errors.push(`#${canonical.dexNumber} has no familyKey.`);
  }

  for (const canonical of canonicalGen4Forms387416) {
    const actual = formsById.get(canonical.id);
    if (!actual) {
      errors.push(`Missing Gen4 batch form ${canonical.id}.`);
      continue;
    }
    if (actual.dexNumber !== canonical.dexNumber) errors.push(`${canonical.id} dex number mismatch.`);
    if (actual.formKey !== canonical.formKey) errors.push(`${canonical.id} form key mismatch.`);
    if (actual.formNameEn !== canonical.formNameEn) errors.push(`${canonical.id} English form name mismatch.`);
    if (actual.formNameZhTw !== canonical.formNameZhTw) {
      errors.push(`${canonical.id} Traditional Chinese form name mismatch.`);
    }
    if (actual.regionKey !== canonical.regionKey) errors.push(`${canonical.id} region mismatch.`);
    if (!sameStrings(actual.types, canonical.types)) errors.push(`${canonical.id} type mismatch.`);
  }

  if (forms.length !== canonicalGen4Forms387416.length) {
    errors.push(
      `Gen4 batch form count ${forms.length} does not match canonical ${canonicalGen4Forms387416.length}.`,
    );
  }

  const validEndpoints = new Set([...formsById.keys(), "315-hoenn"]);
  for (const [from, to] of evolutionPairs) {
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
