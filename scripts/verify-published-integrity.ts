import "dotenv/config";
import { buildExportWorkbook } from "../src/export/excel";
import {
  getDashboardRows,
  getReviewIssues,
  getSources,
  getVariantDetailMeta,
} from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { assertOfficialEvolutionPathsMaterialized } from "../src/data/research-import";
import { forms387416 } from "../src/data/batch-387-416";
import { CURRENT_RELEASE_CONTRACT } from "../src/config/release-contract";
import { buildAuditSummary } from "../src/lib/audit-data";
import { buildHomeSnapshot } from "../src/presentation/home-snapshot";
import { buildHomeSummary } from "../src/presentation/home-summary";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [dashboard, review, sources] = await Promise.all([
    getDashboardRows(),
    getReviewIssues(),
    getSources(),
  ]);
  const expectedCounts = CURRENT_RELEASE_CONTRACT.expectedCounts;
  assert(
    dashboard.length === expectedCounts.battleVariants,
    `Published integrity expected ${expectedCounts.battleVariants} dashboard rows, found ${dashboard.length}.`,
  );

  const gen4Rows = dashboard.filter((row) => row.dexNumber >= 387 && row.dexNumber <= 416);
  const expectedGen4FormIds = new Set(forms387416.map((form) => form.id));
  const actualGen4FormIds = new Set(gen4Rows.map((row) => row.formId));
  assert(gen4Rows.length === 136, `Expected 136 Gen4 rows, found ${gen4Rows.length}.`);
  assert(
    actualGen4FormIds.size === expectedGen4FormIds.size &&
      [...expectedGen4FormIds].every((formId) => actualGen4FormIds.has(formId)),
    `Published Gen4 forms differ from the canonical source: expected ${expectedGen4FormIds.size}, found ${actualGen4FormIds.size}.`,
  );
  assert(
    gen4Rows.every((row) => row.regionKey === "SINNOH"),
    "Published Gen4 data contains a row outside region SINNOH.",
  );

  const home = buildHomeSnapshot(
    dashboard,
    CURRENT_RELEASE_CONTRACT.dataAsOf,
    CURRENT_RELEASE_CONTRACT.dataVersion,
  );
  const homeSummary = buildHomeSummary(home);
  const audit = buildAuditSummary(dashboard, CURRENT_RELEASE_CONTRACT.dataAsOf);
  const homeFormIds = new Set(
    home.families.flatMap((family) => family.members.map((member) => member.form.formId)),
  );
  assert(
    [...expectedGen4FormIds].every((formId) => homeFormIds.has(formId)),
    "Home snapshot is missing one or more canonical Gen4 forms.",
  );
  assert(
    homeSummary.dataVersion === CURRENT_RELEASE_CONTRACT.dataVersion,
    "Home summary did not retain the current release data version.",
  );

  const roseliaFamily = home.families.find((family) => family.familyKey === "HOENN_FAMILY_315");
  const roseliaFamilyForms = new Set(
    roseliaFamily?.members.map((member) => member.form.formId) ?? [],
  );
  for (const formId of ["315-hoenn", "406-sinnoh", "407-sinnoh"]) {
    assert(roseliaFamilyForms.has(formId), `Cross-generation Roselia family is missing ${formId}.`);
  }
  assert(
    !dashboard.some((row) => row.formId === "407-other"),
    "Published dashboard contains the legacy 407-other identity.",
  );
  assert(
    audit.rows.length === dashboard.length,
    `Audit summary row count ${audit.rows.length} does not match dashboard ${dashboard.length}.`,
  );

  for (const row of gen4Rows) {
    const detail = await getVariantDetailMeta(row.formId, row.id, row.evaluationId);
    assert(detail, `Missing detail payload for Gen4 variant ${row.id}.`);
  }

  const scope = {
    pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } },
  };
  const [
    gen4Species,
    gen4Forms,
    gen4Variants,
    gen4Released,
    edge030031,
    edge341342,
    edge371372,
    boundaryForms,
    roserade,
    roseradeEdges,
    legacyRoseradeStub,
  ] = await Promise.all([
    prisma.pokemonSpecies.count({ where: { dexNumber: { gte: 387, lte: 416 } } }),
    prisma.pokemonForm.count({ where: { species: { dexNumber: { gte: 387, lte: 416 } } } }),
    prisma.battleVariant.count({ where: scope }),
    prisma.battleVariant.count({ where: { ...scope, releaseStatus: "RELEASED" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "030-kanto", toFormId: "031-kanto" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "341-hoenn", toFormId: "342-hoenn" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "371-hoenn", toFormId: "372-hoenn" } }),
    prisma.pokemonForm.findMany({
      where: { id: { in: ["342-hoenn", "372-hoenn"] } },
      select: {
        id: true,
        isEvolutionStub: true,
        regionKey: true,
        species: { select: { generation: true } },
      },
    }),
    prisma.pokemonForm.findUnique({
      where: { id: "407-sinnoh" },
      select: {
        id: true,
        formKey: true,
        formNameEn: true,
        formNameZhTw: true,
        regionKey: true,
        isEvolutionStub: true,
        evolvesFromFormId: true,
        species: { select: { generation: true, familyKey: true } },
      },
    }),
    prisma.evolutionPath.findMany({
      where: { fromFormId: "315-hoenn", toFormId: "407-sinnoh" },
      select: { id: true },
    }),
    prisma.pokemonForm.findUnique({ where: { id: "407-other" } }),
  ]);

  await assertOfficialEvolutionPathsMaterialized(prisma);
  assert(
    gen4Species === 30 && gen4Forms === 34 && gen4Variants === 136 && gen4Released === 78,
    `Unexpected Gen4 rebuild boundary: species=${gen4Species}, forms=${gen4Forms}, variants=${gen4Variants}, released=${gen4Released}.`,
  );
  assert(
    edge030031 && edge341342 && edge371372,
    "One or more deferred adjacent-batch evolution edges were not restored by their owning importer.",
  );
  assert(
    boundaryForms.length === 2 &&
      boundaryForms.every(
        (form) =>
          !form.isEvolutionStub && form.regionKey === "HOENN" && form.species.generation === 3,
      ),
    "Adjacent Gen3 boundary forms were not materialized as owning-batch forms.",
  );
  assert(
    roserade?.formKey === "SINNOH" &&
      roserade.formNameEn === "Sinnoh" &&
      roserade.formNameZhTw === "神奧" &&
      roserade.regionKey === "SINNOH" &&
      !roserade.isEvolutionStub &&
      roserade.evolvesFromFormId === "315-hoenn" &&
      roserade.species.generation === 4 &&
      roserade.species.familyKey === "HOENN_FAMILY_315",
    "Canonical Roserade form did not transition to its owning Gen4 identity.",
  );
  assert(
    roseradeEdges.length === 1 && !legacyRoseradeStub,
    "Roserade has a legacy form or a non-unique canonical evolution edge.",
  );

  const workbook = await buildExportWorkbook(prisma);
  assert(workbook.worksheets.length === 10, "Published workbook must contain 10 worksheets.");
  console.log(
    JSON.stringify(
      {
        dashboardRows: dashboard.length,
        gen4Rows: gen4Rows.length,
        gen4Forms: actualGen4FormIds.size,
        homeFamilies: home.families.length,
        auditRows: audit.rows.length,
        reviewIssues: review.length,
        sources: sources.length,
        workbookSheets: workbook.worksheets.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
