import { forms650679, species650679 } from "./gen6-650-679";
import { forms680709, species680709 } from "./gen6-680-709";
import { forms710721, species710721 } from "./gen6-710-721";
import type { CandidateForm, CandidateSpecies } from "./types";

export type Gen6PvpMappingMode = "EXACT" | "SHARED_UNDIFFERENTIATED" | "NO_PINNED_ID";

export type Gen6PvpMapping = {
  formId: string;
  pvpokeSpeciesId: string | null;
  shadowPvpokeSpeciesId: string | null;
  mappingMode: Gen6PvpMappingMode;
  noteZhTw: string | null;
};

export const GEN6_PVPOKE_COMMIT = "7b96d91fb553780653190ad32de001b5d9086a7f";
export const GEN6_PVPOKE_GAMEMASTER_SOURCE_URL =
  `https://raw.githubusercontent.com/pvpoke/pvpoke/${GEN6_PVPOKE_COMMIT}/src/data/gamemaster.json`;
export const GEN6_PVPOKE_RANKING_SOURCE_URLS = {
  GL: `https://raw.githubusercontent.com/pvpoke/pvpoke/${GEN6_PVPOKE_COMMIT}/src/data/overall/rankings-1500.json`,
  UL: `https://raw.githubusercontent.com/pvpoke/pvpoke/${GEN6_PVPOKE_COMMIT}/src/data/overall/rankings-2500.json`,
  ML: `https://raw.githubusercontent.com/pvpoke/pvpoke/${GEN6_PVPOKE_COMMIT}/src/data/overall/rankings-10000.json`,
} as const;
export const GEN6_LOCAL_RANKING_PATHS = {
  GL: "data/sources/pvpoke/2026-09-01/rankings-1500.json",
  UL: "data/sources/pvpoke/2026-09-01/rankings-2500.json",
  ML: "data/sources/pvpoke/2026-09-01/rankings-10000.json",
} as const;

const allSpecies = [...species650679, ...species680709, ...species710721] as readonly CandidateSpecies[];
export const gen6PvpForms = [...forms650679, ...forms680709, ...forms710721] as readonly CandidateForm[];

const speciesByDex = new Map(allSpecies.map((species) => [species.dexNumber, species]));

function pvpokeSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function baseSpeciesId(dexNumber: number) {
  const species = speciesByDex.get(dexNumber);
  if (!species) throw new Error(`Missing Gen6 species #${dexNumber} for PvP mapping.`);
  return pvpokeSlug(species.nameEn);
}

const pinnedShadowBaseIds = new Set([
  "chespin", "quilladin", "chesnaught",
  "fennekin", "braixen", "delphox",
  "froakie", "frogadier", "greninja",
  "bunnelby", "diggersby",
  "fletchling", "fletchinder", "talonflame",
  "inkay", "malamar",
  "helioptile", "heliolisk",
  "tyrunt", "tyrantrum", "amaura", "aurorus",
  "phantump", "trevenant",
  "noibat", "noivern",
] as const);

function sharedMapping(form: CandidateForm, pvpokeSpeciesId: string, noteZhTw: string): Gen6PvpMapping {
  return {
    formId: form.id,
    pvpokeSpeciesId,
    shadowPvpokeSpeciesId: null,
    mappingMode: "SHARED_UNDIFFERENTIATED",
    noteZhTw,
  };
}

function exactMapping(form: CandidateForm, pvpokeSpeciesId: string): Gen6PvpMapping {
  return {
    formId: form.id,
    pvpokeSpeciesId,
    shadowPvpokeSpeciesId: pinnedShadowBaseIds.has(pvpokeSpeciesId as never)
      ? `${pvpokeSpeciesId}_shadow`
      : null,
    mappingMode: "EXACT",
    noteZhTw: null,
  };
}

function mappingFor(form: CandidateForm): Gen6PvpMapping {
  if (form.dexNumber >= 664 && form.dexNumber <= 666) {
    return sharedMapping(
      form,
      baseSpeciesId(form.dexNumber),
      "Pinned PvPoke 將 18 種彩粉蝶花紋譜系壓成同一 battle species；此排名只能視為共享戰鬥證據，不能宣稱為 exact pattern 排名。",
    );
  }
  if (form.dexNumber === 667 || form.dexNumber === 668) {
    return sharedMapping(
      form,
      baseSpeciesId(form.dexNumber),
      "Pinned PvPoke 未分開 Litleo/Pyroar 的雄性與雌性 battle identity；兩性只共享 battle-level 排名，型態與取得價值仍必須分開。",
    );
  }
  if (form.dexNumber >= 669 && form.dexNumber <= 671) {
    return sharedMapping(
      form,
      baseSpeciesId(form.dexNumber),
      "Pinned PvPoke 未分開五種 Flabébé/Floette/Florges 花色；共享排名不得回寫成 exact flower-color 排名。",
    );
  }
  if (form.dexNumber === 676) {
    return sharedMapping(
      form,
      "furfrou",
      "Pinned PvPoke 只有 generic Furfrou battle identity；Natural 與九種 Trim 共用戰鬥資料，但 Form Change/收藏價值不能因此互相回灌。",
    );
  }
  if (form.dexNumber === 677) {
    return sharedMapping(
      form,
      "espurr",
      "Pinned PvPoke 未分開 Espurr 性別；雄性/雌性譜系只共享 battle-level evidence。",
    );
  }

  if (form.id === "678-male") return exactMapping(form, "meowstic");
  if (form.id === "678-female") return exactMapping(form, "meowstic_female");
  if (form.id === "681-shield") return exactMapping(form, "aegislash_shield");
  if (form.id === "681-blade") return exactMapping(form, "aegislash_blade");

  if (form.id === "705-hisui" || form.id === "706-hisui") {
    return {
      formId: form.id,
      pvpokeSpeciesId: null,
      shadowPvpokeSpeciesId: null,
      mappingMode: "NO_PINNED_ID",
      noteZhTw: "Pinned 2026-09-01 PvPoke gamemaster 沒有此洗翠 exact battle identity；不得借用普通黏美兒/黏美龍排名。",
    };
  }

  if (form.id === "710-small") return exactMapping(form, "pumpkaboo_small");
  if (form.id === "710-average") return exactMapping(form, "pumpkaboo_average");
  if (form.id === "710-large") return exactMapping(form, "pumpkaboo_large");
  if (form.id === "710-super") return exactMapping(form, "pumpkaboo_super");
  if (form.id === "711-small") return exactMapping(form, "gourgeist_small");
  if (form.id === "711-average") return exactMapping(form, "gourgeist_average");
  if (form.id === "711-large") return exactMapping(form, "gourgeist_large");
  if (form.id === "711-super") return exactMapping(form, "gourgeist_super");
  if (form.id === "713-hisui") return exactMapping(form, "avalugg_hisuian");
  if (form.id === "718-10-percent") return exactMapping(form, "zygarde_10");
  if (form.id === "718-50-percent") return exactMapping(form, "zygarde");
  if (form.id === "718-complete") return exactMapping(form, "zygarde_complete");
  if (form.id === "720-confined") {
    return {
      ...exactMapping(form, "hoopa"),
      noteZhTw: "Pinned gamemaster 的可排名 Psychic/Ghost Hoopa 使用 speciesId=hoopa；另有同數值但 released=false 的 legacy hoopa_confined row，因此 presentation 使用 hoopa，不能與 Unbound 混用。",
    };
  }
  if (form.id === "720-unbound") return exactMapping(form, "hoopa_unbound");

  return exactMapping(form, baseSpeciesId(form.dexNumber));
}

export const gen6PvpMappings = gen6PvpForms.map(mappingFor) as readonly Gen6PvpMapping[];

export const gen6PvpMappingByFormId = new Map(gen6PvpMappings.map((mapping) => [mapping.formId, mapping]));

export const GEN6_PRESENTATION_FORM_BY_DEX: Readonly<Record<number, string>> = Object.fromEntries([
  ...Array.from({ length: 72 }, (_, index) => {
    const dex = 650 + index;
    return [dex, `${String(dex).padStart(3, "0")}-kalos`] as const;
  }),
  [664, "664-continental"],
  [665, "665-continental"],
  [666, "666-continental"],
  [667, "667-male"],
  [668, "668-male"],
  [669, "669-red-flower"],
  [670, "670-red-flower"],
  [671, "671-red-flower"],
  [676, "676-natural"],
  [677, "677-male"],
  [678, "678-male"],
  [681, "681-shield"],
  [705, "705-kalos"],
  [706, "706-kalos"],
  [710, "710-average"],
  [711, "711-average"],
  [713, "713-kalos"],
  [718, "718-50-percent"],
  [720, "720-confined"],
]) as Readonly<Record<number, string>>;

export function getGen6PresentationPvpokeSpeciesId(dexNumber: number) {
  const formId = GEN6_PRESENTATION_FORM_BY_DEX[dexNumber];
  if (!formId) throw new Error(`Missing Gen6 presentation form for #${dexNumber}.`);
  const mapping = gen6PvpMappingByFormId.get(formId);
  if (!mapping) throw new Error(`Missing Gen6 PvP mapping for presentation form ${formId}.`);
  return mapping.pvpokeSpeciesId;
}
