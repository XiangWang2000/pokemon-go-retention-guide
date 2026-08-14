import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

const batch = "342-371";
const minDex = 342;
const maxDex = 371;
type Family = ReturnType<typeof buildFamilyOverviews>[number];
type Dashboard = Awaited<ReturnType<typeof getDashboardRows>>;

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
}

function checkFamily(families: Family[], name: string, formId: string, expected: string[]) {
  const family = familyWithMember(families, formId);
  const members = new Set(family?.members.map((member) => member.form.formId) ?? []);
  return {
    name,
    result: family && expected.every((id) => members.has(id)) ? "PASS" : "FAIL",
  };
}

function formRows(rows: Dashboard, formId: string) {
  return rows.filter((row) => row.formId === formId);
}

export async function runReview342371Current() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= minDex && row.dexNumber <= maxDex);
  const allFamilies = buildFamilyOverviews(buildFormOverviews(allRows));
  const families = allFamilies.filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= minDex && member.form.dexNumber <= maxDex,
    ),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === batch);

  const checks: Array<{ name: string; result: string }> = [
    {
      name: "Gen 3 form identity",
      result: [...new Set(rows.map((row) => row.formId))].every((formId) =>
        formRows(rows, formId).every(
          (row) =>
            row.regionKey === "HOENN" &&
            (row.dexNumber === 351
              ? ["351-normal", "351-sunny", "351-rainy", "351-snowy"].includes(row.formId)
              : row.formKey === "HOENN" && row.formNameZhTw === "豐緣"),
        ),
      )
        ? "PASS"
        : "FAIL",
    },
  ];

  const ralts = allRows.find((row) => row.id === "281-hoenn-normal");
  checks.push({
    name: "Ralts family Gallade stub",
    result: ralts?.evolutionPaths.some(
      (path) => path.toFormId === "475-other" && path.isEvolutionStub,
    )
      ? "PASS"
      : "FAIL",
  });
  checks.push(
    checkFamily(families, "Wynaut merge", "360-hoenn", ["360-hoenn", "202-johto"]),
    checkFamily(families, "Clamperl branches", "366-hoenn", ["366-hoenn", "367-hoenn", "368-hoenn"]),
  );

  const roselia = formRows(allRows, "315-hoenn").find((row) => row.variantKey === "NORMAL");
  checks.push({
    name: "Roserade canonical Gen4 evolution",
    result: roselia?.evolutionPaths.some(
      (path) => path.toFormId === "407-sinnoh" && !path.isEvolutionStub,
    )
      ? "PASS"
      : "FAIL",
  });
  for (const [name, formId, targetId] of [
    ["Dusknoir evolution stub", "356-hoenn", "477-other"],
    ["Froslass evolution stub", "361-hoenn", "478-other"],
  ] as const) {
    const row = formRows(allRows, formId).find((item) => item.variantKey === "NORMAL");
    checks.push({
      name,
      result: row?.evolutionPaths.some(
        (path) => path.toFormId === targetId && path.isEvolutionStub,
      )
        ? "PASS"
        : "FAIL",
    });
  }

  const castformIds = ["351-normal", "351-sunny", "351-rainy", "351-snowy"];
  checks.push({
    name: "Castform alternate forms",
    result: castformIds.every((formId) => rows.some((row) => row.formId === formId))
      ? "PASS"
      : "FAIL",
  });
  const megaIds = ["354-hoenn", "359-hoenn", "362-hoenn"];
  checks.push({
    name: "Mega release boundaries",
    result: megaIds.every((formId) =>
      rows.some((row) => row.id === `${formId}-mega` && row.releaseStatus === "RELEASED"),
    )
      ? "PASS"
      : "FAIL",
  });
  checks.push({
    name: "無真正待補資料",
    result: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING")
      ? "PASS"
      : "FAIL",
  });

  const failed = checks.filter((check) => check.result !== "PASS");
  if (failed.length) {
    throw new Error(
      `#${batch} integration checks failed: ${failed.map((check) => check.name).join(", ")}`,
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
    formalHoennForms: {
      result: checks[0].result,
      forms: [...new Set(rows.map((row) => row.formId))],
    },
    crossBatchIntegration: {
      result: "PASS",
      checks,
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
    `# Pokémon GO Retention Guide #${batch} integration review`,
    "",
    `- dataVersion: ${payload.dataVersion}`,
    `- rulesVersion: ${payload.rulesVersion}`,
    `- scope: ${payload.counts.species} species / ${payload.counts.forms} forms / ${payload.counts.battleVariants} battle variants / ${payload.counts.families} families`,
    `- status: ${payload.status}`,
    `- TRUE_DATA_PENDING: ${payload.counts.trueDataPending}`,
    "",
    "## Gen 3 / Gen 4 integration checks",
    "",
    ...checks.map((check) => `- ${check.name}: ${check.result}`),
    "",
    "## Immediate family handling",
    "",
    ...payload.immediateHandling.map(
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
