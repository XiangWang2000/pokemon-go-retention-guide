import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import {
  forms252281,
  evolutionPairs252281,
  pvpokeSpeciesId252281,
  releasedDynamaxForms252281,
  releasedGigantamaxForms252281,
  releasedMegaForms252281,
  releasedShadowForms252281,
  specialVariants252281,
  species252281,
  pveUseLevels252281,
} from "../src/data/batch-252-281";
import type { Gen3Form, Gen3Species, Gen3SpecialVariant, PveUseLevel } from "../src/data/batch-gen3-types";
import {
  forms282311,
  evolutionPairs282311,
  pvpokeSpeciesId282311,
  releasedDynamaxForms282311,
  releasedGigantamaxForms282311,
  releasedMegaForms282311,
  releasedShadowForms282311,
  specialVariants282311,
  species282311,
  pveUseLevels282311,
} from "../src/data/batch-282-311";
import {
  forms312341,
  evolutionPairs312341,
  pvpokeSpeciesId312341,
  releasedDynamaxForms312341,
  releasedGigantamaxForms312341,
  releasedMegaForms312341,
  releasedShadowForms312341,
  specialVariants312341,
  species312341,
  pveClassifications312341,
  pveUseLevels312341,
} from "../src/data/batch-312-341";
import {
  forms342371,
  evolutionPairs342371,
  pvpokeSpeciesId342371,
  releasedDynamaxForms342371,
  releasedGigantamaxForms342371,
  releasedMegaForms342371,
  releasedShadowForms342371,
  specialVariants342371,
  species342371,
  pveClassifications342371,
  pveUseLevels342371,
} from "../src/data/batch-342-371";
import {
  forms372386,
  evolutionPairs372386,
  pvpokeSpeciesId372386,
  releasedDynamaxForms372386,
  releasedGigantamaxForms372386,
  releasedMegaForms372386,
  releasedShadowForms372386,
  specialVariants372386,
  species372386,
  pveClassifications372386,
  pveUseLevels372386,
} from "../src/data/batch-372-386";
import {
  ensureCrossGenerationEvolutionTargets,
  loadCrossGenerationEvolutionData,
} from "../src/data/cross-generation-evolution";
import { RULES_VERSION } from "../src/rules/rules";
import { getDatabaseUrl } from "../src/lib/database";
import {
  deriveEvolutionReleaseClosure,
  deriveShadowReleaseEvidence,
} from "../src/data/evolution-release";
import {
  validateGen3DexConsistency,
  validateGen3FormCompleteness,
  type VariantForValidation,
} from "../src/data/checkpoint-validation";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: getDatabaseUrl() }),
});

type VariantKey =
  | "NORMAL"
  | "SHADOW"
  | "PURIFIED"
  | "MEGA"
  | "MEGA_X"
  | "MEGA_Y"
  | "DYNAMAX"
  | "GIGANTAMAX";
type Decision = "KEEP" | "CONDITIONAL_KEEP" | "TRANSFER_CANDIDATE";
type Disposition =
  | "CLEAR_USE"
  | "LIMITED_USE"
  | "NO_SIGNIFICANT_USE"
  | "NOT_APPLICABLE_OR_UNRELEASED";
type LeagueKey = "GREAT" | "ULTRA" | "MASTER";
type Category =
  | "PVP"
  | "PVE"
  | "ROCKET"
  | "GYM"
  | "MEGA"
  | "MAX_BATTLE"
  | "EVOLUTION_VALUE";

type RankingRow = {
  speciesId: string;
  rating?: number;
  moveset?: string[];
};
type RankResult = {
  league: LeagueKey;
  leagueLabel: string;
  sourceId: string;
  rank: number;
  rating: number | null;
  moves: string[];
};
type OfficialSource = {
  id: string;
  sourceName: string;
  sourceType: string;
  sourceTitleOriginal: string;
  sourceLanguage: string;
  sourceUrl: string;
  accessedAt: string;
  publishedAt: string | null;
  sourceSummaryZhTw: string;
  supports: string[];
};
type OfficialResearch = { sources: OfficialSource[] };
type EvidenceLink = {
  sourceId: string;
  variantId: string;
  category: Category;
  usageZhTw: string;
};
type VariantRecord = {
  id: string;
  form: Gen3Form;
  variantKey: VariantKey;
  released: boolean;
};
type BatchDefinition = {
  batch: "252-281" | "282-311" | "312-341" | "342-371" | "372-386";
  start: number;
  end: number;
  species: Gen3Species[];
  forms: Gen3Form[];
  evolutionPairs: readonly [string, string][];
  releasedShadowForms: Set<string>;
  releasedMegaForms: Set<string>;
  releasedDynamaxForms: Set<string>;
  releasedGigantamaxForms: Set<string>;
  specialVariants: Gen3SpecialVariant[];
  pveClassifications: Record<string, PveUseLevel>;
  pveUseLevels: Record<string, PveUseLevel>;
  pvpokeSpeciesId: (form: Gen3Form, shadow: boolean) => string;
  shadowUnavailableFormIds: ReadonlySet<string>;
};

const checkedAt = new Date("2026-08-09T00:00:00+08:00");
const pvpokeCommit = "86847e535b7e0a0f4e91f9628b3fc713ae6adca7";
const categories: readonly Category[] = [
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX_BATTLE",
  "EVOLUTION_VALUE",
];
const leagues = [
  { key: "GREAT", cp: 1500, sourceId: "pvpoke-gl-20260715", label: "GL（超級聯盟）" },
  { key: "ULTRA", cp: 2500, sourceId: "pvpoke-ul-20260715", label: "UL（高級聯盟）" },
  { key: "MASTER", cp: 10000, sourceId: "pvpoke-ml-20260715", label: "ML（大師聯盟）" },
] as const;

function definitionFor(batch: string): BatchDefinition {
  if (batch === "252-281") {
    return {
      batch,
      start: 252,
      end: 281,
      species: species252281,
      forms: forms252281,
      evolutionPairs: evolutionPairs252281,
      releasedShadowForms: releasedShadowForms252281,
      releasedMegaForms: releasedMegaForms252281,
      releasedDynamaxForms: releasedDynamaxForms252281,
      releasedGigantamaxForms: releasedGigantamaxForms252281,
      specialVariants: specialVariants252281,
      pveClassifications: pveUseLevels252281,
      pveUseLevels: pveUseLevels252281,
      pvpokeSpeciesId: pvpokeSpeciesId252281,
      shadowUnavailableFormIds: new Set(),
    };
  }
  if (batch === "282-311") {
    return {
      batch,
      start: 282,
      end: 311,
      species: species282311,
      forms: forms282311,
      evolutionPairs: evolutionPairs282311,
      releasedShadowForms: releasedShadowForms282311,
      releasedMegaForms: releasedMegaForms282311,
      releasedDynamaxForms: releasedDynamaxForms282311,
      releasedGigantamaxForms: releasedGigantamaxForms282311,
      specialVariants: specialVariants282311,
      pveClassifications: pveUseLevels282311,
      pveUseLevels: pveUseLevels282311,
      pvpokeSpeciesId: pvpokeSpeciesId282311,
      shadowUnavailableFormIds: new Set(),
    };
  }
  if (batch === "312-386") {
    throw new Error("312-386 is no longer an import unit; use 312-341, 342-371, or 372-386.");
  }
  if (batch === "312-341") {
    return {
      batch,
      start: 312,
      end: 341,
      species: species312341,
      forms: forms312341,
      evolutionPairs: evolutionPairs312341,
      releasedShadowForms: releasedShadowForms312341,
      releasedMegaForms: releasedMegaForms312341,
      releasedDynamaxForms: releasedDynamaxForms312341,
      releasedGigantamaxForms: releasedGigantamaxForms312341,
      specialVariants: specialVariants312341,
      pveClassifications: pveClassifications312341,
      pveUseLevels: pveUseLevels312341,
      pvpokeSpeciesId: pvpokeSpeciesId312341,
      shadowUnavailableFormIds: new Set(),
    };
  }
  if (batch === "342-371") {
    return {
      batch,
      start: 342,
      end: 371,
      species: species342371,
      forms: forms342371,
      evolutionPairs: evolutionPairs342371,
      releasedShadowForms: releasedShadowForms342371,
      releasedMegaForms: releasedMegaForms342371,
      releasedDynamaxForms: releasedDynamaxForms342371,
      releasedGigantamaxForms: releasedGigantamaxForms342371,
      specialVariants: specialVariants342371,
      pveClassifications: pveClassifications342371,
      pveUseLevels: pveUseLevels342371,
      pvpokeSpeciesId: pvpokeSpeciesId342371,
      shadowUnavailableFormIds: new Set(),
    };
  }
  if (batch === "372-386") {
    return {
      batch,
      start: 372,
      end: 386,
      species: species372386,
      forms: forms372386,
      evolutionPairs: evolutionPairs372386,
      releasedShadowForms: releasedShadowForms372386,
      releasedMegaForms: releasedMegaForms372386,
      releasedDynamaxForms: releasedDynamaxForms372386,
      releasedGigantamaxForms: releasedGigantamaxForms372386,
      specialVariants: specialVariants372386,
      pveClassifications: pveClassifications372386,
      pveUseLevels: pveUseLevels372386,
      pvpokeSpeciesId: pvpokeSpeciesId372386,
      shadowUnavailableFormIds: new Set(),
    };
  }
  throw new Error("未知 Gen3 批次：" + batch);
}

function assertBatchCanonical(batch: BatchDefinition) {
  const errors = validateGen3DexConsistency(
    batch.species,
    batch.forms.map((form) => ({
      id: form.id,
      speciesId: `species-${String(form.dexNumber).padStart(3, "0")}`,
      dexNumber: form.dexNumber,
      formKey: form.formKey,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      regionKey: form.regionKey,
      types: form.types,
    })),
    { min: batch.start, max: batch.end },
  );
  const formErrors = validateGen3FormCompleteness(
    batch.forms.map((form) => ({
      id: form.id,
      dexNumber: form.dexNumber,
      formKey: form.formKey,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      regionKey: form.regionKey,
      types: form.types,
    })),
    expectedVariantBoundaryRecords(batch),
    { min: batch.start, max: batch.end },
  );
  if (errors.length || formErrors.length) {
    throw new Error(
      `Gen3 canonical identity mismatch for #${batch.start}-${batch.end}:\n${[...errors, ...formErrors].join("\n")}`,
    );
  }
}

function expectedVariantBoundaryRecords(batch: BatchDefinition): VariantForValidation[] {
  const rows: VariantForValidation[] = [];
  for (const form of batch.forms) {
    if (form.isStub || form.includeVariants === false) continue;
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      rows.push({
        id: `${form.id}-${variantKey.toLowerCase()}`,
        pokemonFormId: form.id,
        variantKey,
      });
    }
  }
  for (const special of batch.specialVariants) {
    rows.push({
      id: special.id,
      pokemonFormId: special.formId,
      variantKey: special.variantKey,
    });
  }
  return rows;
}

function optionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value + "T00:00:00+08:00");
  return Number.isNaN(date.getTime()) ? null : date;
}

function readResearch(batch: BatchDefinition) {
  return JSON.parse(
    readFileSync("research_notes/official-" + batch.batch + ".json", "utf8"),
  ) as OfficialResearch;
}

async function upsertSources(research: OfficialResearch) {
  for (const source of research.sources) {
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
        accessedAt: optionalDate(source.accessedAt) ?? checkedAt,
        publishedAt: optionalDate(source.publishedAt),
        dataVersion: "accessed-" + source.accessedAt,
        notes: "第三世代批次來源研究表。",
      },
      update: {
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType as never,
        sourceTitleOriginal: source.sourceTitleOriginal,
        sourceLanguage: source.sourceLanguage,
        sourceSummaryZhTw: source.sourceSummaryZhTw,
        accessedAt: optionalDate(source.accessedAt) ?? checkedAt,
        publishedAt: optionalDate(source.publishedAt),
        dataVersion: "accessed-" + source.accessedAt,
        notes: "第三世代批次來源研究表。",
      },
    });
  }
}

async function assertDatabaseCanonical(batch: BatchDefinition) {
  const [forms, variants] = await Promise.all([
    prisma.pokemonForm.findMany({
      where: { species: { dexNumber: { gte: batch.start, lte: batch.end } } },
      include: { species: { select: { dexNumber: true } } },
    }),
    prisma.battleVariant.findMany({
      where: { pokemonForm: { species: { dexNumber: { gte: batch.start, lte: batch.end } } } },
      select: { id: true, pokemonFormId: true, variantKey: true },
    }),
  ]);
  const errors = validateGen3FormCompleteness(
    forms.map((form) => ({
      id: form.id,
      dexNumber: form.species.dexNumber,
      speciesId: form.speciesId,
      formKey: form.formKey,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      regionKey: form.regionKey,
      types: form.types,
    })),
    variants,
    { min: batch.start, max: batch.end },
  );
  if (errors.length) {
    throw new Error(
      `Database Gen3 form/variant completeness mismatch for #${batch.start}-${batch.end}:\n${errors.join("\n")}`,
    );
  }
}

async function readRankings() {
  const result = new Map<LeagueKey, RankingRow[]>();
  for (const league of leagues) {
    const bytes = await readFile("data/sources/pvpoke/rankings-" + league.cp + ".json");
    const rows = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, "")) as RankingRow[];
    result.set(league.key, rows);
    const hash = createHash("sha256").update(bytes).digest("hex");
    await prisma.sourceReference.upsert({
      where: { id: league.sourceId },
      create: {
        id: league.sourceId,
        sourceName: "PvPoke fixed ranking snapshot",
        sourceUrl: "https://pvpoke.com/rankings/",
        sourceType: "PVP",
        sourceTitleOriginal: "PvPoke Battle League Rankings",
        sourceLanguage: "en",
        sourceSummaryZhTw: "固定 commit 的 Open League／Overall 排名快照。",
        accessedAt: checkedAt,
        publishedAt: null,
        dataVersion: pvpokeCommit + "; sha256=" + hash,
        notes: "完整 JSON 陣列 index + 1 可重現名次。",
      },
      update: {
        dataVersion: pvpokeCommit + "; sha256=" + hash,
        notes: "完整 JSON 陣列 index + 1 可重現名次。",
      },
    });
  }
  return result;
}

function variantReleased(
  batch: BatchDefinition,
  formId: string,
  variantKey: VariantKey,
  releasedShadowForms: ReadonlySet<string>,
) {
  if (variantKey === "NORMAL") return true;
  if (variantKey === "SHADOW" || variantKey === "PURIFIED") {
    return releasedShadowForms.has(formId);
  }
  if (variantKey === "MEGA") return batch.releasedMegaForms.has(formId);
  if (variantKey === "DYNAMAX") return batch.releasedDynamaxForms.has(formId);
  if (variantKey === "GIGANTAMAX") return batch.releasedGigantamaxForms.has(formId);
  return false;
}

function findRanks(
  batch: BatchDefinition,
  form: Gen3Form,
  variantKey: "NORMAL" | "SHADOW",
  rankings: Map<LeagueKey, RankingRow[]>,
) {
  const speciesId = batch.pvpokeSpeciesId(form, variantKey === "SHADOW");
  return leagues.flatMap((league) => {
    const rows = rankings.get(league.key) ?? [];
    const index = rows.findIndex((row) => row.speciesId === speciesId);
    if (index < 0) return [];
    const row = rows[index]!;
    return [{
      league: league.key,
      leagueLabel: league.label,
      sourceId: league.sourceId,
      rank: index + 1,
      rating: row.rating ?? null,
      moves: row.moveset ?? [],
    }];
  });
}

function rankSummary(ranks: RankResult[]) {
  if (!ranks.length) return "固定 PvPoke Open／Overall 快照未列入可重現名次。";
  return ranks.map((item) =>
    item.leagueLabel + " Overall #" + item.rank +
    (item.moves.length ? "；招式 " + item.moves.join("／") : "")
  ).join("；");
}

function initialDecision(
  batch: BatchDefinition,
  variantKey: VariantKey,
  released: boolean,
  ranks: RankResult[],
  formId: string,
) {
  if (!released) return "TRANSFER_CANDIDATE" as const;
  if (variantKey === "MEGA") return "KEEP" as const;
  if (variantKey === "DYNAMAX" || batch.pveUseLevels[formId] === "CORE_INVESTMENT") {
    return "KEEP" as const;
  }
  if (batch.pveUseLevels[formId]) return "CONDITIONAL_KEEP" as const;
  const best = Math.min(...ranks.map((rank) => rank.rank), Number.POSITIVE_INFINITY);
  if (best <= 100) return "KEEP" as const;
  if (best <= 250) return "CONDITIONAL_KEEP" as const;
  return "TRANSFER_CANDIDATE" as const;
}

function initialDisposition(decision: Decision, released: boolean): Disposition {
  if (!released) return "NOT_APPLICABLE_OR_UNRELEASED";
  if (decision === "KEEP") return "CLEAR_USE";
  if (decision === "CONDITIONAL_KEEP") return "LIMITED_USE";
  return "NO_SIGNIFICANT_USE";
}

function pveTier(level: PveUseLevel | undefined) {
  if (level === "CORE_INVESTMENT") return "A";
  if (level === "USABLE_OR_BUDGET") return "B";
  if (level === "SPECIAL_USE") return "SPECIAL";
  return null;
}

function isPrimalFormId(formId: string) {
  return formId === "382-hoenn" || formId === "383-hoenn";
}

function specialVariantNameZhTw(formId: string, variantKey: VariantKey) {
  if (variantKey === "MEGA" && formId === "382-hoenn") return "原始蓋歐卡";
  if (variantKey === "MEGA" && formId === "383-hoenn") return "原始固拉多";
  return variantKey === "MEGA" ? "Mega" : variantKey;
}

function notesForVariant(variantKey: VariantKey, released: boolean, formId: string) {
  if (variantKey === "MEGA") {
    const name = specialVariantNameZhTw(formId, variantKey);
    return `${name} 型態獨立評估；不與普通、暗影或 Max 混用。`;
  }
  if (variantKey === "DYNAMAX" || variantKey === "GIGANTAMAX") {
    return released
      ? "此 Max 版本已由來源核對為已推出；普通個體不能替代 Max 個體。"
      : "此 Max 版本尚未核實為已推出；普通個體不能替代 Max 個體。";
  }
  if (variantKey === "SHADOW") return "暗影個體獨立評估；暗影標準較寬，不因低總 IV 自動淨化。";
  if (variantKey === "PURIFIED") return "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。";
  return isPrimalFormId(formId)
    ? "普通版本；與暗影、淨化、原始回歸及 Max 分開評估。"
    : "普通版本；與暗影、淨化、Mega 及 Max 分開評估。";
}

function evidenceCategory(variantId: string, sourceId: string): Category {
  if (sourceId.startsWith("OFF-MEGA-")) return "MEGA";
  if (sourceId.startsWith("MAX-")) return "MAX_BATTLE";
  if (variantId.endsWith("-mega")) return "MEGA";
  if (sourceId.startsWith("PVE-")) return "PVE";
  if (variantId.endsWith("-shadow") || variantId.endsWith("-purified")) return "ROCKET";
  if (variantId.endsWith("-dynamax") || variantId.endsWith("-gigantamax")) return "MAX_BATTLE";
  return "EVOLUTION_VALUE";
}

function officialEvidenceLinksForBatch(
  batch: BatchDefinition,
  research: OfficialResearch,
  releasedShadowForms: ReadonlySet<string>,
) : EvidenceLink[] {
  const shadowRosterSourceIds = new Set(
    research.sources
      .filter((source) => /shadow/i.test(`${source.id} ${source.sourceName}`))
      .map((source) => source.id),
  );
  const mechanismSourceId = research.sources.find((source) =>
    source.id.startsWith("SHADOW-EVOLUTION-MECHANISM-"),
  )?.id;
  const evolutionSourceId = research.sources.find((source) =>
    source.id.startsWith("EVOLUTION-"),
  )?.id;
  const defaultUsage = "第三世代批次來源確認精確型態、進化或用途邊界。";
  const links: EvidenceLink[] = [];
  const seen = new Set<string>();
  const addLink = (link: EvidenceLink) => {
    const key = `${link.sourceId}|${link.variantId}|${link.category}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push(link);
  };
  for (const source of research.sources) {
    for (const variantId of source.supports) {
      const isDirectShadowRoster =
        shadowRosterSourceIds.has(source.id) &&
        /-(shadow|purified)$/.test(variantId);
      addLink({
        sourceId: source.id,
        variantId,
        category: evidenceCategory(variantId, source.id),
        usageZhTw: isDirectShadowRoster
          ? "Shadow 起始物種發布來源（direct roster source）；僅證明來源名單直接列出的起始物種。"
          : defaultUsage,
      });
    }
  }
  for (const source of research.sources) {
    if (!shadowRosterSourceIds.has(source.id)) continue;
    for (const support of source.supports) {
      const match = /^(.*)-(shadow|purified)$/.exec(support);
      if (!match || !batch.releasedShadowForms.has(match[1])) continue;
      const variantSuffix = match[2];
      const descendants = deriveEvolutionReleaseClosure(
        new Set([match[1]]),
        batch.evolutionPairs,
        batch.shadowUnavailableFormIds,
      );
      for (const formId of descendants) {
        if (!releasedShadowForms.has(formId)) continue;
        const variantId = `${formId}-${variantSuffix}`;
        if (formId === match[1]) continue;
        if (!mechanismSourceId) {
          throw new Error(
            `Shadow closure ${match[1]} -> ${formId} 缺少 SHADOW-EVOLUTION-MECHANISM source。`,
          );
        }
        addLink({
          sourceId: mechanismSourceId,
          variantId,
          category: "ROCKET",
          usageZhTw: "Shadow 可正常進化機制來源（derived/inherited closure）；由已發布 Shadow 起始物種沿正式 evolution path 推導，不代表來源 roster 直接列出。",
        });
      }
    }
  }
  if (evolutionSourceId) {
    for (const [fromFormId, toFormId] of batch.evolutionPairs) {
      if (!releasedShadowForms.has(fromFormId) || !releasedShadowForms.has(toFormId)) continue;
      for (const variantSuffix of ["shadow", "purified"] as const) {
        addLink({
          sourceId: evolutionSourceId,
          variantId: `${toFormId}-${variantSuffix}`,
          category: "EVOLUTION_VALUE",
          usageZhTw: "該物種實際 evolution path 來源（formal evolution edge）；只標示此 Shadow/Purified 目標可沿該正式路徑取得。",
        });
      }
    }
  }
  return links;
}

export async function runImport(batchName: string) {
  const batch = definitionFor(batchName);
  assertBatchCanonical(batch);
  const shadowEvidence = deriveShadowReleaseEvidence(
    batch.releasedShadowForms,
    batch.evolutionPairs,
    batch.shadowUnavailableFormIds,
  );
  const releasedShadowForms = shadowEvidence.releasedFormIds;
  const research = readResearch(batch);
  const rankings = await readRankings();
  const officialEvidenceLinks = officialEvidenceLinksForBatch(batch, research, releasedShadowForms);

  await upsertSources(research);
  await prisma.changeLog.deleteMany({
    where: {
      OR: [
        { entityType: "Batch", entityId: batch.batch },
        { id: { startsWith: "gen3-" + batch.batch + "-" } },
      ],
    },
  });
  await prisma.pokemonSpecies.deleteMany({
    where: { dexNumber: { gte: batch.start, lte: batch.end } },
  });

  await prisma.pokemonSpecies.createMany({
    data: batch.species.map((item) => ({
      id: "species-" + String(item.dexNumber).padStart(3, "0"),
      dexNumber: item.dexNumber,
      nameEn: item.nameEn,
      nameZhTw: item.nameZhTw,
      generation: 3,
      familyKey: item.familyKey,
    })),
  });
  await prisma.pokemonForm.createMany({
    data: batch.forms.map((form) => ({
      id: form.id,
      speciesId: "species-" + String(form.dexNumber).padStart(3, "0"),
      formKey: form.formKey,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      regionKey: form.regionKey as never,
      types: JSON.stringify(form.types),
      searchAliases: JSON.stringify([...new Set(form.aliases)]),
      evolvesFromFormId: null,
      evolutionFamilyNotesZhTw: form.evolutionFamilyNotesZhTw,
      isReleasedInPokemonGo: form.isStub ? true : true,
      releaseStatus: form.isStub ? "UNKNOWN" as const : "RELEASED" as const,
      releaseVerifiedAt: checkedAt,
      isEvolutionStub: form.isStub ?? false,
      evolutionTargetUseLevel: null,
      evolutionTargetNotesZhTw: form.isStub ? "目前展示批次尚未納入完整戰鬥資料。" : null,
    })),
  });
  for (const form of batch.forms) {
    if (form.evolvesFromFormId) {
      await prisma.pokemonForm.update({
        where: { id: form.id },
        data: { evolvesFromFormId: form.evolvesFromFormId },
      });
    }
  }

  await ensureCrossGenerationEvolutionTargets(prisma, checkedAt);
  const manifestEdges = new Set(
    (await loadCrossGenerationEvolutionData()).paths.map((path) =>
      path.fromFormId + "->" + path.toFormId
    ),
  );
  const edgeRows = batch.evolutionPairs
    .filter(([fromFormId, toFormId]) => !manifestEdges.has(fromFormId + "->" + toFormId))
    .map(([fromFormId, toFormId]) => {
      const branch = fromFormId === "265-hoenn";
      const babyMerge = toFormId === "183-johto";
      return {
        id: "evolution-gen3-" + batch.batch + "-" + fromFormId + "-" + toFormId,
        fromFormId,
        toFormId,
        evolutionMethodZhTw: branch
          ? "隨機分支進化；由刺尾蟲分別進入甲殼繭或盾甲繭。"
          : babyMerge
            ? "瑪力露麗家族的寶寶進化；依遊戲內糖果與友好度條件為準。"
            : "消耗糖果進化；特殊條件以遊戲內當期介面為準。",
        availabilityNotesZhTw: branch
          ? "兩條分支都是真實遊戲路徑；不可把其中一條當成另一條的替代。"
          : "此路徑已在第三世代研究表核對；跨批後續目標以正式 stub 保留。",
        requiresEvent: false,
        verifiedAt: checkedAt,
      };
    });
  if (edgeRows.length) await prisma.evolutionPath.createMany({ data: edgeRows });

  const variants: VariantRecord[] = [];
  for (const form of batch.forms) {
    if (form.includeVariants === false || form.isStub) continue;
    for (const variantKey of ["NORMAL", "SHADOW", "PURIFIED", "DYNAMAX"] as const) {
      variants.push({
        id: form.id + "-" + variantKey.toLowerCase(),
        form,
        variantKey,
        released: variantReleased(batch, form.id, variantKey, releasedShadowForms),
      });
    }
  }
  for (const special of batch.specialVariants) {
    const form = batch.forms.find((item) => item.id === special.formId);
    if (!form) throw new Error("Mega variant 指向不存在的 form：" + special.formId);
    variants.push({
      id: special.id,
      form,
      variantKey: special.variantKey,
      released: special.released,
    });
  }
  const expectedVariantCount =
    batch.forms.filter((form) => !form.isStub && form.includeVariants !== false).length * 4 +
    batch.specialVariants.length;
  if (variants.length !== expectedVariantCount) {
    throw new Error(
      "#" + batch.batch + " variant 計數錯誤：預期 " +
      expectedVariantCount + "，實際 " + variants.length,
    );
  }
  await prisma.battleVariant.createMany({
    data: variants.map(({ id, form, variantKey, released }) => ({
      id,
      pokemonFormId: form.id,
      variantKey,
      isReleased: released,
      releaseStatus: released ? "RELEASED" as const : "UNRELEASED" as const,
      releaseVerifiedAt: checkedAt,
      notesZhTw: notesForVariant(variantKey, released, form.id),
      inheritsFromVariantId: variantKey === "PURIFIED" && released ? form.id + "-normal" : null,
      inheritanceMode: variantKey === "PURIFIED" && released ? "NORMAL_BASE" as const : "NONE" as const,
      purificationCostModifier: variantKey === "PURIFIED" && released ? 0.9 : null,
      hasReturnAccess: variantKey === "PURIFIED" && released,
      purificationRiskZhTw: variantKey === "PURIFIED" && released
        ? "淨化不可逆；先確認暗影用途與招式，不以淨化取代暗影候選。"
        : "",
      purifiedOverrideRequired: false,
    })),
  });
  await assertDatabaseCanonical(batch);
  await ensureCrossGenerationEvolutionTargets(prisma, checkedAt);

  const rankMap = new Map<string, RankResult[]>();
  for (const variant of variants) {
    rankMap.set(
      variant.id,
      variant.released && (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW")
        ? findRanks(batch, variant.form, variant.variantKey, rankings)
        : [],
    );
  }
  const rawRows = [
    ...variants.flatMap((variant) =>
      (rankMap.get(variant.id) ?? []).map((rank) => ({
        id: "raw-gen3-" + batch.batch + "-" + variant.id + "-" + rank.league.toLowerCase(),
        battleVariantId: variant.id,
        category: "PVP" as const,
        status: "VERIFIED" as const,
        league: rank.league,
        cup: "OPEN",
        pvpCategory: "OVERALL" as const,
        speciesKey: batch.pvpokeSpeciesId(variant.form, variant.variantKey === "SHADOW"),
        formKey: variant.form.id,
        variantKey: variant.variantKey,
        rank: rank.rank,
        rating: rank.rating === null ? null : String(rank.rating),
        recommendedMoves: JSON.stringify(rank.moves),
        rawNotes: rank.leagueLabel + " Open／Overall；固定 JSON 陣列索引加一，可穩定重現。",
        seasonOrVersion: "PvPoke commit " + pvpokeCommit,
        extractionMethod: "固定 commit 的完整 rankings JSON 陣列索引（index + 1）",
        reproducible: true,
        sourceId: rank.sourceId,
        checkedAt,
      })),
    ),
    ...variants.flatMap((variant) => {
      const level = batch.pveUseLevels[variant.form.id];
      const tier = variant.variantKey === "MEGA" ? "SPECIAL" :
        (variant.variantKey === "NORMAL" || variant.variantKey === "SHADOW") ? pveTier(level) : null;
      if (!tier) return [];
      return [{
        id: "raw-gen3-" + batch.batch + "-" + variant.id + "-pve",
        battleVariantId: variant.id,
        category: "PVE" as const,
        status: "PARTIALLY_VERIFIED" as const,
        league: "NOT_APPLICABLE" as const,
        cup: null,
        pvpCategory: null,
        speciesKey: batch.pvpokeSpeciesId(variant.form, variant.variantKey === "SHADOW"),
        formKey: variant.form.id,
        variantKey: variant.variantKey,
        rank: null,
        rating: tier,
        recommendedMoves: JSON.stringify([]),
        tier,
        rawNotes: "PvE 用途依第三世代研究表區分四級用途；不虛構 IV 硬門檻。",
        seasonOrVersion: "GO Hub accessed 2026-08-09",
        extractionMethod: "研究表中的用途層級與來源頁面發布狀態",
        reproducible: false,
        sourceId: "PVE-HOENN-20260809",
        checkedAt,
      }];
    }),
  ];
  if (rawRows.length) await prisma.rawEvaluationData.createMany({ data: rawRows });

  const decisions = new Map<string, { decision: Decision; ranks: RankResult[]; released: boolean }>();
  for (const variant of variants) {
    const ranks = rankMap.get(variant.id) ?? [];
    decisions.set(variant.id, {
      decision: initialDecision(batch, variant.variantKey, variant.released, ranks, variant.form.id),
      ranks,
      released: variant.released,
    });
  }

  const categoryRows = variants.flatMap((variant) => {
    const result = decisions.get(variant.id)!;
    const links = officialEvidenceLinks.filter((link) => link.variantId === variant.id);
    const variantNameZhTw = specialVariantNameZhTw(variant.form.id, variant.variantKey);
    return categories.map((category) => {
      let status:
        | "VERIFIED"
        | "PARTIALLY_VERIFIED"
        | "UNRANKED"
        | "NOT_APPLICABLE"
        | "DATA_UNAVAILABLE"
        | "UNRELEASED" = "NOT_APPLICABLE";
      let provenance: "SOURCE_VERIFIED" | "MANUAL_CURATED" | "DATA_UNAVAILABLE" = "MANUAL_CURATED";
      let summaryZhTw = "此欄位不適用，不影響可執行的保留或傳送建議。";
      let materialToDecision = false;
      let pveUseLevel: PveUseLevel | null = null;
      if (category === "PVP") {
        if (!variant.released || !["NORMAL", "SHADOW"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (result.ranks.length) {
          status = "VERIFIED";
          provenance = "SOURCE_VERIFIED";
          summaryZhTw = rankSummary(result.ranks);
          materialToDecision = result.ranks.some((rank) => rank.rank <= 250);
        } else {
          status = "UNRANKED";
          summaryZhTw = "固定 PvPoke Open／Overall 快照未列入可重現名次；不把沒有排名誤當成全家族資料缺口。";
        }
      } else if (category === "PVE") {
        pveUseLevel = variant.variantKey === "MEGA"
          ? "SPECIAL_USE"
          : batch.pveClassifications[variant.form.id] ?? "NO_SIGNIFICANT_USE";
        if (!variant.released || ["DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
          status = variant.released ? "NOT_APPLICABLE" : "UNRELEASED";
        } else if (variant.variantKey === "MEGA" || batch.pveUseLevels[variant.form.id]) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = "PvE 用途依研究表分成核心投資、可用／預算型、特殊用途或無顯著用途；不把缺少精確斷點誤當成整個家族待判斷。";
        } else {
          status = "DATA_UNAVAILABLE";
          provenance = "DATA_UNAVAILABLE";
          summaryZhTw = "目前未列為普通版本的主要 PvE 投資目標；不因缺少精確斷點虛構 IV 淘汰線。";
        }
      } else if (category === "ROCKET") {
        status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "火箭隊沒有統一逐物種排名；此欄缺來源不單獨觸發暫時保留。";
      } else if (category === "GYM") {
        status = variant.released ? "DATA_UNAVAILABLE" : "UNRELEASED";
        provenance = variant.released ? "DATA_UNAVAILABLE" : "MANUAL_CURATED";
        summaryZhTw = "未找到足以構成主要保留理由的道館用途；次要資料缺失不覆蓋其他結論。";
      } else if (category === "MEGA") {
        if (variant.variantKey === "MEGA") {
          status = variant.released ? "VERIFIED" : "UNRELEASED";
          provenance = variant.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = variant.released;
          summaryZhTw = variant.released ? variantNameZhTw + " 已推出；只保留實際要投入的候選，與普通、暗影及 Max 分開。" : variantNameZhTw + " 尚未推出。";
        } else if (variant.variantKey === "NORMAL" && batch.releasedMegaForms.has(variant.form.id)) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
          summaryZhTw = isPrimalFormId(variant.form.id) ? "此普通型態是" + variantNameZhTw + "的基底；不把原始回歸用途回推成全家族必留。" : "此普通型態是已推出 Mega 的基底；不把 Mega 用途回推成全家族必留。";
        } else {
          status = "NOT_APPLICABLE";
          summaryZhTw = isPrimalFormId(variant.form.id) ? "此版本不是原始回歸型態；家族有原始回歸不代表所有版本都必須保留。" : "此版本不是 Mega 型態；家族有 Mega 不代表所有成員都必須保留。";
        }
      } else if (category === "MAX_BATTLE") {
        const maxVariant = variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX";
        const hasReleasedMax = batch.releasedDynamaxForms.has(variant.form.id) || batch.releasedGigantamaxForms.has(variant.form.id);
        if (maxVariant) {
          status = variant.released ? "VERIFIED" : "UNRELEASED";
          provenance = variant.released ? "SOURCE_VERIFIED" : "MANUAL_CURATED";
          materialToDecision = variant.released;
        } else if (variant.variantKey === "NORMAL" && hasReleasedMax) {
          status = "PARTIALLY_VERIFIED";
          provenance = "SOURCE_VERIFIED";
          materialToDecision = true;
        }
        summaryZhTw = maxVariant
          ? (variant.released ? "此 Max 版本已推出；與普通／暗影版本分開保留。" : "此 Max 版本尚未推出。")
          : (hasReleasedMax
            ? "此普通型態是已推出 Max 的基底；不把 Max 用途回推成全家族必留。"
            : isPrimalFormId(variant.form.id)
              ? "普通、暗影或原始回歸個體不等於極巨／超極巨個體。"
              : "普通、暗影或 Mega 個體不等於極巨／超極巨個體。");
      } else {
        const hasEvolution = batch.evolutionPairs.some(([from]) => from === variant.form.id) || Boolean(variant.form.evolvesFromFormId);
        status = hasEvolution ? "VERIFIED" : "NOT_APPLICABLE";
        summaryZhTw = hasEvolution
          ? "本批或既有家族的正式進化關係已結構化；是否保留仍取決於後續用途與版本。"
          : "沒有額外需要回推的本批進化用途。";
      }
      if (links.some((link) => link.category === category) && status !== "UNRELEASED") {
        provenance = "SOURCE_VERIFIED";
      }
      return {
        id: "category-" + variant.id + "-" + category.toLowerCase(),
        battleVariantId: variant.id,
        category,
        status,
        provenance,
        summaryZhTw,
        materialToDecision,
        rocketRating: category === "ROCKET" ? "DATA_UNAVAILABLE" as const : null,
        rocketRoles: "[]",
        maxTypeRank: null,
        maxTypeTier: null,
        maxTypeKey: null,
        maxOverallRating: null,
        maxInvestmentRating: null,
        maxUseCaseBreadth: null,
        pveUseLevel,
        assessmentDisposition: null,
        checkedAt,
      };
    });
  });
  await prisma.categoryEvaluation.createMany({ data: categoryRows });

  const categorySources = new Map<string, { categoryEvaluationId: string; sourceId: string; usageZhTw: string }>();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      categorySources.set("category-" + variant.id + "-pvp|" + rank.sourceId, {
        categoryEvaluationId: "category-" + variant.id + "-pvp",
        sourceId: rank.sourceId,
        usageZhTw: "固定 PvPoke Open League／Overall JSON 的可重現名次與招式。",
      });
    }
  }
  for (const link of officialEvidenceLinks.filter((candidate) =>
    variants.some((variant) => variant.id === candidate.variantId)
  )) {
    const categoryNames = new Set<Category>([link.category]);
    if (link.sourceId.startsWith("PVE-")) categoryNames.add("PVE");
    for (const categoryName of categoryNames) {
      const categoryId = "category-" + link.variantId + "-" + categoryName.toLowerCase();
      categorySources.set(categoryId + "|" + link.sourceId, {
        categoryEvaluationId: categoryId,
        sourceId: link.sourceId,
        usageZhTw: link.usageZhTw,
      });
    }
  }
  if (categorySources.size) {
    await prisma.categoryEvaluationSource.createMany({ data: [...categorySources.values()] });
  }

  const evaluationRows = variants.map((variant) => {
    const result = decisions.get(variant.id)!;
    const pvpUseful = result.ranks.some((rank) => rank.rank <= 250);
    const hasEvolution = batch.evolutionPairs.some(([from]) => from === variant.form.id) || Boolean(variant.form.evolvesFromFormId);
    const variantNameZhTw = specialVariantNameZhTw(variant.form.id, variant.variantKey);
    return {
      id: "gen3-" + batch.batch + "-eval-" + variant.id,
      battleVariantId: variant.id,
      finalDecision: result.decision,
      provenance: "MANUAL_CURATED" as const,
      pvpSummaryZhTw: rankSummary(result.ranks),
      pveSummaryZhTw: variant.variantKey === "MEGA"
        ? variantNameZhTw + "有獨立 PvE 與團體戰 boost 用途；先核對招式、等級與實際投入。"
        : batch.pveUseLevels[variant.form.id]
          ? "PvE 用途依研究表分成核心投資、可用／預算型或特殊用途；不把缺少精確斷點誤當成整個家族待判斷。"
          : "未列為本批普通版本的核心 PvE 投資目標；不因 100% 自動升格為實戰必留。",
      rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
      gymSummaryZhTw: "未列為主要道館保留用途；缺少次要欄位來源不覆蓋其他結論。",
      gymRating: "NOT_APPLICABLE" as const,
      megaSummaryZhTw: variant.variantKey === "MEGA"
        ? variantNameZhTw + "已推出且與其他版本分開；只留實際投入候選。"
        : batch.releasedMegaForms.has(variant.form.id) && variant.variantKey === "NORMAL"
          ? isPrimalFormId(variant.form.id)
            ? "此普通型態可作" + variantNameZhTw + "基底候選；不把原始回歸用途回推成全家族必留。"
            : "此普通型態可作 Mega 基底候選；不把 Mega 用途回推成全家族必留。"
          : isPrimalFormId(variant.form.id)
            ? "此版本沒有獨立原始回歸型態用途。"
            : "此版本沒有獨立 Mega 型態用途。",
      maxBattleSummaryZhTw: isPrimalFormId(variant.form.id)
        ? "Max 用途與普通、暗影、原始回歸分開評估；尚未發布版本不替代現有個體。"
        : "Max 用途與普通、暗影、Mega 分開評估；尚未發布版本不替代現有個體。",
      evolutionSummaryZhTw: hasEvolution
        ? "本批進化關係已結構化；前階是否保留由後續目標用途決定。"
        : "單純存在家族關係不會自動產生大量保留理由。",
      requiredMovesSummaryZhTw: pvpUseful
        ? "依固定快照優先核對：" + [...new Set(result.ranks.filter((rank) => rank.rank <= 250).flatMap((rank) => rank.moves))].join("／")
        : "沒有招式足以把低用途版本自動升格為必留；活動招式只作投入前條件。",
      recommendedIvStrategyZhTw: variant.variantKey === "SHADOW"
        ? "暗影標準較寬；15攻優先，不設硬性最低 IV。"
        : variant.variantKey === "MEGA"
          ? isPrimalFormId(variant.form.id)
            ? "先看精確原始回歸版本、招式、等級與投入；15攻優先，14攻高整體 IV 亦可留。"
            : "先看精確 Mega 版本、招式、等級與投入；15攻優先，14攻高整體 IV 亦可留。"
          : result.decision === "TRANSFER_CANDIDATE"
            ? "目前沒有主要用途時，不因 100% 自動產生保留理由。"
          : isPrimalFormId(variant.form.id)
            ? "依實際用途分開篩選；PvP 看同聯盟 IV Rank，PvE／原始回歸先看招式與投入；15攻優先，14攻高整體 IV 亦可留。"
            : "依實際用途分開篩選；PvP 看同聯盟 IV Rank，PvE／Mega 先看招式與投入；15攻優先，14攻高整體 IV 亦可留。",
      reasonZhTw: result.decision === "KEEP"
        ? isPrimalFormId(variant.form.id)
          ? "目前已有明確 PvP、PvE、原始回歸或其他實戰用途；保留符合版本與用途的候選。"
          : "目前已有明確 PvP、PvE、Mega 或其他實戰用途；保留符合版本與用途的候選。"
        : result.decision === "CONDITIONAL_KEEP"
          ? "用途有限或屬進化／版本候選；只留少量符合條件的個體。"
          : variant.released
            ? isPrimalFormId(variant.form.id)
              ? "目前缺乏明確主要 PvP、PvE、道館、原始回歸、Max 或後續進化理由，一般重複個體大多可傳。"
              : "目前缺乏明確主要 PvP、PvE、道館、Mega、Max 或後續進化理由，一般重複個體大多可傳。"
            : "此版本尚未在 Pokémon GO 推出，不把現有個體誤當成此版本候選。",
      confidence: "HIGH" as const,
      rulesVersion: RULES_VERSION,
      generatedAt: checkedAt,
      reviewed: true,
      reviewedAt: checkedAt,
      reviewStatus: "RESOLVED" as const,
      missingDataSummaryZhTw: !variant.released
        ? "此欄位不適用或版本尚未推出，不把它當成現有個體的待補資料。"
        : result.decision === "TRANSFER_CANDIDATE"
          ? "已有足夠資料判定目前無顯著用途；一般重複個體通常可傳送。"
          : "用途有限或需特定版本／進化／招式；只保留符合條件的少量候選。",
      assessmentDisposition: initialDisposition(result.decision, variant.released),
      reviewNotesZhTw: isPrimalFormId(variant.form.id)
        ? "已核對第三世代家族、原始回歸、普通／暗影／淨化／Max 邊界與固定 PvPoke 快照。"
        : "已核對第三世代家族、分支進化、特殊取得、普通／暗影／淨化／Mega／Max 邊界與固定 PvPoke 快照。",
    };
  });
  await prisma.retentionEvaluation.createMany({ data: evaluationRows });
  await prisma.evaluationRuleTrace.createMany({
    data: variants.map((variant) => {
      const result = decisions.get(variant.id)!;
      return {
        id: "gen3-" + batch.batch + "-trace-" + variant.id,
        evaluationId: "gen3-" + batch.batch + "-eval-" + variant.id,
        ruleKey: result.decision === "KEEP" ? "MAJOR_BATTLE_VALUE" : result.decision === "CONDITIONAL_KEEP" ? "CONDITIONAL_USE" : "LOW_GENERAL_VALUE",
        ruleVersion: RULES_VERSION,
        priority: result.decision === "KEEP" ? 900 : result.decision === "CONDITIONAL_KEEP" ? 700 : 100,
        matched: true,
        resultDecision: result.decision,
        explanationZhTw: "第三世代批次初步評估，後續由共用重算流程依完整 family graph 再確認。",
      };
    }),
  });

  const evaluationSources = new Map<string, { evaluationId: string; sourceId: string; usageZhTw: string }>();
  for (const variant of variants) {
    for (const rank of rankMap.get(variant.id) ?? []) {
      evaluationSources.set("gen3-" + batch.batch + "-eval-" + variant.id + "|" + rank.sourceId, {
        evaluationId: "gen3-" + batch.batch + "-eval-" + variant.id,
        sourceId: rank.sourceId,
        usageZhTw: "Open League／Overall 名次與推薦招式。",
      });
    }
    for (const link of officialEvidenceLinks.filter((candidate) => candidate.variantId === variant.id)) {
      evaluationSources.set("gen3-" + batch.batch + "-eval-" + variant.id + "|" + link.sourceId, {
        evaluationId: "gen3-" + batch.batch + "-eval-" + variant.id,
        sourceId: link.sourceId,
        usageZhTw: link.usageZhTw,
      });
    }
  }
  if (evaluationSources.size) {
    await prisma.evaluationSource.createMany({ data: [...evaluationSources.values()] });
  }

  await prisma.changeLog.create({
    data: {
      id: "gen3-" + batch.batch + "-batch",
      entityType: "Batch",
      entityId: batch.batch,
      fieldName: "status",
      previousValue: null,
      newValue: "RESEARCHED",
      sourceId: "OFF-HOENN-TOUR-2023",
      changeReasonZhTw: "新增第三世代 #"+batch.batch+"；沿用共用留傳規則並正式加入豐緣型態、進化與戰鬥版本邊界。",
      changedAt: checkedAt,
      rulesVersion: RULES_VERSION,
    },
  });
  if (batch.batch === "252-281") {
    await prisma.changeLog.create({
      data: {
        id: "gen3-" + batch.batch + "-family-wurmple",
        entityType: "EvolutionFamily",
        entityId: "HOENN_FAMILY_265",
        fieldName: "members",
        previousValue: null,
        newValue: "#265→#266→#267；#265→#268→#269",
        sourceId: "EVOLUTION-HOENN-20260809",
        changeReasonZhTw: "刺尾蟲的兩條隨機進化分支分開建模，不以單一路徑覆蓋另一個保留目標。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
    });
  } else {
    await prisma.changeLog.create({
      data: {
        id: "gen3-" + batch.batch + "-family-nincada",
        entityType: "EvolutionFamily",
        entityId: "HOENN_FAMILY_290",
        fieldName: "members",
        previousValue: null,
        newValue: "#290→#291；#292為特殊取得版本，不建立不存在的直接進化 edge",
        sourceId: "EVOLUTION-HOENN-20260809",
        changeReasonZhTw: "土居忍士、鐵面忍者與脫殼忍者保留共同家族語意；脫殼忍者不被誤建成遊戲內不存在的直接進化路徑。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      },
    });
  }

  const counts = {
    species: await prisma.pokemonSpecies.count({ where: { dexNumber: { gte: batch.start, lte: batch.end } } }),
    forms: await prisma.pokemonForm.count({ where: { species: { dexNumber: { gte: batch.start, lte: batch.end } } } }),
    variants: await prisma.battleVariant.count({ where: { pokemonForm: { species: { dexNumber: { gte: batch.start, lte: batch.end } } } } }),
    categories: await prisma.categoryEvaluation.count({ where: { battleVariant: { pokemonForm: { species: { dexNumber: { gte: batch.start, lte: batch.end } } } } } }),
  };
  if (counts.species !== batch.species.length || counts.forms !== batch.forms.length || counts.variants !== variants.length || counts.categories !== variants.length * categories.length) {
    throw new Error("第三世代批次計數錯誤：" + JSON.stringify(counts));
  }
  console.log(JSON.stringify({ batch: batch.batch, counts, rawRows: rawRows.length, sources: research.sources.length }, null, 2));
}
