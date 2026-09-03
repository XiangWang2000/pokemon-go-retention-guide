import type { CandidateForm } from "./types";

export type CandidatePvpVariantKey = "NORMAL" | "SHADOW";

export type CandidatePvpokeMapping = {
  formId: string;
  normal: string;
  shadow: string;
};

const mappings = [
  ["494-unova", "victini"],
  ["495-unova", "snivy"],
  ["496-unova", "servine"],
  ["497-unova", "serperior"],
  ["498-unova", "tepig"],
  ["499-unova", "pignite"],
  ["500-unova", "emboar"],
  ["501-unova", "oshawott"],
  ["502-unova", "dewott"],
  ["503-unova", "samurott"],
  ["504-unova", "patrat"],
  ["505-unova", "watchog"],
  ["506-unova", "lillipup"],
  ["507-unova", "herdier"],
  ["508-unova", "stoutland"],
  ["509-unova", "purrloin"],
  ["510-unova", "liepard"],
  ["511-unova", "pansage"],
  ["512-unova", "simisage"],
  ["513-unova", "pansear"],
  ["514-unova", "simisear"],
  ["515-unova", "panpour"],
  ["516-unova", "simipour"],
  ["517-unova", "munna"],
  ["518-unova", "musharna"],
  ["519-unova", "pidove"],
  ["520-unova", "tranquill"],
  ["521-unova", "unfezant"],
  ["522-unova", "blitzle"],
  ["523-unova", "zebstrika"],
] as const;

export const pvpokeMappings494523: readonly CandidatePvpokeMapping[] = mappings.map(
  ([formId, normal]) => ({ formId, normal, shadow: `${normal}_shadow` }),
);

const mappingByFormId = new Map(pvpokeMappings494523.map((mapping) => [mapping.formId, mapping]));

export function candidatePvpokeSpeciesId494523(
  form: Pick<CandidateForm, "id">,
  variantKey: CandidatePvpVariantKey,
) {
  const mapping = mappingByFormId.get(form.id);
  if (!mapping) throw new Error(`Missing Gen5 candidate PvPoke mapping for ${form.id}.`);
  return variantKey === "SHADOW" ? mapping.shadow : mapping.normal;
}
