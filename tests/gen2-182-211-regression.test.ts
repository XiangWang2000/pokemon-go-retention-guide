import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { evolutionPairs182211, forms182211, species182211 } from "@/data/batch-182-211";

describe("Gen 2 #182-211 data integration", () => {
  it("uses JOHTO forms and removes the migrated Kanto stub IDs", () => {
    expect(species182211).toHaveLength(30);
    expect(forms182211.filter((form) => form.formKey === "JOHTO")).toHaveLength(30);
    expect(forms182211.filter((form) => form.formKey === "JOHTO").every((form) => form.regionKey === "JOHTO")).toBe(true);
    expect(forms182211.some((form) => form.id === "199-galar" && form.isStub)).toBe(true);
    for (const id of ["182-kanto", "186-kanto", "196-kanto", "197-kanto", "199-kanto", "208-kanto"]) {
      expect(forms182211.some((form) => form.id === id)).toBe(false);
    }
  });

  it("keeps existing families and future evolution targets connected", () => {
    expect(evolutionPairs182211).toEqual(expect.arrayContaining([
      ["044-kanto", "182-johto"],
      ["061-kanto", "186-johto"],
      ["133-kanto", "196-johto"],
      ["133-kanto", "197-johto"],
      ["079-kanto", "199-johto"],
      ["095-kanto", "208-johto"],
      ["190-johto", "424-sinnoh"],
      ["207-johto", "472-sinnoh"],
    ]));
    const cross = JSON.parse(readFileSync("research_notes/cross-generation-evolution-targets.json", "utf8"));
    const targets = new Set(cross.targets.map((target: { dexNumber: number; formKey: string }) => `${target.dexNumber}-${target.formKey.toLowerCase()}`));
    expect(targets.has("424-sinnoh")).toBe(true);
    expect(targets.has("472-sinnoh")).toBe(true);
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
