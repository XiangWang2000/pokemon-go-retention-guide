import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence584613, maxEvidence584613 } from "@/data/candidates/gen5-max-584-613";
import { candidatePveEvidence584613, pveEvidence584613 } from "@/data/candidates/gen5-pve-584-613";
import { candidateReleaseEvidence584613 } from "@/data/candidates/gen5-release-584-613";

describe("Gen5 #584-#613 exact-variant PvE / Max evidence", () => {
  it("keeps production scope unchanged", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
  });

  it("locks positive raid value without cross-version leakage", () => {
    expect(candidatePveEvidence584613("589-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence584613("589-unova-shadow")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence584613("609-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence584613("609-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence584613("612-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence584613("612-unova-shadow")?.level).toBe("CORE_INVESTMENT");

    expect(candidatePveEvidence584613("612-unova-normal")?.summaryZhTw).toContain("廣域破壞");
    expect(candidatePveEvidence584613("612-unova-shadow")?.summaryZhTw).toContain("廣域破壞");
  });

  it("requires every positive raid variant to have a released matching version", () => {
    for (const variantId of Object.keys(pveEvidence584613)) {
      const match = variantId.match(/^(\d{3}-.+)-(normal|shadow)$/);
      expect(match, variantId).not.toBeNull();
      const [, formId, variant] = match!;
      expect(
        candidateReleaseEvidence584613(formId, variant === "shadow" ? "SHADOW" : "NORMAL").status,
        variantId,
      ).toBe("RELEASED");
    }
  });

  it("keeps Max investment empty because this slice has no confirmed Max release", () => {
    expect(Object.keys(maxEvidence584613)).toEqual([]);
    for (const formId of ["589-unova", "609-unova", "612-unova"]) {
      expect(candidateReleaseEvidence584613(formId, "DYNAMAX").status, formId).toBe("UNKNOWN");
      expect(candidateReleaseEvidence584613(formId, "GIGANTAMAX").status, formId).toBe("UNKNOWN");
      expect(candidateMaxEvidence584613(`${formId}-dynamax`)).toBeNull();
      expect(candidateMaxEvidence584613(`${formId}-gigantamax`)).toBeNull();
    }
  });

  it("does not let unreleased Mega Chandelure or Eelektross borrow normal/Shadow value", () => {
    for (const formId of ["604-unova", "609-unova"]) {
      expect(candidateReleaseEvidence584613(formId, "MEGA").status, formId).toBe("UNRELEASED");
      expect(candidatePveEvidence584613(`${formId}-mega`), formId).toBeNull();
    }
    expect(candidatePveEvidence584613("609-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence584613("609-unova-shadow")?.level).toBe("CORE_INVESTMENT");
  });

  it("links every positive classification to dated exact-version provenance", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pve-584-613.json", "utf8"),
    ) as {
      checkedAt: string;
      status: string;
      sources: Array<{ sourceUrl: string; supports: string[]; sourceSummaryZhTw: string }>;
      boundary: string;
    };

    expect(manifest.checkedAt).toBe("2026-09-04");
    expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVE_MAX");
    const supported = new Set(manifest.sources.flatMap((source) => source.supports));
    const urls = new Set(manifest.sources.map((source) => source.sourceUrl));
    for (const [variantId, evidence] of Object.entries(pveEvidence584613)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-04");
    }

    expect(manifest.boundary).toContain("exact-variant scoped");
    expect(manifest.boundary).toContain("Mega Chandelure");
    expect(manifest.boundary).toContain("positive Max investment set is intentionally empty");
    expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(
      true,
    );
  });
});
