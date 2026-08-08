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
    expect(forms152181.every((form) => form.formKey === "JOHTO")).toBe(true);
    expect(forms152181.every((form) => form.formNameEn === "Johto")).toBe(true);
    expect(forms152181.every((form) => form.formNameZhTw === "城都")).toBe(true);
    expect(forms152181.every((form) => form.regionKey === "JOHTO")).toBe(true);
  });

  it("models baby merges and the Crobat continuation without synthetic paths", () => {
    expect(evolutionPairs152181).toEqual(
      expect.arrayContaining([
        ["042-kanto", "169-johto"],
        ["172-johto", "025-kanto"],
        ["173-johto", "035-kanto"],
        ["174-johto", "039-kanto"],
        ["175-johto", "176-johto"],
        ["180-johto", "181-johto"],
      ]),
    );
    expect(forms152181.find((form) => form.id === "169-johto")?.evolvesFromFormId).toBe(
      "042-kanto",
    );
    expect(forms152181.find((form) => form.id === "172-johto")?.evolvesFromFormId).toBeUndefined();
    expect(forms152181.find((form) => form.id === "173-johto")?.evolvesFromFormId).toBeUndefined();
    expect(forms152181.find((form) => form.id === "174-johto")?.evolvesFromFormId).toBeUndefined();
  });

  it("keeps released battle variants scoped to known Pokemon GO availability", () => {
    expect(releasedMegaForms152181).toEqual(new Set(["181-johto"]));
    expect(releasedShadowForms152181).toEqual(
      new Set([
        "152-johto",
        "153-johto",
        "154-johto",
        "155-johto",
        "156-johto",
        "157-johto",
        "158-johto",
        "159-johto",
        "160-johto",
        "163-johto",
        "164-johto",
        "165-johto",
        "166-johto",
        "169-johto",
        "177-johto",
        "178-johto",
        "179-johto",
        "180-johto",
        "181-johto",
      ]),
    );
    expect(specialVariants152181).toEqual([
      expect.objectContaining({ id: "181-johto-mega", formId: "181-johto", released: true }),
    ]);
  });
});
