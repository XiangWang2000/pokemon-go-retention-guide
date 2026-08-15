import type { RegionKey } from "../region-key";

/**
 * Independent Gen 4 canonical identity fixture for the first published batch candidate.
 *
 * This file deliberately contains only stable Pokédex identity: National Dex number,
 * names, form identity, region and elemental types. Pokémon GO release state and
 * BattleVariant availability are researched separately and must not be inferred here.
 */
export type CanonicalGen4Species = {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
};

export type CanonicalGen4Form = {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  types: readonly string[];
};

export const canonicalGen4Species387416 = [
  { dexNumber: 387, nameEn: "turtwig", nameZhTw: "草苗龜" },
  { dexNumber: 388, nameEn: "grotle", nameZhTw: "樹林龜" },
  { dexNumber: 389, nameEn: "torterra", nameZhTw: "土台龜" },
  { dexNumber: 390, nameEn: "chimchar", nameZhTw: "小火焰猴" },
  { dexNumber: 391, nameEn: "monferno", nameZhTw: "猛火猴" },
  { dexNumber: 392, nameEn: "infernape", nameZhTw: "烈焰猴" },
  { dexNumber: 393, nameEn: "piplup", nameZhTw: "波加曼" },
  { dexNumber: 394, nameEn: "prinplup", nameZhTw: "波皇子" },
  { dexNumber: 395, nameEn: "empoleon", nameZhTw: "帝王拿波" },
  { dexNumber: 396, nameEn: "starly", nameZhTw: "姆克兒" },
  { dexNumber: 397, nameEn: "staravia", nameZhTw: "姆克鳥" },
  { dexNumber: 398, nameEn: "staraptor", nameZhTw: "姆克鷹" },
  { dexNumber: 399, nameEn: "bidoof", nameZhTw: "大牙狸" },
  { dexNumber: 400, nameEn: "bibarel", nameZhTw: "大尾狸" },
  { dexNumber: 401, nameEn: "kricketot", nameZhTw: "圓法師" },
  { dexNumber: 402, nameEn: "kricketune", nameZhTw: "音箱蟀" },
  { dexNumber: 403, nameEn: "shinx", nameZhTw: "小貓怪" },
  { dexNumber: 404, nameEn: "luxio", nameZhTw: "勒克貓" },
  { dexNumber: 405, nameEn: "luxray", nameZhTw: "倫琴貓" },
  { dexNumber: 406, nameEn: "budew", nameZhTw: "含羞苞" },
  { dexNumber: 407, nameEn: "roserade", nameZhTw: "羅絲雷朵" },
  { dexNumber: 408, nameEn: "cranidos", nameZhTw: "頭蓋龍" },
  { dexNumber: 409, nameEn: "rampardos", nameZhTw: "戰槌龍" },
  { dexNumber: 410, nameEn: "shieldon", nameZhTw: "盾甲龍" },
  { dexNumber: 411, nameEn: "bastiodon", nameZhTw: "護城龍" },
  { dexNumber: 412, nameEn: "burmy", nameZhTw: "結草兒" },
  { dexNumber: 413, nameEn: "wormadam", nameZhTw: "結草貴婦" },
  { dexNumber: 414, nameEn: "mothim", nameZhTw: "紳士蛾" },
  { dexNumber: 415, nameEn: "combee", nameZhTw: "三蜜蜂" },
  { dexNumber: 416, nameEn: "vespiquen", nameZhTw: "蜂女王" },
] as const satisfies readonly CanonicalGen4Species[];

const sinnohForm = (
  dexNumber: number,
  types: readonly string[],
): CanonicalGen4Form => ({
  id: `${dexNumber}-sinnoh`,
  dexNumber,
  formKey: "SINNOH",
  formNameEn: "Sinnoh",
  formNameZhTw: "神奧",
  regionKey: "SINNOH",
  types,
});

export const canonicalGen4Forms387416 = [
  sinnohForm(387, ["GRASS"]),
  sinnohForm(388, ["GRASS"]),
  sinnohForm(389, ["GRASS", "GROUND"]),
  sinnohForm(390, ["FIRE"]),
  sinnohForm(391, ["FIRE", "FIGHTING"]),
  sinnohForm(392, ["FIRE", "FIGHTING"]),
  sinnohForm(393, ["WATER"]),
  sinnohForm(394, ["WATER"]),
  sinnohForm(395, ["WATER", "STEEL"]),
  sinnohForm(396, ["NORMAL", "FLYING"]),
  sinnohForm(397, ["NORMAL", "FLYING"]),
  sinnohForm(398, ["NORMAL", "FLYING"]),
  sinnohForm(399, ["NORMAL"]),
  sinnohForm(400, ["NORMAL", "WATER"]),
  sinnohForm(401, ["BUG"]),
  sinnohForm(402, ["BUG"]),
  sinnohForm(403, ["ELECTRIC"]),
  sinnohForm(404, ["ELECTRIC"]),
  sinnohForm(405, ["ELECTRIC"]),
  sinnohForm(406, ["GRASS", "POISON"]),
  sinnohForm(407, ["GRASS", "POISON"]),
  sinnohForm(408, ["ROCK"]),
  sinnohForm(409, ["ROCK"]),
  sinnohForm(410, ["ROCK", "STEEL"]),
  sinnohForm(411, ["ROCK", "STEEL"]),
  {
    id: "412-plant-cloak",
    dexNumber: 412,
    formKey: "PLANT_CLOAK",
    formNameEn: "Plant Cloak",
    formNameZhTw: "草木蓑衣",
    regionKey: "SINNOH",
    types: ["BUG"],
  },
  {
    id: "412-sandy-cloak",
    dexNumber: 412,
    formKey: "SANDY_CLOAK",
    formNameEn: "Sandy Cloak",
    formNameZhTw: "砂土蓑衣",
    regionKey: "SINNOH",
    types: ["BUG"],
  },
  {
    id: "412-trash-cloak",
    dexNumber: 412,
    formKey: "TRASH_CLOAK",
    formNameEn: "Trash Cloak",
    formNameZhTw: "垃圾蓑衣",
    regionKey: "SINNOH",
    types: ["BUG"],
  },
  {
    id: "413-plant-cloak",
    dexNumber: 413,
    formKey: "PLANT_CLOAK",
    formNameEn: "Plant Cloak",
    formNameZhTw: "草木蓑衣",
    regionKey: "SINNOH",
    types: ["BUG", "GRASS"],
  },
  {
    id: "413-sandy-cloak",
    dexNumber: 413,
    formKey: "SANDY_CLOAK",
    formNameEn: "Sandy Cloak",
    formNameZhTw: "砂土蓑衣",
    regionKey: "SINNOH",
    types: ["BUG", "GROUND"],
  },
  {
    id: "413-trash-cloak",
    dexNumber: 413,
    formKey: "TRASH_CLOAK",
    formNameEn: "Trash Cloak",
    formNameZhTw: "垃圾蓑衣",
    regionKey: "SINNOH",
    types: ["BUG", "STEEL"],
  },
  sinnohForm(414, ["BUG", "FLYING"]),
  sinnohForm(415, ["BUG", "FLYING"]),
  sinnohForm(416, ["BUG", "FLYING"]),
] as const satisfies readonly CanonicalGen4Form[];

export const GEN4_BATCH_387_416_MIN = 387;
export const GEN4_BATCH_387_416_MAX = 416;
