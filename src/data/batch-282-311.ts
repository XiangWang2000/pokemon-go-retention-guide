import type { Gen3Form, Gen3Species, Gen3SpecialVariant, PveUseLevel } from "./batch-gen3-types";

// Filled by the independent #282-#311 integration commit. Keeping the module
// shape stable lets the shared importer and typecheck run after the first batch.
export const species282311: Gen3Species[] = [];
export const forms282311: Gen3Form[] = [];
export const evolutionPairs282311: readonly [string, string][] = [];
export const releasedShadowForms282311 = new Set<string>();
export const releasedMegaForms282311 = new Set<string>();
export const releasedDynamaxForms282311 = new Set<string>();
export const releasedGigantamaxForms282311 = new Set<string>();
export const specialVariants282311: Gen3SpecialVariant[] = [];
export const pveUseLevels282311: Record<string, PveUseLevel> = {};
export function pvpokeSpeciesId282311(form: Gen3Form, shadow: boolean) {
  const base = form.aliases[0].toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/-/g, "_");
  return shadow ? base + "_shadow" : base;
}
