import { describe, expect, it } from "vitest";
import {
  evolutionPairs387416,
  forms387416,
  species387416,
} from "@/data/batch-387-416";
import { validateGen4BatchSource } from "@/data/gen4-batch-validation";

describe("Gen 4 batch source #387-#416", () => {
  it("matches the independent canonical identity fixture", () => {
    expect(species387416).toHaveLength(30);
    expect(forms387416).toHaveLength(34);
    expect(validateGen4BatchSource(species387416, forms387416, evolutionPairs387416)).toEqual([]);
  });

  it("keeps Budew, Roselia, and Roserade in one cross-generation family", () => {
    expect(species387416.find((species) => species.dexNumber === 406)?.familyKey).toBe(
      "HOENN_FAMILY_315",
    );
    expect(species387416.find((species) => species.dexNumber === 407)?.familyKey).toBe(
      "HOENN_FAMILY_315",
    );
    expect(evolutionPairs387416).toContainEqual(["406-sinnoh", "315-hoenn"]);
    expect(evolutionPairs387416).toContainEqual(["315-hoenn", "407-sinnoh"]);
  });

  it("represents both Burmy evolution branches without collapsing cloaks", () => {
    for (const cloak of ["plant", "sandy", "trash"] as const) {
      expect(evolutionPairs387416).toContainEqual([
        `412-${cloak}-cloak`,
        `413-${cloak}-cloak`,
      ]);
      expect(evolutionPairs387416).toContainEqual([`412-${cloak}-cloak`, "414-sinnoh"]);
    }
  });

  it("keeps the Combee to Vespiquen family edge explicit", () => {
    expect(evolutionPairs387416).toContainEqual(["415-sinnoh", "416-sinnoh"]);
  });
});
