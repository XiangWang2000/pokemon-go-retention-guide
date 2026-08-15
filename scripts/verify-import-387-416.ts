import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database";
import { closeGen4Import, runImport387416 } from "./import-gen4";

function ok(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

function client(url: string) {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

async function seedHistoricalPrerequisites(url: string) {
  const db = client(url);
  try {
    await db.pokemonSpecies.create({ data: { id: "species-315", dexNumber: 315, nameEn: "roselia", nameZhTw: "毒薔薇", generation: 3, familyKey: "HOENN_FAMILY_315" } });
    await db.pokemonForm.create({ data: { id: "315-hoenn", speciesId: "species-315", formKey: "HOENN", formNameEn: "Hoenn", formNameZhTw: "豐緣", regionKey: "HOENN", types: '["GRASS","POISON"]', searchAliases: '["Roselia","毒薔薇"]', evolutionFamilyNotesZhTw: "CI fixture", isReleasedInPokemonGo: true, releaseStatus: "RELEASED", isEvolutionStub: false } });
    await db.pokemonSpecies.create({ data: { id: "species-407", dexNumber: 407, nameEn: "roserade", nameZhTw: "羅絲雷朵", generation: 4, familyKey: "HOENN_FAMILY_315" } });
    await db.pokemonForm.create({ data: { id: "407-sinnoh", speciesId: "species-407", formKey: "SINNOH", formNameEn: "Sinnoh", formNameZhTw: "神奧", regionKey: "SINNOH", types: '["GRASS","POISON"]', searchAliases: '["Roserade","羅絲雷朵"]', evolvesFromFormId: "315-hoenn", evolutionFamilyNotesZhTw: "CI future-form stub", isReleasedInPokemonGo: true, releaseStatus: "RELEASED", isEvolutionStub: true } });
    await db.evolutionPath.create({ data: { id: "evolution-cross-315-hoenn-407-sinnoh", fromFormId: "315-hoenn", toFormId: "407-sinnoh", evolutionMethodZhTw: "CI future-form stub", availabilityNotesZhTw: "CI future-form stub", requiresEvent: false, verifiedAt: null } });
    const accessedAt = new Date("2026-08-13T00:00:00+08:00");
    await db.sourceReference.createMany({ data: [
      { id: "pvpoke-gl-20260715", sourceName: "PvPoke fixed ranking snapshot", sourceUrl: "https://pvpoke.com/rankings/all/1500/overall/", sourceType: "PVP", sourceTitleOriginal: "PvPoke Great League Open Overall Rankings", sourceLanguage: "en", sourceSummaryZhTw: "CI historical source fixture", accessedAt, dataVersion: "fixture", notes: "Existing source from prior batches." },
      { id: "pvpoke-ul-20260715", sourceName: "PvPoke fixed ranking snapshot", sourceUrl: "https://pvpoke.com/rankings/all/2500/overall/", sourceType: "PVP", sourceTitleOriginal: "PvPoke Ultra League Open Overall Rankings", sourceLanguage: "en", sourceSummaryZhTw: "CI historical source fixture", accessedAt, dataVersion: "fixture", notes: "Existing source from prior batches." },
      { id: "pvpoke-ml-20260715", sourceName: "PvPoke fixed ranking snapshot", sourceUrl: "https://pvpoke.com/rankings/all/10000/overall/", sourceType: "PVP", sourceTitleOriginal: "PvPoke Master League Open Overall Rankings", sourceLanguage: "en", sourceSummaryZhTw: "CI historical source fixture", accessedAt, dataVersion: "fixture", notes: "Existing source from prior batches." }
    ] });
  } finally {
    await db.$disconnect();
  }
}

async function verify(url: string) {
  const db = client(url);
  try {
    const scope = { pokemonForm: { species: { dexNumber: { gte: 387, lte: 416 } } } };
    const [species, forms, variants, released, categories, evaluations, roselia, roserade, legacyRoserade, roseradeEdges, purified, shadowPve, normalPve, shadowEmpoleon, rampardos, dmaxCombee] = await Promise.all([
      db.pokemonSpecies.count({ where: { dexNumber: { gte: 387, lte: 416 } } }),
      db.pokemonForm.count({ where: { species: { dexNumber: { gte: 387, lte: 416 } } } }),
      db.battleVariant.count({ where: scope }),
      db.battleVariant.count({ where: { ...scope, releaseStatus: "RELEASED" } }),
      db.categoryEvaluation.count({ where: { battleVariant: scope } }),
      db.retentionEvaluation.count({ where: { battleVariant: scope } }),
      db.pokemonForm.findUnique({ where: { id: "315-hoenn" } }),
      db.pokemonForm.findUnique({ where: { id: "407-sinnoh" } }),
      db.pokemonForm.findUnique({ where: { id: "407-other" } }),
      db.evolutionPath.findMany({ where: { fromFormId: "315-hoenn", toFormId: "407-sinnoh" }, select: { id: true } }),
      db.battleVariant.findUnique({ where: { id: "395-sinnoh-purified" } }),
      db.categoryEvaluation.findUnique({ where: { id: "category-389-sinnoh-shadow-pve" } }),
      db.categoryEvaluation.findUnique({ where: { id: "category-389-sinnoh-normal-pve" } }),
      db.retentionEvaluation.findUnique({ where: { id: "gen4-387-416-eval-395-sinnoh-shadow" } }),
      db.retentionEvaluation.findUnique({ where: { id: "gen4-387-416-eval-409-sinnoh-normal" } }),
      db.retentionEvaluation.findUnique({ where: { id: "gen4-387-416-eval-415-sinnoh-dynamax" } }),
    ]);
    ok(species === 30 && forms === 34, `Unexpected species/forms: ${species}/${forms}`);
    ok(variants === 136 && released === 78, `Unexpected variant boundary: ${variants}/${released}`);
    ok(categories === 952 && evaluations === 136, `Unexpected category/evaluation counts: ${categories}/${evaluations}`);
    ok(roselia?.evolvesFromFormId === "406-sinnoh", "Roselia was not re-parented to Budew");
    ok(roserade?.formKey === "SINNOH" && roserade.formNameEn === "Sinnoh" && roserade.formNameZhTw === "神奧" && roserade.regionKey === "SINNOH" && roserade.evolvesFromFormId === "315-hoenn" && !roserade.isEvolutionStub, "Roserade did not transition from the canonical stub to its owning Gen4 form");
    ok(!legacyRoserade && roseradeEdges.length === 1, "Roserade identity or evolution edge is not canonical and unique");
    ok(purified?.inheritsFromVariantId === "395-sinnoh-normal" && purified.inheritanceMode !== "NONE", "Purified inheritance missing");
    ok(shadowPve?.pveUseLevel === "USABLE_OR_BUDGET" && normalPve?.pveUseLevel === "NO_SIGNIFICANT_USE", "Shadow PvE value leaked into normal Torterra");
    ok(shadowEmpoleon?.finalDecision === "KEEP" && rampardos?.finalDecision === "KEEP" && dmaxCombee?.finalDecision === "KEEP", "Expected core Gen4 decisions missing");
  } finally {
    await db.$disconnect();
  }
}

const url = getDatabaseUrl();
await seedHistoricalPrerequisites(url);
for (let attempt = 0; attempt < 2; attempt += 1) {
  const result = await runImport387416(url);
  await closeGen4Import(result);
  await verify(url);
}
console.log("Gen4 #387-#416 persistence importer verified on temporary SQLite.");
