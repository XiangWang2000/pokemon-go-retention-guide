import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CANDIDATE_BATCH_REGISTRY } from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { maxEvidence494523 } from "@/data/candidates/gen5-max-494-523";
import {
  pveEvidence494523,
  pveEvidenceForVariant494523,
} from "@/data/candidates/gen5-pve-494-523";
import {
  releasedDynamaxForms494523,
  releasedShadowForms494523,
} from "@/data/candidates/gen5-release-494-523";

type Manifest = {
  checkedAt: string;
  status: string;
  sources: Array<{
    sourceUrl: string;
    supports: string[];
    sourceSummaryZhTw: string;
  }>;
  auditedNoPositive: {
    pve: string[];
    max: string[];
  };
  boundary: string;
};

function manifest() {
  return JSON.parse(
    readFileSync("research_notes/sources/pve-494-523.json", "utf8").replace(/^\uFEFF/, ""),
  ) as Manifest;
}

describe("Gen5 #494-#523 exact-variant PvE and Max evidence", () => {
  it("keeps the candidate unpublished while adding battle-value evidence", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "494-523")).toMatchObject({
      stage: "EVIDENCE",
    });
  });

  it("locks representative normal and Shadow PvE classifications independently", () => {
    expect(pveEvidence494523["500-unova-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence494523["500-unova-normal"]).toBeUndefined();

    expect(pveEvidence494523["503-unova-normal"]?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidence494523["503-unova-shadow"]?.level).toBe("CORE_INVESTMENT");

    expect(pveEvidence494523["521-unova-normal"]?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidence494523["521-unova-shadow"]?.level).toBe("USABLE_OR_BUDGET");
  });

  it("does not manufacture positive PvE evidence from a badge, Shadow status, or release status", () => {
    for (const variantId of [
      "497-unova-shadow",
      "500-unova-normal",
      "523-unova-shadow",
    ]) {
      expect(pveEvidenceForVariant494523(variantId), variantId).toBeNull();
    }

    expect(releasedShadowForms494523.has("497-unova")).toBe(true);
    expect(releasedShadowForms494523.has("500-unova")).toBe(true);
    expect(releasedShadowForms494523.has("523-unova")).toBe(true);
  });

  it("keeps released Dynamax status separate from current Max investment value", () => {
    expect([...releasedDynamaxForms494523].sort()).toEqual([
      "519-unova",
      "520-unova",
      "521-unova",
    ]);
    expect(maxEvidence494523).toEqual({});
  });

  it("links every positive PvE classification to dated exact-version provenance", () => {
    const item = manifest();
    expect(item.checkedAt).toBe("2026-09-04");
    expect(item.status).toBe("PARTIAL_EVIDENCE_PVE_MAX");

    const supported = new Set(item.sources.flatMap((source) => source.supports));
    const urls = new Set(item.sources.map((source) => source.sourceUrl));

    expect(Object.keys(pveEvidence494523).sort()).toEqual([
      "500-unova-shadow",
      "503-unova-normal",
      "503-unova-shadow",
      "521-unova-normal",
      "521-unova-shadow",
    ]);

    for (const [variantId, evidence] of Object.entries(pveEvidence494523)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-04");
    }
  });

  it("records explicit no-positive audits without turning absence into permanent negative evidence", () => {
    const item = manifest();
    expect(item.auditedNoPositive.pve).toEqual([
      "497-unova-shadow",
      "500-unova-normal",
      "523-unova-shadow",
    ]);
    expect(item.auditedNoPositive.max).toEqual([
      "519-unova-dynamax",
      "520-unova-dynamax",
      "521-unova-dynamax",
    ]);
    expect(item.boundary).toContain("Released Dynamax status is also independent from Max investment value");
    expect(item.boundary).toContain("not proof that a variant can never become useful later");
    expect(
      item.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });

  it("keeps species-level cleanup guidance from borrowing Shadow PvE value", () => {
    const markdown = readFileSync("research_notes/history/generation-5-unova-retention.md", "utf8");
    const emboar = markdown.split("\n").find((line) => line.startsWith("| #500 |"));
    const samurott = markdown.split("\n").find((line) => line.startsWith("| #503 |"));
    const unfezant = markdown.split("\n").find((line) => line.startsWith("| #521 |"));

    expect(emboar).toContain("⚪ 普通重複可傳");
    expect(emboar).toContain("獨立版本");
    expect(samurott).toContain("🔴 優先保留");
    expect(unfezant).toContain("🟡 選擇性保留");
  });
});
