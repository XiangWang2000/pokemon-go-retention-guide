import { describe, expect, it } from "vitest";
import {
  derivePurifiedReleaseStatus,
  normalizePvpRank,
  pokebattlerIdentityKey,
  pvpCategoryCanPopulateOverall,
  resolveCategoryProvenance,
  resolvePurifiedInheritance,
  releaseStatusFromPvpRanking,
  resolveReleaseStatus,
  splitMaxEvaluation,
  stableReviewIssueKey,
  unknownReleaseIssueDetails,
} from "@/data/remediation-policy";

const completeRank = {
  league: "GREAT",
  cup: "OPEN",
  category: "OVERALL",
  seasonOrVersion: "commit-sha",
  speciesKey: "fearow",
  formKey: "022-kanto",
  variantKey: "NORMAL",
  rank: 20,
  sourceUrl: "https://example.test/rankings.json",
  checkedAt: "2026-07-15",
  extractionMethod: "完整 JSON 陣列索引",
  reproducible: true,
};

describe("資料修正政策", () => {
  it("6. Purified 沒有 override 時繼承 Normal", () => {
    const result = resolvePurifiedInheritance({ normalStatus: "VERIFIED" });
    expect(result).toMatchObject({
      status: "VERIFIED",
      inheritanceMode: "NORMAL_BASE",
      overrideRequired: false,
    });
  });

  it("7. Return 特殊用途可建立 Purified override", () => {
    expect(
      resolvePurifiedInheritance({ normalStatus: "UNRANKED", hasReturnUse: true }),
    ).toMatchObject({ inheritanceMode: "NORMAL_BASE_WITH_OVERRIDE", overrideRequired: true });
  });

  it("8. 高價值 Shadow 淨化時提示不可逆風險", () => {
    const result = resolvePurifiedInheritance({
      normalStatus: "VERIFIED",
      shadowHasHighValue: true,
    });
    expect(result.riskZhTw).toContain("不可逆");
    expect(result.overrideRequired).toBe(true);
  });

  it("9. GMax 巴大蝶可高屬性名次但低投資且不產生假衝突", () => {
    expect(
      splitMaxEvaluation({
        maxTypeRank: 1,
        maxTypeTier: "S",
        maxTypeKey: "BUG",
        maxOverallRating: "LIMITED",
        maxInvestmentRating: "LOW",
        maxUseCaseBreadth: "NARROW",
      }),
    ).toMatchObject({ sourceConflict: false, typeSpecialistOnly: true });
  });

  it("10. 無法重現的 PvPoke 名次不得寫入正式 rank", () => {
    expect(normalizePvpRank({ ...completeRank, reproducible: false })).toMatchObject({
      rank: null,
      status: "SOURCE_MISSING",
    });
  });

  it("11. Lead 排名不得填入 Overall 欄位", () => {
    expect(pvpCategoryCanPopulateOverall("LEAD")).toBe(false);
    expect(pvpCategoryCanPopulateOverall("OVERALL")).toBe(true);
  });

  it("12. Pokebattler 不同招式組合具有不同識別鍵", () => {
    const base = {
      speciesKey: "VENUSAUR",
      formKey: "KANTO",
      variantKey: "NORMAL",
      fastMoveKey: "VINE_WHIP",
      chargedMoveKey: "FRENZY_PLANT",
      bossKey: "KYOGRE",
      simulationLevel: "40",
      weather: "NO_WEATHER",
      friendship: "BEST_FRIEND",
      rankingMethod: "ESTIMATOR",
    };
    expect(pokebattlerIdentityKey(base)).not.toBe(
      pokebattlerIdentityKey({ ...base, chargedMoveKey: "SOLAR_BEAM" }),
    );
  });

  it("13. 推出狀態不明的 Purified 版本保留獨立 review issue", () => {
    expect(unknownReleaseIssueDetails("PURIFIED")).toEqual({
      affectsFamily: false,
      messageZhTw: "此淨化版本是否已推出仍待確認；僅影響此版本，不影響家族總結。",
    });
  });

  it("14. 其他非家族版本使用可讀的 review issue 文案", () => {
    expect(unknownReleaseIssueDetails("DYNAMAX")).toEqual({
      affectsFamily: false,
      messageZhTw: "此戰鬥版本是否已推出仍待確認；僅影響此版本，不影響家族總結。",
    });
  });

  it("15. 官方未推出狀態優先，沒有正式狀態時維持 UNKNOWN", () => {
    expect(resolveReleaseStatus("UNRELEASED")).toBe("UNRELEASED");
    expect(resolveReleaseStatus("RELEASED")).toBe("RELEASED");
    expect(resolveReleaseStatus(null)).toBe("UNKNOWN");
  });

  it("16. 實際沒有連結來源時不得標為 SOURCE_VERIFIED", () => {
    expect(resolveCategoryProvenance({ status: "VERIFIED", linkedSourceCount: 0 })).toBe(
      "MANUAL_CURATED",
    );
    expect(resolveCategoryProvenance({ status: "VERIFIED", linkedSourceCount: 1 })).toBe(
      "SOURCE_VERIFIED",
    );
  });

  it("17. review issue identity 不受類別查詢順序影響", () => {
    expect(
      stableReviewIssueKey({ type: "OPTIONAL_DATA_MISSING", categories: ["PVE", "PVP"] }),
    ).toBe(stableReviewIssueKey({ type: "OPTIONAL_DATA_MISSING", categories: ["PVP", "PVE"] }));
    expect(stableReviewIssueKey({ type: "MATERIAL_DATA_GAP", category: "PVP" })).not.toBe(
      stableReviewIssueKey({ type: "MATERIAL_DATA_GAP", category: "PVE" }),
    );
  });

  it("18. Purified 推出狀態嚴格跟隨同型態 Shadow", () => {
    expect(derivePurifiedReleaseStatus("RELEASED")).toBe("RELEASED");
    expect(derivePurifiedReleaseStatus("UNRELEASED")).toBe("UNRELEASED");
    expect(derivePurifiedReleaseStatus("UNKNOWN")).toBe("UNKNOWN");
  });

  it("19. PvPoke 是否有排名都不得推導推出狀態", () => {
    expect(releaseStatusFromPvpRanking(true)).toBe("UNKNOWN");
    expect(releaseStatusFromPvpRanking(false)).toBe("UNKNOWN");
  });
});
