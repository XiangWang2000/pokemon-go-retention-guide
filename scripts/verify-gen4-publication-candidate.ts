import "dotenv/config";
import { buildExportWorkbook } from "../src/export/excel";
import { forms387416 } from "../src/data/batch-387-416";
import {
  getDashboardRows,
  getReviewIssues,
  getSources,
  getVariantDetailMeta,
} from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { buildAuditSummary } from "../src/lib/audit-data";
import { buildHomeSnapshot } from "../src/presentation/home-snapshot";
import { buildHomeSummary } from "../src/presentation/home-summary";

const candidateDataVersion = "gen4-publication-candidate";
const candidateDataAsOf = "2026-08-13T00:00:00.000Z";

try {
  const [dashboard, review, sources] = await Promise.all([
    getDashboardRows(),
    getReviewIssues(),
    getSources(),
  ]);

  if (dashboard.length !== 1912) {
    throw new Error(`Publication candidate expected 1912 dashboard rows, found ${dashboard.length}.`);
  }

  const gen4Rows = dashboard.filter((row) => row.dexNumber >= 387 && row.dexNumber <= 416);
  if (gen4Rows.length !== 136) {
    throw new Error(`Publication candidate expected 136 Gen4 rows, found ${gen4Rows.length}.`);
  }

  const expectedGen4FormIds = new Set(forms387416.map((form) => form.id));
  const actualGen4FormIds = new Set(gen4Rows.map((row) => row.formId));
  if (
    actualGen4FormIds.size !== expectedGen4FormIds.size ||
    [...expectedGen4FormIds].some((formId) => !actualGen4FormIds.has(formId))
  ) {
    throw new Error(
      `Publication candidate Gen4 forms differ from canonical batch: expected ${expectedGen4FormIds.size}, found ${actualGen4FormIds.size}.`,
    );
  }
  if (gen4Rows.some((row) => row.regionKey !== "SINNOH")) {
    throw new Error("Publication candidate contains a #387-#416 dashboard row outside region SINNOH.");
  }

  const home = buildHomeSnapshot(dashboard, candidateDataAsOf, candidateDataVersion);
  const homeSummary = buildHomeSummary(home);
  const audit = buildAuditSummary(dashboard, candidateDataAsOf);

  const homeFormIds = new Set(
    home.families.flatMap((family) => family.members.map((member) => member.form.formId)),
  );
  const missingHomeForms = [...expectedGen4FormIds].filter((formId) => !homeFormIds.has(formId));
  if (missingHomeForms.length) {
    throw new Error(`Home snapshot is missing Gen4 forms: ${missingHomeForms.join(", ")}.`);
  }

  const roseliaFamily = home.families.find((family) => family.familyKey === "HOENN_FAMILY_315");
  const roseliaFamilyForms = new Set(
    roseliaFamily?.members.map((member) => member.form.formId) ?? [],
  );
  for (const formId of ["315-hoenn", "406-sinnoh", "407-sinnoh"]) {
    if (!roseliaFamilyForms.has(formId)) {
      throw new Error(`Cross-generation Roselia family is missing ${formId}.`);
    }
  }

  if (audit.rows.length !== dashboard.length) {
    throw new Error(
      `Audit summary row count ${audit.rows.length} does not match dashboard ${dashboard.length}.`,
    );
  }
  if (!JSON.stringify(homeSummary).includes(candidateDataVersion)) {
    throw new Error("Home summary did not retain the Gen4 candidate data version.");
  }

  for (const row of gen4Rows) {
    const detail = await getVariantDetailMeta(row.formId, row.id, row.evaluationId);
    if (!detail) {
      throw new Error(`Missing detail payload for Gen4 variant ${row.id}.`);
    }
  }

  const workbook = await buildExportWorkbook(prisma);
  if (workbook.worksheets.length !== 10) {
    throw new Error(`Publication candidate workbook expected 10 sheets, found ${workbook.worksheets.length}.`);
  }

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
} finally {
  await prisma.$disconnect();
}
