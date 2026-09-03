import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { releasedDynamaxForms387416 } from "@/data/batch-387-416-gameplay";
import { releasedDynamaxForms447476 } from "@/data/batch-417-493";
import { maxEvidenceGen4 } from "@/data/batch-gen4-max";

type Manifest = {
  checkedAt: string;
  sources: Array<{ sourceUrl: string; supports: string[] }>;
};

function manifest(path: string) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as Manifest;
}

describe("Gen4 Max Battle audit", () => {
  it("keeps release status separate from investment value", () => {
    expect([...releasedDynamaxForms387416].sort()).toEqual([
      "415-sinnoh",
      "416-sinnoh",
    ]);
    expect([...releasedDynamaxForms447476].sort()).toEqual([
      "461-sinnoh",
      "464-sinnoh",
      "466-sinnoh",
      "470-sinnoh",
      "471-sinnoh",
      "475-sinnoh",
    ]);

    expect(releasedDynamaxForms447476.has("467-sinnoh")).toBe(false);
    expect(maxEvidenceGen4["467-sinnoh-dynamax"]).toBeUndefined();

    expect(maxEvidenceGen4["416-sinnoh-dynamax"]?.level).toBe("SPECIAL_USE");
    expect(maxEvidenceGen4["461-sinnoh-dynamax"]?.level).toBe("CORE_INVESTMENT");
    expect(maxEvidenceGen4["464-sinnoh-dynamax"]?.level).toBe("CORE_INVESTMENT");
    expect(maxEvidenceGen4["466-sinnoh-dynamax"]?.level).toBe("USABLE_OR_BUDGET");
    expect(maxEvidenceGen4["470-sinnoh-dynamax"]).toBeUndefined();
    expect(maxEvidenceGen4["471-sinnoh-dynamax"]?.level).toBe("CORE_INVESTMENT");
    expect(maxEvidenceGen4["475-sinnoh-dynamax"]?.level).toBe("USABLE_OR_BUDGET");
  });

  it("links every positive Max classification to dated exact-version evidence", () => {
    const manifests = [
      manifest("research_notes/sources/pve-387-416.json"),
      manifest("research_notes/sources/pve-447-476.json"),
    ];
    expect(manifests.every((item) => item.checkedAt === "2026-09-03")).toBe(true);

    const supported = new Set(manifests.flatMap((item) => item.sources.flatMap((s) => s.supports)));
    const urls = new Set(manifests.flatMap((item) => item.sources.map((s) => s.sourceUrl)));

    for (const [variantId, evidence] of Object.entries(maxEvidenceGen4)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-03");
    }
  });
});
