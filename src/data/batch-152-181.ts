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
  regionKey: "JOHTO";
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

function johto(
  dexNumber: number,
  options: { evolvesFromFormId?: string; note?: string } = {},
): Form152181 {
  const species = species152181.find((item) => item.dexNumber === dexNumber)!;
  return {
    id: `${String(dexNumber).padStart(3, "0")}-johto`,
    dexNumber,
    formKey: "JOHTO",
    formNameEn: "Johto",
    formNameZhTw: "城都",
    regionKey: "JOHTO",
    types: species.types,
    aliases: [species.nameEn, species.nameZhTw],
    evolvesFromFormId: options.evolvesFromFormId,
    evolutionFamilyNotesZhTw: options.note ?? standardNote,
  };
}

export const forms152181: Form152181[] = [
  johto(152),
  johto(153, { evolvesFromFormId: "152-johto" }),
  johto(154, { evolvesFromFormId: "153-johto" }),
  johto(155),
  johto(156, { evolvesFromFormId: "155-johto" }),
  johto(157, { evolvesFromFormId: "156-johto" }),
  johto(158),
  johto(159, { evolvesFromFormId: "158-johto" }),
  johto(160, { evolvesFromFormId: "159-johto" }),
  johto(161),
  johto(162, { evolvesFromFormId: "161-johto" }),
  johto(163),
  johto(164, { evolvesFromFormId: "163-johto" }),
  johto(165),
  johto(166, { evolvesFromFormId: "165-johto" }),
  johto(167),
  johto(168, { evolvesFromFormId: "167-johto" }),
  johto(169, { evolvesFromFormId: "042-kanto", note: crobatNote }),
  johto(170),
  johto(171, { evolvesFromFormId: "170-johto" }),
  { ...johto(172, { note: babyNote }), evolvesFromFormId: undefined },
  { ...johto(173, { note: babyNote }), evolvesFromFormId: undefined },
  { ...johto(174, { note: babyNote }), evolvesFromFormId: undefined },
  johto(175, { note: togepiNote }),
  johto(176, { evolvesFromFormId: "175-johto", note: togepiNote }),
  johto(177),
  johto(178, { evolvesFromFormId: "177-johto" }),
  johto(179),
  johto(180, { evolvesFromFormId: "179-johto" }),
  johto(181, { evolvesFromFormId: "180-johto", note: ampharosNote }),
];

export const evolutionPairs152181 = [
  ["152-johto", "153-johto"],
  ["153-johto", "154-johto"],
  ["155-johto", "156-johto"],
  ["156-johto", "157-johto"],
  ["158-johto", "159-johto"],
  ["159-johto", "160-johto"],
  ["161-johto", "162-johto"],
  ["163-johto", "164-johto"],
  ["165-johto", "166-johto"],
  ["167-johto", "168-johto"],
  ["042-kanto", "169-johto"],
  ["170-johto", "171-johto"],
  ["172-johto", "025-kanto"],
  ["173-johto", "035-kanto"],
  ["174-johto", "039-kanto"],
  ["175-johto", "176-johto"],
  ["177-johto", "178-johto"],
  ["179-johto", "180-johto"],
  ["180-johto", "181-johto"],
] as const;

export const releasedShadowForms152181 = new Set([
  "152-johto",
  "153-johto",
  "154-johto",
  "155-johto",
  "156-johto",
  "157-johto",
  "158-johto",
  "159-johto",
  "160-johto",
  "163-johto",
  "164-johto",
  "165-johto",
  "166-johto",
  "169-johto",
  "177-johto",
  "178-johto",
  "179-johto",
  "180-johto",
  "181-johto",
]);

export const releasedMegaForms152181 = new Set(["181-johto"]);
export const releasedDynamaxForms152181 = new Set<string>();
export const releasedGigantamaxForms152181 = new Set<string>();

export const specialVariants152181: SpecialVariant152181[] = [
  {
    id: "181-johto-mega",
    formId: "181-johto",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega 電龍",
  },
];

export const truncatedForms152181 = new Set(["176-johto"]);

export function pvpokeSpeciesId152181(form: Form152181, shadow: boolean) {
  const species = species152181.find((item) => item.dexNumber === form.dexNumber)!;
  const base = species.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${base}${shadow ? "_shadow" : ""}`;
}
