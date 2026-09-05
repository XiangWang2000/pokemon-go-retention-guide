import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence494523, maxEvidence494523 } from "@/data/candidates/gen5-max-494-523";
import { candidatePveEvidence494523, pveEvidence494523 } from "@/data/candidates/gen5-pve-494-523";
import { candidateReleaseEvidence494523 } from "@/data/candidates/gen5-release-494-523";

describe("Gen5 #494-#523 exact-variant PvE / Max evidence", () => {
  it("keeps production scope unchanged", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
  });

  it("locks representative normal and Shadow PvE classifications independently", () => {
    expect(candidatePveEvidence494523("494-unova-normal")?.level).toBe("SPECIAL_USE");
    expect(candidatePveEvidence494523("497-unova-shadow")?.level).toBe("SPECIAL_USE");
    expect(candidatePveEvidence494523("500-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence494523("503-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence494523("503-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence494523("521-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence494523("521-unova-shadow")?.level).toBe("USABLE_OR_BUDGET");

    expect(candidatePveEvidence494523("500-unova-normal")).toBeNull();
    expect(candidatePveEvidence494523("497-unova-normal")).toBeNull();
    expect(candidatePveEvidence494523("503-unova-normal")?.summaryZhTw).toContain("水炮加農");
    expect(candidatePveEvidence494523("503-unova-shadow")?.summaryZhTw).toContain("水炮加農");
    expect(candidatePveEvidence494523("500-unova-shadow")?.summaryZhTw).toContain("爆炸烈焰");
  });

  it("requires every positive PvE variant to have a released matching version", () => {
    for (const variantId of Object.keys(pveEvidence494523)) {
      const match = variantId.match(/^(\d{3}-[^-]+)-(normal|shadow)$/);
      expect(match, variantId).not.toBeNull();
      const [, formId, variant] = match!;
      expect(
        candidateReleaseEvidence494523(formId, variant === "shadow" ? "SHADOW" : "NORMAL").status,
        variantId,
      ).toBe("RELEASED");
    }
  });

  it("keeps Max release separate from Max investment value", () => {
    for (const formId of ["519-unova", "520-unova", "521-unova"]) {
      expect(candidateReleaseEvidence494523(formId, "DYNAMAX").status, formId).toBe("RELEASED");
    }

    expect(candidateMaxEvidence494523("519-unova-dynamax")).toBeNull();
    expect(candidateMaxEvidence494523("520-unova-dynamax")).toBeNull();
    expect(candidateMaxEvidence494523("521-unova-dynamax")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidateMaxEvidence494523("521-unova-dynamax")?.roles).toContain(
      "Flying Max attacker B tier #2",
    );
  });

  it("does not let unreleased Mega Emboar inherit Shadow Emboar value", () => {
    expect(candidateReleaseEvidence494523("500-unova", "MEGA").status).toBe("UNRELEASED");
    expect(candidatePveEvidence494523("500-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence494523("500-unova-mega")).toBeNull();
  });

  it("links every positive classification to dated exact-version provenance", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pve-494-523.json", "utf8"),
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

    for (const [variantId, evidence] of Object.entries({ ...pveEvidence494523, ...maxEvidence494523 })) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-04");
    }

    expect(manifest.boundary).toContain("exact-variant scoped");
    expect(manifest.boundary).toContain("released Dynamax form does not automatically receive");
    expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(
      true,
    );
  });
});
