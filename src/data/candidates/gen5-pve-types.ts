export type CandidatePveUseLevel =
  | "CORE_INVESTMENT"
  | "USABLE_OR_BUDGET"
  | "SPECIAL_USE";

export type CandidatePveEvidence = {
  level: CandidatePveUseLevel;
  roles: readonly string[];
  sourceUrl: string;
  checkedAt: string;
  summaryZhTw: string;
};

export type CandidateMaxEvidence = CandidatePveEvidence;
