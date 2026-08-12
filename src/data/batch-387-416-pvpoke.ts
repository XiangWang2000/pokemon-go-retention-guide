import type { Gen4BatchForm } from "./batch-gen4-types";

const pvpokeIds387416: Record<string, { normal: string; shadow: string }> = {
  "387-sinnoh": { normal: "turtwig", shadow: "turtwig_shadow" },
  "388-sinnoh": { normal: "grotle", shadow: "grotle_shadow" },
  "389-sinnoh": { normal: "torterra", shadow: "torterra_shadow" },
  "390-sinnoh": { normal: "chimchar", shadow: "chimchar_shadow" },
  "391-sinnoh": { normal: "monferno", shadow: "monferno_shadow" },
  "392-sinnoh": { normal: "infernape", shadow: "infernape_shadow" },
  "393-sinnoh": { normal: "piplup", shadow: "piplup_shadow" },
  "394-sinnoh": { normal: "prinplup", shadow: "prinplup_shadow" },
  "395-sinnoh": { normal: "empoleon", shadow: "empoleon_shadow" },
  "396-sinnoh": { normal: "starly", shadow: "starly_shadow" },
  "397-sinnoh": { normal: "staravia", shadow: "staravia_shadow" },
  "398-sinnoh": { normal: "staraptor", shadow: "staraptor_shadow" },
  "399-sinnoh": { normal: "bidoof", shadow: "bidoof_shadow" },
  "400-sinnoh": { normal: "bibarel", shadow: "bibarel_shadow" },
  "401-sinnoh": { normal: "kricketot", shadow: "kricketot_shadow" },
  "402-sinnoh": { normal: "kricketune", shadow: "kricketune_shadow" },
  "403-sinnoh": { normal: "shinx", shadow: "shinx_shadow" },
  "404-sinnoh": { normal: "luxio", shadow: "luxio_shadow" },
  "405-sinnoh": { normal: "luxray", shadow: "luxray_shadow" },
  "406-sinnoh": { normal: "budew", shadow: "budew_shadow" },
  "407-sinnoh": { normal: "roserade", shadow: "roserade_shadow" },
  "408-sinnoh": { normal: "cranidos", shadow: "cranidos_shadow" },
  "409-sinnoh": { normal: "rampardos", shadow: "rampardos_shadow" },
  "410-sinnoh": { normal: "shieldon", shadow: "shieldon_shadow" },
  "411-sinnoh": { normal: "bastiodon", shadow: "bastiodon_shadow" },
  "412-plant-cloak": { normal: "burmy_plant", shadow: "burmy_plant_shadow" },
  "412-sandy-cloak": { normal: "burmy_sandy", shadow: "burmy_sandy_shadow" },
  "412-trash-cloak": { normal: "burmy_trash", shadow: "burmy_trash_shadow" },
  "413-plant-cloak": { normal: "wormadam_plant", shadow: "wormadam_plant_shadow" },
  "413-sandy-cloak": { normal: "wormadam_sandy", shadow: "wormadam_sandy_shadow" },
  "413-trash-cloak": { normal: "wormadam_trash", shadow: "wormadam_trash_shadow" },
  "414-sinnoh": { normal: "mothim", shadow: "mothim_shadow" },
  "415-sinnoh": { normal: "combee", shadow: "combee_shadow" },
  "416-sinnoh": { normal: "vespiquen", shadow: "vespiquen_shadow" },
};

export function pvpokeSpeciesId387416(form: Gen4BatchForm, shadow: boolean) {
  const ids = pvpokeIds387416[form.id];
  if (!ids) throw new Error(`Missing PvPoke species mapping for ${form.id}.`);
  return shadow ? ids.shadow : ids.normal;
}

export function allPvpokeMappings387416() {
  return pvpokeIds387416;
}
