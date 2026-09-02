import type { Gen3Form, Gen3Species, Gen3SpecialVariant, PveUseLevel } from "./batch-gen3-types";

type SpeciesSpec = readonly [number, string, string, readonly string[], string];

const speciesSpecs: SpeciesSpec[] = [
  [282, "gardevoir", "沙奈朵", ["PSYCHIC", "FAIRY"], "HOENN_FAMILY_280"],
  [283, "surskit", "溜溜糖球", ["WATER", "BUG"], "HOENN_FAMILY_283"],
  [284, "masquerain", "雨翅蛾", ["BUG", "FLYING"], "HOENN_FAMILY_283"],
  [285, "shroomish", "蘑蘑菇", ["GRASS"], "HOENN_FAMILY_285"],
  [286, "breloom", "斗笠菇", ["GRASS", "FIGHTING"], "HOENN_FAMILY_285"],
  [287, "slakoth", "懶人獺", ["NORMAL"], "HOENN_FAMILY_287"],
  [288, "vigoroth", "過動猿", ["NORMAL"], "HOENN_FAMILY_287"],
  [289, "slaking", "請假王", ["NORMAL"], "HOENN_FAMILY_287"],
  [290, "nincada", "土居忍士", ["BUG", "GROUND"], "HOENN_FAMILY_290"],
  [291, "ninjask", "鐵面忍者", ["BUG", "FLYING"], "HOENN_FAMILY_290"],
  [292, "shedinja", "脫殼忍者", ["BUG", "GHOST"], "HOENN_FAMILY_290"],
  [293, "whismur", "咕妞妞", ["NORMAL"], "HOENN_FAMILY_293"],
  [294, "loudred", "吼爆彈", ["NORMAL"], "HOENN_FAMILY_293"],
  [295, "exploud", "爆音怪", ["NORMAL"], "HOENN_FAMILY_293"],
  [296, "makuhita", "幕下力士", ["FIGHTING"], "HOENN_FAMILY_296"],
  [297, "hariyama", "鐵掌力士", ["FIGHTING"], "HOENN_FAMILY_296"],
  [298, "azurill", "露力麗", ["NORMAL", "FAIRY"], "JOHTO_FAMILY_183"],
  [299, "nosepass", "朝北鼻", ["ROCK"], "HOENN_FAMILY_299"],
  [300, "skitty", "向尾喵", ["NORMAL"], "HOENN_FAMILY_300"],
  [301, "delcatty", "優雅貓", ["NORMAL"], "HOENN_FAMILY_300"],
  [302, "sableye", "勾魂眼", ["DARK", "GHOST"], "HOENN_FAMILY_302"],
  [303, "mawile", "大嘴娃", ["STEEL", "FAIRY"], "HOENN_FAMILY_303"],
  [304, "aron", "可可多拉", ["STEEL", "ROCK"], "HOENN_FAMILY_304"],
  [305, "lairon", "可多拉", ["STEEL", "ROCK"], "HOENN_FAMILY_304"],
  [306, "aggron", "波士可多拉", ["STEEL", "ROCK"], "HOENN_FAMILY_304"],
  [307, "meditite", "瑪沙那", ["FIGHTING", "PSYCHIC"], "HOENN_FAMILY_307"],
  [308, "medicham", "恰雷姆", ["FIGHTING", "PSYCHIC"], "HOENN_FAMILY_307"],
  [309, "electrike", "落雷獸", ["ELECTRIC"], "HOENN_FAMILY_309"],
  [310, "manectric", "雷電獸", ["ELECTRIC"], "HOENN_FAMILY_309"],
  [311, "plusle", "正電拍拍", ["ELECTRIC"], "HOENN_FAMILY_311"],
];

const evolvesFromByDex: Record<number, string> = {
  282: "281-hoenn",
  284: "283-hoenn",
  286: "285-hoenn",
  288: "287-hoenn",
  289: "288-hoenn",
  291: "290-hoenn",
  294: "293-hoenn",
  295: "294-hoenn",
  297: "296-hoenn",
  301: "300-hoenn",
  305: "304-hoenn",
  306: "305-hoenn",
  308: "307-hoenn",
  310: "309-hoenn",
};

const familyNotes: Record<number, string> = {
  290: "第三世代土居忍士家族；土居忍士可進化為鐵面忍者，脫殼忍者是特殊條件取得的同家族成員，不建立不存在的直接進化邊。",
  292: "第三世代土居忍士家族；脫殼忍者為特殊條件取得，與土居忍士共用家族資料但不是土居忍士的直接進化路徑。",
  298: "第三世代寶寶寶可夢；與城都瑪力露家族合併，#298 本身沒有從既有物種回溯的 evolvesFrom 邊。",
};

const standardNote = "第三世代標準豐緣型態；普通、暗影、Mega、Max 與後續進化用途分門評估。";

export const species282311: Gen3Species[] = speciesSpecs.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({
    dexNumber,
    nameEn,
    nameZhTw,
    types: [...types],
    familyKey,
  }),
);

export const forms282311: Gen3Form[] = speciesSpecs.map(([dexNumber, nameEn, nameZhTw, types]) => ({
  id: `${String(dexNumber).padStart(3, "0")}-hoenn`,
  dexNumber,
  formKey: "HOENN",
  formNameEn: "Hoenn",
  formNameZhTw: "豐緣",
  regionKey: "HOENN",
  types: [...types],
  aliases: [nameEn, nameZhTw],
  evolvesFromFormId: evolvesFromByDex[dexNumber] ?? null,
  evolutionFamilyNotesZhTw: familyNotes[dexNumber] ?? standardNote,
  isStub: false,
  includeVariants: true,
}));

export const evolutionPairs282311: readonly [string, string][] = [
  ["281-hoenn", "282-hoenn"],
  ["283-hoenn", "284-hoenn"],
  ["285-hoenn", "286-hoenn"],
  ["287-hoenn", "288-hoenn"],
  ["288-hoenn", "289-hoenn"],
  ["290-hoenn", "291-hoenn"],
  ["293-hoenn", "294-hoenn"],
  ["294-hoenn", "295-hoenn"],
  ["296-hoenn", "297-hoenn"],
  ["298-hoenn", "183-johto"],
  ["300-hoenn", "301-hoenn"],
  ["304-hoenn", "305-hoenn"],
  ["305-hoenn", "306-hoenn"],
  ["307-hoenn", "308-hoenn"],
  ["309-hoenn", "310-hoenn"],
];

export const releasedShadowForms282311 = new Set<string>([
  // 來源直接列出的 Shadow 物種；import 時會沿正式 evolution edges 推導後續型態。
  "282-hoenn",
  "283-hoenn",
  "285-hoenn",
  "287-hoenn",
  "290-hoenn",
  "293-hoenn",
  "296-hoenn",
  "299-hoenn",
  "300-hoenn",
  "302-hoenn",
  "303-hoenn",
  "304-hoenn",
  "305-hoenn",
  "306-hoenn",
  "307-hoenn",
  "308-hoenn",
  "309-hoenn",
  "310-hoenn",
  "311-hoenn",
]);

export const releasedMegaForms282311 = new Set<string>([
  "282-hoenn",
  "302-hoenn",
  "303-hoenn",
  "306-hoenn",
  "308-hoenn",
  "310-hoenn",
]);
export const releasedDynamaxForms282311 = new Set<string>(["282-hoenn", "302-hoenn"]);
export const releasedGigantamaxForms282311 = new Set<string>();

export const specialVariants282311: Gen3SpecialVariant[] = [
  ["282-hoenn", "沙奈朵"],
  ["302-hoenn", "勾魂眼"],
  ["303-hoenn", "大嘴娃"],
  ["306-hoenn", "波士可多拉"],
  ["308-hoenn", "恰雷姆"],
  ["310-hoenn", "雷電獸"],
].map(([formId, nameZhTw]) => ({
  id: `${formId}-mega`,
  formId,
  variantKey: "MEGA" as const,
  released: true,
  nameZhTw: `Mega ${nameZhTw}`,
}));

export const pveUseLevels282311: Record<string, PveUseLevel> = {
  "282-hoenn": "CORE_INVESTMENT",
  "297-hoenn": "USABLE_OR_BUDGET",
  "306-hoenn": "USABLE_OR_BUDGET",
  "308-hoenn": "SPECIAL_USE",
  "310-hoenn": "USABLE_OR_BUDGET",
};

export const maxUseLevels282311: Record<string, PveUseLevel> = {
  "282-hoenn": "USABLE_OR_BUDGET",
  "302-hoenn": "SPECIAL_USE",
};
export const truncatedForms282311 = new Set<string>();

const pvpokeIds282311: Record<string, string> = Object.fromEntries(
  speciesSpecs.map(([dexNumber, nameEn]) => [
    `${String(dexNumber).padStart(3, "0")}-hoenn`,
    nameEn,
  ]),
);

export function pvpokeSpeciesId282311(form: Gen3Form, shadow: boolean) {
  const base =
    pvpokeIds282311[form.id] ??
    form.aliases[0]
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "")
      .replace(/-/g, "_");
  return shadow ? base + "_shadow" : base;
}
