import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import {
  classifyAssessmentDisposition,
  classifyPveUse,
  missingDataSummaryZhTw,
  pveUseLevelLabelZhTw,
  strongestPveUseLevel,
  type AssessmentDisposition,
  type PveUseLevel,
} from "../src/rules/battle-assessment";
import { laterEvolutionUses } from "../src/data/later-evolution-uses";
import { RULES_VERSION } from "../src/rules/rules";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const checkedAt = new Date("2026-08-05T18:00:00+08:00");
const dexMin = 1;
const dexMax = 151;

const criticalIssueTypes = new Set([
  "MATERIAL_DATA_GAP",
  "UNKNOWN_RELEASE_STATUS",
  "UNREPRODUCIBLE_RANK",
  "POSSIBLE_SPECIES_MISMATCH",
  "SOURCE_CONFLICT",
  "STALE_DATA",
  "MISSING_PRIMARY_SOURCE",
  "MISSING_SOURCE",
  "STALE_SOURCE",
  "RULE_NOT_COVERED",
]);

const normalMegaCandidateForms = new Set([
  "065-kanto",
  "071-kanto",
  "080-kanto",
  "094-kanto",
  "115-kanto",
  "121-kanto",
  "127-kanto",
  "130-kanto",
  "142-kanto",
  "149-kanto",
  "150-kanto",
]);

const categories = [
  "PVP",
  "PVE",
  "ROCKET",
  "GYM",
  "MEGA",
  "MAX_BATTLE",
  "EVOLUTION_VALUE",
] as const;

async function loadVariants() {
  return prisma.battleVariant.findMany({
    where: { pokemonForm: { species: { dexNumber: { gte: dexMin, lte: dexMax } } } },
    include: {
      pokemonForm: {
        include: {
          species: true,
          evolutionPathsFrom: true,
        },
      },
      rawEvaluationData: true,
      categoryEvaluations: true,
      retentionEvaluations: {
        orderBy: { generatedAt: "desc" },
        take: 1,
        include: { ruleTraces: true },
      },
      dataIssues: { where: { status: "OPEN" } },
    },
    orderBy: [{ pokemonForm: { species: { dexNumber: "asc" } } }, { variantKey: "asc" }],
  });
}

type VariantRecord = Awaited<ReturnType<typeof loadVariants>>[number];
type CategoryRecord = VariantRecord["categoryEvaluations"][number];
type Decision = "KEEP" | "CONDITIONAL_KEEP" | "HOLD_FOR_NOW" | "TRANSFER_CANDIDATE";

interface DirectAssessment {
  pveLevel: PveUseLevel;
  hasDirectPveValue: boolean;
  hasDirectPveCore: boolean;
  hasPvpValue: boolean;
  bestPvpRank: number | null;
  hasGymValue: boolean;
  gymRating: string;
  hasMegaValue: boolean;
  hasMaxValue: boolean;
  hasMaxCore: boolean;
  hasSpecialAcquisition: boolean;
  hasCriticalIssue: boolean;
}

interface RecalculatedAssessment extends DirectAssessment {
  pveUseLevel: PveUseLevel;
  disposition: AssessmentDisposition;
  hasLaterEvolutionValue: boolean;
  laterEvolutionTarget: string | null;
  laterEvolutionNote: string | null;
  laterEvolutionLevel: PveUseLevel | null;
  decision: Decision;
  ruleKey: string;
  reasonZhTw: string;
  pveSummaryZhTw: string;
  evolutionSummaryZhTw: string;
  missingDataSummaryZhTw: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reviewStatus: "NOT_REQUIRED" | "DATA_PENDING" | "RESOLVED";
  reviewed: boolean;
  gymRating: "HIGH" | "MEDIUM" | "LOW" | "SPECIAL_CASE" | "NOT_APPLICABLE";
}

function category(variant: VariantRecord, key: (typeof categories)[number]) {
  return variant.categoryEvaluations.find((item) => item.category === key);
}

function pvpRanks(variant: VariantRecord) {
  return variant.rawEvaluationData
    .filter((item) => item.category === "PVP" && typeof item.rank === "number")
    .map((item) => item.rank as number);
}

function rawPveEvidence(variant: VariantRecord) {
  return variant.rawEvaluationData.filter((item) => item.category === "PVE");
}

function directPveLevel(variant: VariantRecord, pve: CategoryRecord | undefined) {
  if (["DYNAMAX", "GIGANTAMAX", "PURIFIED"].includes(variant.variantKey)) {
    return "NO_SIGNIFICANT_USE" as const;
  }
  const raw = rawPveEvidence(variant);
  if (raw.length) {
    return classifyPveUse({
      pveTiers: raw.map((item) => item.tier ?? item.rating),
      pveRanks: raw.map((item) => item.rank),
    });
  }
  return pve?.materialToDecision && ["VERIFIED", "PARTIALLY_VERIFIED"].includes(pve.status)
    ? ("CORE_INVESTMENT" as const)
    : ("NO_SIGNIFICANT_USE" as const);
}

function hasMatchedRule(variant: VariantRecord, ruleKey: string) {
  return variant.retentionEvaluations[0]?.ruleTraces.some(
    (trace) => trace.matched && trace.ruleKey === ruleKey,
  );
}

function issueIsCritical(issue: VariantRecord["dataIssues"][number]) {
  return issue.affectsFinalDecision && criticalIssueTypes.has(issue.issueType);
}

function directAssessment(variant: VariantRecord): DirectAssessment {
  const pve = category(variant, "PVE");
  const mega = category(variant, "MEGA");
  const max = category(variant, "MAX_BATTLE");
  const gym = category(variant, "GYM");
  const ranks = pvpRanks(variant);
  const bestPvpRank = ranks.length ? Math.min(...ranks) : null;
  const pvpValue = bestPvpRank !== null && bestPvpRank <= 250;
  const directPve = directPveLevel(variant, pve);
  const hasDirectPveValue = directPve !== "NO_SIGNIFICANT_USE";
  const hasDirectPveCore = directPve === "CORE_INVESTMENT";
  const hasMegaValue = Boolean(
    mega?.materialToDecision ||
      (variant.variantKey === "NORMAL" && normalMegaCandidateForms.has(variant.pokemonFormId)),
  );
  const hasMaxValue = Boolean(
    max?.materialToDecision ||
      (variant.variantKey === "GIGANTAMAX" && variant.releaseStatus === "RELEASED"),
  );
  const hasGymValue = Boolean(
    gym?.materialToDecision ||
      ["HIGH", "MEDIUM", "SPECIAL_CASE"].includes(variant.retentionEvaluations[0]?.gymRating),
  );
  const hasMaxCore = Boolean(
    variant.variantKey === "GIGANTAMAX" &&
      ["HIGH", "CORE"].includes(max?.maxOverallRating ?? max?.maxInvestmentRating ?? ""),
  );
  const classifiedPveLevel = classifyPveUse({
    pveTiers: rawPveEvidence(variant).map((item) => item.tier ?? item.rating),
    pveRanks: rawPveEvidence(variant).map((item) => item.rank),
    hasDirectMajorPveValue: hasDirectPveCore || hasMaxCore,
    hasShadowPveValue: variant.variantKey === "SHADOW" && hasDirectPveCore,
    hasMegaPveValue: variant.variantKey.startsWith("MEGA") && hasDirectPveCore,
    hasMaxPveValue: hasMaxValue,
    hasGymValue,
    isReleased: variant.isReleased ?? false,
    releaseStatus: variant.releaseStatus,
  });
  const pveLevel =
    classifiedPveLevel === "NO_SIGNIFICANT_USE" &&
    variant.variantKey.startsWith("MEGA") &&
    hasMegaValue
      ? "SPECIAL_USE"
      : classifiedPveLevel;

  return {
    pveLevel,
    hasDirectPveValue,
    hasDirectPveCore: hasDirectPveCore || hasMaxCore,
    hasPvpValue: pvpValue,
    bestPvpRank,
    hasGymValue,
    gymRating: variant.retentionEvaluations[0]?.gymRating ?? "NOT_APPLICABLE",
    hasMegaValue,
    hasMaxValue,
    hasMaxCore,
    hasSpecialAcquisition: hasMatchedRule(variant, "SPECIAL_ACQUISITION"),
    hasCriticalIssue: variant.dataIssues.some(
      (issue) => issueIsCritical(issue) && issue.issueType !== "RULE_NOT_COVERED",
    ),
  };
}

function buildOutgoing(variants: VariantRecord[]) {
  const outgoing = new Map<string, string[]>();
  for (const variant of variants) {
    for (const path of variant.pokemonForm.evolutionPathsFrom) {
      const targets = outgoing.get(path.fromFormId) ?? [];
      targets.push(path.toFormId);
      outgoing.set(path.fromFormId, targets);
    }
  }
  return outgoing;
}

function descendantForms(formId: string, outgoing: Map<string, string[]>) {
  const result: string[] = [];
  const queue = [...(outgoing.get(formId) ?? [])];
  const seen = new Set<string>();
  while (queue.length) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    result.push(current);
    queue.push(...(outgoing.get(current) ?? []));
  }
  return result;
}

function hasResolvedFamilyBoundary(variant: VariantRecord, hasLaterEvolutionValue: boolean) {
  if (hasLaterEvolutionValue || variant.pokemonForm.id === "090-kanto") return true;
  return !/範圍外|後續重要進化|可繼續進化/.test(variant.pokemonForm.evolutionFamilyNotesZhTw);
}

function makeDirectMap(variants: VariantRecord[]) {
  return new Map(variants.map((variant) => [variant.id, directAssessment(variant)]));
}

function laterEvolutionAssessment(
  variant: VariantRecord,
  directByVariant: Map<string, DirectAssessment>,
  variantsByForm: Map<string, VariantRecord[]>,
  outgoing: Map<string, string[]>,
) {
  if (!["NORMAL", "SHADOW"].includes(variant.variantKey)) {
    return {
      hasValue: false,
      target: null,
      note: null,
      level: null,
    };
  }
  const curated = laterEvolutionUses[variant.pokemonForm.id];
  const descendants = descendantForms(variant.pokemonForm.id, outgoing);
  const descendantVariants = descendants.flatMap((formId) => variantsByForm.get(formId) ?? []);
  const descendantUseful = descendantVariants.filter(
    (candidate) =>
      (variant.variantKey === "SHADOW"
        ? candidate.variantKey === "SHADOW"
        : candidate.variantKey !== "PURIFIED") &&
      (directByVariant.get(candidate.id)?.hasDirectPveValue ||
        directByVariant.get(candidate.id)?.hasMegaValue ||
        directByVariant.get(candidate.id)?.hasMaxValue ||
        directByVariant.get(candidate.id)?.hasPvpValue ||
        directByVariant.get(candidate.id)?.hasGymValue),
  );
  if (curated) {
    return {
      hasValue: true,
      target: curated.targetZhTw,
      note: curated.noteZhTw,
      level: curated.level,
    };
  }
  if (!descendantUseful.length) {
    return { hasValue: false, target: null, note: null, level: null };
  }
  const best = descendantUseful
    .map((candidate) => ({ candidate, assessment: directByVariant.get(candidate.id)! }))
    .sort((a, b) => {
      const aLevel = a.assessment.pveLevel;
      const bLevel = b.assessment.pveLevel;
      return strongestPveUseLevel([bLevel]).localeCompare(strongestPveUseLevel([aLevel]));
    })[0];
  return {
    hasValue: true,
    target: best?.candidate.pokemonForm.formNameZhTw ?? best?.candidate.pokemonForm.species.nameZhTw ?? "後續進化",
    note: "後續進化版本已有可執行戰鬥用途；前階只留符合條件的進化候選。",
    level: best?.assessment.pveLevel ?? "SPECIAL_USE",
  };
}

function pveSummary(assessment: {
  pveUseLevel: PveUseLevel;
  hasDirectPveValue: boolean;
  isShadow: boolean;
  hasMaxValue: boolean;
  hasGymValue: boolean;
  hasLaterEvolutionValue: boolean;
  laterEvolutionTarget: string | null;
  laterEvolutionNote: string | null;
}) {
  const label = pveUseLevelLabelZhTw[assessment.pveUseLevel];
  const details: string[] = [];
  if (assessment.hasDirectPveValue) details.push("本版本有直接 PvE 證據");
  if (assessment.isShadow && assessment.hasDirectPveValue) {
    details.push("暗影標準較寬；不設攻擊或總 IV 硬性最低門檻");
  }
  if (assessment.hasMaxValue) details.push("Max Battle 版本需與普通／暗影分開保留");
  if (assessment.hasGymValue) details.push("道館防守列為特殊用途");
  if (assessment.hasLaterEvolutionValue && assessment.laterEvolutionTarget) {
    details.push(
      `${assessment.laterEvolutionTarget}：${assessment.laterEvolutionNote ?? "後續進化有用途"}`,
    );
  }
  return `${label}。${details.join("；") || "目前沒有足以支持 PvE 投資的直接用途。"}`;
}

function makeDecision(input: {
  variant: VariantRecord;
  direct: DirectAssessment;
  hasLaterEvolutionValue: boolean;
  hasTrueDataGap: boolean;
  laterEvolutionTarget: string | null;
  disposition: AssessmentDisposition;
}): Pick<RecalculatedAssessment, "decision" | "ruleKey" | "reasonZhTw"> {
  const { variant, direct, hasLaterEvolutionValue, hasTrueDataGap, laterEvolutionTarget, disposition } =
    input;
  if (variant.releaseStatus === "UNRELEASED") {
    return {
      decision: "TRANSFER_CANDIDATE",
      ruleKey: "UNRELEASED_VARIANT",
      reasonZhTw: "不適用／尚未推出；不要把現有個體誤當成尚未推出版本的候選。",
    };
  }
  if (hasTrueDataGap || disposition === "TRUE_DATA_PENDING") {
    return {
      decision: "HOLD_FOR_NOW",
      ruleKey: "MATERIAL_UNCERTAINTY",
      reasonZhTw: "真正待補資料：無法判斷，暫時不要傳；請補齊主要來源後再重算。",
    };
  }
  if (variant.variantKey === "PURIFIED") {
    return {
      decision: "TRANSFER_CANDIDATE",
      ruleKey: "NO_MAJOR_USE",
      reasonZhTw: "淨化版本不另設主要榜單；淨化不可逆，不因缺少次要欄位而整個家族暫停判斷。",
    };
  }
  if (direct.hasSpecialAcquisition) {
    return {
      decision: "KEEP",
      ruleKey: "SPECIAL_ACQUISITION",
      reasonZhTw: "特殊取得個體應保留；不以 IV 或次要資料缺口作傳送門檻。",
    };
  }
  if (
    direct.hasDirectPveCore ||
    direct.bestPvpRank !== null && direct.bestPvpRank <= 100 ||
    (direct.hasMegaValue && variant.variantKey.startsWith("MEGA") && direct.hasDirectPveValue) ||
    (direct.hasMaxCore && variant.variantKey === "GIGANTAMAX") ||
    direct.gymRating === "HIGH"
  ) {
    return {
      decision: "KEEP",
      ruleKey: "MAJOR_BATTLE_VALUE",
      reasonZhTw: "核心投資：目前已有明確 PvP／PvE／Mega／Max 或高道館用途；保留符合版本與用途的候選。",
    };
  }
  if (hasLaterEvolutionValue) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "VALUABLE_EVOLUTION",
      reasonZhTw: `用途有限：後續進化${laterEvolutionTarget ? `（${laterEvolutionTarget}）` : ""}已有用途；只保留少量符合條件的進化候選。`,
    };
  }
  if (variant.variantKey === "NORMAL" && direct.hasMegaValue) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "CONDITIONAL_USE",
      reasonZhTw: "用途有限：其餘普通重複可傳；只留 Mega 候選或符合其他用途的少量個體。",
    };
  }
  if (
    direct.hasPvpValue ||
    direct.hasGymValue ||
    direct.hasMegaValue ||
    direct.hasMaxValue ||
    direct.pveLevel !== "NO_SIGNIFICANT_USE"
  ) {
    return {
      decision: "CONDITIONAL_KEEP",
      ruleKey: "CONDITIONAL_USE",
      reasonZhTw: "用途有限或屬特殊用途；只留少量符合版本、招式、IV 或道館需求的個體。",
    };
  }
  return {
    decision: "TRANSFER_CANDIDATE",
    ruleKey: "LOW_GENERAL_VALUE",
    reasonZhTw: "無顯著用途：已有足夠資料判定目前缺乏主要 PvP、PvE、道館、Mega、Max 或後續進化理由，一般重複個體通常可傳。",
  };
}

function ivStrategy(variant: VariantRecord, decision: Decision) {
  if (decision === "HOLD_FOR_NOW") return "無法判斷，暫時不要傳；資料補齊前不以 IV 大量篩除。";
  if (variant.pokemonFormId === "151-kanto" && variant.variantKey === "NORMAL") {
    return "特殊取得個體應保留；不以 IV 作傳送門檻。";
  }
  if (variant.variantKey === "SHADOW") {
    return "暗影標準較寬；15攻優先，不設硬性最低IV。先留用途候選再篩選。";
  }
  if (["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(variant.variantKey)) {
    return "先確認版本、招式與投入；15攻優先；14攻高整體IV亦可留。";
  }
  if (decision === "KEEP" || decision === "CONDITIONAL_KEEP") {
    return "依實際用途分開篩選；PvP 看個體 Rank，PvE／道館先看招式、等級／CP與既有投入；15攻優先，14攻高整體IV亦可留。沒有可靠斷點時，不宣稱15/10/10一定優於14/15/15。";
  }
  return "沒有主要用途時，不因 100% 自動產生保留理由。";
}

function reviewStatus(disposition: AssessmentDisposition) {
  return disposition === "TRUE_DATA_PENDING" ? "DATA_PENDING" : "RESOLVED";
}

function confidence(variant: VariantRecord, assessment: RecalculatedAssessment) {
  if (assessment.disposition === "TRUE_DATA_PENDING") return "LOW" as const;
  if (
    assessment.decision === "CONDITIONAL_KEEP" ||
    assessment.hasLaterEvolutionValue ||
    variant.categoryEvaluations.some((item) => item.provenance !== "SOURCE_VERIFIED")
  ) {
    return "MEDIUM" as const;
  }
  return "HIGH" as const;
}

function categoryDisposition(variant: VariantRecord, assessment: RecalculatedAssessment) {
  if (variant.releaseStatus === "UNRELEASED") return "NOT_APPLICABLE_OR_UNRELEASED" as const;
  return assessment.disposition;
}

function shouldKeepRuleNotCovered(variant: VariantRecord, assessment: RecalculatedAssessment) {
  return (
    assessment.disposition === "TRUE_DATA_PENDING" &&
    !hasResolvedFamilyBoundary(variant, assessment.hasLaterEvolutionValue)
  );
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function main() {
  const variants = await loadVariants();
  const variantsByForm = new Map<string, VariantRecord[]>();
  for (const variant of variants) {
    const group = variantsByForm.get(variant.pokemonFormId) ?? [];
    group.push(variant);
    variantsByForm.set(variant.pokemonFormId, group);
  }
  const outgoing = buildOutgoing(variants);
  const directByVariant = makeDirectMap(variants);
  const assessments = new Map<string, RecalculatedAssessment>();
  const changeLogs: Array<{
    id: string;
    entityType: string;
    entityId: string;
    fieldName: string;
    previousValue: string | null;
    newValue: string | null;
    sourceId: string | null;
    changeReasonZhTw: string;
    changedAt: Date;
    rulesVersion: string;
  }> = [];

  for (const variant of variants) {
    const direct = directByVariant.get(variant.id)!;
    const later = laterEvolutionAssessment(
      variant,
      directByVariant,
      variantsByForm,
      outgoing,
    );
    const hasTrueDataGap =
      direct.hasCriticalIssue ||
      (variant.releaseStatus === "UNKNOWN" &&
        !direct.hasPvpValue &&
        !direct.hasDirectPveValue &&
        !later.hasValue) ||
      (variant.dataIssues.some(
        (issue) => issueIsCritical(issue) && issue.issueType !== "RULE_NOT_COVERED",
      ) && !direct.hasDirectPveValue && !direct.hasPvpValue && !later.hasValue) ||
      (variant.dataIssues.some((issue) => issue.issueType === "RULE_NOT_COVERED") &&
        !hasResolvedFamilyBoundary(variant, later.hasValue) &&
        !direct.hasPvpValue &&
        !direct.hasDirectPveValue &&
        !later.hasValue);
    const derivedPveLevel = classifyPveUse({
        hasDirectMajorPveValue: direct.hasDirectPveCore,
        hasShadowPveValue: variant.variantKey === "SHADOW" && direct.hasDirectPveCore,
        hasMegaPveValue: variant.variantKey.startsWith("MEGA") && direct.hasDirectPveCore,
        hasMaxPveValue: direct.hasMaxValue,
        hasGymValue: direct.hasGymValue,
        hasLaterEvolutionValue: later.hasValue,
        laterEvolutionLevel: later.level ?? undefined,
        hasSpecialAcquisition: direct.hasSpecialAcquisition,
        releaseStatus: variant.releaseStatus,
      });
    const pveUseLevel =
      direct.pveLevel === "NO_SIGNIFICANT_USE" && later.hasValue
        ? (later.level ?? "SPECIAL_USE")
        : strongestPveUseLevel([direct.pveLevel, derivedPveLevel]);
    const hasActionableUse =
      direct.hasDirectPveValue ||
      direct.hasPvpValue ||
      direct.hasGymValue ||
      direct.hasMegaValue ||
      direct.hasMaxValue ||
      direct.hasSpecialAcquisition ||
      later.hasValue;
    const disposition = classifyAssessmentDisposition({
      releaseStatus: variant.releaseStatus,
      pveUseLevel,
      hasAnyActionableUse: hasActionableUse && variant.variantKey !== "PURIFIED",
      hasTrueDataGap,
    });
    const decisionResult = makeDecision({
      variant,
      direct,
      hasLaterEvolutionValue: later.hasValue,
      hasTrueDataGap,
      laterEvolutionTarget: later.target,
      disposition,
    });
    const assessment: RecalculatedAssessment = {
      ...direct,
      pveUseLevel,
      disposition,
      hasLaterEvolutionValue: later.hasValue,
      laterEvolutionTarget: later.target,
      laterEvolutionNote: later.note,
      laterEvolutionLevel: later.level,
      ...decisionResult,
      pveSummaryZhTw: pveSummary({
        pveUseLevel,
        hasDirectPveValue: direct.hasDirectPveValue,
        isShadow: variant.variantKey === "SHADOW",
        hasMaxValue: direct.hasMaxValue,
        hasGymValue: direct.hasGymValue,
        hasLaterEvolutionValue: later.hasValue,
        laterEvolutionTarget: later.target,
        laterEvolutionNote: later.note,
      }),
      evolutionSummaryZhTw: later.hasValue
        ? later.note ?? `後續進化目標：${later.target ?? "用途候選"}。`
        : "目前沒有需要跨家族回推的已確認進化用途。",
      missingDataSummaryZhTw: missingDataSummaryZhTw(disposition),
      confidence: "HIGH",
      reviewStatus: reviewStatus(disposition),
      reviewed: disposition !== "TRUE_DATA_PENDING",
      gymRating: ["HIGH", "MEDIUM", "LOW", "SPECIAL_CASE"].includes(direct.gymRating)
        ? (direct.gymRating as RecalculatedAssessment["gymRating"])
        : "NOT_APPLICABLE",
    };
    assessment.confidence = confidence(variant, assessment);
    assessments.set(variant.id, assessment);

    const oldEvaluation = variant.retentionEvaluations[0];
    if (oldEvaluation && oldEvaluation.finalDecision !== assessment.decision) {
      changeLogs.push({
        id: `recalibrate-20260805-decision-${safeId(variant.id)}`,
        entityType: "BattleVariant",
        entityId: variant.id,
        fieldName: "decision",
        previousValue: oldEvaluation.finalDecision,
        newValue: assessment.decision,
        sourceId: null,
        changeReasonZhTw: "重新套用 PvE 四級用途與逐版本資料處置規則。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      });
    }
    if (oldEvaluation && oldEvaluation.assessmentDisposition !== assessment.disposition) {
      changeLogs.push({
        id: `recalibrate-20260805-disposition-${safeId(variant.id)}`,
        entityType: "BattleVariant",
        entityId: variant.id,
        fieldName: "assessmentDisposition",
        previousValue: oldEvaluation.assessmentDisposition,
        newValue: assessment.disposition,
        sourceId: null,
        changeReasonZhTw: "將用途明確性與資料缺口拆成逐版本狀態，不再由單一欄位外推整個家族。",
        changedAt: checkedAt,
        rulesVersion: RULES_VERSION,
      });
    }
  }

  const targetFormIds = [...new Set(variants.map((variant) => variant.pokemonFormId))];
  const targetEvaluationIds = variants
    .map((variant) => variant.retentionEvaluations[0]?.id)
    .filter((id): id is string => Boolean(id));

  await prisma.$transaction(async (tx) => {
    if (targetEvaluationIds.length) {
      await tx.evaluationRuleTrace.deleteMany({ where: { evaluationId: { in: targetEvaluationIds } } });
    }

    for (const variant of variants) {
      const assessment = assessments.get(variant.id)!;
      const evaluation = variant.retentionEvaluations[0];
      const evaluationId = evaluation?.id ?? `recalibrate-eval-${safeId(variant.id)}`;
      const existingGymRating = evaluation?.gymRating ?? "NOT_APPLICABLE";
      const gymRating =
        existingGymRating !== "NOT_APPLICABLE"
          ? existingGymRating
          : assessment.hasGymValue
            ? "SPECIAL_CASE"
            : "NOT_APPLICABLE";
      const data = {
        finalDecision: assessment.decision,
        pveSummaryZhTw: assessment.pveSummaryZhTw,
        gymSummaryZhTw: assessment.hasGymValue
          ? "道館防守列為特殊用途；只保留少量適合守館或進化的個體。"
          : "未列為主要道館保留用途；次要欄位缺資料不覆蓋其他結論。",
        gymRating,
        evolutionSummaryZhTw: assessment.evolutionSummaryZhTw,
        recommendedIvStrategyZhTw: ivStrategy(variant, assessment.decision),
        reasonZhTw: assessment.reasonZhTw,
        confidence: assessment.confidence,
        rulesVersion: RULES_VERSION,
        generatedAt: checkedAt,
        reviewed: assessment.reviewed,
        reviewedAt: assessment.reviewed ? checkedAt : null,
        reviewStatus: assessment.reviewStatus,
        missingDataSummaryZhTw: assessment.missingDataSummaryZhTw,
        assessmentDisposition: assessment.disposition,
      } as const;
      if (evaluation) {
        await tx.retentionEvaluation.update({ where: { id: evaluation.id }, data });
      } else {
        await tx.retentionEvaluation.create({
          data: {
            id: evaluationId,
            battleVariantId: variant.id,
            finalDecision: assessment.decision,
            provenance: "MANUAL_CURATED",
            pvpSummaryZhTw: "尚未產生可重現的主要 PvP 用途摘要。",
            pveSummaryZhTw: assessment.pveSummaryZhTw,
            rocketSummaryZhTw: "火箭隊沒有統一排名；沒有這項資料不單獨觸發暫時保留。",
            gymSummaryZhTw: "未列為主要道館保留用途。",
            gymRating,
            megaSummaryZhTw: "Mega 版本與普通版本分開評估。",
            maxBattleSummaryZhTw: "Max 版本與普通／暗影版本分開評估。",
            evolutionSummaryZhTw: assessment.evolutionSummaryZhTw,
            requiredMovesSummaryZhTw: "依實際用途再核對招式；沒有主要用途時不因招式欄位缺失囤積個體。",
            recommendedIvStrategyZhTw: ivStrategy(variant, assessment.decision),
            reasonZhTw: assessment.reasonZhTw,
            confidence: assessment.confidence,
            rulesVersion: RULES_VERSION,
            generatedAt: checkedAt,
            reviewed: assessment.reviewed,
            reviewedAt: assessment.reviewed ? checkedAt : null,
            reviewStatus: assessment.reviewStatus,
            missingDataSummaryZhTw: assessment.missingDataSummaryZhTw,
            assessmentDisposition: assessment.disposition,
            reviewNotesZhTw: "由共用 PvE 用途與逐版本資料處置規則重算。",
          },
        });
      }

      for (const categoryName of categories) {
        const categoryRow = category(variant, categoryName);
        if (!categoryRow) continue;
        await tx.categoryEvaluation.update({
          where: { id: categoryRow.id },
          data: {
            pveUseLevel: categoryName === "PVE" ? assessment.pveUseLevel : null,
            assessmentDisposition: categoryDisposition(variant, assessment),
            ...(categoryName === "PVE"
              ? { summaryZhTw: `${pveUseLevelLabelZhTw[assessment.pveUseLevel]}：${assessment.pveSummaryZhTw}` }
              : {}),
          },
        });
      }

      await tx.evaluationRuleTrace.create({
        data: {
          id: `recalibrate-trace-${safeId(variant.id)}`,
          evaluationId,
          ruleKey: assessment.ruleKey,
          ruleVersion: RULES_VERSION,
          priority:
            assessment.ruleKey === "MATERIAL_UNCERTAINTY"
              ? 1000
              : assessment.ruleKey === "UNRELEASED_VARIANT"
                ? 950
                : assessment.ruleKey === "MAJOR_BATTLE_VALUE"
                  ? 900
                  : assessment.ruleKey === "VALUABLE_EVOLUTION"
                    ? 850
                    : assessment.ruleKey === "CONDITIONAL_USE"
                      ? 700
                      : 100,
          matched: true,
          resultDecision: assessment.decision,
          explanationZhTw: assessment.reasonZhTw,
        },
      });
    }

    if (targetFormIds.length) {
      await tx.dataIssue.updateMany({
        where: { pokemonFormId: { in: targetFormIds }, status: "OPEN" },
        data: {
          affectsFinalDecision: false,
          suggestedActionZhTw: "已拆分為逐版本用途；次要欄位缺資料不再外推到整個家族。",
          suggestedResearchActionZhTw: "若補到真正會改變用途結論的來源，再針對該版本重算。",
        },
      });
    }
    for (const variant of variants) {
      const assessment = assessments.get(variant.id)!;
      const keepRuleIssue = shouldKeepRuleNotCovered(variant, assessment);
      const criticalIssue = assessment.disposition === "TRUE_DATA_PENDING";
      for (const issue of variant.dataIssues) {
        const shouldAffect =
          criticalIssue &&
          (issueIsCritical(issue) || issue.issueType === "RULE_NOT_COVERED") &&
          (issue.issueType !== "RULE_NOT_COVERED" || keepRuleIssue);
        await tx.dataIssue.update({
          where: { id: issue.id },
          data: {
            affectsFinalDecision: shouldAffect,
            provisionalDecision: assessment.decision,
            messageZhTw: shouldAffect
              ? "真正待補資料：此版本仍有可能改變保留結論的關鍵缺口。"
              : "已拆分逐版本用途；此欄位缺資料不覆蓋目前保留或傳送結論。",
          },
        });
      }
      if (criticalIssue && !variant.dataIssues.some((issue) => issueIsCritical(issue))) {
        await tx.dataIssue.upsert({
          where: { id: `recalibrate-issue-${safeId(variant.id)}` },
          create: {
            id: `recalibrate-issue-${safeId(variant.id)}`,
            pokemonFormId: variant.pokemonFormId,
            battleVariantId: variant.id,
            issueType: "MATERIAL_DATA_GAP",
            status: "OPEN",
            batchKey: "001-151-recalibration",
            messageZhTw: "真正待補資料：此版本仍有可能改變保留結論的關鍵缺口。",
            affectsFinalDecision: true,
            provisionalDecision: assessment.decision,
            suggestedActionZhTw: "補齊會改變此版本用途判斷的主要來源後，再重新計算。",
            suggestedResearchActionZhTw: "只針對此版本補來源，不把缺口外推到整個進化家族。",
            lastResearchedAt: checkedAt,
            detectedAt: checkedAt,
          },
          update: {
            status: "OPEN",
            affectsFinalDecision: true,
            provisionalDecision: assessment.decision,
            messageZhTw: "真正待補資料：此版本仍有可能改變保留結論的關鍵缺口。",
            resolvedAt: null,
          },
        });
      }
    }

    await tx.changeLog.deleteMany({ where: { id: { startsWith: "recalibrate-20260805-" } } });
    if (changeLogs.length) await tx.changeLog.createMany({ data: changeLogs });
  });

  const counts = new Map<Decision, number>();
  const dispositions = new Map<AssessmentDisposition, number>();
  const pveLevels = new Map<PveUseLevel, number>();
  for (const assessment of assessments.values()) {
    counts.set(assessment.decision, (counts.get(assessment.decision) ?? 0) + 1);
    dispositions.set(assessment.disposition, (dispositions.get(assessment.disposition) ?? 0) + 1);
    pveLevels.set(assessment.pveUseLevel, (pveLevels.get(assessment.pveUseLevel) ?? 0) + 1);
  }
  const highRiskDex = new Set([63, 66, 81, 92, 111, 113, 114, 123, 125, 126, 131, 143, 144, 145, 146, 147, 150]);
  const report = {
    scope: `${dexMin}-${dexMax}`,
    generatedAt: checkedAt.toISOString(),
    rulesVersion: RULES_VERSION,
    counts: {
      variants: variants.length,
      decisions: Object.fromEntries(counts),
      dispositions: Object.fromEntries(dispositions),
      pveUseLevels: Object.fromEntries(pveLevels),
      changedFields: changeLogs.length,
    },
    trueDataPending: variants
      .filter((variant) => assessments.get(variant.id)?.disposition === "TRUE_DATA_PENDING")
      .map((variant) => ({
        id: variant.id,
        formId: variant.pokemonFormId,
        variantKey: variant.variantKey,
      })),
    highRiskReview: variants
      .filter((variant) => highRiskDex.has(variant.pokemonForm.species.dexNumber))
      .map((variant) => {
        const assessment = assessments.get(variant.id)!;
        return {
          id: variant.id,
          dexNumber: variant.pokemonForm.species.dexNumber,
          nameZhTw: variant.pokemonForm.species.nameZhTw,
          variantKey: variant.variantKey,
          decision: assessment.decision,
          pveUseLevel: assessment.pveUseLevel,
          disposition: assessment.disposition,
          laterEvolutionTarget: assessment.laterEvolutionTarget,
        };
      }),
  };
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/001-151-recalibration.json",
    `${JSON.stringify(report, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  const reportLines = [
    "# Pokémon GO Retention Guide #001～#151 共用規則重算報告",
    "",
    `- 規則版本：${RULES_VERSION}`,
    `- 戰鬥版本：${variants.length}`,
    `- KEEP／CONDITIONAL／HOLD／TRANSFER：${counts.get("KEEP") ?? 0}／${counts.get("CONDITIONAL_KEEP") ?? 0}／${counts.get("HOLD_FOR_NOW") ?? 0}／${counts.get("TRANSFER_CANDIDATE") ?? 0}`,
    `- 真正待補資料：${dispositions.get("TRUE_DATA_PENDING") ?? 0}；只有這些版本顯示「無法判斷，暫時不要傳」`,
    `- PvE 四級：核心投資 ${pveLevels.get("CORE_INVESTMENT") ?? 0}、可用／預算型 ${pveLevels.get("USABLE_OR_BUDGET") ?? 0}、特殊用途 ${pveLevels.get("SPECIAL_USE") ?? 0}、無顯著用途 ${pveLevels.get("NO_SIGNIFICANT_USE") ?? 0}`,
    "",
    "## 高風險家族複查",
    "",
    ...report.highRiskReview.map(
      (item) =>
        `- #${String(item.dexNumber).padStart(3, "0")} ${item.nameZhTw}／${item.variantKey}：${item.decision}；${pveUseLevelLabelZhTw[item.pveUseLevel]}；${item.disposition}${item.laterEvolutionTarget ? `；後續目標 ${item.laterEvolutionTarget}` : ""}`,
    ),
    "",
    "## 批次規則",
    "",
    "PvE 判斷合併暗影、Mega、後續世代進化、道館防守、Dynamax 與 Gigantamax；資料缺口按 BattleVariant 拆分，不把單一型態或次要欄位外推到整個家族。",
  ];
  await writeFile("review/001-151-recalibration.md", `${reportLines.join("\r\n")}\r\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        scope: `${dexMin}-${dexMax}`,
        variants: variants.length,
        decisions: Object.fromEntries(counts),
        dispositions: Object.fromEntries(dispositions),
        pveUseLevels: Object.fromEntries(pveLevels),
        changedFields: changeLogs.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
