import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

const batchStart = 212;
const batchEnd = 241;
const batch = "212-241";
type Family = ReturnType<typeof buildFamilyOverviews>[number];

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
}

function memberIds(family: Family | undefined) {
  return family?.members.map((member) => member.form.formId) ?? [];
}

function migrationCheck(
  families: Family[],
  name: string,
  formId: string,
  expected: string[],
) {
  const family = familyWithMember(families, formId);
  const members = new Set(memberIds(family));
  return {
    familyId: family?.familyId,
    name,
    members: [...members],
    result: family && expected.every((id) => members.has(id)) ? "PASS" : "FAIL",
  };
}

async function main() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= batchStart && row.dexNumber <= batchEnd);
  const families = buildFamilyOverviews(buildFormOverviews(allRows)).filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= batchStart && member.form.dexNumber <= batchEnd,
    ),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === batch);
  const strategies = ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"];
  const strategyCounts = Object.fromEntries(
    strategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
  const migrations = [
    migrationCheck(families, "Scizor", "212-johto", ["123-kanto", "212-johto"]),
    migrationCheck(families, "Kingdra", "230-johto", ["117-kanto", "230-johto"]),
    migrationCheck(families, "Porygon2", "233-johto", ["137-kanto", "233-johto"]),
    migrationCheck(families, "Tyrogue branch", "237-johto", ["106-kanto", "107-kanto", "236-johto", "237-johto"]),
    migrationCheck(families, "Smoochum baby", "238-johto", ["124-kanto", "238-johto"]),
    migrationCheck(families, "Elekid baby", "239-johto", ["125-kanto", "239-johto"]),
    migrationCheck(families, "Magby baby", "240-johto", ["126-kanto", "240-johto"]),
  ];
  const oldKantoForms = rows.filter((row) =>
    [212, 230, 233].includes(row.dexNumber) && row.formId.endsWith("-kanto"),
  );
  const versionBoundaries = {
    formalJohtoForms: oldKantoForms.length === 0,
    releasedMegaForms: [212, 214, 227, 229].every(
      (dex) => rows.some((row) => row.id === `${String(dex).padStart(3, "0")}-johto-mega` && row.releaseStatus === "RELEASED"),
    ),
    releasedMaxForms: [213, 237].every(
      (dex) => rows.some((row) => row.id === `${String(dex).padStart(3, "0")}-johto-dynamax` && row.releaseStatus === "RELEASED"),
    ),
    noTrueDataPending: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING"),
  };
  const integrationChecks = [
    ...migrations.map((check) => check.result),
    ...Object.values(versionBoundaries).map((value) => (value ? "PASS" : "FAIL")),
  ];
  if (integrationChecks.some((result) => result !== "PASS")) {
    throw new Error(`#${batch} integration checks failed: ${integrationChecks.join(", ")}`);
  }
  const trueDataPending = rows.filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING");
  const payload = {
    batch,
    updatedAt: DATA_VERSION_DATE_ISO,
    dataVersion: DATA_VERSION,
    rulesVersion: RULES_VERSION,
    status: issues.some((issue) => issue.affectsFinalDecision)
      ? "ACCEPTED_WITH_SCOPED_HOLDS"
      : "ACCEPTED",
    counts: {
      species: new Set(rows.map((row) => row.dexNumber)).size,
      forms: new Set(rows.map((row) => row.formId)).size,
      battleVariants: rows.length,
      families: families.length,
      strategyCounts,
      openIssues: issues.length,
      safetyAffectingIssues: issues.filter((issue) => issue.affectsFinalDecision).length,
      trueDataPending: trueDataPending.length,
    },
    formalJohtoMigrations: migrations,
    versionBoundaries,
    crossBatchIntegration: {
      result: integrationChecks.every((result) => result === "PASS") ? "PASS" : "FAIL",
      checkedFamilies: migrations.map((check) => check.name),
    },
    scopedHolds: families
      .filter((family) => family.retentionStrategy === "HOLD_FOR_NOW")
      .map((family) => ({
        familyId: family.familyId,
        members: family.members.map((member) => member.form.formId),
      })),
    immediateHandling: families.map((family) => ({
      familyId: family.familyId,
      strategy: family.retentionStrategy,
      conclusion: family.handlingSummaryZhTw,
      transferLine:
        family.retentionStrategy === "HOLD_FOR_NOW"
          ? null
          : "Review individual IV and use conditions before transferring.",
    })),
  };
  const lines = [
    `# Pokemon GO Retention Guide #${batch} integration review`,
    "",
    `- dataVersion: ${payload.dataVersion}`,
    `- rulesVersion: ${payload.rulesVersion}`,
    `- scope: ${payload.counts.species} species / ${payload.counts.forms} forms / ${payload.counts.battleVariants} battle variants / ${payload.counts.families} families`,
    `- status: ${payload.status}`,
    `- TRUE_DATA_PENDING: ${payload.counts.trueDataPending}`,
    "",
    "## Formal JOHTO stub migrations",
    "",
    ...migrations.map((check) => `- ${check.name}: ${check.result}`),
    "",
    "## Immediate family handling",
    "",
    ...payload.immediateHandling.map(
      (item) => `- ${item.familyId}: ${item.strategy}; ${item.conclusion}`,
    ),
  ];
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/212-241.json",
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile("review/212-241.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(JSON.stringify({ batch, dataVersion: payload.dataVersion, counts: payload.counts }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
