export type RegionKey = "KANTO" | "JOHTO" | "ALOLA" | "GALAR" | "HISUI" | "PALDEA" | "OTHER";
export type PveUseLevel = "CORE_INVESTMENT" | "USABLE_OR_BUDGET" | "SPECIAL_USE" | "NO_SIGNIFICANT_USE";

export interface Gen2Species182211 { dexNumber: number; nameEn: string; nameZhTw: string; types: string[]; familyKey: string; }
export interface Form182211 { id: string; dexNumber: number; formKey: string; formNameEn: string; formNameZhTw: string; regionKey: RegionKey; types: string[]; aliases: string[]; evolvesFromFormId?: string | null; evolutionFamilyNotesZhTw: string; isStub?: boolean; includeVariants?: boolean; }
export interface SpecialVariant182211 { id: string; formId: string; variantKey: "MEGA"; released: boolean; nameZhTw: string; }

export const species182211: Gen2Species182211[] = [
  {
    "dexNumber": 182,
    "nameEn": "bellossom",
    "nameZhTw": "美麗花",
    "types": [
      "GRASS"
    ],
    "familyKey": "KANTO_FAMILY_043"
  },
  {
    "dexNumber": 183,
    "nameEn": "marill",
    "nameZhTw": "瑪力露",
    "types": [
      "WATER",
      "FAIRY"
    ],
    "familyKey": "JOHTO_FAMILY_183"
  },
  {
    "dexNumber": 184,
    "nameEn": "azumarill",
    "nameZhTw": "瑪力露麗",
    "types": [
      "WATER",
      "FAIRY"
    ],
    "familyKey": "JOHTO_FAMILY_183"
  },
  {
    "dexNumber": 185,
    "nameEn": "sudowoodo",
    "nameZhTw": "樹才怪",
    "types": [
      "ROCK"
    ],
    "familyKey": "JOHTO_FAMILY_185"
  },
  {
    "dexNumber": 186,
    "nameEn": "politoed",
    "nameZhTw": "蚊香蛙皇",
    "types": [
      "WATER"
    ],
    "familyKey": "KANTO_FAMILY_060"
  },
  {
    "dexNumber": 187,
    "nameEn": "hoppip",
    "nameZhTw": "毽子草",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_187"
  },
  {
    "dexNumber": 188,
    "nameEn": "skiploom",
    "nameZhTw": "毽子花",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_187"
  },
  {
    "dexNumber": 189,
    "nameEn": "jumpluff",
    "nameZhTw": "毽子棉",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_187"
  },
  {
    "dexNumber": 190,
    "nameEn": "aipom",
    "nameZhTw": "長尾怪手",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_190"
  },
  {
    "dexNumber": 191,
    "nameEn": "sunkern",
    "nameZhTw": "向日種子",
    "types": [
      "GRASS"
    ],
    "familyKey": "JOHTO_FAMILY_191"
  },
  {
    "dexNumber": 192,
    "nameEn": "sunflora",
    "nameZhTw": "向日花怪",
    "types": [
      "GRASS"
    ],
    "familyKey": "JOHTO_FAMILY_191"
  },
  {
    "dexNumber": 193,
    "nameEn": "yanma",
    "nameZhTw": "蜻蜻蜓",
    "types": [
      "BUG",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_193"
  },
  {
    "dexNumber": 194,
    "nameEn": "wooper",
    "nameZhTw": "烏波",
    "types": [
      "WATER",
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_194"
  },
  {
    "dexNumber": 195,
    "nameEn": "quagsire",
    "nameZhTw": "沼王",
    "types": [
      "WATER",
      "GROUND"
    ],
    "familyKey": "JOHTO_FAMILY_194"
  },
  {
    "dexNumber": 196,
    "nameEn": "espeon",
    "nameZhTw": "太陽伊布",
    "types": [
      "PSYCHIC"
    ],
    "familyKey": "KANTO_FAMILY_133"
  },
  {
    "dexNumber": 197,
    "nameEn": "umbreon",
    "nameZhTw": "月亮伊布",
    "types": [
      "DARK"
    ],
    "familyKey": "KANTO_FAMILY_133"
  },
  {
    "dexNumber": 198,
    "nameEn": "murkrow",
    "nameZhTw": "黑暗鴉",
    "types": [
      "DARK",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_198"
  },
  {
    "dexNumber": 199,
    "nameEn": "slowking",
    "nameZhTw": "呆呆王",
    "types": [
      "WATER",
      "PSYCHIC"
    ],
    "familyKey": "KANTO_FAMILY_079"
  },
  {
    "dexNumber": 200,
    "nameEn": "misdreavus",
    "nameZhTw": "夢妖",
    "types": [
      "GHOST"
    ],
    "familyKey": "JOHTO_FAMILY_200"
  },
  {
    "dexNumber": 201,
    "nameEn": "unown",
    "nameZhTw": "未知圖騰",
    "types": [
      "PSYCHIC"
    ],
    "familyKey": "JOHTO_FAMILY_201"
  },
  {
    "dexNumber": 202,
    "nameEn": "wobbuffet",
    "nameZhTw": "果然翁",
    "types": [
      "PSYCHIC"
    ],
    "familyKey": "JOHTO_FAMILY_202"
  },
  {
    "dexNumber": 203,
    "nameEn": "girafarig",
    "nameZhTw": "麒麟奇",
    "types": [
      "NORMAL",
      "PSYCHIC"
    ],
    "familyKey": "JOHTO_FAMILY_203"
  },
  {
    "dexNumber": 204,
    "nameEn": "pineco",
    "nameZhTw": "榛果球",
    "types": [
      "BUG"
    ],
    "familyKey": "JOHTO_FAMILY_204"
  },
  {
    "dexNumber": 205,
    "nameEn": "forretress",
    "nameZhTw": "佛烈托斯",
    "types": [
      "BUG",
      "STEEL"
    ],
    "familyKey": "JOHTO_FAMILY_204"
  },
  {
    "dexNumber": 206,
    "nameEn": "dunsparce",
    "nameZhTw": "土龍弟弟",
    "types": [
      "NORMAL"
    ],
    "familyKey": "JOHTO_FAMILY_206"
  },
  {
    "dexNumber": 207,
    "nameEn": "gligar",
    "nameZhTw": "天蠍",
    "types": [
      "GROUND",
      "FLYING"
    ],
    "familyKey": "JOHTO_FAMILY_207"
  },
  {
    "dexNumber": 208,
    "nameEn": "steelix",
    "nameZhTw": "大鋼蛇",
    "types": [
      "STEEL",
      "GROUND"
    ],
    "familyKey": "KANTO_FAMILY_095"
  },
  {
    "dexNumber": 209,
    "nameEn": "snubbull",
    "nameZhTw": "布魯",
    "types": [
      "FAIRY"
    ],
    "familyKey": "JOHTO_FAMILY_209"
  },
  {
    "dexNumber": 210,
    "nameEn": "granbull",
    "nameZhTw": "布魯皇",
    "types": [
      "FAIRY"
    ],
    "familyKey": "JOHTO_FAMILY_209"
  },
  {
    "dexNumber": 211,
    "nameEn": "qwilfish",
    "nameZhTw": "千針魚",
    "types": [
      "WATER",
      "POISON"
    ],
    "familyKey": "JOHTO_FAMILY_211"
  }
];
export const forms182211: Form182211[] = [
  {
    "id": "182-johto",
    "dexNumber": 182,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GRASS"
    ],
    "aliases": [
      "bellossom",
      "美麗花"
    ],
    "evolvesFromFormId": "044-kanto",
    "evolutionFamilyNotesZhTw": "正式接回既有關都家族；標準城都型態與跨世代進化價值分開呈現。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "183-johto",
    "dexNumber": 183,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "FAIRY"
    ],
    "aliases": [
      "marill",
      "瑪力露"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "184-johto",
    "dexNumber": 184,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "FAIRY"
    ],
    "aliases": [
      "azumarill",
      "瑪力露麗"
    ],
    "evolvesFromFormId": "183-johto",
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "185-johto",
    "dexNumber": 185,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "ROCK"
    ],
    "aliases": [
      "sudowoodo",
      "樹才怪"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "186-johto",
    "dexNumber": 186,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER"
    ],
    "aliases": [
      "politoed",
      "蚊香蛙皇"
    ],
    "evolvesFromFormId": "061-kanto",
    "evolutionFamilyNotesZhTw": "正式接回既有關都家族；標準城都型態與跨世代進化價值分開呈現。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "187-johto",
    "dexNumber": 187,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "aliases": [
      "hoppip",
      "毽子草"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "188-johto",
    "dexNumber": 188,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "aliases": [
      "skiploom",
      "毽子花"
    ],
    "evolvesFromFormId": "187-johto",
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "189-johto",
    "dexNumber": 189,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "aliases": [
      "jumpluff",
      "毽子棉"
    ],
    "evolvesFromFormId": "188-johto",
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "190-johto",
    "dexNumber": 190,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "aipom",
      "長尾怪手"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "191-johto",
    "dexNumber": 191,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GRASS"
    ],
    "aliases": [
      "sunkern",
      "向日種子"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "192-johto",
    "dexNumber": 192,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GRASS"
    ],
    "aliases": [
      "sunflora",
      "向日花怪"
    ],
    "evolvesFromFormId": "191-johto",
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "193-johto",
    "dexNumber": 193,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "BUG",
      "FLYING"
    ],
    "aliases": [
      "yanma",
      "蜻蜻蜓"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "194-johto",
    "dexNumber": 194,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "GROUND"
    ],
    "aliases": [
      "wooper",
      "烏波"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "195-johto",
    "dexNumber": 195,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "GROUND"
    ],
    "aliases": [
      "quagsire",
      "沼王"
    ],
    "evolvesFromFormId": "194-johto",
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "196-johto",
    "dexNumber": 196,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "PSYCHIC"
    ],
    "aliases": [
      "espeon",
      "太陽伊布"
    ],
    "evolvesFromFormId": "133-kanto",
    "evolutionFamilyNotesZhTw": "正式接回既有關都家族；標準城都型態與跨世代進化價值分開呈現。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "197-johto",
    "dexNumber": 197,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "DARK"
    ],
    "aliases": [
      "umbreon",
      "月亮伊布"
    ],
    "evolvesFromFormId": "133-kanto",
    "evolutionFamilyNotesZhTw": "正式接回既有關都家族；標準城都型態與跨世代進化價值分開呈現。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "198-johto",
    "dexNumber": 198,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "DARK",
      "FLYING"
    ],
    "aliases": [
      "murkrow",
      "黑暗鴉"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "199-johto",
    "dexNumber": 199,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "PSYCHIC"
    ],
    "aliases": [
      "slowking",
      "呆呆王"
    ],
    "evolvesFromFormId": "079-kanto",
    "evolutionFamilyNotesZhTw": "正式接回既有關都家族；標準城都型態與跨世代進化價值分開呈現。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "200-johto",
    "dexNumber": 200,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GHOST"
    ],
    "aliases": [
      "misdreavus",
      "夢妖"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "201-johto",
    "dexNumber": 201,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "PSYCHIC"
    ],
    "aliases": [
      "unown",
      "未知圖騰"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "202-johto",
    "dexNumber": 202,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "PSYCHIC"
    ],
    "aliases": [
      "wobbuffet",
      "果然翁"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "203-johto",
    "dexNumber": 203,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL",
      "PSYCHIC"
    ],
    "aliases": [
      "girafarig",
      "麒麟奇"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "204-johto",
    "dexNumber": 204,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "BUG"
    ],
    "aliases": [
      "pineco",
      "榛果球"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "205-johto",
    "dexNumber": 205,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "BUG",
      "STEEL"
    ],
    "aliases": [
      "forretress",
      "佛烈托斯"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "206-johto",
    "dexNumber": 206,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "NORMAL"
    ],
    "aliases": [
      "dunsparce",
      "土龍弟弟"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "207-johto",
    "dexNumber": 207,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "GROUND",
      "FLYING"
    ],
    "aliases": [
      "gligar",
      "天蠍"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "208-johto",
    "dexNumber": 208,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "STEEL",
      "GROUND"
    ],
    "aliases": [
      "steelix",
      "大鋼蛇"
    ],
    "evolvesFromFormId": "095-kanto",
    "evolutionFamilyNotesZhTw": "正式接回既有關都家族；標準城都型態與跨世代進化價值分開呈現。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "209-johto",
    "dexNumber": 209,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FAIRY"
    ],
    "aliases": [
      "snubbull",
      "布魯"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "210-johto",
    "dexNumber": 210,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "FAIRY"
    ],
    "aliases": [
      "granbull",
      "布魯皇"
    ],
    "evolvesFromFormId": "209-johto",
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "211-johto",
    "dexNumber": 211,
    "formKey": "JOHTO",
    "formNameEn": "Johto",
    "formNameZhTw": "城都",
    "regionKey": "JOHTO",
    "types": [
      "WATER",
      "POISON"
    ],
    "aliases": [
      "qwilfish",
      "千針魚"
    ],
    "evolvesFromFormId": null,
    "evolutionFamilyNotesZhTw": "第 2 世代標準城都型態；普通、暗影、淨化與 Max 版本分開評估，後續世代進化以正式 stub 保留。",
    "isStub": false,
    "includeVariants": true
  },
  {
    "id": "199-galar",
    "dexNumber": 199,
    "formKey": "GALAR",
    "formNameEn": "Galarian",
    "formNameZhTw": "伽勒爾",
    "regionKey": "GALAR",
    "types": [
      "POISON",
      "PSYCHIC"
    ],
    "aliases": [
      "Galarian Slowking",
      "伽勒爾呆呆王"
    ],
    "evolvesFromFormId": "079-galar",
    "evolutionFamilyNotesZhTw": "伽勒爾呆呆王是既有伽勒爾呆呆獸分支的正式 stub；不與標準城都呆呆王共用型態或用途結論。",
    "isStub": true,
    "includeVariants": false
  }
];
export const evolutionPairs182211: readonly [string,string][] = [
  [
    "044-kanto",
    "182-johto"
  ],
  [
    "061-kanto",
    "186-johto"
  ],
  [
    "133-kanto",
    "196-johto"
  ],
  [
    "133-kanto",
    "197-johto"
  ],
  [
    "079-kanto",
    "199-johto"
  ],
  [
    "095-kanto",
    "208-johto"
  ],
  [
    "183-johto",
    "184-johto"
  ],
  [
    "187-johto",
    "188-johto"
  ],
  [
    "188-johto",
    "189-johto"
  ],
  [
    "191-johto",
    "192-johto"
  ],
  [
    "194-johto",
    "195-johto"
  ],
  [
    "209-johto",
    "210-johto"
  ],
  [
    "079-galar",
    "199-galar"
  ],
  [
    "190-johto",
    "424-kanto"
  ],
  [
    "193-johto",
    "469-kanto"
  ],
  [
    "198-johto",
    "430-kanto"
  ],
  [
    "200-johto",
    "429-kanto"
  ],
  [
    "203-johto",
    "981-kanto"
  ],
  [
    "206-johto",
    "982-kanto"
  ],
  [
    "207-johto",
    "472-kanto"
  ]
];
export const releasedShadowForms182211 = new Set<string>(["182-johto","185-johto","186-johto","187-johto","188-johto","189-johto","190-johto","194-johto","195-johto","198-johto","199-johto","200-johto","202-johto","203-johto","204-johto","205-johto","207-johto","208-johto","209-johto","210-johto","211-johto"]);
export const releasedMegaForms182211 = new Set<string>(["208-johto"]);
export const releasedDynamaxForms182211 = new Set<string>([]);
export const releasedGigantamaxForms182211 = new Set<string>();
export const specialVariants182211: SpecialVariant182211[] = [
  {
    "id": "208-johto-mega",
    "formId": "208-johto",
    "variantKey": "MEGA",
    "released": true,
    "nameZhTw": "Mega 大鋼蛇"
  }
];
export const pveUseLevels182211: Record<string, PveUseLevel> = {};
export const truncatedForms182211 = new Set<string>();
export const migratedStubIds182211 = new Set<string>(["182-kanto","186-kanto","196-kanto","197-kanto","199-kanto","208-kanto"]);

const pvpokeIds182211: Record<string,string> = {
  "182-johto": "bellossom",
  "183-johto": "marill",
  "184-johto": "azumarill",
  "185-johto": "sudowoodo",
  "186-johto": "politoed",
  "187-johto": "hoppip",
  "188-johto": "skiploom",
  "189-johto": "jumpluff",
  "190-johto": "aipom",
  "191-johto": "sunkern",
  "192-johto": "sunflora",
  "193-johto": "yanma",
  "194-johto": "wooper",
  "195-johto": "quagsire",
  "196-johto": "espeon",
  "197-johto": "umbreon",
  "198-johto": "murkrow",
  "199-johto": "slowking",
  "200-johto": "misdreavus",
  "201-johto": "unown",
  "202-johto": "wobbuffet",
  "203-johto": "girafarig",
  "204-johto": "pineco",
  "205-johto": "forretress",
  "206-johto": "dunsparce",
  "207-johto": "gligar",
  "208-johto": "steelix",
  "209-johto": "snubbull",
  "210-johto": "granbull",
  "211-johto": "qwilfish"
};
export function pvpokeSpeciesId182211(form: Form182211, shadow: boolean) {
  const base = pvpokeIds182211[form.id] ?? form.aliases[0].toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/-/g, "_");
  return shadow ? base + "_shadow" : base;
}
