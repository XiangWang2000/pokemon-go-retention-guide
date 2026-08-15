import type { RegionKey } from "./region-key";

export type { RegionKey } from "./region-key";
export type PveUseLevel = "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE";

export interface Gen2Species242251 { dexNumber: number; nameEn: string; nameZhTw: string; types: string[]; familyKey: string; }
export interface Form242251 { id: string; dexNumber: number; formKey: string; formNameEn: string; formNameZhTw: string; regionKey: RegionKey; types: string[]; aliases: string[]; evolvesFromFormId?: string | null; evolutionFamilyNotesZhTw: string; isStub?: boolean; includeVariants?: boolean; }
export interface SpecialVariant242251 { id: string; formId: string; variantKey: "MEGA"; released: boolean; nameZhTw: string; }

export const species242251: Gen2Species242251[] = [
  {
    "dexNumber": 242,
    "nameEn": "blissey",
    "nameZhTw": "幸福蛋",
    "types": [
      "NORMAL"
    ],
    "familyKey": "KANTO_FAMILY_113"
  },
  {
    "dexNumber": 243,
    "nameEn": "raikou",
    "nameZhTw": "雷公",
    "types": [
      "ELECTRIC"
    ],
    "familyKey": "JOHTO_FAMILY_243"
  },
  {
    "dexNumber": 244,
    "nameEn": "entei",
    "nameZhTw": "炎帝",
    "types": [
      "FIRE"
    ],
    "familyKey": "JOHTO_FAMILY_244"
  },
  {
    "dexNumber": 245,
    "nameEn": "suicune",
    "nameZhTw": "水君",
    "types": [
      "WATER"
    ],
    "familyKey": "JOHTO_FAMILY_245"
  },
  {
    "dexNumber": 246,
    "nameEn": "larvitar",
    "nameZhTw": "幼基拉斯",
    "types": [
      "ROCK",
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_246"
  },
  {
    "dexNumber": 247,
    "nameEn": "pupitar",
    "nameZhTw": "沙基拉斯",
    "types": [
      "ROCK",
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_246"
  },
  {
    "dexNumber": 248,
    "nameEn": "tyranitar",
    "nameZhTw": "班基拉斯",
    "types": [
      "ROCK",
      "DARK"
    ],
    "familyKey": "JOHTO_FAMILY_246"
  },
  {
    "dexNumber": 249,
    "nameEn": "lugia",
    "nameZhTw": "洛奇亞",
    "types": [
      "PSYCHIC",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_249"
  },
  {
    "dexNumber": 250,
    "nameEn": "ho-oh",
    "nameZhTw": "鳳王",
    "types": [
      "FIRE",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_250"
  },
  {
    "dexNumber": 251,
    "nameEn": "celebi",
    "nameZhTw": "時拉比",
    "types": [
      "PSYCHIC",
      "GRASS"
    ],
    "familyKey": "JOHTO_FAMILY_251"
  }
];
export const forms242251: Form242251[] = [
  {
    "id": "242-johto",
    "dexNumber": 242,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "blissey",
      "幸福蛋"
    ],
    "evolvesFromFormId": "113-kanto",
    "evolutionFamilyNotesZhTw": "幸福蛋由既有吉利蛋家族進化；正式城都成員不因跨世代圖鑑號拆成新家族。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "243-johto",
    "dexNumber": 243,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ELECTRIC"
    ],
    "aliases": [
      "raikou",
      "雷公"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；已依來源核對 Shadow／Max 發布狀態，不把未列出的 Mega 當成已推出。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "244-johto",
    "dexNumber": 244,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIRE"
    ],
    "aliases": [
      "entei",
      "炎帝"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；已依來源核對 Shadow／Max 發布狀態，不把未列出的 Mega 當成已推出。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "245-johto",
    "dexNumber": 245,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER"
    ],
    "aliases": [
      "suicune",
      "水君"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；已依來源核對 Shadow／Max 發布狀態，不把未列出的 Mega 當成已推出。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "246-johto",
    "dexNumber": 246,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ROCK",
      "GROUND"
    ],
    "aliases": [
      "larvitar",
      "幼基拉斯"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "幼基拉斯、沙基拉斯與班基拉斯為同一進化家族；前階保留僅為後續進化或個體培育需求。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "247-johto",
    "dexNumber": 247,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ROCK",
      "GROUND"
    ],
    "aliases": [
      "pupitar",
      "沙基拉斯"
    ],
    "evolvesFromFormId": "246-johto",
    "evolutionFamilyNotesZhTw": "幼基拉斯進化而來；與班基拉斯共用家族評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "248-johto",
    "dexNumber": 248,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ROCK",
      "DARK"
    ],
    "aliases": [
      "tyranitar",
      "班基拉斯"
    ],
    "evolvesFromFormId": "247-johto",
    "evolutionFamilyNotesZhTw": "班基拉斯的普通、暗影、Mega 與 Max 用途分開評估；重點來源不代表全家族都必留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "249-johto",
    "dexNumber": 249,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "PSYCHIC",
      "FLYING"
    ],
    "aliases": [
      "lugia",
      "洛奇亞"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "洛奇亞的 PvP、PvE 與 Max 用途分開評估；沒有將未實裝的型態視為已發布。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "250-johto",
    "dexNumber": 250,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIRE",
      "FLYING"
    ],
    "aliases": [
      "ho-oh",
      "鳳王"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "鳳王的 PvP、PvE 與 Max 用途分開評估；沒有將未實裝的型態視為已發布。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "251-johto",
    "dexNumber": 251,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "PSYCHIC",
      "GRASS"
    ],
    "aliases": [
      "celebi",
      "時拉比"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "時拉比以 PvP、活動招式與特殊收集價值分開評估；不因傳奇身分自動設為必留。",
    "isStub": false,
    "includeVariants": true
  }
];
export const evolutionPairs242251: readonly [string,string][] = [
  [
    "113-kanto",
    "242-johto"
  ],
  [
    "246-johto",
    "247-johto"
  ],
  [
    "247-johto",
    "248-johto"
  ]
];
export const releasedShadowForms242251 = new Set<string>([
  "243-johto",
  "244-johto",
  "245-johto",
  "246-johto",
  "247-johto",
  "248-johto",
  "249-johto",
  "250-johto"
]);
export const releasedMegaForms242251 = new Set<string>([
  "248-johto"
]);
export const releasedDynamaxForms242251 = new Set<string>([
  "242-johto",
  "243-johto",
  "244-johto",
  "245-johto",
  "249-johto",
  "250-johto"
]);
export const releasedGigantamaxForms242251 = new Set<string>();
export const specialVariants242251: SpecialVariant242251[] = [
  {
    "id": "248-johto-mega",
    "formId": "248-johto",
    "variantKey": "MEGA",
    "released": true,
    "nameZhTw": "Mega 班基拉斯"
  }
];
export const pveUseLevels242251: Record<string, PveUseLevel> = {
  "242-johto": "SPECIAL_USE",
  "243-johto": "CORE_INVESTMENT",
  "244-johto": "CORE_INVESTMENT",
  "245-johto": "SPECIAL_USE",
  "248-johto": "CORE_INVESTMENT",
  "249-johto": "SPECIAL_USE",
  "250-johto": "CORE_INVESTMENT"
};
export const truncatedForms242251 = new Set<string>();
export const migratedStubIds242251 = new Set<string>([
  "242-kanto"
]);

const pvpokeIds242251: Record<string,string> = {
  "242-johto": "blissey",
  "243-johto": "raikou",
  "244-johto": "entei",
  "245-johto": "suicune",
  "246-johto": "larvitar",
  "247-johto": "pupitar",
  "248-johto": "tyranitar",
  "249-johto": "lugia",
  "250-johto": "ho_oh",
  "251-johto": "celebi"
};
export function pvpokeSpeciesId242251(form: Form242251, shadow: boolean) {
  const base = pvpokeIds242251[form.id] ?? form.aliases[0].toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/-/g, "_");
  return shadow ? base + "_shadow" : base;
}
