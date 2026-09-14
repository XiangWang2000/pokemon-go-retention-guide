import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { candidateMaxEvidence650679, maxEvidence650679 } from "@/data/candidates/gen6-max-650-679";
import { candidateMaxEvidence680709, maxEvidence680709 } from "@/data/candidates/gen6-max-680-709";
import { candidateMaxEvidence710721, maxEvidence710721 } from "@/data/candidates/gen6-max-710-721";
import { candidatePveEvidence650679, pveEvidence650679 } from "@/data/candidates/gen6-pve-650-679";
import { candidatePveEvidence680709, pveEvidence680709 } from "@/data/candidates/gen6-pve-680-709";
import { candidatePveEvidence710721, pveEvidence710721 } from "@/data/candidates/gen6-pve-710-721";
import { candidateReleaseEvidence650679 } from "@/data/candidates/gen6-release-650-679";
import { candidateReleaseEvidence680709 } from "@/data/candidates/gen6-release-680-709";
import { candidateReleaseEvidence710721 } from "@/data/candidates/gen6-release-710-721";
import type { CandidateReleaseVariantKey } from "@/data/candidates/gen5-release-494-523";

const allPveEvidence = {
  ...pveEvidence650679,
  ...pveEvidence680709,
  ...pveEvidence710721,
};
const allMaxEvidence = {
  ...maxEvidence650679,
  ...maxEvidence680709,
  ...maxEvidence710721,
};

function releaseStatusForVariant(variantId: string) {
  const match = variantId.match(/^(\d{3}-.+)-(normal|shadow|mega|dynamax|gigantamax)$/);
  if (!match) throw new Error(`Unexpected Gen6 variant id: ${variantId}`);
  const formId = match[1];
  const dex = Number(formId.slice(0, 3));
  const variantKey = match[2].toUpperCase() as CandidateReleaseVariantKey;
  if (dex <= 679) return candidateReleaseEvidence650679(formId, variantKey).status;
  if (dex <= 709) return candidateReleaseEvidence680709(formId, variantKey).status;
  return candidateReleaseEvidence710721(formId, variantKey).status;
}

describe("Gen6 #650-#721 exact-variant PvE / Max evidence", () => {
  it("keeps production scope at published Gen5 while Gen6 is still candidate evidence", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
  });

  it("classifies starter normal, Shadow and Mega raid value independently", () => {
    expect(candidatePveEvidence650679("652-kalos-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence650679("652-kalos-shadow")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence650679("652-kalos-mega")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence650679("655-kalos-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence650679("655-kalos-shadow")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence650679("655-kalos-mega")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence650679("658-kalos-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence650679("658-kalos-shadow")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence650679("658-kalos-mega")?.level).toBe("CORE_INVESTMENT");

    expect(candidatePveEvidence650679("652-kalos-normal")?.summaryZhTw).toContain("Frenzy Plant");
    expect(candidatePveEvidence650679("655-kalos-normal")?.summaryZhTw).toContain("Blast Burn");
    expect(candidatePveEvidence650679("658-kalos-normal")?.summaryZhTw).toContain("Hydro Cannon");
  });

  it("requires every positive PvE/Max classification to correspond to a released exact variant", () => {
    for (const variantId of Object.keys(allPveEvidence)) {
      expect(releaseStatusForVariant(variantId), variantId).toBe("RELEASED");
    }
    for (const variantId of Object.keys(allMaxEvidence)) {
      expect(releaseStatusForVariant(variantId), variantId).toBe("RELEASED");
    }
  });

  it("keeps mid-Gen6 raid evidence selective instead of promoting every usable species", () => {
    expect(candidatePveEvidence680709("697-kalos-normal")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidatePveEvidence680709("699-kalos-normal")).toBeNull();
    expect(candidatePveEvidence680709("706-kalos-normal")).toBeNull();
    expect(candidatePveEvidence680709("687-kalos-mega")).toBeNull();
  });

  it("treats only Dynamax Sylveon as a positive Max investment target in the confirmed Gen6 Max set", () => {
    expect(Object.keys(maxEvidence650679)).toEqual([]);
    expect(Object.keys(maxEvidence710721)).toEqual([]);
    expect(Object.keys(maxEvidence680709)).toEqual(["700-kalos-dynamax"]);
    expect(candidateMaxEvidence680709("700-kalos-dynamax")?.level).toBe("USABLE_OR_BUDGET");
    expect(candidateMaxEvidence680709("686-kalos-dynamax")).toBeNull();
    expect(candidateMaxEvidence680709("687-kalos-dynamax")).toBeNull();
    expect(candidateMaxEvidence650679("658-kalos-dynamax")).toBeNull();
    expect(candidateMaxEvidence710721("719-kalos-dynamax")).toBeNull();
  });

  it("keeps legendary, mythical and form-change PvE value exact", () => {
    expect(candidatePveEvidence710721("716-kalos-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence710721("717-kalos-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence710721("719-kalos-normal")?.level).toBe("SPECIAL_USE");
    expect(candidatePveEvidence710721("719-kalos-mega")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence710721("720-unbound-normal")?.level).toBe("CORE_INVESTMENT");
    expect(candidatePveEvidence710721("720-confined-normal")).toBeNull();
    expect(candidatePveEvidence710721("718-10-percent-normal")).toBeNull();
    expect(candidatePveEvidence710721("718-50-percent-normal")).toBeNull();
    expect(candidatePveEvidence710721("718-complete-normal")).toBeNull();
  });

  it("links every positive classification to dated provenance and documents non-promotion boundaries", () => {
    const manifests = ["650-679", "680-709", "710-721"].map((batch) =>
      JSON.parse(readFileSync(`research_notes/sources/pve-${batch}.json`, "utf8")) as {
        checkedAt: string;
        status: string;
        sources: Array<{ sourceUrl: string; supports: string[]; sourceSummaryZhTw: string }>;
        boundary: string;
      },
    );
    const supported = new Set(manifests.flatMap((manifest) => manifest.sources.flatMap((source) => source.supports)));
    const urls = new Set(manifests.flatMap((manifest) => manifest.sources.map((source) => source.sourceUrl)));

    for (const manifest of manifests) {
      expect(manifest.checkedAt).toBe("2026-09-05");
      expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVE_MAX");
      expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw))).toBe(true);
    }
    for (const [variantId, evidence] of Object.entries({ ...allPveEvidence, ...allMaxEvidence })) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-05");
    }

    const boundary = manifests.map((manifest) => manifest.boundary).join(" ");
    expect(boundary).toContain("exact-variant scoped");
    expect(boundary).toContain("Mega Malamar");
    expect(boundary).toContain("Dynamax Sylveon");
    expect(boundary).toContain("Hoopa Unbound");
    expect(boundary).toContain("Zygarde");
  });
});
