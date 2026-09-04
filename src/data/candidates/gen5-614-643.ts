import type {
  CandidateBatchDefinition,
  CandidateForm,
  CandidateSpecies,
} from "./types";

export const species614643 = [
  { dexNumber: 614, nameEn: "Beartic", nameZhTw: "凍原熊", types: ["ICE"], familyKey: "UNOVA_FAMILY_613" },
  { dexNumber: 615, nameEn: "Cryogonal", nameZhTw: "幾何雪花", types: ["ICE"], familyKey: "UNOVA_FAMILY_615" },
  { dexNumber: 616, nameEn: "Shelmet", nameZhTw: "小嘴蝸", types: ["BUG"], familyKey: "UNOVA_FAMILY_616" },
  { dexNumber: 617, nameEn: "Accelgor", nameZhTw: "敏捷蟲", types: ["BUG"], familyKey: "UNOVA_FAMILY_616" },
  { dexNumber: 618, nameEn: "Stunfisk", nameZhTw: "泥巴魚", types: ["GROUND", "ELECTRIC"], familyKey: "UNOVA_FAMILY_618" },
  { dexNumber: 619, nameEn: "Mienfoo", nameZhTw: "功夫鼬", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_619" },
  { dexNumber: 620, nameEn: "Mienshao", nameZhTw: "師父鼬", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_619" },
  { dexNumber: 621, nameEn: "Druddigon", nameZhTw: "赤面龍", types: ["DRAGON"], familyKey: "UNOVA_FAMILY_621" },
  { dexNumber: 622, nameEn: "Golett", nameZhTw: "泥偶小人", types: ["GROUND", "GHOST"], familyKey: "UNOVA_FAMILY_622" },
  { dexNumber: 623, nameEn: "Golurk", nameZhTw: "泥偶巨人", types: ["GROUND", "GHOST"], familyKey: "UNOVA_FAMILY_622" },
  { dexNumber: 624, nameEn: "Pawniard", nameZhTw: "駒刀小兵", types: ["DARK", "STEEL"], familyKey: "UNOVA_FAMILY_624" },
  { dexNumber: 625, nameEn: "Bisharp", nameZhTw: "劈斬司令", types: ["DARK", "STEEL"], familyKey: "UNOVA_FAMILY_624" },
  { dexNumber: 626, nameEn: "Bouffalant", nameZhTw: "爆炸頭水牛", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_626" },
  { dexNumber: 627, nameEn: "Rufflet", nameZhTw: "毛頭小鷹", types: ["NORMAL", "FLYING"], familyKey: "UNOVA_FAMILY_627" },
  { dexNumber: 628, nameEn: "Braviary", nameZhTw: "勇士雄鷹", types: ["NORMAL", "FLYING"], familyKey: "UNOVA_FAMILY_627" },
  { dexNumber: 629, nameEn: "Vullaby", nameZhTw: "禿鷹丫頭", types: ["DARK", "FLYING"], familyKey: "UNOVA_FAMILY_629" },
  { dexNumber: 630, nameEn: "Mandibuzz", nameZhTw: "禿鷹娜", types: ["DARK", "FLYING"], familyKey: "UNOVA_FAMILY_629" },
  { dexNumber: 631, nameEn: "Heatmor", nameZhTw: "熔蟻獸", types: ["FIRE"], familyKey: "UNOVA_FAMILY_631" },
  { dexNumber: 632, nameEn: "Durant", nameZhTw: "鐵蟻", types: ["BUG", "STEEL"], familyKey: "UNOVA_FAMILY_632" },
  { dexNumber: 633, nameEn: "Deino", nameZhTw: "單首龍", types: ["DARK", "DRAGON"], familyKey: "UNOVA_FAMILY_633" },
  { dexNumber: 634, nameEn: "Zweilous", nameZhTw: "雙首暴龍", types: ["DARK", "DRAGON"], familyKey: "UNOVA_FAMILY_633" },
  { dexNumber: 635, nameEn: "Hydreigon", nameZhTw: "三首惡龍", types: ["DARK", "DRAGON"], familyKey: "UNOVA_FAMILY_633" },
  { dexNumber: 636, nameEn: "Larvesta", nameZhTw: "燃燒蟲", types: ["BUG", "FIRE"], familyKey: "UNOVA_FAMILY_636" },
  { dexNumber: 637, nameEn: "Volcarona", nameZhTw: "火神蛾", types: ["BUG", "FIRE"], familyKey: "UNOVA_FAMILY_636" },
  { dexNumber: 638, nameEn: "Cobalion", nameZhTw: "勾帕路翁", types: ["STEEL", "FIGHTING"], familyKey: "UNOVA_FAMILY_638" },
  { dexNumber: 639, nameEn: "Terrakion", nameZhTw: "代拉基翁", types: ["ROCK", "FIGHTING"], familyKey: "UNOVA_FAMILY_639" },
  { dexNumber: 640, nameEn: "Virizion", nameZhTw: "畢力吉翁", types: ["GRASS", "FIGHTING"], familyKey: "UNOVA_FAMILY_640" },
  { dexNumber: 641, nameEn: "Tornadus", nameZhTw: "龍捲雲", types: ["FLYING"], familyKey: "UNOVA_FAMILY_641" },
  { dexNumber: 642, nameEn: "Thundurus", nameZhTw: "雷電雲", types: ["ELECTRIC", "FLYING"], familyKey: "UNOVA_FAMILY_642" },
  { dexNumber: 643, nameEn: "Reshiram", nameZhTw: "萊希拉姆", types: ["DRAGON", "FIRE"], familyKey: "UNOVA_FAMILY_643" },
] as const satisfies readonly CandidateSpecies[];

const speciesByDex = new Map<number, CandidateSpecies>(
  species614643.map((species) => [species.dexNumber, species]),
);

function standardForm(dexNumber: number, evolvesFromDex: number | null): CandidateForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen5 candidate species #${dexNumber}.`);
  return {
    id: `${String(dexNumber).padStart(3, "0")}-unova`,
    dexNumber,
    formKey: "UNOVA",
    formNameEn: "Unova",
    formNameZhTw: "合眾",
    regionKey: "UNOVA",
    types: species.types,
    aliases: [species.nameEn, species.nameEn.toLowerCase(), species.nameZhTw, "Unova", "合眾"],
    evolvesFromFormId:
      evolvesFromDex === null ? null : `${String(evolvesFromDex).padStart(3, "0")}-unova`,
  };
}

function forcesForm(
  dexNumber: 641 | 642,
  formKey: "INCARNATE" | "THERIAN",
  formNameEn: "Incarnate Forme" | "Therian Forme",
  formNameZhTw: "化身形態" | "靈獸形態",
): CandidateForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen5 Forces of Nature species #${dexNumber}.`);
  return {
    id: `${dexNumber}-${formKey.toLowerCase()}`,
    dexNumber,
    formKey,
    formNameEn,
    formNameZhTw,
    regionKey: "UNOVA",
    types: species.types,
    aliases: [
      `${species.nameEn} ${formNameEn}`,
      `${formNameEn} ${species.nameEn}`,
      `${species.nameZhTw} ${formNameZhTw}`,
      formNameZhTw,
    ],
    evolvesFromFormId: null,
  };
}

export const forms614643 = [
  {
    ...standardForm(614, null),
    evolvesFromFormId: "613-unova",
  },
  standardForm(615, null),
  standardForm(616, null),
  standardForm(617, 616),
  standardForm(618, null),
  {
    id: "618-galar",
    dexNumber: 618,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["GROUND", "STEEL"],
    aliases: ["Galarian Stunfisk", "Stunfisk Galarian", "伽勒爾泥巴魚", "伽勒爾"],
    evolvesFromFormId: null,
  },
  standardForm(619, null),
  standardForm(620, 619),
  standardForm(621, null),
  standardForm(622, null),
  standardForm(623, 622),
  standardForm(624, null),
  standardForm(625, 624),
  standardForm(626, null),
  standardForm(627, null),
  standardForm(628, 627),
  {
    id: "628-hisui",
    dexNumber: 628,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["PSYCHIC", "FLYING"],
    aliases: ["Hisuian Braviary", "Braviary Hisuian", "洗翠勇士雄鷹", "洗翠"],
    evolvesFromFormId: null,
  },
  standardForm(629, null),
  standardForm(630, 629),
  standardForm(631, null),
  standardForm(632, null),
  standardForm(633, null),
  standardForm(634, 633),
  standardForm(635, 634),
  standardForm(636, null),
  standardForm(637, 636),
  standardForm(638, null),
  standardForm(639, null),
  standardForm(640, null),
  forcesForm(641, "INCARNATE", "Incarnate Forme", "化身形態"),
  forcesForm(641, "THERIAN", "Therian Forme", "靈獸形態"),
  forcesForm(642, "INCARNATE", "Incarnate Forme", "化身形態"),
  forcesForm(642, "THERIAN", "Therian Forme", "靈獸形態"),
  standardForm(643, null),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs614643 = forms614643
  .filter((form) => form.evolvesFromFormId !== null)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const deferredEvolutionTargets614643 = [
  {
    fromFormId: "625-unova",
    targetDexNumber: 983,
    targetFormKey: "PALDEA",
    reasonZhTw:
      "劈斬司令目前可在 Pokémon GO 進化為 #983 仆刀將軍；等 Gen9 candidate 擁有 #983 endpoint 後再正式 materialize。",
  },
] as const;

export const gen5Candidate614643 = {
  key: "614-643",
  generation: 5,
  species: species614643,
  forms: forms614643,
  evolutionPairs: evolutionPairs614643,
  deferredEvolutionTargets: deferredEvolutionTargets614643,
  identitySourceIds: [
    "POKEAPI-CANONICAL-UNOVA-614-643",
    "GOHUB-POKEMONGO-FORMS-614-643-20260904",
    "GOHUB-HISUIAN-BRAVIARY-NO-EVOLUTION-20260609",
    "BULBAPEDIA-GO-FORCES-NONINTERCHANGEABLE-20260904",
    "GOHUB-BISHARP-KINGAMBIT-EVOLUTION-20260904",
  ],
} as const satisfies CandidateBatchDefinition;
