import "dotenv/config";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { parseCsv } from "../src/data/csv";
import {
  importEntityNames,
  toDate,
  toStoredJson,
  validateImportBatch,
  type ImportEntityName,
} from "../src/data/import-schema";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function validateReferences(entity: ImportEntityName, records: Record<string, unknown>[]) {
  const missing: string[] = [];
  const recordIds = new Set(records.map((record) => String(record.id)));

  async function checkIds(
    label: string,
    ids: string[],
    lookup: (ids: string[]) => Promise<{ id: string }[]>,
    allowBatchReferences = false,
  ) {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) return;
    const existingIds = new Set((await lookup(uniqueIds)).map((item) => item.id));
    for (const id of uniqueIds) {
      if (!existingIds.has(id) && (!allowBatchReferences || !recordIds.has(id)))
        missing.push(`${label} 不存在：${id}`);
    }
  }

  if (entity === "PokemonForm") {
    await checkIds(
      "speciesId",
      records.map((record) => String(record.speciesId)),
      (ids) => prisma.pokemonSpecies.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
    await checkIds(
      "evolvesFromFormId",
      records.map((record) => String(record.evolvesFromFormId ?? "")),
      (ids) => prisma.pokemonForm.findMany({ where: { id: { in: ids } }, select: { id: true } }),
      true,
    );
  } else if (entity === "BattleVariant") {
    await checkIds(
      "pokemonFormId",
      records.map((record) => String(record.pokemonFormId)),
      (ids) => prisma.pokemonForm.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
    await checkIds(
      "inheritsFromVariantId",
      records.map((record) => String(record.inheritsFromVariantId ?? "")),
      (ids) => prisma.battleVariant.findMany({ where: { id: { in: ids } }, select: { id: true } }),
      true,
    );
  } else if (entity === "EvolutionPath") {
    await checkIds(
      "fromFormId",
      records.map((record) => String(record.fromFormId)),
      (ids) => prisma.pokemonForm.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
    await checkIds(
      "toFormId",
      records.map((record) => String(record.toFormId)),
      (ids) => prisma.pokemonForm.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
  } else if (entity === "VariantMove") {
    await checkIds(
      "battleVariantId",
      records.map((record) => String(record.battleVariantId)),
      (ids) => prisma.battleVariant.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
    await checkIds(
      "moveId",
      records.map((record) => String(record.moveId)),
      (ids) => prisma.move.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
  } else if (entity === "RawEvaluationData") {
    await checkIds(
      "battleVariantId",
      records.map((record) => String(record.battleVariantId)),
      (ids) => prisma.battleVariant.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
    await checkIds(
      "sourceId",
      records.map((record) => String(record.sourceId)),
      (ids) =>
        prisma.sourceReference.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    );
  }

  if (missing.length > 0) throw new Error(`匯入前關聯驗證失敗：\n- ${missing.join("\n- ")}`);
}

async function main() {
  const file = process.argv.find(
    (value, index) =>
      index > 1 && !value.startsWith("--") && process.argv[index - 1] !== "--entity",
  );
  if (!file)
    throw new Error("用法：npm run data:import -- <檔案.json|csv> --entity PokemonSpecies");
  const raw = await readFile(file, "utf8");
  const parsedFile =
    extname(file).toLowerCase() === ".csv" ? parseCsv(raw) : JSON.parse(raw.replace(/^\uFEFF/, ""));
  const entityValue =
    argument("--entity") ?? (!Array.isArray(parsedFile) ? parsedFile.entity : undefined);
  if (!importEntityNames.includes(entityValue as ImportEntityName))
    throw new Error(`不支援的 entity：${entityValue ?? "未提供"}`);
  const entity = entityValue as ImportEntityName;
  const records = Array.isArray(parsedFile) ? parsedFile : parsedFile.records;
  if (!Array.isArray(records)) throw new Error("匯入檔必須是陣列，或包含 records 陣列。");
  const validated = validateImportBatch(entity, records);
  if (!validated.success) throw new Error(`匯入前驗證失敗：\n- ${validated.errors.join("\n- ")}`);
  await validateReferences(entity, validated.data.records);

  await prisma.$transaction(async (tx) => {
    for (const record of validated.data.records) {
      const id = String(record.id);
      if (entity === "PokemonSpecies")
        await tx.pokemonSpecies.upsert({
          where: { id },
          create: record as never,
          update: record as never,
        });
      else if (entity === "PokemonForm") {
        const data = {
          ...record,
          types: toStoredJson(record.types),
          searchAliases: toStoredJson(record.searchAliases),
          releaseVerifiedAt: toDate(record.releaseVerifiedAt),
        };
        await tx.pokemonForm.upsert({
          where: { id },
          create: data as never,
          update: data as never,
        });
      } else if (entity === "BattleVariant") {
        const data = { ...record, releaseVerifiedAt: toDate(record.releaseVerifiedAt) };
        await tx.battleVariant.upsert({
          where: { id },
          create: data as never,
          update: data as never,
        });
      } else if (entity === "EvolutionPath") {
        const data = { ...record, verifiedAt: toDate(record.verifiedAt) };
        await tx.evolutionPath.upsert({
          where: { id },
          create: data as never,
          update: data as never,
        });
      } else if (entity === "Move") {
        const data = { ...record, verifiedAt: toDate(record.verifiedAt) };
        await tx.move.upsert({ where: { id }, create: data as never, update: data as never });
      } else if (entity === "VariantMove") {
        const data = { ...record, verifiedAt: toDate(record.verifiedAt) };
        await tx.variantMove.upsert({
          where: { id },
          create: data as never,
          update: data as never,
        });
      } else if (entity === "RawEvaluationData") {
        const data = {
          ...record,
          recommendedMoves: toStoredJson(record.recommendedMoves),
          checkedAt: toDate(record.checkedAt),
        };
        await tx.rawEvaluationData.upsert({
          where: { id },
          create: data as never,
          update: data as never,
        });
      } else {
        const data = {
          ...record,
          accessedAt: toDate(record.accessedAt),
          publishedAt: toDate(record.publishedAt),
        };
        await tx.sourceReference.upsert({
          where: { id },
          create: data as never,
          update: data as never,
        });
      }
    }
  });
  console.log(`匯入完成：${entity} 共 ${validated.data.records.length} 筆；交易已完整提交。`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
