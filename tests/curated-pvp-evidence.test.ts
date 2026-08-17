import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CURATED_PVP_EVIDENCE,
  curatedPvpIvStrategyZhTw,
  getIndependentCuratedPvpEvidence,
  hasCurrentPvpUse,
  validateCuratedPvpEvidence,
} from "@/data/curated-pvp-evidence";
import { readIntegerFlag } from "@/lib/command-line";

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
      {
        previousDecision: "KEEP",
        previousRuleTrace: { matched: true, ruleKey: "CONDITIONAL_USE" },
      },
      {
        previousDecision: "CONDITIONAL_KEEP",
        previousRuleTrace: { matched: true, ruleKey: "CONDITIONAL_USE" },
      },
      {
        previousDecision: "TRANSFER_CANDIDATE",
        previousRuleTrace: { matched: false, ruleKey: "LOW_GENERAL_VALUE" },
      },
    ];

    expect(priorStates.map((prior) => hasCurrentPvpUse({ ...currentEvidence, ...prior }))).toEqual([
      false,
      false,
      false,
      false,
    ]);
    expect(
      priorStates.map((prior) => hasCurrentPvpUse({ ...currentEvidence, ranks: [100], ...prior })),
    ).toEqual([true, true, true, true]);
  });

  it("keeps generated decision output out of current PvP assessment helpers", () => {
    const source = readFileSync(
      new URL("../scripts/recompute-001-311.ts", import.meta.url),
      "utf8",
    );
    const start = source.indexOf("function curatedPvpEvidenceFor");
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

    const ivStart = source.indexOf("function ivStrategy");
    const ivEnd = source.indexOf("function isPrimalFormId");
    expect(ivStart).toBeGreaterThanOrEqual(0);
    expect(ivEnd).toBeGreaterThan(ivStart);
    expect(source.slice(ivStart, ivEnd)).toContain("curatedPvpIvStrategyZhTw(curatedPvpEvidence)");
    expect(source.slice(ivStart, ivEnd)).not.toMatch(/Great League|防禦形態|其他 Forme/);
  });

  it("uses curated league/cup and reason for the IV strategy", () => {
    const evidence = {
      formId: "386-defense",
      variantKey: "NORMAL",
      leagueOrCup: "Ultra League",
      source: "test fixture",
      checkedAt: "2026-08-10",
      reason: "僅適用這個型態的當期特殊盃",
    } as const;

    expect(getIndependentCuratedPvpEvidence(evidence, [evidence])).toEqual([evidence]);
    expect(curatedPvpIvStrategyZhTw(evidence)).toBe(
      "依「Ultra League」PvP 用途與個體 Rank 篩選；僅適用這個型態的當期特殊盃。",
    );
    expect(curatedPvpIvStrategyZhTw(evidence)).not.toContain("Great League");
    expect(curatedPvpIvStrategyZhTw(evidence)).not.toContain("防禦形態");
  });

  it("reads --max safely and falls back only when the flag is absent", () => {
    expect(readIntegerFlag([], "--max", 386)).toBe(386);
    expect(readIntegerFlag(["--max", "311"], "--max", 386)).toBe(311);
    expect(() => readIntegerFlag(["--max"], "--max", 386)).toThrow("Missing value");
    expect(() => readIntegerFlag(["--max", "not-a-number"], "--max", 386)).toThrow(
      "Invalid integer",
    );
  });

  it("uses the requested scope in the generated recalibration report", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    const source = readFileSync(
      new URL("../scripts/recompute-001-311.ts", import.meta.url),
      "utf8",
    );
    const report = readFileSync(
      new URL("../review/001-386-recalibration.md", import.meta.url),
      "utf8",
    );

    expect(packageJson.scripts["data:recompute"]).toBe("tsx scripts/recompute-001-311.ts");
    expect(source).not.toContain('process.argv.indexOf("--max")');
    expect(source).not.toContain("#001～#211 共用規則重算報告");
    expect(report.split(/\r?\n/, 1)[0]).toBe(
      "# Pokémon GO Retention Guide #001～#386 共用規則重算報告",
    );
  });
});
