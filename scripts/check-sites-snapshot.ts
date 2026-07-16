import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

interface ManifestFile {
  path: string;
  bytes: number;
  sha256: string;
}

interface Manifest {
  schemaVersion: number;
  sourceDatabase: { path: string; bytes: number; sha256: string };
  counts: {
    dashboardRows: number;
    openReviewIssues: number;
    sourceReferences: number;
    changeLogs: number;
    detailRecords: number;
  };
  snapshotSha256: string;
  files: Record<string, ManifestFile>;
  excel: { path: string; bytes: number; sha256: string; sheets: number };
}

const root = process.cwd();
const siteDataDirectory = path.join(root, "site-data");

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

async function main() {
  const manifest = JSON.parse(
    await readFile(path.join(siteDataDirectory, "manifest.json"), "utf8"),
  ) as Manifest;
  assert(manifest.schemaVersion === 1, "Sites snapshot manifest schemaVersion 不支援。");

  const payloads: Uint8Array[] = [];
  const parsed: Record<string, unknown> = {};
  for (const [name, file] of Object.entries(manifest.files)) {
    const filePath = path.join(siteDataDirectory, file.path);
    const content = await readFile(filePath);
    assert(content.byteLength === file.bytes, `${file.path} 大小與 manifest 不一致。`);
    assert(sha256(content) === file.sha256, `${file.path} SHA256 與 manifest 不一致。`);
    payloads.push(content);
    parsed[name] = JSON.parse(content.toString("utf8"));
  }
  assert(
    sha256(Buffer.concat(payloads.map((payload) => Buffer.from(payload)))) ===
      manifest.snapshotSha256,
    "Sites snapshot 組合雜湊不一致。",
  );

  const dashboard = parsed.dashboard as unknown[];
  const review = parsed.review as unknown[];
  const sources = parsed.sources as unknown[];
  const changes = parsed.changes as unknown[];
  const details = parsed.details as Record<string, unknown>;
  assert(dashboard.length === manifest.counts.dashboardRows, "dashboard 筆數不一致。");
  assert(review.length === manifest.counts.openReviewIssues, "Review Queue 筆數不一致。");
  assert(sources.length === manifest.counts.sourceReferences, "來源筆數不一致。");
  assert(changes.length === manifest.counts.changeLogs, "變更紀錄筆數不一致。");
  assert(Object.keys(details).length === manifest.counts.detailRecords, "詳細資料筆數不一致。");

  const workbookPath = path.join(root, manifest.excel.path);
  const workbook = await readFile(workbookPath);
  assert(workbook.byteLength === manifest.excel.bytes, "Excel 大小與 manifest 不一致。");
  assert(sha256(workbook) === manifest.excel.sha256, "Excel SHA256 與 manifest 不一致。");
  assert(workbook[0] === 0x50 && workbook[1] === 0x4b, "Excel 檔案不是有效 ZIP/XLSX 開頭。");
  assert(manifest.excel.sheets === 10, "Excel 工作表數量宣告不正確。");

  const databasePath = path.join(root, manifest.sourceDatabase.path);
  if (await exists(databasePath)) {
    const database = await readFile(databasePath);
    assert(database.byteLength > 0, "本機 dev.db 是空檔。");
    assert(
      database.byteLength === manifest.sourceDatabase.bytes,
      "本機 dev.db 大小與 snapshot 不一致。",
    );
    assert(
      sha256(database) === manifest.sourceDatabase.sha256,
      "本機 dev.db 已變更，請先執行 npm run sites:snapshot。",
    );
  }

  console.log(
    `Sites snapshot 驗證通過：${dashboard.length} 筆戰鬥版本、${review.length} 筆開放審核、${sources.length} 個來源。`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
