import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DATA_VERSION } from "@/config/release";
import type { PrismaSourceRow } from "@/lib/data-prisma";
import type { DashboardRow } from "@/lib/data-read-model";
import review from "../review/152-181.json";
import officialResearch from "../research_notes/sources/official-152-181.json";

const dashboardRows = JSON.parse(
  readFileSync(new URL("../site-data/dashboard.json", import.meta.url), "utf8"),
) as DashboardRow[];
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
    const rows = dashboardRows.filter(
      (candidate) => candidate.dexNumber >= 152 && candidate.dexNumber <= 181,
    );
    expect(new Set(rows.map((candidate) => candidate.speciesId)).size).toBe(30);
    expect(new Set(rows.map((candidate) => candidate.formId)).size).toBe(30);
    expect(new Set(rows.map((candidate) => candidate.regionKey))).toEqual(new Set(["JOHTO"]));
    expect(rows.every((candidate) => candidate.formNameEn === "Johto")).toBe(true);
    expect(rows.every((candidate) => candidate.formNameZhTw === "城都")).toBe(true);
    expect(rows).toHaveLength(121);
    expect(rows.reduce((sum, candidate) => sum + candidate.categoryStatuses.length, 0)).toBe(847);
    expect(review.dataVersion).toBe(DATA_VERSION);
    expect(review.counts).toMatchObject({
      species: 30,
      forms: 30,
      battleVariants: 121,
      trueDataPending: 0,
    });
    expect(review.crossBatchIntegration.result).toBe("PASS");
  });

  it("merges baby Pokemon into the existing Kanto families", () => {
    expect(row("172-johto-normal")?.familyKey).toBe("KANTO_FAMILY_025");
    expect(row("173-johto-normal")?.familyKey).toBe("KANTO_FAMILY_035");
    expect(row("174-johto-normal")?.familyKey).toBe("KANTO_FAMILY_039");
    expect(row("172-johto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "025-kanto" })]),
    );
    expect(row("173-johto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "035-kanto" })]),
    );
    expect(row("174-johto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([expect.objectContaining({ toFormId: "039-kanto" })]),
    );
    expect(familyContaining("172-johto")?.familyId).toBe("KANTO_FAMILY_025:025-kanto");
    expect(
      new Set(familyContaining("172-johto")?.members.map((member) => member.form.formId)),
    ).toEqual(new Set(["172-johto", "025-kanto", "026-kanto"]));
    expect(familyContaining("173-johto")?.familyId).toBe("KANTO_FAMILY_035:035-kanto");
    expect(
      new Set(familyContaining("173-johto")?.members.map((member) => member.form.formId)),
    ).toEqual(new Set(["173-johto", "035-kanto", "036-kanto"]));
    expect(familyContaining("174-johto")?.familyId).toBe("KANTO_FAMILY_039:039-kanto");
    expect(
      new Set(familyContaining("174-johto")?.members.map((member) => member.form.formId)),
    ).toEqual(new Set(["174-johto", "039-kanto", "040-kanto"]));
  });

  it("keeps actual Johto extensions distinct from completed evolution targets", () => {
    expect(row("169-johto-normal")?.familyKey).toBe("KANTO_FAMILY_041");
    expect(
      new Set(familyContaining("169-johto")?.members.map((member) => member.form.formId)),
    ).toEqual(new Set(["041-kanto", "042-kanto", "169-johto"]));
    expect(familyContaining("169-johto")?.isBatchTruncated).toBe(false);
    expect(row("176-johto-normal")?.evolutionPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ toFormId: "468-sinnoh", isEvolutionStub: false }),
      ]),
    );
    expect(familyContaining("175-johto")?.isBatchTruncated).toBe(false);
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
