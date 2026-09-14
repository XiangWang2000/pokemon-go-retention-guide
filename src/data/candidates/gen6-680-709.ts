import type {
  CandidateBatchDefinition,
  CandidateForm,
  CandidateSpecies,
} from "./types";

export const species680709 = [
  { dexNumber: 680, nameEn: "Doublade", nameZhTw: "雙劍鞘", types: ["STEEL", "GHOST"], familyKey: "KALOS_FAMILY_679" },
  { dexNumber: 681, nameEn: "Aegislash", nameZhTw: "堅盾劍怪", types: ["STEEL", "GHOST"], familyKey: "KALOS_FAMILY_679" },
  { dexNumber: 682, nameEn: "Spritzee", nameZhTw: "粉香香", types: ["FAIRY"], familyKey: "KALOS_FAMILY_682" },
  { dexNumber: 683, nameEn: "Aromatisse", nameZhTw: "芳香精", types: ["FAIRY"], familyKey: "KALOS_FAMILY_682" },
  { dexNumber: 684, nameEn: "Swirlix", nameZhTw: "綿綿泡芙", types: ["FAIRY"], familyKey: "KALOS_FAMILY_684" },
  { dexNumber: 685, nameEn: "Slurpuff", nameZhTw: "胖甜妮", types: ["FAIRY"], familyKey: "KALOS_FAMILY_684" },
  { dexNumber: 686, nameEn: "Inkay", nameZhTw: "好啦魷", types: ["DARK", "PSYCHIC"], familyKey: "KALOS_FAMILY_686" },
  { dexNumber: 687, nameEn: "Malamar", nameZhTw: "烏賊王", types: ["DARK", "PSYCHIC"], familyKey: "KALOS_FAMILY_686" },
  { dexNumber: 688, nameEn: "Binacle", nameZhTw: "龜腳腳", types: ["ROCK", "WATER"], familyKey: "KALOS_FAMILY_688" },
  { dexNumber: 689, nameEn: "Barbaracle", nameZhTw: "龜足巨鎧", types: ["ROCK", "WATER"], familyKey: "KALOS_FAMILY_688" },
  { dexNumber: 690, nameEn: "Skrelp", nameZhTw: "垃垃藻", types: ["POISON", "WATER"], familyKey: "KALOS_FAMILY_690" },
  { dexNumber: 691, nameEn: "Dragalge", nameZhTw: "毒藻龍", types: ["POISON", "DRAGON"], familyKey: "KALOS_FAMILY_690" },
  { dexNumber: 692, nameEn: "Clauncher", nameZhTw: "鐵臂槍蝦", types: ["WATER"], familyKey: "KALOS_FAMILY_692" },
  { dexNumber: 693, nameEn: "Clawitzer", nameZhTw: "鋼炮臂蝦", types: ["WATER"], familyKey: "KALOS_FAMILY_692" },
  { dexNumber: 694, nameEn: "Helioptile", nameZhTw: "傘電蜥", types: ["ELECTRIC", "NORMAL"], familyKey: "KALOS_FAMILY_694" },
  { dexNumber: 695, nameEn: "Heliolisk", nameZhTw: "光電傘蜥", types: ["ELECTRIC", "NORMAL"], familyKey: "KALOS_FAMILY_694" },
  { dexNumber: 696, nameEn: "Tyrunt", nameZhTw: "寶寶暴龍", types: ["ROCK", "DRAGON"], familyKey: "KALOS_FAMILY_696" },
  { dexNumber: 697, nameEn: "Tyrantrum", nameZhTw: "怪顎龍", types: ["ROCK", "DRAGON"], familyKey: "KALOS_FAMILY_696" },
  { dexNumber: 698, nameEn: "Amaura", nameZhTw: "冰雪龍", types: ["ROCK", "ICE"], familyKey: "KALOS_FAMILY_698" },
  { dexNumber: 699, nameEn: "Aurorus", nameZhTw: "冰雪巨龍", types: ["ROCK", "ICE"], familyKey: "KALOS_FAMILY_698" },
  { dexNumber: 700, nameEn: "Sylveon", nameZhTw: "仙子伊布", types: ["FAIRY"], familyKey: "KANTO_FAMILY_133" },
  { dexNumber: 701, nameEn: "Hawlucha", nameZhTw: "摔角鷹人", types: ["FIGHTING", "FLYING"], familyKey: "KALOS_FAMILY_701" },
  { dexNumber: 702, nameEn: "Dedenne", nameZhTw: "咚咚鼠", types: ["ELECTRIC", "FAIRY"], familyKey: "KALOS_FAMILY_702" },
  { dexNumber: 703, nameEn: "Carbink", nameZhTw: "小碎鑽", types: ["ROCK", "FAIRY"], familyKey: "KALOS_FAMILY_703" },
  { dexNumber: 704, nameEn: "Goomy", nameZhTw: "黏黏寶", types: ["DRAGON"], familyKey: "KALOS_FAMILY_704" },
  { dexNumber: 705, nameEn: "Sliggoo", nameZhTw: "黏美兒", types: ["DRAGON"], familyKey: "KALOS_FAMILY_704" },
  { dexNumber: 706, nameEn: "Goodra", nameZhTw: "黏美龍", types: ["DRAGON"], familyKey: "KALOS_FAMILY_704" },
  { dexNumber: 707, nameEn: "Klefki", nameZhTw: "鑰圈兒", types: ["STEEL", "FAIRY"], familyKey: "KALOS_FAMILY_707" },
  { dexNumber: 708, nameEn: "Phantump", nameZhTw: "小木靈", types: ["GHOST", "GRASS"], familyKey: "KALOS_FAMILY_708" },
  { dexNumber: 709, nameEn: "Trevenant", nameZhTw: "朽木妖", types: ["GHOST", "GRASS"], familyKey: "KALOS_FAMILY_708" },
] as const satisfies readonly CandidateSpecies[];

const speciesByDex = new Map<number, CandidateSpecies>(species680709.map((species) => [species.dexNumber, species]));

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

function hisuiForm(dexNumber: 705 | 706, evolvesFromFormId: string | null): CandidateForm {
  const species = speciesByDex.get(dexNumber)!;
  return {
    id: `${dexNumber}-hisui`,
    dexNumber,
    formKey: "HISUI",
    formNameEn: "Hisuian",
    formNameZhTw: "洗翠",
    regionKey: "HISUI",
    types: ["STEEL", "DRAGON"],
    aliases: [`Hisuian ${species.nameEn}`, `${species.nameEn} Hisuian`, `洗翠${species.nameZhTw}`, "洗翠"],
    evolvesFromFormId,
  };
}

export const forms680709 = [
  kalosForm(680, "679-kalos"),
  {
    id: "681-shield",
    dexNumber: 681,
    formKey: "SHIELD",
    formNameEn: "Shield Forme",
    formNameZhTw: "盾牌形態",
    regionKey: "KALOS",
    types: ["STEEL", "GHOST"],
    aliases: ["Aegislash Shield Forme", "Shield Aegislash", "堅盾劍怪 盾牌形態", "盾牌形態"],
    evolvesFromFormId: "680-kalos",
  },
  {
    id: "681-blade",
    dexNumber: 681,
    formKey: "BLADE",
    formNameEn: "Blade Forme",
    formNameZhTw: "刀劍形態",
    regionKey: "KALOS",
    types: ["STEEL", "GHOST"],
    aliases: ["Aegislash Blade Forme", "Blade Aegislash", "堅盾劍怪 刀劍形態", "刀劍形態"],
    evolvesFromFormId: null,
  },
  kalosForm(682, null), kalosForm(683, "682-kalos"),
  kalosForm(684, null), kalosForm(685, "684-kalos"),
  kalosForm(686, null), kalosForm(687, "686-kalos"),
  kalosForm(688, null), kalosForm(689, "688-kalos"),
  kalosForm(690, null), kalosForm(691, "690-kalos"),
  kalosForm(692, null), kalosForm(693, "692-kalos"),
  kalosForm(694, null), kalosForm(695, "694-kalos"),
  kalosForm(696, null), kalosForm(697, "696-kalos"),
  kalosForm(698, null), kalosForm(699, "698-kalos"),
  kalosForm(700, "133-kanto"),
  kalosForm(701, null), kalosForm(702, null), kalosForm(703, null),
  kalosForm(704, null),
  kalosForm(705, "704-kalos"),
  hisuiForm(705, null),
  kalosForm(706, "705-kalos"),
  hisuiForm(706, "705-hisui"),
  kalosForm(707, null),
  kalosForm(708, null), kalosForm(709, "708-kalos"),
] as const satisfies readonly CandidateForm[];

export const evolutionPairs680709 = forms680709
  .filter((form) => form.evolvesFromFormId !== null)
  .map((form) => [form.evolvesFromFormId!, form.id] as const);

// Aegislash stance changes during battle; this is neither an evolution nor a persistent Form Change purchase.
export const aegislashBattleStance680709 = [
  { fromFormId: "681-shield", toFormId: "681-blade", mechanic: "BATTLE_STANCE_CHANGE" as const },
  { fromFormId: "681-blade", toFormId: "681-shield", mechanic: "BATTLE_STANCE_CHANGE" as const },
] as const;

export const gen6Candidate680709 = {
  key: "680-709",
  generation: 6,
  species: species680709,
  forms: forms680709,
  evolutionPairs: evolutionPairs680709,
  deferredEvolutionTargets: [],
  identitySourceIds: [
    "POKEAPI-CANONICAL-KALOS-680-709",
    "SEREBII-GO-AEGISLASH-FORMES-20260905",
    "SEREBII-GO-SLIGGOO-GOODRA-FORMES-20260905",
    "PUBLISHED-EEVEE-FAMILY-SYLVEON-HANDOFF-20260905",
  ],
} as const satisfies CandidateBatchDefinition;
