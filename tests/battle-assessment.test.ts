import { describe, expect, it } from "vitest";
import {
  classifyAssessmentDisposition,
  classifyPveUse,
  missingDataSummaryZhTw,
} from "@/rules/battle-assessment";

describe("共用 PvE 用途與逐版本資料處置規則", () => {
  it("把 PvE 用途拆成四級，而不是只有有用／沒用", () => {
    expect(classifyPveUse({ pveTiers: ["S"] })).toBe("CORE_INVESTMENT");
    expect(classifyPveUse({ pveTiers: ["CORE_INVESTMENT"] })).toBe("CORE_INVESTMENT");
    expect(classifyPveUse({ pveTiers: ["BUDGET_ONLY"] })).toBe("USABLE_OR_BUDGET");
    expect(classifyPveUse({ pveTiers: ["USABLE_OR_BUDGET"] })).toBe("USABLE_OR_BUDGET");
    expect(classifyPveUse({ pveTiers: ["SPECIAL_USE"] })).toBe("SPECIAL_USE");
    expect(classifyPveUse({ hasMaxPveValue: true })).toBe("SPECIAL_USE");
    expect(classifyPveUse({ pveTiers: ["F"] })).toBe("NO_SIGNIFICANT_USE");
  });

  it("後續進化用途不會因本階沒有直接 PvE 快照而消失", () => {
    expect(
      classifyPveUse({
        hasLaterEvolutionValue: true,
        laterEvolutionLevel: "USABLE_OR_BUDGET",
      }),
    ).toBe("USABLE_OR_BUDGET");
  });

  it("只有真正待補資料才回傳暫時不要傳", () => {
    expect(
      classifyAssessmentDisposition({
        releaseStatus: "RELEASED",
        pveUseLevel: "USABLE_OR_BUDGET",
        hasAnyActionableUse: true,
      }),
    ).toBe("LIMITED_USE");
    expect(
      classifyAssessmentDisposition({
        releaseStatus: "UNRELEASED",
        pveUseLevel: "NO_SIGNIFICANT_USE",
        hasAnyActionableUse: false,
      }),
    ).toBe("NOT_APPLICABLE_OR_UNRELEASED");
    expect(
      classifyAssessmentDisposition({
        releaseStatus: "RELEASED",
        pveUseLevel: "NO_SIGNIFICANT_USE",
        hasAnyActionableUse: false,
        hasTrueDataGap: true,
      }),
    ).toBe("TRUE_DATA_PENDING");
    expect(
      classifyAssessmentDisposition({
        releaseStatus: "UNKNOWN",
        pveUseLevel: "CORE_INVESTMENT",
        hasAnyActionableUse: true,
      }),
    ).toBe("CLEAR_USE");
    expect(missingDataSummaryZhTw("TRUE_DATA_PENDING")).toBe("無法判斷，暫時不要傳。");
    expect(missingDataSummaryZhTw("NO_SIGNIFICANT_USE")).not.toContain("無法判斷");
  });
});
