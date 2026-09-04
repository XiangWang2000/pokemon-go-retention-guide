import type {
  CandidateBatchDefinition,
  CandidateForm,
  CandidateSpecies,
} from "./types";

export const species644649 = [
  {
    dexNumber: 644,
    nameEn: "Zekrom",
    nameZhTw: "捷克羅姆",
    types: ["DRAGON", "ELECTRIC"],
    familyKey: "UNOVA_FAMILY_644",
  },
  {
    dexNumber: 645,
    nameEn: "Landorus",
    nameZhTw: "土地雲",
    types: ["GROUND", "FLYING"],
    familyKey: "UNOVA_FAMILY_645",
  },
  {
    dexNumber: 646,
    nameEn: "Kyurem",
    nameZhTw: "酋雷姆",
    types: ["DRAGON", "ICE"],
    familyKey: "UNOVA_FAMILY_646",
  },
  {
    dexNumber: 647,
    nameEn: "Keldeo",
    nameZhTw: "凱路迪歐",
    types: ["WATER", "FIGHTING"],
    familyKey: "UNOVA_FAMILY_647",
  },
  {
    dexNumber: 648,
    nameEn: "Meloetta",
    nameZhTw: "美洛耶塔",
    types: ["NORMAL", "PSYCHIC"],
    familyKey: "UNOVA_FAMILY_648",
  },
  {
    dexNumber: 649,
    nameEn: "Genesect",
    nameZhTw: "蓋諾賽克特",
    types: ["BUG", "STEEL"],
    familyKey: "UNOVA_FAMILY_649",
  },
] as const satisfies readonly CandidateSpecies[];

function form(
  id: string,
  dexNumber: number,
  formKey: string,
  formNameEn: string,
  formNameZhTw: string,
  types: readonly string[],
  aliases: readonly string[],
): CandidateForm {
  return {
    id,
    dexNumber,
    formKey,
    formNameEn,
    formNameZhTw,
    regionKey: "UNOVA",
    types,
    aliases,
    evolvesFromFormId: null,
  };
}

export const forms644649 = [
  form(
    "644-unova",
    644,
    "UNOVA",
    "Unova",
    "合眾",
    ["DRAGON", "ELECTRIC"],
    ["Zekrom", "zekrom", "捷克羅姆", "Unova", "合眾"],
  ),
  form(
    "645-incarnate",
    645,
    "INCARNATE",
    "Incarnate Forme",
    "化身形態",
    ["GROUND", "FLYING"],
    ["Landorus Incarnate", "Incarnate Forme Landorus", "土地雲 化身形態", "化身形態"],
  ),
  form(
    "645-therian",
    645,
    "THERIAN",
    "Therian Forme",
    "靈獸形態",
    ["GROUND", "FLYING"],
    ["Landorus Therian", "Therian Forme Landorus", "土地雲 靈獸形態", "靈獸形態"],
  ),
  form(
    "646-unova",
    646,
    "UNOVA",
    "Kyurem",
    "通常形態",
    ["DRAGON", "ICE"],
    ["Kyurem", "kyurem", "酋雷姆", "通常形態"],
  ),
  form(
    "646-black",
    646,
    "BLACK",
    "Black Kyurem",
    "闇黑酋雷姆",
    ["DRAGON", "ICE"],
    ["Black Kyurem", "Kyurem Black", "闇黑酋雷姆", "黑酋雷姆"],
  ),
  form(
    "646-white",
    646,
    "WHITE",
    "White Kyurem",
    "焰白酋雷姆",
    ["DRAGON", "ICE"],
    ["White Kyurem", "Kyurem White", "焰白酋雷姆", "白酋雷姆"],
  ),
  form(
    "647-ordinary",
    647,
    "ORDINARY",
    "Ordinary Forme",
    "普通形態",
    ["WATER", "FIGHTING"],
    ["Keldeo Ordinary", "Ordinary Forme Keldeo", "凱路迪歐 普通形態", "普通形態"],
  ),
  form(
    "647-resolute",
    647,
    "RESOLUTE",
    "Resolute Forme",
    "覺悟形態",
    ["WATER", "FIGHTING"],
    ["Keldeo Resolute", "Resolute Forme Keldeo", "凱路迪歐 覺悟形態", "覺悟形態"],
  ),
  form(
    "648-aria",
    648,
    "ARIA",
    "Aria Forme",
    "歌聲形態",
    ["NORMAL", "PSYCHIC"],
    ["Meloetta Aria", "Aria Forme Meloetta", "美洛耶塔 歌聲形態", "歌聲形態"],
  ),
  form(
    "648-pirouette",
    648,
    "PIROUETTE",
    "Pirouette Forme",
    "舞步形態",
    ["NORMAL", "FIGHTING"],
    ["Meloetta Pirouette", "Pirouette Forme Meloetta", "美洛耶塔 舞步形態", "舞步形態"],
  ),
  form(
    "649-unova",
    649,
    "NO_DRIVE",
    "No Drive",
    "無卡帶",
    ["BUG", "STEEL"],
    ["Genesect", "Genesect No Drive", "蓋諾賽克特", "無卡帶"],
  ),
  form(
    "649-shock",
    649,
    "SHOCK_DRIVE",
    "Shock Drive",
    "閃電卡帶",
    ["BUG", "STEEL"],
    ["Genesect Shock Drive", "Shock Drive Genesect", "蓋諾賽克特 閃電卡帶", "閃電卡帶"],
  ),
  form(
    "649-burn",
    649,
    "BURN_DRIVE",
    "Burn Drive",
    "火焰卡帶",
    ["BUG", "STEEL"],
    ["Genesect Burn Drive", "Burn Drive Genesect", "蓋諾賽克特 火焰卡帶", "火焰卡帶"],
  ),
  form(
    "649-chill",
    649,
    "CHILL_DRIVE",
    "Chill Drive",
    "冰凍卡帶",
    ["BUG", "STEEL"],
    ["Genesect Chill Drive", "Chill Drive Genesect", "蓋諾賽克特 冰凍卡帶", "冰凍卡帶"],
  ),
  form(
    "649-douse",
    649,
    "DOUSE_DRIVE",
    "Douse Drive",
    "水流卡帶",
    ["BUG", "STEEL"],
    ["Genesect Douse Drive", "Douse Drive Genesect", "蓋諾賽克特 水流卡帶", "水流卡帶"],
  ),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs644649 = [] as const;

export const keldeoFormTransitions644649 = [
  {
    fromFormId: "647-ordinary",
    toFormId: "647-resolute",
    reversible: true,
    candyCost: 50,
    stardustCost: 10_000,
    mechanic: "FORM_CHANGE",
    reasonZhTw:
      "Pokémon GO 在完成 Tales of Transformation 特殊調查第六步後，可用 50 顆凱路迪歐糖果與 10,000 星塵在普通形態／覺悟形態間切換；這是 form change，不是進化。",
  },
] as const;

export const kyuremFusionRelationships644649 = [
  {
    baseFormId: "646-unova",
    partnerFormId: "644-unova",
    resultFormId: "646-black",
    mechanic: "FUSION",
    reasonZhTw:
      "Pokémon GO 以酋雷姆為合體基礎，與捷克羅姆及 Volt Fusion Energy 合體成闇黑酋雷姆；這是可分離的 Fusion，不是進化。",
  },
  {
    baseFormId: "646-unova",
    partnerFormId: "643-unova",
    resultFormId: "646-white",
    mechanic: "FUSION",
    reasonZhTw:
      "Pokémon GO 以酋雷姆為合體基礎，與萊希拉姆及 Blaze Fusion Energy 合體成焰白酋雷姆；這是可分離的 Fusion，不是進化。",
  },
] as const;

export const nonInterchangeableFormGroups644649 = [
  ["645-incarnate", "645-therian"],
  ["649-unova", "649-shock", "649-burn", "649-chill", "649-douse"],
] as const;

export const gen5Candidate644649 = {
  key: "644-649",
  generation: 5,
  species: species644649,
  forms: forms644649,
  evolutionPairs: evolutionPairs644649,
  identitySourceIds: [
    "POKEAPI-CANONICAL-UNOVA-644-649",
    "GOHUB-POKEMONGO-FORMS-644-649-20260904",
    "BULBAPEDIA-GO-FORM-DIFFERENCES-644-649-20260904",
    "OFFICIAL-POKEMON-GO-FUSION-MECHANIC-20260904",
    "GOHUB-KYUREM-FUSION-20260904",
  ],
} as const satisfies CandidateBatchDefinition;
