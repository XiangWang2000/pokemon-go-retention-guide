import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { forms524553 } from "@/data/candidates/gen5-524-553";
import {
  candidateReleaseEvidence524553,
  explicitlyUnreleasedMegaForms524553,
  releasedDynamaxForms524553,
  releasedMegaForms524553,
  releasedNormalForms524553,
  releasedPurifiedForms524553,
  releasedShadowForms524553,
} from "@/data/candidates/gen5-release-524-553";

describe("Gen5 #524-#553 candidate release evidence", () => {
  it("does not expand the formal published release", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
  });

  it("resolves all 33 exact NORMAL forms from explicit current roster entries", () => {
    expect(releasedNormalForms524553.size).toBe(33);
    expect([...releasedNormalForms524553]).toEqual(forms524553.map((form) => form.id));
    for (const form of forms524553) {
      expect(candidateReleaseEvidence524553(form.id, "NORMAL"), form.id).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      });
    }
  });

  it("keeps regional and stripe NORMAL release identities exact", () => {
    for (const formId of [
      "549-unova",
      "549-hisui",
      "550-red-striped",
      "550-blue-striped",
      "550-white-striped",
    ]) {
      expect(candidateReleaseEvidence524553(formId, "NORMAL")).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
      });
    }
  });

  it("uses only positive Shadow evidence and leaves roster absences UNKNOWN", () => {
    const expected = [
      "524-unova",
      "525-unova",
      "526-unova",
      "529-unova",
      "530-unova",
      "532-unova",
      "533-unova",
      "534-unova",
      "538-unova",
      "539-unova",
      "543-unova",
      "544-unova",
      "545-unova",
    ];
    expect([...releasedShadowForms524553]).toEqual(expected);

    for (const form of forms524553) {
      const evidence = candidateReleaseEvidence524553(form.id, "SHADOW");
      if (releasedShadowForms524553.has(form.id)) {
        expect(evidence.status, form.id).toBe("RELEASED");
        expect(evidence.sourceIds, form.id).toContain(
          "SECONDARY-SEREBII-SHADOW-ROSTER-20260904",
        );
      } else {
        expect(evidence, form.id).toMatchObject({ status: "UNKNOWN", sourceIds: [] });
      }
    }

    expect(candidateReleaseEvidence524553("526-unova", "SHADOW").sourceIds).toContain(
      "SECONDARY-SEREBII-GALAR-EXPEDITION-TAKEN-OVER-2024",
    );
  });

  it("derives Purified only from confirmed same-form Shadow evidence", () => {
    expect([...releasedPurifiedForms524553]).toEqual([...releasedShadowForms524553]);
    for (const form of forms524553) {
      const shadow = candidateReleaseEvidence524553(form.id, "SHADOW");
      const purified = candidateReleaseEvidence524553(form.id, "PURIFIED");
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

  it("resolves only the seven explicitly listed Dynamax forms", () => {
    expect([...releasedDynamaxForms524553]).toEqual([
      "524-unova",
      "525-unova",
      "526-unova",
      "527-unova",
      "528-unova",
      "529-unova",
      "530-unova",
    ]);
    for (const form of forms524553) {
      const evidence = candidateReleaseEvidence524553(form.id, "DYNAMAX");
      if (releasedDynamaxForms524553.has(form.id)) {
        expect(evidence, form.id).toMatchObject({
          status: "RELEASED",
          evidenceMode: "CURRENT_ROSTER",
        });
      } else {
        expect(evidence, form.id).toMatchObject({ status: "UNKNOWN", sourceIds: [] });
      }
    }
  });

  it("keeps Mega release state independent from NORMAL, Shadow, and Dynamax", () => {
    expect([...releasedMegaForms524553]).toEqual(["531-unova"]);
    expect([...explicitlyUnreleasedMegaForms524553]).toEqual(["530-unova", "545-unova"]);

    expect(candidateReleaseEvidence524553("531-unova", "MEGA")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["OFFICIAL-MEGA-AUDINO-RAID-DAY-2025"],
    });
    expect(candidateReleaseEvidence524553("530-unova", "MEGA")).toMatchObject({
      status: "UNRELEASED",
      evidenceMode: "EXPLICIT_UNRELEASED",
    });
    expect(candidateReleaseEvidence524553("545-unova", "MEGA")).toMatchObject({
      status: "UNRELEASED",
      evidenceMode: "EXPLICIT_UNRELEASED",
    });
    expect(candidateReleaseEvidence524553("534-unova", "MEGA")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("does not propagate Dynamax or regional-form release into Gigantamax", () => {
    for (const formId of ["524-unova", "530-unova", "549-hisui", "550-white-striped"]) {
      expect(candidateReleaseEvidence524553(formId, "GIGANTAMAX"), formId).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("records release provenance and explicit no-inference boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/release-524-553.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      confirmed: {
        normalReleasedCount: number;
        shadowReleased: string[];
        purifiedReleasedCount: number;
        dynamaxReleased: string[];
        megaReleased: string[];
        megaExplicitUnreleased: string[];
      };
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_RELEASE");
    expect(manifest.confirmed.normalReleasedCount).toBe(33);
    expect(manifest.confirmed.shadowReleased).toHaveLength(13);
    expect(manifest.confirmed.purifiedReleasedCount).toBe(13);
    expect(manifest.confirmed.dynamaxReleased).toHaveLength(7);
    expect(manifest.confirmed.megaReleased).toEqual(["531-unova"]);
    expect(manifest.confirmed.megaExplicitUnreleased).toEqual(["530-unova", "545-unova"]);
    expect(manifest.boundary).toContain("Roster absence never becomes UNRELEASED");
    expect(manifest.boundary).toContain("separate release identities");
    expect(manifest.boundary).toContain("Regional or stripe form release never propagates");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
