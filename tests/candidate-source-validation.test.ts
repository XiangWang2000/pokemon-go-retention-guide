import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  candidateSourceObservations,
  validateCandidateEvidenceSource,
  type CandidateSourceManifest,
} from "@/data/candidate-source-validation";
import { pveEvidence614643 } from "@/data/candidates/gen5-pve-614-643";
import { maxEvidence614643 } from "@/data/candidates/gen5-max-614-643";
import { pveEvidence644649 } from "@/data/candidates/gen5-pve-644-649";

const manifest = (batch: string): CandidateSourceManifest => JSON.parse(
  readFileSync(`research_notes/sources/pve-${batch}.json`, "utf8"),
);

describe("candidate exact source provenance", () => {
  it("validates each positive variant/URL/category pair in the final Gen5 batches", () => {
    for (const [batch, category, rows] of [
      ["614-643", "PVE", pveEvidence614643],
      ["614-643", "MAX", maxEvidence614643],
      ["644-649", "PVE", pveEvidence644649],
    ] as const) {
      for (const [id, evidence] of Object.entries(rows)) {
        const source = validateCandidateEvidenceSource(manifest(batch), id, category, evidence);
        expect(source.title).toBeTruthy();
        expect(source.metadataCheckedAt).toBe("2026-09-07");
        expect(evidence.checkedAt).toBe("2026-09-05");
      }
    }
  });

  it("rejects a valid manifest URL borrowed from a different exact variant", () => {
    const evidence = pveEvidence614643["635-unova-normal"]!;
    expect(() => validateCandidateEvidenceSource(manifest("614-643"), "635-unova-normal", "PVE", {
      ...evidence, sourceUrl: pveEvidence614643["635-unova-shadow"]!.sourceUrl,
    })).toThrow("Missing exact candidate source pairing");
  });

  it("rejects cross-category evidence even when URL and supported variant match", () => {
    const evidence = maxEvidence614643["635-unova-dynamax"]!;
    expect(() => validateCandidateEvidenceSource(manifest("614-643"), "635-unova-dynamax", "PVE", evidence))
      .toThrow("category mismatch");
    const data = manifest("614-643");
    const wrongCategory: CandidateSourceManifest = {
      ...data, sources: data.sources.map((row) => ({ ...row, category: "PVE" })),
    };
    expect(() => validateCandidateEvidenceSource(wrongCategory, "635-unova-dynamax", "MAX", evidence))
      .toThrow("Missing exact candidate source pairing");
  });

  it("rejects evidence dates that do not match the recorded observation", () => {
    expect(() => validateCandidateEvidenceSource(manifest("614-643"), "635-unova-normal", "PVE", {
      ...pveEvidence614643["635-unova-normal"]!, checkedAt: "2026-09-07",
    })).toThrow("date mismatch");
  });

  it("preserves historical missing metadata without pretending it is verified", () => {
    const data = manifest("614-643");
    const historical: CandidateSourceManifest = {
      ...data, sources: data.sources.map(({ sourceUrl, supports, sourceSummaryZhTw }) => ({
        sourceUrl, supports, sourceSummaryZhTw,
      })),
    };
    expect(validateCandidateEvidenceSource(historical, "635-unova-normal", "PVE",
      pveEvidence614643["635-unova-normal"]!).title).toBeUndefined();
  });

  it("exposes only explicitly recorded nonpositive observations, never absence as negative", () => {
    const data = manifest("614-643");
    expect(candidateSourceObservations(data, "615-unova-dynamax", "MAX")).toEqual([{
      variantId: "615-unova-dynamax", category: "MAX", outcome: "NO_POSITIVE_EVIDENCE",
      sourceUrl: "https://db.pokemongohub.net/pokemon/615-Dynamax",
      checkedAt: "2026-09-05", summaryZhTw: expect.any(String),
    }]);
    expect(candidateSourceObservations(data, "615-unova-normal", "PVE")).toEqual([]);
    expect(candidateSourceObservations(data, "615-unova-dynamax", "PVE")).toEqual([]);
    expect(candidateSourceObservations(data, "633-unova-dynamax", "MAX")).toEqual([]);
    expect(candidateSourceObservations(manifest("644-649"), "649-normal-normal", "PVE")).toEqual([]);
  });
});
