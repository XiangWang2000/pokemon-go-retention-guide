import {
  evolutionPairs212241,
  forms212241,
  migratedStubIds212241,
  pvpokeSpeciesId212241,
  pveUseLevels212241,
  releasedDynamaxForms212241,
  releasedGigantamaxForms212241,
  releasedMegaForms212241,
  releasedShadowForms212241,
  specialVariants212241,
  species212241,
} from "../../src/data/batch-212-241";
import { runLegacyBatchImport } from "./legacy-batch-import";

const changeLogs = [
  {
    id: "r19-batch-212-241",
    entityType: "Batch",
    entityId: "212-241",
    fieldName: "status",
    previousValue: null,
    newValue: "RESEARCHED",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "新增 #212～#241，沿用共用保留規則與逐版本資料處置。",
  },
  {
    id: "r19-family-scizor",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_123",
    fieldName: "members",
    previousValue: "#123",
    newValue: "#123→#212",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "巨鉗螳螂使用既有飛天螳螂 familyKey 與正式進化路徑，不因跨世代圖鑑號拆家族。",
  },
  {
    id: "r19-family-kingdra",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_116",
    fieldName: "members",
    previousValue: "#116→#117",
    newValue: "#116→#117→#230",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "刺龍王使用既有海刺龍 familyKey 與正式進化路徑。",
  },
  {
    id: "r19-family-porygon",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_137",
    fieldName: "members",
    previousValue: "#137",
    newValue: "#137→#233→#474",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "多邊獸Ⅱ使用既有多邊獸 familyKey 與正式進化路徑。",
  },
  {
    id: "r19-family-tyrogue",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_236",
    fieldName: "members",
    previousValue: "#106；#107",
    newValue: "#236→#106；#236→#107；#236→#237",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw:
      "無畏小子與飛腿郎、快拳郎、戰舞郎共用既有 familyKey，依正式分支進化路徑整合家族。",
  },
];

runLegacyBatchImport({
  batchStart: 212,
  batchEnd: 241,
  batchLabel: "#212～#241",
  checkedAt: new Date("2026-08-08T18:00:00+08:00"),
  pvpokeCommit: "7b96d91fb553780653190ad32de001b5d9086a7f",
  pvpSnapshot: {
    root: "data/sources/pvpoke/2026-09-01",
    label: "2026-09-01",
    checkedAt: new Date("2026-09-01T00:00:00+08:00"),
    sourceIds: {
      GREAT: "pvpoke-gl-20260901",
      ULTRA: "pvpoke-ul-20260901",
      MASTER: "pvpoke-ml-20260901",
    },
  },
  revision: "r19",
  officialResearchPath: new URL(
    "../../research_notes/sources/official-212-241.json",
    import.meta.url,
  ),
  sourceNotes: "第 #212～#241 批次來源研究表。",
  sourceOptions: { includeMaxSource: true },
  species: species212241,
  forms: forms212241,
  evolutionPairs: evolutionPairs212241,
  specialVariants: specialVariants212241,
  pveUseLevels: pveUseLevels212241,
  dynamaxDefaultDecision: "CONDITIONAL_KEEP",
  variantUseOverrides: {
    "213-johto-dynamax": {
      maxUseLevel: "SPECIAL_USE",
      maxSummaryZhTw:
        "極巨壺壺已推出，但目前岩石 Max 攻擊僅 F Tier，且不屬主流充能防守手；收藏或特殊需求留少量即可。",
    },
    "215-johto-normal": {
      categorySourceIds: {
        MAX_BATTLE: ["MAX-GEN2-SNEASEL-20260902"],
      },
    },
    "215-johto-dynamax": {
      maxUseLevel: "USABLE_OR_BUDGET",
      maxSummaryZhTw:
        "極巨狃拉已推出；冰系 Max 攻擊目前約 C Tier #6，惡系較低，可留少量實際攻擊或進化候選。",
    },
    "227-johto-normal": {
      pveUseLevel: "NO_SIGNIFICANT_USE",
      pveSummaryZhTw:
        "普通盔甲鳥目前鋼／飛行團戰皆為 F Tier；Mega 用途另行評估，不把 Mega 價值回推成普通版本 PvE 必留。",
    },
    "227-johto-shadow": {
      pveUseLevel: "NO_SIGNIFICANT_USE",
      pveSummaryZhTw:
        "暗影盔甲鳥目前鋼／飛行團戰仍為 F Tier；若有 PvP 用途依 PvP 個體另留，不以 PvE 名義囤積。",
    },
    "237-johto-dynamax": {
      maxUseLevel: "SPECIAL_USE",
      maxSummaryZhTw:
        "極巨戰舞郎已推出，但格鬥 Max 攻擊目前約 F Tier；只保留少量特殊用途或收藏候選。",
    },
  },
  pvpokeSpeciesId: pvpokeSpeciesId212241,
  releaseSets: {
    shadow: releasedShadowForms212241,
    mega: releasedMegaForms212241,
    dynamax: releasedDynamaxForms212241,
    gigantamax: releasedGigantamaxForms212241,
  },
  migratedStubIds: migratedStubIds212241,
  resetEvolutionFromFormIds: ["106-kanto", "107-kanto"],
  changeLogIds: [
    "r19-batch-212-241",
    "r19-family-scizor",
    "r19-family-kingdra",
    "r19-family-porygon",
    "r19-family-tyrogue",
  ],
  changeLogs,
  expectedStaticCounts: {
    species: 30,
    forms: 30,
    variants: 124,
    message: "#212～#241 靜態計數不符 30 species／31 forms（含 Galar stub）／121 variants。",
  },
  expectedDatabaseCounts: {
    species: 30,
    forms: 30,
    variants: 124,
    categoryEvaluations: 868,
  },
  texts: {
    battleMega: "Mega 電龍是獨立戰鬥型態；只與普通基底、暗影及 Max 版本分開評估。",
    battleDynamax: (released) =>
      released
        ? "此極巨版本已由來源確認推出；是否保留依實際 Max 角色分級，不因推出就自動大量保留。"
        : "本批沒有來源確認此物種的極巨版本已推出；普通個體不能替代極巨個體。",
    retentionPveMega:
      "Mega 電龍有特殊 PvE 與 Mega boost 用途，非核心投資；先核對 Volt Switch／Zap Cannon、等級與投入。",
    retentionPveDefault: "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
    retentionMega: "Mega 電龍已推出且與其他版本分開；只留實際投入候選。",
    retentionMegaBase: "普通電龍可作 Mega 基底候選；不把 Mega 用途回推成全家族必留。",
    retentionMax: (variant) =>
      variant.variantKey === "DYNAMAX"
        ? variant.released
          ? "此極巨版本已推出；依攻擊、治療或防守角色只留實際需要的候選。"
          : "本批未確認此極巨版本推出；普通個體不能替代極巨個體。"
        : "Max 用途與普通／暗影／Mega 分開評估.",
  },
});
