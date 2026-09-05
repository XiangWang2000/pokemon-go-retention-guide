import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence524553, maxEvidence524553 } from "@/data/candidates/gen5-max-524-553";
import { candidatePveEvidence524553, pveEvidence524553 } from "@/data/candidates/gen5-pve-524-553";
import { candidateReleaseEvidence524553 } from "@/data/candidates/gen5-release-524-553";

describe("Gen5 #524-#553 exact-variant PvE / Max evidence", () => {
  it("keeps production scope unchanged", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
  });

  it("locks normal and Shadow raid value without cross-version leakage", () => {
    expect(candidatePveEvidence524553("526-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence524553("526-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence524553("530-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence524553("530-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence524553("534-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence524553("534-unova-shadow")?.level).toBe("CORE_INVESTMENT");

    expect(candidatePveEvidence524553("526-unova-normal")?.summaryZhTw).toContain("流星光束");
    expect(candidatePveEvidence524553("526-unova-shadow")?.summaryZhTw).toContain("流星光束");
  });

  it("requires every positive raid variant to have a released matching version", () => {
    for (const variantId of Object.keys(pveEvidence524553)) {
      const match = variantId.match(/^(\d{3}-[^-]+)-(normal|shadow)$/);
      expect(match, variantId).not.toBeNull();
      const [, formId, variant] = match!;
      expect(
        candidateReleaseEvidence524553(formId, variant === "shadow" ? "SHADOW" : "NORMAL").status,
        variantId,
      ).toBe("RELEASED");
    }
  });

  it("keeps Dynamax release separate from Max investment value", () => {
    for (const formId of [
      "524-unova",
      "525-unova",
      "526-unova",
      "527-unova",
      "528-unova",
      "529-unova",
      "530-unova",
    ]) {
      expect(candidateReleaseEvidence524553(formId, "DYNAMAX").status, formId).toBe("RELEASED");
    }

    for (const formId of ["524-unova", "525-unova", "527-unova", "528-unova", "529-unova"]) {
      expect(candidateMaxEvidence524553(`${formId}-dynamax`), formId).toBeNull();
    }
    expect(candidateMaxEvidence524553("526-unova-dynamax")?.level).toBe("CORE_INVESTMENT");
    expect(candidateMaxEvidence524553("530-unova-dynamax")?.level).toBe("CORE_INVESTMENT");
  });

  it("never turns simulated or released Mega presence into unsupported investment value", () => {
    expect(candidateReleaseEvidence524553("530-unova", "MEGA").status).toBe("UNRELEASED");
    expect(candidatePveEvidence524553("530-unova-mega")).toBeNull();

    expect(candidateReleaseEvidence524553("531-unova", "MEGA").status).toBe("RELEASED");
    expect(candidatePveEvidence524553("531-unova-mega")).toBeNull();
  });

  it("links every positive classification to dated exact-version provenance", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pve-524-553.json", "utf8"),
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
    for (const [variantId, evidence] of Object.entries({ ...pveEvidence524553, ...maxEvidence524553 })) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-04");
    }

    expect(manifest.boundary).toContain("exact-variant scoped");
    expect(manifest.boundary).toContain("Mega Excadrill");
    expect(manifest.boundary).toContain("do not automatically receive positive Max investment");
    expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(
      true,
    );
  });
});
