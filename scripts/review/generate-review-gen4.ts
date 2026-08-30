import { mkdir, writeFile } from "node:fs/promises";
import { getBatchByKey } from "../../src/config/batch-registry";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../../src/config/release";
import { getGen4BatchDefinition } from "../../src/data/batch-gen4";
import { getDashboardRows, getReviewIssues } from "../../src/lib/data-prisma";
import { buildFamilyOverviews } from "../../src/presentation/family-overview";
import { buildFormOverviews } from "../../src/presentation/form-overview";
import { RULES_VERSION } from "../../src/rules/rules";

type Family = ReturnType<typeof buildFamilyOverviews>[number];

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) => family.members.some((member) => member.form.formId === formId));
}

function expectedReleasedVariants(definition: ReturnType<typeof getGen4BatchDefinition>) {
  const base = definition.forms.reduce(
    (count, form) =>
      count +
      Number(definition.releasedNormalForms.has(form.id)) +
      Number(definition.releasedShadowForms.has(form.id)) * 2 +
      Number(definition.releasedDynamaxForms.has(form.id)),
    0,
  );
  const special = definition.specialVariants.filter((variant) => variant.released).length;
  return base + special;
}

export async function generateGen4Review(batch: string) {
  const entry = getBatchByKey(batch);
  if (entry.import.adapter !== "gen4") throw new Error(`Batch ${batch} is not owned by Gen4.`);
  const definition = getGen4BatchDefinition(batch);
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter(
    (row) => row.dexNumber >= entry.minDex && row.dexNumber <= entry.maxDex,
  );
  const forms = buildFormOverviews(allRows);
  const allFamilies = buildFamilyOverviews(forms);
  const families = allFamilies.filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= entry.minDex && member.form.dexNumber <= entry.maxDex,
    ),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === batch);
  const formIds = new Set(rows.map((row) => row.formId));
  const species = new Set(rows.map((row) => row.dexNumber));
  const expectedFormIds = new Set(definition.forms.map((form) => form.id));
  const expectedRows = definition.forms.length * 4 + definition.specialVariants.length;
  const formFamilyCoverage = [...expectedFormIds].every((formId) =>
    Boolean(familyWithMember(allFamilies, formId)),
  );
  const checks = [
    {
      name: "Gen 4 canonical form identity",
      result:
        rows.every((row) => row.regionKey === "SINNOH") &&
        formIds.size === expectedFormIds.size &&
        [...expectedFormIds].every((formId) => formIds.has(formId))
          ? "PASS"
          : "FAIL",
    },
    {
      name: "Gen 4 batch boundary counts",
      result:
        species.size === entry.maxDex - entry.minDex + 1 && rows.length === expectedRows
          ? "PASS"
          : "FAIL",
    },
    {
      name: "Gen 4 released variant boundary",
      result:
        rows.filter((row) => row.releaseStatus === "RELEASED").length ===
        expectedReleasedVariants(definition)
          ? "PASS"
          : "FAIL",
    },
    {
      name: "Owning batch family coverage",
      result: formFamilyCoverage ? "PASS" : "FAIL",
    },
    {
      name: "No current true data pending",
      result: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING")
        ? "PASS"
        : "FAIL",
    },
  ] as const;
  const failedChecks = checks.filter((check) => check.result !== "PASS");
  if (failedChecks.length) {
    throw new Error(
      `Gen4 ${batch} review checks failed: ${failedChecks.map((check) => check.name).join(", ")}`,
    );
  }

  const strategies = ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"];
  const strategyCounts = Object.fromEntries(
    strategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
  const trueDataPending = rows.filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING");
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
      family.retentionStrategy === "HOLD_FOR_NOW" ? null : "傳送前請個別核對 IV 與用途條件。",
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
    canonicalForms: { result: checks[0].result, forms: [...formIds].sort() },
    crossBatchIntegration: { result: "PASS", checks },
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
    "## Generic Gen 4 integration checks",
    "",
    ...checks.map((check) => `- ${check.name}: ${check.result}`),
    "",
    "## Immediate family handling",
    "",
    ...immediateHandling.map((item) => `- ${item.familyId}: ${item.strategy}; ${item.conclusion}`),
  ];
  await mkdir("review", { recursive: true });
  await writeFile(
    `review/${batch}.json`,
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile(`review/${batch}.md`, `${lines.join("\r\n")}\r\n`, "utf8");
  return payload;
}

async function main() {
  const batch = process.argv[2];
  if (!batch || process.argv.length > 3)
    throw new Error("Usage: tsx scripts/review/generate-review-gen4.ts <registered Gen4 batch>.");
  const payload = await generateGen4Review(batch);
  console.log(
    JSON.stringify({ batch, dataVersion: DATA_VERSION, counts: payload.counts }, null, 2),
  );
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/review/generate-review-gen4.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
