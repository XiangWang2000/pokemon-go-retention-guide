export type RuleDecision = "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE";

export const RULES_VERSION = "2026.07.17-v4";

export interface RuleDefinition {
  ruleKey: string;
  version: string;
  priority: number;
  condition: string;
  resultingDecision: RuleDecision;
  reasonTemplateZhTw: string;
  enabled: boolean;
}

export const retentionRules: readonly RuleDefinition[] = [
  {
    ruleKey: "MATERIAL_UNCERTAINTY",
    version: RULES_VERSION,
    priority: 1000,
    condition: "存在可能改變保留結論的關鍵不確定性，且目前不足以安全建議傳送",
    resultingDecision: "HOLD_FOR_NOW",
    reasonTemplateZhTw: "資料仍有可能改變用途判斷的關鍵缺口；傳送不可逆，補齊前建議暫時保留。",
    enabled: true,
  },
  {
    ruleKey: "UNRELEASED_VARIANT",
    version: RULES_VERSION,
    priority: 950,
    condition: "已確認此戰鬥版本尚未在 Pokémon GO 推出",
    resultingDecision: "TRANSFER_CANDIDATE",
    reasonTemplateZhTw: "此戰鬥版本尚未推出，不適用於現有個體的保留判斷。",
    enabled: true,
  },
  {
    ruleKey: "MAJOR_BATTLE_VALUE",
    version: RULES_VERSION,
    priority: 900,
    condition: "具有主要 PvP、PvE、暗影、Mega、Max Battle 或高道館價值",
    resultingDecision: "KEEP",
    reasonTemplateZhTw: "目前具有明確戰鬥用途；請依用途保留適合的版本、招式與 IV。",
    enabled: true,
  },
  {
    ruleKey: "VALUABLE_EVOLUTION",
    version: RULES_VERSION,
    priority: 850,
    condition: "後續進化具有明確戰鬥價值",
    resultingDecision: "CONDITIONAL_KEEP",
    reasonTemplateZhTw: "本體用途有限，但後續進化具有價值；只保留適合進化用途的個體。",
    enabled: true,
  },
  {
    ruleKey: "CONDITIONAL_USE",
    version: RULES_VERSION,
    priority: 700,
    condition: "僅特殊盃、特定招式或 IV、Mega／Max 候選、少量道館等條件下有用途",
    resultingDecision: "CONDITIONAL_KEEP",
    reasonTemplateZhTw: "只有符合指定用途與條件的個體值得保留，不需囤積一般重複個體。",
    enabled: true,
  },
  {
    ruleKey: "LOW_GENERAL_VALUE",
    version: RULES_VERSION,
    priority: 100,
    condition: "已有足夠證據確認主要用途低，且沒有重要特殊版本或進化價值",
    resultingDecision: "TRANSFER_CANDIDATE",
    reasonTemplateZhTw: "目前缺乏明確戰鬥、特殊版本或後續進化用途，一般重複個體通常可傳送。",
    enabled: true,
  },
] as const;
