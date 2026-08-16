import type { Gen4BatchForm, Gen4BatchSpecies, Gen4EvolutionPair, Gen4PveEvidence, Gen4SpecialVariant } from "./batch-gen4-types";
import { deriveShadowReleaseEvidence } from "./evolution-release";

const note = "神奧 正式 身份與第四世代批次擁有的型態。";

export const species417493: Gen4BatchSpecies[] = [
  {
    dexNumber: 417,
    nameEn: "Pachirisu",
    nameZhTw: "帕奇利茲",
    types: ["ELECTRIC"],
    familyKey: "SINNOH_FAMILY_417"
  },
  {
    dexNumber: 418,
    nameEn: "Buizel",
    nameZhTw: "泳圈鼬",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_418"
  },
  {
    dexNumber: 419,
    nameEn: "Floatzel",
    nameZhTw: "浮潛鼬",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_418"
  },
  {
    dexNumber: 420,
    nameEn: "Cherubi",
    nameZhTw: "櫻花寶",
    types: ["GRASS"],
    familyKey: "SINNOH_FAMILY_420"
  },
  {
    dexNumber: 421,
    nameEn: "Cherrim",
    nameZhTw: "櫻花兒",
    types: ["GRASS"],
    familyKey: "SINNOH_FAMILY_420"
  },
  {
    dexNumber: 422,
    nameEn: "Shellos",
    nameZhTw: "無殼海兔",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_422"
  },
  {
    dexNumber: 423,
    nameEn: "Gastrodon",
    nameZhTw: "海兔獸",
    types: ["WATER", "GROUND"],
    familyKey: "SINNOH_FAMILY_422"
  },
  {
    dexNumber: 424,
    nameEn: "Ambipom",
    nameZhTw: "雙尾怪手",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_424"
  },
  {
    dexNumber: 425,
    nameEn: "Drifloon",
    nameZhTw: "飄飄球",
    types: ["GHOST", "FLYING"],
    familyKey: "SINNOH_FAMILY_425"
  },
  {
    dexNumber: 426,
    nameEn: "Drifblim",
    nameZhTw: "隨風球",
    types: ["GHOST", "FLYING"],
    familyKey: "SINNOH_FAMILY_425"
  },
  {
    dexNumber: 427,
    nameEn: "Buneary",
    nameZhTw: "捲捲耳",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_427"
  },
  {
    dexNumber: 428,
    nameEn: "Lopunny",
    nameZhTw: "長耳兔",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_427"
  },
  {
    dexNumber: 429,
    nameEn: "Mismagius",
    nameZhTw: "夢妖魔",
    types: ["GHOST"],
    familyKey: "SINNOH_FAMILY_429"
  },
  {
    dexNumber: 430,
    nameEn: "Honchkrow",
    nameZhTw: "烏鴉頭頭",
    types: ["DARK", "FLYING"],
    familyKey: "SINNOH_FAMILY_430"
  },
  {
    dexNumber: 431,
    nameEn: "Glameow",
    nameZhTw: "魅力喵",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_431"
  },
  {
    dexNumber: 432,
    nameEn: "Purugly",
    nameZhTw: "東施喵",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_431"
  },
  {
    dexNumber: 433,
    nameEn: "Chingling",
    nameZhTw: "鈴鐺響",
    types: ["PSYCHIC"],
    familyKey: "HOENN_FAMILY_358"
  },
  {
    dexNumber: 434,
    nameEn: "Stunky",
    nameZhTw: "臭鼬噗",
    types: ["POISON", "DARK"],
    familyKey: "SINNOH_FAMILY_434"
  },
  {
    dexNumber: 435,
    nameEn: "Skuntank",
    nameZhTw: "坦克臭鼬",
    types: ["POISON", "DARK"],
    familyKey: "SINNOH_FAMILY_434"
  },
  {
    dexNumber: 436,
    nameEn: "Bronzor",
    nameZhTw: "銅鏡怪",
    types: ["STEEL", "PSYCHIC"],
    familyKey: "SINNOH_FAMILY_436"
  },
  {
    dexNumber: 437,
    nameEn: "Bronzong",
    nameZhTw: "青銅鐘",
    types: ["STEEL", "PSYCHIC"],
    familyKey: "SINNOH_FAMILY_436"
  },
  {
    dexNumber: 438,
    nameEn: "Bonsly",
    nameZhTw: "盆才怪",
    types: ["ROCK"],
    familyKey: "JOHTO_FAMILY_185"
  },
  {
    dexNumber: 439,
    nameEn: "Mime Jr.",
    nameZhTw: "魔尼尼",
    types: ["PSYCHIC", "FAIRY"],
    familyKey: "KANTO_FAMILY_122"
  },
  {
    dexNumber: 440,
    nameEn: "Happiny",
    nameZhTw: "小福蛋",
    types: ["NORMAL"],
    familyKey: "KANTO_FAMILY_113"
  },
  {
    dexNumber: 441,
    nameEn: "Chatot",
    nameZhTw: "聒噪鳥",
    types: ["NORMAL", "FLYING"],
    familyKey: "SINNOH_FAMILY_441"
  },
  {
    dexNumber: 442,
    nameEn: "Spiritomb",
    nameZhTw: "花岩怪",
    types: ["GHOST", "DARK"],
    familyKey: "SINNOH_FAMILY_442"
  },
  {
    dexNumber: 443,
    nameEn: "Gible",
    nameZhTw: "圓陸鯊",
    types: ["DRAGON", "GROUND"],
    familyKey: "SINNOH_FAMILY_443"
  },
  {
    dexNumber: 444,
    nameEn: "Gabite",
    nameZhTw: "尖牙陸鯊",
    types: ["DRAGON", "GROUND"],
    familyKey: "SINNOH_FAMILY_443"
  },
  {
    dexNumber: 445,
    nameEn: "Garchomp",
    nameZhTw: "烈咬陸鯊",
    types: ["DRAGON", "GROUND"],
    familyKey: "SINNOH_FAMILY_443"
  },
  {
    dexNumber: 446,
    nameEn: "Munchlax",
    nameZhTw: "小卡比獸",
    types: ["NORMAL"],
    familyKey: "KANTO_FAMILY_143"
  },
  {
    dexNumber: 447,
    nameEn: "Riolu",
    nameZhTw: "利歐路",
    types: ["FIGHTING"],
    familyKey: "SINNOH_FAMILY_447"
  },
  {
    dexNumber: 448,
    nameEn: "Lucario",
    nameZhTw: "路卡利歐",
    types: ["FIGHTING", "STEEL"],
    familyKey: "SINNOH_FAMILY_447"
  },
  {
    dexNumber: 449,
    nameEn: "Hippopotas",
    nameZhTw: "沙河馬",
    types: ["GROUND"],
    familyKey: "SINNOH_FAMILY_449"
  },
  {
    dexNumber: 450,
    nameEn: "Hippowdon",
    nameZhTw: "河馬獸",
    types: ["GROUND"],
    familyKey: "SINNOH_FAMILY_449"
  },
  {
    dexNumber: 451,
    nameEn: "Skorupi",
    nameZhTw: "鉗尾蠍",
    types: ["POISON", "BUG"],
    familyKey: "SINNOH_FAMILY_451"
  },
  {
    dexNumber: 452,
    nameEn: "Drapion",
    nameZhTw: "龍王蠍",
    types: ["POISON", "DARK"],
    familyKey: "SINNOH_FAMILY_451"
  },
  {
    dexNumber: 453,
    nameEn: "Croagunk",
    nameZhTw: "不良蛙",
    types: ["POISON", "FIGHTING"],
    familyKey: "SINNOH_FAMILY_453"
  },
  {
    dexNumber: 454,
    nameEn: "Toxicroak",
    nameZhTw: "毒骷蛙",
    types: ["POISON", "FIGHTING"],
    familyKey: "SINNOH_FAMILY_453"
  },
  {
    dexNumber: 455,
    nameEn: "Carnivine",
    nameZhTw: "尖牙籠",
    types: ["GRASS"],
    familyKey: "SINNOH_FAMILY_455"
  },
  {
    dexNumber: 456,
    nameEn: "Finneon",
    nameZhTw: "螢光魚",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_456"
  },
  {
    dexNumber: 457,
    nameEn: "Lumineon",
    nameZhTw: "霓虹魚",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_456"
  },
  {
    dexNumber: 458,
    nameEn: "Mantyke",
    nameZhTw: "小球飛魚",
    types: ["WATER", "FLYING"],
    familyKey: "JOHTO_FAMILY_226"
  },
  {
    dexNumber: 459,
    nameEn: "Snover",
    nameZhTw: "雪笠怪",
    types: ["GRASS", "ICE"],
    familyKey: "SINNOH_FAMILY_459"
  },
  {
    dexNumber: 460,
    nameEn: "Abomasnow",
    nameZhTw: "暴雪王",
    types: ["GRASS", "ICE"],
    familyKey: "SINNOH_FAMILY_459"
  },
  {
    dexNumber: 461,
    nameEn: "Weavile",
    nameZhTw: "瑪狃拉",
    types: ["DARK", "ICE"],
    familyKey: "SINNOH_FAMILY_461"
  },
  {
    dexNumber: 462,
    nameEn: "Magnezone",
    nameZhTw: "自爆磁怪",
    types: ["ELECTRIC", "STEEL"],
    familyKey: "KANTO_FAMILY_081"
  },
  {
    dexNumber: 463,
    nameEn: "Lickilicky",
    nameZhTw: "大舌舔",
    types: ["NORMAL"],
    familyKey: "KANTO_FAMILY_108"
  },
  {
    dexNumber: 464,
    nameEn: "Rhyperior",
    nameZhTw: "超甲狂犀",
    types: ["GROUND", "ROCK"],
    familyKey: "KANTO_FAMILY_111"
  },
  {
    dexNumber: 465,
    nameEn: "Tangrowth",
    nameZhTw: "巨蔓藤",
    types: ["GRASS"],
    familyKey: "KANTO_FAMILY_114"
  },
  {
    dexNumber: 466,
    nameEn: "Electivire",
    nameZhTw: "電擊魔獸",
    types: ["ELECTRIC"],
    familyKey: "KANTO_FAMILY_125"
  },
  {
    dexNumber: 467,
    nameEn: "Magmortar",
    nameZhTw: "鴨嘴炎獸",
    types: ["FIRE"],
    familyKey: "KANTO_FAMILY_126"
  },
  {
    dexNumber: 468,
    nameEn: "Togekiss",
    nameZhTw: "波克基斯",
    types: ["FAIRY", "FLYING"],
    familyKey: "JOHTO_FAMILY_176"
  },
  {
    dexNumber: 469,
    nameEn: "Yanmega",
    nameZhTw: "遠古巨蜓",
    types: ["BUG", "FLYING"],
    familyKey: "JOHTO_FAMILY_193"
  },
  {
    dexNumber: 470,
    nameEn: "Leafeon",
    nameZhTw: "葉伊布",
    types: ["GRASS"],
    familyKey: "KANTO_FAMILY_133"
  },
  {
    dexNumber: 471,
    nameEn: "Glaceon",
    nameZhTw: "冰伊布",
    types: ["ICE"],
    familyKey: "KANTO_FAMILY_133"
  },
  {
    dexNumber: 472,
    nameEn: "Gliscor",
    nameZhTw: "天蠍王",
    types: ["GROUND", "FLYING"],
    familyKey: "JOHTO_FAMILY_207"
  },
  {
    dexNumber: 473,
    nameEn: "Mamoswine",
    nameZhTw: "象牙豬",
    types: ["ICE", "GROUND"],
    familyKey: "JOHTO_FAMILY_220"
  },
  {
    dexNumber: 474,
    nameEn: "Porygon-Z",
    nameZhTw: "多邊獸Ｚ",
    types: ["NORMAL"],
    familyKey: "KANTO_FAMILY_137"
  },
  {
    dexNumber: 475,
    nameEn: "Gallade",
    nameZhTw: "艾路雷朵",
    types: ["PSYCHIC", "FIGHTING"],
    familyKey: "HOENN_FAMILY_280"
  },
  {
    dexNumber: 476,
    nameEn: "Probopass",
    nameZhTw: "大朝北鼻",
    types: ["ROCK", "STEEL"],
    familyKey: "HOENN_FAMILY_299"
  },
  {
    dexNumber: 477,
    nameEn: "Dusknoir",
    nameZhTw: "黑夜魔靈",
    types: ["GHOST"],
    familyKey: "HOENN_FAMILY_355"
  },
  {
    dexNumber: 478,
    nameEn: "Froslass",
    nameZhTw: "雪妖女",
    types: ["ICE", "GHOST"],
    familyKey: "HOENN_FAMILY_361"
  },
  {
    dexNumber: 479,
    nameEn: "Rotom",
    nameZhTw: "洛托姆",
    types: ["ELECTRIC", "GHOST"],
    familyKey: "SINNOH_FAMILY_479"
  },
  {
    dexNumber: 480,
    nameEn: "Uxie",
    nameZhTw: "由克希",
    types: ["PSYCHIC"],
    familyKey: "SINNOH_FAMILY_480"
  },
  {
    dexNumber: 481,
    nameEn: "Mesprit",
    nameZhTw: "艾姆利多",
    types: ["PSYCHIC"],
    familyKey: "SINNOH_FAMILY_481"
  },
  {
    dexNumber: 482,
    nameEn: "Azelf",
    nameZhTw: "亞克諾姆",
    types: ["PSYCHIC"],
    familyKey: "SINNOH_FAMILY_482"
  },
  {
    dexNumber: 483,
    nameEn: "Dialga",
    nameZhTw: "帝牙盧卡",
    types: ["STEEL", "DRAGON"],
    familyKey: "SINNOH_FAMILY_483"
  },
  {
    dexNumber: 484,
    nameEn: "Palkia",
    nameZhTw: "帕路奇亞",
    types: ["WATER", "DRAGON"],
    familyKey: "SINNOH_FAMILY_484"
  },
  {
    dexNumber: 485,
    nameEn: "Heatran",
    nameZhTw: "席多藍恩",
    types: ["FIRE", "STEEL"],
    familyKey: "SINNOH_FAMILY_485"
  },
  {
    dexNumber: 486,
    nameEn: "Regigigas",
    nameZhTw: "雷吉奇卡斯",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_486"
  },
  {
    dexNumber: 487,
    nameEn: "Giratina",
    nameZhTw: "騎拉帝納",
    types: ["GHOST", "DRAGON"],
    familyKey: "SINNOH_FAMILY_487"
  },
  {
    dexNumber: 488,
    nameEn: "Cresselia",
    nameZhTw: "克雷色利亞",
    types: ["PSYCHIC"],
    familyKey: "SINNOH_FAMILY_488"
  },
  {
    dexNumber: 489,
    nameEn: "Phione",
    nameZhTw: "霏歐納",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_489"
  },
  {
    dexNumber: 490,
    nameEn: "Manaphy",
    nameZhTw: "瑪納霏",
    types: ["WATER"],
    familyKey: "SINNOH_FAMILY_490"
  },
  {
    dexNumber: 491,
    nameEn: "Darkrai",
    nameZhTw: "達克萊伊",
    types: ["DARK"],
    familyKey: "SINNOH_FAMILY_491"
  },
  {
    dexNumber: 492,
    nameEn: "Shaymin",
    nameZhTw: "謝米",
    types: ["GRASS"],
    familyKey: "SINNOH_FAMILY_492"
  },
  {
    dexNumber: 493,
    nameEn: "Arceus",
    nameZhTw: "阿爾宙斯",
    types: ["NORMAL"],
    familyKey: "SINNOH_FAMILY_493"
  },
];

const speciesByDex = new Map(species417493.map((item) => [item.dexNumber, item] as const));

function makeForm(form: Omit<Gen4BatchForm, "evolutionFamilyNotesZhTw">): Gen4BatchForm {
  const species = speciesByDex.get(form.dexNumber);
  if (!species) throw new Error(`Missing Gen4 species #${form.dexNumber}.`);
  return { ...form, aliases: [...new Set([...form.aliases, species.nameEn, species.nameZhTw])], evolutionFamilyNotesZhTw: note };
}

export const forms417493: Gen4BatchForm[] = [
  makeForm({
    id: "417-sinnoh",
    dexNumber: 417,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ELECTRIC"],
    aliases: ["pachirisu", "帕奇利茲", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "418-sinnoh",
    dexNumber: 418,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["buizel", "泳圈鼬", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "419-sinnoh",
    dexNumber: 419,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["floatzel", "浮潛鼬", "Sinnoh", "神奧"],
    evolvesFromFormId: "418-sinnoh"
  }),
  makeForm({
    id: "420-sinnoh",
    dexNumber: 420,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["cherubi", "櫻花寶", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "421-overcast",
    dexNumber: 421,
    formKey: "OVERCAST",
    formNameEn: "Overcast",
    formNameZhTw: "陰天",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["cherrim", "櫻花兒", "Overcast", "陰天"],
    evolvesFromFormId: "420-sinnoh"
  }),
  makeForm({
    id: "421-sunny",
    dexNumber: 421,
    formKey: "SUNNY",
    formNameEn: "Sunny",
    formNameZhTw: "晴天",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["cherrim", "櫻花兒", "Sunny", "晴天"],
    evolvesFromFormId: "420-sinnoh"
  }),
  makeForm({
    id: "422-east-sea",
    dexNumber: 422,
    formKey: "EAST_SEA",
    formNameEn: "East Sea",
    formNameZhTw: "東海",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["shellos", "無殼海兔", "East Sea", "東海"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "422-west-sea",
    dexNumber: 422,
    formKey: "WEST_SEA",
    formNameEn: "West Sea",
    formNameZhTw: "西海",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["shellos", "無殼海兔", "West Sea", "西海"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "423-east-sea",
    dexNumber: 423,
    formKey: "EAST_SEA",
    formNameEn: "East Sea",
    formNameZhTw: "東海",
    regionKey: "SINNOH",
    types: ["WATER", "GROUND"],
    aliases: ["gastrodon", "海兔獸", "East Sea", "東海"],
    evolvesFromFormId: "422-east-sea"
  }),
  makeForm({
    id: "423-west-sea",
    dexNumber: 423,
    formKey: "WEST_SEA",
    formNameEn: "West Sea",
    formNameZhTw: "西海",
    regionKey: "SINNOH",
    types: ["WATER", "GROUND"],
    aliases: ["gastrodon", "海兔獸", "West Sea", "西海"],
    evolvesFromFormId: "422-west-sea"
  }),
  makeForm({
    id: "424-sinnoh",
    dexNumber: 424,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["ambipom", "雙尾怪手", "Sinnoh", "神奧"],
    evolvesFromFormId: "190-johto"
  }),
  makeForm({
    id: "425-sinnoh",
    dexNumber: 425,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GHOST", "FLYING"],
    aliases: ["drifloon", "飄飄球", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "426-sinnoh",
    dexNumber: 426,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GHOST", "FLYING"],
    aliases: ["drifblim", "隨風球", "Sinnoh", "神奧"],
    evolvesFromFormId: "425-sinnoh"
  }),
  makeForm({
    id: "427-sinnoh",
    dexNumber: 427,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["buneary", "捲捲耳", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "428-sinnoh",
    dexNumber: 428,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["lopunny", "長耳兔", "Sinnoh", "神奧"],
    evolvesFromFormId: "427-sinnoh"
  }),
  makeForm({
    id: "429-sinnoh",
    dexNumber: 429,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GHOST"],
    aliases: ["mismagius", "夢妖魔", "Sinnoh", "神奧"],
    evolvesFromFormId: "200-johto"
  }),
  makeForm({
    id: "430-sinnoh",
    dexNumber: 430,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["DARK", "FLYING"],
    aliases: ["honchkrow", "烏鴉頭頭", "Sinnoh", "神奧"],
    evolvesFromFormId: "198-johto"
  }),
  makeForm({
    id: "431-sinnoh",
    dexNumber: 431,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["glameow", "魅力喵", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "432-sinnoh",
    dexNumber: 432,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["purugly", "東施喵", "Sinnoh", "神奧"],
    evolvesFromFormId: "431-sinnoh"
  }),
  makeForm({
    id: "433-sinnoh",
    dexNumber: 433,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC"],
    aliases: ["chingling", "鈴鐺響", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "434-sinnoh",
    dexNumber: 434,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["POISON", "DARK"],
    aliases: ["stunky", "臭鼬噗", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "435-sinnoh",
    dexNumber: 435,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["POISON", "DARK"],
    aliases: ["skuntank", "坦克臭鼬", "Sinnoh", "神奧"],
    evolvesFromFormId: "434-sinnoh"
  }),
  makeForm({
    id: "436-sinnoh",
    dexNumber: 436,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["STEEL", "PSYCHIC"],
    aliases: ["bronzor", "銅鏡怪", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "437-sinnoh",
    dexNumber: 437,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["STEEL", "PSYCHIC"],
    aliases: ["bronzong", "青銅鐘", "Sinnoh", "神奧"],
    evolvesFromFormId: "436-sinnoh"
  }),
  makeForm({
    id: "438-sinnoh",
    dexNumber: 438,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ROCK"],
    aliases: ["bonsly", "盆才怪", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "439-sinnoh",
    dexNumber: 439,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC", "FAIRY"],
    aliases: ["mime jr.", "魔尼尼", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "440-sinnoh",
    dexNumber: 440,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["happiny", "小福蛋", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "441-sinnoh",
    dexNumber: 441,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL", "FLYING"],
    aliases: ["chatot", "聒噪鳥", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "442-sinnoh",
    dexNumber: 442,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GHOST", "DARK"],
    aliases: ["spiritomb", "花岩怪", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "443-sinnoh",
    dexNumber: 443,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["DRAGON", "GROUND"],
    aliases: ["gible", "圓陸鯊", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "444-sinnoh",
    dexNumber: 444,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["DRAGON", "GROUND"],
    aliases: ["gabite", "尖牙陸鯊", "Sinnoh", "神奧"],
    evolvesFromFormId: "443-sinnoh"
  }),
  makeForm({
    id: "445-sinnoh",
    dexNumber: 445,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["DRAGON", "GROUND"],
    aliases: ["garchomp", "烈咬陸鯊", "Sinnoh", "神奧"],
    evolvesFromFormId: "444-sinnoh"
  }),
  makeForm({
    id: "446-sinnoh",
    dexNumber: 446,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["munchlax", "小卡比獸", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "447-sinnoh",
    dexNumber: 447,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["FIGHTING"],
    aliases: ["riolu", "利歐路", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "448-sinnoh",
    dexNumber: 448,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["FIGHTING", "STEEL"],
    aliases: ["lucario", "路卡利歐", "Sinnoh", "神奧"],
    evolvesFromFormId: "447-sinnoh"
  }),
  makeForm({
    id: "449-sinnoh",
    dexNumber: 449,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GROUND"],
    aliases: ["hippopotas", "沙河馬", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "450-sinnoh",
    dexNumber: 450,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GROUND"],
    aliases: ["hippowdon", "河馬獸", "Sinnoh", "神奧"],
    evolvesFromFormId: "449-sinnoh"
  }),
  makeForm({
    id: "451-sinnoh",
    dexNumber: 451,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["POISON", "BUG"],
    aliases: ["skorupi", "鉗尾蠍", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "452-sinnoh",
    dexNumber: 452,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["POISON", "DARK"],
    aliases: ["drapion", "龍王蠍", "Sinnoh", "神奧"],
    evolvesFromFormId: "451-sinnoh"
  }),
  makeForm({
    id: "453-sinnoh",
    dexNumber: 453,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["POISON", "FIGHTING"],
    aliases: ["croagunk", "不良蛙", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "454-sinnoh",
    dexNumber: 454,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["POISON", "FIGHTING"],
    aliases: ["toxicroak", "毒骷蛙", "Sinnoh", "神奧"],
    evolvesFromFormId: "453-sinnoh"
  }),
  makeForm({
    id: "455-sinnoh",
    dexNumber: 455,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["carnivine", "尖牙籠", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "456-sinnoh",
    dexNumber: 456,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["finneon", "螢光魚", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "457-sinnoh",
    dexNumber: 457,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["lumineon", "霓虹魚", "Sinnoh", "神奧"],
    evolvesFromFormId: "456-sinnoh"
  }),
  makeForm({
    id: "458-sinnoh",
    dexNumber: 458,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER", "FLYING"],
    aliases: ["mantyke", "小球飛魚", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "459-sinnoh",
    dexNumber: 459,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GRASS", "ICE"],
    aliases: ["snover", "雪笠怪", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "460-sinnoh",
    dexNumber: 460,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GRASS", "ICE"],
    aliases: ["abomasnow", "暴雪王", "Sinnoh", "神奧"],
    evolvesFromFormId: "459-sinnoh"
  }),
  makeForm({
    id: "461-sinnoh",
    dexNumber: 461,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["DARK", "ICE"],
    aliases: ["weavile", "瑪狃拉", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "462-sinnoh",
    dexNumber: 462,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "STEEL"],
    aliases: ["magnezone", "自爆磁怪", "Sinnoh", "神奧"],
    evolvesFromFormId: "082-kanto"
  }),
  makeForm({
    id: "463-sinnoh",
    dexNumber: 463,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["lickilicky", "大舌舔", "Sinnoh", "神奧"],
    evolvesFromFormId: "108-kanto"
  }),
  makeForm({
    id: "464-sinnoh",
    dexNumber: 464,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GROUND", "ROCK"],
    aliases: ["rhyperior", "超甲狂犀", "Sinnoh", "神奧"],
    evolvesFromFormId: "112-kanto"
  }),
  makeForm({
    id: "465-sinnoh",
    dexNumber: 465,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["tangrowth", "巨蔓藤", "Sinnoh", "神奧"],
    evolvesFromFormId: "114-kanto"
  }),
  makeForm({
    id: "466-sinnoh",
    dexNumber: 466,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ELECTRIC"],
    aliases: ["electivire", "電擊魔獸", "Sinnoh", "神奧"],
    evolvesFromFormId: "125-kanto"
  }),
  makeForm({
    id: "467-sinnoh",
    dexNumber: 467,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["FIRE"],
    aliases: ["magmortar", "鴨嘴炎獸", "Sinnoh", "神奧"],
    evolvesFromFormId: "126-kanto"
  }),
  makeForm({
    id: "468-sinnoh",
    dexNumber: 468,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["FAIRY", "FLYING"],
    aliases: ["togekiss", "波克基斯", "Sinnoh", "神奧"],
    evolvesFromFormId: "176-johto"
  }),
  makeForm({
    id: "469-sinnoh",
    dexNumber: 469,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["BUG", "FLYING"],
    aliases: ["yanmega", "遠古巨蜓", "Sinnoh", "神奧"],
    evolvesFromFormId: "193-johto"
  }),
  makeForm({
    id: "470-sinnoh",
    dexNumber: 470,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["leafeon", "葉伊布", "Sinnoh", "神奧"],
    evolvesFromFormId: "133-kanto"
  }),
  makeForm({
    id: "471-sinnoh",
    dexNumber: 471,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ICE"],
    aliases: ["glaceon", "冰伊布", "Sinnoh", "神奧"],
    evolvesFromFormId: "133-kanto"
  }),
  makeForm({
    id: "472-sinnoh",
    dexNumber: 472,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GROUND", "FLYING"],
    aliases: ["gliscor", "天蠍王", "Sinnoh", "神奧"],
    evolvesFromFormId: "207-johto"
  }),
  makeForm({
    id: "473-sinnoh",
    dexNumber: 473,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ICE", "GROUND"],
    aliases: ["mamoswine", "象牙豬", "Sinnoh", "神奧"],
    evolvesFromFormId: "221-johto"
  }),
  makeForm({
    id: "474-sinnoh",
    dexNumber: 474,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["porygon-z", "多邊獸Ｚ", "Sinnoh", "神奧"],
    evolvesFromFormId: "233-johto"
  }),
  makeForm({
    id: "475-sinnoh",
    dexNumber: 475,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC", "FIGHTING"],
    aliases: ["gallade", "艾路雷朵", "Sinnoh", "神奧"],
    evolvesFromFormId: "281-hoenn"
  }),
  makeForm({
    id: "476-sinnoh",
    dexNumber: 476,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ROCK", "STEEL"],
    aliases: ["probopass", "大朝北鼻", "Sinnoh", "神奧"],
    evolvesFromFormId: "299-hoenn"
  }),
  makeForm({
    id: "477-sinnoh",
    dexNumber: 477,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["GHOST"],
    aliases: ["dusknoir", "黑夜魔靈", "Sinnoh", "神奧"],
    evolvesFromFormId: "356-hoenn"
  }),
  makeForm({
    id: "478-sinnoh",
    dexNumber: 478,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ICE", "GHOST"],
    aliases: ["froslass", "雪妖女", "Sinnoh", "神奧"],
    evolvesFromFormId: "361-hoenn"
  }),
  makeForm({
    id: "479-fan",
    dexNumber: 479,
    formKey: "FAN",
    formNameEn: "Fan",
    formNameZhTw: "風扇",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "FLYING"],
    aliases: ["rotom", "洛托姆", "Fan", "風扇"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "479-frost",
    dexNumber: 479,
    formKey: "FROST",
    formNameEn: "Frost",
    formNameZhTw: "冰箱",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "ICE"],
    aliases: ["rotom", "洛托姆", "Frost", "冰箱"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "479-heat",
    dexNumber: 479,
    formKey: "HEAT",
    formNameEn: "Heat",
    formNameZhTw: "微波爐",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "FIRE"],
    aliases: ["rotom", "洛托姆", "Heat", "微波爐"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "479-mow",
    dexNumber: 479,
    formKey: "MOW",
    formNameEn: "Mow",
    formNameZhTw: "割草機",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "GRASS"],
    aliases: ["rotom", "洛托姆", "Mow", "割草機"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "479-sinnoh",
    dexNumber: 479,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "GHOST"],
    aliases: ["rotom", "洛托姆", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "479-wash",
    dexNumber: 479,
    formKey: "WASH",
    formNameEn: "Wash",
    formNameZhTw: "洗衣機",
    regionKey: "SINNOH",
    types: ["ELECTRIC", "WATER"],
    aliases: ["rotom", "洛托姆", "Wash", "洗衣機"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "480-sinnoh",
    dexNumber: 480,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC"],
    aliases: ["uxie", "由克希", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "481-sinnoh",
    dexNumber: 481,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC"],
    aliases: ["mesprit", "艾姆利多", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "482-sinnoh",
    dexNumber: 482,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC"],
    aliases: ["azelf", "亞克諾姆", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "483-origin",
    dexNumber: 483,
    formKey: "ORIGIN",
    formNameEn: "Origin Forme",
    formNameZhTw: "起源形態",
    regionKey: "SINNOH",
    types: ["STEEL", "DRAGON"],
    aliases: ["dialga", "帝牙盧卡", "Origin Forme", "起源形態"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "483-sinnoh",
    dexNumber: 483,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["STEEL", "DRAGON"],
    aliases: ["dialga", "帝牙盧卡", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "484-origin",
    dexNumber: 484,
    formKey: "ORIGIN",
    formNameEn: "Origin Forme",
    formNameZhTw: "起源形態",
    regionKey: "SINNOH",
    types: ["WATER", "DRAGON"],
    aliases: ["palkia", "帕路奇亞", "Origin Forme", "起源形態"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "484-sinnoh",
    dexNumber: 484,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER", "DRAGON"],
    aliases: ["palkia", "帕路奇亞", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "485-sinnoh",
    dexNumber: 485,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["FIRE", "STEEL"],
    aliases: ["heatran", "席多藍恩", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "486-sinnoh",
    dexNumber: 486,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["regigigas", "雷吉奇卡斯", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "487-altered",
    dexNumber: 487,
    formKey: "ALTERED",
    formNameEn: "Altered Forme",
    formNameZhTw: "變化形態",
    regionKey: "SINNOH",
    types: ["GHOST", "DRAGON"],
    aliases: ["giratina", "騎拉帝納", "Altered Forme", "變化形態"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "487-origin",
    dexNumber: 487,
    formKey: "ORIGIN",
    formNameEn: "Origin Forme",
    formNameZhTw: "起源形態",
    regionKey: "SINNOH",
    types: ["GHOST", "DRAGON"],
    aliases: ["giratina", "騎拉帝納", "Origin Forme", "起源形態"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "488-sinnoh",
    dexNumber: 488,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["PSYCHIC"],
    aliases: ["cresselia", "克雷色利亞", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "489-sinnoh",
    dexNumber: 489,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["phione", "霏歐納", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "490-sinnoh",
    dexNumber: 490,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["manaphy", "瑪納霏", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "491-sinnoh",
    dexNumber: 491,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types: ["DARK"],
    aliases: ["darkrai", "達克萊伊", "Sinnoh", "神奧"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "492-land",
    dexNumber: 492,
    formKey: "LAND",
    formNameEn: "Land Forme",
    formNameZhTw: "陸地形態",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["shaymin", "謝米", "Land Forme", "陸地形態"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "492-sky",
    dexNumber: 492,
    formKey: "SKY",
    formNameEn: "Sky Forme",
    formNameZhTw: "天空形態",
    regionKey: "SINNOH",
    types: ["GRASS", "FLYING"],
    aliases: ["shaymin", "謝米", "Sky Forme", "天空形態"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-bug",
    dexNumber: 493,
    formKey: "BUG",
    formNameEn: "Bug",
    formNameZhTw: "蟲",
    regionKey: "SINNOH",
    types: ["BUG"],
    aliases: ["arceus", "阿爾宙斯", "Bug", "蟲"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-dark",
    dexNumber: 493,
    formKey: "DARK",
    formNameEn: "Dark",
    formNameZhTw: "惡",
    regionKey: "SINNOH",
    types: ["DARK"],
    aliases: ["arceus", "阿爾宙斯", "Dark", "惡"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-dragon",
    dexNumber: 493,
    formKey: "DRAGON",
    formNameEn: "Dragon",
    formNameZhTw: "龍",
    regionKey: "SINNOH",
    types: ["DRAGON"],
    aliases: ["arceus", "阿爾宙斯", "Dragon", "龍"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-electric",
    dexNumber: 493,
    formKey: "ELECTRIC",
    formNameEn: "Electric",
    formNameZhTw: "電",
    regionKey: "SINNOH",
    types: ["ELECTRIC"],
    aliases: ["arceus", "阿爾宙斯", "Electric", "電"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-fairy",
    dexNumber: 493,
    formKey: "FAIRY",
    formNameEn: "Fairy",
    formNameZhTw: "妖精",
    regionKey: "SINNOH",
    types: ["FAIRY"],
    aliases: ["arceus", "阿爾宙斯", "Fairy", "妖精"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-fighting",
    dexNumber: 493,
    formKey: "FIGHTING",
    formNameEn: "Fighting",
    formNameZhTw: "格鬥",
    regionKey: "SINNOH",
    types: ["FIGHTING"],
    aliases: ["arceus", "阿爾宙斯", "Fighting", "格鬥"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-fire",
    dexNumber: 493,
    formKey: "FIRE",
    formNameEn: "Fire",
    formNameZhTw: "火",
    regionKey: "SINNOH",
    types: ["FIRE"],
    aliases: ["arceus", "阿爾宙斯", "Fire", "火"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-flying",
    dexNumber: 493,
    formKey: "FLYING",
    formNameEn: "Flying",
    formNameZhTw: "飛行",
    regionKey: "SINNOH",
    types: ["FLYING"],
    aliases: ["arceus", "阿爾宙斯", "Flying", "飛行"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-ghost",
    dexNumber: 493,
    formKey: "GHOST",
    formNameEn: "Ghost",
    formNameZhTw: "幽靈",
    regionKey: "SINNOH",
    types: ["GHOST"],
    aliases: ["arceus", "阿爾宙斯", "Ghost", "幽靈"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-grass",
    dexNumber: 493,
    formKey: "GRASS",
    formNameEn: "Grass",
    formNameZhTw: "草",
    regionKey: "SINNOH",
    types: ["GRASS"],
    aliases: ["arceus", "阿爾宙斯", "Grass", "草"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-ground",
    dexNumber: 493,
    formKey: "GROUND",
    formNameEn: "Ground",
    formNameZhTw: "地面",
    regionKey: "SINNOH",
    types: ["GROUND"],
    aliases: ["arceus", "阿爾宙斯", "Ground", "地面"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-ice",
    dexNumber: 493,
    formKey: "ICE",
    formNameEn: "Ice",
    formNameZhTw: "冰",
    regionKey: "SINNOH",
    types: ["ICE"],
    aliases: ["arceus", "阿爾宙斯", "Ice", "冰"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-normal",
    dexNumber: 493,
    formKey: "NORMAL",
    formNameEn: "Normal",
    formNameZhTw: "一般",
    regionKey: "SINNOH",
    types: ["NORMAL"],
    aliases: ["arceus", "阿爾宙斯", "Normal", "一般"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-poison",
    dexNumber: 493,
    formKey: "POISON",
    formNameEn: "Poison",
    formNameZhTw: "毒",
    regionKey: "SINNOH",
    types: ["POISON"],
    aliases: ["arceus", "阿爾宙斯", "Poison", "毒"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-psychic",
    dexNumber: 493,
    formKey: "PSYCHIC",
    formNameEn: "Psychic",
    formNameZhTw: "超能力",
    regionKey: "SINNOH",
    types: ["PSYCHIC"],
    aliases: ["arceus", "阿爾宙斯", "Psychic", "超能力"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-rock",
    dexNumber: 493,
    formKey: "ROCK",
    formNameEn: "Rock",
    formNameZhTw: "岩石",
    regionKey: "SINNOH",
    types: ["ROCK"],
    aliases: ["arceus", "阿爾宙斯", "Rock", "岩石"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-steel",
    dexNumber: 493,
    formKey: "STEEL",
    formNameEn: "Steel",
    formNameZhTw: "鋼",
    regionKey: "SINNOH",
    types: ["STEEL"],
    aliases: ["arceus", "阿爾宙斯", "Steel", "鋼"],
    evolvesFromFormId: null
  }),
  makeForm({
    id: "493-water",
    dexNumber: 493,
    formKey: "WATER",
    formNameEn: "Water",
    formNameZhTw: "水",
    regionKey: "SINNOH",
    types: ["WATER"],
    aliases: ["arceus", "阿爾宙斯", "Water", "水"],
    evolvesFromFormId: null
  }),
];

export const evolutionPairs417493: readonly Gen4EvolutionPair[] = [
  ["418-sinnoh", "419-sinnoh"],
  ["425-sinnoh", "426-sinnoh"],
  ["427-sinnoh", "428-sinnoh"],
  ["431-sinnoh", "432-sinnoh"],
  ["434-sinnoh", "435-sinnoh"],
  ["436-sinnoh", "437-sinnoh"],
  ["443-sinnoh", "444-sinnoh"],
  ["444-sinnoh", "445-sinnoh"],
  ["447-sinnoh", "448-sinnoh"],
  ["449-sinnoh", "450-sinnoh"],
  ["451-sinnoh", "452-sinnoh"],
  ["453-sinnoh", "454-sinnoh"],
  ["456-sinnoh", "457-sinnoh"],
  ["459-sinnoh", "460-sinnoh"],
  ["420-sinnoh", "421-overcast"],
  ["420-sinnoh", "421-sunny"],
  ["422-east-sea", "423-east-sea"],
  ["422-west-sea", "423-west-sea"],
  ["438-sinnoh", "185-johto"],
  ["439-sinnoh", "122-kanto"],
  ["440-sinnoh", "113-kanto"],
  ["446-sinnoh", "143-kanto"],
  ["458-sinnoh", "226-johto"],
  ["190-johto", "424-sinnoh"],
  ["200-johto", "429-sinnoh"],
  ["198-johto", "430-sinnoh"],
  ["193-johto", "469-sinnoh"],
  ["207-johto", "472-sinnoh"],
  ["215-johto", "461-sinnoh"],
  ["221-johto", "473-sinnoh"],
  ["233-johto", "474-sinnoh"],
  ["281-hoenn", "475-sinnoh"],
  ["299-hoenn", "476-sinnoh"],
  ["356-hoenn", "477-sinnoh"],
  ["361-hoenn", "478-sinnoh"],
  ["082-kanto", "462-sinnoh"],
  ["108-kanto", "463-sinnoh"],
  ["112-kanto", "464-sinnoh"],
  ["114-kanto", "465-sinnoh"],
  ["125-kanto", "466-sinnoh"],
  ["126-kanto", "467-sinnoh"],
  ["176-johto", "468-sinnoh"],
  ["433-sinnoh", "358-hoenn"],
  ["133-kanto", "470-sinnoh"],
  ["133-kanto", "471-sinnoh"],
];

export const releasedNormalForms417493 = new Set<string>(["417-sinnoh", "418-sinnoh", "419-sinnoh", "420-sinnoh", "421-overcast", "421-sunny", "422-east-sea", "422-west-sea", "423-east-sea", "423-west-sea", "424-sinnoh", "425-sinnoh", "426-sinnoh", "427-sinnoh", "428-sinnoh", "429-sinnoh", "430-sinnoh", "431-sinnoh", "432-sinnoh", "433-sinnoh", "434-sinnoh", "435-sinnoh", "436-sinnoh", "437-sinnoh", "438-sinnoh", "439-sinnoh", "440-sinnoh", "441-sinnoh", "442-sinnoh", "443-sinnoh", "444-sinnoh", "445-sinnoh", "446-sinnoh", "447-sinnoh", "448-sinnoh", "449-sinnoh", "450-sinnoh", "451-sinnoh", "452-sinnoh", "453-sinnoh", "454-sinnoh", "455-sinnoh", "456-sinnoh", "457-sinnoh", "458-sinnoh", "459-sinnoh", "460-sinnoh", "461-sinnoh", "462-sinnoh", "463-sinnoh", "464-sinnoh", "465-sinnoh", "466-sinnoh", "467-sinnoh", "468-sinnoh", "469-sinnoh", "470-sinnoh", "471-sinnoh", "472-sinnoh", "473-sinnoh", "474-sinnoh", "475-sinnoh", "476-sinnoh", "477-sinnoh", "478-sinnoh", "479-fan", "479-frost", "479-heat", "479-mow", "479-sinnoh", "479-wash", "480-sinnoh", "481-sinnoh", "482-sinnoh", "483-origin", "483-sinnoh", "484-origin", "484-sinnoh", "485-sinnoh", "486-sinnoh", "487-altered", "487-origin", "488-sinnoh", "491-sinnoh", "492-land", "492-sky"]);
export const directShadowEncounterForms417493 = new Set<string>([
  "425-sinnoh",
  "431-sinnoh",
  "434-sinnoh",
  "435-sinnoh",
  "443-sinnoh",
  "449-sinnoh",
  "451-sinnoh",
  "453-sinnoh",
  "459-sinnoh",
  "483-sinnoh",
  "484-sinnoh",
  "485-sinnoh",
  "486-sinnoh",
  "487-altered",
  "488-sinnoh",
  "491-sinnoh",
]);
export const releasedDynamaxForms417493 = new Set<string>(["466-sinnoh", "470-sinnoh", "471-sinnoh", "475-sinnoh"]);
export const releasedMegaForms417493 = new Set<string>(["428-sinnoh", "445-sinnoh", "448-sinnoh", "460-sinnoh", "475-sinnoh"]);
const shadowReleaseEvidence417493 = deriveShadowReleaseEvidence(
  directShadowEncounterForms417493,
  evolutionPairs417493,
);
export const releasedShadowForms417493 = new Set<string>(
  [...shadowReleaseEvidence417493.releasedFormIds].filter((id) => forms417493.some((form) => form.id === id)),
);
export const releasedGigantamaxForms417493 = new Set<string>();

export const specialVariants417493: Gen4SpecialVariant[] = [
  {
    id: "428-sinnoh-mega",
    formId: "428-sinnoh",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega"
  },
  {
    id: "445-sinnoh-mega",
    formId: "445-sinnoh",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega"
  },
  {
    id: "448-sinnoh-mega",
    formId: "448-sinnoh",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega"
  },
  {
    id: "460-sinnoh-mega",
    formId: "460-sinnoh",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega"
  },
  {
    id: "475-sinnoh-mega",
    formId: "475-sinnoh",
    variantKey: "MEGA",
    released: true,
    nameZhTw: "Mega"
  },
  {
    id: "478-sinnoh-mega",
    formId: "478-sinnoh",
    variantKey: "MEGA",
    released: false,
    nameZhTw: "Mega"
  },
  {
    id: "485-sinnoh-mega",
    formId: "485-sinnoh",
    variantKey: "MEGA",
    released: false,
    nameZhTw: "Mega"
  },
  {
    id: "491-sinnoh-mega",
    formId: "491-sinnoh",
    variantKey: "MEGA",
    released: false,
    nameZhTw: "Mega"
  },
];

const pvpokeIds417493: Record<string, { normal: string; shadow: string }> = {
  "417-sinnoh": { normal: "pachirisu", shadow: "pachirisu_shadow" },
  "418-sinnoh": { normal: "buizel", shadow: "buizel_shadow" },
  "419-sinnoh": { normal: "floatzel", shadow: "floatzel_shadow" },
  "420-sinnoh": { normal: "cherubi", shadow: "cherubi_shadow" },
  "421-overcast": { normal: "cherrim_overcast", shadow: "cherrim_overcast_shadow" },
  "421-sunny": { normal: "cherrim_sunny", shadow: "cherrim_sunny_shadow" },
  "422-east-sea": { normal: "shellos", shadow: "shellos_shadow" },
  "422-west-sea": { normal: "shellos", shadow: "shellos_shadow" },
  "423-east-sea": { normal: "gastrodon", shadow: "gastrodon_shadow" },
  "423-west-sea": { normal: "gastrodon", shadow: "gastrodon_shadow" },
  "424-sinnoh": { normal: "ambipom", shadow: "ambipom_shadow" },
  "425-sinnoh": { normal: "drifloon", shadow: "drifloon_shadow" },
  "426-sinnoh": { normal: "drifblim", shadow: "drifblim_shadow" },
  "427-sinnoh": { normal: "buneary", shadow: "buneary_shadow" },
  "428-sinnoh": { normal: "lopunny", shadow: "lopunny_shadow" },
  "429-sinnoh": { normal: "mismagius", shadow: "mismagius_shadow" },
  "430-sinnoh": { normal: "honchkrow", shadow: "honchkrow_shadow" },
  "431-sinnoh": { normal: "glameow", shadow: "glameow_shadow" },
  "432-sinnoh": { normal: "purugly", shadow: "purugly_shadow" },
  "433-sinnoh": { normal: "chingling", shadow: "chingling_shadow" },
  "434-sinnoh": { normal: "stunky", shadow: "stunky_shadow" },
  "435-sinnoh": { normal: "skuntank", shadow: "skuntank_shadow" },
  "436-sinnoh": { normal: "bronzor", shadow: "bronzor_shadow" },
  "437-sinnoh": { normal: "bronzong", shadow: "bronzong_shadow" },
  "438-sinnoh": { normal: "bonsly", shadow: "bonsly_shadow" },
  "439-sinnoh": { normal: "mime_jr", shadow: "mime_jr_shadow" },
  "440-sinnoh": { normal: "happiny", shadow: "happiny_shadow" },
  "441-sinnoh": { normal: "chatot", shadow: "chatot_shadow" },
  "442-sinnoh": { normal: "spiritomb", shadow: "spiritomb_shadow" },
  "443-sinnoh": { normal: "gible", shadow: "gible_shadow" },
  "444-sinnoh": { normal: "gabite", shadow: "gabite_shadow" },
  "445-sinnoh": { normal: "garchomp", shadow: "garchomp_shadow" },
  "446-sinnoh": { normal: "munchlax", shadow: "munchlax_shadow" },
  "447-sinnoh": { normal: "riolu", shadow: "riolu_shadow" },
  "448-sinnoh": { normal: "lucario", shadow: "lucario_shadow" },
  "449-sinnoh": { normal: "hippopotas", shadow: "hippopotas_shadow" },
  "450-sinnoh": { normal: "hippowdon", shadow: "hippowdon_shadow" },
  "451-sinnoh": { normal: "skorupi", shadow: "skorupi_shadow" },
  "452-sinnoh": { normal: "drapion", shadow: "drapion_shadow" },
  "453-sinnoh": { normal: "croagunk", shadow: "croagunk_shadow" },
  "454-sinnoh": { normal: "toxicroak", shadow: "toxicroak_shadow" },
  "455-sinnoh": { normal: "carnivine", shadow: "carnivine_shadow" },
  "456-sinnoh": { normal: "finneon", shadow: "finneon_shadow" },
  "457-sinnoh": { normal: "lumineon", shadow: "lumineon_shadow" },
  "458-sinnoh": { normal: "mantyke", shadow: "mantyke_shadow" },
  "459-sinnoh": { normal: "snover", shadow: "snover_shadow" },
  "460-sinnoh": { normal: "abomasnow", shadow: "abomasnow_shadow" },
  "461-sinnoh": { normal: "weavile", shadow: "weavile_shadow" },
  "462-sinnoh": { normal: "magnezone", shadow: "magnezone_shadow" },
  "463-sinnoh": { normal: "lickilicky", shadow: "lickilicky_shadow" },
  "464-sinnoh": { normal: "rhyperior", shadow: "rhyperior_shadow" },
  "465-sinnoh": { normal: "tangrowth", shadow: "tangrowth_shadow" },
  "466-sinnoh": { normal: "electivire", shadow: "electivire_shadow" },
  "467-sinnoh": { normal: "magmortar", shadow: "magmortar_shadow" },
  "468-sinnoh": { normal: "togekiss", shadow: "togekiss_shadow" },
  "469-sinnoh": { normal: "yanmega", shadow: "yanmega_shadow" },
  "470-sinnoh": { normal: "leafeon", shadow: "leafeon_shadow" },
  "471-sinnoh": { normal: "glaceon", shadow: "glaceon_shadow" },
  "472-sinnoh": { normal: "gliscor", shadow: "gliscor_shadow" },
  "473-sinnoh": { normal: "mamoswine", shadow: "mamoswine_shadow" },
  "474-sinnoh": { normal: "porygon_z", shadow: "porygon_z_shadow" },
  "475-sinnoh": { normal: "gallade", shadow: "gallade_shadow" },
  "476-sinnoh": { normal: "probopass", shadow: "probopass_shadow" },
  "477-sinnoh": { normal: "dusknoir", shadow: "dusknoir_shadow" },
  "478-sinnoh": { normal: "froslass", shadow: "froslass_shadow" },
  "479-fan": { normal: "rotom_fan", shadow: "rotom_fan_shadow" },
  "479-frost": { normal: "rotom_frost", shadow: "rotom_frost_shadow" },
  "479-heat": { normal: "rotom_heat", shadow: "rotom_heat_shadow" },
  "479-mow": { normal: "rotom_mow", shadow: "rotom_mow_shadow" },
  "479-sinnoh": { normal: "rotom", shadow: "rotom_shadow" },
  "479-wash": { normal: "rotom_wash", shadow: "rotom_wash_shadow" },
  "480-sinnoh": { normal: "uxie", shadow: "uxie_shadow" },
  "481-sinnoh": { normal: "mesprit", shadow: "mesprit_shadow" },
  "482-sinnoh": { normal: "azelf", shadow: "azelf_shadow" },
  "483-origin": { normal: "dialga_origin", shadow: "dialga_origin_shadow" },
  "483-sinnoh": { normal: "dialga", shadow: "dialga_shadow" },
  "484-origin": { normal: "palkia_origin", shadow: "palkia_origin_shadow" },
  "484-sinnoh": { normal: "palkia", shadow: "palkia_shadow" },
  "485-sinnoh": { normal: "heatran", shadow: "heatran_shadow" },
  "486-sinnoh": { normal: "regigigas", shadow: "regigigas_shadow" },
  "487-altered": { normal: "giratina_altered", shadow: "giratina_altered_shadow" },
  "487-origin": { normal: "giratina_origin", shadow: "giratina_origin_shadow" },
  "488-sinnoh": { normal: "cresselia", shadow: "cresselia_shadow" },
  "489-sinnoh": { normal: "phione", shadow: "phione_shadow" },
  "490-sinnoh": { normal: "manaphy", shadow: "manaphy_shadow" },
  "491-sinnoh": { normal: "darkrai", shadow: "darkrai_shadow" },
  "492-land": { normal: "shaymin_land", shadow: "shaymin_land_shadow" },
  "492-sky": { normal: "shaymin_sky", shadow: "shaymin_sky_shadow" },
  "493-bug": { normal: "arceus_bug", shadow: "arceus_bug_shadow" },
  "493-dark": { normal: "arceus_dark", shadow: "arceus_dark_shadow" },
  "493-dragon": { normal: "arceus_dragon", shadow: "arceus_dragon_shadow" },
  "493-electric": { normal: "arceus_electric", shadow: "arceus_electric_shadow" },
  "493-fairy": { normal: "arceus_fairy", shadow: "arceus_fairy_shadow" },
  "493-fighting": { normal: "arceus_fighting", shadow: "arceus_fighting_shadow" },
  "493-fire": { normal: "arceus_fire", shadow: "arceus_fire_shadow" },
  "493-flying": { normal: "arceus_flying", shadow: "arceus_flying_shadow" },
  "493-ghost": { normal: "arceus_ghost", shadow: "arceus_ghost_shadow" },
  "493-grass": { normal: "arceus_grass", shadow: "arceus_grass_shadow" },
  "493-ground": { normal: "arceus_ground", shadow: "arceus_ground_shadow" },
  "493-ice": { normal: "arceus_ice", shadow: "arceus_ice_shadow" },
  "493-normal": { normal: "arceus_normal", shadow: "arceus_normal_shadow" },
  "493-poison": { normal: "arceus_poison", shadow: "arceus_poison_shadow" },
  "493-psychic": { normal: "arceus_psychic", shadow: "arceus_psychic_shadow" },
  "493-rock": { normal: "arceus_rock", shadow: "arceus_rock_shadow" },
  "493-steel": { normal: "arceus_steel", shadow: "arceus_steel_shadow" },
  "493-water": { normal: "arceus_water", shadow: "arceus_water_shadow" },
};

export function pvpokeSpeciesId417493(form: Gen4BatchForm, shadow: boolean) {
  const ids = pvpokeIds417493[form.id];
  if (!ids) throw new Error(`Missing PvPoke mapping for ${form.id}.`);
  return shadow ? ids.shadow : ids.normal;
}

export function allPvpokeMappings417493() { return pvpokeIds417493; }

export const pveEvidence417493: Readonly<Record<string, Gen4PveEvidence>> = {
  "445-sinnoh-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Ground attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/445",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：445-sinnoh-normal。"
  },
  "445-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Ground attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/445-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：445-sinnoh-shadow。"
  },
  "464-sinnoh-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Rock attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/464",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：464-sinnoh-normal。"
  },
  "464-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Rock attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/464-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：464-sinnoh-shadow。"
  },
  "473-sinnoh-normal": {
    level: "CORE_INVESTMENT",
    roles: ["Ice attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/473",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：473-sinnoh-normal。"
  },
  "473-sinnoh-shadow": {
    level: "CORE_INVESTMENT",
    roles: ["Ice attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/473-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：473-sinnoh-shadow。"
  },
  "460-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Grass attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/460",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：460-sinnoh-normal。"
  },
  "460-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Grass attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/460-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：460-sinnoh-shadow。"
  },
  "448-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fighting attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/448",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：448-sinnoh-normal。"
  },
  "448-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fighting attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/448-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：448-sinnoh-shadow。"
  },
  "443-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Dragon attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/443-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：443-sinnoh-shadow。"
  },
  "452-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Poison attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/452-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：452-sinnoh-shadow。"
  },
  "466-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Electric attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/466",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：466-sinnoh-normal。"
  },
  "467-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Fire attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/467",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：467-sinnoh-normal。"
  },
  "469-sinnoh-normal": {
    level: "USABLE_OR_BUDGET",
    roles: ["Bug attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/469",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：469-sinnoh-normal。"
  },
  "472-sinnoh-shadow": {
    level: "USABLE_OR_BUDGET",
    roles: ["Ground attacker"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/472-Shadow",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：472-sinnoh-shadow。"
  },
  "487-origin-normal": {
    level: "SPECIAL_USE",
    roles: ["Origin Forme raid utility"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/487",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：487-origin-normal。"
  },
  "492-sky-normal": {
    level: "SPECIAL_USE",
    roles: ["Sky Forme utility"],
    sourceUrl: "https://db.pokemongohub.net/pokemon/492",
    checkedAt: "2026-08-16",
    summaryZhTw: "本批版本級 PvE 證據：492-sky-normal。"
  },
};

export function pveEvidenceForVariant417493(variantId: string) { return pveEvidence417493[variantId] ?? null; }

export const species417446 = species417493.filter((item) => item.dexNumber >= 417 && item.dexNumber <= 446);
export const forms417446 = forms417493.filter((item) => item.dexNumber >= 417 && item.dexNumber <= 446);
export const evolutionPairs417446 = evolutionPairs417493.filter(([from, to]) => { const ids = new Set(forms417446.map((item) => item.id)); return ids.has(from) || ids.has(to); });
export const releasedNormalForms417446 = new Set([...releasedNormalForms417493].filter((id) => forms417446.some((form) => form.id === id)));
export const directShadowEncounterForms417446 = new Set([...directShadowEncounterForms417493].filter((id) => forms417446.some((form) => form.id === id)));
export const releasedShadowForms417446 = new Set([...releasedShadowForms417493].filter((id) => forms417446.some((form) => form.id === id)));
export const releasedMegaForms417446 = new Set([...releasedMegaForms417493].filter((id) => forms417446.some((form) => form.id === id)));
export const releasedDynamaxForms417446 = new Set([...releasedDynamaxForms417493].filter((id) => forms417446.some((form) => form.id === id)));
export const releasedGigantamaxForms417446 = new Set<string>();
export const specialVariants417446 = specialVariants417493.filter((item) => forms417446.some((form) => form.id === item.formId));

export const species447476 = species417493.filter((item) => item.dexNumber >= 447 && item.dexNumber <= 476);
export const forms447476 = forms417493.filter((item) => item.dexNumber >= 447 && item.dexNumber <= 476);
export const evolutionPairs447476 = evolutionPairs417493.filter(([from, to]) => { const ids = new Set(forms447476.map((item) => item.id)); return ids.has(from) || ids.has(to); });
export const releasedNormalForms447476 = new Set([...releasedNormalForms417493].filter((id) => forms447476.some((form) => form.id === id)));
export const directShadowEncounterForms447476 = new Set([...directShadowEncounterForms417493].filter((id) => forms447476.some((form) => form.id === id)));
export const releasedShadowForms447476 = new Set([...releasedShadowForms417493].filter((id) => forms447476.some((form) => form.id === id)));
export const releasedMegaForms447476 = new Set([...releasedMegaForms417493].filter((id) => forms447476.some((form) => form.id === id)));
export const releasedDynamaxForms447476 = new Set([...releasedDynamaxForms417493].filter((id) => forms447476.some((form) => form.id === id)));
export const releasedGigantamaxForms447476 = new Set<string>();
export const specialVariants447476 = specialVariants417493.filter((item) => forms447476.some((form) => form.id === item.formId));

export const species477493 = species417493.filter((item) => item.dexNumber >= 477 && item.dexNumber <= 493);
export const forms477493 = forms417493.filter((item) => item.dexNumber >= 477 && item.dexNumber <= 493);
export const evolutionPairs477493 = evolutionPairs417493.filter(([from, to]) => { const ids = new Set(forms477493.map((item) => item.id)); return ids.has(from) || ids.has(to); });
export const releasedNormalForms477493 = new Set([...releasedNormalForms417493].filter((id) => forms477493.some((form) => form.id === id)));
export const directShadowEncounterForms477493 = new Set([...directShadowEncounterForms417493].filter((id) => forms477493.some((form) => form.id === id)));
export const releasedShadowForms477493 = new Set([...releasedShadowForms417493].filter((id) => forms477493.some((form) => form.id === id)));
export const releasedMegaForms477493 = new Set([...releasedMegaForms417493].filter((id) => forms477493.some((form) => form.id === id)));
export const releasedDynamaxForms477493 = new Set([...releasedDynamaxForms417493].filter((id) => forms477493.some((form) => form.id === id)));
export const releasedGigantamaxForms477493 = new Set<string>();
export const specialVariants477493 = specialVariants417493.filter((item) => forms477493.some((form) => form.id === item.formId));
