import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms387416 } from "@/data/batch-387-416";
import {
  directDynamaxEncounterForms387416,
  directShadowEncounterForms387416,
  releasedDynamaxForms387416,
  releasedGigantamaxForms387416,
  releasedMegaForms387416,
  releasedNormalForms387416,
  releasedShadowForms387416,
} from "@/data/batch-387-416-gameplay";

type ResearchManifest = {
  batch: string;
  checkedAt: string;
  sources: Array<{ id: string; supports: string[] }>;
};

const research = JSON.parse(
  readFileSync("research_notes/sources/official-387-416.json", "utf8"),
) as ResearchManifest;

describe("Gen 4 #387-#416 release evidence", () => {
  it("marks every canonical batch form as released normally", () => {
    expect(releasedNormalForms387416.size).toBe(forms387416.length);
    expect([...releasedNormalForms387416].sort()).toEqual(
      forms387416.map((form) => form.id).sort(),
    );
  });

  it("separates direct Shadow encounters from evolution-derived descendants", () => {
    expect([...directShadowEncounterForms387416].sort()).toEqual(
      [
        "387-sinnoh",
        "390-sinnoh",
        "393-sinnoh",
        "396-sinnoh",
        "399-sinnoh",
        "403-sinnoh",
        "408-sinnoh",
        "410-sinnoh",
      ].sort(),
    );
    expect(releasedShadowForms387416.size).toBe(21);
    for (const descendant of [
      "389-sinnoh",
      "392-sinnoh",
      "395-sinnoh",
      "398-sinnoh",
      "400-sinnoh",
      "405-sinnoh",
      "409-sinnoh",
      "411-sinnoh",
    ]) {
      expect(releasedShadowForms387416.has(descendant)).toBe(true);
    }
    for (const unsupported of ["401-sinnoh", "406-sinnoh", "412-plant-cloak", "415-sinnoh"]) {
      expect(releasedShadowForms387416.has(unsupported)).toBe(false);
    }
  });

  it("limits the current Max boundary to the Combee evolution family", () => {
    expect([...directDynamaxEncounterForms387416]).toEqual(["415-sinnoh"]);
    expect([...releasedDynamaxForms387416].sort()).toEqual(["415-sinnoh", "416-sinnoh"]);
    expect(releasedGigantamaxForms387416.size).toBe(0);
    expect(releasedMegaForms387416.size).toBe(0);
  });

  it("keeps a dated research manifest for every volatile release boundary", () => {
    expect(research.batch).toBe("387-416");
    expect(research.checkedAt).toBe("2026-08-13");
    const sourceIds = new Set(research.sources.map((source) => source.id));
    for (const id of [
      "OFF-SINNOH-CELEBRATION-2021",
      "SECONDARY-SINNOH-POKEDEX-20260813",
      "SECONDARY-SHADOW-SINNOH-20260813",
      "MAX-SINNOH-20260813",
      "MAX-COMBEE-DEBUT-20260525",
    ]) {
      expect(sourceIds.has(id)).toBe(true);
    }
  });
});
