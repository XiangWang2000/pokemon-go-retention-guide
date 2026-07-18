export interface BatchSpeciesSeed {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  aliases?: string[];
}

export const batchSpecies: readonly BatchSpeciesSeed[] = [
  { dexNumber: 1, nameEn: "Bulbasaur", nameZhTw: "妙蛙種子", types: ["GRASS", "POISON"] },
  { dexNumber: 2, nameEn: "Ivysaur", nameZhTw: "妙蛙草", types: ["GRASS", "POISON"] },
  { dexNumber: 3, nameEn: "Venusaur", nameZhTw: "妙蛙花", types: ["GRASS", "POISON"] },
  { dexNumber: 4, nameEn: "Charmander", nameZhTw: "小火龍", types: ["FIRE"] },
  { dexNumber: 5, nameEn: "Charmeleon", nameZhTw: "火恐龍", types: ["FIRE"] },
  { dexNumber: 6, nameEn: "Charizard", nameZhTw: "噴火龍", types: ["FIRE", "FLYING"] },
  { dexNumber: 7, nameEn: "Squirtle", nameZhTw: "傑尼龜", types: ["WATER"] },
  { dexNumber: 8, nameEn: "Wartortle", nameZhTw: "卡咪龜", types: ["WATER"] },
  { dexNumber: 9, nameEn: "Blastoise", nameZhTw: "水箭龜", types: ["WATER"] },
  { dexNumber: 10, nameEn: "Caterpie", nameZhTw: "綠毛蟲", types: ["BUG"] },
  { dexNumber: 11, nameEn: "Metapod", nameZhTw: "鐵甲蛹", types: ["BUG"] },
  { dexNumber: 12, nameEn: "Butterfree", nameZhTw: "巴大蝶", types: ["BUG", "FLYING"] },
  { dexNumber: 13, nameEn: "Weedle", nameZhTw: "獨角蟲", types: ["BUG", "POISON"] },
  { dexNumber: 14, nameEn: "Kakuna", nameZhTw: "鐵殼蛹", types: ["BUG", "POISON"] },
  { dexNumber: 15, nameEn: "Beedrill", nameZhTw: "大針蜂", types: ["BUG", "POISON"] },
  { dexNumber: 16, nameEn: "Pidgey", nameZhTw: "波波", types: ["NORMAL", "FLYING"] },
  { dexNumber: 17, nameEn: "Pidgeotto", nameZhTw: "比比鳥", types: ["NORMAL", "FLYING"] },
  { dexNumber: 18, nameEn: "Pidgeot", nameZhTw: "大比鳥", types: ["NORMAL", "FLYING"] },
  { dexNumber: 19, nameEn: "Rattata", nameZhTw: "小拉達", types: ["NORMAL"] },
  { dexNumber: 20, nameEn: "Raticate", nameZhTw: "拉達", types: ["NORMAL"] },
  { dexNumber: 21, nameEn: "Spearow", nameZhTw: "烈雀", types: ["NORMAL", "FLYING"] },
  { dexNumber: 22, nameEn: "Fearow", nameZhTw: "大嘴雀", types: ["NORMAL", "FLYING"] },
  { dexNumber: 23, nameEn: "Ekans", nameZhTw: "阿柏蛇", types: ["POISON"] },
  { dexNumber: 24, nameEn: "Arbok", nameZhTw: "阿柏怪", types: ["POISON"] },
  { dexNumber: 25, nameEn: "Pikachu", nameZhTw: "皮卡丘", types: ["ELECTRIC"] },
  { dexNumber: 26, nameEn: "Raichu", nameZhTw: "雷丘", types: ["ELECTRIC"] },
  { dexNumber: 27, nameEn: "Sandshrew", nameZhTw: "穿山鼠", types: ["GROUND"] },
  { dexNumber: 28, nameEn: "Sandslash", nameZhTw: "穿山王", types: ["GROUND"] },
  {
    dexNumber: 29,
    nameEn: "Nidoran♀",
    nameZhTw: "尼多蘭",
    types: ["POISON"],
    aliases: ["Nidoran Female"],
  },
  { dexNumber: 30, nameEn: "Nidorina", nameZhTw: "尼多娜", types: ["POISON"] },
] as const;

// 家族鍵是研究資料的一部分，不得以圖鑑編號連續區間推算。
export const familyKeyByDex: Readonly<Record<number, string>> = {
  1: "KANTO_FAMILY_001",
  2: "KANTO_FAMILY_001",
  3: "KANTO_FAMILY_001",
  4: "KANTO_FAMILY_004",
  5: "KANTO_FAMILY_004",
  6: "KANTO_FAMILY_004",
  7: "KANTO_FAMILY_007",
  8: "KANTO_FAMILY_007",
  9: "KANTO_FAMILY_007",
  10: "KANTO_FAMILY_010",
  11: "KANTO_FAMILY_010",
  12: "KANTO_FAMILY_010",
  13: "KANTO_FAMILY_013",
  14: "KANTO_FAMILY_013",
  15: "KANTO_FAMILY_013",
  16: "KANTO_FAMILY_016",
  17: "KANTO_FAMILY_016",
  18: "KANTO_FAMILY_016",
  19: "KANTO_FAMILY_019",
  20: "KANTO_FAMILY_019",
  21: "KANTO_FAMILY_021",
  22: "KANTO_FAMILY_021",
  23: "KANTO_FAMILY_023",
  24: "KANTO_FAMILY_023",
  25: "KANTO_FAMILY_025",
  26: "KANTO_FAMILY_025",
  27: "KANTO_FAMILY_027",
  28: "KANTO_FAMILY_027",
  29: "KANTO_FAMILY_029",
  30: "KANTO_FAMILY_029",
};

export interface ExtraFormSeed {
  dexNumber: number;
  suffix: string;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: "ALOLA" | "GALAR" | "HISUI" | "PALDEA";
  types: string[];
  aliases: string[];
}

export const extraForms: readonly ExtraFormSeed[] = [
  {
    dexNumber: 19,
    suffix: "alola",
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["DARK", "NORMAL"],
    aliases: ["Alolan Rattata", "阿羅拉小拉達"],
  },
  {
    dexNumber: 20,
    suffix: "alola",
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["DARK", "NORMAL"],
    aliases: ["Alolan Raticate", "阿羅拉拉達"],
  },
  {
    dexNumber: 26,
    suffix: "alola",
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ELECTRIC", "PSYCHIC"],
    aliases: ["Alolan Raichu", "阿羅拉雷丘"],
  },
  {
    dexNumber: 27,
    suffix: "alola",
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ICE", "STEEL"],
    aliases: ["Alolan Sandshrew", "阿羅拉穿山鼠"],
  },
  {
    dexNumber: 28,
    suffix: "alola",
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ICE", "STEEL"],
    aliases: ["Alolan Sandslash", "阿羅拉穿山王"],
  },
] as const;

export const evolutionPairs = [
  ["001-kanto", "002-kanto"],
  ["002-kanto", "003-kanto"],
  ["004-kanto", "005-kanto"],
  ["005-kanto", "006-kanto"],
  ["007-kanto", "008-kanto"],
  ["008-kanto", "009-kanto"],
  ["010-kanto", "011-kanto"],
  ["011-kanto", "012-kanto"],
  ["013-kanto", "014-kanto"],
  ["014-kanto", "015-kanto"],
  ["016-kanto", "017-kanto"],
  ["017-kanto", "018-kanto"],
  ["019-kanto", "020-kanto"],
  ["019-alola", "020-alola"],
  ["021-kanto", "022-kanto"],
  ["023-kanto", "024-kanto"],
  ["025-kanto", "026-kanto"],
  ["027-kanto", "028-kanto"],
  ["027-alola", "028-alola"],
  ["029-kanto", "030-kanto"],
] as const;

export const megaVariants: Record<string, readonly string[]> = {
  "003-kanto": ["MEGA"],
  "006-kanto": ["MEGA_X", "MEGA_Y"],
  "009-kanto": ["MEGA"],
  "015-kanto": ["MEGA"],
  "018-kanto": ["MEGA"],
};

export const gigantamaxCandidateForms = new Set(["003-kanto", "006-kanto", "009-kanto"]);

export function toFormId(dexNumber: number, suffix = "kanto") {
  return `${String(dexNumber).padStart(3, "0")}-${suffix}`;
}

export function pvpokeSpeciesId(formId: string, variantKey: string) {
  const form = formId.endsWith("-alola") ? "_alolan" : "";
  const dex = Number(formId.slice(0, 3));
  const species = batchSpecies.find((item) => item.dexNumber === dex);
  if (!species) return "";
  const base = species.nameEn
    .toLowerCase()
    .replace("♀", "_female")
    .replace(/[^a-z0-9_]+/g, "");
  return `${base}${form}${variantKey === "SHADOW" ? "_shadow" : ""}`;
}
