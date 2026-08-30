import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DATA_VERSION } from "@/config/release";
import { findTextIntegrityIssues } from "@/data/text-integrity";
import { deriveEvolutionReleaseClosure } from "@/data/evolution-release";
import {
  evolutionPairs282311,
  forms282311,
  releasedShadowForms282311,
  species282311,
} from "@/data/batch-282-311";

type DashboardRow = {
  id: string;
  dexNumber: number;
  formId: string;
  formKey: string;
  regionKey: string;
  familyKey: string;
  decision: string;
  assessmentDisposition: string;
  evolutionPaths: Array<{ toFormId: string; isEvolutionStub?: boolean }>;
};

const dashboard = JSON.parse(
  readFileSync(new URL("../site-data/dashboard.json", import.meta.url), "utf8"),
) as DashboardRow[];
const home = JSON.parse(
  readFileSync(new URL("../site-data/home.json", import.meta.url), "utf8"),
) as { families: Array<{ familyKey: string; members: Array<{ form: { formId: string } }> }> };
const review = JSON.parse(
  readFileSync(new URL("../review/282-311.json", import.meta.url), "utf8"),
) as {
  dataVersion: string;
  counts: { species: number; forms: number; battleVariants: number; trueDataPending: number };
  crossBatchIntegration: { result: string };
};

function row(id: string) {
  return dashboard.find((candidate) => candidate.id === id);
}

describe("Gen 3 #282-#311 integration", () => {
  it("defines exactly 30 standard Hoenn species and forms", () => {
    expect(species282311).toHaveLength(30);
    expect(forms282311).toHaveLength(30);
    expect(
      forms282311.every(
        (form) =>
          form.id.endsWith("-hoenn") &&
          form.formKey === "HOENN" &&
          form.regionKey === "HOENN" &&
          form.formNameZhTw === "\u8c50\u7de3",
      ),
    ).toBe(true);
    expect(new Set(forms282311.map((form) => form.dexNumber)).size).toBe(30);
  });

  it("keeps canonical names, Azurill typing, the Skitty root, and Surskit release boundaries", () => {
    expect(species282311.find((species) => species.dexNumber === 283)).toMatchObject({
      nameZhTw: "溜溜糖球",
      types: ["WATER", "BUG"],
    });
    expect(species282311.find((species) => species.dexNumber === 298)).toMatchObject({
      nameZhTw: "露力麗",
      types: ["NORMAL", "FAIRY"],
    });
    expect(forms282311.find((form) => form.id === "298-hoenn")?.types).toEqual(["NORMAL", "FAIRY"]);
    expect(species282311.find((species) => species.dexNumber === 300)?.familyKey).toBe(
      "HOENN_FAMILY_300",
    );
    expect(forms282311.find((form) => form.id === "300-hoenn")?.evolvesFromFormId).toBeNull();
    expect(evolutionPairs282311).toContainEqual(["283-hoenn", "284-hoenn"]);
    expect(releasedShadowForms282311.has("283-hoenn")).toBe(true);
    expect(releasedShadowForms282311.has("284-hoenn")).toBe(false);
    expect([...releasedShadowForms282311]).toEqual([
      "282-hoenn",
      "283-hoenn",
      "285-hoenn",
      "287-hoenn",
      "290-hoenn",
      "293-hoenn",
      "296-hoenn",
      "299-hoenn",
      "300-hoenn",
      "302-hoenn",
      "303-hoenn",
      "304-hoenn",
      "305-hoenn",
      "306-hoenn",
      "307-hoenn",
      "308-hoenn",
      "309-hoenn",
      "310-hoenn",
      "311-hoenn",
    ]);
    const releasedClosure = deriveEvolutionReleaseClosure(
      releasedShadowForms282311,
      evolutionPairs282311,
    );
    expect(releasedClosure.has("284-hoenn")).toBe(true);
    const battle = JSON.parse(
      readFileSync(
        new URL("../research_notes/sources/battle-282-311.json", import.meta.url),
        "utf8",
      ),
    ) as { shadow: Array<{ formId: string }> };
    expect(battle.shadow.map((item) => item.formId)).toEqual([...releasedShadowForms282311]);
    const official = JSON.parse(
      readFileSync(
        new URL("../research_notes/sources/official-282-311.json", import.meta.url),
        "utf8",
      ),
    ) as { sources: Array<{ id: string; supports: string[] }> };
    const shadowSource = official.sources.find(
      (source) => source.id === "SECONDARY-SHADOW-HOENN-2026",
    );
    expect(shadowSource?.supports).toEqual(
      [...releasedShadowForms282311].flatMap((formId) => [
        `${formId}-shadow`,
        `${formId}-purified`,
      ]),
    );
  });

  it("keeps the Wurmple-style and Ralts integration boundaries intact", () => {
    expect(evolutionPairs282311).toEqual(
      expect.arrayContaining([
        ["281-hoenn", "282-hoenn"],
        ["283-hoenn", "284-hoenn"],
        ["304-hoenn", "305-hoenn"],
        ["305-hoenn", "306-hoenn"],
      ]),
    );
    expect(row("281-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "282-hoenn" }),
        expect.objectContaining({ toFormId: "475-sinnoh", isEvolutionStub: false }),
      ]),
    );
  });

  it("models Nincada and Shedinja as one family without inventing a direct edge", () => {
    expect(row("290-hoenn-normal")?.familyKey).toBe("HOENN_FAMILY_290");
    expect(row("291-hoenn-normal")?.familyKey).toBe("HOENN_FAMILY_290");
    expect(row("292-hoenn-normal")?.familyKey).toBe("HOENN_FAMILY_290");
    expect(row("290-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).toContain(
      "291-hoenn",
    );
    expect(row("290-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).not.toContain(
      "292-hoenn",
    );
    const family = home.families.find((candidate) => candidate.familyKey === "HOENN_FAMILY_290");
    expect(family?.members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["290-hoenn", "291-hoenn", "292-hoenn"]),
    );
  });

  it("merges Azurill into the existing Marill family and materializes Probopass", () => {
    expect(row("298-hoenn-normal")?.familyKey).toBe("JOHTO_FAMILY_183");
    expect(row("298-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "183-johto" })]),
    );
    expect(row("299-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "476-sinnoh", isEvolutionStub: false }),
      ]),
    );
  });

  it("has six released Mega candidates and no duplicate or dangling standard forms", () => {
    const standard = dashboard.filter(
      (candidate) =>
        candidate.dexNumber >= 282 && candidate.dexNumber <= 311 && candidate.formKey === "HOENN",
    );
    expect(new Set(standard.map((candidate) => candidate.formId)).size).toBe(30);
    expect(
      standard.every((candidate) =>
        candidate.evolutionPaths.every(
          (path) =>
            path.toFormId === "475-sinnoh" ||
            path.toFormId === "476-sinnoh" ||
            dashboard.some((item) => item.formId === path.toFormId),
        ),
      ),
    ).toBe(true);
    expect(
      ["282", "302", "303", "306", "308", "310"].every((dex) =>
        dashboard.some(
          (candidate) => candidate.id === `${dex}-hoenn-mega` && candidate.decision === "KEEP",
        ),
      ),
    ).toBe(true);
  });

  it("has no text corruption, pending data, or safety hold", () => {
    for (const file of [
      "../research_notes/sources/official-282-311.json",
      "../research_notes/sources/battle-282-311.json",
      "../research_notes/sources/cross-generation-evolution-targets.json",
      "../review/282-311.json",
      "../site-data/dashboard.json",
      "../site-data/home.json",
    ]) {
      const value = JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
      expect(findTextIntegrityIssues(value, file), file).toEqual([]);
    }
    const batchRows = dashboard.filter(
      (candidate) => candidate.dexNumber >= 282 && candidate.dexNumber <= 311,
    );
    expect(
      batchRows.some((candidate) => candidate.assessmentDisposition === "TRUE_DATA_PENDING"),
    ).toBe(false);
    expect(batchRows.some((candidate) => candidate.decision === "HOLD_FOR_NOW")).toBe(false);
    expect(review).toMatchObject({
      dataVersion: DATA_VERSION,
      counts: { species: 30, forms: 30, battleVariants: 126, trueDataPending: 0 },
      crossBatchIntegration: { result: "PASS" },
    });
  });
});
