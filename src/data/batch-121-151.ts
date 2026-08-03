export interface Species121151 {
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  types: string[];
  familyKey: string;
}

export interface Form121151 {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: "KANTO" | "GALAR" | "PALDEA" | "OTHER";
  types: string[];
  aliases: string[];
  evolvesFromFormId?: string;
  evolutionFamilyNotesZhTw: string;
  pvpokeBase?: string;
  pvpokeSuffix?: "galarian" | "combat" | "blaze" | "aqua" | "armored";
}

export type SpecialVariantKey121151 = "MEGA" | "MEGA_X" | "MEGA_Y" | "GIGANTAMAX";

export interface SpecialVariant121151 {
  id: string;
  formId: string;
  variantKey: SpecialVariantKey121151;
  released: boolean;
  nameZhTw: string;
}

const speciesBase = [
  [121, "Starmie", "寶石海星", ["WATER", "PSYCHIC"], "KANTO_FAMILY_120"],
  [122, "Mr. Mime", "魔牆人偶", ["PSYCHIC", "FAIRY"], "KANTO_FAMILY_122"],
  [123, "Scyther", "飛天螳螂", ["BUG", "FLYING"], "KANTO_FAMILY_123"],
  [124, "Jynx", "迷唇姐", ["ICE", "PSYCHIC"], "KANTO_FAMILY_124"],
  [125, "Electabuzz", "電擊獸", ["ELECTRIC"], "KANTO_FAMILY_125"],
  [126, "Magmar", "鴨嘴火獸", ["FIRE"], "KANTO_FAMILY_126"],
  [127, "Pinsir", "凱羅斯", ["BUG"], "KANTO_FAMILY_127"],
  [128, "Tauros", "肯泰羅", ["NORMAL"], "KANTO_FAMILY_128"],
  [129, "Magikarp", "鯉魚王", ["WATER"], "KANTO_FAMILY_129"],
  [130, "Gyarados", "暴鯉龍", ["WATER", "FLYING"], "KANTO_FAMILY_129"],
  [131, "Lapras", "拉普拉斯", ["WATER", "ICE"], "KANTO_FAMILY_131"],
  [132, "Ditto", "百變怪", ["NORMAL"], "KANTO_FAMILY_132"],
  [133, "Eevee", "伊布", ["NORMAL"], "KANTO_FAMILY_133"],
  [134, "Vaporeon", "水伊布", ["WATER"], "KANTO_FAMILY_133"],
  [135, "Jolteon", "雷伊布", ["ELECTRIC"], "KANTO_FAMILY_133"],
  [136, "Flareon", "火伊布", ["FIRE"], "KANTO_FAMILY_133"],
  [137, "Porygon", "多邊獸", ["NORMAL"], "KANTO_FAMILY_137"],
  [138, "Omanyte", "菊石獸", ["ROCK", "WATER"], "KANTO_FAMILY_138"],
  [139, "Omastar", "多刺菊石獸", ["ROCK", "WATER"], "KANTO_FAMILY_138"],
  [140, "Kabuto", "化石盔", ["ROCK", "WATER"], "KANTO_FAMILY_140"],
  [141, "Kabutops", "鐮刀盔", ["ROCK", "WATER"], "KANTO_FAMILY_140"],
  [142, "Aerodactyl", "化石翼龍", ["ROCK", "FLYING"], "KANTO_FAMILY_142"],
  [143, "Snorlax", "卡比獸", ["NORMAL"], "KANTO_FAMILY_143"],
  [144, "Articuno", "急凍鳥", ["ICE", "FLYING"], "KANTO_FAMILY_144"],
  [145, "Zapdos", "閃電鳥", ["ELECTRIC", "FLYING"], "KANTO_FAMILY_145"],
  [146, "Moltres", "火焰鳥", ["FIRE", "FLYING"], "KANTO_FAMILY_146"],
  [147, "Dratini", "迷你龍", ["DRAGON"], "KANTO_FAMILY_147"],
  [148, "Dragonair", "哈克龍", ["DRAGON"], "KANTO_FAMILY_147"],
  [149, "Dragonite", "快龍", ["DRAGON", "FLYING"], "KANTO_FAMILY_147"],
  [150, "Mewtwo", "超夢", ["PSYCHIC"], "KANTO_FAMILY_150"],
  [151, "Mew", "夢幻", ["PSYCHIC"], "KANTO_FAMILY_151"],
] as const;

export const species121151: Species121151[] = speciesBase.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({
    dexNumber,
    nameEn,
    nameZhTw,
    types: [...types],
    familyKey,
  }),
);

const complete = "此型態在 #001～#151 已可執行結論；是否保留由本體用途決定。";
const futureCandidate =
  "後續重要進化仍在 #151 之後；只留符合本體或未來用途的少量候選，不需保留全部重複。";
const starmieNote =
  "已接回 #120 海星星；超級寶石海星公告 2026-08-22 登場，截至 2026-08-03 尚未開放。";
const scytherNote = "後續可進化為巨鉗螳螂；劈斧螳螂目前不能由飛天螳螂進化，不建立虛假路徑。";
const eeveeNote = "本批納入水伊布、雷伊布、火伊布；其他伊布進化仍在後續編號，只留各實際用途候選。";

function kanto(
  dexNumber: number,
  options: Pick<Form121151, "evolvesFromFormId"> & { note?: string; pvpokeBase?: string } = {},
): Form121151 {
  const species = species121151.find((item) => item.dexNumber === dexNumber)!;
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
    pvpokeBase: options.pvpokeBase,
  };
}

export const forms121151: Form121151[] = [
  kanto(121, { evolvesFromFormId: "120-kanto", note: starmieNote }),
  kanto(122, { pvpokeBase: "mr_mime" }),
  {
    id: "122-galar",
    dexNumber: 122,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["ICE", "PSYCHIC"],
    aliases: ["Galarian Mr. Mime", "伽勒爾魔牆人偶"],
    evolutionFamilyNotesZhTw:
      "可進化為後續 #866 踏冰人偶；關都魔牆人偶不使用此路徑，只留少量伽勒爾候選。",
    pvpokeBase: "mr_mime",
    pvpokeSuffix: "galarian",
  },
  kanto(123, { note: scytherNote }),
  kanto(124),
  kanto(125, { note: futureCandidate }),
  kanto(126, { note: futureCandidate }),
  kanto(127),
  kanto(128),
  {
    id: "128-paldea-combat",
    dexNumber: 128,
    formKey: "PALDEA_COMBAT",
    formNameEn: "Paldean Combat Breed",
    formNameZhTw: "帕底亞鬥戰種",
    regionKey: "PALDEA",
    types: ["FIGHTING"],
    aliases: ["Paldean Tauros Combat Breed", "帕底亞肯泰羅鬥戰種"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeBase: "tauros",
    pvpokeSuffix: "combat",
  },
  {
    id: "128-paldea-blaze",
    dexNumber: 128,
    formKey: "PALDEA_BLAZE",
    formNameEn: "Paldean Blaze Breed",
    formNameZhTw: "帕底亞火熾種",
    regionKey: "PALDEA",
    types: ["FIGHTING", "FIRE"],
    aliases: ["Paldean Tauros Blaze Breed", "帕底亞肯泰羅火熾種"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeBase: "tauros",
    pvpokeSuffix: "blaze",
  },
  {
    id: "128-paldea-aqua",
    dexNumber: 128,
    formKey: "PALDEA_AQUA",
    formNameEn: "Paldean Aqua Breed",
    formNameZhTw: "帕底亞水瀾種",
    regionKey: "PALDEA",
    types: ["FIGHTING", "WATER"],
    aliases: ["Paldean Tauros Aqua Breed", "帕底亞肯泰羅水瀾種"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeBase: "tauros",
    pvpokeSuffix: "aqua",
  },
  kanto(129),
  kanto(130, { evolvesFromFormId: "129-kanto" }),
  kanto(131),
  kanto(132),
  kanto(133, { note: eeveeNote }),
  kanto(134, { evolvesFromFormId: "133-kanto", note: eeveeNote }),
  kanto(135, { evolvesFromFormId: "133-kanto", note: eeveeNote }),
  kanto(136, { evolvesFromFormId: "133-kanto", note: eeveeNote }),
  kanto(137, { note: futureCandidate }),
  kanto(138),
  kanto(139, { evolvesFromFormId: "138-kanto" }),
  kanto(140),
  kanto(141, { evolvesFromFormId: "140-kanto" }),
  kanto(142),
  kanto(143),
  kanto(144),
  {
    id: "144-galar",
    dexNumber: 144,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["PSYCHIC", "FLYING"],
    aliases: ["Galarian Articuno", "伽勒爾急凍鳥"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "galarian",
  },
  kanto(145),
  {
    id: "145-galar",
    dexNumber: 145,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["FIGHTING", "FLYING"],
    aliases: ["Galarian Zapdos", "伽勒爾閃電鳥"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "galarian",
  },
  kanto(146),
  {
    id: "146-galar",
    dexNumber: 146,
    formKey: "GALAR",
    formNameEn: "Galarian",
    formNameZhTw: "伽勒爾",
    regionKey: "GALAR",
    types: ["DARK", "FLYING"],
    aliases: ["Galarian Moltres", "伽勒爾火焰鳥"],
    evolutionFamilyNotesZhTw: complete,
    pvpokeSuffix: "galarian",
  },
  kanto(147),
  kanto(148, { evolvesFromFormId: "147-kanto" }),
  kanto(149, { evolvesFromFormId: "148-kanto" }),
  kanto(150),
  {
    id: "150-armored",
    dexNumber: 150,
    formKey: "ARMORED",
    formNameEn: "Armored",
    formNameZhTw: "裝甲",
    regionKey: "OTHER",
    types: ["PSYCHIC"],
    aliases: ["Armored Mewtwo", "裝甲超夢"],
    evolutionFamilyNotesZhTw: "裝甲超夢是獨立型態；不可作超級超夢 X／Y 候選。",
    pvpokeSuffix: "armored",
  },
  kanto(151),
];

export const evolutionPairs121151 = forms121151
  .filter((form) => form.evolvesFromFormId)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const releasedShadowForms121151 = new Set([
  "121-kanto",
  "123-kanto",
  "125-kanto",
  "126-kanto",
  "127-kanto",
  "129-kanto",
  "130-kanto",
  "131-kanto",
  "137-kanto",
  "138-kanto",
  "139-kanto",
  "140-kanto",
  "141-kanto",
  "142-kanto",
  "143-kanto",
  "144-kanto",
  "145-kanto",
  "146-kanto",
  "147-kanto",
  "148-kanto",
  "149-kanto",
  "150-kanto",
]);

export const truncatedForms121151 = new Set([
  "122-galar",
  "123-kanto",
  "125-kanto",
  "126-kanto",
  "133-kanto",
  "137-kanto",
]);

export const announcedUnreleasedMegaForms121151 = new Map([["121-kanto", "2026-08-22"]]);

export const releasedMegaForms121151 = new Set([
  "127-kanto",
  "130-kanto",
  "142-kanto",
  "149-kanto",
]);

export const releasedMegaXForms121151 = new Set(["150-kanto"]);
export const releasedMegaYForms121151 = new Set(["150-kanto"]);

export const releasedDynamaxForms121151 = new Set([
  "133-kanto",
  "134-kanto",
  "135-kanto",
  "136-kanto",
  "144-kanto",
  "145-kanto",
  "146-kanto",
]);

export const releasedGigantamaxForms121151 = new Set(["131-kanto", "143-kanto"]);

export const specialVariants121151: SpecialVariant121151[] = [
  {
    id: "121-kanto-mega",
    formId: "121-kanto",
    variantKey: "MEGA",
    released: false,
    nameZhTw: "超級寶石海星",
  },
  ...[127, 130, 142, 149].map((dexNumber) => ({
    id: `${dexNumber}-kanto-mega`,
    formId: `${dexNumber}-kanto`,
    variantKey: "MEGA" as const,
    released: true,
    nameZhTw: `超級${species121151.find((species) => species.dexNumber === dexNumber)!.nameZhTw}`,
  })),
  {
    id: "150-kanto-mega-x",
    formId: "150-kanto",
    variantKey: "MEGA_X",
    released: true,
    nameZhTw: "超級超夢X",
  },
  {
    id: "150-kanto-mega-y",
    formId: "150-kanto",
    variantKey: "MEGA_Y",
    released: true,
    nameZhTw: "超級超夢Y",
  },
  {
    id: "131-kanto-gigantamax",
    formId: "131-kanto",
    variantKey: "GIGANTAMAX",
    released: true,
    nameZhTw: "超極巨拉普拉斯",
  },
  {
    id: "143-kanto-gigantamax",
    formId: "143-kanto",
    variantKey: "GIGANTAMAX",
    released: true,
    nameZhTw: "超極巨卡比獸",
  },
];

export const conditionalKeepOverrides121151 = new Map<string, { ruleKey: string; reason: string }>([
  ...[127, 130, 142, 149, 150].map((dexNumber) => {
    const id = `${dexNumber}-kanto-normal`;
    const name = species121151.find((species) => species.dexNumber === dexNumber)!.nameZhTw;
    return [
      id,
      {
        ruleKey: "MEGA_BASE_CANDIDATE",
        reason: `${name}是已開放 Mega 的普通基底；保留實際要投入或具聯盟用途的候選，其餘普通重複可傳。`,
      },
    ] as const;
  }),
  [
    "151-kanto-normal",
    {
      ruleKey: "SPECIAL_ACQUISITION",
      reason: "夢幻是一次性／特殊調查取得的幻之寶可夢；即使不是當期頂尖排名也應保留。",
    },
  ] as const,
]);

export const specialAcquisitionForms121151 = new Set(["151-kanto"]);

export function pvpokeSpeciesId121151(form: Form121151, shadow: boolean) {
  const species = species121151.find((item) => item.dexNumber === form.dexNumber)!;
  const base = form.pvpokeBase ?? species.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${base}${form.pvpokeSuffix ? `_${form.pvpokeSuffix}` : ""}${shadow ? "_shadow" : ""}`;
}
