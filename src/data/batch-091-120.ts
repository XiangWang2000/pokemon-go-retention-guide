import type { RegionKey } from "./region-key";

export interface Species091120 {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  familyKey: string;
}

export interface Form091120 {
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
  pvpokeSuffix?: "alolan" | "galarian" | "hisuian";
}

const speciesBase = [
  [91, "Cloyster", "刺甲貝", ["WATER", "ICE"], "KANTO_FAMILY_090"],
  [92, "Gastly", "鬼斯", ["GHOST", "POISON"], "KANTO_FAMILY_092"],
  [93, "Haunter", "鬼斯通", ["GHOST", "POISON"], "KANTO_FAMILY_092"],
  [94, "Gengar", "耿鬼", ["GHOST", "POISON"], "KANTO_FAMILY_092"],
  [95, "Onix", "大岩蛇", ["ROCK", "GROUND"], "KANTO_FAMILY_095"],
  [96, "Drowzee", "催眠貘", ["PSYCHIC"], "KANTO_FAMILY_096"],
  [97, "Hypno", "引夢貘人", ["PSYCHIC"], "KANTO_FAMILY_096"],
  [98, "Krabby", "大鉗蟹", ["WATER"], "KANTO_FAMILY_098"],
  [99, "Kingler", "巨鉗蟹", ["WATER"], "KANTO_FAMILY_098"],
  [100, "Voltorb", "霹靂電球", ["ELECTRIC"], "KANTO_FAMILY_100"],
  [101, "Electrode", "頑皮雷彈", ["ELECTRIC"], "KANTO_FAMILY_100"],
  [102, "Exeggcute", "蛋蛋", ["GRASS", "PSYCHIC"], "KANTO_FAMILY_102"],
  [103, "Exeggutor", "椰蛋樹", ["GRASS", "PSYCHIC"], "KANTO_FAMILY_102"],
  [104, "Cubone", "卡拉卡拉", ["GROUND"], "KANTO_FAMILY_104"],
  [105, "Marowak", "嘎啦嘎啦", ["GROUND"], "KANTO_FAMILY_104"],
  [106, "Hitmonlee", "飛腿郎", ["FIGHTING"], "KANTO_FAMILY_236"],
  [107, "Hitmonchan", "快拳郎", ["FIGHTING"], "KANTO_FAMILY_236"],
  [108, "Lickitung", "大舌頭", ["NORMAL"], "KANTO_FAMILY_108"],
  [109, "Koffing", "瓦斯彈", ["POISON"], "KANTO_FAMILY_109"],
  [110, "Weezing", "雙彈瓦斯", ["POISON"], "KANTO_FAMILY_109"],
  [111, "Rhyhorn", "獨角犀牛", ["GROUND", "ROCK"], "KANTO_FAMILY_111"],
  [112, "Rhydon", "鑽角犀獸", ["GROUND", "ROCK"], "KANTO_FAMILY_111"],
  [113, "Chansey", "吉利蛋", ["NORMAL"], "KANTO_FAMILY_113"],
  [114, "Tangela", "蔓藤怪", ["GRASS"], "KANTO_FAMILY_114"],
  [115, "Kangaskhan", "袋獸", ["NORMAL"], "KANTO_FAMILY_115"],
  [116, "Horsea", "墨海馬", ["WATER"], "KANTO_FAMILY_116"],
  [117, "Seadra", "海刺龍", ["WATER"], "KANTO_FAMILY_116"],
  [118, "Goldeen", "角金魚", ["WATER"], "KANTO_FAMILY_118"],
  [119, "Seaking", "金魚王", ["WATER"], "KANTO_FAMILY_118"],
  [120, "Staryu", "海星星", ["WATER"], "KANTO_FAMILY_120"],
] as const;

export const species091120: Species091120[] = speciesBase.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({
    dexNumber,
    nameEn,
    nameZhTw,
    types: [...types],
    familyKey,
  }),
);

const complete = "此地區分支已完整納入 #001～#120；是否保留由實際用途決定。";
const shellderComplete = "已接回 #090 大舌貝並補上 #091 刺甲貝；此分支已可執行清包結論。";
const eventRegional =
  "地區末階曾在限定活動提供特殊進化；不把一般常駐進化路徑與活動限定地區路徑混用。";
const futureImportant =
  "重要後續進化仍在 #120 之後；為避免誤傳，暫時只留一隻最佳進化候選，不需保留全部重複。";

function kanto(
  dexNumber: number,
  options: Pick<Form091120, "evolvesFromFormId"> & { note?: string } = {},
): Form091120 {
  const species = species091120.find((item) => item.dexNumber === dexNumber)!;
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

export const forms091120: Form091120[] = [
  kanto(91, { evolvesFromFormId: "090-kanto", note: shellderComplete }),
  kanto(92),
  kanto(93, { evolvesFromFormId: "092-kanto" }),
  kanto(94, { evolvesFromFormId: "093-kanto" }),
  kanto(95, { note: futureImportant }),
  kanto(96),
  kanto(97, { evolvesFromFormId: "096-kanto" }),
  kanto(98),
  kanto(99, { evolvesFromFormId: "098-kanto" }),
  kanto(100),
  kanto(101, { evolvesFromFormId: "100-kanto" }),
  {
    id: "100-hisui",
    dexNumber: 100,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["ELECTRIC", "GRASS"],
    aliases: ["Hisuian Voltorb", "洗翠霹靂電球"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "hisuian",
  },
  {
    id: "101-hisui",
    dexNumber: 101,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["ELECTRIC", "GRASS"],
    aliases: ["Hisuian Electrode", "洗翠頑皮雷彈"],
    evolvesFromFormId: "100-hisui",
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "hisuian",
  },
  kanto(102, { note: eventRegional }),
  kanto(103, { evolvesFromFormId: "102-kanto", note: eventRegional }),
  {
    id: "103-alola",
    dexNumber: 103,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["GRASS", "DRAGON"],
    aliases: ["Alolan Exeggutor", "阿羅拉椰蛋樹"],
    evolutionFamilyNotesZhTw: eventRegional,
    pvpokeSuffix: "alolan",
  },
  kanto(104, { note: eventRegional }),
  kanto(105, { evolvesFromFormId: "104-kanto", note: eventRegional }),
  {
    id: "105-alola",
    dexNumber: 105,
    formKey: "ALOLA",
    formNameEn: "Alolan",
    formNameZhTw: "阿羅拉",
    regionKey: "ALOLA",
    types: ["FIRE", "GHOST"],
    aliases: ["Alolan Marowak", "阿羅拉嘎啦嘎啦"],
    evolutionFamilyNotesZhTw: eventRegional,
    pvpokeSuffix: "alolan",
  },
  kanto(106),
  kanto(107),
  kanto(108, { note: futureImportant }),
  kanto(109, { note: eventRegional }),
  kanto(110, { evolvesFromFormId: "109-kanto", note: eventRegional }),
  {
    id: "110-galar",
    dexNumber: 110,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["POISON", "FAIRY"],
    aliases: ["Galarian Weezing", "伽勒爾雙彈瓦斯"],
    evolutionFamilyNotesZhTw: eventRegional,
    pvpokeSuffix: "galarian",
  },
  kanto(111, { note: futureImportant }),
  kanto(112, { evolvesFromFormId: "111-kanto", note: futureImportant }),
  kanto(113, { note: futureImportant }),
  kanto(114, { note: futureImportant }),
  kanto(115),
  kanto(116, { note: futureImportant }),
  kanto(117, { evolvesFromFormId: "116-kanto", note: futureImportant }),
  kanto(118),
  kanto(119, { evolvesFromFormId: "118-kanto" }),
  kanto(120, { note: futureImportant }),
];

export const evolutionPairs091120 = forms091120
  .filter((form) => form.evolvesFromFormId)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const eventEvolutionPairs091120 = [
  ["102-kanto", "103-alola"],
  ["104-kanto", "105-alola"],
  ["109-kanto", "110-galar"],
] as const;

export const officialEventEvolutionEvidence091120 = [
  { sourceId: "OFF-EVENT-ALOLA-EXEGGUTOR-2024", formId: "102-kanto" },
  { sourceId: "OFF-EVENT-ALOLA-EXEGGUTOR-2024", formId: "103-alola" },
  { sourceId: "OFF-ALOLA-TO-ALOLA-2022", formId: "104-kanto" },
  { sourceId: "OFF-ALOLA-TO-ALOLA-2022", formId: "105-alola" },
  { sourceId: "OFF-LEGENDARY-HEROES-2024", formId: "109-kanto" },
  { sourceId: "OFF-LEGENDARY-HEROES-2024", formId: "110-galar" },
] as const;

export const conditionalKeepOverrides091120 = new Map([
  [
    "094-kanto-normal",
    {
      ruleKey: "MEGA_BASE_CANDIDATE",
      reason: "關都耿鬼是已開放 Mega 的基底個體；只留實際要投入的 Mega 候選，其餘普通重複可傳。",
    },
  ],
  [
    "115-kanto-normal",
    {
      ruleKey: "MEGA_BASE_CANDIDATE",
      reason: "關都袋獸是已開放 Mega 的基底個體；只留實際要投入的 Mega 候選，其餘普通重複可傳。",
    },
  ],
  [
    "120-kanto-shadow",
    {
      ruleKey: "CROSS_BATCH_PVP_EVOLUTION",
      reason:
        "暗影海星星可進化為固定 PvPoke snapshot 中 Ultra League Overall #170 的暗影寶石海星；只留少量進化候選，暗影 IV 採寬鬆標準。",
    },
  ],
]);

// 官方頁或固定 PvPoke snapshot 已確認的暗影物種／進化線；未列者不自行推定已開放。
export const releasedShadowForms091120 = new Set([
  "091-kanto",
  "092-kanto",
  "093-kanto",
  "094-kanto",
  "095-kanto",
  "096-kanto",
  "097-kanto",
  "098-kanto",
  "099-kanto",
  "100-kanto",
  "101-kanto",
  "102-kanto",
  "103-kanto",
  "103-alola",
  "104-kanto",
  "105-kanto",
  "105-alola",
  "106-kanto",
  "107-kanto",
  "109-kanto",
  "110-kanto",
  "110-galar",
  "111-kanto",
  "112-kanto",
  "114-kanto",
  "116-kanto",
  "117-kanto",
  "120-kanto",
]);

export const truncatedForms091120 = new Set([
  "095-kanto",
  "108-kanto",
  "111-kanto",
  "112-kanto",
  "113-kanto",
  "114-kanto",
  "116-kanto",
  "117-kanto",
  "120-kanto",
]);

export function pvpokeSpeciesId091120(form: Form091120, shadow: boolean) {
  const species = species091120.find((item) => item.dexNumber === form.dexNumber)!;
  const base = species.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${base}${form.pvpokeSuffix ? `_${form.pvpokeSuffix}` : ""}${shadow ? "_shadow" : ""}`;
}
