import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence554583, maxEvidence554583 } from "@/data/candidates/gen5-max-554-583";
import { candidatePveEvidence554583, pveEvidence554583 } from "@/data/candidates/gen5-pve-554-583";
import { candidateReleaseEvidence554583 } from "@/data/candidates/gen5-release-554-583";

describe("Gen5 #554-#583 exact-variant PvE / Max evidence", () => {
  it("keeps production scope unchanged", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
  });

  it("keeps Darmanitan forms and versions independent", () => {
    expect(candidatePveEvidence554583("555-unova-standard-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence554583("555-unova-standard-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence554583("555-galar-standard-normal")?.level).toBe("USABLE_OR_BUDGET");

    expect(candidateReleaseEvidence554583("555-unova-zen", "NORMAL").status).toBe("UNRELEASED");
    expect(candidateReleaseEvidence554583("555-galar-zen", "NORMAL").status).toBe("UNRELEASED");
    expect(candidatePveEvidence554583("555-unova-zen-normal")).toBeNull();
    expect(candidatePveEvidence554583("555-galar-zen-normal")).toBeNull();

    expect(candidateReleaseEvidence554583("555-galar-standard", "SHADOW").status).toBe("UNKNOWN");
    expect(candidatePveEvidence554583("555-galar-standard-shadow")).toBeNull();
  });

  it("requires every positive raid variant to have a released matching version", () => {
    for (const variantId of Object.keys(pveEvidence554583)) {
      const match = variantId.match(/^(\d{3}-.+)-(normal|shadow)$/);
      expect(match, variantId).not.toBeNull();
      const [, formId, variant] = match!;
      expect(
        candidateReleaseEvidence554583(formId, variant === "shadow" ? "SHADOW" : "NORMAL").status,
        variantId,
      ).toBe("RELEASED");
    }
  });

  it("keeps Dynamax release separate from Max investment value", () => {
    for (const formId of ["554-unova", "555-unova-standard", "568-unova", "569-unova"]) {
      expect(candidateReleaseEvidence554583(formId, "DYNAMAX").status, formId).toBe("RELEASED");
    }

    expect(candidateMaxEvidence554583("554-unova-dynamax")).toBeNull();
    expect(candidateMaxEvidence554583("555-unova-standard-dynamax")?.level).toBe(
      "USABLE_OR_BUDGET",
    );
    expect(candidateMaxEvidence554583("568-unova-dynamax")).toBeNull();
    expect(candidateMaxEvidence554583("569-unova-dynamax")).toBeNull();
  });

  it("keeps Gigantamax Garbodor value exact and independent from Dynamax", () => {
    expect(candidateReleaseEvidence554583("569-unova", "GIGANTAMAX").status).toBe("RELEASED");
    expect(candidateMaxEvidence554583("569-unova-gigantamax")?.level).toBe("CORE_INVESTMENT");
    expect(candidateMaxEvidence554583("569-unova-gigantamax")?.roles).toContain(
      "Poison Max attacker S tier #1",
    );
    expect(candidateMaxEvidence554583("569-unova-dynamax")).toBeNull();
    expect(candidatePveEvidence554583("569-unova-normal")).toBeNull();
  });

  it("does not let unreleased Mega Scrafty receive investment evidence", () => {
    expect(candidateReleaseEvidence554583("560-unova", "MEGA").status).toBe("UNRELEASED");
    expect(candidatePveEvidence554583("560-unova-mega")).toBeNull();
  });

  it("links every positive classification to dated exact-version provenance", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pve-554-583.json", "utf8"),
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
    for (const [variantId, evidence] of Object.entries({ ...pveEvidence554583, ...maxEvidence554583 })) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-04");
    }

    expect(manifest.boundary).toContain("exact-variant scoped");
    expect(manifest.boundary).toContain("Zen Mode");
    expect(manifest.boundary).toContain("Gigantamax Garbodor value does not propagate");
    expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(
      true,
    );
  });
});
