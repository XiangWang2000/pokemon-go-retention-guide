import type { PveUseLevel } from "../rules/battle-assessment";

export interface LaterEvolutionUse {
  targetZhTw: string;
  level: PveUseLevel;
  noteZhTw: string;
}

/**
 * 用來避免把本批前階誤當成「資料缺失」。這裡只記錄已知的後續進化用途，
 * 不把用途無法確認的範圍外成員當成必留。
 */
export const laterEvolutionUses: Record<string, LaterEvolutionUse> = {
  "063-kanto": {
    targetZhTw: "胡地",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為胡地；其 Mega／Max 與暗影版本用途需分開核對。",
  },
  "064-kanto": {
    targetZhTw: "胡地",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為胡地；保留少量符合進化用途的候選。",
  },
  "057-kanto": {
    targetZhTw: "棄世猴",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為後續世代的棄世猴，保留少量合適進化候選。",
  },
  "079-kanto": {
    targetZhTw: "呆呆王",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為呆呆王；與呆殼獸分支分開判斷。",
  },
  "081-kanto": {
    targetZhTw: "自爆磁怪",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為自爆磁怪，具電／鋼屬性戰鬥與部分 PvP 用途。",
  },
  "082-kanto": {
    targetZhTw: "自爆磁怪",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為自爆磁怪；不要只因關都本體沒有後續圖鑑號碼而判為待補。",
  },
  "083-galar": {
    targetZhTw: "蔥遊兵",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "伽勒爾大蔥鴨可進化為蔥遊兵；保留少量進化候選。",
  },
  "095-kanto": {
    targetZhTw: "大鋼蛇",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為大鋼蛇；進化候選與本體道館用途分開。",
  },
  "102-kanto": {
    targetZhTw: "椰蛋樹（阿羅拉）",
    level: "SPECIAL_USE",
    noteZhTw: "可接阿羅拉進化分支；只留符合分支用途的少量候選。",
  },
  "104-kanto": {
    targetZhTw: "嘎啦嘎啦（阿羅拉）",
    level: "SPECIAL_USE",
    noteZhTw: "可接阿羅拉進化分支；不把一般嘎啦嘎啦與阿羅拉型態混為一談。",
  },
  "108-kanto": {
    targetZhTw: "大舌舔",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為大舌舔；主要是特定 PvP 候選。",
  },
  "111-kanto": {
    targetZhTw: "超甲狂犀",
    level: "CORE_INVESTMENT",
    noteZhTw: "可進化為超甲狂犀；後續 PvE 投資價值不能因本體仍在關都而忽略。",
  },
  "112-kanto": {
    targetZhTw: "超甲狂犀",
    level: "CORE_INVESTMENT",
    noteZhTw: "可進化為超甲狂犀；保留少量高品質進化候選。",
  },
  "113-kanto": {
    targetZhTw: "幸福蛋",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為幸福蛋；道館防守是特殊用途，不等於核心 PvE。",
  },
  "114-kanto": {
    targetZhTw: "巨蔓藤",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為巨蔓藤；屬於可用或預算型進化候選。",
  },
  "116-kanto": {
    targetZhTw: "刺龍王",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為刺龍王；保留少量分支進化候選。",
  },
  "117-kanto": {
    targetZhTw: "刺龍王",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為刺龍王；與海刺龍本體用途分開判斷。",
  },
  "122-galar": {
    targetZhTw: "踏冰人偶",
    level: "SPECIAL_USE",
    noteZhTw: "伽勒爾魔牆人偶可進化為踏冰人偶；屬於分支／特殊用途候選。",
  },
  "123-kanto": {
    targetZhTw: "巨鉗螳螂",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為巨鉗螳螂；不要因劈斧螳螂不能由此進化而整家族判為待補。",
  },
  "125-kanto": {
    targetZhTw: "電擊魔獸",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為電擊魔獸；屬於可用或預算型進化候選。",
  },
  "126-kanto": {
    targetZhTw: "鴨嘴炎獸",
    level: "USABLE_OR_BUDGET",
    noteZhTw: "可進化為鴨嘴炎獸；屬於可用或預算型進化候選。",
  },
  "133-kanto": {
    targetZhTw: "後續伊布分支",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為多個後續世代分支；依目標分支與用途少量保留。",
  },
  "137-kanto": {
    targetZhTw: "多邊獸Ⅱ／多邊獸Z",
    level: "SPECIAL_USE",
    noteZhTw: "可進化為多邊獸Ⅱ及多邊獸Z；進化道具與目標用途需分開管理。",
  },
};
