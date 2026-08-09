import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

type Family = ReturnType<typeof buildFamilyOverviews>[number];
type Dashboard = Awaited<ReturnType<typeof getDashboardRows>>;

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
}

function memberIds(family: Family | undefined) {
  return family?.members.map((member) => member.form.formId) ?? [];
}

function checkFamily(
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

function formRows(rows: Dashboard, formId: string) {
  return rows.filter((row) => row.formId === formId);
}

export async function runReview(batch: "252-281" | "282-311" | "312-386") {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const batchStart = Number(batch.slice(0, 3));
  const batchEnd = Number(batch.slice(4, 7));
  const rows = allRows.filter((row) => row.dexNumber >= batchStart && row.dexNumber <= batchEnd);
  const allForms = buildFormOverviews(allRows);
  const families = buildFamilyOverviews(allForms).filter((family) =>
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
  const checks = [
    {
      name: "正式豐緣型態",
      result: [...new Set(rows.map((row) => row.formId))].every((formId) =>
        formRows(rows, formId).every(
          (row) =>
            row.formKey === "HOENN" &&
            row.regionKey === "HOENN" &&
            row.formNameZhTw === "豐緣",
        ),
      )
        ? "PASS"
        : "FAIL",
    },
  ];
  if (batch === "252-281") {
    checks.push(
      checkFamily(
        families,
        "Wurmple branch",
        "265-hoenn",
        ["265-hoenn", "266-hoenn", "267-hoenn", "268-hoenn", "269-hoenn"],
      ),
    );
  }
  const raltsRow = allRows.find((row) => row.id === "281-hoenn-normal");
  checks.push({
    name: "Ralts family Gallade stub",
    result:
      raltsRow?.evolutionPaths.some(
        (path) => path.toFormId === "475-other" && path.isEvolutionStub,
      )
        ? "PASS"
        : "FAIL",
  });

  if (batch === "282-311") {
    checks.push(
      checkFamily(
        families,
        "Nincada special family",
        "290-hoenn",
        ["290-hoenn", "291-hoenn"],
      ),
      checkFamily(families, "Azurill merge", "298-hoenn", [
        "298-hoenn",
        "183-johto",
        "184-johto",
      ]),
    );
    const nincada = formRows(allRows, "290-hoenn").find((row) => row.variantKey === "NORMAL");
    checks.push({
      name: "Shedinja special acquisition boundary",
      result:
        nincada?.evolutionPaths.some((path) => path.toFormId === "291-hoenn") &&
        !nincada.evolutionPaths.some((path) => path.toFormId === "292-hoenn")
          ? "PASS"
          : "FAIL",
    });
    const nosepass = formRows(allRows, "299-hoenn").find((row) => row.variantKey === "NORMAL");
    checks.push({
      name: "Probopass stub",
      result: nosepass?.evolutionPaths.some((path) => path.toFormId === "476-other" && path.isEvolutionStub)
        ? "PASS"
        : "FAIL",
    });
  }
  if (batch === "312-386") {
    checks.push(
      checkFamily(families, "Wynaut merge", "360-hoenn", ["360-hoenn", "202-johto"]),
      checkFamily(families, "Clamperl branches", "366-hoenn", ["366-hoenn", "367-hoenn", "368-hoenn"]),
    );
    for (const [name, formId, targetId] of [
      ["Roserade evolution stub", "315-hoenn", "407-other"],
      ["Dusknoir evolution stub", "356-hoenn", "477-other"],
      ["Froslass evolution stub", "361-hoenn", "478-other"],
    ] as const) {
      const row = formRows(allRows, formId).find((item) => item.variantKey === "NORMAL");
      checks.push({
        name,
        result: row?.evolutionPaths.some((path) => path.toFormId === targetId && path.isEvolutionStub)
          ? "PASS"
          : "FAIL",
      });
    }
  }
  const megaIds = batch === "252-281"
    ? ["254-hoenn", "257-hoenn"]
    : batch === "282-311"
      ? ["282-hoenn", "302-hoenn", "303-hoenn", "306-hoenn", "308-hoenn", "310-hoenn"]
      : [
        "319-hoenn", "323-hoenn", "334-hoenn", "354-hoenn", "359-hoenn", "362-hoenn",
        "373-hoenn", "376-hoenn", "380-hoenn", "381-hoenn", "382-hoenn", "383-hoenn", "384-hoenn",
      ];
  checks.push({
    name: "Mega release boundaries",
    result: megaIds.every((formId) =>
      rows.some((row) => row.id === formId + "-mega" && row.releaseStatus === "RELEASED"),
    )
      ? "PASS"
      : "FAIL",
  });
  checks.push({
    name: "無真正待補資料",
    result: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING") ? "PASS" : "FAIL",
  });
  if (checks.some((check) => check.result !== "PASS")) {
    throw new Error(
      "#" + batch + " integration checks failed: " +
      checks.filter((check) => check.result !== "PASS").map((check) => check.name).join(", "),
    );
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
    formalHoennForms: {
      result: checks[0].result,
      forms: [...new Set(rows.map((row) => row.formId))],
    },
    crossBatchIntegration: {
      result: checks.every((check) => check.result === "PASS") ? "PASS" : "FAIL",
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
    "# Pokémon GO Retention Guide #" + batch + " integration review",
    "",
    "- dataVersion: " + payload.dataVersion,
    "- rulesVersion: " + payload.rulesVersion,
    "- scope: " + payload.counts.species + " species / " + payload.counts.forms +
      " forms / " + payload.counts.battleVariants + " battle variants / " +
      payload.counts.families + " families",
    "- status: " + payload.status,
    "- TRUE_DATA_PENDING: " + payload.counts.trueDataPending,
    "",
    "## Gen 3 integration checks",
    "",
    ...checks.map((check) => "- " + check.name + ": " + check.result),
    "",
    "## Immediate family handling",
    "",
    ...payload.immediateHandling.map(
      (item) => "- " + item.familyId + ": " + item.strategy + "; " + item.conclusion,
    ),
  ];
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/" + batch + ".json",
    JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n") + "\r\n",
    "utf8",
  );
  await writeFile("review/" + batch + ".md", lines.join("\r\n") + "\r\n", "utf8");
  console.log(JSON.stringify({ batch, dataVersion: payload.dataVersion, counts: payload.counts }, null, 2));
}
