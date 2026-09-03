import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY } from "@/config/batch-registry";
import {
  CANDIDATE_BATCH_REGISTRY,
  assertCandidateBatchRegistry,
} from "@/config/candidate-batch-registry";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import {
  evolutionPairs494523,
  forms494523,
  gen5Candidate494523,
  species494523,
} from "@/data/candidates/gen5-494-523";
import {
  candidatePvpokeSpeciesId494523,
  pvpokeMappings494523,
} from "@/data/candidates/gen5-pvp-494-523";
import {
  candidateReleaseEvidence494523,
  releasedDynamaxForms494523,
  releasedPurifiedForms494523,
  releasedShadowForms494523,
} from "@/data/candidates/gen5-release-494-523";

type RankingRow = {
  speciesId: string;
  rating?: number;
  moveset?: string[];
};

const snapshotPaths = {
  GL: "data/sources/pvpoke/2026-09-01/rankings-1500.json",
  UL: "data/sources/pvpoke/2026-09-01/rankings-2500.json",
  ML: "data/sources/pvpoke/2026-09-01/rankings-10000.json",
} as const;

function rankings(path: string) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as RankingRow[];
}

function rankOf(rows: readonly RankingRow[], speciesId: string) {
  const index = rows.findIndex((row) => row.speciesId === speciesId);
  return index < 0 ? null : index + 1;
}

function guideRows() {
  const markdown = readFileSync(
    "research_notes/history/generation-5-unova-retention.md",
    "utf8",
  );
  return [
    ...markdown.matchAll(
      /^\|\s*#(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/gm,
    ),
  ].map((match) => ({
    dexNumber: Number(match[1]),
    name: match[2].trim(),
    recommendation: match[3].trim(),
    ranks: match[4].trim(),
    reason: match[5].trim(),
  }));
}

describe("Gen5 #494-#523 publication candidate", () => {
  it("does not change the formal published scope", () => {
    expect(CURRENT_DATA_MAX_DEX).toBe(493);
    expect(BATCH_REGISTRY.at(-1)?.maxDex).toBe(493);
    expect(CANDIDATE_BATCH_REGISTRY).toHaveLength(1);
    expect(CANDIDATE_BATCH_REGISTRY[0]).toMatchObject({
      key: "494-523",
      stage: "EVIDENCE",
      generation: 5,
    });
    expect(() => assertCandidateBatchRegistry()).not.toThrow();
  });

  it("covers exactly 30 National Dex identities with one canonical Unova form each", () => {
    expect(species494523.map((item) => item.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => 494 + index),
    );
    expect(forms494523).toHaveLength(30);
    expect(new Set(forms494523.map((form) => form.id)).size).toBe(30);
    expect(forms494523.every((form) => form.regionKey === "UNOVA")).toBe(true);
    expect(forms494523.every((form) => form.formKey === "UNOVA")).toBe(true);
    expect(gen5Candidate494523.key).toBe("494-523");
  });

  it("keeps family identities consistent across every evolution edge", () => {
    const formById = new Map(forms494523.map((form) => [form.id, form]));
    const speciesByDex = new Map(species494523.map((species) => [species.dexNumber, species]));
    for (const [fromFormId, toFormId] of evolutionPairs494523) {
      const from = formById.get(fromFormId);
      const to = formById.get(toFormId);
      expect(from, fromFormId).toBeDefined();
      expect(to, toFormId).toBeDefined();
      expect(speciesByDex.get(from!.dexNumber)?.familyKey).toBe(
        speciesByDex.get(to!.dexNumber)?.familyKey,
      );
      expect(to!.evolvesFromFormId).toBe(fromFormId);
    }
  });

  it("contains only canonical same-generation evolution edges for this first slice", () => {
    expect(evolutionPairs494523).toEqual([
      ["495-unova", "496-unova"],
      ["496-unova", "497-unova"],
      ["498-unova", "499-unova"],
      ["499-unova", "500-unova"],
      ["501-unova", "502-unova"],
      ["502-unova", "503-unova"],
      ["504-unova", "505-unova"],
      ["506-unova", "507-unova"],
      ["507-unova", "508-unova"],
      ["509-unova", "510-unova"],
      ["511-unova", "512-unova"],
      ["513-unova", "514-unova"],
      ["515-unova", "516-unova"],
      ["517-unova", "518-unova"],
      ["519-unova", "520-unova"],
      ["520-unova", "521-unova"],
      ["522-unova", "523-unova"],
    ]);
  });

  it("records identity provenance without claiming GO release or battle value", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/identity-494-523.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string; supports: string[] }>;
      boundary: string;
    };
    expect(manifest.status).toBe("CANDIDATE_IDENTITY_ONLY");
    expect(manifest.sources[0]?.id).toBe("POKEAPI-CANONICAL-UNOVA-494-523");
    expect(manifest.sources[0]?.supports).toHaveLength(30);
    expect(manifest.sources[0]?.sourceSummaryZhTw).toContain("不作為 Pokémon GO 推出狀態");
    expect(manifest.boundary).toContain("No BattleVariant release state");
  });

  it("maps every canonical form to distinct NORMAL and SHADOW PvPoke identities", () => {
    expect(pvpokeMappings494523).toHaveLength(30);
    expect(new Set(pvpokeMappings494523.map((mapping) => mapping.formId)).size).toBe(30);
    for (const form of forms494523) {
      const normal = candidatePvpokeSpeciesId494523(form, "NORMAL");
      const shadow = candidatePvpokeSpeciesId494523(form, "SHADOW");
      expect(shadow).toBe(`${normal}_shadow`);
      expect(normal).not.toBe(shadow);
    }
  });

  it("rebuilds exact NORMAL and SHADOW ranks from the pinned 2026-09-01 snapshots", () => {
    const gl = rankings(snapshotPaths.GL);
    const ul = rankings(snapshotPaths.UL);
    const ml = rankings(snapshotPaths.ML);
    const samurott = forms494523.find((form) => form.id === "503-unova")!;
    const emboar = forms494523.find((form) => form.id === "500-unova")!;

    expect([
      rankOf(gl, candidatePvpokeSpeciesId494523(samurott, "NORMAL")),
      rankOf(ul, candidatePvpokeSpeciesId494523(samurott, "NORMAL")),
      rankOf(ml, candidatePvpokeSpeciesId494523(samurott, "NORMAL")),
    ]).toEqual([96, 77, 249]);
    expect([
      rankOf(gl, candidatePvpokeSpeciesId494523(samurott, "SHADOW")),
      rankOf(ul, candidatePvpokeSpeciesId494523(samurott, "SHADOW")),
      rankOf(ml, candidatePvpokeSpeciesId494523(samurott, "SHADOW")),
    ]).toEqual([161, 102, 241]);

    expect(rankOf(ml, candidatePvpokeSpeciesId494523(emboar, "NORMAL"))).toBe(260);
    expect(rankOf(ml, candidatePvpokeSpeciesId494523(emboar, "SHADOW"))).toBe(237);
  });

  it("keeps the species-level guide aligned to NORMAL ranks, never Shadow ranks", () => {
    const snapshots = {
      GL: rankings(snapshotPaths.GL),
      UL: rankings(snapshotPaths.UL),
      ML: rankings(snapshotPaths.ML),
    };
    const guide = guideRows().filter(
      (row) => row.dexNumber >= 494 && row.dexNumber <= 523,
    );

    for (const row of guide) {
      const form = forms494523.find((candidate) => candidate.dexNumber === row.dexNumber)!;
      const normalId = candidatePvpokeSpeciesId494523(form, "NORMAL");
      const expected = {
        GL: rankOf(snapshots.GL, normalId),
        UL: rankOf(snapshots.UL, normalId),
        ML: rankOf(snapshots.ML, normalId),
      };
      const displayed = { GL: null, UL: null, ML: null } as Record<
        keyof typeof expected,
        number | null
      >;
      for (const match of row.ranks.matchAll(/(GL|UL|ML)#(\d+)/g)) {
        displayed[match[1] as keyof typeof displayed] = Number(match[2]);
      }
      expect(displayed, `#${row.dexNumber} ${row.name}`).toEqual(expected);
    }

    const emboar = guide.find((row) => row.dexNumber === 500);
    expect(emboar?.recommendation).toContain("⚪");
    expect(emboar?.reason).toContain("Shadow ML#237");
    expect(emboar?.reason).toContain("不能回灌普通個體");
  });

  it("records PvP provenance without allowing ranking presence to imply release", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/pvp-494-523.json", "utf8"),
    ) as {
      status: string;
      snapshot: {
        commit: string;
        leagues: Record<string, { cp: number; blobSha: string }>;
      };
      boundary: string;
    };
    expect(manifest.status).toBe("PARTIAL_EVIDENCE_PVP");
    expect(manifest.snapshot.commit).toBe("7b96d91fb553780653190ad32de001b5d9086a7f");
    expect(manifest.snapshot.leagues.GREAT?.blobSha).toBe(
      "11427d49e8020bbb2d022cf6a5072e81a0e3b945",
    );
    expect(manifest.boundary).toContain("must never be used to infer Pokémon GO release state");
  });

  it("resolves all NORMAL release states from explicit official evidence", () => {
    for (const form of forms494523) {
      const evidence = candidateReleaseEvidence494523(form.id, "NORMAL");
      expect(evidence.status, form.id).toBe("RELEASED");
      expect(evidence.sourceIds.length, form.id).toBeGreaterThan(0);
      expect(evidence.evidenceMode, form.id).not.toBe("UNKNOWN");
    }
  });

  it("uses only positive Shadow roster evidence and keeps roster absences UNKNOWN", () => {
    expect(releasedShadowForms494523.size).toBe(18);
    const expectedReleased = [
      "495-unova",
      "496-unova",
      "497-unova",
      "498-unova",
      "499-unova",
      "500-unova",
      "501-unova",
      "502-unova",
      "503-unova",
      "504-unova",
      "505-unova",
      "509-unova",
      "510-unova",
      "519-unova",
      "520-unova",
      "521-unova",
      "522-unova",
      "523-unova",
    ];
    expect([...releasedShadowForms494523]).toEqual(expectedReleased);

    for (const form of forms494523) {
      const evidence = candidateReleaseEvidence494523(form.id, "SHADOW");
      if (releasedShadowForms494523.has(form.id)) {
        expect(evidence.status, form.id).toBe("RELEASED");
        expect(evidence.sourceIds).toContain("SECONDARY-SEREBII-SHADOW-ROSTER-20260904");
      } else {
        expect(evidence.status, form.id).toBe("UNKNOWN");
        expect(evidence.sourceIds, form.id).toEqual([]);
      }
    }
  });

  it("derives Purified only from a confirmed same-form Shadow", () => {
    expect([...releasedPurifiedForms494523]).toEqual([...releasedShadowForms494523]);
    for (const form of forms494523) {
      const shadow = candidateReleaseEvidence494523(form.id, "SHADOW");
      const purified = candidateReleaseEvidence494523(form.id, "PURIFIED");
      expect(purified.status, form.id).toBe(shadow.status);
      if (purified.status === "RELEASED") {
        expect(purified.sourceIds).toEqual(
          expect.arrayContaining([
            "SECONDARY-SEREBII-SHADOW-ROSTER-20260904",
            "OFFICIAL-SHADOW-PURIFICATION-MECHANIC",
          ]),
        );
        expect(purified.evidenceMode).toBe("MECHANIC_DERIVED");
      }
    }
  });

  it("resolves Dynamax Pidove and its evolutions without leaking Max status to other forms", () => {
    expect([...releasedDynamaxForms494523]).toEqual([
      "519-unova",
      "520-unova",
      "521-unova",
    ]);
    expect(candidateReleaseEvidence494523("519-unova", "DYNAMAX")).toMatchObject({
      status: "RELEASED",
      evidenceMode: "DIRECT",
    });
    for (const formId of ["520-unova", "521-unova"]) {
      expect(candidateReleaseEvidence494523(formId, "DYNAMAX")).toMatchObject({
        status: "RELEASED",
        evidenceMode: "EVOLUTION_DERIVED",
      });
    }
    expect(candidateReleaseEvidence494523("522-unova", "DYNAMAX")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("stores explicit special-form negatives only when the source says No", () => {
    expect(candidateReleaseEvidence494523("500-unova", "MEGA")).toMatchObject({
      status: "UNRELEASED",
      evidenceMode: "EXPLICIT_UNRELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
    });
    expect(candidateReleaseEvidence494523("503-unova", "MEGA")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
    expect(candidateReleaseEvidence494523("500-unova", "GIGANTAMAX")).toMatchObject({
      status: "UNKNOWN",
      sourceIds: [],
    });
  });

  it("records release provenance and forbids negative inference from roster absence", () => {
    const manifest = JSON.parse(
      readFileSync("research_notes/sources/release-494-523.json", "utf8"),
    ) as {
      status: string;
      sources: Array<{ id: string; sourceSummaryZhTw: string }>;
      confirmed: {
        normalReleased: string[];
        shadowReleased: string[];
        dynamaxReleased: string[];
        explicitUnreleased: Array<{ formId: string; variantKey: string }>;
      };
      boundary: string;
    };

    expect(manifest.status).toBe("PARTIAL_EVIDENCE_RELEASE");
    expect(manifest.confirmed.normalReleased).toHaveLength(30);
    expect(manifest.confirmed.shadowReleased).toHaveLength(18);
    expect(manifest.confirmed.dynamaxReleased).toEqual([
      "519-unova",
      "520-unova",
      "521-unova",
    ]);
    expect(manifest.confirmed.explicitUnreleased).toEqual([
      { formId: "500-unova", variantKey: "MEGA" },
    ]);
    expect(manifest.boundary).toContain("Absence from a roster is never converted to UNRELEASED");
    expect(manifest.boundary).toContain("PvPoke presence is never release evidence");
    expect(
      manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw)),
    ).toBe(true);
  });

});
