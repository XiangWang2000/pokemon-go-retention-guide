import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

type Family = ReturnType<typeof buildFamilyOverviews>[number];
type Dashboard = Awaited<ReturnType<typeof getDashboardRows>>;
type JohtoBatch = "182-211" | "212-241" | "242-251";
type Migration = { name: string; formId: string; expected: string[] };

type ReviewConfig = {
  minDex: number;
  maxDex: number;
  migrations: Migration[];
  versionBoundaries: (rows: Dashboard) => Record<string, boolean>;
};

const JOHTO_REVIEW_CONFIG: Record<JohtoBatch, ReviewConfig> = {
  "182-211": {
    minDex: 182,
    maxDex: 211,
    migrations: [
      { name: "Bellossom", formId: "182-johto", expected: ["044-kanto", "182-johto"] },
      { name: "Politoed", formId: "186-johto", expected: ["061-kanto", "186-johto"] },
      {
        name: "Espeon",
        formId: "196-johto",
        expected: ["133-kanto", "196-johto", "197-johto"],
      },
      { name: "Slowking", formId: "199-johto", expected: ["079-kanto", "199-johto"] },
      { name: "Steelix", formId: "208-johto", expected: ["095-kanto", "208-johto"] },
    ],
    versionBoundaries(rows) {
      const oldKantoForms = rows.filter(
        (row) =>
          [182, 186, 196, 197, 199, 208].includes(row.dexNumber) && row.formId.endsWith("-kanto"),
      );
      return {
        formalJohtoForms: oldKantoForms.length === 0,
        megaSteelixReleased: rows.some(
          (row) => row.id === "208-johto-mega" && row.releaseStatus === "RELEASED",
        ),
        shadowRowsSeparate: rows.some((row) => row.id === "208-johto-shadow"),
        noTrueDataPending: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING"),
      };
    },
  },
  "212-241": {
    minDex: 212,
    maxDex: 241,
    migrations: [
      { name: "Scizor", formId: "212-johto", expected: ["123-kanto", "212-johto"] },
      { name: "Kingdra", formId: "230-johto", expected: ["117-kanto", "230-johto"] },
      { name: "Porygon2", formId: "233-johto", expected: ["137-kanto", "233-johto"] },
      {
        name: "Tyrogue branch",
        formId: "237-johto",
        expected: ["106-kanto", "107-kanto", "236-johto", "237-johto"],
      },
      { name: "Smoochum baby", formId: "238-johto", expected: ["124-kanto", "238-johto"] },
      { name: "Elekid baby", formId: "239-johto", expected: ["125-kanto", "239-johto"] },
      { name: "Magby baby", formId: "240-johto", expected: ["126-kanto", "240-johto"] },
    ],
    versionBoundaries(rows) {
      const oldKantoForms = rows.filter(
        (row) => [212, 230, 233].includes(row.dexNumber) && row.formId.endsWith("-kanto"),
      );
      return {
        formalJohtoForms: oldKantoForms.length === 0,
        releasedMegaForms: [212, 214, 227, 229].every((dex) =>
          rows.some(
            (row) =>
              row.id === `${String(dex).padStart(3, "0")}-johto-mega` &&
              row.releaseStatus === "RELEASED",
          ),
        ),
        releasedMaxForms: [213, 237].every((dex) =>
          rows.some(
            (row) =>
              row.id === `${String(dex).padStart(3, "0")}-johto-dynamax` &&
              row.releaseStatus === "RELEASED",
          ),
        ),
        noTrueDataPending: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING"),
      };
    },
  },
  "242-251": {
    minDex: 242,
    maxDex: 251,
    migrations: [
      { name: "Blissey", formId: "242-johto", expected: ["113-kanto", "242-johto"] },
      {
        name: "Larvitar family",
        formId: "248-johto",
        expected: ["246-johto", "247-johto", "248-johto"],
      },
    ],
    versionBoundaries(rows) {
      const oldKantoForms = rows.filter(
        (row) => row.dexNumber === 242 && row.formId.endsWith("-kanto"),
      );
      return {
        formalJohtoForms: oldKantoForms.length === 0,
        releasedMegaForms: [248].every((dex) =>
          rows.some(
            (row) =>
              row.id === `${String(dex).padStart(3, "0")}-johto-mega` &&
              row.releaseStatus === "RELEASED",
          ),
        ),
        releasedMaxForms: [242, 243, 244, 245, 249, 250].every((dex) =>
          rows.some(
            (row) =>
              row.id === `${String(dex).padStart(3, "0")}-johto-dynamax` &&
              row.releaseStatus === "RELEASED",
          ),
        ),
        noTrueDataPending: rows.every((row) => row.assessmentDisposition !== "TRUE_DATA_PENDING"),
      };
    },
  },
};

function familyWithMember(families: Family[], formId: string) {
  return families.find((family) => family.members.some((member) => member.form.formId === formId));
}

function memberIds(family: Family | undefined) {
  return family?.members.map((member) => member.form.formId) ?? [];
}

function migrationCheck(families: Family[], migration: Migration) {
  const family = familyWithMember(families, migration.formId);
  const members = new Set(memberIds(family));
  return {
    familyId: family?.familyId,
    name: migration.name,
    members: [...members],
    result: family && migration.expected.every((id) => members.has(id)) ? "PASS" : "FAIL",
  };
}

function getConfig(batch: string): [JohtoBatch, ReviewConfig] {
  if (!(batch in JOHTO_REVIEW_CONFIG)) {
    throw new Error(
      `Usage: tsx scripts/generate-review-johto.ts <batch>; expected one of ${Object.keys(
        JOHTO_REVIEW_CONFIG,
      ).join(", ")}.`,
    );
  }
  const key = batch as JohtoBatch;
  return [key, JOHTO_REVIEW_CONFIG[key]];
}

export async function runReview(batchName: string) {
  const [batch, config] = getConfig(batchName);
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter(
    (row) => row.dexNumber >= config.minDex && row.dexNumber <= config.maxDex,
  );
  const families = buildFamilyOverviews(buildFormOverviews(allRows)).filter((family) =>
    family.members.some(
      (member) => member.form.dexNumber >= config.minDex && member.form.dexNumber <= config.maxDex,
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
  const migrations = config.migrations.map((migration) => migrationCheck(families, migration));
  const versionBoundaries = config.versionBoundaries(rows);
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
    `review/${batch}.json`,
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile(`review/${batch}.md`, `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(
    JSON.stringify({ batch, dataVersion: payload.dataVersion, counts: payload.counts }, null, 2),
  );
}

runReview(process.argv[2] ?? "")
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
