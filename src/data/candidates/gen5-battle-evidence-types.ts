export type CandidateBattleUseLevel =
  | "CORE_INVESTMENT"
  | "USABLE_OR_BUDGET"
  | "SPECIAL_USE"
  | "NO_SIGNIFICANT_USE";

export type CandidateBattleEvidence = {
  level: Exclude<CandidateBattleUseLevel, "NO_SIGNIFICANT_USE">;
  roles: readonly string[];
  sourceUrl: string;
  checkedAt: string;
  summaryZhTw: string;
};

export type CandidatePveEvidence = CandidateBattleEvidence;
export type CandidateMaxEvidence = CandidateBattleEvidence;
