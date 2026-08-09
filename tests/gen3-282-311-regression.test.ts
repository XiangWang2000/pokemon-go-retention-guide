import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findTextIntegrityIssues } from "@/data/text-integrity";
import { evolutionPairs282311, forms282311, species282311 } from "@/data/batch-282-311";

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
    expect(forms282311.every((form) =>
      form.id.endsWith("-hoenn") &&
      form.formKey === "HOENN" &&
      form.regionKey === "HOENN" &&
      form.formNameZhTw === "\u8c50\u7de3",
    )).toBe(true);
    expect(new Set(forms282311.map((form) => form.dexNumber)).size).toBe(30);
  });

  it("keeps the Wurmple-style and Ralts integration boundaries intact", () => {
    expect(evolutionPairs282311).toEqual(expect.arrayContaining([
      ["281-hoenn", "282-hoenn"],
      ["283-hoenn", "284-hoenn"],
      ["304-hoenn", "305-hoenn"],
      ["305-hoenn", "306-hoenn"],
    ]));
    expect(row("281-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "282-hoenn" }),
        expect.objectContaining({ toFormId: "475-other", isEvolutionStub: true }),
      ]),
    );
  });

  it("models Nincada and Shedinja as one family without inventing a direct edge", () => {
    expect(row("290-hoenn-normal")?.familyKey).toBe("HOENN_FAMILY_290");
    expect(row("291-hoenn-normal")?.familyKey).toBe("HOENN_FAMILY_290");
    expect(row("292-hoenn-normal")?.familyKey).toBe("HOENN_FAMILY_290");
    expect(row("290-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).toContain("291-hoenn");
    expect(row("290-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).not.toContain("292-hoenn");
    const family = home.families.find((candidate) => candidate.familyKey === "HOENN_FAMILY_290");
    expect(family?.members.map((member) => member.form.formId)).toEqual(
      expect.arrayContaining(["290-hoenn", "291-hoenn", "292-hoenn"]),
    );
  });

  it("merges Azurill into the existing Marill family and keeps Probopass as a stub", () => {
    expect(row("298-hoenn-normal")?.familyKey).toBe("JOHTO_FAMILY_183");
    expect(row("298-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "183-johto" })]),
    );
    expect(row("299-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "476-other", isEvolutionStub: true }),
      ]),
    );
  });

  it("has six released Mega candidates and no duplicate or dangling standard forms", () => {
    const standard = dashboard.filter((candidate) =>
      candidate.dexNumber >= 282 && candidate.dexNumber <= 311 && candidate.formKey === "HOENN",
    );
    expect(new Set(standard.map((candidate) => candidate.formId)).size).toBe(30);
    expect(standard.every((candidate) =>
      candidate.evolutionPaths.every((path) =>
        path.toFormId === "475-other" ||
        path.toFormId === "476-other" ||
        dashboard.some((item) => item.formId === path.toFormId),
      ),
    )).toBe(true);
    expect(["282", "302", "303", "306", "308", "310"].every((dex) =>
      dashboard.some((candidate) => candidate.id === `${dex}-hoenn-mega` && candidate.decision === "KEEP"),
    )).toBe(true);
  });

  it("has no text corruption, pending data, or safety hold", () => {
    for (const file of [
      "../research_notes/official-282-311.json",
      "../research_notes/battle-282-311.json",
      "../research_notes/cross-generation-evolution-targets.json",
      "../review/282-311.json",
      "../site-data/dashboard.json",
      "../site-data/home.json",
    ]) {
      const value = JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
      expect(findTextIntegrityIssues(value, file), file).toEqual([]);
    }
    const batchRows = dashboard.filter((candidate) => candidate.dexNumber >= 282 && candidate.dexNumber <= 311);
    expect(batchRows.some((candidate) => candidate.assessmentDisposition === "TRUE_DATA_PENDING")).toBe(false);
    expect(batchRows.some((candidate) => candidate.decision === "HOLD_FOR_NOW")).toBe(false);
    expect(review).toMatchObject({
      dataVersion: "2026.08.09-r21",
      counts: { species: 30, forms: 30, battleVariants: 126, trueDataPending: 0 },
      crossBatchIntegration: { result: "PASS" },
    });
  });
});
