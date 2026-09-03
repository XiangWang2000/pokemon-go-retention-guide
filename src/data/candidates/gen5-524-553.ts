import type {
  CandidateBatchDefinition,
  CandidateForm,
  CandidateSpecies,
} from "./types";

export const species524553 = [
  { dexNumber: 524, nameEn: "Roggenrola", nameZhTw: "石丸子", types: ["ROCK"], familyKey: "UNOVA_FAMILY_524" },
  { dexNumber: 525, nameEn: "Boldore", nameZhTw: "地幔岩", types: ["ROCK"], familyKey: "UNOVA_FAMILY_524" },
  { dexNumber: 526, nameEn: "Gigalith", nameZhTw: "龐岩怪", types: ["ROCK"], familyKey: "UNOVA_FAMILY_524" },
  { dexNumber: 527, nameEn: "Woobat", nameZhTw: "滾滾蝙蝠", types: ["PSYCHIC", "FLYING"], familyKey: "UNOVA_FAMILY_527" },
  { dexNumber: 528, nameEn: "Swoobat", nameZhTw: "心蝙蝠", types: ["PSYCHIC", "FLYING"], familyKey: "UNOVA_FAMILY_527" },
  { dexNumber: 529, nameEn: "Drilbur", nameZhTw: "螺釘地鼠", types: ["GROUND"], familyKey: "UNOVA_FAMILY_529" },
  { dexNumber: 530, nameEn: "Excadrill", nameZhTw: "龍頭地鼠", types: ["GROUND", "STEEL"], familyKey: "UNOVA_FAMILY_529" },
  { dexNumber: 531, nameEn: "Audino", nameZhTw: "差不多娃娃", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_531" },
  { dexNumber: 532, nameEn: "Timburr", nameZhTw: "搬運小匠", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_532" },
  { dexNumber: 533, nameEn: "Gurdurr", nameZhTw: "鐵骨土人", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_532" },
  { dexNumber: 534, nameEn: "Conkeldurr", nameZhTw: "修建老匠", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_532" },
  { dexNumber: 535, nameEn: "Tympole", nameZhTw: "圓蝌蚪", types: ["WATER"], familyKey: "UNOVA_FAMILY_535" },
  { dexNumber: 536, nameEn: "Palpitoad", nameZhTw: "藍蟾蜍", types: ["WATER", "GROUND"], familyKey: "UNOVA_FAMILY_535" },
  { dexNumber: 537, nameEn: "Seismitoad", nameZhTw: "蟾蜍王", types: ["WATER", "GROUND"], familyKey: "UNOVA_FAMILY_535" },
  { dexNumber: 538, nameEn: "Throh", nameZhTw: "投摔鬼", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_538" },
  { dexNumber: 539, nameEn: "Sawk", nameZhTw: "打擊鬼", types: ["FIGHTING"], familyKey: "UNOVA_FAMILY_539" },
  { dexNumber: 540, nameEn: "Sewaddle", nameZhTw: "蟲寶包", types: ["BUG", "GRASS"], familyKey: "UNOVA_FAMILY_540" },
  { dexNumber: 541, nameEn: "Swadloon", nameZhTw: "寶包繭", types: ["BUG", "GRASS"], familyKey: "UNOVA_FAMILY_540" },
  { dexNumber: 542, nameEn: "Leavanny", nameZhTw: "保母蟲", types: ["BUG", "GRASS"], familyKey: "UNOVA_FAMILY_540" },
  { dexNumber: 543, nameEn: "Venipede", nameZhTw: "百足蜈蚣", types: ["BUG", "POISON"], familyKey: "UNOVA_FAMILY_543" },
  { dexNumber: 544, nameEn: "Whirlipede", nameZhTw: "車輪毬", types: ["BUG", "POISON"], familyKey: "UNOVA_FAMILY_543" },
  { dexNumber: 545, nameEn: "Scolipede", nameZhTw: "蜈蚣王", types: ["BUG", "POISON"], familyKey: "UNOVA_FAMILY_543" },
  { dexNumber: 546, nameEn: "Cottonee", nameZhTw: "木棉球", types: ["GRASS", "FAIRY"], familyKey: "UNOVA_FAMILY_546" },
  { dexNumber: 547, nameEn: "Whimsicott", nameZhTw: "風妖精", types: ["GRASS", "FAIRY"], familyKey: "UNOVA_FAMILY_546" },
  { dexNumber: 548, nameEn: "Petilil", nameZhTw: "百合根娃娃", types: ["GRASS"], familyKey: "UNOVA_FAMILY_548" },
  { dexNumber: 549, nameEn: "Lilligant", nameZhTw: "裙兒小姐", types: ["GRASS"], familyKey: "UNOVA_FAMILY_548" },
  { dexNumber: 550, nameEn: "Basculin", nameZhTw: "野蠻鱸魚", types: ["WATER"], familyKey: "UNOVA_FAMILY_550" },
  { dexNumber: 551, nameEn: "Sandile", nameZhTw: "黑眼鱷", types: ["GROUND", "DARK"], familyKey: "UNOVA_FAMILY_551" },
  { dexNumber: 552, nameEn: "Krokorok", nameZhTw: "混混鱷", types: ["GROUND", "DARK"], familyKey: "UNOVA_FAMILY_551" },
  { dexNumber: 553, nameEn: "Krookodile", nameZhTw: "流氓鱷", types: ["GROUND", "DARK"], familyKey: "UNOVA_FAMILY_551" },
] as const satisfies readonly CandidateSpecies[];

const speciesByDex = new Map(species524553.map((species) => [species.dexNumber, species]));

function standardForm(
  dexNumber: number,
  evolvesFromDex: number | null,
): CandidateForm {
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
      evolvesFromDex === null
        ? null
        : `${String(evolvesFromDex).padStart(3, "0")}-unova`,
  };
}

export const forms524553 = [
  standardForm(524, null),
  standardForm(525, 524),
  standardForm(526, 525),
  standardForm(527, null),
  standardForm(528, 527),
  standardForm(529, null),
  standardForm(530, 529),
  standardForm(531, null),
  standardForm(532, null),
  standardForm(533, 532),
  standardForm(534, 533),
  standardForm(535, null),
  standardForm(536, 535),
  standardForm(537, 536),
  standardForm(538, null),
  standardForm(539, null),
  standardForm(540, null),
  standardForm(541, 540),
  standardForm(542, 541),
  standardForm(543, null),
  standardForm(544, 543),
  standardForm(545, 544),
  standardForm(546, null),
  standardForm(547, 546),
  standardForm(548, null),
  standardForm(549, 548),
  {
    id: "549-hisui",
    dexNumber: 549,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["GRASS", "FIGHTING"],
    aliases: ["Hisuian Lilligant", "Lilligant Hisui", "洗翠裙兒小姐", "洗翠"],
    evolvesFromFormId: null,
  },
  {
    id: "550-red-striped",
    dexNumber: 550,
    formKey: "RED_STRIPED",
    formNameEn: "Red-Striped Form",
    formNameZhTw: "紅條紋的樣子",
    regionKey: "UNOVA",
    types: ["WATER"],
    aliases: ["Basculin Red Striped", "Red-Striped Basculin", "野蠻鱸魚 紅條紋", "紅條紋的樣子"],
    evolvesFromFormId: null,
  },
  {
    id: "550-blue-striped",
    dexNumber: 550,
    formKey: "BLUE_STRIPED",
    formNameEn: "Blue-Striped Form",
    formNameZhTw: "藍條紋的樣子",
    regionKey: "UNOVA",
    types: ["WATER"],
    aliases: ["Basculin Blue Striped", "Blue-Striped Basculin", "野蠻鱸魚 藍條紋", "藍條紋的樣子"],
    evolvesFromFormId: null,
  },
  {
    id: "550-white-striped",
    dexNumber: 550,
    formKey: "WHITE_STRIPED",
    formNameEn: "White-Striped Form",
    formNameZhTw: "白條紋的樣子",
    regionKey: "HISUI",
    types: ["WATER"],
    aliases: ["Basculin White Striped", "White-Striped Basculin", "野蠻鱸魚 白條紋", "白條紋的樣子"],
    evolvesFromFormId: null,
  },
  standardForm(551, null),
  standardForm(552, 551),
  standardForm(553, 552),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs524553 = forms524553
  .filter((form) => form.evolvesFromFormId !== null)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const deferredEvolutionTargets524553 = [
  {
    fromFormId: "550-white-striped",
    targetDexNumber: 902,
    targetFormKey: "HISUI",
    reasonZhTw:
      "白條紋野蠻鱸魚可連到 #902 幽尾玄魚；依候選批次邊界，等 Gen8 擁有 #902 endpoint 後再正式 materialize。",
  },
] as const;

export const gen5Candidate524553 = {
  key: "524-553",
  generation: 5,
  species: species524553,
  forms: forms524553,
  evolutionPairs: evolutionPairs524553,
  deferredEvolutionTargets: deferredEvolutionTargets524553,
  identitySourceIds: [
    "POKEAPI-CANONICAL-UNOVA-524-553",
    "GOHUB-POKEMONGO-FORMS-524-553-20260904",
  ],
} as const satisfies CandidateBatchDefinition;
