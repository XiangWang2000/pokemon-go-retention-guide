export interface Species152181 {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  familyKey: string;
}

export interface Form152181 {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: "KANTO";
  types: string[];
  aliases: string[];
  evolvesFromFormId?: string;
  evolutionFamilyNotesZhTw: string;
}

export interface SpecialVariant152181 {
  id: string;
  formId: string;
  variantKey: "MEGA";
  released: boolean;
  nameZhTw: string;
}

const speciesBase = [
  [152, "Chikorita", "菊草葉", ["GRASS"], "JOHTO_FAMILY_152"],
  [153, "Bayleef", "月桂葉", ["GRASS"], "JOHTO_FAMILY_152"],
  [154, "Meganium", "大竺葵", ["GRASS"], "JOHTO_FAMILY_152"],
  [155, "Cyndaquil", "火球鼠", ["FIRE"], "JOHTO_FAMILY_155"],
  [156, "Quilava", "火岩鼠", ["FIRE"], "JOHTO_FAMILY_155"],
  [157, "Typhlosion", "火暴獸", ["FIRE"], "JOHTO_FAMILY_155"],
  [158, "Totodile", "小鋸鱷", ["WATER"], "JOHTO_FAMILY_158"],
  [159, "Croconaw", "藍鱷", ["WATER"], "JOHTO_FAMILY_158"],
  [160, "Feraligatr", "大力鱷", ["WATER"], "JOHTO_FAMILY_158"],
  [161, "Sentret", "尾立", ["NORMAL"], "JOHTO_FAMILY_161"],
  [162, "Furret", "大尾立", ["NORMAL"], "JOHTO_FAMILY_161"],
  [163, "Hoothoot", "咕咕", ["NORMAL", "FLYING"], "JOHTO_FAMILY_163"],
  [164, "Noctowl", "貓頭夜鷹", ["NORMAL", "FLYING"], "JOHTO_FAMILY_163"],
  [165, "Ledyba", "芭瓢蟲", ["BUG", "FLYING"], "JOHTO_FAMILY_165"],
  [166, "Ledian", "安瓢蟲", ["BUG", "FLYING"], "JOHTO_FAMILY_165"],
  [167, "Spinarak", "圓絲蛛", ["BUG", "POISON"], "JOHTO_FAMILY_167"],
  [168, "Ariados", "阿利多斯", ["BUG", "POISON"], "JOHTO_FAMILY_167"],
  [169, "Crobat", "叉字蝠", ["POISON", "FLYING"], "KANTO_FAMILY_041"],
  [170, "Chinchou", "燈籠魚", ["WATER", "ELECTRIC"], "JOHTO_FAMILY_170"],
  [171, "Lanturn", "電燈怪", ["WATER", "ELECTRIC"], "JOHTO_FAMILY_170"],
  [172, "Pichu", "皮丘", ["ELECTRIC"], "KANTO_FAMILY_025"],
  [173, "Cleffa", "皮寶寶", ["FAIRY"], "KANTO_FAMILY_035"],
  [174, "Igglybuff", "寶寶丁", ["NORMAL", "FAIRY"], "KANTO_FAMILY_039"],
  [175, "Togepi", "波克比", ["FAIRY"], "JOHTO_FAMILY_175"],
  [176, "Togetic", "波克基古", ["FAIRY", "FLYING"], "JOHTO_FAMILY_175"],
  [177, "Natu", "天然雀", ["PSYCHIC", "FLYING"], "JOHTO_FAMILY_177"],
  [178, "Xatu", "天然鳥", ["PSYCHIC", "FLYING"], "JOHTO_FAMILY_177"],
  [179, "Mareep", "咩利羊", ["ELECTRIC"], "JOHTO_FAMILY_179"],
  [180, "Flaaffy", "綿綿", ["ELECTRIC"], "JOHTO_FAMILY_179"],
  [181, "Ampharos", "電龍", ["ELECTRIC"], "JOHTO_FAMILY_179"],
] as const;

export const species152181: Species152181[] = speciesBase.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({
    dexNumber,
    nameEn,
    nameZhTw,
    types: [...types],
    familyKey,
  }),
);

const standardNote = "第 2 世代標準型態；普通、暗影、淨化與 Max 版本分開評估。";
const babyNote = "此為後來加入既有關都進化家族的寶寶寶可夢；不因圖鑑世代不同拆成新家族。";
const crobatNote =
  "正式接回 #041 超音蝠／#042 大嘴蝠家族；#169 叉字蝠為實際納入本批的後續進化，不再保留空白 stub。";
const togepiNote =
  "波克比可進化為波克基古；波克基古的後續 #468 波克基斯以正式 evolution stub 保留，尚不納入本批戰鬥版本。";
const ampharosNote =
  "電龍可進化為 Mega 電龍；Mega 與普通、暗影版本分開，且 Mega 電龍不可 Dynamax。";

function kanto(
  dexNumber: number,
  options: { evolvesFromFormId?: string; note?: string } = {},
): Form152181 {
  const species = species152181.find((item) => item.dexNumber === dexNumber)!;
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
    evolutionFamilyNotesZhTw: options.note ?? standardNote,
  };
}

export const forms152181: Form152181[] = [
  kanto(152),
  kanto(153, { evolvesFromFormId: "152-kanto" }),
  kanto(154, { evolvesFromFormId: "153-kanto" }),
  kanto(155),
  kanto(156, { evolvesFromFormId: "155-kanto" }),
  kanto(157, { evolvesFromFormId: "156-kanto" }),
  kanto(158),
  kanto(159, { evolvesFromFormId: "158-kanto" }),
  kanto(160, { evolvesFromFormId: "159-kanto" }),
  kanto(161),
  kanto(162, { evolvesFromFormId: "161-kanto" }),
  kanto(163),
  kanto(164, { evolvesFromFormId: "163-kanto" }),
  kanto(165),
  kanto(166, { evolvesFromFormId: "165-kanto" }),
  kanto(167),
  kanto(168, { evolvesFromFormId: "167-kanto" }),
  kanto(169, { evolvesFromFormId: "042-kanto", note: crobatNote }),
  kanto(170),
  kanto(171, { evolvesFromFormId: "170-kanto" }),
  { ...kanto(172, { note: babyNote }), evolvesFromFormId: undefined },
  { ...kanto(173, { note: babyNote }), evolvesFromFormId: undefined },
  { ...kanto(174, { note: babyNote }), evolvesFromFormId: undefined },
  kanto(175, { note: togepiNote }),
  kanto(176, { evolvesFromFormId: "175-kanto", note: togepiNote }),
  kanto(177),
  kanto(178, { evolvesFromFormId: "177-kanto" }),
  kanto(179),
  kanto(180, { evolvesFromFormId: "179-kanto" }),
  kanto(181, { evolvesFromFormId: "180-kanto", note: ampharosNote }),
];

export const evolutionPairs152181 = [
  ["152-kanto", "153-kanto"],
  ["153-kanto", "154-kanto"],
  ["155-kanto", "156-kanto"],
  ["156-kanto", "157-kanto"],
  ["158-kanto", "159-kanto"],
  ["159-kanto", "160-kanto"],
  ["161-kanto", "162-kanto"],
  ["163-kanto", "164-kanto"],
  ["165-kanto", "166-kanto"],
  ["167-kanto", "168-kanto"],
  ["042-kanto", "169-kanto"],
  ["170-kanto", "171-kanto"],
  ["172-kanto", "025-kanto"],
  ["173-kanto", "035-kanto"],
  ["174-kanto", "039-kanto"],
  ["175-kanto", "176-kanto"],
  ["177-kanto", "178-kanto"],
  ["179-kanto", "180-kanto"],
  ["180-kanto", "181-kanto"],
] as const;

export const releasedShadowForms152181 = new Set([
  "152-kanto",
  "153-kanto",
  "154-kanto",
  "155-kanto",
  "156-kanto",
  "157-kanto",
  "158-kanto",
  "159-kanto",
  "160-kanto",
  "163-kanto",
  "164-kanto",
  "165-kanto",
  "166-kanto",
  "169-kanto",
  "177-kanto",
  "178-kanto",
  "179-kanto",
  "180-kanto",
  "181-kanto",
]);

export const releasedMegaForms152181 = new Set(["181-kanto"]);
export const releasedDynamaxForms152181 = new Set<string>();
export const releasedGigantamaxForms152181 = new Set<string>();

export const specialVariants152181: SpecialVariant152181[] = [
  {
    id: "181-kanto-mega",
    formId: "181-kanto",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega 電龍",
  },
];

export const truncatedForms152181 = new Set(["176-kanto"]);

export function pvpokeSpeciesId152181(form: Form152181, shadow: boolean) {
  const species = species152181.find((item) => item.dexNumber === form.dexNumber)!;
  const base = species.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${base}${shadow ? "_shadow" : ""}`;
}
