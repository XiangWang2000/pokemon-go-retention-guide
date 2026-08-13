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

type BoundaryStub = {
  dexNumber: 342 | 372;
  nameEn: string;
  nameZhTw: string;
  familyKey: string;
  types: readonly string[];
};

async function ensureAdjacentBatchTarget(stub: BoundaryStub) {
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
  const id = `${stub.dexNumber}-hoenn`;
  const speciesId = `species-${stub.dexNumber}`;
  try {
    await prisma.pokemonSpecies.upsert({
      where: { id: speciesId },
      create: {
        id: speciesId,
        dexNumber: stub.dexNumber,
        nameEn: stub.nameEn,
        nameZhTw: stub.nameZhTw,
        generation: 3,
        familyKey: stub.familyKey,
      },
      update: {},
    });
    await prisma.pokemonForm.upsert({
      where: { id },
      create: {
        id,
        speciesId,
        formKey: "HOENN",
        formNameEn: "Hoenn",
        formNameZhTw: "豐緣",
        regionKey: "HOENN",
        types: JSON.stringify(stub.types),
        searchAliases: JSON.stringify([stub.nameEn, stub.nameZhTw]),
        evolvesFromFormId: null,
        evolutionFamilyNotesZhTw: "CI full-rebuild adjacent-batch boundary stub; the owning importer replaces this form.",
        isReleasedInPokemonGo: true,
        releaseStatus: "UNKNOWN",
        isEvolutionStub: true,
      },
      update: {},
    });
  } finally {
    await prisma.$disconnect();
  }
}

type CrossGenerationManifest = {
  targets: Array<{
    dexNumber: number;
    formKey: string;
    formNameEn: string;
    formNameZhTw: string;
    regionKey: string;
  }>;
  paths: Array<{ fromFormId: string; toFormId: string }>;
};

async function runLegacyRecomputeWithCanonicalRoseradeStub() {
  const path = "research_notes/cross-generation-evolution-targets.json";
  const original = await readFile(path, "utf8");
  const manifest = JSON.parse(original.replace(/^\uFEFF/, "")) as CrossGenerationManifest;
  const roserade = manifest.targets.filter(
    (target) => target.dexNumber === 407 && target.formKey === "OTHER",
  );
  const roseradePaths = manifest.paths.filter(
    (edge) => edge.toFormId === "407-other" && edge.fromFormId === "315-hoenn",
  );
  if (roserade.length !== 1 || roseradePaths.length !== 1) {
    throw new Error(
      `Expected one legacy Roserade target/path, found targets=${roserade.length}, paths=${roseradePaths.length}.`,
    );
  }

  roserade[0].formKey = "SINNOH";
  roserade[0].formNameEn = "Sinnoh";
  roserade[0].formNameZhTw = "神奧";
  // Keep OTHER during the historical recompute because the legacy
  // cross-generation validator predates SINNOH. The Gen4 importer upgrades
  // the same 407-sinnoh row to regionKey=SINNOH immediately afterwards.
  roserade[0].regionKey = "OTHER";
  roseradePaths[0].toFormId = "407-sinnoh";

  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  try {
    await run(npm, ["run", "data:recompute:001-386"]);
  } finally {
    await writeFile(path, original);
  }
}

async function handRoseradeEvolutionEdgeToGen4() {
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
  const expectedId = "evolution-gen4-387-416-315-hoenn-407-sinnoh";
  try {
    const edges = await prisma.evolutionPath.findMany({
      where: { fromFormId: "315-hoenn", toFormId: "407-sinnoh" },
      select: { id: true },
    });
    if (edges.length !== 1) {
      throw new Error(`Expected exactly one pre-Gen4 Roserade evolution edge, found ${edges.length}.`);
    }
    if (edges[0].id !== expectedId) {
      await prisma.evolutionPath.update({
        where: { id: edges[0].id },
        data: { id: expectedId },
      });
    }
  } finally {
    await prisma.$disconnect();
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

for (const script of imports) {
  // The Gen3 source files intentionally record evolution edges that cross the
  // adjacent batch boundary. A fresh database needs the target form to satisfy
  // FK integrity. The stub stays parentless because the parent is created by
  // the current importer; the owning next-batch importer later replaces the
  // stub and writes the canonical parent pointer itself.
  if (script === "data:import:312-341") {
    await ensureAdjacentBatchTarget({
      dexNumber: 342,
      nameEn: "crawdaunt",
      nameZhTw: "鐵螯龍蝦",
      familyKey: "HOENN_FAMILY_341",
      types: ["WATER", "DARK"],
    });
  }
  if (script === "data:import:342-371") {
    await ensureAdjacentBatchTarget({
      dexNumber: 372,
      nameEn: "shelgon",
      nameZhTw: "甲殼龍",
      familyKey: "HOENN_FAMILY_371",
      types: ["DRAGON"],
    });
  }
  if (script === "data:import:387-416") {
    // #001-#386 historically require the current global reconciliation after
    // all legacy importers finish. It fills the modern assessment disposition
    // and four-level PvE-use fields without weakening data:validate. During
    // this replay, map the old Roserade OTHER stub onto its now-canonical
    // Sinnoh form so the Gen4 importer can upgrade the same row in place.
    await runLegacyRecomputeWithCanonicalRoseradeStub();
    // Reuse the historical endpoint row under the deterministic Gen4 edge ID.
    // The Gen4 importer then upserts the same edge instead of creating a
    // duplicate 315-hoenn -> 407-sinnoh path.
    await handRoseradeEvolutionEdgeToGen4();
  }
  await run(npm, ["run", script]);
}
await run(npm, ["run", "data:backfill-iv"]);
await run(npm, ["run", "data:validate"]);

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
try {
  const [
    gen4Species,
    gen4Forms,
    gen4Variants,
    gen4Released,
    allVariants,
    edge030031,
    edge341342,
    edge371372,
    legacyRoseradeStub,
  ] = await Promise.all([
    prisma.pokemonSpecies.count({ where: { dexNumber: { gte: 387, lte: 416 } } }),
    prisma.pokemonForm.count({ where: { species: { dexNumber: { gte: 387, lte: 416 } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } } } }),
    prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } }, releaseStatus: "RELEASED" } }),
    prisma.battleVariant.count(),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "030-kanto", toFormId: "031-kanto" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "341-hoenn", toFormId: "342-hoenn" } }),
    prisma.evolutionPath.findFirst({ where: { fromFormId: "371-hoenn", toFormId: "372-hoenn" } }),
    prisma.pokemonForm.findUnique({ where: { id: "407-other" } }),
  ]);
  if (gen4Species !== 30 || gen4Forms !== 34 || gen4Variants !== 136 || gen4Released !== 78) {
    throw new Error(`Unexpected Gen4 rebuild boundary: species=${gen4Species}, forms=${gen4Forms}, variants=${gen4Variants}, released=${gen4Released}.`);
  }
  if (allVariants < 1912) {
    throw new Error(`Full rebuild produced only ${allVariants} BattleVariants; expected at least the published 1776 + Gen4 136.`);
  }
  if (!edge030031 || !edge341342 || !edge371372) {
    throw new Error("One or more deferred adjacent-batch evolution edges were not restored by their owning importer.");
  }
  if (legacyRoseradeStub) {
    throw new Error("Legacy 407-other Roserade stub survived the Gen4 rebuild migration.");
  }
  console.log(`Full research rebuild verified through #416: ${allVariants} total BattleVariants.`);
} finally {
  await prisma.$disconnect();
}
