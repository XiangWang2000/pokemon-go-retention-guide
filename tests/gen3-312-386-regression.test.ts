import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  evolutionPairs312386,
  forms312386,
  releasedMegaForms312386,
  releasedShadowForms312386,
  species312386,
} from "@/data/batch-312-386";
import { canonicalGen3Species } from "@/data/canonical/gen3";
import { validateGen3DexConsistency } from "@/data/checkpoint-validation";
import { deriveShadowReleaseEvidence } from "@/data/evolution-release";
import { findTextIntegrityIssues } from "@/data/text-integrity";

describe("Gen3 #312-#386 canonical and graph regression", () => {
  it("matches the independent canonical fixture for every species and Hoenn form", () => {
    expect(validateGen3DexConsistency(species312386, forms312386, { min: 312, max: 386 })).toEqual([]);
    expect(species312386).toHaveLength(75);
    expect(new Set(forms312386.map((form) => form.id)).size).toBe(75);
    expect(forms312386.every((form) => form.regionKey === "HOENN" && form.formNameZhTw === "豐緣")).toBe(true);
    expect(canonicalGen3Species.find((item) => item.dexNumber === 326)?.nameZhTw).toBe("噗噗豬");
    expect(canonicalGen3Species.find((item) => item.dexNumber === 328)?.nameZhTw).toBe("大顎蟻");
    expect(canonicalGen3Species.find((item) => item.dexNumber === 340)?.nameZhTw).toBe("鯰魚王");
    expect(canonicalGen3Species.find((item) => item.dexNumber === 374)?.nameZhTw).toBe("鐵啞鈴");
  });

  it("models branching, baby-family merge, future stubs, and Mega candidates", () => {
    const formIds = new Set(forms312386.map((form) => form.id));
    const allowedStubIds = new Set(["202-johto", "407-other", "477-other", "478-other"]);
    expect(
      evolutionPairs312386.every(([fromFormId]) =>
        formIds.has(fromFormId) || allowedStubIds.has(fromFormId),
      ),
    ).toBe(true);
    expect(
      evolutionPairs312386.every(([, toFormId]) =>
        formIds.has(toFormId) || allowedStubIds.has(toFormId),
      ),
    ).toBe(true);
    expect(evolutionPairs312386).toEqual(expect.arrayContaining([
      ["366-hoenn", "367-hoenn"],
      ["366-hoenn", "368-hoenn"],
      ["360-hoenn", "202-johto"],
      ["315-hoenn", "407-other"],
      ["356-hoenn", "477-other"],
      ["361-hoenn", "478-other"],
    ]));
    expect([...releasedMegaForms312386]).toEqual(expect.arrayContaining([
      "319-hoenn", "323-hoenn", "334-hoenn", "354-hoenn", "359-hoenn", "362-hoenn",
      "373-hoenn", "376-hoenn", "380-hoenn", "381-hoenn", "382-hoenn", "383-hoenn", "384-hoenn",
    ]));
  });

  it("keeps Shadow direct roster entries distinct from derived descendants", () => {
    const evidence = deriveShadowReleaseEvidence(
      releasedShadowForms312386,
      evolutionPairs312386,
    );
    expect(evidence.directRosterFormIds).toContain("356-hoenn");
    expect(evidence.directRosterFormIds).not.toContain("477-other");
    expect(evidence.derivedFormIds).toContain("477-other");
    expect(evidence.formalEvolutionEdges).toContainEqual(["356-hoenn", "477-other"]);
  });

  it("exports direct, mechanism, and formal-path Shadow evidence roles at runtime", () => {
    const dashboard = JSON.parse(readFileSync("site-data/dashboard.json", "utf8")) as Array<{
      id: string;
      sources?: Array<{ usageZhTw?: string }>;
    }>;
    const direct = dashboard.find((row) => row.id === "283-hoenn-shadow")?.sources ?? [];
    const derived = dashboard.find((row) => row.id === "284-hoenn-shadow")?.sources ?? [];
    expect(direct.some((source) => source.usageZhTw?.includes("direct roster source"))).toBe(true);
    expect(derived.some((source) => source.usageZhTw?.includes("derived/inherited closure"))).toBe(true);
    expect(derived.some((source) => source.usageZhTw?.includes("formal evolution edge"))).toBe(true);
  });

  it("does not contain visible source-text corruption", () => {
    expect(findTextIntegrityIssues({ species312386, forms312386 })).toEqual([]);
  });
});
