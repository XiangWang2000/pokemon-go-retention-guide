import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  CURRENT_RELEASE_CONTRACT,
  expectedReleaseReviewPaths,
  isExpectedReleaseGeneratedPath,
} from "../src/config/release-contract";
import { assertBatchRegistry } from "../src/config/batch-registry";
import { validateReviewConsistency } from "./validate-review-consistency";
import { verifyStaticSnapshot } from "./check-static-snapshot";

const execFileAsync = promisify(execFile);

export interface ReleaseVerificationOptions {
  snapshotRoot?: string;
  reviewRoot?: string;
  databaseRoot?: string;
  repositoryRoot?: string;
  checkGeneratedPaths?: boolean;
}

interface SnapshotManifest {
  batch?: string;
  dataVersion?: string;
  counts?: {
    dashboardRows?: number;
    battleVariants?: number;
    homeFamilies?: number;
    ivRecommendations?: number;
  };
  excel?: { path?: string };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function changedPaths(root: string) {
  const commands = [
    ["diff", "--name-only"],
    ["diff", "--cached", "--name-only"],
    ["ls-files", "--others", "--exclude-standard"],
  ] as const;
  const outputs = await Promise.all(
    commands.map(async (args) => (await execFileAsync("git", args, { cwd: root })).stdout),
  );
  return new Set(
    outputs
      .flatMap((output) => output.split(/\r?\n/))
      .map((filePath) => filePath.trim().replaceAll("\\", "/"))
      .filter(Boolean),
  );
}

export async function verifyGeneratedReleasePaths(root = process.cwd()) {
  const paths = await changedPaths(path.resolve(root));
  const unexpected = [...paths].filter((filePath) => !isExpectedReleaseGeneratedPath(filePath));
  if (unexpected.length) {
    throw new Error(`Unexpected generated release paths:\n- ${unexpected.join("\n- ")}`);
  }
  return [...paths].sort();
}

export async function verifyRelease({
  snapshotRoot: requestedSnapshotRoot = process.cwd(),
  reviewRoot: requestedReviewRoot = requestedSnapshotRoot,
  databaseRoot: requestedDatabaseRoot = process.cwd(),
  repositoryRoot: requestedRepositoryRoot = process.cwd(),
  checkGeneratedPaths = false,
}: ReleaseVerificationOptions = {}) {
  const snapshotRoot = path.resolve(requestedSnapshotRoot);
  const reviewRoot = path.resolve(requestedReviewRoot);
  const databaseRoot = path.resolve(requestedDatabaseRoot);
  const repositoryRoot = path.resolve(requestedRepositoryRoot);

  assertBatchRegistry();
  for (const reviewPath of expectedReleaseReviewPaths()) {
    try {
      await access(path.join(reviewRoot, reviewPath));
    } catch {
      throw new Error(`Release review output is missing: ${reviewPath}.`);
    }
  }
  await verifyStaticSnapshot({ snapshotRoot, databaseRoot });

  const manifest = JSON.parse(
    await readFile(path.join(snapshotRoot, CURRENT_RELEASE_CONTRACT.snapshot.manifestPath), "utf8"),
  ) as SnapshotManifest;
  assert(manifest.batch === CURRENT_RELEASE_CONTRACT.scope, "Release snapshot scope is stale.");
  assert(
    manifest.dataVersion === CURRENT_RELEASE_CONTRACT.dataVersion,
    "Release snapshot dataVersion is stale.",
  );
  assert(
    manifest.excel?.path === CURRENT_RELEASE_CONTRACT.snapshot.exportPath,
    `Release snapshot Excel path must be ${CURRENT_RELEASE_CONTRACT.snapshot.exportPath}.`,
  );
  assert(
    manifest.counts?.battleVariants === CURRENT_RELEASE_CONTRACT.expectedCounts.battleVariants,
    "Release snapshot BattleVariant count is not the current release count.",
  );
  assert(
    manifest.counts?.dashboardRows === CURRENT_RELEASE_CONTRACT.expectedCounts.battleVariants,
    "Release snapshot dashboard row count is not the current release count.",
  );
  assert(
    manifest.counts?.homeFamilies === CURRENT_RELEASE_CONTRACT.expectedCounts.families,
    "Release snapshot family count is not the current release count.",
  );
  assert(
    manifest.counts?.ivRecommendations ===
      CURRENT_RELEASE_CONTRACT.expectedCounts.ivRecommendations,
    "Release snapshot IV recommendation count is not the current release count.",
  );
  const dashboard = JSON.parse(
    await readFile(path.join(snapshotRoot, "site-data/dashboard.json"), "utf8"),
  ) as Array<{ dexNumber?: number }>;
  assert(
    dashboard.every(
      (row) =>
        typeof row.dexNumber === "number" &&
        row.dexNumber >= CURRENT_RELEASE_CONTRACT.minDex &&
        row.dexNumber <= CURRENT_RELEASE_CONTRACT.maxDex,
    ),
    "Release snapshot contains rows outside the current published scope.",
  );

  const review = await validateReviewConsistency({ dataRoot: snapshotRoot, reviewRoot });
  assert(
    review.trueDataPending === CURRENT_RELEASE_CONTRACT.expectedCounts.trueDataPending,
    "Current release contains unexpected TRUE_DATA_PENDING rows.",
  );

  const generatedPaths = checkGeneratedPaths
    ? await verifyGeneratedReleasePaths(repositoryRoot)
    : undefined;
  return { manifest, review, generatedPaths };
}

function readOption(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/verify-release.ts")) {
  const snapshotRoot = readOption("--snapshot-root");
  const reviewRoot = readOption("--review-root");
  const databaseRoot = readOption("--database-root");
  const repositoryRoot = readOption("--repository-root");
  if ([snapshotRoot, reviewRoot, databaseRoot].some((value) => value === "")) {
    console.error("Release path options require a path.");
    process.exitCode = 1;
  } else {
    verifyRelease({
      snapshotRoot,
      reviewRoot,
      databaseRoot,
      repositoryRoot,
      checkGeneratedPaths: process.argv.includes("--generated-paths"),
    })
      .then(({ generatedPaths }) => {
        if (generatedPaths) {
          console.log(`Release generated paths verified: ${generatedPaths.length}.`);
        }
      })
      .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
      });
  }
}
