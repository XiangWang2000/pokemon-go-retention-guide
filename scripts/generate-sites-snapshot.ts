import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
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
import { DATA_VERSION } from "../src/config/release";
import { CURRENT_DATA_SCOPE } from "../src/config/data-scope";
import { buildAuditSummary } from "../src/lib/audit-data";
import { auditDataFileName, familyDataFileName } from "../src/lib/site-data-paths";
import { buildHomeSnapshot } from "../src/presentation/home-snapshot";
import { buildHomeSummary } from "../src/presentation/home-summary";
import type { HomeRuntimeSnapshot } from "../src/presentation/home-snapshot";
import { resolveDatabaseLocation } from "../src/lib/database";

const root = process.cwd();
const siteDataDirectory = path.join(root, "site-data");
const exportDirectory = path.join(root, "public", "exports");
const publicDataDirectory = path.join(root, "public", "data");
const publicHeadersPath = path.join(root, "public", "_headers");
const databaseLocation = resolveDatabaseLocation();
const exportFileName: string = `pokemon-go-retention-${CURRENT_DATA_SCOPE}.xlsx`;
const legacyExportFileName: string = "pokemon-go-retention-001-151.xlsx";
const workbookPath = path.join(exportDirectory, exportFileName);
const manifestPath = path.join(siteDataDirectory, "manifest.json");

function jsonBuffer(value: unknown) {
  return Buffer.from(`${JSON.stringify(value, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`, "utf8");
}

function compactJsonBuffer(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8");
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

async function syncJsonDirectory(directory: string, files: Map<string, Uint8Array>) {
  await mkdir(directory, { recursive: true });
  const expected = new Set(files.keys());
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json") && !expected.has(entry.name)) {
      await unlink(path.join(directory, entry.name));
    }
  }
  for (const [name, value] of files) {
    await writeIfChanged(path.join(directory, name), value);
  }
}

function latestIso(values: Array<string | null | undefined>) {
  return (
    values
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null
  );
}

function buildRuntimeHome(home: ReturnType<typeof buildHomeSnapshot>) {
  const lazyIvLabel = "展開後載入 IV 建議";
  return {
    schemaVersion: 2,
    dataVersion: home.dataVersion,
    dataAsOf: home.dataAsOf,
    families: home.families.map((family) => ({
      familyId: family.familyId,
      familyKey: family.familyKey,
      familyNameZhTw: family.familyNameZhTw,
      dexRangeZhTw: family.dexRangeZhTw,
      regionHintZhTw: family.regionHintZhTw,
      branchCount: family.branchCount,
      isBatchTruncated: family.isBatchTruncated,
      members: family.members.map((member) => ({
        roles: member.roles,
        roleLabelsZhTw: member.roleLabelsZhTw,
        mainUseZhTw: member.mainUseZhTw,
        memberSummaryZhTw: member.memberSummaryZhTw,
        ivShortLabels: [lazyIvLabel],
        ivRecommendations: [],
        isRoot: member.isRoot,
        isIntermediate: member.isIntermediate,
        isTerminal: member.isTerminal,
        hasIndependentUse: member.hasIndependentUse,
        form: {
          formId: member.form.formId,
          speciesId: member.form.speciesId,
          familyKey: member.form.familyKey,
          dexNumber: member.form.dexNumber,
          nameEn: member.form.nameEn,
          nameZhTw: member.form.nameZhTw,
          formNameEn: member.form.formNameEn,
          formNameZhTw: member.form.formNameZhTw,
          regionKey: member.form.regionKey,
          evolvesFromFormId: member.form.evolvesFromFormId,
          evolutionFamilyNotesZhTw: member.form.evolutionFamilyNotesZhTw,
          evolutionPaths: [],
          types: member.form.types,
          aliases: member.form.aliases,
          evolutionNames: member.form.evolutionNames,
          variants: [],
          variantKeys: member.form.variantKeys,
          releasedVariantKeys: member.form.releasedVariantKeys,
          pvp: member.form.pvp,
          pve: member.form.pve,
          gym: member.form.gym,
          megaMax: member.form.megaMax,
          decision: member.form.decision,
          decisionReason: member.form.decisionReason,
          ivRecommendations: [],
          ivShortLabels: [lazyIvLabel],
          ivDirection: lazyIvLabel,
          primaryUses: member.form.primaryUses,
          primaryUseKeys: member.form.primaryUseKeys,
          hasRocketUse: member.form.hasRocketUse,
          hasEvolutionUse: member.form.hasEvolutionUse,
          hasDataIssues: member.form.hasDataIssues,
          reviewed: member.form.reviewed,
          updatedAt: member.form.updatedAt,
          detailsLoaded: false,
        },
      })),
      releasedVariantKeys: family.releasedVariantKeys,
      pvp: family.pvp,
      pve: family.pve,
      gym: family.gym,
      megaMax: family.megaMax,
      familyValue: family.familyValue,
      retentionStrategy: family.retentionStrategy,
      primaryRetentionTargets: family.primaryRetentionTargets,
      primaryTargetSummaryZhTw: family.primaryTargetSummaryZhTw,
      preEvolutionActionZhTw: family.preEvolutionActionZhTw,
      handlingSummaryZhTw: family.handlingSummaryZhTw,
      actionSummaryZhTw: family.actionSummaryZhTw,
      ivShortLabels: [],
      ivRecommendations: [],
      ivSummaryZhTw: lazyIvLabel,
      primaryUses: family.primaryUses,
      holdReasons: family.holdReasons,
      notices: family.notices,
      hasDataIssues: family.hasDataIssues,
      hasCriticalDataIssues: family.hasCriticalDataIssues,
      updatedAt: family.updatedAt,
      minDexNumber: family.minDexNumber,
      maxDexNumber: family.maxDexNumber,
      detailsLoaded: false,
    })),
  } satisfies HomeRuntimeSnapshot;
}

function buildFamilyDetail(family: ReturnType<typeof buildHomeSnapshot>["families"][number]) {
  return {
    ...family,
    detailsLoaded: true,
    members: family.members.map((member) => ({
      ...member,
      form: { ...member.form, detailsLoaded: true },
    })),
  };
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
  const database = await readFile(databaseLocation.absolutePath);
  if (database.byteLength === 0) {
    throw new Error(`DATABASE_URL 指向的 SQLite 檔案是空檔：${databaseLocation.absolutePath}`);
  }

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

  const dataAsOf = latestIso([
    ...dashboard.map((row) => row.updatedAt),
    ...review.map((issue) => issue.detectedAt),
    ...sources.map((source) => source.accessedAt),
    ...changes.map((change) => change.changedAt),
  ]);
  const home = buildHomeSnapshot(dashboard, dataAsOf, DATA_VERSION);
  const homeSummary = buildHomeSummary(home);
  const auditSummary = buildAuditSummary(dashboard, dataAsOf);
  const payloads = {
    home: jsonBuffer(home),
    homeSummary: jsonBuffer(homeSummary),
    dashboard: jsonBuffer(dashboard),
    auditSummary: jsonBuffer(auditSummary),
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
  if (legacyExportFileName !== exportFileName && (await exists(path.join(exportDirectory, legacyExportFileName)))) {
    await unlink(path.join(exportDirectory, legacyExportFileName));
  }
  await mkdir(publicDataDirectory, { recursive: true });
  for (const [name, value] of Object.entries(payloads)) {
    await writeIfChanged(path.join(siteDataDirectory, `${name}.json`), value);
  }
  const publicHome = compactJsonBuffer(buildRuntimeHome(home));
  await writeIfChanged(path.join(publicDataDirectory, "home.json"), publicHome);
  const familyFiles = new Map(
    home.families.map((family) => [
      familyDataFileName(family.familyId),
      jsonBuffer(buildFamilyDetail(family)),
    ]),
  );
  const auditFiles = new Map(dashboard.map((row) => [auditDataFileName(row.id), jsonBuffer(row)]));
  await syncJsonDirectory(path.join(publicDataDirectory, "families"), familyFiles);
  await syncJsonDirectory(path.join(publicDataDirectory, "audit"), auditFiles);
  const publicHeaders = Buffer.from(
    [
      "/data/home.json",
      `  Cache-Control: no-store, max-age=0, must-revalidate`,
      "  CDN-Cache-Control: no-store",
      "  Surrogate-Control: no-store",
      "  Pragma: no-cache",
      `  X-Data-Version: ${DATA_VERSION}`,
      "/data/families/*",
      "  Cache-Control: no-store, max-age=0, must-revalidate",
      "  CDN-Cache-Control: no-store",
      "  Surrogate-Control: no-store",
      "  Pragma: no-cache",
      `  X-Data-Version: ${DATA_VERSION}`,
      "/data/audit/*",
      "  Cache-Control: no-store, max-age=0, must-revalidate",
      "  CDN-Cache-Control: no-store",
      "  Surrogate-Control: no-store",
      "  Pragma: no-cache",
      `  X-Data-Version: ${DATA_VERSION}`,
      "",
    ].join("\r\n"),
    "utf8",
  );
  await writeIfChanged(publicHeadersPath, publicHeaders);

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

  const manifest = {
    schemaVersion: 1,
    batch: CURRENT_DATA_SCOPE,
    dataVersion: DATA_VERSION,
    dataAsOf,
    sourceDatabase: {
      path: databaseLocation.manifestPath,
      bytes: database.byteLength,
      sha256: sha256(database),
    },
    rulesVersions: [...new Set(dashboard.map((row) => row.rulesVersion))].sort(),
    counts: {
      ...counts,
      dashboardRows: dashboard.length,
      homeFamilies: home.families.length,
      auditSummaryRows: auditSummary.rows.length,
      runtimeFamilyFiles: familyFiles.size,
      runtimeAuditDetailFiles: auditFiles.size,
      openReviewIssues: review.length,
      detailRecords: Object.keys(details).length,
    },
    snapshotSha256,
    files,
    runtimeHome: {
      path: "public/data/home.json",
      bytes: publicHome.byteLength,
      sha256: sha256(publicHome),
    },
    runtimeFamilyData: {
      directory: "public/data/families",
      count: familyFiles.size,
      bytes: [...familyFiles.values()].reduce((total, value) => total + value.byteLength, 0),
    },
    runtimeAuditData: {
      directory: "public/data/audit",
      count: auditFiles.size,
      bytes: [...auditFiles.values()].reduce((total, value) => total + value.byteLength, 0),
    },
    excel: {
      path: `public/exports/${exportFileName}`,
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
