import { describe, expect, it } from "vitest";
import {
  buildLegacyEvidenceLinks,
  assertDisposableDatabase,
  findLegacyRanks,
  isLegacyVariantReleased,
  legacyInitialDecision,
  LEGACY_LEAGUES,
} from "../scripts/data/legacy-import-shared";

describe("shared legacy import adapter", () => {
  it("allows destructive imports only on the disposable rebuild database", () => {
    const root = "C:\\pokemon";
    const approved = { ALLOW_DESTRUCTIVE_REBUILD: "1" };

    expect(() => assertDisposableDatabase("file:./rebuild-ci.db", approved, root)).not.toThrow();
    expect(() => assertDisposableDatabase("file:./dev.db", approved, root)).toThrow(
      "DATABASE_URL=file:./rebuild-ci.db",
    );
    expect(() => assertDisposableDatabase("file:./rebuild-ci-backup.db", approved, root)).toThrow(
      "DATABASE_URL=file:./rebuild-ci.db",
    );
    expect(() => assertDisposableDatabase("file:C:/other/rebuild-ci.db", approved, root)).toThrow(
      "DATABASE_URL=file:./rebuild-ci.db",
    );
    expect(() => assertDisposableDatabase("file:./rebuild-ci.db", {}, root)).toThrow(
      "ALLOW_DESTRUCTIVE_REBUILD=1",
    );
  });

  it("keeps evidence categorization configurable without duplicating importer code", () => {
    const source = (id: string, supports: string[]) => ({
      id,
      supports,
      sourceName: id,
      sourceType: "OFFICIAL",
      sourceTitleOriginal: id,
      sourceLanguage: "en",
      sourceUrl: `https://example.test/${id}`,
      accessedAt: "2026-08-08",
      publishedAt: null,
      sourceSummaryZhTw: id,
    });
    const research = {
      sources: [source("MAX-GEN2", ["242-johto-normal"]), source("PVE-GEN2", ["242-johto-normal"])],
    };

    expect(buildLegacyEvidenceLinks(research).map((link) => link.category)).toEqual([
      "EVOLUTION_VALUE",
      "PVE",
    ]);
    expect(
      buildLegacyEvidenceLinks(research, { includeMaxSource: true }).map((link) => link.category),
    ).toEqual(["MAX_BATTLE", "PVE"]);
  });

  it("preserves batch-specific release and initial-decision policy switches", () => {
    const released = {
      shadow: new Set(["test-form"]),
      mega: new Set<string>(),
      dynamax: new Set<string>(),
      gigantamax: new Set<string>(),
    };

    expect(isLegacyVariantReleased("test-form", "SHADOW", released)).toBe(true);
    expect(isLegacyVariantReleased("test-form", "DYNAMAX", released)).toBe(false);
    expect(legacyInitialDecision("DYNAMAX", true, [], "test-form", {})).toBe("KEEP");
    expect(
      legacyInitialDecision("DYNAMAX", true, [], "test-form", {}, { keepDynamax: false }),
    ).toBe("TRANSFER_CANDIDATE");
    expect(
      legacyInitialDecision("NORMAL", true, [], "test-form", {
        "test-form": "CORE_INVESTMENT",
      }),
    ).toBe("KEEP");
  });

  it("reconstructs rankings through the shared league contract", () => {
    const form = {
      id: "test-form",
      dexNumber: 152,
      formKey: "JOHTO",
      formNameEn: "Test",
      formNameZhTw: "測試",
      regionKey: "JOHTO",
      types: ["NORMAL"],
      aliases: ["test"],
      evolutionFamilyNotesZhTw: "",
    };
    const rankings = new Map([
      ["GREAT" as const, [{ speciesId: "test", rating: 900, moveset: ["TACKLE"] }]],
    ]);

    expect(findLegacyRanks(form, "NORMAL", rankings, (candidate) => candidate.aliases[0]!)).toEqual(
      [
        {
          league: LEGACY_LEAGUES[0].key,
          leagueLabel: LEGACY_LEAGUES[0].label,
          sourceId: LEGACY_LEAGUES[0].sourceId,
          rank: 1,
          rating: 900,
          moves: ["TACKLE"],
        },
      ],
    );
  });
});
