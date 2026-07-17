import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, type RetentionDecision } from "../generated/prisma/client";
import { pvpokeSpeciesId } from "../src/data/batch-001-030";
import { evaluateRetention, type EvaluationFacts } from "../src/rules/engine";
import { RULES_VERSION } from "../src/rules/rules";

const checkedAt = new Date("2026-07-17T12:00:00+08:00");
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const categories = [
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX_BATTLE",
  "EVOLUTION_VALUE",
] as const;
const pvpSnapshots = [
  { league: "GREAT", cp: 1500, sourceId: "pvpoke-gl-20260715" },
  { league: "ULTRA", cp: 2500, sourceId: "pvpoke-ul-20260715" },
  { league: "MASTER", cp: 10000, sourceId: "pvpoke-ml-20260715" },
] as const;

type Category = (typeof categories)[number];
type DataStatus =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "UNRANKED"
  | "NOT_APPLICABLE"
  | "DATA_UNAVAILABLE"
  | "SOURCE_MISSING"
  | "SOURCE_CONFLICT"
  | "UNRELEASED"
  | "UNKNOWN_RELEASE_STATUS";
type ReleaseStatus = "RELEASED" | "UNRELEASED" | "UNKNOWN";
type EvaluationProvenance = "SOURCE_VERIFIED" | "MANUAL_CURATED" | "INHERITED" | "DATA_UNAVAILABLE";

interface OfficialResearch {
  forms: Array<{
    pokemonFormId: string;
    releaseStatus: string;
    releaseSourceIds: string[];
    variants: Record<string, { status: string; sourceIds: string[]; noteZhTw: string }>;
  }>;
}
interface RankingRow {
  speciesId: string;
  speciesName: string;
  rating: number;
  moveset?: string[];
}

function parseArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function sanitize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isHighTier(tier: string | null) {
  return Boolean(tier && /^(S|A\+?|TOP)/i.test(tier));
}

function isLowTier(tier: string | null) {
  return Boolean(tier && /^(C|D|F|LOW)/i.test(tier));
}

async function readJson<T>(path: string) {
  return JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, "")) as T;
}

async function addChange(data: {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  previousValue: string | null;
  newValue: string | null;
  reasonZhTw: string;
  sourceId?: string | null;
}) {
  await prisma.changeLog.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      entityType: data.entityType,
      entityId: data.entityId,
      fieldName: data.fieldName,
      previousValue: data.previousValue,
      newValue: data.newValue,
      sourceId: data.sourceId ?? null,
      changeReasonZhTw: data.reasonZhTw,
      changedAt: checkedAt,
      rulesVersion: RULES_VERSION,
    },
    update: {
      previousValue: data.previousValue,
      newValue: data.newValue,
      sourceId: data.sourceId ?? null,
      changeReasonZhTw: data.reasonZhTw,
      changedAt: checkedAt,
      rulesVersion: RULES_VERSION,
    },
  });
}

async function latestDecisionMap() {
  const evaluations = await prisma.retentionEvaluation.findMany({
    orderBy: { generatedAt: "desc" },
  });
  const map = new Map<string, RetentionDecision>();
  for (const evaluation of evaluations) {
    if (!map.has(evaluation.battleVariantId))
      map.set(evaluation.battleVariantId, evaluation.finalDecision);
  }
  return map;
}

async function baselineDecisionMap() {
  const evaluations = await prisma.retentionEvaluation.findMany({
    where: { rulesVersion: { not: RULES_VERSION } },
    orderBy: { generatedAt: "desc" },
  });
  const map = new Map<string, string>();
  const latestEvaluationId = new Map<string, string>();
  for (const evaluation of evaluations) {
    if (!map.has(evaluation.battleVariantId)) {
      map.set(evaluation.battleVariantId, evaluation.finalDecision);
      latestEvaluationId.set(evaluation.battleVariantId, evaluation.id);
    }
  }
  const migrated = await prisma.changeLog.findMany({
    where: { id: { startsWith: "migration-hold-" }, previousValue: "NEEDS_REVIEW" },
    select: { entityId: true },
  });
  const migratedIds = new Set(migrated.map((change) => change.entityId));
  for (const [battleVariantId, evaluationId] of latestEvaluationId) {
    if (migratedIds.has(evaluationId)) map.set(battleVariantId, "NEEDS_REVIEW");
  }
  return map;
}

async function loadPvpRankings() {
  const version = await readJson<Array<{ sha?: string }>>(
    "data/sources/pvpoke/source-version.json",
  );
  const sha = version[0]?.sha;
  if (!sha) throw new Error("PvPoke 快照缺少 commit SHA，無法重現精確排名。");
  const rankings = new Map<string, RankingRow[]>();
  for (const snapshot of pvpSnapshots) {
    const path = `data/sources/pvpoke/rankings-${snapshot.cp}.json`;
    const bytes = await readFile(path);
    const hash = createHash("sha256").update(bytes).digest("hex");
    const rows = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, "")) as RankingRow[];
    rankings.set(snapshot.league, rows);
    await prisma.sourceReference.update({
      where: { id: snapshot.sourceId },
      data: {
        sourceUrl: `https://raw.githubusercontent.com/pvpoke/pvpoke/${sha}/src/data/rankings/all/overall/rankings-${snapshot.cp}.json`,
        dataVersion: `${sha}; sha256=${hash}`,
        notes:
          "完整 Open League／Overall JSON 快照；名次為陣列索引加一，可由固定 commit 與檔案雜湊重現。",
      },
    });
  }
  return { sha, rankings };
}

function mapOfficialStatus(value: string | undefined): ReleaseStatus | null {
  if (
    ["RELEASED", "RELEASED_BY_EVOLUTION_INFERENCE", "AVAILABLE_FROM_PURIFICATION"].includes(
      value ?? "",
    )
  )
    return "RELEASED";
  if (value === "ANNOUNCED_NOT_YET_RELEASED") return "UNRELEASED";
  return null;
}

async function applyReleaseStatuses(
  official: OfficialResearch,
  rankings: Map<string, RankingRow[]>,
) {
  const officialByForm = new Map(official.forms.map((form) => [form.pokemonFormId, form]));
  const forms = await prisma.pokemonForm.findMany({ include: { battleVariants: true } });
  for (const form of forms) {
    const source = officialByForm.get(form.id);
    const normalVariant = form.battleVariants.find((variant) => variant.variantKey === "NORMAL");
    const normalEvidenceCount = normalVariant
      ? await prisma.rawEvaluationData.count({ where: { battleVariantId: normalVariant.id } })
      : 0;
    const normalSpeciesId = pvpokeSpeciesId(form.id, "NORMAL");
    const hasStructuredPvpEvidence = [...rankings.values()].some((rows) =>
      rows.some((row) => row.speciesId === normalSpeciesId),
    );
    const formStatus: ReleaseStatus =
      source?.releaseStatus === "VERIFIED" || normalEvidenceCount > 0 || hasStructuredPvpEvidence
        ? "RELEASED"
        : "UNKNOWN";
    await prisma.pokemonForm.update({
      where: { id: form.id },
      data: {
        releaseStatus: formStatus,
        isReleasedInPokemonGo: formStatus === "UNKNOWN" ? null : formStatus === "RELEASED",
        releaseVerifiedAt: formStatus === "UNKNOWN" ? null : checkedAt,
      },
    });
    for (const variant of form.battleVariants) {
      let status = mapOfficialStatus(source?.variants[variant.variantKey]?.status);
      if (variant.variantKey === "NORMAL") status = formStatus;
      if (variant.variantKey === "SHADOW" && status === null) {
        const speciesId = pvpokeSpeciesId(form.id, "SHADOW");
        status = [...rankings.values()].some((rows) =>
          rows.some((row) => row.speciesId === speciesId),
        )
          ? "RELEASED"
          : "UNKNOWN";
      }
      if (variant.variantKey === "PURIFIED" && status === null) {
        const shadow = form.battleVariants.find((item) => item.variantKey === "SHADOW");
        status = mapOfficialStatus(source?.variants.SHADOW?.status);
        if (status === null && shadow) {
          const speciesId = pvpokeSpeciesId(form.id, "SHADOW");
          status = [...rankings.values()].some((rows) =>
            rows.some((row) => row.speciesId === speciesId),
          )
            ? "RELEASED"
            : "UNKNOWN";
        }
      }
      if (variant.variantKey === "DYNAMAX" && status === null) {
        const dex = Number(form.id.slice(0, 3));
        status = form.regionKey === "KANTO" && dex <= 12 ? "RELEASED" : "UNRELEASED";
      }
      if (variant.variantKey === "GIGANTAMAX" && status === null) status = "UNRELEASED";
      if (variant.variantKey.startsWith("MEGA") && status === null) status = "UNKNOWN";
      status ??= "UNKNOWN";

      await prisma.battleVariant.update({
        where: { id: variant.id },
        data: {
          releaseStatus: status,
          isReleased: status === "UNKNOWN" ? null : status === "RELEASED",
          releaseVerifiedAt: status === "UNKNOWN" ? null : checkedAt,
        },
      });
      if (variant.releaseStatus !== status) {
        await addChange({
          id: `remediation-release-${sanitize(variant.id)}`,
          entityType: "BattleVariant",
          entityId: variant.id,
          fieldName: "releaseStatus",
          previousValue: variant.releaseStatus,
          newValue: status,
          sourceId:
            source?.variants[variant.variantKey]?.sourceIds[0] ??
            (variant.variantKey === "DYNAMAX" ? "battle1-GOHUB_DMAX_LIST" : null),
          reasonZhTw:
            "將舊 nullable boolean 正式化為 RELEASED／UNRELEASED／UNKNOWN 三態；UNRELEASED 不再等同待審核。",
        });
      }
    }
  }
}

async function reclassifyReturnRows() {
  const rows = await prisma.rawEvaluationData.findMany({
    where: { recommendedMoves: { contains: "RETURN" } },
  });
  for (const row of rows) {
    const normal = await prisma.battleVariant.findUnique({ where: { id: row.battleVariantId } });
    if (!normal || normal.variantKey !== "NORMAL") continue;
    const purified = await prisma.battleVariant.findUnique({
      where: {
        pokemonFormId_variantKey: { pokemonFormId: normal.pokemonFormId, variantKey: "PURIFIED" },
      },
    });
    if (!purified) continue;
    await prisma.rawEvaluationData.update({
      where: { id: row.id },
      data: {
        battleVariantId: purified.id,
        variantKey: "PURIFIED",
        migrationNote:
          `${row.migrationNote ?? ""} Return 僅屬淨化後招式，已從普通版重新歸類至 Purified override。`.trim(),
      },
    });
    await addChange({
      id: `remediation-return-${sanitize(row.id)}`,
      entityType: "RawEvaluationData",
      entityId: row.id,
      fieldName: "battleVariantId",
      previousValue: normal.id,
      newValue: purified.id,
      sourceId: row.sourceId,
      reasonZhTw: "Return（報恩）是淨化專屬招式，不得歸入普通版；改列為 Purified override。",
    });
  }
}

async function verifyPvpRows(sha: string, rankings: Map<string, RankingRow[]>) {
  const rows = await prisma.rawEvaluationData.findMany({
    where: { category: "PVP" },
    include: { battleVariant: true, source: true },
  });
  const invalidVariants = new Set<string>();
  for (const row of rows) {
    const sourceRows = rankings.get(row.league);
    const speciesId = pvpokeSpeciesId(
      row.battleVariant.pokemonFormId,
      row.battleVariant.variantKey === "PURIFIED" ? "NORMAL" : row.battleVariant.variantKey,
    );
    const index = sourceRows?.findIndex((candidate) => candidate.speciesId === speciesId) ?? -1;
    const expectedRank = index >= 0 ? index + 1 : null;
    const reproducible = expectedRank !== null && expectedRank === row.rank;
    await prisma.rawEvaluationData.update({
      where: { id: row.id },
      data: {
        status: reproducible ? "VERIFIED" : expectedRank === null ? "UNRANKED" : "SOURCE_MISSING",
        cup: "OPEN",
        pvpCategory: "OVERALL",
        speciesKey: speciesId,
        formKey: row.battleVariant.pokemonFormId,
        variantKey: row.battleVariant.variantKey,
        rank: reproducible ? row.rank : null,
        seasonOrVersion: `PvPoke Open League Overall @ ${sha}`,
        extractionMethod: "固定 commit 的完整 rankings JSON 陣列索引（index + 1）",
        reproducible,
        migrationNote: reproducible
          ? row.migrationNote
          : `${row.migrationNote ?? ""} 舊精確名次無法由固定快照重現，已停用 rank。`.trim(),
      },
    });
    if (!reproducible && row.rank !== null) {
      invalidVariants.add(row.battleVariantId);
      await addChange({
        id: `remediation-pvp-rank-${sanitize(row.id)}`,
        entityType: "RawEvaluationData",
        entityId: row.id,
        fieldName: "rank",
        previousValue: String(row.rank),
        newValue: null,
        sourceId: row.sourceId,
        reasonZhTw: `舊名次無法由 PvPoke ${sha} 完整 Open League／Overall JSON 重現，停止當成正式 rank。`,
      });
    }
  }
  const fearow = await prisma.rawEvaluationData.findUnique({
    where: { id: "raw-022-kanto-normal-great" },
  });
  if (fearow?.rank === 20 && fearow.reproducible) {
    await addChange({
      id: "remediation-fearow-gl-rank-verification",
      entityType: "RawEvaluationData",
      entityId: fearow.id,
      fieldName: "rankVerification",
      previousValue: "候選 #20，重現性未記錄",
      newValue: "#20，完整榜單可重現",
      sourceId: fearow.sourceId,
      reasonZhTw:
        "逐列驗證 speciesId=fearow、Open Great League、Overall、固定 commit 與陣列索引；#20 可重現，因此保留而非移除。",
    });
  }
  return invalidVariants;
}

async function normalizeScopedRanks() {
  const rows = await prisma.rawEvaluationData.findMany({
    where: { category: { not: "PVP" }, rank: { not: null } },
  });
  const scopedRanks = new Map<string, number>();
  for (const row of rows) {
    scopedRanks.set(row.id, row.rank!);
    await prisma.rawEvaluationData.update({
      where: { id: row.id },
      data: {
        rank: null,
        status: "PARTIALLY_VERIFIED",
        migrationNote:
          `${row.migrationNote ?? ""} 舊 rank=${row.rank} 為屬性／情境範圍名次，已移至類別專用維度，避免誤作全域名次。`.trim(),
      },
    });
  }
  return scopedRanks;
}

async function configurePurifiedInheritance() {
  const purified = await prisma.battleVariant.findMany({
    where: { variantKey: "PURIFIED" },
    include: { rawEvaluationData: true },
  });
  for (const variant of purified) {
    const normal = await prisma.battleVariant.findUnique({
      where: {
        pokemonFormId_variantKey: { pokemonFormId: variant.pokemonFormId, variantKey: "NORMAL" },
      },
    });
    const shadow = await prisma.battleVariant.findUnique({
      where: {
        pokemonFormId_variantKey: { pokemonFormId: variant.pokemonFormId, variantKey: "SHADOW" },
      },
      include: { rawEvaluationData: { where: { category: "PVE" } } },
    });
    if (!normal) continue;
    const hasReturnOverride = variant.rawEvaluationData.some((row) =>
      parseArray(row.recommendedMoves).includes("RETURN"),
    );
    const highValueShadow = shadow?.rawEvaluationData.some((row) => isHighTier(row.tier)) ?? false;
    const overrideRequired = hasReturnOverride || highValueShadow;
    await prisma.battleVariant.update({
      where: { id: variant.id },
      data: {
        inheritsFromVariantId: normal.id,
        inheritanceMode: overrideRequired ? "NORMAL_BASE_WITH_OVERRIDE" : "NORMAL_BASE",
        purificationCostModifier: 0.9,
        hasReturnAccess: true,
        purificationRiskZhTw: highValueShadow
          ? "淨化不可逆，且會失去目前具有高 PvE 價值的暗影輸出；除非報恩或 IV 門檻確實改善用途，否則不建議淨化。"
          : "淨化不可逆；可移除遷怒、取得報恩並改善 IV，但需先比較失去暗影型態的機會成本。",
        purifiedOverrideRequired: overrideRequired,
      },
    });
  }
}

async function upsertCategory(data: {
  variantId: string;
  category: Category;
  status: DataStatus;
  summaryZhTw: string;
  material: boolean;
  provenance?: EvaluationProvenance;
  sourceIds?: string[];
  rocketRating?:
    | "HIGHLY_RECOMMENDED"
    | "USEFUL"
    | "NICHE"
    | "NOT_RECOMMENDED"
    | "DATA_UNAVAILABLE"
    | "NOT_APPLICABLE";
  rocketRoles?: string[];
  maxTypeRank?: number | null;
  maxTypeTier?: string | null;
  maxTypeKey?: string | null;
  maxOverallRating?: string | null;
  maxInvestmentRating?: string | null;
  maxUseCaseBreadth?: string | null;
}) {
  const id = `category-${sanitize(data.variantId)}-${data.category.toLowerCase()}`;
  const provenance: EvaluationProvenance =
    data.provenance ??
    (["DATA_UNAVAILABLE", "SOURCE_MISSING", "UNKNOWN_RELEASE_STATUS"].includes(data.status)
      ? "DATA_UNAVAILABLE"
      : (data.sourceIds?.length ?? 0) > 0
        ? "SOURCE_VERIFIED"
        : "MANUAL_CURATED");
  const evaluation = await prisma.categoryEvaluation.upsert({
    where: {
      battleVariantId_category: { battleVariantId: data.variantId, category: data.category },
    },
    create: {
      id,
      battleVariantId: data.variantId,
      category: data.category,
      status: data.status,
      provenance,
      summaryZhTw: data.summaryZhTw,
      materialToDecision: data.material,
      rocketRating: data.rocketRating,
      rocketRoles: JSON.stringify(data.rocketRoles ?? []),
      maxTypeRank: data.maxTypeRank,
      maxTypeTier: data.maxTypeTier,
      maxTypeKey: data.maxTypeKey,
      maxOverallRating: data.maxOverallRating,
      maxInvestmentRating: data.maxInvestmentRating,
      maxUseCaseBreadth: data.maxUseCaseBreadth,
      checkedAt,
    },
    update: {
      status: data.status,
      provenance,
      summaryZhTw: data.summaryZhTw,
      materialToDecision: data.material,
      rocketRating: data.rocketRating,
      rocketRoles: JSON.stringify(data.rocketRoles ?? []),
      maxTypeRank: data.maxTypeRank,
      maxTypeTier: data.maxTypeTier,
      maxTypeKey: data.maxTypeKey,
      maxOverallRating: data.maxOverallRating,
      maxInvestmentRating: data.maxInvestmentRating,
      maxUseCaseBreadth: data.maxUseCaseBreadth,
      checkedAt,
    },
  });
  await prisma.categoryEvaluationSource.deleteMany({
    where: { categoryEvaluationId: evaluation.id },
  });
  const existingSources = new Set(
    (
      await prisma.sourceReference.findMany({
        where: { id: { in: [...new Set(data.sourceIds ?? [])] } },
        select: { id: true },
      })
    ).map((source) => source.id),
  );
  if (existingSources.size) {
    await prisma.categoryEvaluationSource.createMany({
      data: [...existingSources].map((sourceId) => ({
        categoryEvaluationId: evaluation.id,
        sourceId,
        usageZhTw: `${data.category} 類別資料狀態與摘要的依據。`,
      })),
    });
  }
}

function maxTypeKey(rating: string | null) {
  return rating?.match(/^([A-Z]+)_MAX_ATTACKER$/)?.[1] ?? null;
}

function migratedScopedRank(value: string | null) {
  const match = value?.match(/舊 rank=(\d+)/);
  return match ? Number(match[1]) : null;
}

async function createBaseCategoryEvaluations(
  scopedRanks: Map<string, number>,
  official: OfficialResearch,
) {
  const officialByForm = new Map(official.forms.map((form) => [form.pokemonFormId, form]));
  const variants = await prisma.battleVariant.findMany({
    where: { variantKey: { not: "PURIFIED" } },
    include: {
      pokemonForm: { include: { species: true, evolutionPathsFrom: true } },
      rawEvaluationData: true,
    },
  });
  for (const variant of variants) {
    const release = variant.releaseStatus as ReleaseStatus;
    const officialForm = officialByForm.get(variant.pokemonFormId);
    const releaseSources = officialForm?.variants[variant.variantKey]?.sourceIds ?? [];
    if (release !== "RELEASED") {
      const status: DataStatus = release === "UNRELEASED" ? "UNRELEASED" : "UNKNOWN_RELEASE_STATUS";
      for (const category of categories) {
        await upsertCategory({
          variantId: variant.id,
          category,
          status,
          material: false,
          summaryZhTw:
            release === "UNRELEASED"
              ? "已確認此戰鬥版本尚未推出，本類別目前不需完整評估。"
              : "尚無法確認此戰鬥版本是否推出，可能影響保留結論。",
          sourceIds:
            variant.variantKey === "DYNAMAX"
              ? ["battle1-GOHUB_DMAX_LIST", ...releaseSources]
              : releaseSources,
          rocketRating: category === "ROCKET" ? "NOT_APPLICABLE" : undefined,
        });
      }
      continue;
    }

    const isMax = variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX";
    const isMega = variant.variantKey.startsWith("MEGA");
    const pvpRows = variant.rawEvaluationData.filter((row) => row.category === "PVP");
    const pveRows = variant.rawEvaluationData.filter((row) => row.category === "PVE");
    const gymRows = variant.rawEvaluationData.filter((row) => row.category === "GYM");
    const megaRows = variant.rawEvaluationData.filter((row) => row.category === "MEGA");
    const maxRows = variant.rawEvaluationData.filter((row) => row.category === "MAX_BATTLE");
    const outgoing = variant.pokemonForm.evolutionPathsFrom.length > 0;
    const pvpStatus: DataStatus =
      isMax || isMega
        ? "NOT_APPLICABLE"
        : pvpRows.some((row) => row.status === "VERIFIED")
          ? "VERIFIED"
          : pvpRows.some((row) => row.status === "SOURCE_MISSING")
            ? "SOURCE_MISSING"
            : "UNRANKED";
    const pveStatus: DataStatus = isMax
      ? "NOT_APPLICABLE"
      : pveRows.length
        ? "PARTIALLY_VERIFIED"
        : "SOURCE_MISSING";
    const gymStatus: DataStatus =
      isMax || isMega
        ? "NOT_APPLICABLE"
        : gymRows.length
          ? "PARTIALLY_VERIFIED"
          : "DATA_UNAVAILABLE";
    const megaStatus: DataStatus = isMega
      ? megaRows.length || pveRows.length
        ? "PARTIALLY_VERIFIED"
        : "SOURCE_MISSING"
      : "NOT_APPLICABLE";
    const maxStatus: DataStatus = isMax
      ? maxRows.length
        ? "PARTIALLY_VERIFIED"
        : "SOURCE_MISSING"
      : "NOT_APPLICABLE";
    const evolutionStatus: DataStatus = outgoing
      ? "VERIFIED"
      : variant.pokemonForm.species.dexNumber === 30
        ? "PARTIALLY_VERIFIED"
        : "NOT_APPLICABLE";

    const bestPvpRank = pvpRows
      .map((row) => row.rank)
      .filter((rank): rank is number => rank !== null)
      .sort((a, b) => a - b)[0];
    const pvpHigh = bestPvpRank !== undefined && bestPvpRank <= 100;
    const pvpConditional = bestPvpRank !== undefined && bestPvpRank > 100 && bestPvpRank <= 250;
    const pvpEnough = pvpStatus === "VERIFIED" || pvpStatus === "UNRANKED";
    const pveMaterial = !outgoing && !isMax && !isMega && !pvpHigh && !pvpConditional;
    await upsertCategory({
      variantId: variant.id,
      category: "PVP",
      status: pvpStatus,
      material: !outgoing && !isMax && !isMega,
      summaryZhTw:
        pvpStatus === "UNRANKED"
          ? "已檢查完整 PvPoke Open League／Overall 榜單，未進入可用排名；這不是缺少資料。"
          : pvpStatus === "NOT_APPLICABLE"
            ? "Mega 與 Max 個體不適用一般 GO Battle League 評估。"
            : pvpEnough
              ? "精確名次來自固定 commit 的完整結構化榜單，可重現 species、型態、聯盟與 Overall 分類。"
              : "精確名次未能穩定重現，未寫入正式 rank。",
      sourceIds: pvpRows.length
        ? pvpRows.map((row) => row.sourceId)
        : pvpSnapshots.map((row) => row.sourceId),
    });
    await upsertCategory({
      variantId: variant.id,
      category: "PVE",
      status: pveStatus,
      material: pveMaterial,
      summaryZhTw: pveRows.length
        ? "保存 GO Hub 的屬性 Tier／角色定位；不把屬性內名次冒充 Pokebattler 全域名次。"
        : isMax
          ? "Max 個體的用途改由 Max Battle 類別評估。"
          : "尚無足夠的可重現 PvE 定位資料；只有在可能改變結論時才會阻止正式決策。",
      sourceIds: pveRows.map((row) => row.sourceId),
    });
    await upsertCategory({
      variantId: variant.id,
      category: "ROCKET",
      status: "DATA_UNAVAILABLE",
      material: false,
      rocketRating: "DATA_UNAVAILABLE",
      rocketRoles: [],
      summaryZhTw:
        "目前沒有可靠、逐物種、當季且完整可重現的火箭隊全物種排名；只保存定性角色，未以 PvP／PvE 名次替代。",
      sourceIds: ["OFF-ROCKET-INVASION"],
    });
    await upsertCategory({
      variantId: variant.id,
      category: "GYM",
      status: gymStatus,
      material: false,
      summaryZhTw: gymRows.length
        ? "道館資料只作少量保留的次要理由，不會把低價值普通個體改為大量囤積。"
        : "缺少統一精確排名，以 DATA_UNAVAILABLE 表示，不影響已有充分關鍵資料的結論。",
      sourceIds: gymRows.map((row) => row.sourceId),
    });
    await upsertCategory({
      variantId: variant.id,
      category: "MEGA",
      status: megaStatus,
      material: isMega,
      summaryZhTw: isMega
        ? "Mega 版本獨立評估；保存屬性定位與來源，不以普通版名次替代。"
        : "此戰鬥版本本身不是 Mega；若物種有 Mega，普通候選價值由最終規則另行處理。",
      sourceIds: [...megaRows, ...pveRows].map((row) => row.sourceId),
    });
    const maxRow = maxRows[0];
    const isButterfree = variant.id === "012-kanto-gigantamax";
    await upsertCategory({
      variantId: variant.id,
      category: "MAX_BATTLE",
      status: maxStatus,
      material: isMax && !outgoing,
      summaryZhTw: isButterfree
        ? "蟲屬性 Max 攻擊手名次高，但整體泛用性與投資優先度有限；兩者是不同維度，不構成來源衝突。"
        : maxRow
          ? "屬性內排名與整體投資價值分欄保存，不把單一屬性名次當成全體 Max Battle 總排名。"
          : "此版本沒有可重現的 Max Battle 評估資料。",
      sourceIds: maxRows.map((row) => row.sourceId),
      maxTypeRank: maxRow
        ? (scopedRanks.get(maxRow.id) ?? migratedScopedRank(maxRow.migrationNote))
        : null,
      maxTypeTier: maxRow?.tier ?? null,
      maxTypeKey: maxTypeKey(maxRow?.rating ?? null),
      maxOverallRating: isButterfree ? "LIMITED" : (maxRow?.tier ?? null),
      maxInvestmentRating: isButterfree ? "LOW" : isLowTier(maxRow?.tier ?? null) ? "LOW" : null,
      maxUseCaseBreadth: isButterfree ? "NARROW" : null,
    });
    await upsertCategory({
      variantId: variant.id,
      category: "EVOLUTION_VALUE",
      status: evolutionStatus,
      provenance: variant.pokemonForm.species.dexNumber === 30 ? "MANUAL_CURATED" : undefined,
      material: outgoing || variant.pokemonForm.species.dexNumber === 30,
      summaryZhTw: outgoing
        ? "已有結構化進化路徑；後續進化價值可阻止前階個體被直接判定為通常可傳送。"
        : variant.pokemonForm.species.dexNumber === 30
          ? "可進化成尼多后；本批保留人工整理的實用進化結論，#031 的完整原始排名與來源細節仍待後續補齊。"
          : "本批資料中沒有後續進化路徑。",
      sourceIds: officialForm?.releaseSourceIds ?? [],
    });
  }
}

async function createPurifiedCategoryEvaluations() {
  const variants = await prisma.battleVariant.findMany({
    where: { variantKey: "PURIFIED" },
    include: {
      rawEvaluationData: true,
      pokemonForm: { include: { species: true } },
      inheritsFromVariant: {
        include: {
          categoryEvaluations: { include: { sourceReferences: true } },
        },
      },
    },
  });
  for (const variant of variants) {
    if (variant.releaseStatus !== "RELEASED") {
      const status: DataStatus =
        variant.releaseStatus === "UNRELEASED" ? "UNRELEASED" : "UNKNOWN_RELEASE_STATUS";
      for (const category of categories) {
        await upsertCategory({
          variantId: variant.id,
          category,
          status,
          material: false,
          summaryZhTw:
            variant.releaseStatus === "UNRELEASED"
              ? "已確認目前不可由暗影型態淨化取得。"
              : "對應暗影型態的推出狀態仍不明，無法確認此 Purified 版本是否可取得。",
          rocketRating: category === "ROCKET" ? "NOT_APPLICABLE" : undefined,
        });
      }
      continue;
    }
    const normalCategories = new Map(
      (variant.inheritsFromVariant?.categoryEvaluations ?? []).map((category) => [
        category.category,
        category,
      ]),
    );
    const ownPvp = variant.rawEvaluationData.filter((row) => row.category === "PVP");
    for (const category of categories) {
      if (category === "ROCKET") {
        await upsertCategory({
          variantId: variant.id,
          category,
          status: "DATA_UNAVAILABLE",
          material: false,
          rocketRating: "DATA_UNAVAILABLE",
          rocketRoles: [],
          summaryZhTw:
            "沒有完整可重現的逐物種火箭隊排名；淨化版不使用 PvP／PvE 名次代替火箭隊角色。",
          sourceIds: ["OFF-ROCKET-INVASION", "official-shadow-mechanic-20260715"],
        });
        continue;
      }
      if (category === "MEGA" || category === "MAX_BATTLE") {
        await upsertCategory({
          variantId: variant.id,
          category,
          status: "NOT_APPLICABLE",
          material: false,
          summaryZhTw:
            category === "MEGA"
              ? "Purified 個體本身不是 Mega 版本；Mega 候選價值由最終規則另行說明。"
              : "Purified 一般個體不會自動成為 Dynamax／Gigantamax 個體。",
          sourceIds: ["official-shadow-mechanic-20260715"],
        });
        continue;
      }
      const base = normalCategories.get(category);
      const hasPvpOverride = category === "PVP" && ownPvp.length > 0;
      const status = hasPvpOverride
        ? ownPvp.some((row) => row.status === "VERIFIED")
          ? "VERIFIED"
          : "PARTIALLY_VERIFIED"
        : ((base?.status as DataStatus | undefined) ?? "SOURCE_MISSING");
      const sourceIds = [
        ...(base?.sourceReferences.map((source) => source.sourceId) ?? []),
        ...(hasPvpOverride ? ownPvp.map((row) => row.sourceId) : []),
        "official-shadow-mechanic-20260715",
      ];
      await upsertCategory({
        variantId: variant.id,
        category,
        status,
        provenance: hasPvpOverride ? "SOURCE_VERIFIED" : "INHERITED",
        material: base?.materialToDecision ?? false,
        summaryZhTw: hasPvpOverride
          ? "基礎評價繼承普通版，另以報恩（Return）的可重現資料建立 Purified override。"
          : `基礎評價繼承普通版；另考慮強化成本、IV 增加、報恩與失去暗影型態的不可逆影響。${base?.summaryZhTw ?? ""}`,
        sourceIds,
      });
    }
  }
}

function categorySummary(
  categoriesByKey: Map<string, { summaryZhTw: string }>,
  category: Category,
) {
  return categoriesByKey.get(category)?.summaryZhTw ?? "此類別尚未建立資料狀態。";
}

async function recomputeEvaluations(invalidPvpVariants: Set<string>) {
  const before = await latestDecisionMap();
  const variants = await prisma.battleVariant.findMany({
    include: {
      pokemonForm: { include: { species: true, evolutionPathsFrom: true } },
      rawEvaluationData: true,
      categoryEvaluations: { include: { sourceReferences: true } },
    },
  });
  const siblingVariants = new Map<string, typeof variants>();
  for (const variant of variants) {
    siblingVariants.set(variant.pokemonFormId, [
      ...(siblingVariants.get(variant.pokemonFormId) ?? []),
      variant,
    ]);
  }
  await prisma.dataIssue.updateMany({
    where: { batchKey: "001-030", status: "OPEN" },
    data: { status: "RESOLVED", resolvedAt: checkedAt },
  });

  for (const variant of variants) {
    const byCategory = new Map(
      variant.categoryEvaluations.map((category) => [category.category, category]),
    );
    const pvpRows = variant.rawEvaluationData.filter((row) => row.category === "PVP");
    const pveRows = variant.rawEvaluationData.filter((row) => row.category === "PVE");
    const gymRows = variant.rawEvaluationData.filter((row) => row.category === "GYM");
    const megaRows = variant.rawEvaluationData.filter((row) => row.category === "MEGA");
    const maxRows = variant.rawEvaluationData.filter((row) => row.category === "MAX_BATTLE");
    const normalSibling = (siblingVariants.get(variant.pokemonFormId) ?? []).find(
      (sibling) => sibling.variantKey === "NORMAL",
    );
    const inheritedRows =
      variant.variantKey === "PURIFIED" ? (normalSibling?.rawEvaluationData ?? []) : [];
    const effectivePvpRows = [...inheritedRows.filter((row) => row.category === "PVP"), ...pvpRows];
    const effectivePveRows =
      variant.variantKey === "PURIFIED"
        ? inheritedRows.filter((row) => row.category === "PVE")
        : pveRows;
    const materialCategories = variant.categoryEvaluations
      .filter((category) => category.materialToDecision)
      .map((category) => category.category)
      .filter((category): category is "PVP" | "PVE" | "MEGA" | "MAX_BATTLE" | "EVOLUTION_VALUE" =>
        ["PVP", "PVE", "MEGA", "MAX_BATTLE", "EVOLUTION_VALUE"].includes(category),
      );
    const categoryStatuses = Object.fromEntries(
      variant.categoryEvaluations.map((category) => [category.category, category.status]),
    ) as EvaluationFacts["categoryStatuses"];
    const bestPvpRank = effectivePvpRows
      .map((row) => row.rank)
      .filter((rank): rank is number => rank !== null)
      .sort((a, b) => a - b)[0];
    const highPve = effectivePveRows.some((row) => isHighTier(row.tier));
    const lowPve =
      effectivePveRows.length > 0 && effectivePveRows.every((row) => isLowTier(row.tier));
    const isMega = variant.variantKey.startsWith("MEGA");
    const isMax = variant.variantKey === "DYNAMAX" || variant.variantKey === "GIGANTAMAX";
    const hasReleasedMega = (siblingVariants.get(variant.pokemonFormId) ?? []).some(
      (sibling) => sibling.variantKey.startsWith("MEGA") && sibling.releaseStatus === "RELEASED",
    );
    const majorPvp = bestPvpRank !== undefined && bestPvpRank <= 100;
    const conditionalPvp = bestPvpRank !== undefined && bestPvpRank > 100 && bestPvpRank <= 250;
    const pvpQualitativelyLow =
      byCategory.get("PVP")?.status === "UNRANKED" ||
      (bestPvpRank !== undefined && bestPvpRank > 250);
    const importantMega =
      isMega && (pveRows.some((row) => isHighTier(row.tier)) || megaRows.length > 0);
    const typeSpecialistOnly = variant.id === "012-kanto-gigantamax";
    const importantMax =
      isMax && !typeSpecialistOnly && maxRows.some((row) => /^(S|A\+?|B)$/i.test(row.tier ?? ""));
    const valuableEvolution =
      variant.pokemonForm.evolutionPathsFrom.length > 0 ||
      variant.pokemonForm.species.dexNumber === 30;
    const hasMaterialSource = variant.categoryEvaluations
      .filter((category) => category.materialToDecision)
      .every(
        (category) =>
          category.sourceReferences.length > 0 ||
          ["UNRANKED", "NOT_APPLICABLE", "UNRELEASED"].includes(category.status),
      );
    const facts: EvaluationFacts = {
      releaseStatus: variant.releaseStatus,
      categoryStatuses,
      materialCategories,
      hasUnreproducibleCriticalRank:
        invalidPvpVariants.has(variant.id) && byCategory.get("PVP")?.materialToDecision === true,
      possibleSpeciesMismatch: false,
      ruleCovered: true,
      hasOptionalDataGap: variant.categoryEvaluations.some(
        (category) =>
          !category.materialToDecision &&
          ["SOURCE_MISSING", "DATA_UNAVAILABLE", "PARTIALLY_VERIFIED"].includes(category.status),
      ),
      hasStaleNonCriticalData: false,
      decisionProvenance: "MANUAL_CURATED",
      hasReliableQualitativeAssessment: pvpRows.length > 0 || pveRows.length > 0,
      hasManualCuratedConclusion: variant.releaseStatus === "RELEASED",
      hasUnresolvedDecisionConflict: variant.categoryEvaluations.some(
        (category) => category.materialToDecision && category.status === "SOURCE_CONFLICT",
      ),
      hasReliableSources: hasMaterialSource,
      releaseStatusKnown: variant.releaseStatus !== "UNKNOWN",
      hasSourceConflict: variant.categoryEvaluations.some(
        (category) => category.materialToDecision && category.status === "SOURCE_CONFLICT",
      ),
      hasStaleCriticalData: false,
      majorPvpValue: majorPvp,
      highPveValue: highPve,
      shadowPveAdvantage: variant.variantKey === "SHADOW" && highPve,
      importantMega,
      importantMaxBattle: importantMax,
      highGymValue: gymRows.some((row) => row.tier === "A"),
      valuableEvolution,
      specialCupOnly: false,
      requiresSpecificMove:
        (majorPvp || highPve || importantMega || importantMax) &&
        variant.rawEvaluationData.some((row) => parseArray(row.recommendedMoves).length > 0),
      requiresSpecificIv: majorPvp || conditionalPvp,
      megaCandidateOnly: !isMega && !isMax && hasReleasedMega,
      maxCandidateOnly: isMax && !importantMax,
      limitedGymUse: gymRows.some((row) => row.tier === "B"),
      maxTypeSpecialistOnly: typeSpecialistOnly,
      speciesBattleValueLow:
        !majorPvp &&
        !highPve &&
        !importantMega &&
        !importantMax &&
        !valuableEvolution &&
        (lowPve ||
          byCategory.get("PVE")?.status === "NOT_APPLICABLE" ||
          (pvpQualitativelyLow && byCategory.get("PVE")?.status === "SOURCE_MISSING")),
      normalHighIvOnly: false,
      purificationRisk:
        variant.variantKey === "PURIFIED" && variant.purificationRiskZhTw.includes("不可逆"),
    };
    const result = evaluateRetention(facts);
    const missingCategories = variant.categoryEvaluations.filter((category) =>
      [
        "PARTIALLY_VERIFIED",
        "DATA_UNAVAILABLE",
        "SOURCE_MISSING",
        "SOURCE_CONFLICT",
        "POSSIBLE_SPECIES_MISMATCH",
        "UNKNOWN_RELEASE_STATUS",
        "STALE",
      ].includes(category.status),
    );
    const missingDataSummaryZhTw = missingCategories.length
      ? `待補資料：${missingCategories.map((category) => `${category.category}（${category.status}）`).join("、")}。${result.finalDecision === "HOLD_FOR_NOW" ? "此缺口可能改變目前結論。" : "這些缺口不會遮蓋目前的可執行建議。"}`
      : "目前沒有會影響保留建議的資料缺口。";
    const reviewStatus = missingCategories.length ? "DATA_PENDING" : "NOT_REQUIRED";
    const evaluationId = `evaluation-${sanitize(variant.id)}-${RULES_VERSION}`;
    await prisma.retentionEvaluation.upsert({
      where: { id: evaluationId },
      create: {
        id: evaluationId,
        battleVariantId: variant.id,
        finalDecision: result.finalDecision,
        provenance: result.finalDecision === "HOLD_FOR_NOW" ? "DATA_UNAVAILABLE" : "MANUAL_CURATED",
        pvpSummaryZhTw: categorySummary(byCategory, "PVP"),
        pveSummaryZhTw: categorySummary(byCategory, "PVE"),
        rocketSummaryZhTw: categorySummary(byCategory, "ROCKET"),
        gymSummaryZhTw: categorySummary(byCategory, "GYM"),
        gymRating: gymRows.some((row) => row.tier === "A")
          ? "HIGH"
          : gymRows.some((row) => row.tier === "B")
            ? "MEDIUM"
            : gymRows.length
              ? "LOW"
              : "NOT_APPLICABLE",
        megaSummaryZhTw: categorySummary(byCategory, "MEGA"),
        maxBattleSummaryZhTw: categorySummary(byCategory, "MAX_BATTLE"),
        evolutionSummaryZhTw: categorySummary(byCategory, "EVOLUTION_VALUE"),
        requiredMovesSummaryZhTw: variant.rawEvaluationData.some(
          (row) => parseArray(row.recommendedMoves).length > 0,
        )
          ? `來源建議招式：${[
              ...new Set(
                variant.rawEvaluationData.flatMap((row) => parseArray(row.recommendedMoves)),
              ),
            ].join("、")}。請先確認限定招式取得方式。`
          : "目前沒有會單獨改變保留結論的必要招式資料。",
        recommendedIvStrategyZhTw: result.recommendedIvStrategyZhTw,
        reasonZhTw: result.reasonZhTw,
        confidence: result.confidence,
        rulesVersion: RULES_VERSION,
        generatedAt: checkedAt,
        reviewed: false,
        reviewedAt: null,
        reviewStatus,
        missingDataSummaryZhTw,
        reviewNotesZhTw:
          result.finalDecision === "HOLD_FOR_NOW"
            ? "資料仍有關鍵不確定性；系統依傳送不可逆原則暫時建議保留，使用者不需自行判斷戰鬥價值。"
            : "系統已產生可執行結論；資料缺口另列資料待補清單，不要求使用者自行判斷。",
      },
      update: {
        finalDecision: result.finalDecision,
        provenance: result.finalDecision === "HOLD_FOR_NOW" ? "DATA_UNAVAILABLE" : "MANUAL_CURATED",
        pvpSummaryZhTw: categorySummary(byCategory, "PVP"),
        pveSummaryZhTw: categorySummary(byCategory, "PVE"),
        rocketSummaryZhTw: categorySummary(byCategory, "ROCKET"),
        gymSummaryZhTw: categorySummary(byCategory, "GYM"),
        gymRating: gymRows.some((row) => row.tier === "A")
          ? "HIGH"
          : gymRows.some((row) => row.tier === "B")
            ? "MEDIUM"
            : gymRows.length
              ? "LOW"
              : "NOT_APPLICABLE",
        megaSummaryZhTw: categorySummary(byCategory, "MEGA"),
        maxBattleSummaryZhTw: categorySummary(byCategory, "MAX_BATTLE"),
        evolutionSummaryZhTw: categorySummary(byCategory, "EVOLUTION_VALUE"),
        requiredMovesSummaryZhTw: variant.rawEvaluationData.some(
          (row) => parseArray(row.recommendedMoves).length > 0,
        )
          ? `來源建議招式：${[
              ...new Set(
                variant.rawEvaluationData.flatMap((row) => parseArray(row.recommendedMoves)),
              ),
            ].join("、")}。請先確認限定招式取得方式。`
          : "目前沒有會單獨改變保留結論的必要招式資料。",
        confidence: result.confidence,
        reasonZhTw: result.reasonZhTw,
        recommendedIvStrategyZhTw: result.recommendedIvStrategyZhTw,
        generatedAt: checkedAt,
        reviewStatus,
        missingDataSummaryZhTw,
        reviewNotesZhTw:
          result.finalDecision === "HOLD_FOR_NOW"
            ? "資料仍有關鍵不確定性；系統依傳送不可逆原則暫時建議保留，使用者不需自行判斷戰鬥價值。"
            : "系統已產生可執行結論；資料缺口另列資料待補清單，不要求使用者自行判斷。",
      },
    });
    await prisma.evaluationRuleTrace.deleteMany({ where: { evaluationId } });
    await prisma.evaluationRuleTrace.createMany({
      data: result.traces.map((trace, index) => ({
        id: `trace-${sanitize(evaluationId)}-${index}`,
        evaluationId,
        ruleKey: trace.ruleKey,
        ruleVersion: RULES_VERSION,
        priority: trace.priority,
        matched: trace.matched,
        resultDecision: trace.resultDecision,
        explanationZhTw: trace.explanationZhTw,
      })),
    });
    const sourceIds = [
      ...new Set(
        variant.categoryEvaluations.flatMap((category) =>
          category.sourceReferences.map((reference) => reference.sourceId),
        ),
      ),
    ];
    await prisma.evaluationSource.deleteMany({ where: { evaluationId } });
    if (sourceIds.length) {
      await prisma.evaluationSource.createMany({
        data: sourceIds.map((sourceId) => ({
          evaluationId,
          sourceId,
          usageZhTw: "支援類別資料狀態、推出狀態或最終保留結論。",
        })),
      });
    }
    if (before.get(variant.id) !== result.finalDecision) {
      await addChange({
        id: `remediation-decision-${sanitize(variant.id)}-${sanitize(RULES_VERSION)}`,
        entityType: "BattleVariant",
        entityId: variant.id,
        fieldName: "decision",
        previousValue: before.get(variant.id) ?? null,
        newValue: result.finalDecision,
        sourceId: sourceIds[0] ?? null,
        reasonZhTw:
          "採用不可逆風險原則重新計算；關鍵不確定性改為 HOLD_FOR_NOW，次要缺口只降低信心並保留資料待補事項。",
      });
    }
  }
  return before;
}

async function createReviewIssues(invalidPvpVariants: Set<string>) {
  const decisions = await latestDecisionMap();
  const variants = await prisma.battleVariant.findMany({ include: { categoryEvaluations: true } });
  for (const variant of variants) {
    const holdForNow = decisions.get(variant.id) === "HOLD_FOR_NOW";
    const issues: Array<{
      type:
        | "MATERIAL_DATA_GAP"
        | "UNKNOWN_RELEASE_STATUS"
        | "UNREPRODUCIBLE_RANK"
        | "RULE_NOT_COVERED"
        | "LOW_CONFIDENCE"
        | "OPTIONAL_DATA_MISSING";
      message: string;
      affects: boolean;
      action: string;
    }> = [];
    if (variant.releaseStatus === "UNKNOWN") {
      issues.push({
        type: "UNKNOWN_RELEASE_STATUS",
        message: "此 BattleVariant 是否已在 Pokémon GO 推出仍無法由可靠原始來源確認。",
        affects: true,
        action: "查找 Pokémon GO 官方公告、官方新聞或可核對日期的正式推出紀錄。",
      });
    }
    for (const category of variant.categoryEvaluations.filter(
      (item) =>
        item.materialToDecision &&
        ["SOURCE_MISSING", "SOURCE_CONFLICT", "UNKNOWN_RELEASE_STATUS"].includes(item.status),
    )) {
      issues.push({
        type: "MATERIAL_DATA_GAP",
        message: `${category.category} 類別仍有資料備註，目前狀態為 ${category.status}。${category.summaryZhTw}`,
        affects: category.status === "SOURCE_CONFLICT" || holdForNow,
        action: holdForNow
          ? `查找並核對 ${category.category} 的原始資料，重新執行規則引擎以產生正式建議。`
          : `保留目前實用結論，後續補齊 ${category.category} 精確資料並重新評估信心程度。`,
      });
    }
    if (invalidPvpVariants.has(variant.id)) {
      const material =
        variant.categoryEvaluations.find((item) => item.category === "PVP")?.materialToDecision ??
        false;
      issues.push({
        type: "UNREPRODUCIBLE_RANK",
        message:
          "舊 PvPoke 精確名次無法由固定 commit 的完整 Open League／Overall JSON 重現，正式 rank 已清空。",
        affects: material && holdForNow,
        action:
          "重新取得完整結構化榜單，核對 species、form、variant、league、cup、category 與 season。",
      });
    }
    const optional = variant.categoryEvaluations.filter(
      (item) =>
        !item.materialToDecision &&
        ["SOURCE_MISSING", "DATA_UNAVAILABLE", "PARTIALLY_VERIFIED"].includes(item.status),
    );
    if (optional.length) {
      issues.push({
        type: "OPTIONAL_DATA_MISSING",
        message: `非關鍵類別仍有次要缺口：${optional.map((item) => `${item.category}=${item.status}`).join("、")}。`,
        affects: false,
        action: "日後有可靠資料集時補充；目前不應用此項覆蓋已有充分依據的最終結論。",
      });
    }
    if (holdForNow && !issues.some((issue) => issue.affects)) {
      issues.push({
        type: "RULE_NOT_COVERED",
        message: "此特殊型態尚未被現行規則完整處理，可能改變保留結論。",
        affects: true,
        action: "確認該型態的價值維度，新增具版本的規則或補充關鍵原始資料後重新計算。",
      });
    }
    for (const [index, issue] of issues.entries()) {
      const id = `issue-${sanitize(variant.id)}-${RULES_VERSION}-${sanitize(issue.type)}-${index}`;
      await prisma.dataIssue.upsert({
        where: { id },
        create: {
          id,
          pokemonFormId: variant.pokemonFormId,
          battleVariantId: variant.id,
          issueType: issue.type,
          status: "OPEN",
          batchKey: "001-030",
          messageZhTw: issue.message,
          affectsFinalDecision: issue.affects,
          provisionalDecision: decisions.get(variant.id) ?? "HOLD_FOR_NOW",
          suggestedActionZhTw: issue.action,
          suggestedResearchActionZhTw: issue.action,
          lastResearchedAt: checkedAt,
          detectedAt: checkedAt,
        },
        update: {
          status: "OPEN",
          resolvedAt: null,
          messageZhTw: issue.message,
          affectsFinalDecision: issue.affects,
          provisionalDecision: decisions.get(variant.id) ?? "HOLD_FOR_NOW",
          suggestedActionZhTw: issue.action,
          suggestedResearchActionZhTw: issue.action,
          lastResearchedAt: checkedAt,
        },
      });
    }
  }
}

async function writeMetrics(before: Map<string, string>) {
  const after = await latestDecisionMap();
  const variants = await prisma.battleVariant.findMany({ include: { categoryEvaluations: true } });
  const originalNeedsIds = new Set(
    [...before.entries()]
      .filter(([, decision]) => String(decision) === "NEEDS_REVIEW")
      .map(([id]) => id),
  );
  const reclassified = variants.filter((variant) => originalNeedsIds.has(variant.id));
  const openMaterialIssues = await prisma.dataIssue.findMany({
    where: { batchKey: "001-030", status: "OPEN", affectsFinalDecision: true },
    select: {
      battleVariantId: true,
      issueType: true,
      messageZhTw: true,
      suggestedActionZhTw: true,
    },
  });
  const nonImpactingOpenIssueCount = await prisma.dataIssue.count({
    where: { batchKey: "001-030", status: "OPEN", affectsFinalDecision: false },
  });
  const holdForNowReasons = await prisma.retentionEvaluation.findMany({
    where: {
      rulesVersion: RULES_VERSION,
      finalDecision: "HOLD_FOR_NOW",
      battleVariant: { pokemonForm: { species: { dexNumber: { gte: 1, lte: 30 } } } },
    },
    select: { battleVariantId: true, reasonZhTw: true },
    orderBy: { battleVariantId: "asc" },
  });
  const reclassificationCounts = {
    KEEP: reclassified.filter((variant) => after.get(variant.id) === "KEEP").length,
    CONDITIONAL_KEEP: reclassified.filter((variant) => after.get(variant.id) === "CONDITIONAL_KEEP")
      .length,
    HOLD_FOR_NOW: reclassified.filter((variant) => after.get(variant.id) === "HOLD_FOR_NOW").length,
    TRANSFER_CANDIDATE: reclassified.filter(
      (variant) => after.get(variant.id) === "TRANSFER_CANDIDATE",
    ).length,
  };
  const metrics = {
    batch: "001-030",
    generatedAt: checkedAt.toISOString(),
    rulesVersion: RULES_VERSION,
    originalNeedsReviewCount: originalNeedsIds.size,
    reclassificationCounts,
    holdForNowReasons,
    nonImpactingOpenIssueCount,
    resolvedWithNotApplicable: reclassified.filter((variant) =>
      variant.categoryEvaluations.some((category) => category.status === "NOT_APPLICABLE"),
    ).length,
    decidedWithDataUnavailable: reclassified.filter((variant) =>
      variant.categoryEvaluations.some((category) => category.status === "DATA_UNAVAILABLE"),
    ).length,
    resolvedByPurifiedInheritance: reclassified.filter(
      (variant) => variant.variantKey === "PURIFIED" && variant.inheritanceMode !== "NONE",
    ).length,
    resolvedByPracticalDecisionBasis: reclassified.filter(
      (variant) => variant.releaseStatus === "RELEASED",
    ).length,
    purifiedInheritedCategoryCount: variants
      .filter((variant) => variant.variantKey === "PURIFIED" && variant.inheritanceMode !== "NONE")
      .reduce(
        (total, variant) =>
          total +
          variant.categoryEvaluations.filter((category) =>
            ["PVP", "PVE", "GYM", "EVOLUTION_VALUE"].includes(category.category),
          ).length,
        0,
      ),
    purifiedOverrides: variants.filter(
      (variant) => variant.variantKey === "PURIFIED" && variant.purifiedOverrideRequired,
    ).length,
    remainingMaterialIssues: openMaterialIssues,
  };
  await mkdir("data/remediation", { recursive: true });
  const json = `${JSON.stringify(metrics, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`;
  await writeFile("data/remediation/001-030-metrics.json", json, "utf8");
  return metrics;
}

async function main() {
  const before = await baselineDecisionMap();
  const official = await readJson<OfficialResearch>("research_notes/official-001-030.json");
  const { sha, rankings } = await loadPvpRankings();
  await applyReleaseStatuses(official, rankings);
  await reclassifyReturnRows();
  const invalidPvpVariants = await verifyPvpRows(sha, rankings);
  const scopedRanks = await normalizeScopedRanks();
  await configurePurifiedInheritance();
  await createBaseCategoryEvaluations(scopedRanks, official);
  await createPurifiedCategoryEvaluations();
  await recomputeEvaluations(invalidPvpVariants);
  await createReviewIssues(invalidPvpVariants);
  const metrics = await writeMetrics(before);
  console.log(
    `重新分類完成：原 NEEDS_REVIEW ${metrics.originalNeedsReviewCount} 筆；KEEP ${metrics.reclassificationCounts.KEEP}、CONDITIONAL_KEEP ${metrics.reclassificationCounts.CONDITIONAL_KEEP}、HOLD_FOR_NOW ${metrics.reclassificationCounts.HOLD_FOR_NOW}、TRANSFER_CANDIDATE ${metrics.reclassificationCounts.TRANSFER_CANDIDATE}。`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
