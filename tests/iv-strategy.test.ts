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
  it("9. 一般 PvE 的 15攻／96%以上標示為優先", () => {
    expect(
      evaluateIvCandidate(recommendation("PVE"), candidate({ defenseIv: 14, staminaIv: 14 })),
    ).toMatchObject({ level: "PRIORITY", labelZhTw: "PvE：15攻／96%以上優先" });
  });

  it("10. 一般 PvE 的 15攻／91%以上標示為條件式", () => {
    expect(
      evaluateIvCandidate(recommendation("PVE"), candidate({ defenseIv: 13, staminaIv: 13 })),
    ).toMatchObject({ level: "CONDITIONAL", labelZhTw: "PvE：15攻／91%以上可留" });
  });

  it("11. 低 PvE 價值物種不因 100% 自動取得保留理由", () => {
    expect(
      evaluateIvCandidate(recommendation("PVE"), candidate({ hasRelevantUse: false })),
    ).toMatchObject({ level: "NOT_APPLICABLE" });
  });

  it("12. Mega 使用 15攻／96%以上預設", () => {
    expect(
      evaluateIvCandidate(recommendation("MEGA"), candidate({ defenseIv: 14, staminaIv: 14 })),
    ).toMatchObject({ level: "PRIORITY", labelZhTw: "Mega：15攻／96%以上優先" });
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

  it("14. 高價值暗影攻擊 13 以上可標示為建議保留", () => {
    expect(
      evaluateIvCandidate(
        recommendation("SHADOW_PVE"),
        candidate({ attackIv: 13, defenseIv: 0, staminaIv: 0 }),
      ),
    ).toMatchObject({ level: "RECOMMENDED", labelZhTw: "暗影：攻擊13以上建議保留" });
  });

  it("15. 高價值或稀有暗影不因總 IV 低而自動傳送", () => {
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
    ).toMatchObject({ level: "CONDITIONAL" });
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
    ).toBe("PvE：15攻／96%+");
  });
});
