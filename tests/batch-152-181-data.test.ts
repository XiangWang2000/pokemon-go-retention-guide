import { describe, expect, it } from "vitest";
import {
  evolutionPairs152181,
  forms152181,
  releasedMegaForms152181,
  releasedShadowForms152181,
  specialVariants152181,
  species152181,
} from "@/data/batch-152-181";

describe("#152-181 batch source model", () => {
  it("contains exactly the first Johto validation batch", () => {
    expect(species152181.map((species) => species.dexNumber)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 152),
    );
    expect(forms152181).toHaveLength(30);
    expect(new Set(forms152181.map((form) => form.id)).size).toBe(30);
    expect(forms152181.length * 4 + specialVariants152181.length).toBe(121);
  });

  it("models baby merges and the Crobat continuation without synthetic paths", () => {
    expect(evolutionPairs152181).toEqual(
      expect.arrayContaining([
        ["042-kanto", "169-kanto"],
        ["172-kanto", "025-kanto"],
        ["173-kanto", "035-kanto"],
        ["174-kanto", "039-kanto"],
        ["175-kanto", "176-kanto"],
        ["180-kanto", "181-kanto"],
      ]),
    );
    expect(forms152181.find((form) => form.id === "169-kanto")?.evolvesFromFormId).toBe(
      "042-kanto",
    );
    expect(forms152181.find((form) => form.id === "172-kanto")?.evolvesFromFormId).toBeUndefined();
    expect(forms152181.find((form) => form.id === "173-kanto")?.evolvesFromFormId).toBeUndefined();
    expect(forms152181.find((form) => form.id === "174-kanto")?.evolvesFromFormId).toBeUndefined();
  });

  it("keeps released battle variants scoped to known Pokemon GO availability", () => {
    expect(releasedMegaForms152181).toEqual(new Set(["181-kanto"]));
    expect(releasedShadowForms152181).toEqual(
      new Set([
        "152-kanto",
        "153-kanto",
        "154-kanto",
        "155-kanto",
        "156-kanto",
        "157-kanto",
        "158-kanto",
        "159-kanto",
        "160-kanto",
        "163-kanto",
        "164-kanto",
        "165-kanto",
        "166-kanto",
        "169-kanto",
        "177-kanto",
        "178-kanto",
        "179-kanto",
        "180-kanto",
        "181-kanto",
      ]),
    );
    expect(specialVariants152181).toEqual([
      expect.objectContaining({ id: "181-kanto-mega", formId: "181-kanto", released: true }),
    ]);
  });
});
