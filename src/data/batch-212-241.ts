import type { RegionKey } from "./region-key";

export type { RegionKey } from "./region-key";
export type PveUseLevel = "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE";

export interface Gen2Species212241 { dexNumber: number; nameEn: string; nameZhTw: string; types: string[]; familyKey: string; }
export interface Form212241 { id: string; dexNumber: number; formKey: string; formNameEn: string; formNameZhTw: string; regionKey: RegionKey; types: string[]; aliases: string[]; evolvesFromFormId?: string | null; evolutionFamilyNotesZhTw: string; isStub?: boolean; includeVariants?: boolean; }
export interface SpecialVariant212241 { id: string; formId: string; variantKey: "MEGA"; released: boolean; nameZhTw: string; }

export const species212241: Gen2Species212241[] = [
  {
    "dexNumber": 212,
    "nameEn": "scizor",
    "nameZhTw": "巨鉗螳螂",
    "types": [
      "BUG",
      "STEEL"
    ],
    "familyKey": "KANTO_FAMILY_123"
  },
  {
    "dexNumber": 213,
    "nameEn": "shuckle",
    "nameZhTw": "壺壺",
    "types": [
      "BUG",
      "ROCK"
    ],
    "familyKey": "JOHTO_FAMILY_213"
  },
  {
    "dexNumber": 214,
    "nameEn": "heracross",
    "nameZhTw": "赫拉克羅斯",
    "types": [
      "BUG",
      "FIGHTING"
    ],
    "familyKey": "JOHTO_FAMILY_214"
  },
  {
    "dexNumber": 215,
    "nameEn": "sneasel",
    "nameZhTw": "狃拉",
    "types": [
      "DARK",
      "ICE"
    ],
    "familyKey": "JOHTO_FAMILY_215"
  },
  {
    "dexNumber": 216,
    "nameEn": "teddiursa",
    "nameZhTw": "熊寶寶",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_216"
  },
  {
    "dexNumber": 217,
    "nameEn": "ursaring",
    "nameZhTw": "圈圈熊",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_217"
  },
  {
    "dexNumber": 218,
    "nameEn": "slugma",
    "nameZhTw": "熔岩蟲",
    "types": [
      "FIRE"
    ],
    "familyKey": "JOHTO_FAMILY_218"
  },
  {
    "dexNumber": 219,
    "nameEn": "magcargo",
    "nameZhTw": "熔岩蝸牛",
    "types": [
      "FIRE",
      "ROCK"
    ],
    "familyKey": "JOHTO_FAMILY_219"
  },
  {
    "dexNumber": 220,
    "nameEn": "swinub",
    "nameZhTw": "小山豬",
    "types": [
      "ICE",
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_220"
  },
  {
    "dexNumber": 221,
    "nameEn": "piloswine",
    "nameZhTw": "長毛豬",
    "types": [
      "ICE",
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_221"
  },
  {
    "dexNumber": 222,
    "nameEn": "corsola",
    "nameZhTw": "太陽珊瑚",
    "types": [
      "WATER",
      "ROCK"
    ],
    "familyKey": "JOHTO_FAMILY_222"
  },
  {
    "dexNumber": 223,
    "nameEn": "remoraid",
    "nameZhTw": "鐵炮魚",
    "types": [
      "WATER"
    ],
    "familyKey": "JOHTO_FAMILY_223"
  },
  {
    "dexNumber": 224,
    "nameEn": "octillery",
    "nameZhTw": "章魚桶",
    "types": [
      "WATER"
    ],
    "familyKey": "JOHTO_FAMILY_223"
  },
  {
    "dexNumber": 225,
    "nameEn": "delibird",
    "nameZhTw": "信使鳥",
    "types": [
      "ICE",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_225"
  },
  {
    "dexNumber": 226,
    "nameEn": "mantine",
    "nameZhTw": "巨翅飛魚",
    "types": [
      "WATER",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_226"
  },
  {
    "dexNumber": 227,
    "nameEn": "skarmory",
    "nameZhTw": "盔甲鳥",
    "types": [
      "STEEL",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_227"
  },
  {
    "dexNumber": 228,
    "nameEn": "houndour",
    "nameZhTw": "戴魯比",
    "types": [
      "DARK",
      "FIRE"
    ],
    "familyKey": "JOHTO_FAMILY_228"
  },
  {
    "dexNumber": 229,
    "nameEn": "houndoom",
    "nameZhTw": "黑魯加",
    "types": [
      "DARK",
      "FIRE"
    ],
    "familyKey": "JOHTO_FAMILY_228"
  },
  {
    "dexNumber": 230,
    "nameEn": "kingdra",
    "nameZhTw": "刺龍王",
    "types": [
      "WATER",
      "DRAGON"
    ],
    "familyKey": "KANTO_FAMILY_116"
  },
  {
    "dexNumber": 231,
    "nameEn": "phanpy",
    "nameZhTw": "小小象",
    "types": [
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_231"
  },
  {
    "dexNumber": 232,
    "nameEn": "donphan",
    "nameZhTw": "頓甲",
    "types": [
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_231"
  },
  {
    "dexNumber": 233,
    "nameEn": "porygon2",
    "nameZhTw": "多邊獸Ⅱ",
    "types": [
      "NORMAL"
    ],
    "familyKey": "KANTO_FAMILY_137"
  },
  {
    "dexNumber": 234,
    "nameEn": "stantler",
    "nameZhTw": "驚角鹿",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_234"
  },
  {
    "dexNumber": 235,
    "nameEn": "smeargle",
    "nameZhTw": "圖圖犬",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_235"
  },
  {
    "dexNumber": 236,
    "nameEn": "tyrogue",
    "nameZhTw": "無畏小子",
    "types": [
      "FIGHTING"
    ],
    "familyKey": "KANTO_FAMILY_236"
  },
  {
    "dexNumber": 237,
    "nameEn": "hitmontop",
    "nameZhTw": "戰舞郎",
    "types": [
      "FIGHTING"
    ],
    "familyKey": "KANTO_FAMILY_236"
  },
  {
    "dexNumber": 238,
    "nameEn": "smoochum",
    "nameZhTw": "迷唇娃",
    "types": [
      "ICE",
      "PSYCHIC"
    ],
    "familyKey": "KANTO_FAMILY_124"
  },
  {
    "dexNumber": 239,
    "nameEn": "elekid",
    "nameZhTw": "電擊怪",
    "types": [
      "ELECTRIC"
    ],
    "familyKey": "KANTO_FAMILY_125"
  },
  {
    "dexNumber": 240,
    "nameEn": "magby",
    "nameZhTw": "鴨嘴寶寶",
    "types": [
      "FIRE"
    ],
    "familyKey": "KANTO_FAMILY_126"
  },
  {
    "dexNumber": 241,
    "nameEn": "miltank",
    "nameZhTw": "大奶罐",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_241"
  }
];
export const forms212241: Form212241[] = [
  {
    "id": "212-johto",
    "dexNumber": 212,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "BUG",
      "STEEL"
    ],
    "aliases": [
      "scizor",
      "巨鉗螳螂"
    ],
    "evolvesFromFormId": "123-kanto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "213-johto",
    "dexNumber": 213,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "BUG",
      "ROCK"
    ],
    "aliases": [
      "shuckle",
      "壺壺"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "214-johto",
    "dexNumber": 214,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "BUG",
      "FIGHTING"
    ],
    "aliases": [
      "heracross",
      "赫拉克羅斯"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "215-johto",
    "dexNumber": 215,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "DARK",
      "ICE"
    ],
    "aliases": [
      "sneasel",
      "狃拉"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "216-johto",
    "dexNumber": 216,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "teddiursa",
      "熊寶寶"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "217-johto",
    "dexNumber": 217,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "ursaring",
      "圈圈熊"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "218-johto",
    "dexNumber": 218,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIRE"
    ],
    "aliases": [
      "slugma",
      "熔岩蟲"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "219-johto",
    "dexNumber": 219,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIRE",
      "ROCK"
    ],
    "aliases": [
      "magcargo",
      "熔岩蝸牛"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "220-johto",
    "dexNumber": 220,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ICE",
      "GROUND"
    ],
    "aliases": [
      "swinub",
      "小山豬"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "221-johto",
    "dexNumber": 221,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ICE",
      "GROUND"
    ],
    "aliases": [
      "piloswine",
      "長毛豬"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "222-johto",
    "dexNumber": 222,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "ROCK"
    ],
    "aliases": [
      "corsola",
      "太陽珊瑚"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "223-johto",
    "dexNumber": 223,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER"
    ],
    "aliases": [
      "remoraid",
      "鐵炮魚"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "224-johto",
    "dexNumber": 224,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER"
    ],
    "aliases": [
      "octillery",
      "章魚桶"
    ],
    "evolvesFromFormId": "223-johto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "225-johto",
    "dexNumber": 225,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ICE",
      "FLYING"
    ],
    "aliases": [
      "delibird",
      "信使鳥"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "226-johto",
    "dexNumber": 226,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "FLYING"
    ],
    "aliases": [
      "mantine",
      "巨翅飛魚"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "227-johto",
    "dexNumber": 227,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "STEEL",
      "FLYING"
    ],
    "aliases": [
      "skarmory",
      "盔甲鳥"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "228-johto",
    "dexNumber": 228,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "DARK",
      "FIRE"
    ],
    "aliases": [
      "houndour",
      "戴魯比"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "229-johto",
    "dexNumber": 229,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "DARK",
      "FIRE"
    ],
    "aliases": [
      "houndoom",
      "黑魯加"
    ],
    "evolvesFromFormId": "228-johto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "230-johto",
    "dexNumber": 230,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "DRAGON"
    ],
    "aliases": [
      "kingdra",
      "刺龍王"
    ],
    "evolvesFromFormId": "117-kanto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "231-johto",
    "dexNumber": 231,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GROUND"
    ],
    "aliases": [
      "phanpy",
      "小小象"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "232-johto",
    "dexNumber": 232,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GROUND"
    ],
    "aliases": [
      "donphan",
      "頓甲"
    ],
    "evolvesFromFormId": "231-johto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "233-johto",
    "dexNumber": 233,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "porygon2",
      "多邊獸Ⅱ"
    ],
    "evolvesFromFormId": "137-kanto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "234-johto",
    "dexNumber": 234,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "stantler",
      "驚角鹿"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "235-johto",
    "dexNumber": 235,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "smeargle",
      "圖圖犬"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "236-johto",
    "dexNumber": 236,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIGHTING"
    ],
    "aliases": [
      "tyrogue",
      "無畏小子"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "237-johto",
    "dexNumber": 237,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIGHTING"
    ],
    "aliases": [
      "hitmontop",
      "戰舞郎"
    ],
    "evolvesFromFormId": "236-johto",
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "238-johto",
    "dexNumber": 238,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ICE",
      "PSYCHIC"
    ],
    "aliases": [
      "smoochum",
      "迷唇娃"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "239-johto",
    "dexNumber": 239,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ELECTRIC"
    ],
    "aliases": [
      "elekid",
      "電擊怪"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "240-johto",
    "dexNumber": 240,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FIRE"
    ],
    "aliases": [
      "magby",
      "鴨嘴寶寶"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "241-johto",
    "dexNumber": 241,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "miltank",
      "大奶罐"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "本批已將進化關係結構化；跨世代後續進化以正式 stub 保留，Mega／Max／暗影版本分開評估。",
    "isStub": false,
    "includeVariants": true
  }
];
export const evolutionPairs212241: readonly [string,string][] = [
  [
    "123-kanto",
    "212-johto"
  ],
  [
    "117-kanto",
    "230-johto"
  ],
  [
    "137-kanto",
    "233-johto"
  ],
  [
    "223-johto",
    "224-johto"
  ],
  [
    "228-johto",
    "229-johto"
  ],
  [
    "231-johto",
    "232-johto"
  ],
  [
    "236-johto",
    "106-kanto"
  ],
  [
    "236-johto",
    "107-kanto"
  ],
  [
    "236-johto",
    "237-johto"
  ],
  [
    "240-johto",
    "126-kanto"
  ],
  [
    "239-johto",
    "125-kanto"
  ],
  [
    "238-johto",
    "124-kanto"
  ],
  [
    "215-johto",
    "461-other"
  ],
  [
    "217-johto",
    "901-hisui"
  ],
  [
    "221-johto",
    "473-other"
  ],
  [
    "233-johto",
    "474-other"
  ],
  [
    "234-johto",
    "899-hisui"
  ]
];
export const releasedShadowForms212241 = new Set<string>([
  "212-johto",
  "213-johto",
  "215-johto",
  "216-johto",
  "217-johto",
  "220-johto",
  "221-johto",
  "225-johto",
  "227-johto",
  "228-johto",
  "229-johto",
  "230-johto",
  "231-johto",
  "232-johto",
  "233-johto",
  "234-johto",
  "237-johto"
]);
export const releasedMegaForms212241 = new Set<string>([
  "212-johto",
  "214-johto",
  "227-johto",
  "229-johto"
]);
export const releasedDynamaxForms212241 = new Set<string>([
  "213-johto",
  "237-johto"
]);
export const releasedGigantamaxForms212241 = new Set<string>();
export const specialVariants212241: SpecialVariant212241[] = [
  {
    "id": "212-johto-mega",
    "formId": "212-johto",
    "variantKey": "MEGA",
    "released": true,
    "nameZhTw": "Mega 巨鉗螳螂"
  },
  {
    "id": "214-johto-mega",
    "formId": "214-johto",
    "variantKey": "MEGA",
    "released": true,
    "nameZhTw": "Mega 赫拉克羅斯"
  },
  {
    "id": "227-johto-mega",
    "formId": "227-johto",
    "variantKey": "MEGA",
    "released": true,
    "nameZhTw": "Mega 盔甲鳥"
  },
  {
    "id": "229-johto-mega",
    "formId": "229-johto",
    "variantKey": "MEGA",
    "released": true,
    "nameZhTw": "Mega 黑魯加"
  }
];
export const pveUseLevels212241: Record<string, PveUseLevel> = {
  "214-johto": "USABLE_OR_BUDGET",
  "227-johto": "SPECIAL_USE",
  "229-johto": "SPECIAL_USE"
};
export const truncatedForms212241 = new Set<string>();
export const migratedStubIds212241 = new Set<string>([
  "212-kanto",
  "230-kanto",
  "233-kanto"
]);

const pvpokeIds212241: Record<string,string> = {
  "212-johto": "scizor",
  "213-johto": "shuckle",
  "214-johto": "heracross",
  "215-johto": "sneasel",
  "216-johto": "teddiursa",
  "217-johto": "ursaring",
  "218-johto": "slugma",
  "219-johto": "magcargo",
  "220-johto": "swinub",
  "221-johto": "piloswine",
  "222-johto": "corsola",
  "223-johto": "remoraid",
  "224-johto": "octillery",
  "225-johto": "delibird",
  "226-johto": "mantine",
  "227-johto": "skarmory",
  "228-johto": "houndour",
  "229-johto": "houndoom",
  "230-johto": "kingdra",
  "231-johto": "phanpy",
  "232-johto": "donphan",
  "233-johto": "porygon2",
  "234-johto": "stantler",
  "235-johto": "smeargle",
  "236-johto": "tyrogue",
  "237-johto": "hitmontop",
  "238-johto": "smoochum",
  "239-johto": "elekid",
  "240-johto": "magby",
  "241-johto": "miltank"
};
export function pvpokeSpeciesId212241(form: Form212241, shadow: boolean) {
  const base = pvpokeIds212241[form.id] ?? form.aliases[0].toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/-/g, "_");
  return shadow ? base + "_shadow" : base;
}
