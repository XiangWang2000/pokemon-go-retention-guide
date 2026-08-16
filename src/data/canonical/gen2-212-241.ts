/**
 * Independent canonical evolution-family expectations for the #212-#241
 * source boundary. This includes the three same-batch Johto relationships
 * that were previously omitted from the materialized source graph.
 */
export const canonicalGen2EvolutionFamilies212241 = [
  { fromFormId: "123-kanto", toFormId: "212-johto", familyKey: "KANTO_FAMILY_123" },
  { fromFormId: "117-kanto", toFormId: "230-johto", familyKey: "KANTO_FAMILY_116" },
  { fromFormId: "137-kanto", toFormId: "233-johto", familyKey: "KANTO_FAMILY_137" },
  { fromFormId: "223-johto", toFormId: "224-johto", familyKey: "JOHTO_FAMILY_223" },
  { fromFormId: "228-johto", toFormId: "229-johto", familyKey: "JOHTO_FAMILY_228" },
  { fromFormId: "231-johto", toFormId: "232-johto", familyKey: "JOHTO_FAMILY_231" },
  { fromFormId: "236-johto", toFormId: "106-kanto", familyKey: "KANTO_FAMILY_236" },
  { fromFormId: "236-johto", toFormId: "107-kanto", familyKey: "KANTO_FAMILY_236" },
  { fromFormId: "236-johto", toFormId: "237-johto", familyKey: "KANTO_FAMILY_236" },
  { fromFormId: "240-johto", toFormId: "126-kanto", familyKey: "KANTO_FAMILY_126" },
  { fromFormId: "239-johto", toFormId: "125-kanto", familyKey: "KANTO_FAMILY_125" },
  { fromFormId: "238-johto", toFormId: "124-kanto", familyKey: "KANTO_FAMILY_124" },
  { fromFormId: "215-johto", toFormId: "461-sinnoh", familyKey: "JOHTO_FAMILY_215" },
  { fromFormId: "216-johto", toFormId: "217-johto", familyKey: "JOHTO_FAMILY_216" },
  { fromFormId: "217-johto", toFormId: "901-hisui", familyKey: "JOHTO_FAMILY_216" },
  { fromFormId: "218-johto", toFormId: "219-johto", familyKey: "JOHTO_FAMILY_218" },
  { fromFormId: "220-johto", toFormId: "221-johto", familyKey: "JOHTO_FAMILY_220" },
  { fromFormId: "221-johto", toFormId: "473-sinnoh", familyKey: "JOHTO_FAMILY_220" },
  { fromFormId: "233-johto", toFormId: "474-sinnoh", familyKey: "KANTO_FAMILY_137" },
  { fromFormId: "234-johto", toFormId: "899-hisui", familyKey: "JOHTO_FAMILY_234" },
] as const;
