import type { CandidatePveEvidence } from "./candidates/gen5-pve-types";

export type CandidateEvidenceCategory = "PVE" | "MAX";
export type CandidateSourceObservation = {
  variantId: string;
  category: CandidateEvidenceCategory;
  outcome: "NO_POSITIVE_EVIDENCE" | "INSUFFICIENT_DATA";
};
export type CandidateSourceRecord = {
  sourceUrl: string;
  supports: readonly string[];
  sourceSummaryZhTw: string;
  category?: CandidateEvidenceCategory;
  title?: string;
  metadataCheckedAt?: string;
  observations?: readonly CandidateSourceObservation[];
};
export type CandidateSourceManifest = {
  checkedAt: string;
  sources: readonly CandidateSourceRecord[];
};

/** Historical manifests separated Max by exact variant suffix, before category was explicit. */
function variantCategory(variantId: string): CandidateEvidenceCategory {
  return /-(dynamax|gigantamax)$/.test(variantId) ? "MAX" : "PVE";
}

/** A URL and a variant appearing somewhere in a manifest are not sufficient provenance. */
export function validateCandidateEvidenceSource(
  manifest: CandidateSourceManifest,
  variantId: string,
  category: CandidateEvidenceCategory,
  evidence: Pick<CandidatePveEvidence, "sourceUrl" | "checkedAt">,
): CandidateSourceRecord {
  if (variantCategory(variantId) !== category) {
    throw new Error(`Candidate evidence category mismatch: ${variantId} / ${category}`);
  }
  const source = manifest.sources.find((row) =>
    row.sourceUrl === evidence.sourceUrl &&
    row.supports.includes(variantId) &&
    (row.category ?? variantCategory(variantId)) === category,
  );
  if (!source) throw new Error(`Missing exact candidate source pairing: ${variantId} / ${category} / ${evidence.sourceUrl}`);
  if (evidence.checkedAt !== manifest.checkedAt) {
    throw new Error(`Candidate evidence date mismatch: ${variantId}`);
  }
  // Old manifests remain usable, but absent page metadata is never represented as verified.
  if ((source.title === undefined) !== (source.metadataCheckedAt === undefined) ||
      (source.title !== undefined && (!source.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(source.metadataCheckedAt!)))) {
    throw new Error(`Incomplete candidate source metadata: ${source.sourceUrl}`);
  }
  return source;
}

/** Explicit checked observations stay distinct from a negative battle assessment. */
export function candidateSourceObservations(
  manifest: CandidateSourceManifest,
  variantId: string,
  category: CandidateEvidenceCategory,
) {
  if (variantCategory(variantId) !== category) return [];
  return manifest.sources.flatMap((source) =>
    (source.observations ?? [])
      .filter((row) => row.variantId === variantId && row.category === category &&
        (source.category === undefined || source.category === category))
      .map((row) => ({
        ...row,
        sourceUrl: source.sourceUrl,
        checkedAt: manifest.checkedAt,
        summaryZhTw: source.sourceSummaryZhTw,
      })),
  );
}
