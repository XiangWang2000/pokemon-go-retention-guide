import "dotenv/config";
import { spawn } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl, resolveDatabaseLocation } from "../src/lib/database";
import { getDashboardRows } from "../src/lib/data-prisma";
import { assertOfficialEvolutionPathsMaterialized } from "../src/data/research-import";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { BATCH_REGISTRY, assertBatchRegistry } from "../src/config/batch-registry";
import { CURRENT_RELEASE_CONTRACT } from "../src/config/release-contract";

const databaseUrl = getDatabaseUrl();
if (process.env.ALLOW_DESTRUCTIVE_REBUILD !== "1" || !databaseUrl.includes("rebuild-ci")) {
  throw new Error(
    "Full research rebuild is CI-only; set ALLOW_DESTRUCTIVE_REBUILD=1 and use a rebuild-ci database.",
  );
}

const databasePath = resolveDatabaseLocation(databaseUrl).absolutePath;
try {
  const existing = await stat(databasePath);
  if (!existing.isFile() || existing.size !== 0) {
    throw new Error(
      `Clean research rebuild requires a new database file; ${databasePath} already exists.`,
    );
  }
} catch (error) {
  if (error instanceof Error && "code" in error && error.code === "ENOENT") {
    await mkdir(path.dirname(databasePath), { recursive: true });
    await writeFile(databasePath, new Uint8Array());
  } else {
    throw error;
  }
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(" ")} exited with ${String(code)}.`)),
    );
  });
}

const crossGenerationManifestPath = "research_notes/cross-generation-evolution-targets.json";
const crossGenerationManifestBefore = await readFile(crossGenerationManifestPath, "utf8");
const seedBatches = BATCH_REGISTRY.filter((entry) => entry.import.phase === "seed");
const preRecomputeBatches = BATCH_REGISTRY.filter(
  (entry) => entry.import.phase === "pre-recompute",
);
const postRecomputeBatches = BATCH_REGISTRY.filter(
  (entry) => entry.import.phase === "post-recompute",
);
const recomputeMaxDex = preRecomputeBatches.at(-1)?.maxDex;
if (seedBatches.length !== 1 || !recomputeMaxDex || postRecomputeBatches.length === 0) {
  throw new Error("Batch registry does not define the required clean rebuild phases.");
}
assertBatchRegistry();

async function runBatchImport(batch: (typeof BATCH_REGISTRY)[number]) {
  await run(npx, ["tsx", "scripts/import-batch.ts", batch.key]);
}

await run(npx, ["prisma", "db", "push"]);
for (const batch of seedBatches) {
  await runBatchImport(batch);
}
// The seed batch predates the seven-category data model. This existing
// remediation upgrades its variants before later importers enforce global
// category completeness.
await run(npm, ["run", "data:remediate"]);

for (const batch of preRecomputeBatches) {
  await runBatchImport(batch);
}
// The pre-recompute phase requires the current global reconciliation after
// its legacy importers finish. It fills modern assessment fields without
// weakening data:validate.
await run(npx, ["tsx", "scripts/recompute-001-311.ts", "--max", String(recomputeMaxDex)]);
for (const batch of postRecomputeBatches) {
  await runBatchImport(batch);
}
await run(npm, ["run", "data:backfill-iv"]);
await run(npm, ["run", "data:validate"]);

const crossGenerationManifestAfter = await readFile(crossGenerationManifestPath, "utf8");
if (crossGenerationManifestAfter !== crossGenerationManifestBefore) {
  throw new Error("Clean rebuild changed the cross-generation source manifest.");
}

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
try {
  await assertOfficialEvolutionPathsMaterialized(prisma);
  const [allVariants, rows, ivRecommendations] = await Promise.all([
    prisma.battleVariant.count(),
    getDashboardRows(),
    prisma.ivRecommendation.count(),
  ]);
  const familyCount = buildFamilyOverviews(buildFormOverviews(rows)).length;
  const trueDataPending = rows.filter(
    (row) => row.assessmentDisposition === "TRUE_DATA_PENDING",
  ).length;
  const outOfScopeRows = rows.filter(
    (row) =>
      row.dexNumber < CURRENT_RELEASE_CONTRACT.minDex ||
      row.dexNumber > CURRENT_RELEASE_CONTRACT.maxDex,
  );
  const expected = CURRENT_RELEASE_CONTRACT.expectedCounts;
  if (outOfScopeRows.length > 0) {
    throw new Error(
      `Full rebuild contains ${outOfScopeRows.length} rows outside ${CURRENT_RELEASE_CONTRACT.scope}.`,
    );
  }
  if (allVariants !== expected.battleVariants || rows.length !== expected.battleVariants) {
    throw new Error(
      `Full rebuild produced ${allVariants} BattleVariants and ${rows.length} dashboard rows; expected ${expected.battleVariants}.`,
    );
  }
  if (familyCount !== expected.families || ivRecommendations !== expected.ivRecommendations) {
    throw new Error(
      `Unexpected current-release invariants: families=${familyCount}, ivRecommendations=${ivRecommendations}.`,
    );
  }
  if (trueDataPending !== expected.trueDataPending) {
    throw new Error(
      `Full rebuild produced ${trueDataPending} current TRUE_DATA_PENDING evaluations; expected ${expected.trueDataPending}.`,
    );
  }
  console.log(
    `Full research rebuild verified through ${CURRENT_RELEASE_CONTRACT.scope}: ${allVariants} total BattleVariants.`,
  );
} finally {
  await prisma.$disconnect();
}
