import type { RegionKey } from "./region-key";

export type Gen4BatchSpecies = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  familyKey: string;
};

export type Gen4BatchForm = {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  types: string[];
  aliases: string[];
  evolvesFromFormId: string | null;
  evolutionFamilyNotesZhTw: string;
  isStub?: boolean;
  includeVariants?: boolean;
};

export type Gen4EvolutionPair = readonly [fromFormId: string, toFormId: string];

export type Gen4PveUseLevel =
  "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE";

export type Gen4PveEvidence = {
  level: Exclude<Gen4PveUseLevel, "NO_SIGNIFICANT_USE">;
  roles: readonly string[];
  sourceUrl: string;
  checkedAt: string;
  summaryZhTw: string;
};

export type Gen4MaxEvidence = Gen4PveEvidence;

export type Gen4VariantKey = "NORMAL" | "SHADOW" | "PURIFIED" | "MEGA" | "DYNAMAX" | "GIGANTAMAX";

export type Gen4SpecialVariant = {
  id: string;
  formId: string;
  variantKey: Exclude<Gen4VariantKey, "NORMAL" | "SHADOW" | "PURIFIED">;
  released: boolean;
  nameZhTw: string;
};

/**
 * Gen4 batches share the persistence/import contract, but their evidence
 * presentation can differ when a historical batch already has a reviewed
 * adapter. This is deliberately a small adapter selector, not a second
 * routing chain or a Pokémon-specific workaround.
 */
export type Gen4EvidenceAdapter = "legacy-387-416" | "generic";

export type Gen4BatchDefinition = {
  batch: string;
  species: readonly Gen4BatchSpecies[];
  forms: readonly Gen4BatchForm[];
  evolutionPairs: readonly Gen4EvolutionPair[];
  releasedNormalForms: ReadonlySet<string>;
  directShadowEncounterForms: ReadonlySet<string>;
  releasedShadowForms: ReadonlySet<string>;
  releasedMegaForms: ReadonlySet<string>;
  releasedDynamaxForms: ReadonlySet<string>;
  releasedGigantamaxForms: ReadonlySet<string>;
  specialVariants: readonly Gen4SpecialVariant[];
  pvpokeSpeciesId: (form: Gen4BatchForm, shadow: boolean) => string;
  pveEvidenceForVariant: (variantId: string) => Gen4PveEvidence | null;
  maxEvidenceForVariant: (variantId: string) => Gen4MaxEvidence | null;
  evidenceAdapter: Gen4EvidenceAdapter;
};
