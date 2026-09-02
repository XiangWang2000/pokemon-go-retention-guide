import { describe, expect, it } from "vitest";
import {
  GLOBAL_IV_RECOMMENDATIONS,
  calculateTotalIvPercent,
  evaluateIvCandidate,
  formatTotalIvPercent,
  getGlobalIvRecommendation,
  resolveIvRecommendation,
  type IvCandidate,
  type IvRecommendation,
  type PrimaryUseKey,
} from "@/iv/strategy";

function recommendation(use: PrimaryUseKey) {
  const result = getGlobalIvRecommendation(use);
  if (!result) throw new Error(`缺少全域 IV 規則：${use}`);
  return result;
}

function candidate(changes: Partial<IvCandidate> = {}): IvCandidate {
  return {
    attackIv: 15,
    defenseIv: 15,
    staminaIv: 15,
    hasRelevantUse: true,
    ...changes,
  };
}

describe("IV 百分比顯示", () => {
  it.each([
    [[15, 15, 15], 100, "100%"],
    [[15, 15, 14], 97.8, "98%"],
    [[15, 14, 14], 95.6, "96%"],
    [[14, 14, 14], 93.3, "93%"],
    [[15, 13, 13], 91.1, "91%"],
    [[14, 13, 13], 88.9, "89%"],
  ] as const)("%j 使用一致的小數與慣用顯示", ([attack, defense, stamina], exact, label) => {
    expect(calculateTotalIvPercent(attack, defense, stamina)).toBe(exact);
    expect(formatTotalIvPercent(attack, defense, stamina)).toBe(label);
  });
});

describe("通用 IV 門檻", () => {
  it("1/2. 高價值PvE的15攻高整體IV仍是同種長期投資優先", () => {
    expect(
      evaluateIvCandidate(recommendation("PVE"), candidate({ defenseIv: 14, staminaIv: 14 })),
    ).toMatchObject({
      level: "PRIORITY",
      labelZhTw: "PvE：96%以上且15攻，長期／XL投資優先",
    });
  });

  it("明示91%一般投入與96%／15攻長期投資的兩段門檻", () => {
    const rule = recommendation("PVE");
    expect(rule).toMatchObject({ totalIvPercentMin: 91.1, totalIvPercentPriority: 95.6 });
    expect(
      evaluateIvCandidate(rule, candidate({ attackIv: 15, defenseIv: 13, staminaIv: 13 })),
    ).toMatchObject({
      level: "RECOMMENDED",
      totalIvPercentLabel: "91%",
      labelZhTw: "PvE：91%以上已達一般投入門檻；96%以上／15攻更優先",
    });
    expect(
      evaluateIvCandidate(rule, candidate({ attackIv: 14, defenseIv: 13, staminaIv: 13 })),
    ).toMatchObject({
      level: "CONDITIONAL",
      totalIvPercentLabel: "89%",
    });
  });

  it.each([
    [14, 15, 15],
    [14, 15, 14],
  ])("1. %i/%i/%i不會只因非15攻被判定可傳", (attackIv, defenseIv, staminaIv) => {
    expect(
      evaluateIvCandidate(recommendation("PVE"), candidate({ attackIv, defenseIv, staminaIv })),
    ).toMatchObject({ level: "RECOMMENDED" });
  });

  it("3/4. 15/10/10不會自動勝過14/15/15，也不虛構斷點結果", () => {
    const lowBulkFifteen = evaluateIvCandidate(
      recommendation("PVE"),
      candidate({ attackIv: 15, defenseIv: 10, staminaIv: 10 }),
    );
    const durableFourteen = evaluateIvCandidate(
      recommendation("PVE"),
      candidate({ attackIv: 14, defenseIv: 15, staminaIv: 15 }),
    );
    expect(lowBulkFifteen.level).toBe("CONDITIONAL");
    expect(durableFourteen.level).toBe("RECOMMENDED");
    expect(lowBulkFifteen.labelZhTw).toContain("斷點");
    expect(lowBulkFifteen.labelZhTw).not.toMatch(/一定優於|傷害差|%差距/);
  });

  it("5. 低 PvE 價值物種不因 100% 自動取得保留理由", () => {
    expect(
      evaluateIvCandidate(recommendation("PVE"), candidate({ hasRelevantUse: false })),
    ).toMatchObject({ level: "NOT_APPLICABLE" });
  });

  it("Mega沿用不設硬性淘汰線的PvE候選順序", () => {
    expect(
      evaluateIvCandidate(recommendation("MEGA"), candidate({ defenseIv: 14, staminaIv: 14 })),
    ).toMatchObject({ level: "PRIORITY" });
    expect(
      evaluateIvCandidate(
        recommendation("MEGA"),
        candidate({ attackIv: 14, defenseIv: 15, staminaIv: 15 }),
      ),
    ).toMatchObject({ level: "RECOMMENDED" });
  });

  it("13. ML 沒有 15攻時不能只因總 IV 96% 成為最高優先", () => {
    const evaluated = evaluateIvCandidate(
      recommendation("MASTER_LEAGUE"),
      candidate({ attackIv: 14, defenseIv: 15, staminaIv: 14 }),
    );
    expect(evaluated.totalIvPercentLabel).toBe("96%");
    expect(evaluated.level).toBe("INSUFFICIENT");
    expect(evaluated.labelZhTw).toContain("未達15攻");
  });

  it("6. 高價值暗影攻擊低於13時不會自動傳送", () => {
    expect(
      evaluateIvCandidate(
        recommendation("SHADOW_PVE"),
        candidate({ attackIv: 8, defenseIv: 0, staminaIv: 0 }),
      ),
    ).toMatchObject({
      level: "RECOMMENDED",
      labelZhTw: "暗影：不設硬性最低IV，不得只依IV自動傳送或淨化",
    });
  });

  it("7. 高價值或唯一暗影不因低總IV建議淨化", () => {
    expect(
      evaluateIvCandidate(
        recommendation("SHADOW_PVE"),
        candidate({
          attackIv: 8,
          defenseIv: 0,
          staminaIv: 0,
          isRareOrHighValueShadow: true,
        }),
      ),
    ).toMatchObject({
      level: "RECOMMENDED",
      labelZhTw: "暗影：高價值、稀有或只有一隻時至少保留一隻",
    });
    expect(recommendation("SHADOW_PVE").ivRecommendationZhTw).toContain("淨化不可逆");
  });

  it("16. GL／UL 使用個體 PvP IV Rank，而不是總 IV 或物種排名", () => {
    for (const use of ["GREAT_LEAGUE", "ULTRA_LEAGUE"] as const) {
      const lowGeneralIv = evaluateIvCandidate(
        recommendation(use),
        candidate({ attackIv: 0, defenseIv: 0, staminaIv: 0, pvpIvRank: 50 }),
      );
      const hundoPoorRank = evaluateIvCandidate(recommendation(use), candidate({ pvpIvRank: 201 }));
      expect(lowGeneralIv.level).toBe("PRIORITY");
      expect(hundoPoorRank.level).toBe("INSUFFICIENT");
    }

    const withSpeciesRankOnly = evaluateIvCandidate(recommendation("GREAT_LEAGUE"), {
      ...candidate(),
      speciesRank: 1,
    } as IvCandidate & { speciesRank: number });
    expect(withSpeciesRankOnly.level).toBe("INSUFFICIENT");
  });

  it("17. 低最大 CP 物種可覆寫為 100% 優先", () => {
    const hundoOverride: IvRecommendation = {
      ...recommendation("GENERAL"),
      id: "iv-member-low-cp-general",
      scopeType: "MEMBER",
      scopeKey: "species-low-cp",
      ivStrategyKey: "HUNDO_PREFERRED",
      totalIvPercentMin: 97.8,
      totalIvPercentPriority: 100,
      speciesSpecificOverride: true,
      overrideReasonZhTw: "最大 CP 較低，需要接近滿等與高 IV。",
      shortIvLabelZhTw: "UL：接近100%優先",
    };
    expect(evaluateIvCandidate(hundoOverride, candidate())).toMatchObject({
      level: "TOP_PRIORITY",
      labelZhTw: "100%最優先",
    });
  });

  it("18. 道館不使用固定 96% 門檻", () => {
    const weakIv = evaluateIvCandidate(
      recommendation("GYM_DEFENSE"),
      candidate({ attackIv: 0, defenseIv: 0, staminaIv: 0 }),
    );
    const perfectIv = evaluateIvCandidate(recommendation("GYM_DEFENSE"), candidate());
    expect(weakIv.level).toBe("RECOMMENDED");
    expect(perfectIv.level).toBe("RECOMMENDED");
    expect(weakIv.labelZhTw).toBe("道館：不設固定IV門檻");
  });

  it("19. Max 攻擊手與坦克使用不同 IV 策略", () => {
    const attacker = evaluateIvCandidate(
      recommendation("MAX_ATTACK"),
      candidate({ defenseIv: 0, staminaIv: 0 }),
    );
    const tank = evaluateIvCandidate(recommendation("MAX_TANK"), candidate({ attackIv: 0 }));
    expect(attacker.labelZhTw).toContain("15攻");
    expect(tank.labelZhTw).toContain("防禦／HP");
    expect(tank.level).toBe("PRIORITY");
  });
});

describe("IV 覆寫解析", () => {
  it("20. 依 variant → form → member → family → global 整筆覆寫", () => {
    const global = recommendation("PVE");
    const override = (
      scopeType: IvRecommendation["scopeType"],
      scopeKey: string,
      marker: string,
    ): IvRecommendation => ({
      ...global,
      id: `iv-${scopeType.toLowerCase()}`,
      scopeType,
      scopeKey,
      ivStrategyKey: "CUSTOM",
      shortIvLabelZhTw: marker,
      ivRecommendationZhTw: `${marker}完整條件`,
      speciesSpecificOverride: scopeType !== "GLOBAL",
    });
    const family = override("FAMILY", "family-1", "family");
    const member = override("MEMBER", "species-1", "member");
    const form = override("POKEMON_FORM", "001-kanto", "form");
    const variant = override("BATTLE_VARIANT", "001-kanto-shadow", "variant");
    const all = [...GLOBAL_IV_RECOMMENDATIONS, family, member, form, variant];
    const context = {
      familyKey: "family-1",
      speciesId: "species-1",
      pokemonFormId: "001-kanto",
      battleVariantId: "001-kanto-shadow",
    };

    expect(resolveIvRecommendation(all, context, "PVE")?.shortIvLabelZhTw).toBe("variant");
    expect(
      resolveIvRecommendation(
        all.filter((item) => item !== variant),
        context,
        "PVE",
      )?.shortIvLabelZhTw,
    ).toBe("form");
    expect(
      resolveIvRecommendation(
        all.filter((item) => ![variant, form].includes(item)),
        context,
        "PVE",
      )?.shortIvLabelZhTw,
    ).toBe("member");
    expect(
      resolveIvRecommendation(
        all.filter((item) => ![variant, form, member].includes(item)),
        context,
        "PVE",
      )?.shortIvLabelZhTw,
    ).toBe("family");
    expect(
      resolveIvRecommendation(GLOBAL_IV_RECOMMENDATIONS, context, "PVE")?.shortIvLabelZhTw,
    ).toBe("PvE：91%+可投入；96%+／15攻優先");
  });
});
