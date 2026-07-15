import { describe, expect, it } from "vitest";
import {
  normalizePvpRank,
  pokebattlerIdentityKey,
  pvpCategoryCanPopulateOverall,
  resolvePurifiedInheritance,
  splitMaxEvaluation,
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
});
