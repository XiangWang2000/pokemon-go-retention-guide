import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findTextIntegrityIssues } from "@/data/text-integrity";
import { forms252281, evolutionPairs252281, species252281 } from "@/data/batch-252-281";

type DashboardRow = {
  id: string;
  dexNumber: number;
  formId: string;
  formKey: string;
  formNameZhTw: string;
  regionKey: string;
  decision: string;
  assessmentDisposition: string;
  evolutionPaths: Array<{ toFormId: string; isEvolutionStub?: boolean }>;
};
const dashboard = JSON.parse(
  readFileSync(new URL("../site-data/dashboard.json", import.meta.url), "utf8"),
) as DashboardRow[];
const review = JSON.parse(
  readFileSync(new URL("../review/252-281.json", import.meta.url), "utf8"),
) as {
  dataVersion: string;
  counts: { species: number; forms: number; battleVariants: number; trueDataPending: number };
  crossBatchIntegration: { result: string };
};

function row(id: string) {
  return dashboard.find((candidate) => candidate.id === id);
}

describe("Gen 3 #252-#281 integration", () => {
  it("defines exactly 30 Hoenn species and standard forms", () => {
    expect(species252281).toHaveLength(30);
    expect(forms252281).toHaveLength(30);
    expect(forms252281.every((form) =>
      form.id.endsWith("-hoenn") &&
      form.formKey === "HOENN" &&
      form.regionKey === "HOENN" &&
      form.formNameZhTw === "\u8c50\u7de3",
    )).toBe(true);
    expect(new Set(forms252281.map((form) => form.dexNumber)).size).toBe(30);
  });

  it("keeps both Wurmple branch paths without inventing a cross-branch edge", () => {
    expect(evolutionPairs252281).toEqual(expect.arrayContaining([
      ["265-hoenn", "266-hoenn"],
      ["265-hoenn", "268-hoenn"],
      ["266-hoenn", "267-hoenn"],
      ["268-hoenn", "269-hoenn"],
    ]));
    expect(row("265-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).toEqual(
      expect.arrayContaining(["266-hoenn", "268-hoenn"]),
    );
    expect(row("265-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).not.toContain("267-hoenn");
    expect(row("265-hoenn-normal")?.evolutionPaths.map((path) => path.toFormId)).not.toContain("269-hoenn");
  });

  it("preserves the Gallade cross-generation stub from Kirlia", () => {
    expect(row("281-hoenn-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "475-other", isEvolutionStub: true }),
      ]),
    );
  });

  it("has no duplicate standard forms, dangling paths, or text corruption", () => {
    const standard = dashboard.filter((candidate) =>
      candidate.dexNumber >= 252 && candidate.dexNumber <= 281 &&
      candidate.formKey === "HOENN",
    );
    expect(new Set(standard.map((candidate) => candidate.formId)).size).toBe(30);
    expect(standard.every((candidate) =>
      candidate.evolutionPaths.every((path) =>
        path.toFormId === "475-other" || dashboard.some((item) => item.formId === path.toFormId),
      ),
    )).toBe(true);
    for (const file of [
      "../research_notes/official-252-281.json",
      "../research_notes/battle-252-281.json",
      "../review/252-281.json",
      "../site-data/dashboard.json",
      "../site-data/home.json",
      "../research_notes/cross-generation-evolution-targets.json",
    ]) {
      const value = JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
      expect(findTextIntegrityIssues(value, file), file).toEqual([]);
    }
  });

  it("does not change the accepted Gen 1-2 conclusion set", () => {
    const existing = dashboard.filter((candidate) => candidate.dexNumber <= 251);
    expect(existing).toHaveLength(1190);
    expect(existing.filter((candidate) => candidate.decision === "KEEP")).toHaveLength(91);
    expect(existing.filter((candidate) => candidate.decision === "CONDITIONAL_KEEP")).toHaveLength(296);
    expect(existing.filter((candidate) => candidate.decision === "TRANSFER_CANDIDATE")).toHaveLength(803);
    expect(existing.some((candidate) => candidate.decision === "HOLD_FOR_NOW")).toBe(false);
  });

  it("keeps the first batch free of safety holds", () => {
    const batchRows = dashboard.filter((candidate) => candidate.dexNumber >= 252 && candidate.dexNumber <= 281);
    expect(batchRows).toHaveLength(122);
    expect(batchRows.some((candidate) => candidate.assessmentDisposition === "TRUE_DATA_PENDING")).toBe(false);
    expect(batchRows.some((candidate) => candidate.decision === "HOLD_FOR_NOW")).toBe(false);
    expect(review).toMatchObject({
      dataVersion: "2026.08.09-r21",
      counts: { species: 30, forms: 30, battleVariants: 122, trueDataPending: 0 },
      crossBatchIntegration: { result: "PASS" },
    });
  });
});
