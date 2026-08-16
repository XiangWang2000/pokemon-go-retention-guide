import {
  evolutionPairs387416,
  forms387416,
  species387416,
} from "./batch-387-416";
import { pveEvidenceForVariant387416 } from "./batch-387-416-pve";
import { pvpokeSpeciesId387416 } from "./batch-387-416-pvpoke";
import {
  releasedDynamaxForms387416,
  releasedGigantamaxForms387416,
  releasedMegaForms387416,
  releasedNormalForms387416,
  releasedShadowForms387416,
} from "./batch-387-416-gameplay";
import {
  evolutionPairs417446,
  forms417446,
  pveEvidenceForVariant417493,
  pvpokeSpeciesId417493,
  releasedDynamaxForms417446,
  releasedGigantamaxForms417446,
  releasedMegaForms417446,
  releasedNormalForms417446,
  releasedShadowForms417446,
  species417446,
  specialVariants417446,
} from "./batch-417-493";
import {
  evolutionPairs447476,
  forms447476,
  releasedDynamaxForms447476,
  releasedGigantamaxForms447476,
  releasedMegaForms447476,
  releasedNormalForms447476,
  releasedShadowForms447476,
  species447476,
  specialVariants447476,
} from "./batch-417-493";
import {
  evolutionPairs477493,
  forms477493,
  releasedDynamaxForms477493,
  releasedGigantamaxForms477493,
  releasedMegaForms477493,
  releasedNormalForms477493,
  releasedShadowForms477493,
  species477493,
  specialVariants477493,
} from "./batch-417-493";
import type { Gen4BatchDefinition } from "./batch-gen4-types";

const definition = (
  batch: string,
  start: number,
  end: number,
  input: Omit<Gen4BatchDefinition, "batch" | "start" | "end">,
): Gen4BatchDefinition => ({ batch, start, end, ...input });

const definitions: Record<string, Gen4BatchDefinition> = {
  "387-416": definition("387-416", 387, 416, {
    species: species387416,
    forms: forms387416,
    evolutionPairs: evolutionPairs387416,
    releasedNormalForms: releasedNormalForms387416,
    releasedShadowForms: releasedShadowForms387416,
    releasedMegaForms: releasedMegaForms387416,
    releasedDynamaxForms: releasedDynamaxForms387416,
    releasedGigantamaxForms: releasedGigantamaxForms387416,
    specialVariants: [],
    pvpokeSpeciesId: pvpokeSpeciesId387416,
    pveEvidenceForVariant: pveEvidenceForVariant387416,
    evidenceAdapter: "legacy-387-416",
  }),
  "417-446": definition("417-446", 417, 446, {
    species: species417446,
    forms: forms417446,
    evolutionPairs: evolutionPairs417446,
    releasedNormalForms: releasedNormalForms417446,
    releasedShadowForms: releasedShadowForms417446,
    releasedMegaForms: releasedMegaForms417446,
    releasedDynamaxForms: releasedDynamaxForms417446,
    releasedGigantamaxForms: releasedGigantamaxForms417446,
    specialVariants: specialVariants417446,
    pvpokeSpeciesId: pvpokeSpeciesId417493,
    pveEvidenceForVariant: pveEvidenceForVariant417493,
    evidenceAdapter: "generic",
  }),
  "447-476": definition("447-476", 447, 476, {
    species: species447476,
    forms: forms447476,
    evolutionPairs: evolutionPairs447476,
    releasedNormalForms: releasedNormalForms447476,
    releasedShadowForms: releasedShadowForms447476,
    releasedMegaForms: releasedMegaForms447476,
    releasedDynamaxForms: releasedDynamaxForms447476,
    releasedGigantamaxForms: releasedGigantamaxForms447476,
    specialVariants: specialVariants447476,
    pvpokeSpeciesId: pvpokeSpeciesId417493,
    pveEvidenceForVariant: pveEvidenceForVariant417493,
    evidenceAdapter: "generic",
  }),
  "477-493": definition("477-493", 477, 493, {
    species: species477493,
    forms: forms477493,
    evolutionPairs: evolutionPairs477493,
    releasedNormalForms: releasedNormalForms477493,
    releasedShadowForms: releasedShadowForms477493,
    releasedMegaForms: releasedMegaForms477493,
    releasedDynamaxForms: releasedDynamaxForms477493,
    releasedGigantamaxForms: releasedGigantamaxForms477493,
    specialVariants: specialVariants477493,
    pvpokeSpeciesId: pvpokeSpeciesId417493,
    pveEvidenceForVariant: pveEvidenceForVariant417493,
    evidenceAdapter: "generic",
  }),
};

export const GEN4_BATCH_DEFINITIONS = definitions;

export function getGen4BatchDefinition(batch: string) {
  const result = definitions[batch];
  if (!result) throw new Error(`Unknown Gen4 batch: ${batch}`);
  return result;
}

export function getGen4BatchDefinitions() {
  return Object.values(definitions);
}

export type { Gen4PveEvidence } from "./batch-gen4-types";
