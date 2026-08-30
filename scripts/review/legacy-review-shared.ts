import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../../src/lib/data-prisma";
import { prisma } from "../../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../../src/config/release";
import { buildFamilyOverviews } from "../../src/presentation/family-overview";
import { buildFormOverviews } from "../../src/presentation/form-overview";
import { RULES_VERSION } from "../../src/rules/rules";

type Family = ReturnType<typeof buildFamilyOverviews>[number];
type DashboardRow = Awaited<ReturnType<typeof getDashboardRows>>[number];
type ReviewIssue = Awaited<ReturnType<typeof getReviewIssues>>[number];
type LegacyScopedHold = { familyId: string; members: string[]; safetyImpact?: string };

export async function loadLegacyReviewContext(batch: string, minDex: number, maxDex: number) {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= minDex && row.dexNumber <= maxDex);
  const families = buildFamilyOverviews(buildFormOverviews(allRows)).filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= minDex && member.form.dexNumber <= maxDex,
    ),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === batch);
  return { rows, families, issues };
}

export function buildStrategyCounts(families: Family[]) {
  return Object.fromEntries(
    ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"].map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
}

export function buildLegacyReviewPayload<Extra extends Record<string, unknown>>(
  batch: string,
  rows: DashboardRow[],
  families: Family[],
  issues: ReviewIssue[],
  strategyCounts: Record<string, number>,
  extra: Extra,
  scopedHold: (family: Family) => LegacyScopedHold = (family) => ({
    familyId: family.familyId,
    members: family.members.map((member) => member.form.formId),
  }),
) {
  return {
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
    },
    ...extra,
    scopedHolds: families
      .filter((family) => family.retentionStrategy === "HOLD_FOR_NOW")
      .map(scopedHold),
    immediateHandling: families.map((family) => ({
      familyId: family.familyId,
      strategy: family.retentionStrategy,
      conclusion: family.handlingSummaryZhTw,
      transferLine: family.retentionStrategy === "HOLD_FOR_NOW" ? null : "其他普通重複可傳",
    })),
  };
}

export async function writeLegacyReview(batch: string, payload: object, lines: string[]) {
  await mkdir("review", { recursive: true });
  await writeFile(
    `review/${batch}.json`,
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile(`review/${batch}.md`, `${lines.join("\r\n")}\r\n`, "utf8");
}

export function runLegacyReview(main: () => Promise<void>) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
