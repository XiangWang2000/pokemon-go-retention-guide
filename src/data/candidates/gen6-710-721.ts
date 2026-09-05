import type { CandidateBatchDefinition, CandidateForm, CandidateSpecies } from "./types";

export const species710721 = [
  { dexNumber: 710, nameEn: "Pumpkaboo", nameZhTw: "南瓜精", types: ["GHOST", "GRASS"], familyKey: "KALOS_FAMILY_710" },
  { dexNumber: 711, nameEn: "Gourgeist", nameZhTw: "南瓜怪人", types: ["GHOST", "GRASS"], familyKey: "KALOS_FAMILY_710" },
  { dexNumber: 712, nameEn: "Bergmite", nameZhTw: "冰寶", types: ["ICE"], familyKey: "KALOS_FAMILY_712" },
  { dexNumber: 713, nameEn: "Avalugg", nameZhTw: "冰岩怪", types: ["ICE"], familyKey: "KALOS_FAMILY_712" },
  { dexNumber: 714, nameEn: "Noibat", nameZhTw: "嗡蝠", types: ["FLYING", "DRAGON"], familyKey: "KALOS_FAMILY_714" },
  { dexNumber: 715, nameEn: "Noivern", nameZhTw: "音波龍", types: ["FLYING", "DRAGON"], familyKey: "KALOS_FAMILY_714" },
  { dexNumber: 716, nameEn: "Xerneas", nameZhTw: "哲爾尼亞斯", types: ["FAIRY"], familyKey: "KALOS_FAMILY_716" },
  { dexNumber: 717, nameEn: "Yveltal", nameZhTw: "伊裴爾塔爾", types: ["DARK", "FLYING"], familyKey: "KALOS_FAMILY_717" },
  { dexNumber: 718, nameEn: "Zygarde", nameZhTw: "基格爾德", types: ["DRAGON", "GROUND"], familyKey: "KALOS_FAMILY_718" },
  { dexNumber: 719, nameEn: "Diancie", nameZhTw: "蒂安希", types: ["ROCK", "FAIRY"], familyKey: "KALOS_FAMILY_719" },
  { dexNumber: 720, nameEn: "Hoopa", nameZhTw: "胡帕", types: ["PSYCHIC", "GHOST"], familyKey: "KALOS_FAMILY_720" },
  { dexNumber: 721, nameEn: "Volcanion", nameZhTw: "波爾凱尼恩", types: ["FIRE", "WATER"], familyKey: "KALOS_FAMILY_721" },
] as const satisfies readonly CandidateSpecies[];

const speciesByDex = new Map<number, CandidateSpecies>(species710721.map((species) => [species.dexNumber, species]));

function kalosForm(dexNumber: number, evolvesFromFormId: string | null): CandidateForm {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen6 candidate species #${dexNumber}.`);
  return {
    id: `${String(dexNumber).padStart(3, "0")}-kalos`,
    dexNumber,
    formKey: "KALOS",
    formNameEn: "Kalos",
    formNameZhTw: "卡洛斯",
    regionKey: "KALOS",
    types: species.types,
    aliases: [species.nameEn, species.nameEn.toLowerCase(), species.nameZhTw, "Kalos", "卡洛斯"],
    evolvesFromFormId,
  };
}

export const pumpkabooSizes710721 = [
  { slug: "small", key: "SMALL", en: "Small Size", zhTw: "小尺寸" },
  { slug: "average", key: "AVERAGE", en: "Average Size", zhTw: "普通尺寸" },
  { slug: "large", key: "LARGE", en: "Large Size", zhTw: "大尺寸" },
  { slug: "super", key: "SUPER", en: "Super Size", zhTw: "特大尺寸" },
] as const;

function sizeForm(
  dexNumber: 710 | 711,
  size: (typeof pumpkabooSizes710721)[number],
  evolvesFromFormId: string | null,
): CandidateForm {
  const species = speciesByDex.get(dexNumber)!;
  return {
    id: `${dexNumber}-${size.slug}`,
    dexNumber,
    formKey: size.key,
    formNameEn: size.en,
    formNameZhTw: size.zhTw,
    regionKey: "KALOS",
    types: species.types,
    aliases: [`${species.nameEn} ${size.en}`, `${size.en} ${species.nameEn}`, `${species.nameZhTw} ${size.zhTw}`, size.zhTw],
    evolvesFromFormId,
  };
}

export const forms710721 = [
  ...pumpkabooSizes710721.flatMap((size) => [
    sizeForm(710, size, null),
    sizeForm(711, size, `710-${size.slug}`),
  ]),
  kalosForm(712, null),
  kalosForm(713, "712-kalos"),
  {
    id: "713-hisui",
    dexNumber: 713,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["ICE", "ROCK"],
    aliases: ["Hisuian Avalugg", "Avalugg Hisuian", "洗翠冰岩怪", "洗翠"],
    evolvesFromFormId: null,
  },
  kalosForm(714, null), kalosForm(715, "714-kalos"),
  kalosForm(716, null), kalosForm(717, null),
  {
    id: "718-10-percent",
    dexNumber: 718,
    formKey: "TEN_PERCENT",
    formNameEn: "10% Forme",
    formNameZhTw: "10%形態",
    regionKey: "KALOS",
    types: ["DRAGON", "GROUND"],
    aliases: ["Zygarde 10% Forme", "10% Zygarde", "基格爾德 10%形態", "10%形態"],
    evolvesFromFormId: null,
  },
  {
    id: "718-50-percent",
    dexNumber: 718,
    formKey: "FIFTY_PERCENT",
    formNameEn: "50% Forme",
    formNameZhTw: "50%形態",
    regionKey: "KALOS",
    types: ["DRAGON", "GROUND"],
    aliases: ["Zygarde 50% Forme", "50% Zygarde", "基格爾德 50%形態", "50%形態"],
    evolvesFromFormId: null,
  },
  {
    id: "718-complete",
    dexNumber: 718,
    formKey: "COMPLETE",
    formNameEn: "Complete Forme",
    formNameZhTw: "完全體形態",
    regionKey: "KALOS",
    types: ["DRAGON", "GROUND"],
    aliases: ["Zygarde Complete Forme", "Complete Zygarde", "基格爾德 完全體形態", "完全體形態"],
    evolvesFromFormId: null,
  },
  kalosForm(719, null),
  {
    id: "720-confined",
    dexNumber: 720,
    formKey: "CONFINED",
    formNameEn: "Hoopa Confined",
    formNameZhTw: "懲戒胡帕",
    regionKey: "KALOS",
    types: ["PSYCHIC", "GHOST"],
    aliases: ["Hoopa Confined", "Confined Hoopa", "懲戒胡帕", "胡帕 懲戒"],
    evolvesFromFormId: null,
  },
  {
    id: "720-unbound",
    dexNumber: 720,
    formKey: "UNBOUND",
    formNameEn: "Hoopa Unbound",
    formNameZhTw: "解放胡帕",
    regionKey: "KALOS",
    types: ["PSYCHIC", "DARK"],
    aliases: ["Hoopa Unbound", "Unbound Hoopa", "解放胡帕", "胡帕 解放"],
    evolvesFromFormId: null,
  },
  kalosForm(721, null),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs710721 = forms710721
  .filter((form) => form.evolvesFromFormId !== null)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

export const zygardeCellTransitions710721 = [
  { fromFormId: "718-10-percent", toFormId: "718-50-percent", mechanic: "ZYGARDE_CELL_FORM_CHANGE" as const },
  { fromFormId: "718-50-percent", toFormId: "718-complete", mechanic: "ZYGARDE_CELL_FORM_CHANGE" as const },
] as const;

export const hoopaFormTransitions710721 = [
  {
    fromFormId: "720-confined",
    toFormId: "720-unbound",
    mechanic: "FORM_CHANGE" as const,
    candyCost: 50,
    stardustCost: 10_000,
  },
  {
    fromFormId: "720-unbound",
    toFormId: "720-confined",
    mechanic: "FORM_CHANGE" as const,
    candyCost: 10,
    stardustCost: 2_000,
  },
] as const;

export const gen6Candidate710721 = {
  key: "710-721",
  generation: 6,
  species: species710721,
  forms: forms710721,
  evolutionPairs: evolutionPairs710721,
  deferredEvolutionTargets: [],
  identitySourceIds: [
    "POKEAPI-CANONICAL-KALOS-710-721",
    "OFFICIAL-PUMPKABOO-GOURGEIST-SIZES-20211022",
    "SEREBII-GO-HISUIAN-AVALUGG-20260905",
    "OFFICIAL-ZYGARDE-ROUTES-CELLS-2023",
    "OFFICIAL-HOOPA-FORM-CHANGE-20211126",
  ],
} as const satisfies CandidateBatchDefinition;
