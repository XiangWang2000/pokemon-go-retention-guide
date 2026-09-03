import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  releasedNormalForms387416,
  releasedShadowForms387416,
} from "@/data/batch-387-416-gameplay";
import { pveEvidence387416, pveEvidenceForVariant387416 } from "@/data/batch-387-416-pve";

type ResearchManifest = {
  checkedAt: string;
  sources: Array<{ sourceUrl: string; supports: string[] }>;
};

const research = JSON.parse(
  readFileSync("research_notes/sources/pve-387-416.json", "utf8"),
) as ResearchManifest;

describe("Gen 4 #387-#416 variant-level PvE evidence", () => {
  it("does not leak Shadow Torterra's PvE value into normal Torterra", () => {
    expect(pveEvidenceForVariant387416("389-sinnoh-normal")).toBeNull();
    expect(pveEvidenceForVariant387416("389-sinnoh-shadow")?.level).toBe("CORE_INVESTMENT");
  });

  it("can remove stale normal-form value while retaining the exact Shadow classification", () => {
    expect(pveEvidenceForVariant387416("395-sinnoh-normal")).toBeNull();
    expect(pveEvidenceForVariant387416("395-sinnoh-shadow")?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidenceForVariant387416("409-sinnoh-normal")?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidenceForVariant387416("409-sinnoh-shadow")?.level).toBe("CORE_INVESTMENT");
  });

  it("only records evidence for currently released normal or Shadow variants", () => {
    for (const variantId of Object.keys(pveEvidence387416)) {
      const match = variantId.match(/^(.*)-(normal|shadow)$/);
      expect(match).not.toBeNull();
      const [, formId, variant] = match!;
      if (variant === "normal") expect(releasedNormalForms387416.has(formId)).toBe(true);
      else expect(releasedShadowForms387416.has(formId)).toBe(true);
    }
  });

  it("keeps every positive classification linked to the dated research manifest", () => {
    expect(research.checkedAt).toBe("2026-09-03");
    const supported = new Set(research.sources.flatMap((source) => source.supports));
    const sourceUrls = new Set(research.sources.map((source) => source.sourceUrl));
    for (const [variantId, evidence] of Object.entries(pveEvidence387416)) {
      expect(supported.has(variantId)).toBe(true);
      expect(sourceUrls.has(evidence.sourceUrl)).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-03");
    }
  });
});
