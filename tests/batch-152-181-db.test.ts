import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { PrismaDashboardRow, PrismaSourceRow } from "@/lib/data-prisma";
import review from "../review/152-181.json";
import officialResearch from "../research_notes/official-152-181.json";

const dashboardRows = JSON.parse(
  readFileSync(new URL("../site-data/dashboard.json", import.meta.url), "utf8"),
) as PrismaDashboardRow[];
const sourceRows = JSON.parse(
  readFileSync(new URL("../site-data/sources.json", import.meta.url), "utf8"),
) as PrismaSourceRow[];
const home = JSON.parse(
  readFileSync(new URL("../site-data/home.json", import.meta.url), "utf8"),
) as {
  families: Array<{
    familyId: string;
    familyKey: string;
    isBatchTruncated: boolean;
    members: Array<{ form: { formId: string } }>;
  }>;
};

function row(id: string) {
  return dashboardRows.find((candidate) => candidate.id === id);
}

function familyContaining(formId: string) {
  return home.families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
}

describe("#152-181 generated runtime and review data", () => {
  it("generates the expected species, forms, variants, categories, and review payload", () => {
    const rows = dashboardRows.filter((candidate) => candidate.dexNumber >= 152 && candidate.dexNumber <= 181);
    expect(new Set(rows.map((candidate) => candidate.speciesId)).size).toBe(30);
    expect(new Set(rows.map((candidate) => candidate.formId)).size).toBe(30);
    expect(rows).toHaveLength(121);
    expect(rows.reduce((sum, candidate) => sum + candidate.categoryStatuses.length, 0)).toBe(847);
    expect(review.dataVersion).toBe("2026.08.08-r18");
    expect(review.counts).toMatchObject({ species: 30, forms: 30, battleVariants: 121, trueDataPending: 0 });
    expect(review.crossBatchIntegration.result).toBe("PASS");
  });

  it("merges baby Pokemon into the existing Kanto families", () => {
    expect(row("172-kanto-normal")?.familyKey).toBe("KANTO_FAMILY_025");
    expect(row("173-kanto-normal")?.familyKey).toBe("KANTO_FAMILY_035");
    expect(row("174-kanto-normal")?.familyKey).toBe("KANTO_FAMILY_039");
    expect(row("172-kanto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "025-kanto" })]),
    );
    expect(row("173-kanto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "035-kanto" })]),
    );
    expect(row("174-kanto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "039-kanto" })]),
    );
    expect(familyContaining("172-kanto")?.familyId).toBe("KANTO_FAMILY_025:025-kanto");
    expect(new Set(familyContaining("172-kanto")?.members.map((member) => member.form.formId))).toEqual(
      new Set(["172-kanto", "025-kanto", "026-kanto"]),
    );
    expect(familyContaining("173-kanto")?.familyId).toBe("KANTO_FAMILY_035:035-kanto");
    expect(new Set(familyContaining("173-kanto")?.members.map((member) => member.form.formId))).toEqual(
      new Set(["173-kanto", "035-kanto", "036-kanto"]),
    );
    expect(familyContaining("174-kanto")?.familyId).toBe("KANTO_FAMILY_039:039-kanto");
    expect(new Set(familyContaining("174-kanto")?.members.map((member) => member.form.formId))).toEqual(
      new Set(["174-kanto", "039-kanto", "040-kanto"]),
    );
  });

  it("keeps actual Johto extensions distinct from future evolution stubs", () => {
    expect(row("169-kanto-normal")?.familyKey).toBe("KANTO_FAMILY_041");
    expect(new Set(familyContaining("169-kanto")?.members.map((member) => member.form.formId))).toEqual(
      new Set(["041-kanto", "042-kanto", "169-kanto"]),
    );
    expect(familyContaining("169-kanto")?.isBatchTruncated).toBe(false);
    expect(row("176-kanto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "468-kanto", isEvolutionStub: true }),
      ]),
    );
    expect(familyContaining("175-kanto")?.isBatchTruncated).toBe(true);
  });

  it("preserves representative existing Kanto conclusions while adding Johto rows", () => {
    const expected = {
      "025-kanto-normal": "CONDITIONAL_KEEP",
      "035-kanto-normal": "CONDITIONAL_KEEP",
      "039-kanto-normal": "CONDITIONAL_KEEP",
      "041-kanto-normal": "TRANSFER_CANDIDATE",
      "042-kanto-normal": "TRANSFER_CANDIDATE",
      "044-kanto-normal": "CONDITIONAL_KEEP",
      "151-kanto-normal": "KEEP",
    } as const;
    for (const [id, decision] of Object.entries(expected)) {
      expect(row(id)?.decision, id).toBe(decision);
    }
  });

  it("records sources for the batch research", () => {
    const sourceIds = new Set(sourceRows.map((source) => source.id));
    const required = officialResearch.sources
      .filter((source) => source.supports.length > 0)
      .map((source) => source.id);
    for (const sourceId of required) expect(sourceIds.has(sourceId), sourceId).toBe(true);
  });
});
