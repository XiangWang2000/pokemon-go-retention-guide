import { readFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { RULES_VERSION } from "../src/rules/rules";

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

const batchFiles = [
  ["001-030", "review/001-030.json"],
  ["031-060", "review/031-060.json"],
  ["061-090", "review/061-090.json"],
  ["091-120", "review/091-120.json"],
  ["121-151", "review/121-151.json"],
] as const;

async function loadJson(path: string) {
  return JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, "")) as ReviewPayload;
}

function count(payload: ReviewPayload, key: string) {
  const value = payload.counts?.[key];
  return typeof value === "number" ? value : null;
}

function checkVersion(payload: ReviewPayload, path: string, errors: string[]) {
  if (payload.dataVersion !== DATA_VERSION) {
    errors.push(`${path}: stale dataVersion ${String(payload.dataVersion)}.`);
  }
  if (payload.updatedAt !== DATA_VERSION_DATE_ISO) {
    errors.push(`${path}: stale updatedAt ${String(payload.updatedAt)}.`);
  }
  if (payload.rulesVersion !== RULES_VERSION) {
    errors.push(`${path}: stale rulesVersion ${String(payload.rulesVersion)}.`);
  }
}

async function main() {
  const errors: string[] = [];
  const [rows, issues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const families = buildFamilyOverviews(buildFormOverviews(rows));
  const familyById = new Map(families.map((family) => [family.familyId, family]));

  for (const [batch, path] of batchFiles) {
    const payload = await loadJson(path);
    checkVersion(payload, path, errors);
    if (payload.batch !== batch) errors.push(`${path}: wrong batch label.`);

    const batchIssues = issues.filter((issue) => issue.batchKey === batch);
    const expectedSafetyIssues = batchIssues.filter((issue) => issue.affectsFinalDecision).length;
    const issueCountKey = batch === "001-030" ? "openReviewIssues" : "openIssues";
    if (count(payload, issueCountKey) !== batchIssues.length) {
      errors.push(`${path}: open issue count does not match runtime data.`);
    }
    if (batch !== "001-030" && count(payload, "safetyAffectingIssues") !== expectedSafetyIssues) {
      errors.push(`${path}: safety-affecting issue count does not match runtime data.`);
    }

    if (batch === "001-030") {
      const expectedRows = rows.filter((row) => row.dexNumber >= 1 && row.dexNumber <= 30);
      const decisionRows = Object.values(payload.decisions ?? {}).flat();
      const seen = new Set<string>();
      for (const item of decisionRows) {
        if (!item.id || seen.has(item.id))
          errors.push(`${path}: duplicate or missing decision row.`);
        seen.add(item.id ?? "");
        if (!rows.some((row) => row.id === item.id))
          errors.push(`${path}: unknown decision row ${item.id}.`);
      }
      if (seen.size !== expectedRows.length)
        errors.push(`${path}: decision row count does not match runtime data.`);
      for (const row of expectedRows) {
        if (!seen.has(row.id)) errors.push(`${path}: missing decision row ${row.id}.`);
      }
      continue;
    }

    const expectedFamilies = families.filter((family) =>
      family.members.some(
        (member) =>
          member.form.dexNumber >= Number(batch.slice(0, 3)) &&
          member.form.dexNumber <= Number(batch.slice(4, 7)),
      ),
    );
    const handling = payload.immediateHandling ?? [];
    const seenFamilyIds = new Set<string>();
    for (const item of handling) {
      const familyId = item.familyId ?? "";
      if (!familyId || seenFamilyIds.has(familyId)) {
        errors.push(`${path}: duplicate or missing immediateHandling family.`);
        continue;
      }
      seenFamilyIds.add(familyId);
      const family = familyById.get(familyId);
      if (!family) {
        errors.push(`${path}: unknown family ${familyId}.`);
        continue;
      }
      if (item.strategy !== family.retentionStrategy) {
        errors.push(`${path}: stale strategy for ${familyId}.`);
      }
      if (item.conclusion !== family.handlingSummaryZhTw) {
        errors.push(`${path}: stale conclusion for ${familyId}.`);
      }
    }
    if (seenFamilyIds.size !== expectedFamilies.length) {
      errors.push(`${path}: immediateHandling family count does not match runtime data.`);
    }
    for (const family of expectedFamilies) {
      if (!seenFamilyIds.has(family.familyId))
        errors.push(`${path}: missing family ${family.familyId}.`);
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
      errors.push(`${path}: scoped holds do not match runtime family strategies.`);
    }
  }

  const recalibrationPath = "review/001-151-recalibration.json";
  const recalibration = await loadJson(recalibrationPath);
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
  console.log(
    JSON.stringify(
      {
        dataVersion: DATA_VERSION,
        batches: batchFiles.length,
        families: families.length,
        openIssues: issues.length,
        safetyAffectingIssues: issues.filter((issue) => issue.affectsFinalDecision).length,
        trueDataPending: expectedPending.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
