import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

const hasCanonicalDb = existsSync(resolve("rebuild-ci.db"));

describe("Prisma SQLite 資料模型", () => {
  it.skipIf(!hasCanonicalDb)("同編號多型態可同時存在且不互相覆蓋", async () => {
    const forms = await prisma.pokemonForm.findMany({ where: { species: { dexNumber: 19 } } });
    expect(forms.map((item) => item.id).sort()).toEqual(["019-alola", "019-kanto"]);
  });

  it.skipIf(!hasCanonicalDb)("Mega X 與 Y 可分開", async () => {
    const variants = await prisma.battleVariant.findMany({
      where: { pokemonFormId: "006-kanto", variantKey: { in: ["MEGA_X", "MEGA_Y"] } },
    });
    expect(variants).toHaveLength(2);
  });

  it.skipIf(!hasCanonicalDb)("Dynamax 與普通版可分開", async () => {
    const variants = await prisma.battleVariant.findMany({
      where: { pokemonFormId: "001-kanto", variantKey: { in: ["NORMAL", "DYNAMAX"] } },
    });
    expect(new Set(variants.map((item) => item.variantKey))).toEqual(
      new Set(["NORMAL", "DYNAMAX"]),
    );
  });

  it("同一招式可透過多筆 VariantMove 對應多個型態", () => {
    const schema = readFileSync(resolve("prisma", "schema.prisma"), "utf8");
    const moveModel = schema.match(/model Move \{[\s\S]*?\n\}/)?.[0] ?? "";
    const joinModel = schema.match(/model VariantMove \{[\s\S]*?\n\}/)?.[0] ?? "";

    expect(moveModel).toMatch(/variantMoves\s+VariantMove\[\]/);
    expect(joinModel).toMatch(/battleVariantId\s+String/);
    expect(joinModel).toMatch(/moveId\s+String/);
    expect(joinModel).toMatch(/@@unique\(\[battleVariantId,\s*moveId,\s*availabilityType\]\)/);
  });

  it("評估依據可區分來源核對、人工整理、繼承與無資料", () => {
    const schema = readFileSync(resolve("prisma", "schema.prisma"), "utf8");
    expect(schema).toMatch(
      /enum EvaluationProvenance \{[\s\S]*SOURCE_VERIFIED[\s\S]*MANUAL_CURATED[\s\S]*INHERITED[\s\S]*DATA_UNAVAILABLE[\s\S]*\}/,
    );
    expect(schema.match(/provenance\s+EvaluationProvenance/g)).toHaveLength(2);
  });

  it("finalDecision 使用 HOLD_FOR_NOW 且不再包含 NEEDS_REVIEW", () => {
    const schema = readFileSync(resolve("prisma", "schema.prisma"), "utf8");
    const decisionEnum = schema.match(/enum RetentionDecision \{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(decisionEnum).toContain("HOLD_FOR_NOW");
    expect(decisionEnum).not.toContain("NEEDS_REVIEW");
    expect(schema).toMatch(/finalDecision\s+RetentionDecision\s+@map\("decision"\)/);
    expect(schema).toMatch(/reviewStatus\s+EvaluationReviewStatus/);
    expect(schema).toMatch(/missingDataSummaryZhTw\s+String/);
  });

  it("資料待補項目保存影響性、暫定建議與研究行動", () => {
    const schema = readFileSync(resolve("prisma", "schema.prisma"), "utf8");
    const issueModel = schema.match(/model DataIssue \{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(issueModel).toMatch(/affectsFinalDecision\s+Boolean/);
    expect(issueModel).toMatch(/provisionalDecision\s+RetentionDecision/);
    expect(issueModel).toMatch(/suggestedResearchActionZhTw\s+String/);
    expect(issueModel).toMatch(/lastResearchedAt\s+DateTime\?/);
  });
  it.skipIf(!hasCanonicalDb)("IV 建議使用結構化策略、用途與覆寫層級", async () => {
    const schema = readFileSync(resolve("prisma", "schema.prisma"), "utf8");
    const ivModel = schema.match(/model IvRecommendation \{[\s\S]*?\n\}/)?.[0] ?? "";

    expect(schema).toMatch(/enum IvRecommendationScope \{[\s\S]*GLOBAL[\s\S]*BATTLE_VARIANT/);
    expect(schema).toMatch(/enum IvStrategyKey \{[\s\S]*PVE_ATTACKER[\s\S]*MAX_TANK/);
    expect(ivModel).toMatch(/attackIvPriority\s+Int\?/);
    expect(ivModel).toMatch(/totalIvPercentPriority\s+Float\?/);
    expect(ivModel).toMatch(/pvpRankMax\s+Int\?/);
    expect(ivModel).toMatch(/shortIvLabelZhTw\s+String/);
    expect(ivModel).toMatch(/@@unique\(\[scopeType, scopeKey, primaryUseKey\]\)/);

    const globalRules = await prisma.ivRecommendation.findMany({
      where: { scopeType: "GLOBAL", scopeKey: "GLOBAL" },
    });
    expect(globalRules.length).toBeGreaterThanOrEqual(11);
  });
});

afterAll(async () => prisma.$disconnect());
