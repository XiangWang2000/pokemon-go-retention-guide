import type { CandidateBatchDefinition, CandidateForm, CandidateSpecies } from "./types";

const region = {
  formKey: "UNOVA",
  formNameEn: "Unova",
  formNameZhTw: "合眾",
  regionKey: "UNOVA" as const,
};

export const species494523 = [
  { dexNumber: 494, nameEn: "Victini", nameZhTw: "比克提尼", types: ["PSYCHIC", "FIRE"], familyKey: "UNOVA_FAMILY_494" },
  { dexNumber: 495, nameEn: "Snivy", nameZhTw: "藤藤蛇", types: ["GRASS"], familyKey: "UNOVA_FAMILY_495" },
  { dexNumber: 496, nameEn: "Servine", nameZhTw: "青藤蛇", types: ["GRASS"], familyKey: "UNOVA_FAMILY_495" },
  { dexNumber: 497, nameEn: "Serperior", nameZhTw: "君主蛇", types: ["GRASS"], familyKey: "UNOVA_FAMILY_495" },
  { dexNumber: 498, nameEn: "Tepig", nameZhTw: "暖暖豬", types: ["FIRE"], familyKey: "UNOVA_FAMILY_498" },
  { dexNumber: 499, nameEn: "Pignite", nameZhTw: "炒炒豬", types: ["FIRE", "FIGHTING"], familyKey: "UNOVA_FAMILY_498" },
  { dexNumber: 500, nameEn: "Emboar", nameZhTw: "炎武王", types: ["FIRE", "FIGHTING"], familyKey: "UNOVA_FAMILY_498" },
  { dexNumber: 501, nameEn: "Oshawott", nameZhTw: "水水獺", types: ["WATER"], familyKey: "UNOVA_FAMILY_501" },
  { dexNumber: 502, nameEn: "Dewott", nameZhTw: "雙刃丸", types: ["WATER"], familyKey: "UNOVA_FAMILY_501" },
  { dexNumber: 503, nameEn: "Samurott", nameZhTw: "大劍鬼", types: ["WATER"], familyKey: "UNOVA_FAMILY_501" },
  { dexNumber: 504, nameEn: "Patrat", nameZhTw: "探探鼠", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_504" },
  { dexNumber: 505, nameEn: "Watchog", nameZhTw: "步哨鼠", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_504" },
  { dexNumber: 506, nameEn: "Lillipup", nameZhTw: "小約克", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_506" },
  { dexNumber: 507, nameEn: "Herdier", nameZhTw: "哈約克", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_506" },
  { dexNumber: 508, nameEn: "Stoutland", nameZhTw: "長毛狗", types: ["NORMAL"], familyKey: "UNOVA_FAMILY_506" },
  { dexNumber: 509, nameEn: "Purrloin", nameZhTw: "扒手貓", types: ["DARK"], familyKey: "UNOVA_FAMILY_509" },
  { dexNumber: 510, nameEn: "Liepard", nameZhTw: "酷豹", types: ["DARK"], familyKey: "UNOVA_FAMILY_509" },
  { dexNumber: 511, nameEn: "Pansage", nameZhTw: "花椰猴", types: ["GRASS"], familyKey: "UNOVA_FAMILY_511" },
  { dexNumber: 512, nameEn: "Simisage", nameZhTw: "花椰猿", types: ["GRASS"], familyKey: "UNOVA_FAMILY_511" },
  { dexNumber: 513, nameEn: "Pansear", nameZhTw: "爆香猴", types: ["FIRE"], familyKey: "UNOVA_FAMILY_513" },
  { dexNumber: 514, nameEn: "Simisear", nameZhTw: "爆香猿", types: ["FIRE"], familyKey: "UNOVA_FAMILY_513" },
  { dexNumber: 515, nameEn: "Panpour", nameZhTw: "冷水猴", types: ["WATER"], familyKey: "UNOVA_FAMILY_515" },
  { dexNumber: 516, nameEn: "Simipour", nameZhTw: "冷水猿", types: ["WATER"], familyKey: "UNOVA_FAMILY_515" },
  { dexNumber: 517, nameEn: "Munna", nameZhTw: "食夢夢", types: ["PSYCHIC"], familyKey: "UNOVA_FAMILY_517" },
  { dexNumber: 518, nameEn: "Musharna", nameZhTw: "夢夢蝕", types: ["PSYCHIC"], familyKey: "UNOVA_FAMILY_517" },
  { dexNumber: 519, nameEn: "Pidove", nameZhTw: "豆豆鴿", types: ["NORMAL", "FLYING"], familyKey: "UNOVA_FAMILY_519" },
  { dexNumber: 520, nameEn: "Tranquill", nameZhTw: "咕咕鴿", types: ["NORMAL", "FLYING"], familyKey: "UNOVA_FAMILY_519" },
  { dexNumber: 521, nameEn: "Unfezant", nameZhTw: "高傲雉雞", types: ["NORMAL", "FLYING"], familyKey: "UNOVA_FAMILY_519" },
  { dexNumber: 522, nameEn: "Blitzle", nameZhTw: "斑斑馬", types: ["ELECTRIC"], familyKey: "UNOVA_FAMILY_522" },
  { dexNumber: 523, nameEn: "Zebstrika", nameZhTw: "雷電斑馬", types: ["ELECTRIC"], familyKey: "UNOVA_FAMILY_522" },
] as const satisfies readonly CandidateSpecies[];

const evolvesFrom = new Map<number, number>([
  [496, 495], [497, 496],
  [499, 498], [500, 499],
  [502, 501], [503, 502],
  [505, 504],
  [507, 506], [508, 507],
  [510, 509],
  [512, 511],
  [514, 513],
  [516, 515],
  [518, 517],
  [520, 519], [521, 520],
  [523, 522],
]);

function formId(dexNumber: number) {
  return `${String(dexNumber).padStart(3, "0")}-unova`;
}

export const forms494523 = species494523.map((species) => {
  const parent = evolvesFrom.get(species.dexNumber);
  return {
    id: formId(species.dexNumber),
    dexNumber: species.dexNumber,
    ...region,
    types: species.types,
    aliases: [species.nameEn, species.nameEn.toLowerCase(), species.nameZhTw, "Unova", "合眾"],
    evolvesFromFormId: parent ? formId(parent) : null,
  };
}) satisfies readonly CandidateForm[];

export const evolutionPairs494523 = [...evolvesFrom.entries()]
  .map(([toDex, fromDex]) => [formId(fromDex), formId(toDex)] as const);

export const gen5Candidate494523 = {
  key: "494-523",
  generation: 5,
  species: species494523,
  forms: forms494523,
  evolutionPairs: evolutionPairs494523,
  identitySourceIds: ["POKEAPI-CANONICAL-UNOVA-494-523"],
} as const satisfies CandidateBatchDefinition;
