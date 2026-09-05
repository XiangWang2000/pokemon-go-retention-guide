import type { CandidateBatchDefinition, CandidateForm } from "./candidates/types";
import type { CandidatePvpokeMapping } from "./candidates/gen5-pvp-524-553";
import type { CandidateReleaseEvidence, CandidateReleaseVariantKey } from "./candidates/gen5-release-494-523";
import type { CandidateMaxEvidence, CandidatePveEvidence } from "./candidates/gen5-pve-types";
import { gen5Candidate494523 } from "./candidates/gen5-494-523";
import { gen5Candidate524553 } from "./candidates/gen5-524-553";
import { gen5Candidate554583 } from "./candidates/gen5-554-583";
import { gen5Candidate584613 } from "./candidates/gen5-584-613";
import { gen5Candidate614643 } from "./candidates/gen5-614-643";
import { gen5Candidate644649 } from "./candidates/gen5-644-649";
import { pvpokeMappings494523 } from "./candidates/gen5-pvp-494-523";
import { pvpokeMappings524553 } from "./candidates/gen5-pvp-524-553";
import { pvpokeMappings554583 } from "./candidates/gen5-pvp-554-583";
import { pvpokeMappings584613 } from "./candidates/gen5-pvp-584-613";
import { pvpokeMappings614643 } from "./candidates/gen5-pvp-614-643";
import { pvpokeMappings644649 } from "./candidates/gen5-pvp-644-649";
import { candidateReleaseEvidence494523 } from "./candidates/gen5-release-494-523";
import { candidateReleaseEvidence524553 } from "./candidates/gen5-release-524-553";
import { candidateReleaseEvidence554583 } from "./candidates/gen5-release-554-583";
import { candidateReleaseEvidence584613 } from "./candidates/gen5-release-584-613";
import { candidateReleaseEvidence614643 } from "./candidates/gen5-release-614-643";
import { candidateReleaseEvidence644649 } from "./candidates/gen5-release-644-649";
import { candidatePveEvidence494523 } from "./candidates/gen5-pve-494-523";
import { candidatePveEvidence524553 } from "./candidates/gen5-pve-524-553";
import { candidatePveEvidence554583 } from "./candidates/gen5-pve-554-583";
import { candidatePveEvidence584613 } from "./candidates/gen5-pve-584-613";
import { candidatePveEvidence614643 } from "./candidates/gen5-pve-614-643";
import { candidatePveEvidence644649 } from "./candidates/gen5-pve-644-649";
import { candidateMaxEvidence494523 } from "./candidates/gen5-max-494-523";
import { candidateMaxEvidence524553 } from "./candidates/gen5-max-524-553";
import { candidateMaxEvidence554583 } from "./candidates/gen5-max-554-583";
import { candidateMaxEvidence584613 } from "./candidates/gen5-max-584-613";
import { candidateMaxEvidence614643 } from "./candidates/gen5-max-614-643";
import { candidateMaxEvidence644649 } from "./candidates/gen5-max-644-649";

export type Gen5PvpMapping = {
  formId: string;
  normal: string;
  shadow: string | null;
  mode: "EXACT" | "SHARED_UNDIFFERENTIATED";
  notesZhTw: string;
};

export type Gen5BatchDefinition = CandidateBatchDefinition & {
  pvpMappingForForm: (form: Pick<CandidateForm, "id">) => Gen5PvpMapping;
  releaseEvidenceForVariant: (formId: string, variantKey: CandidateReleaseVariantKey) => CandidateReleaseEvidence;
  pveEvidenceForVariant: (variantId: string) => CandidatePveEvidence | null;
  maxEvidenceForVariant: (variantId: string) => CandidateMaxEvidence | null;
};

function normalizeLegacyMappings(): readonly Gen5PvpMapping[] {
  return pvpokeMappings494523.map((mapping) => ({
    formId: mapping.formId,
    normal: mapping.normal,
    shadow: mapping.shadow,
    mode: "EXACT" as const,
    notesZhTw: "固定 PvPoke gamemaster 有此 Pokémon GO form 的普通與 Shadow battle identity。",
  }));
}

function normalizeMappings(mappings: readonly CandidatePvpokeMapping[]): readonly Gen5PvpMapping[] {
  return mappings.map((mapping) => ({
    formId: mapping.formId,
    normal: mapping.normal,
    shadow: mapping.shadow,
    mode: mapping.mode,
    notesZhTw: mapping.notesZhTw,
  }));
}

function makeDefinition(
  candidate: CandidateBatchDefinition,
  mappings: readonly Gen5PvpMapping[],
  releaseEvidenceForVariant: Gen5BatchDefinition["releaseEvidenceForVariant"],
  pveEvidenceForVariant: Gen5BatchDefinition["pveEvidenceForVariant"],
  maxEvidenceForVariant: Gen5BatchDefinition["maxEvidenceForVariant"],
): Gen5BatchDefinition {
  const mappingByForm = new Map(mappings.map((mapping) => [mapping.formId, mapping]));
  return {
    ...candidate,
    pvpMappingForForm(form) {
      const mapping = mappingByForm.get(form.id);
      if (!mapping) throw new Error(`Missing Gen5 ${candidate.key} PvPoke mapping for ${form.id}.`);
      return mapping;
    },
    releaseEvidenceForVariant,
    pveEvidenceForVariant,
    maxEvidenceForVariant,
  };
}

const definitions = new Map<string, Gen5BatchDefinition>([
  ["494-523", makeDefinition(gen5Candidate494523, normalizeLegacyMappings(), candidateReleaseEvidence494523, candidatePveEvidence494523, candidateMaxEvidence494523)],
  ["524-553", makeDefinition(gen5Candidate524553, normalizeMappings(pvpokeMappings524553), candidateReleaseEvidence524553, candidatePveEvidence524553, candidateMaxEvidence524553)],
  ["554-583", makeDefinition(gen5Candidate554583, pvpokeMappings554583, candidateReleaseEvidence554583, candidatePveEvidence554583, candidateMaxEvidence554583)],
  ["584-613", makeDefinition(gen5Candidate584613, pvpokeMappings584613, candidateReleaseEvidence584613, candidatePveEvidence584613, candidateMaxEvidence584613)],
  ["614-643", makeDefinition(gen5Candidate614643, pvpokeMappings614643, candidateReleaseEvidence614643, candidatePveEvidence614643, candidateMaxEvidence614643)],
  ["644-649", makeDefinition(gen5Candidate644649, pvpokeMappings644649, candidateReleaseEvidence644649, candidatePveEvidence644649, candidateMaxEvidence644649)],
]);

export function getGen5BatchDefinition(batch: string) {
  const definition = definitions.get(batch);
  if (!definition) throw new Error(`Unknown Gen5 batch: ${batch}.`);
  return definition;
}
