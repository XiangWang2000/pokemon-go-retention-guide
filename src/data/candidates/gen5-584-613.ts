import type {
  CandidateBatchDefinition,
  CandidateForm,
  CandidateSpecies,
} from "./types";

export const species584613 = [
  { dexNumber: 584, nameEn: "Vanilluxe", nameZhTw: "雙倍多多冰", types: ["ICE"], familyKey: "UNOVA_FAMILY_582" },
  { dexNumber: 585, nameEn: "Deerling", nameZhTw: "四季鹿", types: ["NORMAL", "GRASS"], familyKey: "UNOVA_FAMILY_585" },
  { dexNumber: 586, nameEn: "Sawsbuck", nameZhTw: "萌芽鹿", types: ["NORMAL", "GRASS"], familyKey: "UNOVA_FAMILY_585" },
  { dexNumber: 587, nameEn: "Emolga", nameZhTw: "電飛鼠", types: ["ELECTRIC", "FLYING"], familyKey: "UNOVA_FAMILY_587" },
  { dexNumber: 588, nameEn: "Karrablast", nameZhTw: "蓋蓋蟲", types: ["BUG"], familyKey: "UNOVA_FAMILY_588" },
  { dexNumber: 589, nameEn: "Escavalier", nameZhTw: "騎士蝸牛", types: ["BUG", "STEEL"], familyKey: "UNOVA_FAMILY_588" },
  { dexNumber: 590, nameEn: "Foongus", nameZhTw: "哎呀球菇", types: ["GRASS", "POISON"], familyKey: "UNOVA_FAMILY_590" },
  { dexNumber: 591, nameEn: "Amoonguss", nameZhTw: "敗露球菇", types: ["GRASS", "POISON"], familyKey: "UNOVA_FAMILY_590" },
  { dexNumber: 592, nameEn: "Frillish", nameZhTw: "輕飄飄", types: ["WATER", "GHOST"], familyKey: "UNOVA_FAMILY_592" },
  { dexNumber: 593, nameEn: "Jellicent", nameZhTw: "胖嘟嘟", types: ["WATER", "GHOST"], familyKey: "UNOVA_FAMILY_592" },
  { dexNumber: 594, nameEn: "Alomomola", nameZhTw: "保母曼波", types: ["WATER"], familyKey: "UNOVA_FAMILY_594" },
  { dexNumber: 595, nameEn: "Joltik", nameZhTw: "電電蟲", types: ["BUG", "ELECTRIC"], familyKey: "UNOVA_FAMILY_595" },
  { dexNumber: 596, nameEn: "Galvantula", nameZhTw: "電蜘蛛", types: ["BUG", "ELECTRIC"], familyKey: "UNOVA_FAMILY_595" },
  { dexNumber: 597, nameEn: "Ferroseed", nameZhTw: "種子鐵球", types: ["GRASS", "STEEL"], familyKey: "UNOVA_FAMILY_597" },
  { dexNumber: 598, nameEn: "Ferrothorn", nameZhTw: "堅果啞鈴", types: ["GRASS", "STEEL"], familyKey: "UNOVA_FAMILY_597" },
  { dexNumber: 599, nameEn: "Klink", nameZhTw: "齒輪兒", types: ["STEEL"], familyKey: "UNOVA_FAMILY_599" },
  { dexNumber: 600, nameEn: "Klang", nameZhTw: "齒輪組", types: ["STEEL"], familyKey: "UNOVA_FAMILY_599" },
  { dexNumber: 601, nameEn: "Klinklang", nameZhTw: "齒輪怪", types: ["STEEL"], familyKey: "UNOVA_FAMILY_599" },
  { dexNumber: 602, nameEn: "Tynamo", nameZhTw: "麻麻小魚", types: ["ELECTRIC"], familyKey: "UNOVA_FAMILY_602" },
  { dexNumber: 603, nameEn: "Eelektrik", nameZhTw: "麻麻鰻", types: ["ELECTRIC"], familyKey: "UNOVA_FAMILY_602" },
  { dexNumber: 604, nameEn: "Eelektross", nameZhTw: "麻麻鰻魚王", types: ["ELECTRIC"], familyKey: "UNOVA_FAMILY_602" },
  { dexNumber: 605, nameEn: "Elgyem", nameZhTw: "小灰怪", types: ["PSYCHIC"], familyKey: "UNOVA_FAMILY_605" },
  { dexNumber: 606, nameEn: "Beheeyem", nameZhTw: "大宇怪", types: ["PSYCHIC"], familyKey: "UNOVA_FAMILY_605" },
  { dexNumber: 607, nameEn: "Litwick", nameZhTw: "燭光靈", types: ["GHOST", "FIRE"], familyKey: "UNOVA_FAMILY_607" },
  { dexNumber: 608, nameEn: "Lampent", nameZhTw: "燈火幽靈", types: ["GHOST", "FIRE"], familyKey: "UNOVA_FAMILY_607" },
  { dexNumber: 609, nameEn: "Chandelure", nameZhTw: "水晶燈火靈", types: ["GHOST", "FIRE"], familyKey: "UNOVA_FAMILY_607" },
  { dexNumber: 610, nameEn: "Axew", nameZhTw: "牙牙", types: ["DRAGON"], familyKey: "UNOVA_FAMILY_610" },
  { dexNumber: 611, nameEn: "Fraxure", nameZhTw: "斧牙龍", types: ["DRAGON"], familyKey: "UNOVA_FAMILY_610" },
  { dexNumber: 612, nameEn: "Haxorus", nameZhTw: "雙斧戰龍", types: ["DRAGON"], familyKey: "UNOVA_FAMILY_610" },
  { dexNumber: 613, nameEn: "Cubchoo", nameZhTw: "噴嚏熊", types: ["ICE"], familyKey: "UNOVA_FAMILY_613" },
] as const satisfies readonly CandidateSpecies[];

const speciesByDex = new Map<number, CandidateSpecies>(
  species584613.map((species) => [species.dexNumber, species]),
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

function seasonalForm(
  dexNumber: 585 | 586,
  season: "SPRING" | "SUMMER" | "AUTUMN" | "WINTER",
  seasonEn: "Spring" | "Summer" | "Autumn" | "Winter",
  seasonZhTw: "春天" | "夏天" | "秋天" | "冬天",
  evolvesFromFormId: string | null,
): CandidateForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen5 seasonal candidate species #${dexNumber}.`);
  return {
    id: `${dexNumber}-${season.toLowerCase()}`,
    dexNumber,
    formKey: season,
    formNameEn: `${seasonEn} Form`,
    formNameZhTw: `${seasonZhTw}的樣子`,
    regionKey: "UNOVA",
    types: species.types,
    aliases: [
      `${species.nameEn} ${seasonEn}`,
      `${seasonEn} Form ${species.nameEn}`,
      `${species.nameZhTw} ${seasonZhTw}`,
      `${seasonZhTw}的樣子`,
    ],
    evolvesFromFormId,
  };
}

function genderForm(
  dexNumber: 592 | 593,
  gender: "MALE" | "FEMALE",
  genderEn: "Male" | "Female",
  genderZhTw: "雄性" | "雌性",
  evolvesFromFormId: string | null,
): CandidateForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen5 gender candidate species #${dexNumber}.`);
  return {
    id: `${dexNumber}-${gender.toLowerCase()}`,
    dexNumber,
    formKey: gender,
    formNameEn: genderEn,
    formNameZhTw: genderZhTw,
    regionKey: "UNOVA",
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

export const forms584613 = [
  {
    ...standardForm(584, null),
    evolvesFromFormId: "583-unova",
  },
  seasonalForm(585, "SPRING", "Spring", "春天", null),
  seasonalForm(585, "SUMMER", "Summer", "夏天", null),
  seasonalForm(585, "AUTUMN", "Autumn", "秋天", null),
  seasonalForm(585, "WINTER", "Winter", "冬天", null),
  seasonalForm(586, "SPRING", "Spring", "春天", "585-spring"),
  seasonalForm(586, "SUMMER", "Summer", "夏天", "585-summer"),
  seasonalForm(586, "AUTUMN", "Autumn", "秋天", "585-autumn"),
  seasonalForm(586, "WINTER", "Winter", "冬天", "585-winter"),
  standardForm(587, null),
  standardForm(588, null),
  standardForm(589, 588),
  standardForm(590, null),
  standardForm(591, 590),
  genderForm(592, "MALE", "Male", "雄性", null),
  genderForm(592, "FEMALE", "Female", "雌性", null),
  genderForm(593, "MALE", "Male", "雄性", "592-male"),
  genderForm(593, "FEMALE", "Female", "雌性", "592-female"),
  standardForm(594, null),
  standardForm(595, null),
  standardForm(596, 595),
  standardForm(597, null),
  standardForm(598, 597),
  standardForm(599, null),
  standardForm(600, 599),
  standardForm(601, 600),
  standardForm(602, null),
  standardForm(603, 602),
  standardForm(604, 603),
  standardForm(605, null),
  standardForm(606, 605),
  standardForm(607, null),
  standardForm(608, 607),
  standardForm(609, 608),
  standardForm(610, null),
  standardForm(611, 610),
  standardForm(612, 611),
  standardForm(613, null),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs584613 = forms584613
  .filter((form) => form.evolvesFromFormId !== null)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const deferredEvolutionTargets584613 = [
  {
    fromFormId: "613-unova",
    targetDexNumber: 614,
    targetFormKey: "UNOVA",
    reasonZhTw:
      "噴嚏熊可進化為下一候選批次的 #614 凍原熊；等 #614 endpoint 由下一批擁有後再 materialize。",
  },
] as const;

export const gen5Candidate584613 = {
  key: "584-613",
  generation: 5,
  species: species584613,
  forms: forms584613,
  evolutionPairs: evolutionPairs584613,
  deferredEvolutionTargets: deferredEvolutionTargets584613,
  identitySourceIds: [
    "POKEAPI-CANONICAL-UNOVA-584-613",
    "GOHUB-POKEMONGO-FORMS-584-613-20260904",
  ],
} as const satisfies CandidateBatchDefinition;
