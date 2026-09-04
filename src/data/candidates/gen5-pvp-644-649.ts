import type { CandidateForm } from "./types";

export type CandidatePvpokeMapping644649 = {
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
): CandidatePvpokeMapping644649 => ({
  formId,
  normal,
  shadow,
  mode: "EXACT",
  notesZhTw:
    shadow === null
      ? "固定 PvPoke gamemaster 有此 Pokémon GO form 的獨立普通 speciesId；沒有建立 pinned gamemaster 未明列的 Shadow ID。"
      : "固定 PvPoke gamemaster 有此 Pokémon GO form 的獨立普通與 Shadow speciesId；Shadow battle identity 不等同 Pokémon GO 推出證據。",
});

export const pvpokeMappings644649 = [
  exact("644-unova", "zekrom"),
  exact("645-incarnate", "landorus_incarnate", "landorus_incarnate_shadow"),
  exact("645-therian", "landorus_therian"),
  exact("646-unova", "kyurem"),
  exact("646-black", "kyurem_black"),
  exact("646-white", "kyurem_white"),
  exact("647-ordinary", "keldeo_ordinary"),
  exact("647-resolute", "keldeo_resolute"),
  exact("648-aria", "meloetta_aria"),
  exact("648-pirouette", "meloetta_pirouette"),
  exact("649-unova", "genesect"),
  exact("649-shock", "genesect_shock"),
  exact("649-burn", "genesect_burn"),
  exact("649-chill", "genesect_chill"),
  exact("649-douse", "genesect_douse"),
] as const satisfies readonly CandidatePvpokeMapping644649[];

const byFormId = new Map(pvpokeMappings644649.map((mapping) => [mapping.formId, mapping]));

export function candidatePvpokeMapping644649(form: Pick<CandidateForm, "id">) {
  const mapping = byFormId.get(form.id);
  if (!mapping) throw new Error(`Missing Gen5 #644-#649 PvPoke mapping for ${form.id}.`);
  return mapping;
}

export const defaultGuideFormId644649: Readonly<Record<number, string>> = {
  644: "644-unova",
  645: "645-incarnate",
  646: "646-unova",
  647: "647-ordinary",
  648: "648-aria",
  649: "649-unova",
};
