import { readFile } from "node:fs/promises";
import type { PrismaClient } from "../../generated/prisma/client";
import { assertNoTextIntegrityIssues } from "./text-integrity";
import { isRegionKey, type RegionKey } from "./region-key";
import { upsertEvolutionPath } from "./evolution-path";

const sourceFile = "research_notes/cross-generation-evolution-targets.json";

export const evolutionTargetUseLevels = [
  "CORE_INVESTMENT",
  "USABLE_OR_BUDGET",
  "SPECIAL_USE",
  "NO_SIGNIFICANT_USE",
] as const;

type EvolutionTargetUseLevel = (typeof evolutionTargetUseLevels)[number];

interface EvolutionTargetSource {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceTitleOriginal: string;
  sourceLanguage: string;
  sourceUrl: string;
  accessedAt: string;
  sourceSummaryZhTw: string;
}

export interface EvolutionTargetStubSeed {
  dexNumber: number;
  generation: number;
  familyKey: string;
  nameEn: string;
  nameZhTw: string;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: RegionKey;
  types: string[];
  aliases: string[];
  fromFormId: string;
  evolutionTargetUseLevel: EvolutionTargetUseLevel | null;
  evolutionTargetNotesZhTw: string | null;
}

export interface EvolutionTargetPathSeed {
  fromFormId: string;
  toFormId: string;
  evolutionMethodZhTw: string;
  availabilityNotesZhTw: string;
  requiresEvent: boolean;
  verificationStatus: string;
  sourceIds: string[];
}

export interface CrossGenerationEvolutionData {
  dataVersion: string;
  checkedAt: string;
  sources: EvolutionTargetSource[];
  targets: EvolutionTargetStubSeed[];
  paths: EvolutionTargetPathSeed[];
}

function formId(dexNumber: number, formKey: string) {
  return `${String(dexNumber).padStart(3, "0")}-${formKey.toLowerCase()}`;
}

function assertEvolutionData(data: CrossGenerationEvolutionData) {
  assertNoTextIntegrityIssues(data, "cross-generation evolution manifest");
  const sourceIds = new Set(data.sources.map((source) => source.id));
  if (sourceIds.size !== data.sources.length) throw new Error("Duplicate evolution source id.");
  for (const source of data.sources) {
    if (!source.sourceUrl || !source.accessedAt) {
      throw new Error(`Evolution source is incomplete: ${source.id}`);
    }
  }
  const targetIds = new Set<string>();
  const targetSpecies = new Set<number>();
  for (const target of data.targets) {
    const id = formId(target.dexNumber, target.formKey);
    if (targetIds.has(id)) throw new Error(`重複跨世代進化 target：${id}`);
    targetIds.add(id);
    if (!isRegionKey(target.regionKey)) {
      throw new Error(`Evolution target has an invalid region: ${id}.`);
    }
    if (target.generation >= 4 && target.formKey === "KANTO") {
      throw new Error(`Future-generation evolution target cannot use KANTO: ${id}.`);
    }
    if (targetSpecies.has(target.dexNumber) && target.formKey === "KANTO") {
      throw new Error(`重複跨世代進化 species default form：${target.dexNumber}`);
    }
    targetSpecies.add(target.dexNumber);
    if (
      target.evolutionTargetUseLevel &&
      !evolutionTargetUseLevels.includes(target.evolutionTargetUseLevel)
    ) {
      throw new Error(`未知跨世代進化用途層級：${id}`);
    }
    if (!target.fromFormId) throw new Error(`跨世代進化 target 缺少來源：${id}`);
  }

  const pathIds = new Set<string>();
  for (const path of data.paths) {
    const edge = `${path.fromFormId}->${path.toFormId}`;
    if (path.fromFormId === path.toFormId) throw new Error(`跨世代進化自我循環：${edge}`);
    if (pathIds.has(edge)) throw new Error(`重複跨世代進化路徑：${edge}`);
    pathIds.add(edge);
    if (!targetIds.has(path.toFormId)) {
      throw new Error(`跨世代進化 target 未列入 manifest：${path.toFormId}`);
    }
    if (!path.sourceIds.length || path.sourceIds.some((sourceId) => !sourceIds.has(sourceId))) {
      throw new Error(`Evolution path has an unknown source: ${edge}`);
    }
  }

  for (const target of data.targets) {
    const id = formId(target.dexNumber, target.formKey);
    if (!data.paths.some((path) => path.toFormId === id && path.fromFormId === target.fromFormId)) {
      throw new Error(`跨世代進化 target 缺少對應路徑：${target.fromFormId}->${id}`);
    }
  }
}

export async function loadCrossGenerationEvolutionData() {
  const raw = await readFile(sourceFile, "utf8");
  const data = JSON.parse(raw.replace(/^\uFEFF/, "")) as CrossGenerationEvolutionData;
  assertEvolutionData(data);
  return data;
}

function optionalDate(value: string) {
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00+08:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function ensureCrossGenerationEvolutionTargets(prisma: PrismaClient, checkedAt: Date) {
  const data = await loadCrossGenerationEvolutionData();
  const checkedDate = optionalDate(data.checkedAt) ?? checkedAt;
  const targetIds = new Set(data.targets.map((target) => formId(target.dexNumber, target.formKey)));
  const existingFormIds = new Set(
    (await prisma.pokemonForm.findMany({ select: { id: true } })).map((form) => form.id),
  );
  const activeTargets = data.targets.filter((target) => existingFormIds.has(target.fromFormId));
  const activeTargetIds = new Set(
    activeTargets.map((target) => formId(target.dexNumber, target.formKey)),
  );

  const staleKantoStubs = await prisma.pokemonForm.findMany({
    where: {
      isEvolutionStub: true,
      formKey: "KANTO",
      id: { notIn: [...targetIds] },
      battleVariants: { none: {} },
    },
    select: { id: true },
  });
  const staleStubIds = staleKantoStubs.map((stub) => stub.id);
  if (staleStubIds.length) {
    await prisma.evolutionPath.deleteMany({
      where: {
        OR: [
          { fromFormId: { in: staleStubIds } },
          { toFormId: { in: staleStubIds } },
        ],
      },
    });
    await prisma.pokemonForm.deleteMany({ where: { id: { in: staleStubIds } } });
  }

  for (const source of data.sources) {
    await prisma.sourceReference.upsert({
      where: { id: source.id },
      create: {
        id: source.id,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType as never,
        sourceTitleOriginal: source.sourceTitleOriginal,
        sourceLanguage: source.sourceLanguage,
        sourceSummaryZhTw: source.sourceSummaryZhTw,
        accessedAt: optionalDate(source.accessedAt) ?? checkedDate,
        publishedAt: null,
        dataVersion: data.dataVersion,
        notes: "跨世代進化 manifest 的來源紀錄；只用於核對進化關係與目標用途，不替代本批完整戰鬥資料。",
      },
      update: {
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType as never,
        sourceTitleOriginal: source.sourceTitleOriginal,
        sourceLanguage: source.sourceLanguage,
        sourceSummaryZhTw: source.sourceSummaryZhTw,
        accessedAt: optionalDate(source.accessedAt) ?? checkedDate,
        dataVersion: data.dataVersion,
        notes: "跨世代進化 manifest 的來源紀錄；只用於核對進化關係與目標用途，不替代本批完整戰鬥資料。",
      },
    });
  }

  for (const target of activeTargets) {
    const id = formId(target.dexNumber, target.formKey);
    await prisma.pokemonSpecies.upsert({
      where: { id: `species-${String(target.dexNumber).padStart(3, "0")}` },
      create: {
        id: `species-${String(target.dexNumber).padStart(3, "0")}`,
        dexNumber: target.dexNumber,
        nameEn: target.nameEn,
        nameZhTw: target.nameZhTw,
        generation: target.generation,
        familyKey: target.familyKey,
      },
      update: {
        nameEn: target.nameEn,
        nameZhTw: target.nameZhTw,
        generation: target.generation,
        familyKey: target.familyKey,
      },
    });

    const existing = await prisma.pokemonForm.findUnique({
      where: { id },
      select: {
        id: true,
        evolutionFamilyNotesZhTw: true,
        _count: { select: { battleVariants: true } },
      },
    });
    const isStub = !existing || existing._count.battleVariants === 0;
    const targetNote =
      existing && !isStub
        ? existing.evolutionFamilyNotesZhTw
        : "此為正式跨世代進化目標；完整戰鬥資料尚未納入目前展示批次。";
    await prisma.pokemonForm.upsert({
      where: { id },
      create: {
        id,
        speciesId: `species-${String(target.dexNumber).padStart(3, "0")}`,
        formKey: target.formKey,
        formNameEn: target.formNameEn,
        formNameZhTw: target.formNameZhTw,
        regionKey: target.regionKey,
        types: JSON.stringify(target.types),
        searchAliases: JSON.stringify([
          ...new Set([...target.aliases, target.nameEn, target.nameZhTw]),
        ]),
        evolvesFromFormId: target.fromFormId,
        evolutionFamilyNotesZhTw: targetNote,
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED",
        releaseVerifiedAt: checkedDate,
        isEvolutionStub: true,
        evolutionTargetUseLevel: target.evolutionTargetUseLevel,
        evolutionTargetNotesZhTw: target.evolutionTargetNotesZhTw,
      },
      update: {
        speciesId: `species-${String(target.dexNumber).padStart(3, "0")}`,
        formKey: target.formKey,
        formNameEn: target.formNameEn,
        formNameZhTw: target.formNameZhTw,
        regionKey: target.regionKey,
        types: JSON.stringify(target.types),
        searchAliases: JSON.stringify([
          ...new Set([...target.aliases, target.nameEn, target.nameZhTw]),
        ]),
        evolvesFromFormId: target.fromFormId,
        evolutionFamilyNotesZhTw: targetNote,
        isReleasedInPokemonGo: true,
        releaseStatus: "RELEASED",
        releaseVerifiedAt: checkedDate,
        isEvolutionStub: isStub,
        evolutionTargetUseLevel: target.evolutionTargetUseLevel,
        evolutionTargetNotesZhTw: target.evolutionTargetNotesZhTw,
      },
    });
  }

  for (const path of data.paths) {
    if (!existingFormIds.has(path.fromFormId) || !activeTargetIds.has(path.toFormId)) continue;
    const from = await prisma.pokemonForm.findUnique({
      where: { id: path.fromFormId },
      select: { id: true },
    });
    const to = await prisma.pokemonForm.findUnique({
      where: { id: path.toFormId },
      select: { id: true },
    });
    if (!from || !to)
      throw new Error(`跨世代進化路徑有 dangling target：${path.fromFormId}->${path.toFormId}`);
    await upsertEvolutionPath(prisma, {
      id: `evolution-cross-${path.fromFormId}-${path.toFormId}`,
      fromFormId: path.fromFormId,
      toFormId: path.toFormId,
      evolutionMethodZhTw: path.evolutionMethodZhTw,
      availabilityNotesZhTw: path.availabilityNotesZhTw,
      requiresEvent: path.requiresEvent,
      verifiedAt: path.verificationStatus === "VERIFIED" ? checkedDate : null,
    });
  }

  return { ...data, targetIds: activeTargetIds };
}
