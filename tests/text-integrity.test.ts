import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { findTextIntegrityIssues } from "@/data/text-integrity";

function jsonFiles(root: string): string[] {
  if (!fsExists(root)) return [];
  const result: string[] = [];
  for (const entry of readdirSync(root)) {
    const file = join(root, entry);
    if (statSync(file).isDirectory()) result.push(...jsonFiles(file));
    else if (file.endsWith(".json")) result.push(file);
  }
  return result;
}

function fsExists(file: string) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

function loadJson(file: string) {
  return JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, "")) as unknown;
}

describe("visible text integrity and cross-generation target provenance", () => {
  it("rejects obvious encoding damage but ignores URL query punctuation", () => {
    expect(findTextIntegrityIssues({ nameZhTw: "??" })).toHaveLength(1);
    expect(findTextIntegrityIssues({ sourceName: "Pok?API" })).toHaveLength(1);
    expect(findTextIntegrityIssues({ note: "條件?實際" })).toHaveLength(1);
    expect(findTextIntegrityIssues({ note: "What is Mega Evolution?" })).toHaveLength(0);
    expect(
      findTextIntegrityIssues({ sourceUrl: "https://example.test/page?a=1??b=2" }),
    ).toHaveLength(0);
    expect(findTextIntegrityIssues({ nameZhTw: "\u6b63\u5e38\u540d\u7a31" })).toHaveLength(0);
  });

  it("keeps current manifest, runtime, and review visible text clean", () => {
    const roots = ["research_notes", "site-data", "review", "public/data"];
    const historicalReviewArchives =
      /(?:family-aggregation-20260718|001-(?:151|181|211|241)-recalibration)\.json$/;
    const files = roots
      .flatMap((root) => jsonFiles(root))
      .filter((file) => !historicalReviewArchives.test(file));
    const issues = files.flatMap((file) =>
      findTextIntegrityIssues(loadJson(file), relative(process.cwd(), file)),
    );
    expect(
      issues,
      issues
        .slice(0, 12)
        .map((issue) => `${issue.path}: ${issue.value}`)
        .join("\n"),
    ).toEqual([]);
  }, 30_000);

  it("uses the corrected names, regions, and evolution edges", () => {
    const manifest = loadJson("research_notes/cross-generation-evolution-targets.json") as {
      targets: Array<Record<string, unknown>>;
      paths: Array<Record<string, unknown>>;
    };
    const targetById = new Map(
      manifest.targets.map((target) => [
        `${String(target.dexNumber).padStart(3, "0")}-${String(target.formKey).toLowerCase()}`,
        target,
      ]),
    );
    const names = {
      "982-paldea": "\u571f\u9f8d\u7bc0\u7bc0",
      "461-other": "\u746a\u72c3\u62c9",
      "473-other": "\u8c61\u7259\u8c6c",
      "899-hisui": "\u8a6d\u89d2\u9e7f",
      "901-hisui": "\u6708\u6708\u718a",
    } as const;
    for (const [id, name] of Object.entries(names))
      expect(targetById.get(id)?.nameZhTw, id).toBe(name);
    const expectedEdges = [
      ["206-johto", "982-paldea"],
      ["215-johto", "461-other"],
      ["221-johto", "473-other"],
      ["234-johto", "899-hisui"],
      ["217-johto", "901-hisui"],
    ];
    for (const [fromFormId, toFormId] of expectedEdges) {
      expect(
        manifest.paths.some((path) => path.fromFormId === fromFormId && path.toFormId === toFormId),
        `${fromFormId}->${toFormId}`,
      ).toBe(true);
    }
    expect(
      manifest.targets.filter(
        (target) => Number(target.generation) >= 4 && target.formKey === "KANTO",
      ),
    ).toEqual([]);
    expect(targetById.get("982-paldea")?.formNameZhTw).toBe("\u5e15\u5e95\u4e9e");
    expect(targetById.get("899-hisui")?.formNameZhTw).toBe("\u6d17\u7fe0");
  });
});
