import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { CURRENT_RELEASE_CONTRACT } from "../src/config/release-contract";
import { RULES_VERSION } from "../src/rules/rules";
import { BATCH_REGISTRY } from "../src/config/batch-registry";
import type { StaticDashboardRow, StaticReviewIssue } from "../src/lib/static-data";

type ReviewPayload = {
  batch?: string;
  dataVersion?: string;
  updatedAt?: string;
  rulesVersion?: string;
  counts?: Record<string, unknown>;
  decisions?: Record<string, Array<{ id?: string }>>;
  immediateHandling?: Array<{
    familyId?: string;
    strategy?: string;
    conclusion?: string;
  }>;
  scopedHolds?: Array<{ familyId?: string }>;
  trueDataPending?: Array<{ id?: string }>;
};

async function loadJson<T>(filePath: string) {
  return JSON.parse((await readFile(filePath, "utf8")).replace(/^\uFEFF/, "")) as T;
}

function count(payload: ReviewPayload, key: string) {
  const value = payload.counts?.[key];
  return typeof value === "number" ? value : null;
}

function checkVersion(payload: ReviewPayload, path: string, errors: string[]) {
  if (payload.dataVersion !== CURRENT_RELEASE_CONTRACT.dataVersion) {
    errors.push(`${path}: stale dataVersion ${String(payload.dataVersion)}.`);
  }
  if (payload.updatedAt !== CURRENT_RELEASE_CONTRACT.dataAsOf) {
    errors.push(`${path}: stale updatedAt ${String(payload.updatedAt)}.`);
  }
  if (payload.rulesVersion !== RULES_VERSION) {
    errors.push(`${path}: stale rulesVersion ${String(payload.rulesVersion)}.`);
  }
}

export async function validateReviewConsistency({
  dataRoot: requestedDataRoot = process.cwd(),
  reviewRoot: requestedReviewRoot = requestedDataRoot,
}: {
  dataRoot?: string;
  reviewRoot?: string;
} = {}) {
  const dataRoot = path.resolve(requestedDataRoot);
  const reviewRoot = path.resolve(requestedReviewRoot);
  const errors: string[] = [];
  const [rows, issues] = await Promise.all([
    loadJson<StaticDashboardRow[]>(path.join(dataRoot, "site-data/dashboard.json")),
    loadJson<StaticReviewIssue[]>(path.join(dataRoot, "site-data/review.json")),
  ]);
  const families = buildFamilyOverviews(buildFormOverviews(rows));
  const familyById = new Map(families.map((family) => [family.familyId, family]));

  for (const entry of BATCH_REGISTRY) {
    const { key: batch, minDex, maxDex, review } = entry;
    const reviewPath = review.jsonPath;
    const isSeedBatch = entry.import.adapter === "seed";
    const payload = await loadJson<ReviewPayload>(path.join(reviewRoot, reviewPath));
    checkVersion(payload, reviewPath, errors);
    if (payload.batch !== batch) errors.push(`${reviewPath}: wrong batch label.`);

    const batchIssues = issues.filter((issue) => issue.batchKey === batch);
    const expectedSafetyIssues = batchIssues.filter((issue) => issue.affectsFinalDecision).length;
    const issueCountKey = isSeedBatch ? "openReviewIssues" : "openIssues";
    if (count(payload, issueCountKey) !== batchIssues.length) {
      errors.push(`${reviewPath}: open issue count does not match runtime data.`);
    }
    if (!isSeedBatch && count(payload, "safetyAffectingIssues") !== expectedSafetyIssues) {
      errors.push(`${reviewPath}: safety-affecting issue count does not match runtime data.`);
    }

    if (isSeedBatch) {
      const expectedRows = rows.filter((row) => row.dexNumber >= minDex && row.dexNumber <= maxDex);
      const decisionRows = Object.values(payload.decisions ?? {}).flat();
      const seen = new Set<string>();
      for (const item of decisionRows) {
        if (!item.id || seen.has(item.id))
          errors.push(`${reviewPath}: duplicate or missing decision row.`);
        seen.add(item.id ?? "");
        if (!rows.some((row) => row.id === item.id))
          errors.push(`${reviewPath}: unknown decision row ${item.id}.`);
      }
      if (seen.size !== expectedRows.length)
        errors.push(`${reviewPath}: decision row count does not match runtime data.`);
      for (const row of expectedRows) {
        if (!seen.has(row.id)) errors.push(`${reviewPath}: missing decision row ${row.id}.`);
      }
      continue;
    }

    const expectedFamilies = families.filter((family) =>
      family.members.some(
        (member) => member.form.dexNumber >= minDex && member.form.dexNumber <= maxDex,
      ),
    );
    const handling = payload.immediateHandling ?? [];
    const seenFamilyIds = new Set<string>();
    for (const item of handling) {
      const familyId = item.familyId ?? "";
      if (!familyId || seenFamilyIds.has(familyId)) {
        errors.push(`${reviewPath}: duplicate or missing immediateHandling family.`);
        continue;
      }
      seenFamilyIds.add(familyId);
      const family = familyById.get(familyId);
      if (!family) {
        errors.push(`${reviewPath}: unknown family ${familyId}.`);
        continue;
      }
      if (item.strategy !== family.retentionStrategy) {
        errors.push(`${reviewPath}: stale strategy for ${familyId}.`);
      }
      if (item.conclusion !== family.handlingSummaryZhTw) {
        errors.push(`${reviewPath}: stale conclusion for ${familyId}.`);
      }
    }
    if (seenFamilyIds.size !== expectedFamilies.length) {
      errors.push(`${reviewPath}: immediateHandling family count does not match runtime data.`);
    }
    for (const family of expectedFamilies) {
      if (!seenFamilyIds.has(family.familyId))
        errors.push(`${reviewPath}: missing family ${family.familyId}.`);
    }
    const expectedHolds = new Set(
      expectedFamilies
        .filter((family) => family.retentionStrategy === "HOLD_FOR_NOW")
        .map((family) => family.familyId),
    );
    const actualHolds = new Set((payload.scopedHolds ?? []).map((item) => item.familyId ?? ""));
    if (
      expectedHolds.size !== actualHolds.size ||
      [...expectedHolds].some((id) => !actualHolds.has(id))
    ) {
      errors.push(`${reviewPath}: scoped holds do not match runtime family strategies.`);
    }
  }

  const recalibrationPath = CURRENT_RELEASE_CONTRACT.review.recalibrationJsonPath;
  const recalibration = await loadJson<ReviewPayload>(path.join(reviewRoot, recalibrationPath));
  checkVersion(recalibration, recalibrationPath, errors);
  const expectedPending = rows.filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING");
  if ((recalibration.trueDataPending?.length ?? 0) !== expectedPending.length) {
    errors.push(`${recalibrationPath}: TRUE_DATA_PENDING count does not match runtime data.`);
  }

  const highRiskForms = [
    "081-kanto",
    "111-kanto",
    "114-kanto",
    "123-kanto",
    "125-kanto",
    "126-kanto",
    "181-johto",
    "182-johto",
    "186-johto",
    "196-johto",
    "197-johto",
    "199-johto",
    "208-johto",
    "212-johto",
    "230-johto",
    "233-johto",
    "242-johto",
    "243-johto",
    "244-johto",
    "245-johto",
    "246-johto",
    "247-johto",
    "248-johto",
    "249-johto",
    "250-johto",
    "254-hoenn",
    "257-hoenn",
    "260-hoenn",
    "280-hoenn",
    "281-hoenn",
    "282-hoenn",
    "298-hoenn",
    "299-hoenn",
    "302-hoenn",
    "303-hoenn",
    "306-hoenn",
    "308-hoenn",
    "310-hoenn",
  ];
  for (const formId of highRiskForms) {
    const family = families.find((candidate) =>
      candidate.members.some((member) => member.form.formId === formId),
    );
    if (family?.retentionStrategy === "MOSTLY_TRANSFER") {
      errors.push(`High-risk evolution family ${formId} is still MOSTLY_TRANSFER.`);
    }
  }

  for (const issue of issues) {
    if (
      issue.affectsFinalDecision &&
      ["MISSING_SOURCE", "MISSING_PRIMARY_SOURCE", "OPTIONAL_DATA_MISSING"].includes(
        issue.issueType,
      )
    ) {
      errors.push(`Non-material source gap is still safety-affecting: ${issue.id}.`);
    }
    if (issue.affectsFinalDecision && issue.issueType === "MATERIAL_DATA_GAP") {
      if (issue.messageZhTw.length < 30 || issue.suggestedResearchActionZhTw.length < 20) {
        errors.push(`Material gap lacks an actionable explanation: ${issue.id}.`);
      }
    }
  }

  if (errors.length) throw new Error(`Review consistency failed:\n- ${errors.join("\n- ")}`);
  const summary = {
    dataVersion: CURRENT_RELEASE_CONTRACT.dataVersion,
    batches: BATCH_REGISTRY.length,
    families: families.length,
    openIssues: issues.length,
    safetyAffectingIssues: issues.filter((issue) => issue.affectsFinalDecision).length,
    trueDataPending: expectedPending.length,
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/validate-review-consistency.ts")) {
  validateReviewConsistency().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
