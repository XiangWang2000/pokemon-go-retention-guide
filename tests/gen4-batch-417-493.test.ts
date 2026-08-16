import { describe, expect, it } from "vitest";
import {
  canonicalGen4Forms417446,
  canonicalGen4Forms447476,
  canonicalGen4Forms477493,
  canonicalGen4Species417446,
  canonicalGen4Species447476,
  canonicalGen4Species477493,
  GEN4_BATCH_417_446_MAX,
  GEN4_BATCH_417_446_MIN,
  GEN4_BATCH_447_476_MAX,
  GEN4_BATCH_447_476_MIN,
  GEN4_BATCH_477_493_MAX,
  GEN4_BATCH_477_493_MIN,
} from "@/data/canonical/gen4-417-493";
import {
  evolutionPairs417446,
  evolutionPairs447476,
  evolutionPairs477493,
  forms417446,
  forms447476,
  forms477493,
  species417446,
  species447476,
  species477493,
  specialVariants417446,
  specialVariants447476,
  specialVariants477493,
} from "@/data/batch-417-493";
import { getGen4BatchDefinition } from "@/data/batch-gen4";
import { assertEvolutionPathEndpoints } from "@/data/evolution-path";
import { validateGen4BatchSource } from "@/data/gen4-batch-validation";
import { validateGen4CanonicalIdentity } from "@/data/gen4-validation";

const batches = [
  {
    key: "417-446",
    min: GEN4_BATCH_417_446_MIN,
    max: GEN4_BATCH_417_446_MAX,
    species: species417446,
    forms: forms417446,
    pairs: evolutionPairs417446,
    canonicalSpecies: canonicalGen4Species417446,
    canonicalForms: canonicalGen4Forms417446,
    specials: specialVariants417446,
  },
  {
    key: "447-476",
    min: GEN4_BATCH_447_476_MIN,
    max: GEN4_BATCH_447_476_MAX,
    species: species447476,
    forms: forms447476,
    pairs: evolutionPairs447476,
    canonicalSpecies: canonicalGen4Species447476,
    canonicalForms: canonicalGen4Forms447476,
    specials: specialVariants447476,
  },
  {
    key: "477-493",
    min: GEN4_BATCH_477_493_MIN,
    max: GEN4_BATCH_477_493_MAX,
    species: species477493,
    forms: forms477493,
    pairs: evolutionPairs477493,
    canonicalSpecies: canonicalGen4Species477493,
    canonicalForms: canonicalGen4Forms477493,
    specials: specialVariants477493,
  },
] as const;

describe("Gen 4 canonical source #417-#493", () => {
  it.each(batches)("covers the complete canonical identity for $key", (batch) => {
    expect(batch.species).toHaveLength(batch.max - batch.min + 1);
    expect(batch.canonicalSpecies).toHaveLength(batch.max - batch.min + 1);
    expect(
      validateGen4CanonicalIdentity(batch.canonicalSpecies, batch.canonicalForms, {
        min: batch.min,
        max: batch.max,
      }),
    ).toEqual([]);

    expect(
      validateGen4BatchSource(batch.species, batch.forms, batch.pairs, {
        species: batch.canonicalSpecies,
        forms: batch.canonicalForms,
      }),
    ).toEqual([]);
  });

  it("rejects unregistered and legacy OTHER evolution endpoints", () => {
    const batch = batches[0];
    const unknownEndpoint = [...batch.pairs, ["417-sinnoh", "999-sinnoh"] as const];
    const legacyIdentity = [...batch.pairs, ["417-sinnoh", "475-other"] as const];
    const wrongRegion = [...batch.pairs, ["417-sinnoh", "185-kanto"] as const];
    const duplicateForms = [...batch.forms, batch.forms[0]];

    expect(
      validateGen4BatchSource(batch.species, batch.forms, unknownEndpoint, {
        species: batch.canonicalSpecies,
        forms: batch.canonicalForms,
      }).some((error) => error.includes("unknown target 999-sinnoh")),
    ).toBe(true);
    expect(
      validateGen4BatchSource(batch.species, batch.forms, legacyIdentity, {
        species: batch.canonicalSpecies,
        forms: batch.canonicalForms,
      }).some((error) => error.includes("legacy OTHER identity")),
    ).toBe(true);
    expect(
      validateGen4BatchSource(batch.species, batch.forms, wrongRegion, {
        species: batch.canonicalSpecies,
        forms: batch.canonicalForms,
      }).some((error) => error.includes("unknown target 185-kanto")),
    ).toBe(true);
    expect(
      validateGen4BatchSource(batch.species, duplicateForms, batch.pairs, {
        species: batch.canonicalSpecies,
        forms: batch.canonicalForms,
      }).some((error) => error.includes("duplicate form ids")),
    ).toBe(true);
  });

  it("fails closed instead of skipping a missing evolution endpoint", () => {
    expect(() =>
      assertEvolutionPathEndpoints(
        new Set(["417-sinnoh"]),
        [["417-sinnoh", "999-sinnoh"]],
        "Gen4 test batch",
      ),
    ).toThrow("missing evolution path endpoints: 999-sinnoh");
  });

  it("uses Sinnoh identity for every owned form and never emits the legacy OTHER identity", () => {
    const forms = [...forms417446, ...forms447476, ...forms477493];
    expect(forms).toHaveLength(106);
    expect(new Set(forms.map((form) => form.id)).size).toBe(forms.length);
    expect(forms.every((form) => form.regionKey === "SINNOH")).toBe(true);
    expect(forms.some((form) => form.id.endsWith("-other"))).toBe(false);
    expect(forms.find((form) => form.id === "479-fan")?.formNameZhTw).toBe("風扇");
    expect(forms.find((form) => form.id === "493-normal")?.formNameZhTw).toBe("一般");
  });

  it("keeps special variants separate from the four generic variants", () => {
    const definitions = [
      getGen4BatchDefinition("417-446"),
      getGen4BatchDefinition("447-476"),
      getGen4BatchDefinition("477-493"),
    ];
    const specialIds = [
      ...specialVariants417446,
      ...specialVariants447476,
      ...specialVariants477493,
    ].map((variant) => variant.id);
    expect(new Set(specialIds).size).toBe(specialIds.length);
    expect(specialIds.every((id) => !id.endsWith("-normal") && !id.endsWith("-dynamax"))).toBe(
      true,
    );
    expect(definitions.map((definition) => definition.forms.length)).toEqual([33, 30, 43]);
  });

  it("selects evidence behavior through the batch definition adapter", () => {
    const definitions = batches.map((batch) => getGen4BatchDefinition(batch.key));
    expect(getGen4BatchDefinition("387-416").evidenceAdapter).toBe("legacy-387-416");
    expect(definitions.every((definition) => definition.evidenceAdapter === "generic")).toBe(true);
  });
});
