import type { RegionKey } from "../region-key";

export type CandidateGeneration = 5 | 6 | 7 | 8 | 9;

export type CandidateSpecies = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: readonly string[];
  familyKey: string;
};

export type CandidateForm = {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  types: readonly string[];
  aliases: readonly string[];
  evolvesFromFormId: string | null;
};

export type CandidateEvolutionPair = readonly [fromFormId: string, toFormId: string];

export type CandidateBatchDefinition = {
  key: string;
  generation: CandidateGeneration;
  species: readonly CandidateSpecies[];
  forms: readonly CandidateForm[];
  evolutionPairs: readonly CandidateEvolutionPair[];
  identitySourceIds: readonly string[];
};
