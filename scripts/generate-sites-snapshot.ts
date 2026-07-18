import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildExportWorkbook } from "../src/export/excel";
import {
  getChangeLogs,
  getDashboardRows,
  getReviewIssues,
  getSources,
  getVariantDetailMeta,
} from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";

const root = process.cwd();
const siteDataDirectory = path.join(root, "site-data");
const exportDirectory = path.join(root, "public", "exports");
const databasePath = path.join(root, "dev.db");
const workbookPath = path.join(exportDirectory, "pokemon-go-retention-001-030.xlsx");
const manifestPath = path.join(siteDataDirectory, "manifest.json");

function jsonBuffer(value: unknown) {
  return Buffer.from(`${JSON.stringify(value, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`, "utf8");
}

function sha256(value: Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeIfChanged(filePath: string, value: Uint8Array) {
  if (await exists(filePath)) {
    const current = await readFile(filePath);
    if (Buffer.compare(current, value) === 0) return false;
  }
  await writeFile(filePath, value);
  return true;
}

function latestIso(values: Array<string | null | undefined>) {
  return (
    values
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null
  );
}

async function tableCounts() {
  const [
    pokemonSpecies,
    pokemonForms,
    battleVariants,
    evolutionPaths,
    moves,
    variantMoves,
    sourceReferences,
    rawEvaluationData,
    retentionEvaluations,
    evaluationSources,
    evaluationRuleTraces,
    changeLogs,
    dataIssues,
    categoryEvaluations,
    categoryEvaluationSources,
    ivRecommendations,
  ] = await Promise.all([
    prisma.pokemonSpecies.count(),
    prisma.pokemonForm.count(),
    prisma.battleVariant.count(),
    prisma.evolutionPath.count(),
    prisma.move.count(),
    prisma.variantMove.count(),
    prisma.sourceReference.count(),
    prisma.rawEvaluationData.count(),
    prisma.retentionEvaluation.count(),
    prisma.evaluationSource.count(),
    prisma.evaluationRuleTrace.count(),
    prisma.changeLog.count(),
    prisma.dataIssue.count(),
    prisma.categoryEvaluation.count(),
    prisma.categoryEvaluationSource.count(),
    prisma.ivRecommendation.count(),
  ]);
  return {
    pokemonSpecies,
    pokemonForms,
    battleVariants,
    evolutionPaths,
    moves,
    variantMoves,
    sourceReferences,
    rawEvaluationData,
    retentionEvaluations,
    evaluationSources,
    evaluationRuleTraces,
    changeLogs,
    dataIssues,
    categoryEvaluations,
    categoryEvaluationSources,
    ivRecommendations,
  };
}

async function main() {
  const database = await readFile(databasePath);
  if (database.byteLength === 0) throw new Error("根目錄 dev.db 是空檔，拒絕產生 Sites snapshot。");

  const [dashboard, review, sources, changes, counts] = await Promise.all([
    getDashboardRows(),
    getReviewIssues(),
    getSources(),
    getChangeLogs(),
    tableCounts(),
  ]);
  const details: Record<string, Awaited<ReturnType<typeof getVariantDetailMeta>>> = {};
  for (const row of dashboard) {
    details[row.id] = await getVariantDetailMeta(row.formId, row.id, row.evaluationId);
  }

  const payloads = {
    dashboard: jsonBuffer(dashboard),
    review: jsonBuffer(review),
    sources: jsonBuffer(sources),
    changes: jsonBuffer(changes),
    details: jsonBuffer(details),
  };
  const files = Object.fromEntries(
    Object.entries(payloads).map(([name, value]) => [
      name,
      { path: `${name}.json`, bytes: value.byteLength, sha256: sha256(value) },
    ]),
  );
  const snapshotSha256 = sha256(
    Buffer.concat(Object.values(payloads).map((value) => Buffer.from(value))),
  );

  await mkdir(siteDataDirectory, { recursive: true });
  await mkdir(exportDirectory, { recursive: true });
  for (const [name, value] of Object.entries(payloads)) {
    await writeIfChanged(path.join(siteDataDirectory, `${name}.json`), value);
  }

  let previousSnapshotSha: string | null = null;
  if (await exists(manifestPath)) {
    try {
      previousSnapshotSha =
        (
          JSON.parse(await readFile(manifestPath, "utf8")) as {
            snapshotSha256?: string;
          }
        ).snapshotSha256 ?? null;
    } catch {
      previousSnapshotSha = null;
    }
  }
  if (previousSnapshotSha !== snapshotSha256 || !(await exists(workbookPath))) {
    const workbook = await buildExportWorkbook(prisma);
    const workbookBuffer = await workbook.xlsx.writeBuffer();
    await writeFile(workbookPath, new Uint8Array(workbookBuffer));
  }
  const workbook = await readFile(workbookPath);

  const dataAsOf = latestIso([
    ...dashboard.map((row) => row.updatedAt),
    ...review.map((issue) => issue.detectedAt),
    ...sources.map((source) => source.accessedAt),
    ...changes.map((change) => change.changedAt),
  ]);
  const manifest = {
    schemaVersion: 1,
    batch: "001-030",
    dataAsOf,
    sourceDatabase: {
      path: "dev.db",
      bytes: database.byteLength,
      sha256: sha256(database),
    },
    rulesVersions: [...new Set(dashboard.map((row) => row.rulesVersion))].sort(),
    counts: {
      ...counts,
      dashboardRows: dashboard.length,
      openReviewIssues: review.length,
      detailRecords: Object.keys(details).length,
    },
    snapshotSha256,
    files,
    excel: {
      path: "public/exports/pokemon-go-retention-001-030.xlsx",
      bytes: workbook.byteLength,
      sha256: sha256(workbook),
      sheets: 10,
    },
  };
  await writeIfChanged(manifestPath, jsonBuffer(manifest));
  console.log(
    `Sites snapshot 已產生：${dashboard.length} 筆戰鬥版本、${review.length} 筆開放審核、${sources.length} 個來源；snapshot ${snapshotSha256}.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
