import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CANDIDATE_BATCH_REGISTRY } from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms614643 } from "@/data/candidates/gen5-614-643";
import { candidatePvpokeMapping614643 } from "@/data/candidates/gen5-pvp-614-643";
import {
  candidateReleaseEvidence614643,
  explicitlyUnreleasedMegaForms614643,
  releasedDynamaxForms614643,
  releasedGigantamaxForms614643,
  releasedNormalForms614643,
  releasedPurifiedForms614643,
  releasedShadowForms614643,
} from "@/data/candidates/gen5-release-614-643";

describe("Gen5 #614-#643 candidate release evidence", () => {
  it("keeps the candidate in evidence stage without expanding production", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(649);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(649);
    expect(CANDIDATE_BATCH_REGISTRY.map((entry) => entry.generation)).not.toContain(5);
  });

  it("resolves all 34 ordinary and special exact forms as released", () => {
    expect(forms614643).toHaveLength(34);
    expect(releasedNormalForms614643.size).toBe(34);
    for (const form of forms614643) {
      expect(candidateReleaseEvidence614643(form.id, "NORMAL"), form.id).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      });
    }
  });

  it("keeps regional and Forces of Nature release states exact-form scoped", () => {
    for (const formId of [
      "618-unova",
      "618-galar",
      "628-unova",
      "628-hisui",
      "641-incarnate",
      "641-therian",
      "642-incarnate",
      "642-therian",
    ]) {
      expect(candidateReleaseEvidence614643(formId, "NORMAL").status, formId).toBe("RELEASED");
    }

    for (const formId of ["618-galar", "628-hisui", "641-therian", "642-therian"]) {
      expect(candidateReleaseEvidence614643(formId, "SHADOW"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
      expect(candidateReleaseEvidence614643(formId, "PURIFIED"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("uses current Shadow roster positives for seven exact ordinary forms", () => {
    const expected = [
      "616-unova",
      "617-unova",
      "622-unova",
      "623-unova",
      "633-unova",
      "634-unova",
      "635-unova",
    ];
    for (const formId of expected) {
      expect(candidateReleaseEvidence614643(formId, "SHADOW"), formId).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
      });
    }
  });

  it("uses direct form-specific evidence for Shadow Tornadus, Thundurus, and Reshiram", () => {
    expect(candidateReleaseEvidence614643("641-incarnate", "SHADOW")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["SECONDARY-GOHUB-PSYCHIC-SPECTACULAR-SHADOW-TORNADUS-20250915"],
    });
    expect(candidateReleaseEvidence614643("642-incarnate", "SHADOW")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["SECONDARY-GOHUB-PRECIOUS-PALS-SHADOW-THUNDURUS-20260123"],
    });
    expect(candidateReleaseEvidence614643("643-unova", "SHADOW")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["SECONDARY-GOHUB-FLYING-TAXI-SHADOW-RESHIRAM-20260625"],
    });
    expect(releasedShadowForms614643.size).toBe(10);
  });

  it("does not let pinned PvPoke Shadow identities invent release states", () => {
    expect(candidatePvpokeMapping614643({ id: "641-incarnate" }).shadow).toBe(
      "tornadus_incarnate_shadow",
    );
    expect(candidatePvpokeMapping614643({ id: "641-therian" }).shadow).toBeNull();
    expect(candidateReleaseEvidence614643("641-incarnate", "SHADOW").status).toBe("RELEASED");
    expect(candidateReleaseEvidence614643("641-therian", "SHADOW").status).toBe("UNKNOWN");

    for (const formId of ["614-unova", "618-unova", "628-unova", "640-unova"]) {
      expect(candidateReleaseEvidence614643(formId, "NORMAL").status, formId).toBe("RELEASED");
      expect(candidateReleaseEvidence614643(formId, "SHADOW"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("derives Purified only from the same ten confirmed Shadow forms", () => {
    expect(releasedPurifiedForms614643.size).toBe(10);
    expect([...releasedPurifiedForms614643]).toEqual([...releasedShadowForms614643]);
    for (const form of forms614643) {
      const shadow = candidateReleaseEvidence614643(form.id, "SHADOW");
      const purified = candidateReleaseEvidence614643(form.id, "PURIFIED");
      expect(purified.status, form.id).toBe(shadow.status);
      if (purified.status === "RELEASED") {
        expect(purified.evidenceMode).toBe("MECHANIC_DERIVED");
        expect(purified.sourceIds).toContain("OFFICIAL-SHADOW-PURIFICATION-MECHANIC");
      }
    }
  });

  it("releases only the four exact Dynamax forms listed by the current roster", () => {
    expect([...releasedDynamaxForms614643]).toEqual([
      "615-unova",
      "633-unova",
      "634-unova",
      "635-unova",
    ]);
    for (const form of forms614643) {
      const evidence = candidateReleaseEvidence614643(form.id, "DYNAMAX");
      if (releasedDynamaxForms614643.has(form.id)) {
        expect(evidence, form.id).toMatchObject({
          status: "RELEASED",
          evidenceMode: "CURRENT_ROSTER",
          sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        });
      } else {
        expect(evidence, form.id).toMatchObject({ status: "UNKNOWN", sourceIds: [] });
      }
    }
  });

  it("keeps Gigantamax unknown and Mega Golurk explicitly unreleased", () => {
    expect(releasedGigantamaxForms614643.size).toBe(0);
    for (const form of forms614643) {
      expect(candidateReleaseEvidence614643(form.id, "GIGANTAMAX"), form.id).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }

    expect([...explicitlyUnreleasedMegaForms614643]).toEqual(["623-unova"]);
    expect(candidateReleaseEvidence614643("623-unova", "MEGA")).toMatchObject({
      status: "UNRELEASED",
      evidenceMode: "EXPLICIT_UNRELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
    });
    expect(candidateReleaseEvidence614643("623-unova", "NORMAL").status).toBe("RELEASED");
  });

  it("records complete release provenance and anti-leak boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/release-614-643.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      confirmed: {
        normalReleasedCount: number;
        shadowRosterReleased: string[];
        shadowDirectEventReleased: string[];
        shadowReleasedCount: number;
        purifiedReleasedCount: number;
        dynamaxReleased: string[];
        gigantamaxReleased: string[];
        megaExplicitUnreleased: string[];
      };
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_RELEASE");
    expect(manifest.confirmed.normalReleasedCount).toBe(34);
    expect(manifest.confirmed.shadowRosterReleased).toHaveLength(7);
    expect(manifest.confirmed.shadowDirectEventReleased).toEqual([
      "641-incarnate",
      "642-incarnate",
      "643-unova",
    ]);
    expect(manifest.confirmed.shadowReleasedCount).toBe(10);
    expect(manifest.confirmed.purifiedReleasedCount).toBe(10);
    expect(manifest.confirmed.dynamaxReleased).toEqual([
      "615-unova",
      "633-unova",
      "634-unova",
      "635-unova",
    ]);
    expect(manifest.confirmed.gigantamaxReleased).toEqual([]);
    expect(manifest.confirmed.megaExplicitUnreleased).toEqual(["623-unova"]);
    expect(manifest.boundary).toContain("Every release state is exact-form scoped");
    expect(manifest.boundary).toContain("Therian forms remain UNKNOWN");
    expect(manifest.boundary).toContain("PvPoke presence never implies release");
    expect(manifest.boundary).toContain("Gigantamax remains UNKNOWN");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
