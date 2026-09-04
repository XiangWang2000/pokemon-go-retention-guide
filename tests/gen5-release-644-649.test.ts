import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import { CANDIDATE_BATCH_REGISTRY } from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  forms644649,
  kyuremFusionRelationships644649,
} from "@/data/candidates/gen5-644-649";
import { candidatePvpokeMapping644649 } from "@/data/candidates/gen5-pvp-644-649";
import {
  candidateReleaseEvidence644649,
  explicitlyUnreleasedNormalForms644649,
  releasedDynamaxForms644649,
  releasedGigantamaxForms644649,
  releasedNormalForms644649,
  releasedPurifiedForms644649,
  releasedShadowForms644649,
} from "@/data/candidates/gen5-release-644-649";

const directNormalForms = [
  "644-unova",
  "645-incarnate",
  "645-therian",
  "646-unova",
  "646-black",
  "646-white",
  "649-unova",
  "649-shock",
  "649-burn",
  "649-chill",
  "649-douse",
];

const rosterNormalForms = ["647-ordinary", "647-resolute", "648-aria"];

describe("Gen5 #644-#649 candidate release evidence", () => {
  it("keeps the final Gen5 candidate in evidence stage without expanding production", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY.find((entry) => entry.key === "644-649")).toMatchObject({
      stage: "EVIDENCE",
    });
  });

  it("resolves fourteen exact normal/special forms as released and Pirouette Meloetta as explicitly unreleased", () => {
    expect(forms644649).toHaveLength(15);
    expect(releasedNormalForms644649.size).toBe(14);
    expect([...explicitlyUnreleasedNormalForms644649]).toEqual(["648-pirouette"]);

    for (const form of forms644649) {
      const evidence = candidateReleaseEvidence644649(form.id, "NORMAL");
      if (form.id === "648-pirouette") {
        expect(evidence, form.id).toMatchObject({
          status: "UNRELEASED",
          evidenceMode: "EXPLICIT_UNRELEASED",
          sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        });
      } else {
        expect(evidence.status, form.id).toBe("RELEASED");
      }
    }
  });

  it("uses official direct evidence for Zekrom, Landorus, Kyurem Fusion forms, and all Genesect identities", () => {
    for (const formId of directNormalForms) {
      expect(candidateReleaseEvidence644649(formId, "NORMAL"), formId).toMatchObject({
        status: "RELEASED",
        evidenceMode: "DIRECT",
      });
    }

    for (const formId of ["644-unova", "646-unova", "646-black", "646-white"]) {
      expect(candidateReleaseEvidence644649(formId, "NORMAL").sourceIds, formId).toEqual([
        "OFFICIAL-KYUREM-FUSION-RAID-DAY-2026",
      ]);
    }

    for (const formId of [
      "645-incarnate",
      "645-therian",
      "649-unova",
      "649-shock",
      "649-burn",
      "649-chill",
      "649-douse",
    ]) {
      expect(candidateReleaseEvidence644649(formId, "NORMAL").sourceIds, formId).toEqual([
        "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE",
      ]);
    }
  });

  it("uses current roster evidence only for Keldeo forms and Aria Meloetta", () => {
    for (const formId of rosterNormalForms) {
      expect(candidateReleaseEvidence644649(formId, "NORMAL"), formId).toMatchObject({
        status: "RELEASED",
        evidenceMode: "CURRENT_ROSTER",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      });
    }
  });

  it("keeps Black and White Kyurem as released Fusion outputs rather than evolution-derived releases", () => {
    expect(kyuremFusionRelationships644649).toHaveLength(2);
    for (const formId of ["646-black", "646-white"]) {
      const evidence = candidateReleaseEvidence644649(formId, "NORMAL");
      expect(evidence).toMatchObject({
        status: "RELEASED",
        evidenceMode: "DIRECT",
        sourceIds: ["OFFICIAL-KYUREM-FUSION-RAID-DAY-2026"],
      });
      expect(evidence.evidenceMode).not.toBe("EVOLUTION_DERIVED");
    }
  });

  it("proves that a pinned PvPoke battle identity does not imply Pokémon GO release", () => {
    expect(candidatePvpokeMapping644649({ id: "648-pirouette" }).normal).toBe(
      "meloetta_pirouette",
    );
    expect(candidateReleaseEvidence644649("648-pirouette", "NORMAL")).toMatchObject({
      status: "UNRELEASED",
      evidenceMode: "EXPLICIT_UNRELEASED",
    });
    expect(candidateReleaseEvidence644649("648-aria", "NORMAL").status).toBe("RELEASED");
  });

  it("releases only Shadow Incarnate Landorus and never leaks that state to Therian", () => {
    expect([...releasedShadowForms644649]).toEqual(["645-incarnate"]);
    expect(candidatePvpokeMapping644649({ id: "645-incarnate" }).shadow).toBe(
      "landorus_incarnate_shadow",
    );
    expect(candidatePvpokeMapping644649({ id: "645-therian" }).shadow).toBeNull();

    expect(candidateReleaseEvidence644649("645-incarnate", "SHADOW")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
      sourceIds: ["OFFICIAL-STEELED-RESOLVE-TAKEN-OVER-2026"],
    });
    expect(candidateReleaseEvidence644649("645-therian", "SHADOW")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });

    for (const form of forms644649.filter((form) => form.id !== "645-incarnate")) {
      expect(candidateReleaseEvidence644649(form.id, "SHADOW"), form.id).toMatchObject({
        status: "UNKNOWN",
        sourceIds: [],
      });
    }
  });

  it("derives Purified only from the same confirmed Shadow Incarnate Landorus", () => {
    expect([...releasedPurifiedForms644649]).toEqual(["645-incarnate"]);
    expect(candidateReleaseEvidence644649("645-incarnate", "PURIFIED")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "MECHANIC_DERIVED",
    });
    expect(candidateReleaseEvidence644649("645-incarnate", "PURIFIED").sourceIds).toContain(
      "OFFICIAL-SHADOW-PURIFICATION-MECHANIC",
    );
    expect(candidateReleaseEvidence644649("645-therian", "PURIFIED")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("keeps Dynamax, Gigantamax, and Mega unknown without positive exact-form evidence", () => {
    expect(releasedDynamaxForms644649.size).toBe(0);
    expect(releasedGigantamaxForms644649.size).toBe(0);
    for (const form of forms644649) {
      for (const variantKey of ["DYNAMAX", "GIGANTAMAX", "MEGA"] as const) {
        expect(candidateReleaseEvidence644649(form.id, variantKey), `${form.id}:${variantKey}`).toMatchObject({
          status: "UNKNOWN",
          sourceIds: [],
        });
      }
    }
  });

  it("records complete release provenance and exact-form anti-leak boundaries", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/release-644-649.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string; publishedAt?: string }>;
      confirmed: {
        normalReleasedCount: number;
        normalExplicitUnreleased: string[];
        directNormalReleased: string[];
        currentRosterNormalReleased: string[];
        shadowDirectEventReleased: string[];
        shadowReleasedCount: number;
        purifiedReleasedCount: number;
        dynamaxReleased: string[];
        gigantamaxReleased: string[];
      };
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_RELEASE");
    expect(manifest.confirmed.normalReleasedCount).toBe(14);
    expect(manifest.confirmed.normalExplicitUnreleased).toEqual(["648-pirouette"]);
    expect(manifest.confirmed.directNormalReleased).toEqual(directNormalForms);
    expect(manifest.confirmed.currentRosterNormalReleased).toEqual(rosterNormalForms);
    expect(manifest.confirmed.shadowDirectEventReleased).toEqual(["645-incarnate"]);
    expect(manifest.confirmed.shadowReleasedCount).toBe(1);
    expect(manifest.confirmed.purifiedReleasedCount).toBe(1);
    expect(manifest.confirmed.dynamaxReleased).toEqual([]);
    expect(manifest.confirmed.gigantamaxReleased).toEqual([]);
    expect(manifest.sources.find((source) => source.id === "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE")?.publishedAt).toBe("2026-07-17");
    expect(manifest.boundary).toContain("Pirouette Meloetta is explicitly UNRELEASED");
    expect(manifest.boundary).toContain("released Fusion outputs, not evolution targets");
    expect(manifest.boundary).toContain("Therian Shadow remains UNKNOWN");
    expect(manifest.boundary).toContain("PvPoke presence never implies release");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });
});
