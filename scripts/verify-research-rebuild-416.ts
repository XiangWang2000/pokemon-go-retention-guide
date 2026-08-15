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
import { BATCH_REGISTRY } from "../src/config/batch-registry";

const databaseUrl = getDatabaseUrl();
if (process.env.ALLOW_DESTRUCTIVE_REBUILD !== "1" || !databaseUrl.includes("rebuild-ci")) {
  throw new Error("Full research rebuild is CI-only; set ALLOW_DESTRUCTIVE_REBUILD=1 and use a rebuild-ci database.");
}

const databasePath = resolveDatabaseLocation(databaseUrl).absolutePath;
try {
  const existing = await stat(databasePath);
  if (!existing.isFile() || existing.size !== 0) {
    throw new Error(`Clean research rebuild requires a new database file; ${databasePath} already exists.`);
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
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with ${code}.`)),
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

async function runBatchImport(batch: (typeof BATCH_REGISTRY)[number]) {
  await run(npx, ["tsx", "scripts/import-batch.ts", batch.key]);
}

await run(npx, ["prisma", "db", "push"]);
for (const batch of seedBatches) {
  await runBatchImport(batch);
}
// The original #001-#030 seed predates the seven-category data model. This
// existing remediation is the historical bridge that upgrades those 153
// variants before later importers enforce global category completeness.
await run(npm, ["run", "data:remediate"]);

for (const batch of preRecomputeBatches) {
  await runBatchImport(batch);
}
// #001-#386 historically require the current global reconciliation after all
// legacy importers finish. It fills the modern assessment disposition and
// four-level PvE-use fields without weakening data:validate.
await run(npm, ["run", `data:recompute:001-${String(recomputeMaxDex).padStart(3, "0")}`]);
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
  const [
    gen4Species,
    gen4Forms,
    gen4Variants,
    gen4Released,
    allVariants,
    presentationCounts,
    ivRecommendations,
    edge030031,
    edge341342,
    edge371372,
    boundaryForms,
    roserade,
    roseradeEdges,
    legacyRoseradeStub,
  ] = await Promise.all([
    prisma.pokemonSpecies.count({ where: { dexNumber: { gte: 387, lte: 416 } } }),
    prisma.pokemonForm.count({ where: { species: { dexNumber: { gte: 387, lte: 416 } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } }, releaseStatus: "RELEASED" } }),
    prisma.battleVariant.count(),
    getDashboardRows().then((rows) => ({
      familyCount: buildFamilyOverviews(buildFormOverviews(rows)).length,
      trueDataPending: rows.filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING").length,
    })),
    prisma.ivRecommendation.count(),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "030-kanto", toFormId: "031-kanto" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "341-hoenn", toFormId: "342-hoenn" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "371-hoenn", toFormId: "372-hoenn" } }),
    prisma.pokemonForm.findMany({
      where: { id: { in: ["342-hoenn", "372-hoenn"] } },
      select: { id: true, isEvolutionStub: true, regionKey: true, species: { select: { generation: true } } },
    }),
    prisma.pokemonForm.findUnique({
      where: { id: "407-sinnoh" },
      select: {
        id: true,
        formKey: true,
        formNameEn: true,
        formNameZhTw: true,
        regionKey: true,
        isEvolutionStub: true,
        evolvesFromFormId: true,
        species: { select: { generation: true, familyKey: true } },
      },
    }),
    prisma.evolutionPath.findMany({
      where: { fromFormId: "315-hoenn", toFormId: "407-sinnoh" },
      select: { id: true },
    }),
    prisma.pokemonForm.findUnique({ where: { id: "407-other" } }),
  ]);
  if (gen4Species !== 30 || gen4Forms !== 34 || gen4Variants !== 136 || gen4Released !== 78) {
    throw new Error(`Unexpected Gen4 rebuild boundary: species=${gen4Species}, forms=${gen4Forms}, variants=${gen4Variants}, released=${gen4Released}.`);
  }
  if (allVariants !== 1912) {
    throw new Error(`Full rebuild produced ${allVariants} BattleVariants; expected exactly 1912.`);
  }
  if (presentationCounts.familyCount !== 245 || ivRecommendations !== 13) {
    throw new Error(`Unexpected full-scope invariants: families=${presentationCounts.familyCount}, ivRecommendations=${ivRecommendations}.`);
  }
  if (presentationCounts.trueDataPending !== 0) {
    throw new Error(`Full rebuild produced ${presentationCounts.trueDataPending} current TRUE_DATA_PENDING evaluations; expected 0.`);
  }
  if (!edge030031 || !edge341342 || !edge371372) {
    throw new Error("One or more deferred adjacent-batch evolution edges were not restored by their owning importer.");
  }
  if (
    boundaryForms.length !== 2 ||
    boundaryForms.some((form) => form.isEvolutionStub || form.regionKey !== "HOENN" || form.species.generation !== 3)
  ) {
    throw new Error("Adjacent Gen3 boundary forms were not materialized as owning-batch forms.");
  }
  if (
    !roserade ||
    roserade.formKey !== "SINNOH" ||
    roserade.formNameEn !== "Sinnoh" ||
    roserade.formNameZhTw !== "神奧" ||
    roserade.regionKey !== "SINNOH" ||
    roserade.isEvolutionStub ||
    roserade.evolvesFromFormId !== "315-hoenn" ||
    roserade.species.generation !== 4 ||
    roserade.species.familyKey !== "HOENN_FAMILY_315"
  ) {
    throw new Error("Canonical Roserade form did not transition to its owning Gen4 identity.");
  }
  if (roseradeEdges.length !== 1 || legacyRoseradeStub) {
    throw new Error("Roserade has a legacy form or a non-unique canonical evolution edge.");
  }
  console.log(`Full research rebuild verified through #416: ${allVariants} total BattleVariants.`);
} finally {
  await prisma.$disconnect();
}
