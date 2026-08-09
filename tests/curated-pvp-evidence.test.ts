import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CURATED_PVP_EVIDENCE,
  hasCurrentPvpUse,
  validateCuratedPvpEvidence,
} from "@/data/curated-pvp-evidence";

describe("independent curated PvP evidence", () => {
  it("requires complete independent evidence and does not curate Deoxys Defense", () => {
    expect(validateCuratedPvpEvidence()).toEqual([]);
    expect(CURATED_PVP_EVIDENCE.some((item) => item.formId === "386-defense")).toBe(false);
  });

  it("is deterministic when prior generated decisions or traces differ", () => {
    const currentEvidence = {
      formId: "386-defense",
      variantKey: "NORMAL",
      ranks: [539, 402, 394],
      categoryStatus: "VERIFIED",
      categoryMaterialToDecision: true,
    } as const;
    const priorStates = [
      { previousDecision: undefined, previousRuleTrace: undefined },
      { previousDecision: "KEEP", previousRuleTrace: { matched: true, ruleKey: "CONDITIONAL_USE" } },
      { previousDecision: "CONDITIONAL_KEEP", previousRuleTrace: { matched: true, ruleKey: "CONDITIONAL_USE" } },
      { previousDecision: "TRANSFER_CANDIDATE", previousRuleTrace: { matched: false, ruleKey: "LOW_GENERAL_VALUE" } },
    ];

    expect(
      priorStates.map((prior) => hasCurrentPvpUse({ ...currentEvidence, ...prior })),
    ).toEqual([false, false, false, false]);
    expect(
      priorStates.map((prior) =>
        hasCurrentPvpUse({ ...currentEvidence, ranks: [100], ...prior }),
      ),
    ).toEqual([true, true, true, true]);
  });

  it("keeps generated decision output out of current PvP assessment helpers", () => {
    const source = readFileSync(new URL("../scripts/recompute-001-311.ts", import.meta.url), "utf8");
    const start = source.indexOf("function hasCuratedPvpEvidence");
    const end = source.indexOf("function issueIsCritical");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(source.slice(start, end)).not.toMatch(/retentionEvaluations|ruleTraces|finalDecision/);

    const decisionStart = source.indexOf("function directAssessment");
    const decisionEnd = source.indexOf("function isPrimalFormId");
    expect(decisionStart).toBeGreaterThanOrEqual(0);
    expect(decisionEnd).toBeGreaterThan(decisionStart);
    expect(source.slice(decisionStart, decisionEnd)).not.toMatch(
      /retentionEvaluations|ruleTraces|finalDecision/,
    );
  });
});
