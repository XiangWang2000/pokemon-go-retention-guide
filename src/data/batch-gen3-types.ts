export type RegionKey = "KANTO" | "JOHTO" | "HOENN" | "ALOLA" | "GALAR" | "HISUI" | "PALDEA" | "OTHER";
export type PveUseLevel = "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE";
export interface Gen3Species { dexNumber: number; nameEn: string; nameZhTw: string; types: string[]; familyKey: string; }
export interface Gen3Form {
  id: string; dexNumber: number; formKey: string; formNameEn: string; formNameZhTw: string; regionKey: RegionKey;
  types: string[]; aliases: string[]; evolvesFromFormId?: string | null; evolutionFamilyNotesZhTw: string;
  isStub?: boolean; includeVariants?: boolean;
}
export interface Gen3SpecialVariant { id: string; formId: string; variantKey: "MEGA"; released: boolean; nameZhTw: string; }
