import type { CandidateForm } from "./types";

export type CandidatePvpokeMapping614643 = {
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
): CandidatePvpokeMapping614643 => ({
  formId,
  normal,
  shadow,
  mode: "EXACT",
  notesZhTw:
    shadow === null
      ? "固定 PvPoke gamemaster 有此 Pokémon GO form 的獨立普通 speciesId；沒有建立 pinned gamemaster 未明列的 Shadow ID。"
      : "固定 PvPoke gamemaster 有此 Pokémon GO form 的獨立普通與 Shadow speciesId；Shadow battle identity 不等同 Pokémon GO 推出證據。",
});

export const pvpokeMappings614643 = [
  exact("614-unova", "beartic"),
  exact("615-unova", "cryogonal"),
  exact("616-unova", "shelmet", "shelmet_shadow"),
  exact("617-unova", "accelgor", "accelgor_shadow"),
  exact("618-unova", "stunfisk"),
  exact("618-galar", "stunfisk_galarian"),
  exact("619-unova", "mienfoo"),
  exact("620-unova", "mienshao"),
  exact("621-unova", "druddigon"),
  exact("622-unova", "golett", "golett_shadow"),
  exact("623-unova", "golurk", "golurk_shadow"),
  exact("624-unova", "pawniard"),
  exact("625-unova", "bisharp"),
  exact("626-unova", "bouffalant"),
  exact("627-unova", "rufflet"),
  exact("628-unova", "braviary"),
  exact("628-hisui", "braviary_hisuian"),
  exact("629-unova", "vullaby"),
  exact("630-unova", "mandibuzz"),
  exact("631-unova", "heatmor"),
  exact("632-unova", "durant"),
  exact("633-unova", "deino", "deino_shadow"),
  exact("634-unova", "zweilous", "zweilous_shadow"),
  exact("635-unova", "hydreigon", "hydreigon_shadow"),
  exact("636-unova", "larvesta"),
  exact("637-unova", "volcarona"),
  exact("638-unova", "cobalion"),
  exact("639-unova", "terrakion"),
  exact("640-unova", "virizion"),
  exact("641-incarnate", "tornadus_incarnate", "tornadus_incarnate_shadow"),
  exact("641-therian", "tornadus_therian"),
  exact("642-incarnate", "thundurus_incarnate", "thundurus_incarnate_shadow"),
  exact("642-therian", "thundurus_therian"),
  exact("643-unova", "reshiram", "reshiram_shadow"),
] as const satisfies readonly CandidatePvpokeMapping614643[];

const byFormId = new Map(pvpokeMappings614643.map((mapping) => [mapping.formId, mapping]));

export function candidatePvpokeMapping614643(form: Pick<CandidateForm, "id">) {
  const mapping = byFormId.get(form.id);
  if (!mapping) throw new Error(`Missing Gen5 #614-#643 PvPoke mapping for ${form.id}.`);
  return mapping;
}

export const defaultGuideFormId614643: Readonly<Record<number, string>> = Object.fromEntries(
  Array.from({ length: 30 }, (_, index) => {
    const dex = 614 + index;
    if (dex === 618) return [dex, "618-unova"];
    if (dex === 628) return [dex, "628-unova"];
    if (dex === 641) return [dex, "641-incarnate"];
    if (dex === 642) return [dex, "642-incarnate"];
    return [dex, `${String(dex).padStart(3, "0")}-unova`];
  }),
);
