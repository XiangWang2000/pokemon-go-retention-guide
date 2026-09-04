import type { CandidateForm } from "./types";

export type CandidatePvpMappingMode = "EXACT" | "SHARED_UNDIFFERENTIATED";
export type CandidatePvpVariantKey = "NORMAL" | "SHADOW";

export type CandidatePvpokeMapping = {
  formId: string;
  normal: string;
  shadow: string;
  mode: CandidatePvpMappingMode;
  notesZhTw: string;
};

const exact = (formId: string, speciesId: string): CandidatePvpokeMapping => ({
  formId,
  normal: speciesId,
  shadow: `${speciesId}_shadow`,
  mode: "EXACT",
  notesZhTw: "PvPoke gamemaster 有對應此 Pokémon GO form 的獨立 speciesId。",
});

export const pvpokeMappings524553: readonly CandidatePvpokeMapping[] = [
  exact("524-unova", "roggenrola"),
  exact("525-unova", "boldore"),
  exact("526-unova", "gigalith"),
  exact("527-unova", "woobat"),
  exact("528-unova", "swoobat"),
  exact("529-unova", "drilbur"),
  exact("530-unova", "excadrill"),
  exact("531-unova", "audino"),
  exact("532-unova", "timburr"),
  exact("533-unova", "gurdurr"),
  exact("534-unova", "conkeldurr"),
  exact("535-unova", "tympole"),
  exact("536-unova", "palpitoad"),
  exact("537-unova", "seismitoad"),
  exact("538-unova", "throh"),
  exact("539-unova", "sawk"),
  exact("540-unova", "sewaddle"),
  exact("541-unova", "swadloon"),
  exact("542-unova", "leavanny"),
  exact("543-unova", "venipede"),
  exact("544-unova", "whirlipede"),
  exact("545-unova", "scolipede"),
  exact("546-unova", "cottonee"),
  exact("547-unova", "whimsicott"),
  exact("548-unova", "petilil"),
  exact("549-unova", "lilligant"),
  exact("549-hisui", "lilligant_hisuian"),
  {
    formId: "550-red-striped",
    normal: "basculin",
    shadow: "basculin_shadow",
    mode: "SHARED_UNDIFFERENTIATED",
    notesZhTw:
      "固定 PvPoke gamemaster 只有 generic basculin，沒有紅／藍／白條紋獨立 speciesId；只能保存共享物種級證據。",
  },
  {
    formId: "550-blue-striped",
    normal: "basculin",
    shadow: "basculin_shadow",
    mode: "SHARED_UNDIFFERENTIATED",
    notesZhTw:
      "固定 PvPoke gamemaster 只有 generic basculin，沒有紅／藍／白條紋獨立 speciesId；只能保存共享物種級證據。",
  },
  {
    formId: "550-white-striped",
    normal: "basculin",
    shadow: "basculin_shadow",
    mode: "SHARED_UNDIFFERENTIATED",
    notesZhTw:
      "固定 PvPoke gamemaster 只有 generic basculin，沒有紅／藍／白條紋獨立 speciesId；只能保存共享物種級證據。",
  },
  exact("551-unova", "sandile"),
  exact("552-unova", "krokorok"),
  exact("553-unova", "krookodile"),
];

const byFormId = new Map(pvpokeMappings524553.map((mapping) => [mapping.formId, mapping]));

export function candidatePvpokeMapping524553(form: Pick<CandidateForm, "id">) {
  const mapping = byFormId.get(form.id);
  if (!mapping) throw new Error(`Missing Gen5 #524-#553 PvPoke mapping for ${form.id}.`);
  return mapping;
}

export function candidatePvpokeSpeciesId524553(
  form: Pick<CandidateForm, "id">,
  variantKey: CandidatePvpVariantKey,
) {
  const mapping = candidatePvpokeMapping524553(form);
  return variantKey === "SHADOW" ? mapping.shadow : mapping.normal;
}
