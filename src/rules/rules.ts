export type RuleDecision = "KEEP" | "CONDITIONAL_KEEP" | "TRANSFER_CANDIDATE" | "NEEDS_REVIEW";

export const RULES_VERSION = "2026.07.15-v2";

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
    ruleKey: "MATERIAL_DATA_GAP",
    version: RULES_VERSION,
    priority: 1000,
    condition: "推出狀態不明，或缺少會改變最終決策的關鍵資料",
    resultingDecision: "NEEDS_REVIEW",
    reasonTemplateZhTw: "仍有會影響保留結論的關鍵資料缺口，必須完成指定審核後再判斷。",
    enabled: true,
  },
  {
    ruleKey: "UNRELEASED_VARIANT",
    version: RULES_VERSION,
    priority: 950,
    condition: "已確認此戰鬥版本尚未推出",
    resultingDecision: "TRANSFER_CANDIDATE",
    reasonTemplateZhTw: "此戰鬥版本已確認尚未推出，目前不構成一般個體的保留理由。",
    enabled: true,
  },
  {
    ruleKey: "MAJOR_BATTLE_VALUE",
    version: RULES_VERSION,
    priority: 900,
    condition: "主要 PvP、PvE、暗影、Mega、Max Battle 或重要道館用途具有高價值",
    resultingDecision: "KEEP",
    reasonTemplateZhTw: "此型態具有明確的主要戰鬥用途，建議依 IV 與招式方向保留少量合適個體。",
    enabled: true,
  },
  {
    ruleKey: "VALUABLE_EVOLUTION",
    version: RULES_VERSION,
    priority: 850,
    condition: "後續進化具有明確主要戰鬥價值",
    resultingDecision: "KEEP",
    reasonTemplateZhTw: "後續進化具有明確戰鬥價值，不應直接把前階個體視為可傳送。",
    enabled: true,
  },
  {
    ruleKey: "CONDITIONAL_USE",
    version: RULES_VERSION,
    priority: 700,
    condition: "僅特殊盃、限定招式、特定 IV、Mega／Max 候選、少量道館用途或狹窄屬性用途",
    resultingDecision: "CONDITIONAL_KEEP",
    reasonTemplateZhTw: "用途受特定條件限制，只需保留符合條件的少量個體。",
    enabled: true,
  },
  {
    ruleKey: "LOW_GENERAL_VALUE",
    version: RULES_VERSION,
    priority: 100,
    condition: "關鍵類別足以確認低價值，且沒有重要進化、招式或特殊用途",
    resultingDecision: "TRANSFER_CANDIDATE",
    reasonTemplateZhTw: "目前缺乏明確的主要戰鬥與後續進化用途，一般個體通常可傳送。",
    enabled: true,
  },
] as const;
