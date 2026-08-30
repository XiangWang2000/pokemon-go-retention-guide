import {
  evolutionPairs242251,
  forms242251,
  migratedStubIds242251,
  pvpokeSpeciesId242251,
  pveUseLevels242251,
  releasedDynamaxForms242251,
  releasedGigantamaxForms242251,
  releasedMegaForms242251,
  releasedShadowForms242251,
  specialVariants242251,
  species242251,
} from "../../src/data/batch-242-251";
import { runLegacyBatchImport } from "./legacy-batch-import";

const changeLogs = [
  {
    id: "r20-batch-242-251",
    entityType: "Batch",
    entityId: "242-251",
    fieldName: "status",
    previousValue: null,
    newValue: "RESEARCHED",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "新增 #242～#251，沿用共用保留規則與逐版本資料處置。",
  },
  {
    id: "r20-family-blissey",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_113",
    fieldName: "members",
    previousValue: "#113",
    newValue: "#113→#242",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw:
      "幸福蛋正式併入吉利蛋既有家族；由舊 Kanto cross-generation stub 遷移為正式 Johto form。",
  },
  {
    id: "r20-family-larvitar",
    entityType: "EvolutionFamily",
    entityId: "JOHTO_FAMILY_246",
    fieldName: "members",
    previousValue: "#246→#247",
    newValue: "#246→#247→#248",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw:
      "幼基拉斯、沙基拉斯與班基拉斯維持同一跨世代進化家族，並分開評估 Mega、Shadow 與 Max。",
  },
];

runLegacyBatchImport({
  batchStart: 242,
  batchEnd: 251,
  batchLabel: "#242～#251",
  checkedAt: new Date("2026-08-08T18:00:00+08:00"),
  pvpokeCommit: "86847e535b7e0a0f4e91f9628b3fc713ae6adca7",
  revision: "r20",
  officialResearchPath: new URL(
    "../../research_notes/sources/official-242-251.json",
    import.meta.url,
  ),
  sourceNotes: "第 #242～#251 批次來源研究表。",
  sourceOptions: { includeMaxSource: true },
  species: species242251,
  forms: forms242251,
  evolutionPairs: evolutionPairs242251,
  specialVariants: specialVariants242251,
  pveUseLevels: pveUseLevels242251,
  pvpokeSpeciesId: pvpokeSpeciesId242251,
  releaseSets: {
    shadow: releasedShadowForms242251,
    mega: releasedMegaForms242251,
    dynamax: releasedDynamaxForms242251,
    gigantamax: releasedGigantamaxForms242251,
  },
  migratedStubIds: migratedStubIds242251,
  changeLogIds: [
    "r19-batch-242-251",
    "r19-family-blissey",
    "r19-family-larvitar",
    "r20-batch-242-251",
    "r20-family-blissey",
    "r20-family-larvitar",
  ],
  changeLogs,
  expectedStaticCounts: {
    species: 10,
    forms: 10,
    variants: 41,
    message: "#242～#251 靜態計數不符 10 species／10 forms／41 variants。",
  },
  expectedDatabaseCounts: {
    species: 10,
    forms: 10,
    variants: 41,
    categoryEvaluations: 287,
  },
  texts: {
    battleMega: "Mega 型態是獨立戰鬥版本；只與普通、暗影及 Max 版本分開評估。",
    battleDynamax: (released) =>
      released
        ? "此 Max 版本已由來源核對為已推出；普通個體不能替代 Max 個體。"
        : "此 Max 版本尚未推出；普通個體不能替代 Max 個體。",
    retentionPveMega: "此 Mega 版本有獨立 PvE 與 Mega boost 用途；先核對招式、等級與實際投入。",
    retentionPveWithLevel:
      "本批 PvE 用途依研究表分成核心投資、可用／預算型或特殊用途；不把缺少精確斷點誤當成整個家族待判斷。",
    retentionPveDefault: "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
    retentionMega: "此 Mega 版本已推出且與其他版本分開；只留實際投入候選。",
    retentionMegaBase: "此普通型態可作 Mega 基底候選；不把 Mega 用途回推成全家族必留。",
    retentionMax: (variant) =>
      variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX"
        ? variant.released
          ? "此 Max 版本已由來源核對為已推出；與普通／暗影版本分開保留。"
          : "此 Max 版本尚未推出；普通個體不能替代 Max 個體。"
        : "Max 用途與普通、暗影、Mega 分開評估。",
  },
});
