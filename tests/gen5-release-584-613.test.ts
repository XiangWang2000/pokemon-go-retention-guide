import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CANDIDATE_BATCH_REGISTRY } from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms584613 } from "@/data/candidates/gen5-584-613";
import { candidatePvpokeMapping584613 } from "@/data/candidates/gen5-pvp-584-613";
import {
  candidateReleaseEvidence584613,
  explicitlyUnreleasedMegaForms584613,
  releasedDynamaxForms584613,
  releasedGigantamaxForms584613,
  releasedNormalForms584613,
  releasedPurifiedForms584613,
  releasedShadowForms584613,
} from "@/data/candidates/gen5-release-584-613";

describe("Gen5 #584-#613 candidate release evidence", () => {
  it("keeps the candidate in evidence stage without expanding production", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "584-613")).toMatchObject({
      stage: "EVIDENCE",
    });
  });

  it("resolves all 38 ordinary exact forms as released", () => {
    expect(forms584613).toHaveLength(38);
    expect(releasedNormalForms584613.size).toBe(38);
    for (const form of forms584613) {
      expect(candidateReleaseEvidence584613(form.id, "NORMAL"), form.id).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      });
    }
  });

  it("keeps seasonal and gender release states exact-form scoped", () => {
    for (const formId of [
      "585-spring",
      "585-summer",
      "585-autumn",
      "585-winter",
      "586-spring",
      "586-summer",
      "586-autumn",
      "586-winter",
      "592-male",
      "592-female",
      "593-male",
      "593-female",
    ]) {
      expect(candidateReleaseEvidence584613(formId, "NORMAL").status, formId).toBe("RELEASED");
      expect(candidateReleaseEvidence584613(formId, "SHADOW"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
      expect(candidateReleaseEvidence584613(formId, "DYNAMAX"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("uses current Shadow roster positives for eleven exact ordinary forms", () => {
    const rosterExpected = [
      "588-unova",
      "589-unova",
      "590-unova",
      "591-unova",
      "595-unova",
      "596-unova",
      "597-unova",
      "598-unova",
      "607-unova",
      "608-unova",
      "609-unova",
    ];
    for (const formId of rosterExpected) {
      expect(candidateReleaseEvidence584613(formId, "SHADOW"), formId).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
      });
    }
  });

  it("records Shadow Axew directly and derives only Fraxure/Haxorus through evolution", () => {
    expect(candidateReleaseEvidence584613("610-unova", "SHADOW")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["SECONDARY-GOHUB-FLYING-TAXI-SHADOW-AXEW-20260629"],
    });
    for (const formId of ["611-unova", "612-unova"]) {
      expect(candidateReleaseEvidence584613(formId, "SHADOW"), formId).toMatchObject({
        status: "RELEASED",
        evidenceMode: "EVOLUTION_DERIVED",
        sourceIds: [
          "SECONDARY-GOHUB-FLYING-TAXI-SHADOW-AXEW-20260629",
          "OFFICIAL-SHADOW-EVOLUTION-MECHANIC",
        ],
      });
    }
    expect(releasedShadowForms584613.size).toBe(14);
  });

  it("does not let PvPoke or ordinary release invent additional Shadow forms", () => {
    expect(candidatePvpokeMapping584613({ id: "610-unova" }).shadow).toBe("axew_shadow");
    expect(candidateReleaseEvidence584613("610-unova", "SHADOW").status).toBe("RELEASED");

    for (const formId of ["584-unova", "587-unova", "594-unova", "599-unova", "613-unova"]) {
      expect(candidateReleaseEvidence584613(formId, "NORMAL").status, formId).toBe("RELEASED");
      expect(candidateReleaseEvidence584613(formId, "SHADOW"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("derives Purified only from the same fourteen confirmed Shadow forms", () => {
    expect(releasedPurifiedForms584613.size).toBe(14);
    expect([...releasedPurifiedForms584613]).toEqual([...releasedShadowForms584613]);
    for (const form of forms584613) {
      const shadow = candidateReleaseEvidence584613(form.id, "SHADOW");
      const purified = candidateReleaseEvidence584613(form.id, "PURIFIED");
      expect(purified.status, form.id).toBe(shadow.status);
      if (purified.status === "RELEASED") {
        expect(purified.evidenceMode).toBe("MECHANIC_DERIVED");
        expect(purified.sourceIds).toContain("OFFICIAL-SHADOW-PURIFICATION-MECHANIC");
      }
    }
  });

  it("keeps Mega Eelektross and Mega Chandelure explicit negatives isolated from ordinary forms", () => {
    expect([...explicitlyUnreleasedMegaForms584613]).toEqual(["604-unova", "609-unova"]);
    for (const formId of explicitlyUnreleasedMegaForms584613) {
      expect(candidateReleaseEvidence584613(formId, "MEGA"), formId).toMatchObject({
        status: "UNRELEASED",
        evidenceMode: "EXPLICIT_UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      });
      expect(candidateReleaseEvidence584613(formId, "NORMAL").status, formId).toBe("RELEASED");
    }
  });

  it("leaves every Dynamax and Gigantamax state unknown without positive exact-form evidence", () => {
    expect(releasedDynamaxForms584613.size).toBe(0);
    expect(releasedGigantamaxForms584613.size).toBe(0);
    for (const form of forms584613) {
      expect(candidateReleaseEvidence584613(form.id, "DYNAMAX"), form.id).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
      expect(candidateReleaseEvidence584613(form.id, "GIGANTAMAX"), form.id).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("records complete release provenance and anti-leak boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/release-584-613.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      confirmed: {
        normalReleasedCount: number;
        shadowRosterReleased: string[];
        shadowDirectEventReleased: string[];
        shadowEvolutionDerivedReleased: string[];
        shadowReleasedCount: number;
        purifiedReleasedCount: number;
        dynamaxReleased: string[];
        gigantamaxReleased: string[];
        megaExplicitUnreleased: string[];
      };
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_RELEASE");
    expect(manifest.confirmed.normalReleasedCount).toBe(38);
    expect(manifest.confirmed.shadowRosterReleased).toHaveLength(11);
    expect(manifest.confirmed.shadowDirectEventReleased).toEqual(["610-unova"]);
    expect(manifest.confirmed.shadowEvolutionDerivedReleased).toEqual([
      "611-unova",
      "612-unova",
    ]);
    expect(manifest.confirmed.shadowReleasedCount).toBe(14);
    expect(manifest.confirmed.purifiedReleasedCount).toBe(14);
    expect(manifest.confirmed.dynamaxReleased).toEqual([]);
    expect(manifest.confirmed.gigantamaxReleased).toEqual([]);
    expect(manifest.confirmed.megaExplicitUnreleased).toEqual(["604-unova", "609-unova"]);
    expect(manifest.boundary).toContain("Every release state is exact-form scoped");
    expect(manifest.boundary).toContain("PvPoke presence never implies release");
    expect(manifest.boundary).toContain("Seasonal and gender forms never inherit");
    expect(manifest.boundary).toContain("Dynamax/Gigantamax remain UNKNOWN");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
