import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms554583 } from "@/data/candidates/gen5-554-583";
import { candidatePvpokeMapping554583 } from "@/data/candidates/gen5-pvp-554-583";
import {
  candidateReleaseEvidence554583,
  explicitlyUnreleasedMegaForms554583,
  explicitlyUnreleasedNormalForms554583,
  releasedDynamaxForms554583,
  releasedGigantamaxForms554583,
  releasedNormalForms554583,
  releasedPurifiedForms554583,
  releasedShadowForms554583,
} from "@/data/candidates/gen5-release-554-583";

describe("Gen5 #554-#583 candidate release evidence", () => {
  it("does not expand the formal published release", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
  });

  it("resolves 35 released NORMAL forms and the two explicit Zen Mode negatives", () => {
    expect(forms554583).toHaveLength(37);
    expect(releasedNormalForms554583.size).toBe(35);
    expect([...explicitlyUnreleasedNormalForms554583]).toEqual([
      "555-unova-zen",
      "555-galar-zen",
    ]);

    for (const form of forms554583) {
      const evidence = candidateReleaseEvidence554583(form.id, "NORMAL");
      if (explicitlyUnreleasedNormalForms554583.has(form.id)) {
        expect(evidence, form.id).toMatchObject({
          status: "UNRELEASED",
          evidenceMode: "EXPLICIT_UNRELEASED",
          sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        });
      } else {
        expect(evidence, form.id).toMatchObject({
          status: "RELEASED",
          evidenceMode: "CURRENT_ROSTER",
          sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        });
      }
    }
  });

  it("keeps Standard, Zen, and Galarian Darmanitan release states independent", () => {
    expect(candidateReleaseEvidence554583("555-unova-standard", "NORMAL").status).toBe(
      "RELEASED",
    );
    expect(candidateReleaseEvidence554583("555-unova-zen", "NORMAL").status).toBe(
      "UNRELEASED",
    );
    expect(candidateReleaseEvidence554583("555-galar-standard", "NORMAL").status).toBe(
      "RELEASED",
    );
    expect(candidateReleaseEvidence554583("555-galar-zen", "NORMAL").status).toBe(
      "UNRELEASED",
    );
  });

  it("uses only positive Shadow roster evidence and ignores speculative PvPoke Shadow IDs", () => {
    const expected = [
      "554-unova",
      "555-unova-standard",
      "557-unova",
      "558-unova",
      "564-unova",
      "565-unova",
      "566-unova",
      "567-unova",
      "568-unova",
      "569-unova",
      "574-unova",
      "575-unova",
      "576-unova",
      "577-unova",
      "578-unova",
      "579-unova",
      "580-unova",
      "581-unova",
    ];
    expect([...releasedShadowForms554583]).toEqual(expected);

    for (const form of forms554583) {
      const evidence = candidateReleaseEvidence554583(form.id, "SHADOW");
      if (releasedShadowForms554583.has(form.id)) {
        expect(evidence, form.id).toMatchObject({
          status: "RELEASED",
          evidenceMode: "CURRENT_ROSTER",
          sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
        });
      } else {
        expect(evidence, form.id).toMatchObject({ status: "UNKNOWN", sourceIds: [] });
      }
    }

    expect(candidatePvpokeMapping554583({ id: "562-unova" }).shadow).toBe("yamask_shadow");
    expect(candidateReleaseEvidence554583("562-unova", "SHADOW")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("derives Purified only from the same 18 confirmed Shadow forms", () => {
    expect([...releasedPurifiedForms554583]).toEqual([...releasedShadowForms554583]);
    for (const form of forms554583) {
      const shadow = candidateReleaseEvidence554583(form.id, "SHADOW");
      const purified = candidateReleaseEvidence554583(form.id, "PURIFIED");
      expect(purified.status, form.id).toBe(shadow.status);
      if (purified.status === "RELEASED") {
        expect(purified.evidenceMode).toBe("MECHANIC_DERIVED");
        expect(purified.sourceIds).toEqual(
          expect.arrayContaining([
            "SECONDARY-SEREBII-SHADOW-ROSTER-20260904",
            "OFFICIAL-SHADOW-PURIFICATION-MECHANIC",
          ]),
        );
      }
    }
  });

  it("resolves only the four explicitly supported Dynamax exact forms", () => {
    expect([...releasedDynamaxForms554583]).toEqual([
      "554-unova",
      "555-unova-standard",
      "568-unova",
      "569-unova",
    ]);
    expect(candidateReleaseEvidence554583("554-unova", "DYNAMAX")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: expect.arrayContaining(["OFFICIAL-MAX-FINALE-2025-DARUMAKA"]),
    });
    for (const formId of ["555-unova-standard", "568-unova", "569-unova"]) {
      expect(candidateReleaseEvidence554583(formId, "DYNAMAX"), formId).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
      });
    }
    for (const formId of ["554-galar", "555-galar-standard", "555-unova-zen"]) {
      expect(candidateReleaseEvidence554583(formId, "DYNAMAX"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("keeps Gigantamax Garbodor specimen eligibility independent from Dynamax", () => {
    expect([...releasedGigantamaxForms554583]).toEqual(["569-unova"]);
    expect(candidateReleaseEvidence554583("569-unova", "GIGANTAMAX")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["OFFICIAL-GIGANTAMAX-GARBODOR-2025"],
    });
    expect(candidateReleaseEvidence554583("568-unova", "GIGANTAMAX")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
    expect(candidateReleaseEvidence554583("554-unova", "GIGANTAMAX")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("stores Mega Scrafty as unreleased only because the current roster explicitly says No", () => {
    expect([...explicitlyUnreleasedMegaForms554583]).toEqual(["560-unova"]);
    expect(candidateReleaseEvidence554583("560-unova", "MEGA")).toMatchObject({
      status: "UNRELEASED",
      evidenceMode: "EXPLICIT_UNRELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
    });
    expect(candidateReleaseEvidence554583("571-unova", "MEGA")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("records exact-form release provenance and isolation boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/release-554-583.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      confirmed: {
        normalReleasedCount: number;
        normalExplicitUnreleased: string[];
        shadowReleased: string[];
        purifiedReleasedCount: number;
        dynamaxReleased: string[];
        gigantamaxReleased: string[];
        megaExplicitUnreleased: string[];
      };
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_RELEASE");
    expect(manifest.confirmed.normalReleasedCount).toBe(35);
    expect(manifest.confirmed.normalExplicitUnreleased).toEqual([
      "555-unova-zen",
      "555-galar-zen",
    ]);
    expect(manifest.confirmed.shadowReleased).toHaveLength(18);
    expect(manifest.confirmed.purifiedReleasedCount).toBe(18);
    expect(manifest.confirmed.dynamaxReleased).toHaveLength(4);
    expect(manifest.confirmed.gigantamaxReleased).toEqual(["569-unova"]);
    expect(manifest.confirmed.megaExplicitUnreleased).toEqual(["560-unova"]);
    expect(manifest.boundary).toContain("Every release state is exact-form scoped");
    expect(manifest.boundary).toContain("PvPoke presence never implies release");
    expect(manifest.boundary).toContain("Zen Mode Released: No does not affect Standard Mode");
    expect(manifest.boundary).toContain("Ordinary or Dynamax release never propagates to Gigantamax");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
