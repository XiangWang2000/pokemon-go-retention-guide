import type { CandidateForm } from "./types";

export type CandidatePvpokeMapping554583 = {
  formId: string;
  normal: string;
  shadow: string | null;
  mode: "EXACT";
  notesZhTw: string;
};

const exact = (
  formId: string,
  normal: string,
  shadow: string | null = null,
): CandidatePvpokeMapping554583 => ({
  formId,
  normal,
  shadow,
  mode: "EXACT",
  notesZhTw:
    shadow === null
      ? "固定 PvPoke gamemaster 有此 form 的獨立普通 speciesId；未建立未受 pinned gamemaster 支持的 Shadow ID。"
      : "固定 PvPoke gamemaster 有此 form 的獨立普通與 Shadow speciesId。",
});

export const pvpokeMappings554583 = [
  exact("554-unova", "darumaka", "darumaka_shadow"),
  exact("554-galar", "darumaka_galarian"),
  exact("555-unova-standard", "darmanitan_standard", "darmanitan_standard_shadow"),
  exact("555-unova-zen", "darmanitan_zen"),
  exact("555-galar-standard", "darmanitan_galarian_standard"),
  exact("555-galar-zen", "darmanitan_galarian_zen"),
  exact("556-unova", "maractus"),
  exact("557-unova", "dwebble", "dwebble_shadow"),
  exact("558-unova", "crustle", "crustle_shadow"),
  exact("559-unova", "scraggy"),
  exact("560-unova", "scrafty"),
  exact("561-unova", "sigilyph"),
  exact("562-unova", "yamask", "yamask_shadow"),
  exact("562-galar", "yamask_galarian"),
  exact("563-unova", "cofagrigus", "cofagrigus_shadow"),
  exact("564-unova", "tirtouga", "tirtouga_shadow"),
  exact("565-unova", "carracosta", "carracosta_shadow"),
  exact("566-unova", "archen", "archen_shadow"),
  exact("567-unova", "archeops", "archeops_shadow"),
  exact("568-unova", "trubbish", "trubbish_shadow"),
  exact("569-unova", "garbodor", "garbodor_shadow"),
  exact("570-unova", "zorua"),
  exact("570-hisui", "zorua_hisuian"),
  exact("571-unova", "zoroark"),
  exact("571-hisui", "zoroark_hisuian"),
  exact("572-unova", "minccino"),
  exact("573-unova", "cinccino"),
  exact("574-unova", "gothita", "gothita_shadow"),
  exact("575-unova", "gothorita", "gothorita_shadow"),
  exact("576-unova", "gothitelle", "gothitelle_shadow"),
  exact("577-unova", "solosis", "solosis_shadow"),
  exact("578-unova", "duosion", "duosion_shadow"),
  exact("579-unova", "reuniclus", "reuniclus_shadow"),
  exact("580-unova", "ducklett", "ducklett_shadow"),
  exact("581-unova", "swanna", "swanna_shadow"),
  exact("582-unova", "vanillite"),
  exact("583-unova", "vanillish"),
] as const satisfies readonly CandidatePvpokeMapping554583[];

const byFormId = new Map(pvpokeMappings554583.map((mapping) => [mapping.formId, mapping]));

export function candidatePvpokeMapping554583(form: Pick<CandidateForm, "id">) {
  const mapping = byFormId.get(form.id);
  if (!mapping) throw new Error(`Missing Gen5 #554-#583 PvPoke mapping for ${form.id}.`);
  return mapping;
}

export const defaultGuideFormId554583: Readonly<Record<number, string>> = Object.fromEntries(
  Array.from({ length: 30 }, (_, index) => {
    const dex = 554 + index;
    if (dex === 555) return [dex, "555-unova-standard"];
    return [dex, `${String(dex).padStart(3, "0")}-unova`];
  }),
);
