import type { RegionKey } from "./region-key";

export interface Species031060 {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  familyKey: string;
}

export interface Form031060 {
  id: string;
  dexNumber: number;
  formKey: "KANTO" | "ALOLA" | "GALAR" | "HISUI";
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  types: string[];
  aliases: string[];
  evolvesFromFormId?: string;
  evolutionFamilyNotesZhTw: string;
  pvpokeSuffix?: "alolan" | "hisuian";
}

const speciesBase = [
  [31, "Nidoqueen", "尼多后", ["POISON", "GROUND"], "KANTO_FAMILY_029"],
  [32, "Nidoran♂", "尼多朗", ["POISON"], "KANTO_FAMILY_032"],
  [33, "Nidorino", "尼多力諾", ["POISON"], "KANTO_FAMILY_032"],
  [34, "Nidoking", "尼多王", ["POISON", "GROUND"], "KANTO_FAMILY_032"],
  [35, "Clefairy", "皮皮", ["FAIRY"], "KANTO_FAMILY_035"],
  [36, "Clefable", "皮可西", ["FAIRY"], "KANTO_FAMILY_035"],
  [37, "Vulpix", "六尾", ["FIRE"], "KANTO_FAMILY_037"],
  [38, "Ninetales", "九尾", ["FIRE"], "KANTO_FAMILY_037"],
  [39, "Jigglypuff", "胖丁", ["NORMAL", "FAIRY"], "KANTO_FAMILY_039"],
  [40, "Wigglytuff", "胖可丁", ["NORMAL", "FAIRY"], "KANTO_FAMILY_039"],
  [41, "Zubat", "超音蝠", ["POISON", "FLYING"], "KANTO_FAMILY_041"],
  [42, "Golbat", "大嘴蝠", ["POISON", "FLYING"], "KANTO_FAMILY_041"],
  [43, "Oddish", "走路草", ["GRASS", "POISON"], "KANTO_FAMILY_043"],
  [44, "Gloom", "臭臭花", ["GRASS", "POISON"], "KANTO_FAMILY_043"],
  [45, "Vileplume", "霸王花", ["GRASS", "POISON"], "KANTO_FAMILY_043"],
  [46, "Paras", "派拉斯", ["BUG", "GRASS"], "KANTO_FAMILY_046"],
  [47, "Parasect", "派拉斯特", ["BUG", "GRASS"], "KANTO_FAMILY_046"],
  [48, "Venonat", "毛球", ["BUG", "POISON"], "KANTO_FAMILY_048"],
  [49, "Venomoth", "摩魯蛾", ["BUG", "POISON"], "KANTO_FAMILY_048"],
  [50, "Diglett", "地鼠", ["GROUND"], "KANTO_FAMILY_050"],
  [51, "Dugtrio", "三地鼠", ["GROUND"], "KANTO_FAMILY_050"],
  [52, "Meowth", "喵喵", ["NORMAL"], "KANTO_FAMILY_052"],
  [53, "Persian", "貓老大", ["NORMAL"], "KANTO_FAMILY_052"],
  [54, "Psyduck", "可達鴨", ["WATER"], "KANTO_FAMILY_054"],
  [55, "Golduck", "哥達鴨", ["WATER"], "KANTO_FAMILY_054"],
  [56, "Mankey", "猴怪", ["FIGHTING"], "KANTO_FAMILY_056"],
  [57, "Primeape", "火爆猴", ["FIGHTING"], "KANTO_FAMILY_056"],
  [58, "Growlithe", "卡蒂狗", ["FIRE"], "KANTO_FAMILY_058"],
  [59, "Arcanine", "風速狗", ["FIRE"], "KANTO_FAMILY_058"],
  [60, "Poliwag", "蚊香蝌蚪", ["WATER"], "KANTO_FAMILY_060"],
] as const;

export const species031060: Species031060[] = speciesBase.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({
    dexNumber,
    nameEn,
    nameZhTw,
    types: [...types],
    familyKey,
  }),
);

const complete = "本批已納入此分支目前範圍內的完整進化關係。";
const outside = "可繼續進化至本批範圍外成員；完整家族補齊前先保留少量最佳候選。";

function kanto(
  dexNumber: number,
  options: Pick<Form031060, "evolvesFromFormId"> & {
    note?: string;
  } = {},
): Form031060 {
  const species = species031060.find((item) => item.dexNumber === dexNumber)!;
  return {
    id: `${String(dexNumber).padStart(3, "0")}-kanto`,
    dexNumber,
    formKey: "KANTO",
    formNameEn: "Kanto",
    formNameZhTw: "關都",
    regionKey: "KANTO",
    types: species.types,
    aliases: [species.nameEn, species.nameZhTw],
    evolvesFromFormId: options.evolvesFromFormId,
    evolutionFamilyNotesZhTw: options.note ?? complete,
  };
}

export const forms031060: Form031060[] = [
  kanto(31, { evolvesFromFormId: "030-kanto" }),
  kanto(32),
  kanto(33, { evolvesFromFormId: "032-kanto" }),
  kanto(34, { evolvesFromFormId: "033-kanto" }),
  kanto(35),
  kanto(36, { evolvesFromFormId: "035-kanto" }),
  kanto(37),
  kanto(38, { evolvesFromFormId: "037-kanto" }),
  {
    id: "037-alola",
    dexNumber: 37,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ICE"],
    aliases: ["Alolan Vulpix", "阿羅拉六尾"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "038-alola",
    dexNumber: 38,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ICE", "FAIRY"],
    aliases: ["Alolan Ninetales", "阿羅拉九尾"],
    evolvesFromFormId: "037-alola",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  kanto(39),
  kanto(40, { evolvesFromFormId: "039-kanto" }),
  kanto(41),
  kanto(42, { evolvesFromFormId: "041-kanto", note: outside }),
  kanto(43),
  kanto(44, { evolvesFromFormId: "043-kanto", note: outside }),
  kanto(45, { evolvesFromFormId: "044-kanto" }),
  kanto(46),
  kanto(47, { evolvesFromFormId: "046-kanto" }),
  kanto(48),
  kanto(49, { evolvesFromFormId: "048-kanto" }),
  kanto(50),
  kanto(51, { evolvesFromFormId: "050-kanto" }),
  {
    id: "050-alola",
    dexNumber: 50,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["GROUND", "STEEL"],
    aliases: ["Alolan Diglett", "阿羅拉地鼠"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "051-alola",
    dexNumber: 51,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["GROUND", "STEEL"],
    aliases: ["Alolan Dugtrio", "阿羅拉三地鼠"],
    evolvesFromFormId: "050-alola",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  kanto(52),
  kanto(53, { evolvesFromFormId: "052-kanto" }),
  {
    id: "052-alola",
    dexNumber: 52,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["DARK"],
    aliases: ["Alolan Meowth", "阿羅拉喵喵"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "053-alola",
    dexNumber: 53,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["DARK"],
    aliases: ["Alolan Persian", "阿羅拉貓老大"],
    evolvesFromFormId: "052-alola",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "052-galar",
    dexNumber: 52,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["STEEL"],
    aliases: ["Galarian Meowth", "伽勒爾喵喵"],
    evolutionFamilyNotesZhTw: outside,
  },
  kanto(54),
  kanto(55, { evolvesFromFormId: "054-kanto" }),
  kanto(56),
  kanto(57, { evolvesFromFormId: "056-kanto", note: outside }),
  kanto(58),
  kanto(59, { evolvesFromFormId: "058-kanto" }),
  {
    id: "058-hisui",
    dexNumber: 58,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["FIRE", "ROCK"],
    aliases: ["Hisuian Growlithe", "洗翠卡蒂狗"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "hisuian",
  },
  {
    id: "059-hisui",
    dexNumber: 59,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["FIRE", "ROCK"],
    aliases: ["Hisuian Arcanine", "洗翠風速狗"],
    evolvesFromFormId: "058-hisui",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "hisuian",
  },
  kanto(60, { note: outside }),
];

export const evolutionPairs031060 = forms031060
  .filter((form) => form.evolvesFromFormId)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const releasedShadowForms031060 = new Set([
  "031-kanto",
  "032-kanto",
  "033-kanto",
  "034-kanto",
  "037-kanto",
  "038-kanto",
  "037-alola",
  "038-alola",
  "041-kanto",
  "042-kanto",
  "043-kanto",
  "044-kanto",
  "045-kanto",
  "048-kanto",
  "049-kanto",
  "050-kanto",
  "051-kanto",
  "050-alola",
  "051-alola",
  "052-kanto",
  "053-kanto",
  "054-kanto",
  "055-kanto",
  "056-kanto",
  "057-kanto",
  "058-kanto",
  "059-kanto",
  "060-kanto",
]);

export const truncatedForms031060 = new Set(
  forms031060
    .filter((form) => form.evolutionFamilyNotesZhTw.includes("範圍外"))
    .map((form) => form.id),
);

export function pvpokeSpeciesId031060(form: Form031060, shadow: boolean) {
  const species = species031060.find((item) => item.dexNumber === form.dexNumber)!;
  const base = species.nameEn
    .toLowerCase()
    .replace("♂", "_male")
    .replace(/[^a-z0-9_]+/g, "");
  return `${base}${form.pvpokeSuffix ? `_${form.pvpokeSuffix}` : ""}${shadow ? "_shadow" : ""}`;
}
