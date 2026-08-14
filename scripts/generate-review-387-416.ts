import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

const batch = "387-416";
const minDex = 387;
const maxDex = 416;
const expectedCloakForms = [
  "412-plant-cloak",
  "412-sandy-cloak",
  "412-trash-cloak",
  "413-plant-cloak",
  "413-sandy-cloak",
  "413-trash-cloak",
];

type Family = ReturnType<typeof buildFamilyOverviews>[number];

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
}

function memberIds(family: Family | undefined) {
  return new Set(family?.members.map((member) => member.form.formId) ?? []);
}

function includesAll(values: Set<string>, expected: string[]) {
  return expected.every((value) => values.has(value));
}

async function main() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= minDex && row.dexNumber <= maxDex);
  const forms = buildFormOverviews(allRows);
  const allFamilies = buildFamilyOverviews(forms);
  const families = allFamilies.filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= minDex && member.form.dexNumber <= maxDex,
    ),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === batch);
  const formIds = new Set(rows.map((row) => row.formId));
  const species = new Set(rows.map((row) => row.dexNumber));

  const roseliaFamily = familyWithMember(allFamilies, "406-sinnoh");
  const roseliaMembers = memberIds(roseliaFamily);
  const burmyFamily = familyWithMember(allFamilies, "412-plant-cloak");
  const burmyMembers = memberIds(burmyFamily);
  const combeeFamily = familyWithMember(allFamilies, "415-sinnoh");
  const combeeMembers = memberIds(combeeFamily);

  const checks = [
    {
      name: "Gen 4 Sinnoh form identity",
      result:
        rows.every((row) => row.regionKey === "SINNOH") &&
        expectedCloakForms.every((formId) => formIds.has(formId)) &&
        !formIds.has("407-other")
          ? "PASS"
          : "FAIL",
    },
    {
      name: "Gen 4 batch boundary counts",
      result:
        species.size === 30 && formIds.size === 34 && rows.length === 136
          ? "PASS"
          : "FAIL",
    },
    {
      name: "Gen 4 released variant boundary",
      result: rows.filter((row) => row.releaseStatus === "RELEASED").length === 78 ? "PASS" : "FAIL",
    },
    {
      name: "Budew Roselia Roserade cross-generation family",
      result: includesAll(roseliaMembers, ["406-sinnoh", "315-hoenn", "407-sinnoh"])
        ? "PASS"
        : "FAIL",
    },
    {
      name: "Burmy cloak and Mothim family branches",
      result: includesAll(burmyMembers, [...expectedCloakForms, "414-sinnoh"]) ? "PASS" : "FAIL",
    },
    {
      name: "Combee Vespiquen family",
      result: includesAll(combeeMembers, ["415-sinnoh", "416-sinnoh"]) ? "PASS" : "FAIL",
    },
    {
      name: "No legacy Roserade stub",
      result: allRows.every((row) => row.formId !== "407-other") ? "PASS" : "FAIL",
    },
    {
      name: "No true data pending",
      result: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING") ? "PASS" : "FAIL",
    },
  ] as const;

  const failedChecks = checks.filter((check) => check.result !== "PASS");
  if (failedChecks.length) {
    throw new Error(
      `#${batch} integration checks failed: ${failedChecks.map((check) => check.name).join(", ")}`,
    );
  }

  const strategies = ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"];
  const strategyCounts = Object.fromEntries(
    strategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
  const trueDataPending = rows.filter(
    (row) => row.assessmentDisposition === "TRUE_DATA_PENDING",
  );
  const scopedHolds = families
    .filter((family) => family.retentionStrategy === "HOLD_FOR_NOW")
    .map((family) => ({
      familyId: family.familyId,
      members: family.members.map((member) => member.form.formId),
    }));
  const immediateHandling = families.map((family) => ({
    familyId: family.familyId,
    strategy: family.retentionStrategy,
    conclusion: family.handlingSummaryZhTw,
    transferLine:
      family.retentionStrategy === "HOLD_FOR_NOW"
        ? null
        : "Review individual IV and use conditions before transferring.",
  }));

  const payload = {
    batch,
    updatedAt: DATA_VERSION_DATE_ISO,
    dataVersion: DATA_VERSION,
    rulesVersion: RULES_VERSION,
    status: issues.some((issue) => issue.affectsFinalDecision)
      ? "ACCEPTED_WITH_SCOPED_HOLDS"
      : "ACCEPTED",
    counts: {
      species: species.size,
      forms: formIds.size,
      battleVariants: rows.length,
      families: families.length,
      strategyCounts,
      openIssues: issues.length,
      safetyAffectingIssues: issues.filter((issue) => issue.affectsFinalDecision).length,
      trueDataPending: trueDataPending.length,
    },
    formalSinnohForms: {
      result: checks[0].result,
      forms: [...formIds].sort(),
    },
    crossBatchIntegration: {
      result: "PASS",
      checks,
    },
    scopedHolds,
    immediateHandling,
  };

  const lines = [
    `# Pokémon GO Retention Guide #${batch} integration review`,
    "",
    `- dataVersion: ${payload.dataVersion}`,
    `- rulesVersion: ${payload.rulesVersion}`,
    `- scope: ${payload.counts.species} species / ${payload.counts.forms} forms / ${payload.counts.battleVariants} battle variants / ${payload.counts.families} families`,
    `- status: ${payload.status}`,
    `- TRUE_DATA_PENDING: ${payload.counts.trueDataPending}`,
    "",
    "## Gen 4 integration checks",
    "",
    ...checks.map((check) => `- ${check.name}: ${check.result}`),
    "",
    "## Immediate family handling",
    "",
    ...immediateHandling.map(
      (item) => `- ${item.familyId}: ${item.strategy}; ${item.conclusion}`,
    ),
  ];

  await mkdir("review", { recursive: true });
  await writeFile(
    `review/${batch}.json`,
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile(`review/${batch}.md`, `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(JSON.stringify({ batch, dataVersion: DATA_VERSION, counts: payload.counts }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
