import { describe, expect, it } from "vitest";
import {
  canonicalGen4Forms387416,
  canonicalGen4Species387416,
  GEN4_BATCH_387_416_MAX,
  GEN4_BATCH_387_416_MIN,
} from "@/data/canonical/gen4-387-416";
import { validateGen4CanonicalIdentity } from "@/data/gen4-validation";

describe("Gen 4 canonical identity #387-#416", () => {
  it("covers the first 30 Gen 4 species without gaps", () => {
    expect([GEN4_BATCH_387_416_MIN, GEN4_BATCH_387_416_MAX]).toEqual([387, 416]);
    expect(canonicalGen4Species387416).toHaveLength(30);
    expect(
      validateGen4CanonicalIdentity(canonicalGen4Species387416, canonicalGen4Forms387416, {
        min: GEN4_BATCH_387_416_MIN,
        max: GEN4_BATCH_387_416_MAX,
      }),
    ).toEqual([]);
  });

  it("keeps Burmy and Wormadam cloak forms explicit", () => {
    const burmy = canonicalGen4Forms387416.filter((form) => form.dexNumber === 412);
    const wormadam = canonicalGen4Forms387416.filter((form) => form.dexNumber === 413);

    expect(burmy.map((form) => form.formKey)).toEqual([
      "PLANT_CLOAK",
      "SANDY_CLOAK",
      "TRASH_CLOAK",
    ]);
    expect(burmy.map((form) => form.types)).toEqual([["BUG"], ["BUG"], ["BUG"]]);
    expect(wormadam.map((form) => form.types)).toEqual([
      ["BUG", "GRASS"],
      ["BUG", "GROUND"],
      ["BUG", "STEEL"],
    ]);
  });

  it("detects a missing Pokédex number", () => {
    const errors = validateGen4CanonicalIdentity(
      canonicalGen4Species387416.filter((species) => species.dexNumber !== 400),
      canonicalGen4Forms387416,
      { min: 387, max: 416 },
    );
    expect(errors.some((error) => error.includes("cover every Pokédex number"))).toBe(true);
  });
});
