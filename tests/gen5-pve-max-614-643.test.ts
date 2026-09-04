import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence614643, maxEvidence614643 } from "@/data/candidates/gen5-max-614-643";
import { candidatePveEvidence614643, pveEvidence614643 } from "@/data/candidates/gen5-pve-614-643";
import { candidateReleaseEvidence614643 } from "@/data/candidates/gen5-release-614-643";

describe("Gen5 #614-#643 exact-variant PvE / Max evidence", () => {
  it("keeps production scope unchanged", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
  });

  it("locks positive raid value without cross-version leakage", () => {
    expect(candidatePveEvidence614643("623-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence614643("623-unova-shadow")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence614643("635-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence614643("635-unova-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence614643("637-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence614643("639-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence614643("641-therian-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence614643("642-therian-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence614643("643-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence614643("643-unova-shadow")?.level).toBe("CORE_INVESTMENT");

    expect(candidatePveEvidence614643("635-unova-normal")?.summaryZhTw).toContain("Brutal Swing");
    expect(candidatePveEvidence614643("635-unova-shadow")?.summaryZhTw).toContain("Brutal Swing");
    expect(candidatePveEvidence614643("639-unova-normal")?.summaryZhTw).toContain("Sacred Sword");
    expect(candidatePveEvidence614643("641-therian-normal")?.summaryZhTw).toContain("Bleakwind Storm");
    expect(candidatePveEvidence614643("642-therian-normal")?.summaryZhTw).toContain("Wildbolt Storm");
    expect(candidatePveEvidence614643("643-unova-normal")?.summaryZhTw).toContain("Fusion Flare");
    expect(candidatePveEvidence614643("643-unova-shadow")?.summaryZhTw).toContain("Fusion Flare");
  });

  it("requires every positive raid variant to have a released matching version", () => {
    for (const variantId of Object.keys(pveEvidence614643)) {
      const match = variantId.match(/^(\d{3}-.+)-(normal|shadow)$/);
      expect(match, variantId).not.toBeNull();
      const [, formId, variant] = match!;
      expect(
        candidateReleaseEvidence614643(formId, variant === "shadow" ? "SHADOW" : "NORMAL").status,
        variantId,
      ).toBe("RELEASED");
    }
  });

  it("keeps Incarnate and Therian Forces of Nature value isolated", () => {
    expect(candidateReleaseEvidence614643("641-incarnate", "SHADOW").status).toBe("RELEASED");
    expect(candidateReleaseEvidence614643("641-therian", "SHADOW").status).toBe("UNKNOWN");
    expect(candidatePveEvidence614643("641-incarnate-shadow")).toBeNull();
    expect(candidatePveEvidence614643("641-therian-normal")?.level).toBe("USABLE_OR_BUDGET");

    expect(candidateReleaseEvidence614643("642-incarnate", "SHADOW").status).toBe("RELEASED");
    expect(candidateReleaseEvidence614643("642-therian", "SHADOW").status).toBe("UNKNOWN");
    expect(candidatePveEvidence614643("642-incarnate-shadow")).toBeNull();
    expect(candidatePveEvidence614643("642-therian-normal")?.level).toBe("CORE_INVESTMENT");
  });

  it("does not let unreleased Mega Golurk borrow normal or Shadow value", () => {
    expect(candidateReleaseEvidence614643("623-unova", "MEGA").status).toBe("UNRELEASED");
    expect(candidatePveEvidence614643("623-unova-mega")).toBeNull();
    expect(candidatePveEvidence614643("623-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence614643("623-unova-shadow")?.level).toBe("USABLE_OR_BUDGET");
  });

  it("assigns Max value only where current evidence supports investment", () => {
    expect(candidateReleaseEvidence614643("635-unova", "DYNAMAX").status).toBe("RELEASED");
    expect(candidateMaxEvidence614643("635-unova-dynamax")?.level).toBe("USABLE_OR_BUDGET");

    for (const formId of ["615-unova", "633-unova", "634-unova"]) {
      expect(candidateReleaseEvidence614643(formId, "DYNAMAX").status, formId).toBe("RELEASED");
      expect(candidateMaxEvidence614643(`${formId}-dynamax`), formId).toBeNull();
    }

    expect(Object.keys(maxEvidence614643)).toEqual(["635-unova-dynamax"]);
  });

  it("links every positive classification to dated exact-version provenance", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pve-614-643.json", "utf8"),
    ) as {
      checkedAt: string;
      status: string;
      sources: Array<{ sourceUrl: string; supports: string[]; sourceSummaryZhTw: string }>;
      boundary: string;
    };

    expect(manifest.checkedAt).toBe("2026-09-05");
    expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVE_MAX");
    const supported = new Set(manifest.sources.flatMap((source) => source.supports));
    const urls = new Set(manifest.sources.map((source) => source.sourceUrl));

    for (const [variantId, evidence] of Object.entries(pveEvidence614643)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-05");
    }
    for (const [variantId, evidence] of Object.entries(maxEvidence614643)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-05");
    }

    expect(manifest.boundary).toContain("exact-variant scoped");
    expect(manifest.boundary).toContain("Incarnate and Therian");
    expect(manifest.boundary).toContain("Mega Golurk");
    expect(manifest.boundary).toContain("Dynamax Cryogonal");
    expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(
      true,
    );
  });
});
