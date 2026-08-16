import { readFileSync } from "node:fs";
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
  directShadowEncounterForms417493,
  forms417446,
  forms447476,
  forms477493,
  releasedNormalForms417493,
  releasedShadowForms417493,
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

  it("keeps the independent canonical alternate-form type facts", () => {
    const expected = new Map([
      ["479-fan", ["ELECTRIC", "FLYING"]],
      ["479-frost", ["ELECTRIC", "ICE"]],
      ["479-heat", ["ELECTRIC", "FIRE"]],
      ["479-mow", ["ELECTRIC", "GRASS"]],
      ["479-sinnoh", ["ELECTRIC", "GHOST"]],
      ["479-wash", ["ELECTRIC", "WATER"]],
      ["492-land", ["GRASS"]],
      ["492-sky", ["GRASS", "FLYING"]],
    ]);
    const ownedForms = [...forms417446, ...forms447476, ...forms477493];
    const canonicalForms = [
      ...canonicalGen4Forms417446,
      ...canonicalGen4Forms447476,
      ...canonicalGen4Forms477493,
    ];
    for (const [id, types] of expected) {
      expect(ownedForms.find((form) => form.id === id)?.types).toEqual(types);
      expect(canonicalForms.find((form) => form.id === id)?.types).toEqual(types);
    }
  });

  it("derives released Shadow forms from a dated direct roster and formal edges", () => {
    expect([...directShadowEncounterForms417493].sort()).toEqual([
      "425-sinnoh",
      "431-sinnoh",
      "434-sinnoh",
      "435-sinnoh",
      "443-sinnoh",
      "449-sinnoh",
      "451-sinnoh",
      "453-sinnoh",
      "459-sinnoh",
      "483-sinnoh",
      "484-sinnoh",
      "485-sinnoh",
      "486-sinnoh",
      "487-altered",
      "488-sinnoh",
      "491-sinnoh",
    ]);
    expect([...releasedShadowForms417493].sort()).toEqual([
      "425-sinnoh",
      "426-sinnoh",
      "431-sinnoh",
      "432-sinnoh",
      "434-sinnoh",
      "435-sinnoh",
      "443-sinnoh",
      "444-sinnoh",
      "445-sinnoh",
      "449-sinnoh",
      "450-sinnoh",
      "451-sinnoh",
      "452-sinnoh",
      "453-sinnoh",
      "454-sinnoh",
      "459-sinnoh",
      "460-sinnoh",
      "483-sinnoh",
      "484-sinnoh",
      "485-sinnoh",
      "486-sinnoh",
      "487-altered",
      "488-sinnoh",
      "491-sinnoh",
    ]);
    expect(releasedShadowForms417493.has("487-origin")).toBe(false);
    expect([...releasedNormalForms417493].includes("479-fan")).toBe(true);
  });

  it("keeps the Chingling cross-generation edge and its fact-scoped source", () => {
    expect(evolutionPairs417446.filter(([from, to]) => from === "433-sinnoh" && to === "358-hoenn")).toHaveLength(1);
    const manifest = JSON.parse(readFileSync("research_notes/official-417-446.json", "utf8")) as {
      sources: Array<{ id: string; supports?: string[] }>;
    };
    const source = manifest.sources.find((item) => item.id === "EVOLUTION-SINNOH-433-20260816");
    expect(source?.supports).toEqual(expect.arrayContaining(["433-sinnoh", "358-hoenn", "EVOLUTION_VALUE"]));
  });

  it("keeps release provenance fact-scoped and review-facing summaries in Traditional Chinese", () => {
    const manifests = ["417-446", "447-476", "477-493"].map((batch) =>
      JSON.parse(readFileSync(`research_notes/official-${batch}.json`, "utf8")) as {
        sources: Array<{
          id: string;
          sourceUrl?: string;
          publishedAt?: string | null;
          sourceSummaryZhTw?: string;
          supports?: string[];
        }>;
      },
    );
    for (const manifest of manifests) {
      expect(manifest.sources.every((source) => /[\u3400-\u9fff]/u.test(source.sourceSummaryZhTw ?? ""))).toBe(true);
    }
    const official = manifests[0].sources.find((source) => source.id === "OFF-SINNOH-GEN4-20260816");
    expect(official?.sourceUrl).toBe("https://pokemongo.com/post/sinnoh-pokemon?hl=en");
    expect(official?.publishedAt).toBe("2018-10-16");
    expect(official?.supports).toEqual([]);

    const formsSource = manifests[2].sources.find((source) => source.id === "SECONDARY-SINNOH-FORMS-20260816");
    expect(formsSource?.sourceSummaryZhTw).toContain("屬性");
    expect(formsSource?.supports?.some((id) => /-(mega|dynamax|gigantamax)$/.test(id))).toBe(false);
    expect(formsSource?.sourceSummaryZhTw).not.toMatch(/release|availability|released/i);

    const releaseSource = manifests[2].sources.find((source) => source.id === "PVP-SINNOH-RELEASE-20260816");
    expect(releaseSource?.supports?.some((id) => /-(mega|dynamax|gigantamax)$/.test(id))).toBe(false);
    const shadowSource = manifests[2].sources.find((source) => source.id === "SHADOW-SINNOH-ROSTER-20260816");
    expect(shadowSource?.supports).toEqual(
      expect.arrayContaining([
        "483-sinnoh-shadow",
        "484-sinnoh-shadow",
        "487-altered-shadow",
        "491-sinnoh-shadow",
      ]),
    );
    const fanSource = manifests[2].sources.find((source) => source.id === "GOFEST-ROTOM-FAN-2025");
    expect(fanSource?.supports).toEqual(["479-fan"]);
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
