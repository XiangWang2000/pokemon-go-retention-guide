import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  pveUseLevels252281,
  pveVariantUseLevels252281,
} from "@/data/batch-252-281";
import {
  pveUseLevels282311,
  pveVariantUseLevels282311,
} from "@/data/batch-282-311";
import {
  pveUseLevels312341,
  pveVariantUseLevels312341,
} from "@/data/batch-312-341";
import {
  pveUseLevels342371,
  pveVariantUseLevels342371,
} from "@/data/batch-342-371";
import {
  pveUseLevels372386,
  pveVariantUseLevels372386,
} from "@/data/batch-372-386";

describe("Gen3 PvE audit", () => {
  it("keeps normal, Shadow, and Mega/Primal raid value independent", () => {
    expect(pveUseLevels252281["254-hoenn"]).toBe("SPECIAL_USE");
    expect(pveVariantUseLevels252281["254-hoenn-shadow"]).toBe("USABLE_OR_BUDGET");
    expect(pveVariantUseLevels252281["254-hoenn-mega"]).toBe("CORE_INVESTMENT");

    expect(pveUseLevels252281["260-hoenn"]).toBeUndefined();
    expect(pveVariantUseLevels252281["260-hoenn-shadow"]).toBe("USABLE_OR_BUDGET");
    expect(pveVariantUseLevels252281["260-hoenn-mega"]).toBe("CORE_INVESTMENT");

    expect(pveUseLevels282311["282-hoenn"]).toBeUndefined();
    expect(pveVariantUseLevels282311["282-hoenn-shadow"]).toBe("CORE_INVESTMENT");
    expect(pveVariantUseLevels282311["282-hoenn-mega"]).toBe("CORE_INVESTMENT");

    expect(pveUseLevels312341["330-hoenn"]).toBeUndefined();
    expect(pveVariantUseLevels312341["330-hoenn-shadow"]).toBe("USABLE_OR_BUDGET");

    expect(pveUseLevels342371["359-hoenn"]).toBe("USABLE_OR_BUDGET");
    expect(pveVariantUseLevels342371["359-hoenn-mega"]).toBe("CORE_INVESTMENT");

    expect(pveUseLevels372386["376-hoenn"]).toBe("USABLE_OR_BUDGET");
    expect(pveVariantUseLevels372386["376-hoenn-shadow"]).toBe("CORE_INVESTMENT");
    expect(pveVariantUseLevels372386["376-hoenn-mega"]).toBe("CORE_INVESTMENT");

    expect(pveUseLevels372386["382-hoenn"]).toBe("USABLE_OR_BUDGET");
    expect(pveVariantUseLevels372386["382-hoenn-shadow"]).toBe("CORE_INVESTMENT");
    expect(pveVariantUseLevels372386["382-hoenn-mega"]).toBe("CORE_INVESTMENT");
  });

  it("does not keep old form-level values that were actually variant-specific", () => {
    expect(pveUseLevels282311["306-hoenn"]).toBeUndefined();
    expect(pveUseLevels282311["310-hoenn"]).toBeUndefined();
    expect(pveUseLevels312341["319-hoenn"]).toBeUndefined();
    expect(pveUseLevels312341["323-hoenn"]).toBeUndefined();
    expect(pveUseLevels342371["354-hoenn"]).toBeUndefined();
    expect(pveUseLevels342371["362-hoenn"]).toBeUndefined();
  });

  it("records the refreshed 2026-09-03 raid evidence in every Gen3 research batch", () => {
    for (const batch of ["252-281", "282-311", "312-341", "342-371", "372-386"]) {
      const research = JSON.parse(
        readFileSync(
          new URL(`../research_notes/sources/official-${batch}.json`, import.meta.url),
          "utf8",
        ),
      ) as {
        checkedAt: string;
        sources: Array<{ id: string; supports: string[]; accessedAt: string }>;
      };
      expect(research.checkedAt).toBe("2026-09-03");
      const attackers = research.sources.find(
        (source) => source.id === "PVE-ATTACKERS-HOENN-20260903",
      );
      const megas = research.sources.find(
        (source) => source.id === "PVE-MEGA-HOENN-20260903",
      );
      expect(attackers?.accessedAt).toBe("2026-09-03");
      expect(megas?.accessedAt).toBe("2026-09-03");
      expect(attackers?.supports.length).toBeGreaterThan(0);
      expect(megas?.supports.length).toBeGreaterThan(0);
    }
  });
});
