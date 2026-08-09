import type { Gen3Form, Gen3Species, Gen3SpecialVariant, PveUseLevel } from "./batch-gen3-types";

type SpeciesSpec = readonly [number, string, string, readonly string[], string];

const speciesSpecs: SpeciesSpec[] = [
  [312, "minun", "負電拍拍", ["ELECTRIC"], "HOENN_FAMILY_312"],
  [313, "volbeat", "電螢蟲", ["BUG"], "HOENN_FAMILY_313"],
  [314, "illumise", "甜甜螢", ["BUG"], "HOENN_FAMILY_314"],
  [315, "roselia", "毒薔薇", ["GRASS", "POISON"], "HOENN_FAMILY_315"],
  [316, "gulpin", "溶食獸", ["POISON"], "HOENN_FAMILY_316"],
  [317, "swalot", "吞食獸", ["POISON"], "HOENN_FAMILY_316"],
  [318, "carvanha", "利牙鯊", ["WATER", "DARK"], "HOENN_FAMILY_318"],
  [319, "sharpedo", "巨牙鯊", ["WATER", "DARK"], "HOENN_FAMILY_318"],
  [320, "wailmer", "吼吼鯨", ["WATER"], "HOENN_FAMILY_320"],
  [321, "wailord", "吼鯨王", ["WATER"], "HOENN_FAMILY_320"],
  [322, "numel", "呆火駝", ["FIRE", "GROUND"], "HOENN_FAMILY_322"],
  [323, "camerupt", "噴火駝", ["FIRE", "GROUND"], "HOENN_FAMILY_322"],
  [324, "torkoal", "煤炭龜", ["FIRE"], "HOENN_FAMILY_324"],
  [325, "spoink", "跳跳豬", ["PSYCHIC"], "HOENN_FAMILY_325"],
  [326, "grumpig", "\u5657\u5657\u8c6c", ["PSYCHIC"], "HOENN_FAMILY_325"],
  [327, "spinda", "晃晃斑", ["NORMAL"], "HOENN_FAMILY_327"],
  [328, "trapinch", "\u5927\u984e\u87fb", ["GROUND"], "HOENN_FAMILY_328"],
  [329, "vibrava", "超音波幼蟲", ["GROUND", "DRAGON"], "HOENN_FAMILY_328"],
  [330, "flygon", "沙漠蜻蜓", ["GROUND", "DRAGON"], "HOENN_FAMILY_328"],
  [331, "cacnea", "刺球仙人掌", ["GRASS"], "HOENN_FAMILY_331"],
  [332, "cacturne", "夢歌仙人掌", ["GRASS", "DARK"], "HOENN_FAMILY_331"],
  [333, "swablu", "青綿鳥", ["NORMAL", "FLYING"], "HOENN_FAMILY_333"],
  [334, "altaria", "七夕青鳥", ["DRAGON", "FLYING"], "HOENN_FAMILY_333"],
  [335, "zangoose", "貓鼬斬", ["NORMAL"], "HOENN_FAMILY_335"],
  [336, "seviper", "飯匙蛇", ["POISON"], "HOENN_FAMILY_336"],
  [337, "lunatone", "月石", ["ROCK", "PSYCHIC"], "HOENN_FAMILY_337"],
  [338, "solrock", "太陽岩", ["ROCK", "PSYCHIC"], "HOENN_FAMILY_338"],
  [339, "barboach", "泥泥鰍", ["WATER", "GROUND"], "HOENN_FAMILY_339"],
  [340, "whiscash", "\u9bf0\u9b5a\u738b", ["WATER", "GROUND"], "HOENN_FAMILY_339"],
  [341, "corphish", "龍蝦小兵", ["WATER"], "HOENN_FAMILY_341"],
  [342, "crawdaunt", "鐵螯龍蝦", ["WATER", "DARK"], "HOENN_FAMILY_341"],
  [343, "baltoy", "天秤偶", ["GROUND", "PSYCHIC"], "HOENN_FAMILY_343"],
  [344, "claydol", "念力土偶", ["GROUND", "PSYCHIC"], "HOENN_FAMILY_343"],
  [345, "lileep", "觸手百合", ["ROCK", "GRASS"], "HOENN_FAMILY_345"],
  [346, "cradily", "搖籃百合", ["ROCK", "GRASS"], "HOENN_FAMILY_345"],
  [347, "anorith", "太古羽蟲", ["ROCK", "BUG"], "HOENN_FAMILY_347"],
  [348, "armaldo", "太古盔甲", ["ROCK", "BUG"], "HOENN_FAMILY_347"],
  [349, "feebas", "醜醜魚", ["WATER"], "HOENN_FAMILY_349"],
  [350, "milotic", "美納斯", ["WATER"], "HOENN_FAMILY_349"],
  [351, "castform", "飄浮泡泡", ["NORMAL"], "HOENN_FAMILY_351"],
  [352, "kecleon", "變隱龍", ["NORMAL"], "HOENN_FAMILY_352"],
  [353, "shuppet", "怨影娃娃", ["GHOST"], "HOENN_FAMILY_353"],
  [354, "banette", "詛咒娃娃", ["GHOST"], "HOENN_FAMILY_353"],
  [355, "duskull", "夜巡靈", ["GHOST"], "HOENN_FAMILY_355"],
  [356, "dusclops", "彷徨夜靈", ["GHOST"], "HOENN_FAMILY_355"],
  [357, "tropius", "熱帶龍", ["GRASS", "FLYING"], "HOENN_FAMILY_357"],
  [358, "chimecho", "風鈴鈴", ["PSYCHIC"], "HOENN_FAMILY_358"],
  [359, "absol", "阿勃梭魯", ["DARK"], "HOENN_FAMILY_359"],
  [360, "wynaut", "小果然", ["PSYCHIC"], "JOHTO_FAMILY_202"],
  [361, "snorunt", "雪童子", ["ICE"], "HOENN_FAMILY_361"],
  [362, "glalie", "冰鬼護", ["ICE"], "HOENN_FAMILY_361"],
  [363, "spheal", "海豹球", ["ICE", "WATER"], "HOENN_FAMILY_363"],
  [364, "sealeo", "海魔獅", ["ICE", "WATER"], "HOENN_FAMILY_363"],
  [365, "walrein", "帝牙海獅", ["ICE", "WATER"], "HOENN_FAMILY_363"],
  [366, "clamperl", "珍珠貝", ["WATER"], "HOENN_FAMILY_366"],
  [367, "huntail", "獵斑魚", ["WATER"], "HOENN_FAMILY_366"],
  [368, "gorebyss", "櫻花魚", ["WATER"], "HOENN_FAMILY_366"],
  [369, "relicanth", "古空棘魚", ["WATER", "ROCK"], "HOENN_FAMILY_369"],
  [370, "luvdisc", "愛心魚", ["WATER"], "HOENN_FAMILY_370"],
  [371, "bagon", "寶貝龍", ["DRAGON"], "HOENN_FAMILY_371"],
  [372, "shelgon", "甲殼龍", ["DRAGON"], "HOENN_FAMILY_371"],
  [373, "salamence", "暴飛龍", ["DRAGON", "FLYING"], "HOENN_FAMILY_371"],
  [374, "beldum", "\u9435\u555e\u9234", ["STEEL", "PSYCHIC"], "HOENN_FAMILY_374"],
  [375, "metang", "金屬怪", ["STEEL", "PSYCHIC"], "HOENN_FAMILY_374"],
  [376, "metagross", "巨金怪", ["STEEL", "PSYCHIC"], "HOENN_FAMILY_374"],
  [377, "regirock", "雷吉洛克", ["ROCK"], "HOENN_FAMILY_377"],
  [378, "regice", "雷吉艾斯", ["ICE"], "HOENN_FAMILY_378"],
  [379, "registeel", "雷吉斯奇魯", ["STEEL"], "HOENN_FAMILY_379"],
  [380, "latias", "拉帝亞斯", ["DRAGON", "PSYCHIC"], "HOENN_FAMILY_380"],
  [381, "latios", "拉帝歐斯", ["DRAGON", "PSYCHIC"], "HOENN_FAMILY_381"],
  [382, "kyogre", "蓋歐卡", ["WATER"], "HOENN_FAMILY_382"],
  [383, "groudon", "固拉多", ["GROUND"], "HOENN_FAMILY_383"],
  [384, "rayquaza", "烈空坐", ["DRAGON", "FLYING"], "HOENN_FAMILY_384"],
  [385, "jirachi", "基拉祈", ["STEEL", "PSYCHIC"], "HOENN_FAMILY_385"],
  [386, "deoxys", "代歐奇希斯", ["PSYCHIC"], "HOENN_FAMILY_386"],
];

const evolvesFromByDex: Record<number, string> = {
  317: "316-hoenn",
  319: "318-hoenn",
  321: "320-hoenn",
  323: "322-hoenn",
  326: "325-hoenn",
  329: "328-hoenn",
  330: "329-hoenn",
  332: "331-hoenn",
  334: "333-hoenn",
  340: "339-hoenn",
  342: "341-hoenn",
  344: "343-hoenn",
  346: "345-hoenn",
  348: "347-hoenn",
  350: "349-hoenn",
  354: "353-hoenn",
  356: "355-hoenn",
  362: "361-hoenn",
  364: "363-hoenn",
  365: "364-hoenn",
  367: "366-hoenn",
  368: "366-hoenn",
  372: "371-hoenn",
  373: "372-hoenn",
  375: "374-hoenn",
  376: "375-hoenn",
};

const familyNotes: Record<number, string> = {
  315: "毒薔薇家族保留後續世代羅絲雷朵的正式進化 stub；不因目前展示批次尚未納入而遺失進化價值。",
  360: "小果然是果然翁的寶寶前階；以小果然→果然翁正式進化邊合併城都家族。",
  361: "雪童子可進化為冰鬼護，並保留後續分支進化冰伊布的 stub邊界。",
  366: "珍珠貝有獵斑魚與櫻花魚兩條分支進化；兩條路徑都正式結構化。",
};

const standardNote = "第三世代標準豐緣型態；普通、暗影、Mega、Max 與後續進化用途分門評估。";

export const species312386: Gen3Species[] = speciesSpecs.map(
  ([dexNumber, nameEn, nameZhTw, types, familyKey]) => ({ dexNumber, nameEn, nameZhTw, types: [...types], familyKey }),
);

export const forms312386: Gen3Form[] = speciesSpecs.map(
  ([dexNumber, nameEn, nameZhTw, types]) => ({
    id: `${String(dexNumber).padStart(3, "0")}-hoenn`,
    dexNumber,
    formKey: "HOENN",
    formNameEn: "Hoenn",
    formNameZhTw: "\u8c50\u7de3",
    regionKey: "HOENN",
    types: [...types],
    aliases: [nameEn, nameZhTw],
    evolvesFromFormId: evolvesFromByDex[dexNumber] ?? null,
    evolutionFamilyNotesZhTw: familyNotes[dexNumber] ?? standardNote,
    isStub: false,
    includeVariants: true,
  }),
);

export const evolutionPairs312386: readonly [string, string][] = [
  ["316-hoenn", "317-hoenn"],
  ["318-hoenn", "319-hoenn"],
  ["320-hoenn", "321-hoenn"],
  ["322-hoenn", "323-hoenn"],
  ["325-hoenn", "326-hoenn"],
  ["328-hoenn", "329-hoenn"],
  ["329-hoenn", "330-hoenn"],
  ["331-hoenn", "332-hoenn"],
  ["333-hoenn", "334-hoenn"],
  ["339-hoenn", "340-hoenn"],
  ["341-hoenn", "342-hoenn"],
  ["343-hoenn", "344-hoenn"],
  ["345-hoenn", "346-hoenn"],
  ["347-hoenn", "348-hoenn"],
  ["349-hoenn", "350-hoenn"],
  ["353-hoenn", "354-hoenn"],
  ["355-hoenn", "356-hoenn"],
  ["356-hoenn", "477-other"],
  ["360-hoenn", "202-johto"],
  ["361-hoenn", "362-hoenn"],
  ["361-hoenn", "478-other"],
  ["363-hoenn", "364-hoenn"],
  ["364-hoenn", "365-hoenn"],
  ["366-hoenn", "367-hoenn"],
  ["366-hoenn", "368-hoenn"],
  ["371-hoenn", "372-hoenn"],
  ["372-hoenn", "373-hoenn"],
  ["374-hoenn", "375-hoenn"],
  ["375-hoenn", "376-hoenn"],
  ["315-hoenn", "407-other"],
];

// These are the forms explicitly listed by the current Shadow roster source.
// Import derives any further released forms only across formal evolution edges.
export const releasedShadowForms312386 = new Set<string>(
  ["318-hoenn", "319-hoenn", "320-hoenn", "321-hoenn", "322-hoenn", "323-hoenn", "325-hoenn", "326-hoenn", "328-hoenn", "329-hoenn", "330-hoenn", "331-hoenn", "332-hoenn", "333-hoenn", "334-hoenn", "339-hoenn", "340-hoenn", "341-hoenn", "342-hoenn", "343-hoenn", "344-hoenn", "345-hoenn", "346-hoenn", "347-hoenn", "348-hoenn", "349-hoenn", "350-hoenn", "353-hoenn", "354-hoenn", "355-hoenn", "356-hoenn", "359-hoenn", "361-hoenn", "362-hoenn", "363-hoenn", "364-hoenn", "365-hoenn", "371-hoenn", "372-hoenn", "373-hoenn", "374-hoenn", "375-hoenn", "376-hoenn", "377-hoenn", "378-hoenn", "379-hoenn", "380-hoenn", "381-hoenn", "382-hoenn", "383-hoenn"],
);

export const releasedMegaForms312386 = new Set<string>(
  ["319-hoenn", "323-hoenn", "334-hoenn", "354-hoenn", "359-hoenn", "362-hoenn", "373-hoenn", "376-hoenn", "380-hoenn", "381-hoenn", "382-hoenn", "383-hoenn", "384-hoenn"],
 );
export const releasedDynamaxForms312386 = new Set<string>();
export const releasedGigantamaxForms312386 = new Set<string>();

const specialNames: Record<number, string> = {
  319: "Mega 巨牙鯊",
  323: "Mega 噴火駝",
  334: "Mega 七夕青鳥",
  354: "Mega 詛咒娃娃",
  359: "Mega 阿勃梭魯",
  362: "Mega 冰鬼護",
  373: "Mega 暴飛龍",
  376: "Mega 巨金怪",
  380: "Mega 拉帝亞斯",
  381: "Mega 拉帝歐斯",
  382: "原始蓋歐卡",
  383: "原始固拉多",
  384: "Mega 烈空坐",
};

export const specialVariants312386: Gen3SpecialVariant[] = [...releasedMegaForms312386].map((formId) => {
  const dexNumber = Number(formId.slice(0, 3));
  return { id: `${formId}-mega`, formId, variantKey: "MEGA" as const, released: true, nameZhTw: specialNames[dexNumber] ?? `Mega ${formId}` };
});

export const pveUseLevels312386: Record<string, PveUseLevel> = {
  "317-hoenn": "USABLE_OR_BUDGET",
  "319-hoenn": "SPECIAL_USE",
  "323-hoenn": "SPECIAL_USE",
  "326-hoenn": "USABLE_OR_BUDGET",
  "330-hoenn": "USABLE_OR_BUDGET",
  "334-hoenn": "USABLE_OR_BUDGET",
  "340-hoenn": "USABLE_OR_BUDGET",
  "342-hoenn": "SPECIAL_USE",
  "350-hoenn": "USABLE_OR_BUDGET",
  "354-hoenn": "SPECIAL_USE",
  "359-hoenn": "SPECIAL_USE",
  "362-hoenn": "SPECIAL_USE",
  "365-hoenn": "USABLE_OR_BUDGET",
  "373-hoenn": "CORE_INVESTMENT",
  "376-hoenn": "CORE_INVESTMENT",
  "382-hoenn": "CORE_INVESTMENT",
  "383-hoenn": "CORE_INVESTMENT",
  "384-hoenn": "CORE_INVESTMENT",
};

export const truncatedForms312386 = new Set<string>();
export const migratedStubIds312386 = new Set<string>();

const pvpokeIds312386: Record<string, string> = Object.fromEntries(
  speciesSpecs.map(([dexNumber, nameEn]) => [`${String(dexNumber).padStart(3, "0")}-hoenn`, nameEn]),
);

export function pvpokeSpeciesId312386(form: Gen3Form, shadow: boolean) {
  const base = pvpokeIds312386[form.id] ?? form.aliases[0].toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/-/g, "_");
  return shadow ? base + "_shadow" : base;
}

\r\n