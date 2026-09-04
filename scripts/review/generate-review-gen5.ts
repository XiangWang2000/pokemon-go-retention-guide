import { mkdir, writeFile } from "node:fs/promises";
import { getBatchByKey } from "../../src/config/batch-registry";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../../src/config/release";
import { getGen5BatchDefinition } from "../../src/data/batch-gen5";
import { getDashboardRows, getReviewIssues } from "../../src/lib/data-prisma";
import { buildFamilyOverviews } from "../../src/presentation/family-overview";
import { buildFormOverviews } from "../../src/presentation/form-overview";
import { RULES_VERSION } from "../../src/rules/rules";

const baseVariants = ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const;
const specialVariants = ["MEGA", "GIGANTAMAX"] as const;

function expectedCounts(definition: ReturnType<typeof getGen5BatchDefinition>) {
  let battleVariants = 0;
  let released = 0;
  let unknown = 0;
  for (const form of definition.forms) {
    for (const variant of baseVariants) {
      battleVariants += 1;
      const status = definition.releaseEvidenceForVariant(form.id, variant).status;
      released += Number(status === "RELEASED");
      unknown += Number(status === "UNKNOWN");
    }
    for (const variant of specialVariants) {
      const status = definition.releaseEvidenceForVariant(form.id, variant).status;
      if (status === "UNKNOWN") continue;
      battleVariants += 1;
      released += Number(status === "RELEASED");
    }
  }
  return { battleVariants, released, unknown };
}

export async function generateGen5Review(batch: string) {
  const entry = getBatchByKey(batch);
  if (entry.import.adapter !== "gen5") throw new Error(`Batch ${batch} is not owned by Gen5.`);
  const definition = getGen5BatchDefinition(batch);
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= entry.minDex && row.dexNumber <= entry.maxDex);
  const forms = buildFormOverviews(allRows);
  const families = buildFamilyOverviews(forms).filter((family) => family.members.some((member) => member.form.dexNumber >= entry.minDex && member.form.dexNumber <= entry.maxDex));
  const issues = allIssues.filter((issue) => issue.batchKey === batch);
  const expected = expectedCounts(definition);
  const actualFormIds = new Set(rows.map((row) => row.formId));
  const expectedFormIds = new Set(definition.forms.map((form) => form.id));
  const checks = [
    { name: "Gen5 exact form identity", result: actualFormIds.size === expectedFormIds.size && [...expectedFormIds].every((id) => actualFormIds.has(id)) ? "PASS" : "FAIL" },
    { name: "Gen5 batch boundary counts", result: new Set(rows.map((row) => row.dexNumber)).size === entry.maxDex - entry.minDex + 1 && rows.length === expected.battleVariants ? "PASS" : "FAIL" },
    { name: "Gen5 exact release-state preservation", result: rows.filter((row) => row.releaseStatus === "RELEASED").length === expected.released && rows.filter((row) => row.releaseStatus === "UNKNOWN").length === expected.unknown ? "PASS" : "FAIL" },
    { name: "Gen5 no TRUE_DATA_PENDING", result: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING") ? "PASS" : "FAIL" },
    { name: "Gen5 owning-family coverage", result: [...expectedFormIds].every((formId) => families.some((family) => family.members.some((member) => member.form.formId === formId))) ? "PASS" : "FAIL" },
  ] as const;
  const failed = checks.filter((check) => check.result !== "PASS");
  if (failed.length) throw new Error(`Gen5 ${batch} review checks failed: ${failed.map((check) => check.name).join(", ")}`);
  const payload = {
    batch, updatedAt: DATA_VERSION_DATE_ISO, dataVersion: DATA_VERSION, rulesVersion: RULES_VERSION,
    status: issues.some((issue) => issue.affectsFinalDecision) ? "ACCEPTED_WITH_SCOPED_HOLDS" : "ACCEPTED",
    counts: {
      species: new Set(rows.map((row) => row.dexNumber)).size, forms: actualFormIds.size, battleVariants: rows.length, families: families.length,
      releasedVariants: rows.filter((row) => row.releaseStatus === "RELEASED").length,
      unknownReleaseVariants: rows.filter((row) => row.releaseStatus === "UNKNOWN").length,
      openIssues: issues.length, safetyAffectingIssues: issues.filter((issue) => issue.affectsFinalDecision).length,
      trueDataPending: rows.filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING").length,
    },
    exactForms: [...actualFormIds].sort(), checks,
    immediateHandling: families.map((family) => ({ familyId: family.familyId, strategy: family.retentionStrategy, conclusion: family.handlingSummaryZhTw })),
  };
  const lines = [
    `# Pokémon GO Retention Guide #${batch} Gen5 publication review`, "",
    `- dataVersion: ${payload.dataVersion}`, `- rulesVersion: ${payload.rulesVersion}`,
    `- scope: ${payload.counts.species} species / ${payload.counts.forms} forms / ${payload.counts.battleVariants} battle variants / ${payload.counts.families} families`,
    `- released variants: ${payload.counts.releasedVariants}`, `- UNKNOWN release variants: ${payload.counts.unknownReleaseVariants}`,
    `- status: ${payload.status}`, "", "## Gen5 exact-form publication checks", "",
    ...checks.map((check) => `- ${check.name}: ${check.result}`), "", "## Immediate family handling", "",
    ...payload.immediateHandling.map((item) => `- ${item.familyId}: ${item.strategy}; ${item.conclusion}`),
  ];
  await mkdir("review", { recursive: true });
  await writeFile(`review/${batch}.json`, `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`, "utf8");
  await writeFile(`review/${batch}.md`, `${lines.join("\r\n")}\r\n`, "utf8");
  return payload;
}

async function main() {
  const batch = process.argv[2];
  if (!batch || process.argv.length > 3) throw new Error("Usage: tsx scripts/review/generate-review-gen5.ts <registered Gen5 batch>.");
  const payload = await generateGen5Review(batch);
  console.log(JSON.stringify({ batch, dataVersion: DATA_VERSION, counts: payload.counts }, null, 2));
}
const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/review/generate-review-gen5.ts")) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
