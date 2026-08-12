import "dotenv/config";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database";

const databaseUrl = getDatabaseUrl();
if (process.env.ALLOW_DESTRUCTIVE_REBUILD !== "1" || !databaseUrl.includes("rebuild-ci")) {
  throw new Error("Full research rebuild is CI-only; set ALLOW_DESTRUCTIVE_REBUILD=1 and use a rebuild-ci database.");
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env: process.env });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with ${code}.`)),
    );
  });
}

type SeedResearch = {
  evolutionPaths: Array<{ fromFormId: string; toFormId: string }>;
};

async function runBaseSeedWithDeferredBoundaryEdge() {
  const path = "research_notes/official-001-030.json";
  const original = await readFile(path, "utf8");
  const research = JSON.parse(original) as SeedResearch;
  const deferred = research.evolutionPaths.filter(
    (edge) => edge.fromFormId === "030-kanto" && edge.toFormId === "031-kanto",
  );
  if (deferred.length !== 1) {
    throw new Error(`Expected exactly one deferred 030-kanto->031-kanto seed edge, found ${deferred.length}.`);
  }
  const remaining = research.evolutionPaths.filter(
    (edge) => !(edge.fromFormId === "030-kanto" && edge.toFormId === "031-kanto"),
  );
  if (remaining.length !== research.evolutionPaths.length - 1) {
    throw new Error("Unexpected seed evolution-edge filtering result.");
  }

  await writeFile(path, `${JSON.stringify({ ...research, evolutionPaths: remaining }, null, 2)}\n`);
  try {
    await run(npm, ["run", "db:seed"]);
  } finally {
    await writeFile(path, original);
  }
}

const imports = [
  "data:import:031-060",
  "data:import:061-090",
  "data:import:091-120",
  "data:import:121-151",
  "data:import:152-181",
  "data:import:182-211",
  "data:import:212-241",
  "data:import:242-251",
  "data:import:252-281",
  "data:import:282-311",
  "data:import:312-341",
  "data:import:342-371",
  "data:import:372-386",
  "data:import:387-416",
] as const;

await run(npx, ["prisma", "db", "push", "--force-reset"]);
await runBaseSeedWithDeferredBoundaryEdge();
// The original #001-#030 seed predates the seven-category data model. This
// existing remediation is the historical bridge that upgrades those 153
// variants before later importers enforce global category completeness.
await run(npm, ["run", "data:remediate"]);
for (const script of imports) await run(npm, ["run", script]);
await run(npm, ["run", "data:backfill-iv"]);
await run(npm, ["run", "data:validate"]);

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
try {
  const [gen4Species, gen4Forms, gen4Variants, gen4Released, allVariants, boundaryEdge] = await Promise.all([
    prisma.pokemonSpecies.count({ where: { dexNumber: { gte: 387, lte: 416 } } }),
    prisma.pokemonForm.count({ where: { species: { dexNumber: { gte: 387, lte: 416 } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } }, releaseStatus: "RELEASED" } }),
    prisma.battleVariant.count(),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "030-kanto", toFormId: "031-kanto" } }),
  ]);
  if (gen4Species !== 30 || gen4Forms !== 34 || gen4Variants !== 136 || gen4Released !== 78) {
    throw new Error(`Unexpected Gen4 rebuild boundary: species=${gen4Species}, forms=${gen4Forms}, variants=${gen4Variants}, released=${gen4Released}.`);
  }
  if (allVariants < 1912) {
    throw new Error(`Full rebuild produced only ${allVariants} BattleVariants; expected at least the published 1776 + Gen4 136.`);
  }
  if (!boundaryEdge) throw new Error("#031 importer did not restore the deferred 030-kanto->031-kanto evolution edge.");
  console.log(`Full research rebuild verified through #416: ${allVariants} total BattleVariants.`);
} finally {
  await prisma.$disconnect();
}
