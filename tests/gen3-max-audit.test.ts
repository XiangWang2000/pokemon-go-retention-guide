import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  maxUseLevels252281,
  releasedDynamaxForms252281,
} from "@/data/batch-252-281";
import {
  maxUseLevels282311,
  releasedDynamaxForms282311,
} from "@/data/batch-282-311";
import {
  maxUseLevels312341,
  releasedDynamaxForms312341,
} from "@/data/batch-312-341";
import {
  maxUseLevels342371,
  releasedDynamaxForms342371,
} from "@/data/batch-342-371";
import {
  maxUseLevels372386,
  releasedDynamaxForms372386,
} from "@/data/batch-372-386";

const expected = {
  "252-281": ["280-hoenn", "281-hoenn"],
  "282-311": ["282-hoenn", "302-hoenn"],
  "312-341": ["320-hoenn", "321-hoenn", "328-hoenn", "329-hoenn", "330-hoenn"],
  "342-371": ["349-hoenn", "350-hoenn", "363-hoenn", "364-hoenn", "365-hoenn"],
  "372-386": [
    "374-hoenn",
    "375-hoenn",
    "376-hoenn",
    "377-hoenn",
    "378-hoenn",
    "379-hoenn",
    "380-hoenn",
    "381-hoenn",
  ],
} as const;

describe("Gen3 Max audit", () => {
  it("tracks the released Hoenn Dynamax forms as of 2026-09-03", () => {
    expect([...releasedDynamaxForms252281]).toEqual(expected["252-281"]);
    expect([...releasedDynamaxForms282311]).toEqual(expected["282-311"]);
    expect([...releasedDynamaxForms312341]).toEqual(expected["312-341"]);
    expect([...releasedDynamaxForms342371]).toEqual(expected["342-371"]);
    expect([...releasedDynamaxForms372386]).toEqual(expected["372-386"]);
  });

  it("does not treat every released Dynamax as a core investment", () => {
    expect(maxUseLevels282311["282-hoenn"]).toBe("USABLE_OR_BUDGET");
    expect(maxUseLevels282311["302-hoenn"]).toBe("SPECIAL_USE");
    expect(maxUseLevels312341["330-hoenn"]).toBe("SPECIAL_USE");
    expect(maxUseLevels342371["365-hoenn"]).toBe("USABLE_OR_BUDGET");
    expect(maxUseLevels372386["376-hoenn"]).toBe("CORE_INVESTMENT");
    expect(maxUseLevels372386["379-hoenn"]).toBe("CORE_INVESTMENT");
    expect(maxUseLevels372386["381-hoenn"]).toBe("CORE_INVESTMENT");
    expect(maxUseLevels372386["380-hoenn"]).toBe("USABLE_OR_BUDGET");
  });

  it("keeps release evidence attached to both the Max variant and its normal base", () => {
    for (const batch of Object.keys(expected) as Array<keyof typeof expected>) {
      const research = JSON.parse(
        readFileSync(
          new URL(`../research_notes/sources/official-${batch}.json`, import.meta.url),
          "utf8",
        ),
      ) as { checkedAt: string; sources: Array<{ id: string; supports: string[] }> };
      expect(research.checkedAt).toBe("2026-09-03");
      const source = research.sources.find((item) => item.id === "MAX-HOENN-20260903");
      expect(source).toBeDefined();
      for (const formId of expected[batch]) {
        expect(source?.supports).toContain(`${formId}-normal`);
        expect(source?.supports).toContain(`${formId}-dynamax`);
      }
    }
  });
});
