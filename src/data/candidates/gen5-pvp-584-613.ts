import type { CandidateForm } from "./types";

export type CandidatePvpMappingMode584613 = "EXACT" | "SHARED_UNDIFFERENTIATED";

export type CandidatePvpokeMapping584613 = {
  formId: string;
  normal: string;
  shadow: string | null;
  mode: CandidatePvpMappingMode584613;
  notesZhTw: string;
};

const exact = (
  formId: string,
  normal: string,
  shadow: string | null = null,
): CandidatePvpokeMapping584613 => ({
  formId,
  normal,
  shadow,
  mode: "EXACT",
  notesZhTw:
    shadow === null
      ? "固定 PvPoke gamemaster 有此 Pokémon GO form 對應的普通 speciesId；沒有建立 pinned gamemaster 未明列的 Shadow ID。"
      : "固定 PvPoke gamemaster 有此 form 對應的普通與 Shadow speciesId。",
});

const shared = (
  formId: string,
  speciesId: string,
): CandidatePvpokeMapping584613 => ({
  formId,
  normal: speciesId,
  shadow: null,
  mode: "SHARED_UNDIFFERENTIATED",
  notesZhTw:
    "Pokémon GO 有獨立外觀 form，但固定 PvPoke gamemaster 僅提供共享 generic speciesId；此排名只能作共享物種級戰鬥證據，不能宣稱為該季節／性別 form 的 exact rank。",
});

export const pvpokeMappings584613 = [
  exact("584-unova", "vanilluxe"),
  shared("585-spring", "deerling"),
  shared("585-summer", "deerling"),
  shared("585-autumn", "deerling"),
  shared("585-winter", "deerling"),
  shared("586-spring", "sawsbuck"),
  shared("586-summer", "sawsbuck"),
  shared("586-autumn", "sawsbuck"),
  shared("586-winter", "sawsbuck"),
  exact("587-unova", "emolga"),
  exact("588-unova", "karrablast", "karrablast_shadow"),
  exact("589-unova", "escavalier", "escavalier_shadow"),
  exact("590-unova", "foongus", "foongus_shadow"),
  exact("591-unova", "amoonguss", "amoonguss_shadow"),
  shared("592-male", "frillish"),
  shared("592-female", "frillish"),
  shared("593-male", "jellicent"),
  shared("593-female", "jellicent"),
  exact("594-unova", "alomomola"),
  exact("595-unova", "joltik", "joltik_shadow"),
  exact("596-unova", "galvantula", "galvantula_shadow"),
  exact("597-unova", "ferroseed", "ferroseed_shadow"),
  exact("598-unova", "ferrothorn", "ferrothorn_shadow"),
  exact("599-unova", "klink"),
  exact("600-unova", "klang"),
  exact("601-unova", "klinklang"),
  exact("602-unova", "tynamo"),
  exact("603-unova", "eelektrik"),
  exact("604-unova", "eelektross"),
  exact("605-unova", "elgyem"),
  exact("606-unova", "beheeyem"),
  exact("607-unova", "litwick", "litwick_shadow"),
  exact("608-unova", "lampent", "lampent_shadow"),
  exact("609-unova", "chandelure", "chandelure_shadow"),
  exact("610-unova", "axew", "axew_shadow"),
  exact("611-unova", "fraxure", "fraxure_shadow"),
  exact("612-unova", "haxorus", "haxorus_shadow"),
  exact("613-unova", "cubchoo"),
] as const satisfies readonly CandidatePvpokeMapping584613[];

const byFormId = new Map(pvpokeMappings584613.map((mapping) => [mapping.formId, mapping]));

export function candidatePvpokeMapping584613(form: Pick<CandidateForm, "id">) {
  const mapping = byFormId.get(form.id);
  if (!mapping) throw new Error(`Missing Gen5 #584-#613 PvPoke mapping for ${form.id}.`);
  return mapping;
}

export const defaultGuideFormId584613: Readonly<Record<number, string>> = Object.fromEntries(
  Array.from({ length: 30 }, (_, index) => {
    const dex = 584 + index;
    if (dex === 585) return [dex, "585-spring"];
    if (dex === 586) return [dex, "586-spring"];
    if (dex === 592) return [dex, "592-male"];
    if (dex === 593) return [dex, "593-male"];
    return [dex, `${String(dex).padStart(3, "0")}-unova`];
  }),
);
