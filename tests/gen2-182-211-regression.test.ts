import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { evolutionPairs182211, forms182211, releasedDynamaxForms182211, species182211 } from "@/data/batch-182-211";

const dashboard = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as Array<{
  id: string;
  evolutionFamilyNotesZhTw: string;
  releaseStatus: string;
  releaseVerifiedAt: string | null;
}>;
const sources = JSON.parse(readFileSync("site-data/sources.json", "utf8")) as Array<{
  id: string;
  accessedAt: string | null;
  linkedEvidenceCount: number;
}>;

describe("Gen 2 #182-211 data integration", () => {
  it("configures current Dynamax Espeon and Umbreon variants as released", () => {
    expect(releasedDynamaxForms182211).toEqual(new Set(["196-johto", "197-johto"]));
  });

  it("uses JOHTO forms and removes the migrated Kanto stub IDs", () => {
    expect(species182211).toHaveLength(30);
    expect(forms182211.filter((form) => form.formKey === "JOHTO")).toHaveLength(30);
    expect(
      forms182211
        .filter((form) => form.formKey === "JOHTO")
        .every((form) => form.regionKey === "JOHTO"),
    ).toBe(true);
    expect(
      forms182211.some((form) => form.id === "199-galar" && !form.isStub && form.includeVariants),
    ).toBe(true);
    for (const id of [
      "182-kanto",
      "186-kanto",
      "196-kanto",
      "197-kanto",
      "199-kanto",
      "208-kanto",
    ]) {
      expect(forms182211.some((form) => form.id === id)).toBe(false);
    }
  });

  it("keeps existing families and future evolution targets connected", () => {
    expect(evolutionPairs182211).toEqual(
      expect.arrayContaining([
        ["044-kanto", "182-johto"],
        ["061-kanto", "186-johto"],
        ["133-kanto", "196-johto"],
        ["133-kanto", "197-johto"],
        ["079-kanto", "199-johto"],
        ["095-kanto", "208-johto"],
        ["190-johto", "424-sinnoh"],
        ["207-johto", "472-sinnoh"],
      ]),
    );
    const cross = JSON.parse(
      readFileSync("research_notes/sources/cross-generation-evolution-targets.json", "utf8"),
    );
    const targets = new Set(
      cross.targets.map(
        (target: { dexNumber: number; formKey: string }) =>
          `${target.dexNumber}-${target.formKey.toLowerCase()}`,
      ),
    );
    expect(targets.has("424-sinnoh")).toBe(true);
    expect(targets.has("472-sinnoh")).toBe(true);
  });

  it("publishes Galarian Slowking as materialized evidence rather than a stale stub", () => {
    const slowking = dashboard.find((row) => row.id === "199-galar-normal")!;
    const official = sources.find((source) => source.id === "OFF-HALLOWEEN-GALAR-SLOWKING-2021")!;
    expect(slowking.evolutionFamilyNotesZhTw).toContain("已推出型態");
    expect(slowking.evolutionFamilyNotesZhTw).not.toContain("完整戰鬥資料尚未納入");
    expect(official.linkedEvidenceCount).toBeGreaterThan(0);
    expect(new Date(slowking.releaseVerifiedAt!).getTime()).toBeGreaterThanOrEqual(
      new Date(official.accessedAt!).getTime(),
    );
  });
  it("keeps Pineco and Forretress connected in the source graph", () => {
    expect(species182211.find((species) => species.dexNumber === 204)?.familyKey).toBe(
      "JOHTO_FAMILY_204",
    );
    expect(species182211.find((species) => species.dexNumber === 205)?.familyKey).toBe(
      "JOHTO_FAMILY_204",
    );
    expect(forms182211.find((form) => form.id === "205-johto")?.evolvesFromFormId).toBe(
      "204-johto",
    );
    expect(evolutionPairs182211).toContainEqual(["204-johto", "205-johto"]);
  });
});
