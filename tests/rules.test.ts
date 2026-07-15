import { describe, expect, it } from "vitest";
import { evaluateRetention, type EvaluationFacts } from "@/rules/engine";

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

function run(changes: Partial<EvaluationFacts>) {
  return evaluateRetention({ ...base, ...changes });
}

describe("類別資料狀態與最終決策分離", () => {
  it("1. 缺火箭隊排名仍可產生正式決策", () => {
    const result = run({ hasOptionalDataGap: true });
    expect(result.decision).toBe("TRANSFER_CANDIDATE");
    expect(result.confidence).toBe("MEDIUM");
  });

  it("2. NOT_APPLICABLE 不會觸發 NEEDS_REVIEW", () => {
    expect(
      run({ categoryStatuses: { PVP: "VERIFIED", PVE: "VERIFIED", MEGA: "NOT_APPLICABLE" } })
        .decision,
    ).toBe("TRANSFER_CANDIDATE");
  });

  it("3. UNRANKED 不會被當成 SOURCE_MISSING", () => {
    expect(run({ categoryStatuses: { PVP: "UNRANKED", PVE: "VERIFIED" } }).decision).toBe(
      "TRANSFER_CANDIDATE",
    );
  });

  it("4. UNRELEASED 不會被當成 UNKNOWN", () => {
    expect(run({ releaseStatus: "UNRELEASED" }).decision).toBe("TRANSFER_CANDIDATE");
  });

  it("5. UNKNOWN_RELEASE_STATUS 會阻止正式決策", () => {
    expect(run({ releaseStatus: "UNKNOWN" }).decision).toBe("NEEDS_REVIEW");
  });

  it("13. 非關鍵資料缺口只把 confidence 降為 MEDIUM", () => {
    const result = run({
      hasOptionalDataGap: true,
      categoryStatuses: { PVP: "VERIFIED", PVE: "VERIFIED", GYM: "PARTIALLY_VERIFIED" },
    });
    expect(result.decision).not.toBe("NEEDS_REVIEW");
    expect(result.confidence).toBe("MEDIUM");
  });

  it("14. 只有關鍵類別的 SOURCE_MISSING 才產生 NEEDS_REVIEW", () => {
    expect(run({ categoryStatuses: { PVP: "VERIFIED", PVE: "SOURCE_MISSING" } }).decision).toBe(
      "NEEDS_REVIEW",
    );
    expect(
      run({
        categoryStatuses: { PVP: "VERIFIED", PVE: "VERIFIED", GYM: "SOURCE_MISSING" },
        hasOptionalDataGap: true,
      }).decision,
    ).toBe("TRANSFER_CANDIDATE");
  });

  it("普通高 IV 不會覆蓋物種低戰鬥價值", () => {
    expect(run({ normalHighIvOnly: true }).decision).toBe("TRANSFER_CANDIDATE");
  });

  it("高價值暗影 PvE 與普通版分開判定", () => {
    expect(run({ speciesBattleValueLow: false, shadowPveAdvantage: true }).decision).toBe("KEEP");
  });

  it("只有特殊盃用途時為條件式保留", () => {
    expect(run({ speciesBattleValueLow: false, specialCupOnly: true }).decision).toBe(
      "CONDITIONAL_KEEP",
    );
  });

  it("後續進化有價值時前階不可直接傳送", () => {
    expect(run({ valuableEvolution: true }).decision).toBe("KEEP");
  });

  it("果然翁類型不套用典型低攻 IV 說法", () => {
    expect(
      run({
        speciesBattleValueLow: false,
        majorPvpValue: true,
        unusualPvpIvProfile: "WYNAUT_OR_WOBBUFFET",
      }).recommendedIvStrategyZhTw,
    ).toContain("偏高甚至接近滿 IV");
  });
});
