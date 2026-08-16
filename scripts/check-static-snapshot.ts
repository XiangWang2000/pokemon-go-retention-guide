import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { CURRENT_RELEASE_CONTRACT } from "../src/config/release-contract";
import { resolveDatabaseLocation } from "../src/lib/database";
import { auditDataFileName, familyDataFileName } from "../src/lib/site-data-paths";

interface ManifestFile {
  path: string;
  bytes: number;
  sha256: string;
}

interface Manifest {
  schemaVersion: number;
  batch: string;
  dataVersion: string;
  sourceDatabase: { path: string; bytes: number; sha256: string };
  counts: {
    dashboardRows: number;
    homeFamilies: number;
    auditSummaryRows: number;
    runtimeFamilyFiles: number;
    runtimeAuditDetailFiles: number;
    runtimeDetailFiles: number;
    openReviewIssues: number;
    sourceReferences: number;
    changeLogs: number;
    detailRecords: number;
  };
  snapshotSha256: string;
  files: Record<string, ManifestFile>;
  runtimeHome: ManifestFile;
  runtimeFamilyData: { directory: string; count: number; bytes: number };
  runtimeAuditData: { directory: string; count: number; bytes: number };
  runtimeDetailData: { directory: string; count: number; bytes: number };
  runtimeStaticData: Record<string, ManifestFile>;
  excel: { path: string; bytes: number; sha256: string; sheets: number };
}

export interface SnapshotCheckOptions {
  snapshotRoot?: string;
  databaseRoot?: string;
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function snapshotPath(snapshotRoot: string, relativePath: string) {
  const resolved = path.resolve(snapshotRoot, relativePath);
  const relative = path.relative(snapshotRoot, resolved);
  assert(
    relative &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative),
    `Snapshot path escapes its root: ${relativePath}.`,
  );
  return resolved;
}

export async function verifyStaticSnapshot({
  snapshotRoot: requestedSnapshotRoot = process.cwd(),
  databaseRoot: requestedDatabaseRoot = process.cwd(),
}: SnapshotCheckOptions = {}) {
  const snapshotRoot = path.resolve(requestedSnapshotRoot);
  const databaseRoot = path.resolve(requestedDatabaseRoot);
  const manifestPath = snapshotPath(snapshotRoot, CURRENT_RELEASE_CONTRACT.snapshot.manifestPath);
  const siteDataDirectory = path.dirname(manifestPath);
  const databaseLocation = resolveDatabaseLocation(undefined, databaseRoot);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  assert(manifest.schemaVersion === 1, "Static snapshot manifest schemaVersion 不支援。");
  assert(manifest.batch === CURRENT_RELEASE_CONTRACT.scope, "Static snapshot scope 不正確。");
  assert(
    manifest.dataVersion === CURRENT_RELEASE_CONTRACT.dataVersion,
    "Static snapshot dataVersion 不正確。",
  );

  const payloads: Uint8Array[] = [];
  const parsed: Record<string, unknown> = {};
  for (const [name, file] of Object.entries(manifest.files)) {
    const filePath = snapshotPath(siteDataDirectory, file.path);
    const content = await readFile(filePath);
    assert(content.byteLength === file.bytes, `${file.path} 大小與 manifest 不一致。`);
    assert(sha256(content) === file.sha256, `${file.path} SHA256 與 manifest 不一致。`);
    payloads.push(content);
    parsed[name] = JSON.parse(content.toString("utf8"));
  }
  assert(
    sha256(Buffer.concat(payloads.map((payload) => Buffer.from(payload)))) ===
      manifest.snapshotSha256,
    "Static snapshot 組合雜湊不一致。",
  );

  const dashboard = parsed.dashboard as unknown[];
  const home = parsed.home as { schemaVersion: number; dataVersion: string; families: unknown[] };
  const homeSummary = parsed.homeSummary as {
    schemaVersion: number;
    dataVersion: string;
    dataAsOf: string | null;
    strategyCounts: Record<string, number>;
  };
  const auditSummary = parsed.auditSummary as {
    schemaVersion: number;
    dataAsOf: string | null;
    rows: Array<{ id: string }>;
  };
  const review = parsed.review as unknown[];
  const sources = parsed.sources as unknown[];
  const changes = parsed.changes as unknown[];
  const details = parsed.details as Record<string, unknown>;
  assert(dashboard.length === manifest.counts.dashboardRows, "dashboard 筆數不一致。");
  assert(home.schemaVersion === 1, "home snapshot schemaVersion 不支援。");
  assert(
    home.dataVersion === CURRENT_RELEASE_CONTRACT.dataVersion,
    "home snapshot dataVersion 不正確。",
  );
  assert(home.families.length === manifest.counts.homeFamilies, "home 家族筆數不一致。");
  assert(homeSummary.schemaVersion === 1, "home summary schemaVersion 不正確。");
  assert(
    homeSummary.dataVersion === CURRENT_RELEASE_CONTRACT.dataVersion,
    "home summary dataVersion 不正確。",
  );
  assert(auditSummary.schemaVersion === 1, "audit summary schemaVersion 不正確。");
  assert(
    auditSummary.rows.length === manifest.counts.auditSummaryRows,
    "audit summary 筆數不一致。",
  );
  assert(
    manifest.counts.auditSummaryRows === manifest.counts.dashboardRows,
    "audit summary 與 dashboard 筆數不一致。",
  );
  assert(review.length === manifest.counts.openReviewIssues, "資料待補清單筆數不一致。");
  assert(sources.length === manifest.counts.sourceReferences, "來源筆數不一致。");
  assert(changes.length === manifest.counts.changeLogs, "變更紀錄筆數不一致。");
  assert(Object.keys(details).length === manifest.counts.detailRecords, "詳細資料筆數不一致。");

  const familyDirectory = snapshotPath(snapshotRoot, manifest.runtimeFamilyData.directory);
  const familyEntries = (await readdir(familyDirectory)).filter((name) => name.endsWith(".json"));
  assert(familyEntries.length === manifest.runtimeFamilyData.count, "家族詳細檔案數量不一致。");
  assert(
    familyEntries.length === manifest.counts.runtimeFamilyFiles,
    "manifest 家族檔案數量不一致。",
  );
  let familyBytes = 0;
  for (const family of home.families as Array<{ familyId: string }>) {
    const file = snapshotPath(familyDirectory, familyDataFileName(family.familyId));
    const content = await readFile(file);
    familyBytes += content.byteLength;
    const payload = JSON.parse(content.toString("utf8")) as {
      familyId: string;
      detailsLoaded?: boolean;
    };
    assert(
      payload.familyId === family.familyId && payload.detailsLoaded === true,
      "家族詳細檔案內容不一致。",
    );
  }
  assert(familyBytes === manifest.runtimeFamilyData.bytes, "家族詳細檔案總大小不一致。");

  const auditDirectory = snapshotPath(snapshotRoot, manifest.runtimeAuditData.directory);
  const auditEntries = (await readdir(auditDirectory)).filter((name) => name.endsWith(".json"));
  assert(auditEntries.length === manifest.runtimeAuditData.count, "Audit 詳細檔案數量不一致。");
  assert(
    auditEntries.length === manifest.counts.runtimeAuditDetailFiles,
    "manifest Audit 檔案數量不一致。",
  );
  let auditBytes = 0;
  for (const row of auditSummary.rows) {
    const file = snapshotPath(auditDirectory, auditDataFileName(row.id));
    const content = await readFile(file);
    auditBytes += content.byteLength;
    const payload = JSON.parse(content.toString("utf8")) as { id: string };
    assert(payload.id === row.id, "Audit 詳細檔案內容不一致。");
  }
  assert(auditBytes === manifest.runtimeAuditData.bytes, "Audit 詳細檔案總大小不一致。");

  const detailDirectory = snapshotPath(snapshotRoot, manifest.runtimeDetailData.directory);
  const detailEntries = (await readdir(detailDirectory)).filter((name) => name.endsWith(".json"));
  assert(detailEntries.length === manifest.runtimeDetailData.count, "詳細資料檔案數量不一致。");
  assert(
    detailEntries.length === manifest.counts.runtimeDetailFiles,
    "manifest 詳細資料檔案數量不一致。",
  );
  let detailBytes = 0;
  for (const row of auditSummary.rows) {
    const file = snapshotPath(detailDirectory, auditDataFileName(row.id));
    const content = await readFile(file);
    detailBytes += content.byteLength;
    const payload = JSON.parse(content.toString("utf8")) as {
      paths?: unknown[];
      conflicts?: unknown[];
      changeLogs?: unknown[];
    };
    assert(
      Array.isArray(payload.paths) &&
        Array.isArray(payload.conflicts) &&
        Array.isArray(payload.changeLogs),
      "詳細資料檔案內容不一致。",
    );
  }
  assert(detailBytes === manifest.runtimeDetailData.bytes, "詳細資料檔案總大小不一致。");

  const runtimeHomePath = snapshotPath(snapshotRoot, manifest.runtimeHome.path);
  const runtimeHome = await readFile(runtimeHomePath);
  assert(runtimeHome.byteLength === manifest.runtimeHome.bytes, "首頁 runtime 資料大小不一致。");
  assert(sha256(runtimeHome) === manifest.runtimeHome.sha256, "首頁 runtime 資料 SHA256 不一致。");
  assert(
    JSON.parse(runtimeHome.toString("utf8")).schemaVersion === 2,
    "首頁 runtime 資料 schemaVersion 不正確。",
  );

  const runtimeHomePayload = JSON.parse(runtimeHome.toString("utf8")) as {
    schemaVersion: number;
    dataVersion: string;
    families: Array<{ detailsLoaded?: boolean; members: Array<{ form: { variants: unknown[] } }> }>;
  };
  assert(
    runtimeHomePayload.dataVersion === CURRENT_RELEASE_CONTRACT.dataVersion,
    "首頁 runtime dataVersion 不正確。",
  );
  assert(
    runtimeHomePayload.families.every(
      (family) =>
        family.detailsLoaded === false &&
        family.members.every((member) => member.form.variants.length === 0),
    ),
    "runtime home must contain summary-only family forms",
  );
  for (const file of Object.values(manifest.runtimeStaticData)) {
    const runtimeFile = await readFile(snapshotPath(snapshotRoot, file.path));
    assert(runtimeFile.byteLength === file.bytes, `${file.path} bytes mismatch`);
    assert(sha256(runtimeFile) === file.sha256, `${file.path} SHA256 mismatch`);
  }

  const workbookPath = snapshotPath(snapshotRoot, manifest.excel.path);
  const workbook = await readFile(workbookPath);
  assert(workbook.byteLength === manifest.excel.bytes, "Excel 大小與 manifest 不一致。");
  assert(sha256(workbook) === manifest.excel.sha256, "Excel SHA256 與 manifest 不一致。");
  assert(workbook[0] === 0x50 && workbook[1] === 0x4b, "Excel 檔案不是有效 ZIP/XLSX 開頭。");
  assert(manifest.excel.sheets === 10, "Excel 工作表數量宣告不正確。");

  assert(
    manifest.sourceDatabase.path === databaseLocation.manifestPath,
    `snapshot provenance 指向 ${manifest.sourceDatabase.path}，但目前 DATABASE_URL 實際解析為 ${databaseLocation.manifestPath}。`,
  );
  if (await exists(databaseLocation.absolutePath)) {
    const database = await readFile(databaseLocation.absolutePath);
    assert(database.byteLength > 0, "本機 dev.db 是空檔。");
    assert(
      database.byteLength === manifest.sourceDatabase.bytes,
      "本機 dev.db 大小與 snapshot 不一致。",
    );
    assert(
      sha256(database) === manifest.sourceDatabase.sha256,
      "本機 dev.db 已變更，請先執行 npm run release:snapshot。",
    );
  }

  console.log(
    `Static snapshot 驗證通過：${dashboard.length} 筆戰鬥版本、${review.length} 筆開放審核、${sources.length} 個來源。`,
  );
  return manifest;
}

function readOption(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const snapshotRoot = readOption("--root");
const databaseRoot = readOption("--database-root");
const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/check-static-snapshot.ts")) {
  if (snapshotRoot === "" || databaseRoot === "") {
    console.error("--root and --database-root require a path.");
    process.exitCode = 1;
  } else {
    verifyStaticSnapshot({
      snapshotRoot,
      databaseRoot,
    }).catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
  }
}
