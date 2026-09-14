import type { CandidateBatchDefinition, CandidateForm } from "./candidates/types";
import type { CandidateReleaseEvidence, CandidateReleaseVariantKey } from "./candidates/gen5-release-494-523";
import type { CandidateMaxEvidence, CandidatePveEvidence } from "./candidates/gen5-pve-types";
import type { Gen6PvpMapping } from "./candidates/gen6-pvp";
import { gen6Candidate650679 } from "./candidates/gen6-650-679";
import { gen6Candidate680709 } from "./candidates/gen6-680-709";
import { gen6Candidate710721 } from "./candidates/gen6-710-721";
import { gen6PvpMappingByFormId } from "./candidates/gen6-pvp";
import { candidateReleaseEvidence650679 } from "./candidates/gen6-release-650-679";
import { candidateReleaseEvidence680709 } from "./candidates/gen6-release-680-709";
import { candidateReleaseEvidence710721 } from "./candidates/gen6-release-710-721";
import { candidatePveEvidence650679 } from "./candidates/gen6-pve-650-679";
import { candidatePveEvidence680709 } from "./candidates/gen6-pve-680-709";
import { candidatePveEvidence710721 } from "./candidates/gen6-pve-710-721";
import { candidateMaxEvidence650679 } from "./candidates/gen6-max-650-679";
import { candidateMaxEvidence680709 } from "./candidates/gen6-max-680-709";
import { candidateMaxEvidence710721 } from "./candidates/gen6-max-710-721";

export type Gen6BatchDefinition = CandidateBatchDefinition & {
  pvpMappingForForm: (form: Pick<CandidateForm, "id">) => Gen6PvpMapping;
  releaseEvidenceForVariant: (formId: string, variantKey: CandidateReleaseVariantKey) => CandidateReleaseEvidence;
  pveEvidenceForVariant: (variantId: string) => CandidatePveEvidence | null;
  maxEvidenceForVariant: (variantId: string) => CandidateMaxEvidence | null;
};

function makeDefinition(
  candidate: CandidateBatchDefinition,
  releaseEvidenceForVariant: Gen6BatchDefinition["releaseEvidenceForVariant"],
  pveEvidenceForVariant: Gen6BatchDefinition["pveEvidenceForVariant"],
  maxEvidenceForVariant: Gen6BatchDefinition["maxEvidenceForVariant"],
): Gen6BatchDefinition {
  return {
    ...candidate,
    pvpMappingForForm(form) {
      const mapping = gen6PvpMappingByFormId.get(form.id);
      if (!mapping) throw new Error(`Missing Gen6 ${candidate.key} PvPoke mapping for ${form.id}.`);
      return mapping;
    },
    releaseEvidenceForVariant,
    pveEvidenceForVariant,
    maxEvidenceForVariant,
  };
}

const definitions = new Map<string, Gen6BatchDefinition>([
  ["650-679", makeDefinition(gen6Candidate650679, candidateReleaseEvidence650679, candidatePveEvidence650679, candidateMaxEvidence650679)],
  ["680-709", makeDefinition(gen6Candidate680709, candidateReleaseEvidence680709, candidatePveEvidence680709, candidateMaxEvidence680709)],
  ["710-721", makeDefinition(gen6Candidate710721, candidateReleaseEvidence710721, candidatePveEvidence710721, candidateMaxEvidence710721)],
]);

export function getGen6BatchDefinition(batch: string) {
  const definition = definitions.get(batch);
  if (!definition) throw new Error(`Unknown Gen6 batch: ${batch}.`);
  return definition;
}
