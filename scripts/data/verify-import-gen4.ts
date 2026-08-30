import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { BATCH_REGISTRY, getBatchByKey } from "../../src/config/batch-registry";
import { getGen4BatchDefinitions, getGen4BatchDefinition } from "../../src/data/batch-gen4";
import { loadCrossGenerationEvolutionData } from "../../src/data/cross-generation-evolution";
import { getDatabaseUrl, resolveDatabaseLocation } from "../../src/lib/database";
import { closeGen4Import, runImportGen4 } from "./import-gen4";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function client(url: string) {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

function regionForSuffix(suffix: string) {
  const regions: Record<string, string> = {
    kanto: "KANTO",
    johto: "JOHTO",
    hoenn: "HOENN",
    sinnoh: "SINNOH",
  };
  return regions[suffix] ?? "OTHER";
}

async function seedExternalForms(url: string) {
  const db = client(url);
  try {
    const definitions = getGen4BatchDefinitions();
    const ownedFormIds = new Set(
      definitions.flatMap((definition) => definition.forms.map((form) => form.id)),
    );
    const manifest = await loadCrossGenerationEvolutionData();
    const externalIds = new Set<string>();
    for (const definition of definitions) {
      for (const [fromFormId, toFormId] of definition.evolutionPairs) {
        if (!ownedFormIds.has(fromFormId)) externalIds.add(fromFormId);
        if (!ownedFormIds.has(toFormId)) externalIds.add(toFormId);
      }
    }
    for (const path of manifest.paths) {
      if (!ownedFormIds.has(path.fromFormId)) externalIds.add(path.fromFormId);
    }

    for (const id of externalIds) {
      const match = /^(\d+)-([a-z-]+)$/.exec(id);
      if (!match) throw new Error(`Cannot seed external Gen4 fixture form ${id}.`);
      const dexNumber = Number(match[1]);
      const suffix = match[2]!;
      const speciesId = `species-${String(dexNumber).padStart(3, "0")}`;
      const regionKey = regionForSuffix(suffix);
      await db.pokemonSpecies.upsert({
        where: { id: speciesId },
        create: {
          id: speciesId,
          dexNumber,
          nameEn: `fixture-${dexNumber}`,
          nameZhTw: `fixture-${dexNumber}`,
          generation: dexNumber >= 252 ? 3 : dexNumber >= 152 ? 2 : 1,
          familyKey: `FIXTURE_FAMILY_${dexNumber}`,
        },
        update: {},
      });
      await db.pokemonForm.upsert({
        where: { id },
        create: {
          id,
          speciesId,
          formKey: suffix.toUpperCase(),
          formNameEn: suffix,
          formNameZhTw: suffix,
          regionKey: regionKey as never,
          types: JSON.stringify(["NORMAL"]),
          searchAliases: JSON.stringify([id]),
          evolvesFromFormId: null,
          evolutionFamilyNotesZhTw: "Generic Gen4 importer fixture.",
          isReleasedInPokemonGo: true,
          releaseStatus: "RELEASED",
          isEvolutionStub: false,
        },
        update: {},
      });
    }

    // Deliberately seed the superseded identity. The owning #387-#416 import
    // must remove it without a Roserade-specific branch.
    await db.pokemonSpecies.upsert({
      where: { id: "species-407" },
      create: {
        id: "species-407",
        dexNumber: 407,
        nameEn: "fixture-roserade",
        nameZhTw: "fixture-roserade",
        generation: 4,
        familyKey: "HOENN_FAMILY_315",
      },
      update: {},
    });
    await db.pokemonForm.upsert({
      where: { id: "407-other" },
      create: {
        id: "407-other",
        speciesId: "species-407",
        formKey: "OTHER",
        formNameEn: "Other",
        formNameZhTw: "Other",
        regionKey: "OTHER",
        types: JSON.stringify(["GRASS", "POISON"]),
        searchAliases: JSON.stringify(["407-other"]),
        evolvesFromFormId: "315-hoenn",
        evolutionFamilyNotesZhTw: "Superseded fixture identity.",
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED",
        isEvolutionStub: true,
      },
      update: { isEvolutionStub: true },
    });
    await db.evolutionPath.upsert({
      where: { id: "fixture-315-to-407-other" },
      create: {
        id: "fixture-315-to-407-other",
        fromFormId: "315-hoenn",
        toFormId: "407-other",
        evolutionMethodZhTw: "Superseded fixture edge.",
        availabilityNotesZhTw: "Superseded fixture edge.",
        requiresEvent: false,
        verifiedAt: null,
      },
      update: {},
    });

    // Seed one canonical future identity as a stub too. The owning import
    // must carry its generic target metadata into the real form.
    await db.pokemonForm.upsert({
      where: { id: "407-sinnoh" },
      create: {
        id: "407-sinnoh",
        speciesId: "species-407",
        formKey: "SINNOH",
        formNameEn: "Sinnoh",
        formNameZhTw: "神奧",
        regionKey: "SINNOH",
        types: JSON.stringify(["GRASS", "POISON"]),
        searchAliases: JSON.stringify(["407-sinnoh"]),
        evolvesFromFormId: "315-hoenn",
        evolutionFamilyNotesZhTw: "Future canonical form fixture.",
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED",
        isEvolutionStub: true,
        evolutionTargetUseLevel: "SPECIAL_USE",
        evolutionTargetNotesZhTw: "Preserve this metadata during ownership transition.",
      },
      update: {
        isEvolutionStub: true,
        evolutionTargetUseLevel: "SPECIAL_USE",
        evolutionTargetNotesZhTw: "Preserve this metadata during ownership transition.",
      },
    });
  } finally {
    await db.$disconnect();
  }
}

function expectedVariantIds(batch: string) {
  const definition = getGen4BatchDefinition(batch);
  const ids = definition.forms.flatMap((form) =>
    ["normal", "shadow", "purified", "dynamax"].map((variant) => `${form.id}-${variant}`),
  );
  return new Set([...ids, ...definition.specialVariants.map((variant) => variant.id)]);
}

async function verifyBatch(url: string, batch: string) {
  const entry = getBatchByKey(batch);
  assert(entry.import.adapter === "gen4", `${batch}: batch is not owned by the Gen4 adapter.`);
  const definition = getGen4BatchDefinition(batch);
  const db = client(url);
  try {
    const scope = {
      pokemonForm: { species: { dexNumber: { gte: entry.minDex, lte: entry.maxDex } } },
    };
    const [species, forms, variants, released, categories, evaluations, rows] = await Promise.all([
      db.pokemonSpecies.count({ where: { dexNumber: { gte: entry.minDex, lte: entry.maxDex } } }),
      db.pokemonForm.count({
        where: { species: { dexNumber: { gte: entry.minDex, lte: entry.maxDex } } },
      }),
      db.battleVariant.findMany({ where: scope, select: { id: true } }),
      db.battleVariant.count({ where: { ...scope, releaseStatus: "RELEASED" } }),
      db.categoryEvaluation.count({ where: { battleVariant: scope } }),
      db.retentionEvaluation.count({ where: { battleVariant: scope } }),
      db.pokemonForm.findMany({
        where: { species: { dexNumber: { gte: entry.minDex, lte: entry.maxDex } } },
        select: { id: true },
      }),
    ]);
    const expectedIds = expectedVariantIds(batch);
    const actualIds = new Set(variants.map((variant) => variant.id));
    const expectedReleased =
      definition.releasedNormalForms.size +
      definition.releasedShadowForms.size * 2 +
      definition.releasedDynamaxForms.size +
      [...definition.specialVariants].filter((variant) => variant.released).length;
    assert(
      species === definition.species.length,
      `${batch}: species count ${species} does not match source.`,
    );
    assert(
      forms === definition.forms.length,
      `${batch}: form count ${forms} does not match source.`,
    );
    assert(
      actualIds.size === expectedIds.size && [...expectedIds].every((id) => actualIds.has(id)),
      `${batch}: persisted variants differ from the generic plan.`,
    );
    assert(
      released === expectedReleased,
      `${batch}: released variant count ${released} does not match source.`,
    );
    assert(categories === expectedIds.size * 7, `${batch}: category count is not complete.`);
    assert(
      evaluations === expectedIds.size,
      `${batch}: retention evaluation count is not complete.`,
    );
    assert(
      rows.length === definition.forms.length,
      `${batch}: persisted form identity count is not complete.`,
    );
  } finally {
    await db.$disconnect();
  }
}

async function verifyCanonicalTransition(url: string) {
  const db = client(url);
  try {
    const [roserade, legacy, edges] = await Promise.all([
      db.pokemonForm.findUnique({
        where: { id: "407-sinnoh" },
        select: {
          formKey: true,
          formNameEn: true,
          formNameZhTw: true,
          regionKey: true,
          isEvolutionStub: true,
          evolvesFromFormId: true,
          evolutionTargetUseLevel: true,
          evolutionTargetNotesZhTw: true,
        },
      }),
      db.pokemonForm.findUnique({ where: { id: "407-other" } }),
      db.evolutionPath.findMany({
        where: { fromFormId: "315-hoenn", toFormId: "407-sinnoh" },
        select: { id: true },
      }),
    ]);
    assert(
      roserade?.formKey === "SINNOH" &&
        roserade.formNameEn === "Sinnoh" &&
        roserade.formNameZhTw === "\u795e\u5967" &&
        roserade.regionKey === "SINNOH" &&
        !roserade.isEvolutionStub &&
        roserade.evolvesFromFormId === "315-hoenn" &&
        roserade.evolutionTargetUseLevel === "SPECIAL_USE" &&
        roserade.evolutionTargetNotesZhTw === "Preserve this metadata during ownership transition.",
      "The owning Gen4 import did not materialize canonical Roserade.",
    );
    assert(
      !legacy && edges.length === 1,
      "The Roserade identity or edge is not canonical and unique.",
    );
  } finally {
    await db.$disconnect();
  }
}

async function verifyProtectedSupersededStub(url: string) {
  const seed = client(url);
  try {
    await seed.pokemonForm.upsert({
      where: { id: "407-other" },
      create: {
        id: "407-other",
        speciesId: "species-407",
        formKey: "OTHER",
        formNameEn: "Other",
        formNameZhTw: "Other",
        regionKey: "OTHER",
        types: JSON.stringify(["GRASS", "POISON"]),
        searchAliases: JSON.stringify(["407-other"]),
        evolvesFromFormId: "315-hoenn",
        evolutionFamilyNotesZhTw: "Protected superseded fixture identity.",
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED",
        isEvolutionStub: true,
      },
      update: { isEvolutionStub: true },
    });
    await seed.battleVariant.upsert({
      where: { id: "fixture-407-other-normal" },
      create: {
        id: "fixture-407-other-normal",
        pokemonFormId: "407-other",
        variantKey: "NORMAL",
        isReleased: true,
        releaseStatus: "RELEASED",
        notesZhTw: "Protected superseded fixture variant.",
      },
      update: {},
    });
  } finally {
    await seed.$disconnect();
  }

  let rejected = false;
  try {
    const result = await runImportGen4("387-416", url);
    await closeGen4Import(result);
  } catch (error) {
    rejected = error instanceof Error && error.message.includes("child data: 407-other");
  }
  assert(rejected, "The importer must refuse to delete a superseded stub with battle data.");

  const verify = client(url);
  try {
    const protectedVariant = await verify.battleVariant.findUnique({
      where: { id: "fixture-407-other-normal" },
      select: { pokemonFormId: true },
    });
    assert(
      protectedVariant?.pokemonFormId === "407-other",
      "A rejected superseded-stub transition must preserve its existing battle data.",
    );
  } finally {
    await verify.$disconnect();
  }

  const cleanup = client(url);
  try {
    await cleanup.battleVariant.delete({ where: { id: "fixture-407-other-normal" } });
    await cleanup.pokemonForm.delete({ where: { id: "407-other" } });
  } finally {
    await cleanup.$disconnect();
  }
}

async function verifyEvidenceAdapters(url: string) {
  const db = client(url);
  try {
    const [
      legacyEvaluation,
      genericEvaluation,
      legacyVariant,
      legacyRocket,
      genericVariant,
      genericRocket,
      genericCategorySource,
      genericEvaluationSource,
      genericEvolution,
      genericTrace,
      genericSource,
      genericChange,
    ] = await Promise.all([
      db.retentionEvaluation.findUnique({
        where: { id: "gen4-387-416-eval-387-sinnoh-normal" },
        select: { pvpSummaryZhTw: true, reasonZhTw: true, reviewNotesZhTw: true },
      }),
      db.retentionEvaluation.findUnique({
        where: { id: "gen4-417-446-eval-417-sinnoh-normal" },
        select: { pvpSummaryZhTw: true, reasonZhTw: true, reviewNotesZhTw: true },
      }),
      db.battleVariant.findUnique({
        where: { id: "387-sinnoh-normal" },
        select: { notesZhTw: true, purificationRiskZhTw: true },
      }),
      db.categoryEvaluation.findUnique({
        where: { id: "category-387-sinnoh-normal-rocket" },
        select: { summaryZhTw: true },
      }),
      db.battleVariant.findUnique({
        where: { id: "417-sinnoh-normal" },
        select: { notesZhTw: true },
      }),
      db.categoryEvaluation.findUnique({
        where: { id: "category-417-sinnoh-normal-rocket" },
        select: { summaryZhTw: true },
      }),
      db.categoryEvaluationSource.findFirst({
        where: { categoryEvaluationId: "category-417-sinnoh-normal-evolution_value" },
        select: { usageZhTw: true },
      }),
      db.evaluationSource.findFirst({
        where: { evaluationId: "gen4-417-446-eval-417-sinnoh-normal" },
        select: { usageZhTw: true },
      }),
      db.evolutionPath.findUnique({
        where: { id: "evolution-gen4-417-446-418-sinnoh-419-sinnoh" },
        select: { evolutionMethodZhTw: true, availabilityNotesZhTw: true },
      }),
      db.evaluationRuleTrace.findUnique({
        where: { id: "gen4-417-446-trace-417-sinnoh-normal" },
        select: { explanationZhTw: true },
      }),
      db.sourceReference.findUnique({
        where: { id: "SECONDARY-SINNOH-POKEDEX-20260816" },
        select: { sourceSummaryZhTw: true },
      }),
      db.changeLog.findUnique({
        where: { id: "gen4-417-446-batch" },
        select: { changeReasonZhTw: true },
      }),
    ]);
    assert(
      legacyEvaluation?.pvpSummaryZhTw.startsWith("GL（超級聯盟）") &&
        !legacyEvaluation.reasonZhTw.includes("current battle") &&
        legacyEvaluation.reviewNotesZhTw.includes("已核對神奧型態") &&
        legacyVariant?.notesZhTw === "普通版本；與暗影、淨化及 Max 分開評估。" &&
        legacyRocket?.summaryZhTw === "火箭隊沒有統一逐物種排名；此欄缺來源不單獨觸發暫時保留。",
      "The historical Gen4 evidence adapter did not preserve its reviewed presentation.",
    );
    const hasTraditionalChinese = (value: string | null | undefined) =>
      Boolean(value && /[\u3400-\u9fff]/u.test(value));
    assert(
      genericEvaluation &&
        hasTraditionalChinese(genericEvaluation.pvpSummaryZhTw) &&
        hasTraditionalChinese(genericEvaluation.reasonZhTw) &&
        hasTraditionalChinese(genericEvaluation.reviewNotesZhTw) &&
        hasTraditionalChinese(genericVariant?.notesZhTw) &&
        hasTraditionalChinese(genericRocket?.summaryZhTw) &&
        hasTraditionalChinese(genericCategorySource?.usageZhTw) &&
        hasTraditionalChinese(genericEvaluationSource?.usageZhTw) &&
        hasTraditionalChinese(genericEvolution?.evolutionMethodZhTw) &&
        hasTraditionalChinese(genericEvolution?.availabilityNotesZhTw) &&
        hasTraditionalChinese(genericTrace?.explanationZhTw) &&
        hasTraditionalChinese(genericSource?.sourceSummaryZhTw) &&
        hasTraditionalChinese(genericChange?.changeReasonZhTw),
      "The generic Gen4 evidence adapter did not produce Traditional Chinese presentation.",
    );
  } finally {
    await db.$disconnect();
  }
}

const url = getDatabaseUrl();
const actualDatabase = resolveDatabaseLocation(url).absolutePath;
const fixtureDatabase = resolveDatabaseLocation("file:./gen4-ci.db").absolutePath;
if (actualDatabase !== fixtureDatabase) {
  throw new Error("Gen4 importer verification requires DATABASE_URL=file:./gen4-ci.db.");
}
await seedExternalForms(url);
const gen4Entries = BATCH_REGISTRY.filter((entry) => entry.import.adapter === "gen4");
for (const entry of gen4Entries) {
  const result = await runImportGen4(entry.key, url);
  await closeGen4Import(result);
  await verifyBatch(url, entry.key);
}
for (const entry of gen4Entries) {
  const result = await runImportGen4(entry.key, url);
  await closeGen4Import(result);
}
for (const entry of gen4Entries) await verifyBatch(url, entry.key);
await verifyCanonicalTransition(url);
await verifyProtectedSupersededStub(url);
await verifyEvidenceAdapters(url);
console.log(
  `Generic Gen4 persistence importer verified for ${gen4Entries.map((entry) => entry.key).join(", ")}.`,
);
