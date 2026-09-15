import type {
  CandidateBatchDefinition,
  CandidateForm,
  CandidateSpecies,
} from "./types";

export const species650679 = [
  { dexNumber: 650, nameEn: "Chespin", nameZhTw: "哈力栗", types: ["GRASS"], familyKey: "KALOS_FAMILY_650" },
  { dexNumber: 651, nameEn: "Quilladin", nameZhTw: "胖胖哈力", types: ["GRASS"], familyKey: "KALOS_FAMILY_650" },
  { dexNumber: 652, nameEn: "Chesnaught", nameZhTw: "布里卡隆", types: ["GRASS", "FIGHTING"], familyKey: "KALOS_FAMILY_650" },
  { dexNumber: 653, nameEn: "Fennekin", nameZhTw: "火狐狸", types: ["FIRE"], familyKey: "KALOS_FAMILY_653" },
  { dexNumber: 654, nameEn: "Braixen", nameZhTw: "長尾火狐", types: ["FIRE"], familyKey: "KALOS_FAMILY_653" },
  { dexNumber: 655, nameEn: "Delphox", nameZhTw: "妖火紅狐", types: ["FIRE", "PSYCHIC"], familyKey: "KALOS_FAMILY_653" },
  { dexNumber: 656, nameEn: "Froakie", nameZhTw: "呱呱泡蛙", types: ["WATER"], familyKey: "KALOS_FAMILY_656" },
  { dexNumber: 657, nameEn: "Frogadier", nameZhTw: "呱頭蛙", types: ["WATER"], familyKey: "KALOS_FAMILY_656" },
  { dexNumber: 658, nameEn: "Greninja", nameZhTw: "甲賀忍蛙", types: ["WATER", "DARK"], familyKey: "KALOS_FAMILY_656" },
  { dexNumber: 659, nameEn: "Bunnelby", nameZhTw: "掘掘兔", types: ["NORMAL"], familyKey: "KALOS_FAMILY_659" },
  { dexNumber: 660, nameEn: "Diggersby", nameZhTw: "掘地兔", types: ["NORMAL", "GROUND"], familyKey: "KALOS_FAMILY_659" },
  { dexNumber: 661, nameEn: "Fletchling", nameZhTw: "小箭雀", types: ["NORMAL", "FLYING"], familyKey: "KALOS_FAMILY_661" },
  { dexNumber: 662, nameEn: "Fletchinder", nameZhTw: "火箭雀", types: ["FIRE", "FLYING"], familyKey: "KALOS_FAMILY_661" },
  { dexNumber: 663, nameEn: "Talonflame", nameZhTw: "烈箭鷹", types: ["FIRE", "FLYING"], familyKey: "KALOS_FAMILY_661" },
  { dexNumber: 664, nameEn: "Scatterbug", nameZhTw: "粉蝶蟲", types: ["BUG"], familyKey: "KALOS_FAMILY_664" },
  { dexNumber: 665, nameEn: "Spewpa", nameZhTw: "粉蝶蛹", types: ["BUG"], familyKey: "KALOS_FAMILY_664" },
  { dexNumber: 666, nameEn: "Vivillon", nameZhTw: "彩粉蝶", types: ["BUG", "FLYING"], familyKey: "KALOS_FAMILY_664" },
  { dexNumber: 667, nameEn: "Litleo", nameZhTw: "小獅獅", types: ["FIRE", "NORMAL"], familyKey: "KALOS_FAMILY_667" },
  { dexNumber: 668, nameEn: "Pyroar", nameZhTw: "火炎獅", types: ["FIRE", "NORMAL"], familyKey: "KALOS_FAMILY_667" },
  { dexNumber: 669, nameEn: "Flabébé", nameZhTw: "花蓓蓓", types: ["FAIRY"], familyKey: "KALOS_FAMILY_669" },
  { dexNumber: 670, nameEn: "Floette", nameZhTw: "花葉蒂", types: ["FAIRY"], familyKey: "KALOS_FAMILY_669" },
  { dexNumber: 671, nameEn: "Florges", nameZhTw: "花潔夫人", types: ["FAIRY"], familyKey: "KALOS_FAMILY_669" },
  { dexNumber: 672, nameEn: "Skiddo", nameZhTw: "坐騎小羊", types: ["GRASS"], familyKey: "KALOS_FAMILY_672" },
  { dexNumber: 673, nameEn: "Gogoat", nameZhTw: "坐騎山羊", types: ["GRASS"], familyKey: "KALOS_FAMILY_672" },
  { dexNumber: 674, nameEn: "Pancham", nameZhTw: "頑皮熊貓", types: ["FIGHTING"], familyKey: "KALOS_FAMILY_674" },
  { dexNumber: 675, nameEn: "Pangoro", nameZhTw: "流氓熊貓", types: ["FIGHTING", "DARK"], familyKey: "KALOS_FAMILY_674" },
  { dexNumber: 676, nameEn: "Furfrou", nameZhTw: "多麗米亞", types: ["NORMAL"], familyKey: "KALOS_FAMILY_676" },
  { dexNumber: 677, nameEn: "Espurr", nameZhTw: "妙喵", types: ["PSYCHIC"], familyKey: "KALOS_FAMILY_677" },
  { dexNumber: 678, nameEn: "Meowstic", nameZhTw: "超能妙喵", types: ["PSYCHIC"], familyKey: "KALOS_FAMILY_677" },
  { dexNumber: 679, nameEn: "Honedge", nameZhTw: "獨劍鞘", types: ["STEEL", "GHOST"], familyKey: "KALOS_FAMILY_679" },
] as const satisfies readonly CandidateSpecies[];

const speciesByDex = new Map<number, CandidateSpecies>(
  species650679.map((species) => [species.dexNumber, species]),
);

function standardForm(dexNumber: number, evolvesFromDex: number | null): CandidateForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen6 candidate species #${dexNumber}.`);
  return {
    id: `${String(dexNumber).padStart(3, "0")}-kalos`,
    dexNumber,
    formKey: "KALOS",
    formNameEn: "Kalos",
    formNameZhTw: "卡洛斯",
    regionKey: "KALOS",
    types: species.types,
    aliases: [species.nameEn, species.nameEn.toLowerCase(), species.nameZhTw, "Kalos", "卡洛斯"],
    evolvesFromFormId:
      evolvesFromDex === null ? null : `${String(evolvesFromDex).padStart(3, "0")}-kalos`,
  };
}

export const vivillonPatterns650679 = [
  { slug: "archipelago", key: "ARCHIPELAGO", en: "Archipelago", zhTw: "群島" },
  { slug: "continental", key: "CONTINENTAL", en: "Continental", zhTw: "大陸" },
  { slug: "elegant", key: "ELEGANT", en: "Elegant", zhTw: "高雅" },
  { slug: "garden", key: "GARDEN", en: "Garden", zhTw: "庭園" },
  { slug: "high-plains", key: "HIGH_PLAINS", en: "High Plains", zhTw: "荒野" },
  { slug: "icy-snow", key: "ICY_SNOW", en: "Icy Snow", zhTw: "冰雪" },
  { slug: "jungle", key: "JUNGLE", en: "Jungle", zhTw: "熱帶雨林" },
  { slug: "marine", key: "MARINE", en: "Marine", zhTw: "大海" },
  { slug: "meadow", key: "MEADOW", en: "Meadow", zhTw: "花園" },
  { slug: "modern", key: "MODERN", en: "Modern", zhTw: "摩登" },
  { slug: "monsoon", key: "MONSOON", en: "Monsoon", zhTw: "驟雨" },
  { slug: "ocean", key: "OCEAN", en: "Ocean", zhTw: "大洋" },
  { slug: "polar", key: "POLAR", en: "Polar", zhTw: "雪國" },
  { slug: "river", key: "RIVER", en: "River", zhTw: "大河" },
  { slug: "sandstorm", key: "SANDSTORM", en: "Sandstorm", zhTw: "沙暴" },
  { slug: "savanna", key: "SAVANNA", en: "Savanna", zhTw: "熱帶草原" },
  { slug: "sun", key: "SUN", en: "Sun", zhTw: "太陽" },
  { slug: "tundra", key: "TUNDRA", en: "Tundra", zhTw: "雪原" },
] as const;

function vivillonLineageForm(
  dexNumber: 664 | 665 | 666,
  pattern: (typeof vivillonPatterns650679)[number],
  evolvesFromFormId: string | null,
): CandidateForm {
  const species = speciesByDex.get(dexNumber)!;
  const isVivillon = dexNumber === 666;
  return {
    id: `${dexNumber}-${pattern.slug}`,
    dexNumber,
    formKey: pattern.key,
    formNameEn: isVivillon ? `${pattern.en} Pattern` : `${pattern.en} Pattern Lineage`,
    formNameZhTw: isVivillon ? `${pattern.zhTw}花紋` : `${pattern.zhTw}花紋譜系`,
    regionKey: "KALOS",
    types: species.types,
    aliases: [
      `${species.nameEn} ${pattern.en}`,
      `${pattern.en} ${species.nameEn}`,
      `${species.nameZhTw} ${pattern.zhTw}`,
      `${pattern.zhTw}花紋`,
    ],
    evolvesFromFormId,
  };
}

function genderLineageForm(
  dexNumber: 667 | 668 | 677 | 678,
  gender: "MALE" | "FEMALE",
  evolvesFromFormId: string | null,
): CandidateForm {
  const species = speciesByDex.get(dexNumber)!;
  const genderEn = gender === "MALE" ? "Male" : "Female";
  const genderZhTw = gender === "MALE" ? "雄性" : "雌性";
  const visibleTarget = dexNumber === 668 || dexNumber === 678;
  return {
    id: `${dexNumber}-${gender.toLowerCase()}`,
    dexNumber,
    formKey: gender,
    formNameEn: visibleTarget ? genderEn : `${genderEn} Lineage`,
    formNameZhTw: visibleTarget ? genderZhTw : `${genderZhTw}譜系`,
    regionKey: "KALOS",
    types: species.types,
    aliases: [
      `${species.nameEn} ${genderEn}`,
      `${genderEn} ${species.nameEn}`,
      `${species.nameZhTw} ${genderZhTw}`,
      genderZhTw,
    ],
    evolvesFromFormId,
  };
}

export const flowerColors650679 = [
  { slug: "red-flower", key: "RED_FLOWER", en: "Red Flower", zhTw: "紅花" },
  { slug: "yellow-flower", key: "YELLOW_FLOWER", en: "Yellow Flower", zhTw: "黃花" },
  { slug: "orange-flower", key: "ORANGE_FLOWER", en: "Orange Flower", zhTw: "橙花" },
  { slug: "blue-flower", key: "BLUE_FLOWER", en: "Blue Flower", zhTw: "藍花" },
  { slug: "white-flower", key: "WHITE_FLOWER", en: "White Flower", zhTw: "白花" },
] as const;

function flowerForm(
  dexNumber: 669 | 670 | 671,
  color: (typeof flowerColors650679)[number],
  evolvesFromFormId: string | null,
): CandidateForm {
  const species = speciesByDex.get(dexNumber)!;
  return {
    id: `${dexNumber}-${color.slug}`,
    dexNumber,
    formKey: color.key,
    formNameEn: color.en,
    formNameZhTw: color.zhTw,
    regionKey: "KALOS",
    types: species.types,
    aliases: [
      `${species.nameEn} ${color.en}`,
      `${color.en} ${species.nameEn}`,
      `${species.nameZhTw} ${color.zhTw}`,
      color.zhTw,
    ],
    evolvesFromFormId,
  };
}

export const furfrouTrims650679 = [
  { slug: "natural", key: "NATURAL", en: "Natural Form", zhTw: "野生的樣子" },
  { slug: "heart", key: "HEART_TRIM", en: "Heart Trim", zhTw: "心形造型" },
  { slug: "star", key: "STAR_TRIM", en: "Star Trim", zhTw: "星形造型" },
  { slug: "diamond", key: "DIAMOND_TRIM", en: "Diamond Trim", zhTw: "菱形造型" },
  { slug: "debutante", key: "DEBUTANTE_TRIM", en: "Debutante Trim", zhTw: "淑女造型" },
  { slug: "matron", key: "MATRON_TRIM", en: "Matron Trim", zhTw: "貴婦造型" },
  { slug: "dandy", key: "DANDY_TRIM", en: "Dandy Trim", zhTw: "紳士造型" },
  { slug: "la-reine", key: "LA_REINE_TRIM", en: "La Reine Trim", zhTw: "女王造型" },
  { slug: "kabuki", key: "KABUKI_TRIM", en: "Kabuki Trim", zhTw: "歌舞伎造型" },
  { slug: "pharaoh", key: "PHARAOH_TRIM", en: "Pharaoh Trim", zhTw: "國王造型" },
] as const;

function furfrouForm(trim: (typeof furfrouTrims650679)[number]): CandidateForm {
  return {
    id: `676-${trim.slug}`,
    dexNumber: 676,
    formKey: trim.key,
    formNameEn: trim.en,
    formNameZhTw: trim.zhTw,
    regionKey: "KALOS",
    types: ["NORMAL"],
    aliases: ["Furfrou", `Furfrou ${trim.en}`, "多麗米亞", trim.zhTw],
    evolvesFromFormId: null,
  };
}

const standardForms650679 = [
  standardForm(650, null), standardForm(651, 650), standardForm(652, 651),
  standardForm(653, null), standardForm(654, 653), standardForm(655, 654),
  standardForm(656, null), standardForm(657, 656), standardForm(658, 657),
  standardForm(659, null), standardForm(660, 659),
  standardForm(661, null), standardForm(662, 661), standardForm(663, 662),
  standardForm(672, null), standardForm(673, 672),
  standardForm(674, null), standardForm(675, 674),
  standardForm(679, null),
] as const;

const vivillonForms650679 = vivillonPatterns650679.flatMap((pattern) => [
  vivillonLineageForm(664, pattern, null),
  vivillonLineageForm(665, pattern, `664-${pattern.slug}`),
  vivillonLineageForm(666, pattern, `665-${pattern.slug}`),
]);

const litleoPyroarForms650679 = (["MALE", "FEMALE"] as const).flatMap((gender) => [
  genderLineageForm(667, gender, null),
  genderLineageForm(668, gender, `667-${gender.toLowerCase()}`),
]);

const flowerForms650679 = flowerColors650679.flatMap((color) => [
  flowerForm(669, color, null),
  flowerForm(670, color, `669-${color.slug}`),
  flowerForm(671, color, `670-${color.slug}`),
]);

const furfrouForms650679 = furfrouTrims650679.map(furfrouForm);

const espurrMeowsticForms650679 = (["MALE", "FEMALE"] as const).flatMap((gender) => [
  genderLineageForm(677, gender, null),
  genderLineageForm(678, gender, `677-${gender.toLowerCase()}`),
]);

export const forms650679 = [
  ...standardForms650679.filter((form) => form.dexNumber <= 663),
  ...vivillonForms650679,
  ...litleoPyroarForms650679,
  ...flowerForms650679,
  ...standardForms650679.filter((form) => form.dexNumber >= 672 && form.dexNumber <= 675),
  ...furfrouForms650679,
  ...espurrMeowsticForms650679,
  ...standardForms650679.filter((form) => form.dexNumber === 679),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs650679 = forms650679
  .filter((form) => form.evolvesFromFormId !== null)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const deferredEvolutionTargets650679 = [] as const;

export const furfrouFormTransitions650679 = furfrouTrims650679
  .filter((trim) => trim.slug !== "natural")
  .map((trim) => ({
    fromFormId: "676-natural",
    toFormId: `676-${trim.slug}`,
    reversible: true,
    candyCost: 25,
    stardustCost: 10_000,
    mechanic: "FORM_CHANGE" as const,
    reasonZhTw: "多麗米亞的造型變更是 Pokémon GO Form Change，不是進化；造型可受地區或活動條件限制。",
  }));

export const gen6Candidate650679 = {
  key: "650-679",
  generation: 6,
  species: species650679,
  forms: forms650679,
  evolutionPairs: evolutionPairs650679,
  deferredEvolutionTargets: deferredEvolutionTargets650679,
  identitySourceIds: [
    "POKEAPI-CANONICAL-KALOS-650-679",
    "OFFICIAL-VIVILLON-POSTCARD-FORMS-20221215",
    "OFFICIAL-FLABEBE-FIVE-FLOWERS-20220210",
    "OFFICIAL-FURFROU-FORM-CHANGE-20210921",
    "SECONDARY-GO-GENDER-FORMS-667-678-20260905",
  ],
} as const satisfies CandidateBatchDefinition;
