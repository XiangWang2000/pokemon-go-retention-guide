import type {
  Gen4BatchForm,
  Gen4BatchSpecies,
  Gen4EvolutionPair,
} from "./batch-gen4-types";

const standardNote =
  "第四世代標準神奧型態；戰鬥版本、推出狀態與用途由後續 Pokémon GO 研究資料分開決定。";

export const species387416: Gen4BatchSpecies[] = [
  { dexNumber: 387, nameEn: "turtwig", nameZhTw: "草苗龜", types: ["GRASS"], familyKey: "SINNOH_FAMILY_387" },
  { dexNumber: 388, nameEn: "grotle", nameZhTw: "樹林龜", types: ["GRASS"], familyKey: "SINNOH_FAMILY_387" },
  { dexNumber: 389, nameEn: "torterra", nameZhTw: "土台龜", types: ["GRASS", "GROUND"], familyKey: "SINNOH_FAMILY_387" },
  { dexNumber: 390, nameEn: "chimchar", nameZhTw: "小火焰猴", types: ["FIRE"], familyKey: "SINNOH_FAMILY_390" },
  { dexNumber: 391, nameEn: "monferno", nameZhTw: "猛火猴", types: ["FIRE", "FIGHTING"], familyKey: "SINNOH_FAMILY_390" },
  { dexNumber: 392, nameEn: "infernape", nameZhTw: "烈焰猴", types: ["FIRE", "FIGHTING"], familyKey: "SINNOH_FAMILY_390" },
  { dexNumber: 393, nameEn: "piplup", nameZhTw: "波加曼", types: ["WATER"], familyKey: "SINNOH_FAMILY_393" },
  { dexNumber: 394, nameEn: "prinplup", nameZhTw: "波皇子", types: ["WATER"], familyKey: "SINNOH_FAMILY_393" },
  { dexNumber: 395, nameEn: "empoleon", nameZhTw: "帝王拿波", types: ["WATER", "STEEL"], familyKey: "SINNOH_FAMILY_393" },
  { dexNumber: 396, nameEn: "starly", nameZhTw: "姆克兒", types: ["NORMAL", "FLYING"], familyKey: "SINNOH_FAMILY_396" },
  { dexNumber: 397, nameEn: "staravia", nameZhTw: "姆克鳥", types: ["NORMAL", "FLYING"], familyKey: "SINNOH_FAMILY_396" },
  { dexNumber: 398, nameEn: "staraptor", nameZhTw: "姆克鷹", types: ["NORMAL", "FLYING"], familyKey: "SINNOH_FAMILY_396" },
  { dexNumber: 399, nameEn: "bidoof", nameZhTw: "大牙狸", types: ["NORMAL"], familyKey: "SINNOH_FAMILY_399" },
  { dexNumber: 400, nameEn: "bibarel", nameZhTw: "大尾狸", types: ["NORMAL", "WATER"], familyKey: "SINNOH_FAMILY_399" },
  { dexNumber: 401, nameEn: "kricketot", nameZhTw: "圓法師", types: ["BUG"], familyKey: "SINNOH_FAMILY_401" },
  { dexNumber: 402, nameEn: "kricketune", nameZhTw: "音箱蟀", types: ["BUG"], familyKey: "SINNOH_FAMILY_401" },
  { dexNumber: 403, nameEn: "shinx", nameZhTw: "小貓怪", types: ["ELECTRIC"], familyKey: "SINNOH_FAMILY_403" },
  { dexNumber: 404, nameEn: "luxio", nameZhTw: "勒克貓", types: ["ELECTRIC"], familyKey: "SINNOH_FAMILY_403" },
  { dexNumber: 405, nameEn: "luxray", nameZhTw: "倫琴貓", types: ["ELECTRIC"], familyKey: "SINNOH_FAMILY_403" },
  { dexNumber: 406, nameEn: "budew", nameZhTw: "含羞苞", types: ["GRASS", "POISON"], familyKey: "HOENN_FAMILY_315" },
  { dexNumber: 407, nameEn: "roserade", nameZhTw: "羅絲雷朵", types: ["GRASS", "POISON"], familyKey: "HOENN_FAMILY_315" },
  { dexNumber: 408, nameEn: "cranidos", nameZhTw: "頭蓋龍", types: ["ROCK"], familyKey: "SINNOH_FAMILY_408" },
  { dexNumber: 409, nameEn: "rampardos", nameZhTw: "戰槌龍", types: ["ROCK"], familyKey: "SINNOH_FAMILY_408" },
  { dexNumber: 410, nameEn: "shieldon", nameZhTw: "盾甲龍", types: ["ROCK", "STEEL"], familyKey: "SINNOH_FAMILY_410" },
  { dexNumber: 411, nameEn: "bastiodon", nameZhTw: "護城龍", types: ["ROCK", "STEEL"], familyKey: "SINNOH_FAMILY_410" },
  { dexNumber: 412, nameEn: "burmy", nameZhTw: "結草兒", types: ["BUG"], familyKey: "SINNOH_FAMILY_412" },
  { dexNumber: 413, nameEn: "wormadam", nameZhTw: "結草貴婦", types: ["BUG", "GRASS"], familyKey: "SINNOH_FAMILY_412" },
  { dexNumber: 414, nameEn: "mothim", nameZhTw: "紳士蛾", types: ["BUG", "FLYING"], familyKey: "SINNOH_FAMILY_412" },
  { dexNumber: 415, nameEn: "combee", nameZhTw: "三蜜蜂", types: ["BUG", "FLYING"], familyKey: "SINNOH_FAMILY_415" },
  { dexNumber: 416, nameEn: "vespiquen", nameZhTw: "蜂女王", types: ["BUG", "FLYING"], familyKey: "SINNOH_FAMILY_415" },
];

const speciesByDex = new Map(species387416.map((species) => [species.dexNumber, species] as const));

function standardForm(
  dexNumber: number,
  types: string[],
  evolvesFromFormId: string | null,
): Gen4BatchForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen 4 batch species #${dexNumber}.`);
  return {
    id: `${dexNumber}-sinnoh`,
    dexNumber,
    formKey: "SINNOH",
    formNameEn: "Sinnoh",
    formNameZhTw: "神奧",
    regionKey: "SINNOH",
    types,
    aliases: [species.nameEn, species.nameZhTw],
    evolvesFromFormId,
    evolutionFamilyNotesZhTw: standardNote,
  };
}

function cloakForm(
  dexNumber: 412 | 413,
  cloak: "PLANT" | "SANDY" | "TRASH",
  formNameEn: string,
  formNameZhTw: string,
  types: string[],
  evolvesFromFormId: string | null,
): Gen4BatchForm {
  const species = speciesByDex.get(dexNumber)!;
  const suffix = cloak.toLowerCase();
  return {
    id: `${dexNumber}-${suffix}-cloak`,
    dexNumber,
    formKey: `${cloak}_CLOAK`,
    formNameEn,
    formNameZhTw,
    regionKey: "SINNOH",
    types,
    aliases: [species.nameEn, species.nameZhTw, formNameEn, formNameZhTw],
    evolvesFromFormId,
    evolutionFamilyNotesZhTw:
      "結草兒／結草貴婦的蓑衣型態分開保存；性別與進化分支條件由 EvolutionPath 研究資料描述。",
  };
}

export const forms387416: Gen4BatchForm[] = [
  standardForm(387, ["GRASS"], null),
  standardForm(388, ["GRASS"], "387-sinnoh"),
  standardForm(389, ["GRASS", "GROUND"], "388-sinnoh"),
  standardForm(390, ["FIRE"], null),
  standardForm(391, ["FIRE", "FIGHTING"], "390-sinnoh"),
  standardForm(392, ["FIRE", "FIGHTING"], "391-sinnoh"),
  standardForm(393, ["WATER"], null),
  standardForm(394, ["WATER"], "393-sinnoh"),
  standardForm(395, ["WATER", "STEEL"], "394-sinnoh"),
  standardForm(396, ["NORMAL", "FLYING"], null),
  standardForm(397, ["NORMAL", "FLYING"], "396-sinnoh"),
  standardForm(398, ["NORMAL", "FLYING"], "397-sinnoh"),
  standardForm(399, ["NORMAL"], null),
  standardForm(400, ["NORMAL", "WATER"], "399-sinnoh"),
  standardForm(401, ["BUG"], null),
  standardForm(402, ["BUG"], "401-sinnoh"),
  standardForm(403, ["ELECTRIC"], null),
  standardForm(404, ["ELECTRIC"], "403-sinnoh"),
  standardForm(405, ["ELECTRIC"], "404-sinnoh"),
  standardForm(406, ["GRASS", "POISON"], null),
  standardForm(407, ["GRASS", "POISON"], "315-hoenn"),
  standardForm(408, ["ROCK"], null),
  standardForm(409, ["ROCK"], "408-sinnoh"),
  standardForm(410, ["ROCK", "STEEL"], null),
  standardForm(411, ["ROCK", "STEEL"], "410-sinnoh"),
  cloakForm(412, "PLANT", "Plant Cloak", "草木蓑衣", ["BUG"], null),
  cloakForm(412, "SANDY", "Sandy Cloak", "砂土蓑衣", ["BUG"], null),
  cloakForm(412, "TRASH", "Trash Cloak", "垃圾蓑衣", ["BUG"], null),
  cloakForm(413, "PLANT", "Plant Cloak", "草木蓑衣", ["BUG", "GRASS"], "412-plant-cloak"),
  cloakForm(413, "SANDY", "Sandy Cloak", "砂土蓑衣", ["BUG", "GROUND"], "412-sandy-cloak"),
  cloakForm(413, "TRASH", "Trash Cloak", "垃圾蓑衣", ["BUG", "STEEL"], "412-trash-cloak"),
  standardForm(414, ["BUG", "FLYING"], null),
  standardForm(415, ["BUG", "FLYING"], null),
  standardForm(416, ["BUG", "FLYING"], "415-sinnoh"),
];

export const evolutionPairs387416: readonly Gen4EvolutionPair[] = [
  ["387-sinnoh", "388-sinnoh"],
  ["388-sinnoh", "389-sinnoh"],
  ["390-sinnoh", "391-sinnoh"],
  ["391-sinnoh", "392-sinnoh"],
  ["393-sinnoh", "394-sinnoh"],
  ["394-sinnoh", "395-sinnoh"],
  ["396-sinnoh", "397-sinnoh"],
  ["397-sinnoh", "398-sinnoh"],
  ["399-sinnoh", "400-sinnoh"],
  ["401-sinnoh", "402-sinnoh"],
  ["403-sinnoh", "404-sinnoh"],
  ["404-sinnoh", "405-sinnoh"],
  ["406-sinnoh", "315-hoenn"],
  ["315-hoenn", "407-sinnoh"],
  ["408-sinnoh", "409-sinnoh"],
  ["410-sinnoh", "411-sinnoh"],
  ["412-plant-cloak", "413-plant-cloak"],
  ["412-sandy-cloak", "413-sandy-cloak"],
  ["412-trash-cloak", "413-trash-cloak"],
  ["412-plant-cloak", "414-sinnoh"],
  ["412-sandy-cloak", "414-sinnoh"],
  ["412-trash-cloak", "414-sinnoh"],
  ["415-sinnoh", "416-sinnoh"],
];
