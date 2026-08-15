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
};

export type Gen4EvolutionPair = readonly [fromFormId: string, toFormId: string];
