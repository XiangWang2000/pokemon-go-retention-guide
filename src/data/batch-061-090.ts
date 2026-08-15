import type { RegionKey } from "./region-key";

export interface Species061090 {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  familyKey: string;
}

export interface Form061090 {
  id: string;
  dexNumber: number;
  formKey: "KANTO" | "ALOLA" | "GALAR";
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  types: string[];
  aliases: string[];
  evolvesFromFormId?: string;
  evolutionFamilyNotesZhTw: string;
  pvpokeSuffix?: "alolan" | "galarian";
}

const speciesBase = [
  [61, "Poliwhirl", "蚊香君", ["WATER"], "KANTO_FAMILY_060"],
  [62, "Poliwrath", "蚊香泳士", ["WATER", "FIGHTING"], "KANTO_FAMILY_060"],
  [63, "Abra", "凱西", ["PSYCHIC"], "KANTO_FAMILY_063"],
  [64, "Kadabra", "勇基拉", ["PSYCHIC"], "KANTO_FAMILY_063"],
  [65, "Alakazam", "胡地", ["PSYCHIC"], "KANTO_FAMILY_063"],
  [66, "Machop", "腕力", ["FIGHTING"], "KANTO_FAMILY_066"],
  [67, "Machoke", "豪力", ["FIGHTING"], "KANTO_FAMILY_066"],
  [68, "Machamp", "怪力", ["FIGHTING"], "KANTO_FAMILY_066"],
  [69, "Bellsprout", "喇叭芽", ["GRASS", "POISON"], "KANTO_FAMILY_069"],
  [70, "Weepinbell", "口呆花", ["GRASS", "POISON"], "KANTO_FAMILY_069"],
  [71, "Victreebel", "大食花", ["GRASS", "POISON"], "KANTO_FAMILY_069"],
  [72, "Tentacool", "瑪瑙水母", ["WATER", "POISON"], "KANTO_FAMILY_072"],
  [73, "Tentacruel", "毒刺水母", ["WATER", "POISON"], "KANTO_FAMILY_072"],
  [74, "Geodude", "小拳石", ["ROCK", "GROUND"], "KANTO_FAMILY_074"],
  [75, "Graveler", "隆隆石", ["ROCK", "GROUND"], "KANTO_FAMILY_074"],
  [76, "Golem", "隆隆岩", ["ROCK", "GROUND"], "KANTO_FAMILY_074"],
  [77, "Ponyta", "小火馬", ["FIRE"], "KANTO_FAMILY_077"],
  [78, "Rapidash", "烈焰馬", ["FIRE"], "KANTO_FAMILY_077"],
  [79, "Slowpoke", "呆呆獸", ["WATER", "PSYCHIC"], "KANTO_FAMILY_079"],
  [80, "Slowbro", "呆殼獸", ["WATER", "PSYCHIC"], "KANTO_FAMILY_079"],
  [81, "Magnemite", "小磁怪", ["ELECTRIC", "STEEL"], "KANTO_FAMILY_081"],
  [82, "Magneton", "三合一磁怪", ["ELECTRIC", "STEEL"], "KANTO_FAMILY_081"],
  [83, "Farfetch'd", "大蔥鴨", ["NORMAL", "FLYING"], "KANTO_FAMILY_083"],
  [84, "Doduo", "嘟嘟", ["NORMAL", "FLYING"], "KANTO_FAMILY_084"],
  [85, "Dodrio", "嘟嘟利", ["NORMAL", "FLYING"], "KANTO_FAMILY_084"],
  [86, "Seel", "小海獅", ["WATER"], "KANTO_FAMILY_086"],
  [87, "Dewgong", "白海獅", ["WATER", "ICE"], "KANTO_FAMILY_086"],
  [88, "Grimer", "臭泥", ["POISON"], "KANTO_FAMILY_088"],
  [89, "Muk", "臭臭泥", ["POISON"], "KANTO_FAMILY_088"],
  [90, "Shellder", "大舌貝", ["WATER"], "KANTO_FAMILY_090"],
] as const;

export const species061090: Species061090[] = speciesBase.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({
    dexNumber,
    nameEn,
    nameZhTw,
    types: [...types],
    familyKey,
  }),
);

const complete = "此地區分支已完整納入 #001～#090；是否保留由實際用途決定。";
const poliwagBranch =
  "已接回 #060 蚊香蝌蚪；#186 蚊香蛙皇仍在後續批次，但本批已有蚊香泳士可執行結論。";
const slowkingBranch =
  "呆殼獸分支已納入；#199 呆呆王仍在後續批次，因此另留一隻符合未來分支用途的最佳候選即可。";
const futureImportant =
  "重要末階仍在 #090 之後；為避免誤傳，暫時只留一隻最佳進化候選，不需保留全部重複。";

function kanto(
  dexNumber: number,
  options: Pick<Form061090, "evolvesFromFormId"> & { note?: string } = {},
): Form061090 {
  const species = species061090.find((item) => item.dexNumber === dexNumber)!;
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

export const forms061090: Form061090[] = [
  kanto(61, { evolvesFromFormId: "060-kanto", note: poliwagBranch }),
  kanto(62, { evolvesFromFormId: "061-kanto", note: poliwagBranch }),
  kanto(63),
  kanto(64, { evolvesFromFormId: "063-kanto" }),
  kanto(65, { evolvesFromFormId: "064-kanto" }),
  kanto(66),
  kanto(67, { evolvesFromFormId: "066-kanto" }),
  kanto(68, { evolvesFromFormId: "067-kanto" }),
  kanto(69),
  kanto(70, { evolvesFromFormId: "069-kanto" }),
  kanto(71, { evolvesFromFormId: "070-kanto" }),
  kanto(72),
  kanto(73, { evolvesFromFormId: "072-kanto" }),
  kanto(74),
  kanto(75, { evolvesFromFormId: "074-kanto" }),
  kanto(76, { evolvesFromFormId: "075-kanto" }),
  {
    id: "074-alola",
    dexNumber: 74,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ROCK", "ELECTRIC"],
    aliases: ["Alolan Geodude", "阿羅拉小拳石"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "075-alola",
    dexNumber: 75,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ROCK", "ELECTRIC"],
    aliases: ["Alolan Graveler", "阿羅拉隆隆石"],
    evolvesFromFormId: "074-alola",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "076-alola",
    dexNumber: 76,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["ROCK", "ELECTRIC"],
    aliases: ["Alolan Golem", "阿羅拉隆隆岩"],
    evolvesFromFormId: "075-alola",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  kanto(77),
  kanto(78, { evolvesFromFormId: "077-kanto" }),
  {
    id: "077-galar",
    dexNumber: 77,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["PSYCHIC"],
    aliases: ["Galarian Ponyta", "伽勒爾小火馬"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "galarian",
  },
  {
    id: "078-galar",
    dexNumber: 78,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["PSYCHIC", "FAIRY"],
    aliases: ["Galarian Rapidash", "伽勒爾烈焰馬"],
    evolvesFromFormId: "077-galar",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "galarian",
  },
  kanto(79, { note: slowkingBranch }),
  kanto(80, { evolvesFromFormId: "079-kanto", note: slowkingBranch }),
  {
    id: "079-galar",
    dexNumber: 79,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["PSYCHIC"],
    aliases: ["Galarian Slowpoke", "伽勒爾呆呆獸"],
    evolutionFamilyNotesZhTw: slowkingBranch,
    pvpokeSuffix: "galarian",
  },
  {
    id: "080-galar",
    dexNumber: 80,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["POISON", "PSYCHIC"],
    aliases: ["Galarian Slowbro", "伽勒爾呆殼獸"],
    evolvesFromFormId: "079-galar",
    evolutionFamilyNotesZhTw: slowkingBranch,
    pvpokeSuffix: "galarian",
  },
  kanto(81, { note: futureImportant }),
  kanto(82, { evolvesFromFormId: "081-kanto", note: futureImportant }),
  kanto(83),
  {
    id: "083-galar",
    dexNumber: 83,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["FIGHTING"],
    aliases: ["Galarian Farfetch'd", "伽勒爾大蔥鴨"],
    evolutionFamilyNotesZhTw: futureImportant,
    pvpokeSuffix: "galarian",
  },
  kanto(84),
  kanto(85, { evolvesFromFormId: "084-kanto" }),
  kanto(86),
  kanto(87, { evolvesFromFormId: "086-kanto" }),
  kanto(88),
  kanto(89, { evolvesFromFormId: "088-kanto" }),
  {
    id: "088-alola",
    dexNumber: 88,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["POISON", "DARK"],
    aliases: ["Alolan Grimer", "阿羅拉臭泥"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  {
    id: "089-alola",
    dexNumber: 89,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["POISON", "DARK"],
    aliases: ["Alolan Muk", "阿羅拉臭臭泥"],
    evolvesFromFormId: "088-alola",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "alolan",
  },
  kanto(90, { note: futureImportant }),
];

export const evolutionPairs061090 = forms061090
  .filter((form) => form.evolvesFromFormId)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const releasedShadowForms061090 = new Set([
  "061-kanto",
  "062-kanto",
  "063-kanto",
  "064-kanto",
  "065-kanto",
  "066-kanto",
  "067-kanto",
  "068-kanto",
  "069-kanto",
  "070-kanto",
  "071-kanto",
  "072-kanto",
  "073-kanto",
  "074-kanto",
  "075-kanto",
  "076-kanto",
  "074-alola",
  "075-alola",
  "076-alola",
  "077-kanto",
  "078-kanto",
  "079-kanto",
  "080-kanto",
  "081-kanto",
  "082-kanto",
  "086-kanto",
  "087-kanto",
  "088-kanto",
  "089-kanto",
  "088-alola",
  "089-alola",
  "090-kanto",
]);

export const truncatedForms061090 = new Set([
  "061-kanto",
  "062-kanto",
  "079-kanto",
  "080-kanto",
  "079-galar",
  "080-galar",
  "081-kanto",
  "082-kanto",
  "083-galar",
  "090-kanto",
]);

export function pvpokeSpeciesId061090(form: Form061090, shadow: boolean) {
  const species = species061090.find((item) => item.dexNumber === form.dexNumber)!;
  const base = species.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${base}${form.pvpokeSuffix ? `_${form.pvpokeSuffix}` : ""}${shadow ? "_shadow" : ""}`;
}
