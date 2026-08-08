import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

const batchStart = 152;
const batchEnd = 181;

type Family = ReturnType<typeof buildFamilyOverviews>[number];

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) =>
    family.members.some((member) => member.form.formId === formId),
  );
}

function memberIds(family: Family | undefined) {
  return family?.members.map((member) => member.form.formId) ?? [];
}

function hasMembers(family: Family | undefined, expected: string[]) {
  const actual = new Set(memberIds(family));
  return expected.every((formId) => actual.has(formId));
}

async function main() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter(
    (row) => row.dexNumber >= batchStart && row.dexNumber <= batchEnd,
  );
  const families = buildFamilyOverviews(buildFormOverviews(allRows)).filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= batchStart && member.form.dexNumber <= batchEnd,
    ),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === "152-181");
  const strategies = ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"];
  const strategyCounts = Object.fromEntries(
    strategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );

  const pichu = familyWithMember(families, "172-johto");
  const cleffa = familyWithMember(families, "173-johto");
  const igglybuff = familyWithMember(families, "174-johto");
  const crobat = familyWithMember(families, "169-johto");
  const togepi = familyWithMember(families, "175-johto");

  const familyMerges = {
    pichuToPikachu: {
      familyId: pichu?.familyId,
      familyKey: pichu?.familyKey,
      members: memberIds(pichu),
      result: hasMembers(pichu, ["172-johto", "025-kanto", "026-kanto"]) ? "PASS" : "FAIL",
    },
    cleffaToClefairy: {
      familyId: cleffa?.familyId,
      familyKey: cleffa?.familyKey,
      members: memberIds(cleffa),
      result: hasMembers(cleffa, ["173-johto", "035-kanto", "036-kanto"]) ? "PASS" : "FAIL",
    },
    igglybuffToJigglypuff: {
      familyId: igglybuff?.familyId,
      familyKey: igglybuff?.familyKey,
      members: memberIds(igglybuff),
      result: hasMembers(igglybuff, ["174-johto", "039-kanto", "040-kanto"]) ? "PASS" : "FAIL",
    },
    crobatJohtoExtension: {
      familyId: crobat?.familyId,
      familyKey: crobat?.familyKey,
      members: memberIds(crobat),
      isBatchTruncated: crobat?.isBatchTruncated,
      result:
        hasMembers(crobat, ["041-kanto", "042-kanto", "169-johto"]) && !crobat?.isBatchTruncated
          ? "PASS"
          : "FAIL",
    },
  };

  const hasTogekissStub = Boolean(
    togepi?.members.some((member) =>
      member.form.evolutionPaths.some(
        (path) => path.toFormId === "468-other" && path.isEvolutionStub,
      ),
    ),
  );
  const stubBoundaries = {
    togekiss: {
      familyId: togepi?.familyId,
      members: memberIds(togepi),
      isBatchTruncated: togepi?.isBatchTruncated,
      hasExternalTarget: hasTogekissStub,
      result: togepi?.isBatchTruncated && hasTogekissStub ? "PASS" : "FAIL",
    },
  };

  const versionBoundaries = {
    megaAmpharosReleased: rows.some(
      (row) => row.id === "181-johto-mega" && row.releaseStatus === "RELEASED",
    ),
    shadowCrobatReleased: rows.some(
      (row) => row.id === "169-johto-shadow" && row.releaseStatus === "RELEASED",
    ),
    dynamaxRowsRemainUnreleased: rows
      .filter((row) => row.variantKey === "DYNAMAX")
      .every((row) => row.releaseStatus === "UNRELEASED"),
  };

  const integrationChecks = [
    ...Object.values(familyMerges).map((check) => check.result),
    stubBoundaries.togekiss.result,
    ...Object.values(versionBoundaries).map((value) => (value ? "PASS" : "FAIL")),
  ];
  if (integrationChecks.some((result) => result !== "PASS")) {
    throw new Error(`#152-181 integration checks failed: ${integrationChecks.join(", ")}`);
  }

  const trueDataPending = rows.filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING");
  if (trueDataPending.length) {
    throw new Error(
      `#152-181 unexpectedly contains TRUE_DATA_PENDING: ${trueDataPending.map((row) => row.id).join(", ")}`,
    );
  }

  const payload = {
    batch: "152-181",
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
    familyMerges,
    stubBoundaries,
    versionBoundaries,
    crossBatchIntegration: {
      result: integrationChecks.every((result) => result === "PASS") ? "PASS" : "FAIL",
      checkedFamilies: Object.keys(familyMerges),
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
    "# Pokemon GO Retention Guide #152-181 integration review",
    "",
    `- dataVersion: ${payload.dataVersion}`,
    `- rulesVersion: ${payload.rulesVersion}`,
    `- scope: ${payload.counts.species} species / ${payload.counts.forms} forms / ${payload.counts.battleVariants} battle variants / ${payload.counts.families} families`,
    `- status: ${payload.status}`,
    `- TRUE_DATA_PENDING: ${payload.counts.trueDataPending}`,
    "",
    "## Integration checks",
    "",
    `- Pichu merged into Pikachu family: ${familyMerges.pichuToPikachu.result}`,
    `- Cleffa merged into Clefairy family: ${familyMerges.cleffaToClefairy.result}`,
    `- Igglybuff merged into Jigglypuff family: ${familyMerges.igglybuffToJigglypuff.result}`,
    `- Crobat family extended from Zubat/Golbat: ${familyMerges.crobatJohtoExtension.result}`,
    `- Togekiss external evolution stub boundary: ${stubBoundaries.togekiss.result}`,
    `- Release boundaries: ${Object.values(versionBoundaries).every(Boolean) ? "PASS" : "FAIL"}`,
    "",
    "## Immediate family handling",
    "",
    ...payload.immediateHandling.map(
      (item) => `- ${item.familyId}: ${item.strategy}; ${item.conclusion}`,
    ),
  ];
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/152-181.json",
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile("review/152-181.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        batch: payload.batch,
        dataVersion: payload.dataVersion,
        counts: payload.counts,
        crossBatchIntegration: payload.crossBatchIntegration,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
