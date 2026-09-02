import {
  evolutionPairs182211,
  forms182211,
  migratedStubIds182211,
  pvpokeSpeciesId182211,
  pveUseLevels182211,
  releasedDynamaxForms182211,
  releasedGigantamaxForms182211,
  releasedMegaForms182211,
  releasedShadowForms182211,
  specialVariants182211,
  species182211,
} from "../../src/data/batch-182-211";
import { runLegacyBatchImport } from "./legacy-batch-import";

const changeLogs = [
  {
    id: "r19-batch-182-211",
    entityType: "Batch",
    entityId: "182-211",
    fieldName: "status",
    previousValue: null,
    newValue: "RESEARCHED",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "新增 #182～#211，沿用共用保留規則與逐版本資料處置。",
  },
  {
    id: "r19-family-baby-pikachu",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_025",
    fieldName: "members",
    previousValue: "#025～#026",
    newValue: "#172→#025→#026",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "皮丘使用既有皮卡丘 familyKey 與正式進化路徑，不因跨世代圖鑑號拆家族。",
  },
  {
    id: "r19-family-baby-clefairy",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_035",
    fieldName: "members",
    previousValue: "#035～#036",
    newValue: "#173→#035→#036",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "皮寶寶使用既有皮皮 familyKey 與正式進化路徑。",
  },
  {
    id: "r19-family-baby-jigglypuff",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_039",
    fieldName: "members",
    previousValue: "#039～#040",
    newValue: "#174→#039→#040",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "寶寶丁使用既有胖丁 familyKey 與正式進化路徑。",
  },
  {
    id: "r19-family-crobat",
    entityType: "EvolutionFamily",
    entityId: "KANTO_FAMILY_041",
    fieldName: "members",
    previousValue: "#041～#042＋#169 stub",
    newValue: "#041→#042→#169",
    sourceId: "OFF-JOHTO-TOUR-2022",
    changeReasonZhTw: "#169 叉字蝠改為本批正式成員，移除同 ID 的 evolution stub 狀態。",
  },
];

runLegacyBatchImport({
  batchStart: 182,
  batchEnd: 211,
  batchLabel: "#182～#211",
  checkedAt: new Date("2026-08-28T00:00:00+08:00"),
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
    "../../research_notes/sources/official-182-211.json",
    import.meta.url,
  ),
  sourceNotes: "第 #182～#211 批次來源研究表。",
  species: species182211,
  forms: forms182211,
  evolutionPairs: evolutionPairs182211,
  specialVariants: specialVariants182211,
  pveUseLevels: pveUseLevels182211,
  dynamaxDefaultDecision: "CONDITIONAL_KEEP",
  variantUseOverrides: {
    "196-johto-dynamax": {
      maxUseLevel: "USABLE_OR_BUDGET",
      maxSummaryZhTw:
        "極巨太陽伊布已推出；Psychic Max 攻擊為 S Tier、目前約同屬性 #3，但整體 Max 投資仍只需少量高品質候選。",
    },
    "197-johto-dynamax": {
      maxUseLevel: "SPECIAL_USE",
      maxSummaryZhTw:
        "極巨月亮伊布已推出；攻擊與充能防守較弱，但可作 C Tier Max 治療手，只留少量功能候選。",
    },
  },
  pvpokeSpeciesId: pvpokeSpeciesId182211,
  releaseSets: {
    shadow: releasedShadowForms182211,
    mega: releasedMegaForms182211,
    dynamax: releasedDynamaxForms182211,
    gigantamax: releasedGigantamaxForms182211,
  },
  migratedStubIds: migratedStubIds182211,
  resetEvolutionFromFormIds: ["106-kanto", "107-kanto"],
  changeLogIds: [
    "r19-batch-182-211",
    "r19-family-baby-pikachu",
    "r19-family-baby-clefairy",
    "r19-family-baby-jigglypuff",
    "r19-family-crobat",
  ],
  changeLogs,
  expectedStaticCounts: {
    species: 30,
    forms: 31,
    variants: 125,
    message: "#182～#211 靜態計數不符 30 species／31 forms（含 Galar form）／125 variants。",
  },
  expectedDatabaseCounts: {
    species: 30,
    forms: 31,
    variants: 125,
    categoryEvaluations: 875,
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
