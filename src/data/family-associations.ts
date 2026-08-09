export interface SpecialFamilyAssociation {
  familyKey: string;
  formIds: readonly string[];
  relationKey: "SPECIAL_ACQUISITION_FAMILY";
  note: string;
}

/**
 * Family relationships that are real collection/evolution-family associations
 * but must not be represented as a normal evolution edge in EvolutionPath.
 */
export const specialFamilyAssociations: readonly SpecialFamilyAssociation[] = [
  {
    familyKey: "HOENN_FAMILY_290",
    formIds: ["290-hoenn", "291-hoenn", "292-hoenn"],
    relationKey: "SPECIAL_ACQUISITION_FAMILY",
    note: "Nincada and Shedinja share a family record; Shedinja is acquired specially and is not a direct evolution target.",
  },
];
