import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence644649, maxEvidence644649 } from "@/data/candidates/gen5-max-644-649";
import { candidatePveEvidence644649, pveEvidence644649 } from "@/data/candidates/gen5-pve-644-649";
import { candidateReleaseEvidence644649 } from "@/data/candidates/gen5-release-644-649";

describe("Gen5 #644-#649 exact-variant PvE / Max evidence", () => {
  it("keeps production scope unchanged", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
  });

  it("locks positive raid value for each exact form", () => {
    expect(candidatePveEvidence644649("644-unova-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence644649("645-therian-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence644649("646-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence644649("646-black-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence644649("646-white-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence644649("647-resolute-normal")?.level).toBe("CORE_INVESTMENT");
    for (const drive of ["shock", "burn", "chill", "douse"]) {
      expect(candidatePveEvidence644649(`649-${drive}-normal`)?.level, drive).toBe(
        "USABLE_OR_BUDGET",
      );
    }

    expect(candidatePveEvidence644649("644-unova-normal")?.summaryZhTw).toContain("Fusion Bolt");
    expect(candidatePveEvidence644649("645-therian-normal")?.summaryZhTw).toContain("Sandsear Storm");
    expect(candidatePveEvidence644649("646-unova-normal")?.summaryZhTw).toContain("Glaciate");
    expect(candidatePveEvidence644649("646-black-normal")?.summaryZhTw).toContain("Freeze Shock");
    expect(candidatePveEvidence644649("646-white-normal")?.summaryZhTw).toContain("Ice Burn");
    expect(candidatePveEvidence644649("647-resolute-normal")?.summaryZhTw).toContain("Secret Sword");
    expect(candidatePveEvidence644649("649-shock-normal")?.summaryZhTw).toContain("Techno Blast");
  });

  it("requires every positive raid variant to have a released matching version", () => {
    for (const variantId of Object.keys(pveEvidence644649)) {
      const match = variantId.match(/^(\d{3}-.+)-(normal|shadow)$/);
      expect(match, variantId).not.toBeNull();
      const [, formId, variant] = match!;
      expect(
        candidateReleaseEvidence644649(formId, variant === "shadow" ? "SHADOW" : "NORMAL").status,
        variantId,
      ).toBe("RELEASED");
    }
  });

  it("keeps Incarnate and Therian Landorus value isolated", () => {
    expect(candidateReleaseEvidence644649("645-incarnate", "SHADOW").status).toBe("RELEASED");
    expect(candidateReleaseEvidence644649("645-therian", "SHADOW").status).toBe("UNKNOWN");
    expect(candidatePveEvidence644649("645-incarnate-shadow")).toBeNull();
    expect(candidatePveEvidence644649("645-incarnate-normal")).toBeNull();
    expect(candidatePveEvidence644649("645-therian-normal")?.level).toBe("CORE_INVESTMENT");
  });

  it("keeps ordinary and fusion Kyurem identities independent", () => {
    expect(candidatePveEvidence644649("646-unova-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence644649("646-black-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence644649("646-white-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence644649("646-black-shadow")).toBeNull();
    expect(candidatePveEvidence644649("646-white-shadow")).toBeNull();
  });

  it("keeps Keldeo form-change value isolated", () => {
    expect(candidateReleaseEvidence644649("647-ordinary", "NORMAL").status).toBe("RELEASED");
    expect(candidateReleaseEvidence644649("647-resolute", "NORMAL").status).toBe("RELEASED");
    expect(candidatePveEvidence644649("647-ordinary-normal")).toBeNull();
    expect(candidatePveEvidence644649("647-resolute-normal")?.level).toBe("CORE_INVESTMENT");
  });

  it("does not leak drive evidence to no-drive Genesect or unreleased Meloetta", () => {
    expect(candidatePveEvidence644649("649-unova-normal")).toBeNull();
    for (const drive of ["shock", "burn", "chill", "douse"]) {
      expect(candidateReleaseEvidence644649(`649-${drive}`, "NORMAL").status, drive).toBe("RELEASED");
      expect(candidatePveEvidence644649(`649-${drive}-normal`)?.level, drive).toBe(
        "USABLE_OR_BUDGET",
      );
    }

    expect(candidateReleaseEvidence644649("648-aria", "NORMAL").status).toBe("RELEASED");
    expect(candidatePveEvidence644649("648-aria-normal")).toBeNull();
    expect(candidateReleaseEvidence644649("648-pirouette", "NORMAL").status).toBe("UNRELEASED");
    expect(candidatePveEvidence644649("648-pirouette-normal")).toBeNull();
  });

  it("keeps Max investment empty because this slice has no confirmed Max release", () => {
    expect(Object.keys(maxEvidence644649)).toEqual([]);
    for (const formId of [
      "644-unova",
      "645-therian",
      "646-black",
      "647-resolute",
      "649-shock",
    ]) {
      expect(candidateReleaseEvidence644649(formId, "DYNAMAX").status, formId).toBe("UNKNOWN");
      expect(candidateReleaseEvidence644649(formId, "GIGANTAMAX").status, formId).toBe("UNKNOWN");
      expect(candidateMaxEvidence644649(`${formId}-dynamax`), formId).toBeNull();
      expect(candidateMaxEvidence644649(`${formId}-gigantamax`), formId).toBeNull();
    }
  });

  it("links every positive classification to dated exact-version provenance", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pve-644-649.json", "utf8"),
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
    for (const [variantId, evidence] of Object.entries(pveEvidence644649)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-05");
    }

    expect(manifest.boundary).toContain("exact-variant scoped");
    expect(manifest.boundary).toContain("Incarnate and Therian Landorus");
    expect(manifest.boundary).toContain("Ordinary and Resolute Keldeo");
    expect(manifest.boundary).toContain("Genesect drive identities");
    expect(manifest.boundary).toContain("positive Max investment set is intentionally empty");
    expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(
      true,
    );
  });
});
