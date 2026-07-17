import { describe, expect, it } from "vitest";
import {
  calculateDecisionConfidence,
  evaluateRetention,
  hasEnoughEvidenceForKeep,
  hasEnoughEvidenceForTransfer,
  hasMaterialUncertainty,
  shouldHoldForNow,
  type EvaluationFacts,
} from "@/rules/engine";

const base: EvaluationFacts = {
  releaseStatus: "RELEASED",
  categoryStatuses: { PVP: "VERIFIED", PVE: "VERIFIED", ROCKET: "DATA_UNAVAILABLE" },
  materialCategories: ["PVP", "PVE"],
  ruleCovered: true,
  hasOptionalDataGap: false,
  hasReliableSources: true,
  releaseStatusKnown: true,
  hasSourceConflict: false,
  hasStaleCriticalData: false,
  majorPvpValue: false,
  highPveValue: false,
  shadowPveAdvantage: false,
  importantMega: false,
  importantMaxBattle: false,
  highGymValue: false,
  valuableEvolution: false,
  specialCupOnly: false,
  requiresSpecificMove: false,
  requiresSpecificIv: false,
  megaCandidateOnly: false,
  maxCandidateOnly: false,
  limitedGymUse: false,
  speciesBattleValueLow: true,
  normalHighIvOnly: false,
};

function run(changes: Partial<EvaluationFacts> = {}) {
  return evaluateRetention({ ...base, ...changes });
}

describe("不可逆風險保留規則", () => {
  it("1. 缺少火箭隊統一排名不會自動產生 HOLD_FOR_NOW", () => {
    const result = run({ hasOptionalDataGap: true });
    expect(result.finalDecision).toBe("TRANSFER_CANDIDATE");
    expect(result.confidence).toBe("MEDIUM");
  });

  it("2. NOT_APPLICABLE 不影響正式結論", () => {
    expect(
      run({ categoryStatuses: { PVP: "VERIFIED", PVE: "VERIFIED", MEGA: "NOT_APPLICABLE" } })
        .finalDecision,
    ).toBe("TRANSFER_CANDIDATE");
  });

  it("3. 關鍵 Mega 推出狀態不明時產生 HOLD_FOR_NOW", () => {
    const facts = {
      ...base,
      releaseStatus: "UNKNOWN" as const,
      releaseStatusKnown: false,
      hasUnconfirmedImportantMegaOrMaxOrEvolution: true,
    };
    const result = evaluateRetention(facts);
    expect(hasMaterialUncertainty(facts)).toBe(true);
    expect(shouldHoldForNow(facts)).toBe(true);
    expect(result.finalDecision).toBe("HOLD_FOR_NOW");
    expect(result.reasonZhTw).toContain("推出");
  });

  it("4. 已確認沒有重要用途時可產生 TRANSFER_CANDIDATE", () => {
    expect(hasEnoughEvidenceForTransfer(base)).toBe(true);
    expect(run().finalDecision).toBe("TRANSFER_CANDIDATE");
  });

  it("5. 本體用途低但後續進化有價值時產生 CONDITIONAL_KEEP", () => {
    const facts = { ...base, valuableEvolution: true };
    expect(hasEnoughEvidenceForKeep(facts)).toBe(true);
    expect(evaluateRetention(facts).finalDecision).toBe("CONDITIONAL_KEEP");
  });

  it("6. 部分次要資料缺失時仍有正式決策並降低 confidence", () => {
    const facts = {
      ...base,
      categoryStatuses: { PVP: "VERIFIED", PVE: "VERIFIED", GYM: "PARTIALLY_VERIFIED" } as const,
      hasOptionalDataGap: true,
    };
    const result = evaluateRetention(facts);
    expect(result.finalDecision).toBe("TRANSFER_CANDIDATE");
    expect(calculateDecisionConfidence(facts, result.finalDecision)).toBe("MEDIUM");
  });

  it("7. finalDecision 不再包含 NEEDS_REVIEW", () => {
    const decisions = [
      run().finalDecision,
      run({ valuableEvolution: true }).finalDecision,
      run({ majorPvpValue: true, speciesBattleValueLow: false }).finalDecision,
      run({ releaseStatus: "UNKNOWN", releaseStatusKnown: false }).finalDecision,
    ];
    expect(decisions).toEqual(
      expect.arrayContaining(["KEEP", "CONDITIONAL_KEEP", "HOLD_FOR_NOW", "TRANSFER_CANDIDATE"]),
    );
    expect(decisions).not.toContain("NEEDS_REVIEW");
  });

  it("10. 所有 HOLD_FOR_NOW 都有具體中文原因", () => {
    const cases: Partial<EvaluationFacts>[] = [
      { releaseStatus: "UNKNOWN", releaseStatusKnown: false },
      { possibleSpeciesMismatch: true },
      { hasSourceConflict: true },
      { hasUncertainRequiredMoveImpact: true },
      { ruleCovered: false },
    ];
    for (const changes of cases) {
      const result = run(changes);
      expect(result.finalDecision).toBe("HOLD_FOR_NOW");
      expect(result.reasonZhTw.length).toBeGreaterThan(25);
      expect(result.reasonZhTw).not.toBe("資料不足");
    }
  });

  it("果然翁不套用典型低攻 PvP IV 規則", () => {
    expect(
      run({
        speciesBattleValueLow: false,
        majorPvpValue: true,
        unusualPvpIvProfile: "WYNAUT_OR_WOBBUFFET",
      }).recommendedIvStrategyZhTw,
    ).toContain("接近滿 IV");
  });
});
