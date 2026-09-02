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
  dynamaxDefaultDecision: "CONDITIONAL_KEEP",
  variantUseOverrides: {
    "242-johto-normal": {
      pveUseLevel: "NO_SIGNIFICANT_USE",
      pveSummaryZhTw:
        "幸福蛋不適合作為團體戰攻擊手；其主要保留理由是道館防守與 Max 輔助角色，不應標成一般 PvE 攻擊候選。",
      gymSummaryZhTw:
        "幸福蛋仍是極具代表性的道館防守目標；若在意道館，可留少量高耐久／高整體 IV 候選。",
    },
    "242-johto-dynamax": {
      maxUseLevel: "CORE_INVESTMENT",
      maxSummaryZhTw:
        "極巨幸福蛋是目前 S Tier Max 治療手，並有 C Tier 防守價值；這個 Max 版本值得保留高品質實用候選。",
    },
    "243-johto-shadow": {
      pveUseLevel: "CORE_INVESTMENT",
      pveSummaryZhTw:
        "暗影雷公目前為 S Tier 電系團戰攻擊手，且整體團戰約 A+ Tier；暗影保留門檻應明顯寬於普通雷公。",
    },
    "243-johto-dynamax": {
      maxUseLevel: "USABLE_OR_BUDGET",
      maxSummaryZhTw:
        "極巨雷公目前約 C Tier Max 攻擊手，亦可作 C Tier 治療／防守角色；留少量高品質候選即可。",
    },
    "244-johto-shadow": {
      pveUseLevel: "USABLE_OR_BUDGET",
      pveSummaryZhTw:
        "暗影炎帝目前約 A+ Tier 火系攻擊手，但整體團戰約 B Tier且有更強替代；可留少量優質候選，不必大量囤積。",
    },
    "244-johto-dynamax": {
      maxUseLevel: "USABLE_OR_BUDGET",
      maxSummaryZhTw:
        "極巨炎帝攻擊約 D Tier，但 Max 治療達 A Tier；主要以輔助角色保留少量實用候選。",
    },
    "245-johto-normal": {
      pveUseLevel: "NO_SIGNIFICANT_USE",
      pveSummaryZhTw:
        "普通水君目前水系團戰約 F Tier，不是一般 PvE 投資目標；若有 PvP 或 Max 用途需分開保留。",
    },
    "245-johto-shadow": {
      pveUseLevel: "NO_SIGNIFICANT_USE",
      pveSummaryZhTw:
        "暗影水君也不因暗影加成就自動成為團戰投資目標；若保留應基於 PvP、收藏或其他獨立用途。",
    },
    "245-johto-dynamax": {
      maxUseLevel: "USABLE_OR_BUDGET",
      maxSummaryZhTw:
        "極巨水君攻擊偏低，但目前有 B Tier Max 防守與 B Tier 治療價值；保留少量功能型候選。",
    },
    "249-johto-dynamax": {
      maxUseLevel: "SPECIAL_USE",
      maxSummaryZhTw:
        "極巨大洛奇亞攻擊偏低、充能防守角色也差，但可作 B Tier Max 治療手；只需少量功能候選。",
    },
    "250-johto-dynamax": {
      maxUseLevel: "USABLE_OR_BUDGET",
      maxSummaryZhTw:
        "極巨鳳王目前約 C Tier Max 攻擊手與 C Tier 治療手；有實戰空間但非核心，留少量高品質候選即可。",
    },
  },
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
