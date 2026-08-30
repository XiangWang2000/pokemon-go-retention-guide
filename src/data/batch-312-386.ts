import type { Gen3Form, Gen3Species, Gen3SpecialVariant, PveUseLevel } from "./batch-gen3-types";
import {
  forms312341,
  species312341,
  evolutionPairs312341,
  releasedShadowForms312341,
  releasedMegaForms312341,
  specialVariants312341,
  pveClassifications312341,
} from "./batch-312-341";
import {
  forms342371,
  species342371,
  evolutionPairs342371,
  releasedShadowForms342371,
  releasedMegaForms342371,
  specialVariants342371,
  pveClassifications342371,
} from "./batch-342-371";
import {
  forms372386,
  species372386,
  evolutionPairs372386,
  releasedShadowForms372386,
  releasedMegaForms372386,
  specialVariants372386,
  pveClassifications372386,
} from "./batch-372-386";

export const species312386: Gen3Species[] = [...species312341, ...species342371, ...species372386];
export const forms312386: Gen3Form[] = [...forms312341, ...forms342371, ...forms372386];
export const evolutionPairs312386: readonly [string, string][] = [
  ...evolutionPairs312341,
  ...evolutionPairs342371,
  ...evolutionPairs372386,
];
export const releasedShadowForms312386 = new Set([
  ...releasedShadowForms312341,
  ...releasedShadowForms342371,
  ...releasedShadowForms372386,
]);
export const releasedMegaForms312386 = new Set([
  ...releasedMegaForms312341,
  ...releasedMegaForms342371,
  ...releasedMegaForms372386,
]);
export const specialVariants312386: Gen3SpecialVariant[] = [
  ...specialVariants312341,
  ...specialVariants342371,
  ...specialVariants372386,
];
export const pveClassifications312386: Record<string, PveUseLevel> = {
  ...pveClassifications312341,
  ...pveClassifications342371,
  ...pveClassifications372386,
};
