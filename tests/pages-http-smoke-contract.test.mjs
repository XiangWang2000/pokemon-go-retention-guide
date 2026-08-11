import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { readExpectedPagesSmokeContract } from "../scripts/pages-http-smoke.mjs";

describe("Pages HTTP smoke contract", () => {
  it("samples the first, middle, and last current detail routes", async () => {
    const contract = await readExpectedPagesSmokeContract();
    const auditSummary = JSON.parse(
      await readFile(new URL("../site-data/auditSummary.json", import.meta.url), "utf8"),
    );
    const rows = auditSummary.rows;
    const indexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
    const expected = indexes.map(
      (index) => `pokemon/${encodeURIComponent(rows[index].id)}/`,
    );

    expect(contract.detailPathnames).toEqual(expected);
    expect(new Set(contract.detailPathnames).size).toBe(contract.detailPathnames.length);
    expect(contract.detailPathnames.length).toBeGreaterThanOrEqual(1);
    expect(contract.detailPathnames.length).toBeLessThanOrEqual(3);
  });
});
