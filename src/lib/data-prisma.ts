import { prisma } from "./prisma";

function parseArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

const sourceVariantLabels: Record<string, string> = {
  NORMAL: "普通",
  SHADOW: "暗影",
  PURIFIED: "淨化",
  MEGA: "Mega",
  MEGA_X: "Mega X",
  MEGA_Y: "Mega Y",
  DYNAMAX: "極巨",
  GIGANTAMAX: "超極巨",
};

const batchEvidenceSourceIds = new Set([
  "OFF-GMAX-MEOWTH-2026",
  "OFF-CD-VULPIX-2026",
  "OFF-RISING-SHADOWS-2023",
  "OFF-AUTUMN-SHADOWS-2020",
  "OFF-CD-POLIWAG-2023",
  "OFF-GMAX-MACHAMP-2025",
  "OFF-MEGA-ALAKAZAM-2022",
  "OFF-MEGA-VICTREEBEL-2026",
  "OFF-MEGA-SLOWBRO-2021",
  "OFF-CD-DEC-2023",
  "PVE-SHADOW-MACHAMP-20260730",
  "PVE-DMAX-ALAKAZAM-20260730",
  "OFF-DMAX-MACHOP-2026",
]);

function formatSourceTarget(variant: {
  variantKey: string;
  pokemonForm: {
    formNameZhTw: string;
    species: { dexNumber: number; nameZhTw: string };
  };
}) {
  const { species } = variant.pokemonForm;
  return `#${String(species.dexNumber).padStart(3, "0")} ${species.nameZhTw}（${variant.pokemonForm.formNameZhTw}／${sourceVariantLabels[variant.variantKey] ?? "其他版本"}）`;
}

export async function getDashboardRows() {
  const [variants, ivRecommendations] = await Promise.all([
    prisma.battleVariant.findMany({
      include: {
        pokemonForm: {
          include: {
            species: true,
            evolutionPathsFrom: { include: { toForm: { include: { species: true } } } },
          },
        },
        rawEvaluationData: { include: { source: true }, orderBy: { checkedAt: "desc" } },
        retentionEvaluations: {
          orderBy: { generatedAt: "desc" },
          take: 1,
          include: {
            ruleTraces: { orderBy: { priority: "desc" } },
            evaluationSources: { include: { source: true } },
          },
        },
        variantMoves: { include: { move: true } },
        categoryEvaluations: {
          include: { sourceReferences: { include: { source: true } } },
          orderBy: { category: "asc" },
        },
        dataIssues: { where: { status: "OPEN" }, orderBy: { detectedAt: "desc" } },
      },
      orderBy: [{ pokemonForm: { species: { dexNumber: "asc" } } }, { variantKey: "asc" }],
    }),
    prisma.ivRecommendation.findMany({ orderBy: [{ scopeType: "asc" }, { primaryUseKey: "asc" }] }),
  ]);

  return variants.map((variant) => {
    const evaluation = variant.retentionEvaluations[0] ?? null;
    return {
      id: variant.id,
      formId: variant.pokemonForm.id,
      speciesId: variant.pokemonForm.species.id,
      familyKey: variant.pokemonForm.species.familyKey,
      dexNumber: variant.pokemonForm.species.dexNumber,
      nameEn: variant.pokemonForm.species.nameEn,
      nameZhTw: variant.pokemonForm.species.nameZhTw,
      formKey: variant.pokemonForm.formKey,
      formNameEn: variant.pokemonForm.formNameEn,
      formNameZhTw: variant.pokemonForm.formNameZhTw,
      regionKey: variant.pokemonForm.regionKey,
      evolvesFromFormId: variant.pokemonForm.evolvesFromFormId,
      evolutionFamilyNotesZhTw: variant.pokemonForm.evolutionFamilyNotesZhTw,
      evolutionPaths: variant.pokemonForm.evolutionPathsFrom.map((path) => ({
        id: path.id,
        fromFormId: path.fromFormId,
        toFormId: path.toFormId,
        requiresEvent: path.requiresEvent,
        verifiedAt: path.verifiedAt?.toISOString() ?? null,
      })),
      types: parseArray(variant.pokemonForm.types),
      aliases: parseArray(variant.pokemonForm.searchAliases),
      evolutionNames: variant.pokemonForm.evolutionPathsFrom.flatMap((path) => [
        path.toForm.species.nameEn,
        path.toForm.species.nameZhTw,
      ]),
      variantKey: variant.variantKey,
      isReleased: variant.isReleased,
      releaseStatus: variant.releaseStatus,
      releaseVerifiedAt: variant.releaseVerifiedAt?.toISOString() ?? null,
      notesZhTw: variant.notesZhTw,
      decision: evaluation?.finalDecision ?? "HOLD_FOR_NOW",
      provenance: evaluation?.provenance ?? "DATA_UNAVAILABLE",
      confidence: evaluation?.confidence ?? "LOW",
      dataStatus:
        variant.categoryEvaluations.find((item) => item.status === "SOURCE_CONFLICT")?.status ??
        variant.categoryEvaluations.find((item) => item.status === "POSSIBLE_SPECIES_MISMATCH")
          ?.status ??
        variant.categoryEvaluations.find((item) => item.status === "UNKNOWN_RELEASE_STATUS")
          ?.status ??
        variant.categoryEvaluations.find((item) => item.status === "STALE")?.status ??
        variant.categoryEvaluations.find((item) => item.status === "SOURCE_MISSING")?.status ??
        variant.categoryEvaluations.find((item) => item.status === "PARTIALLY_VERIFIED")?.status ??
        variant.categoryEvaluations.find((item) => item.status === "DATA_UNAVAILABLE")?.status ??
        "VERIFIED",
      reviewStatus: evaluation?.reviewStatus ?? "DATA_PENDING",
      reviewIssues: variant.dataIssues.map((issue) => ({
        id: issue.id,
        issueType: issue.issueType,
        messageZhTw: issue.messageZhTw,
        affectsFinalDecision: issue.affectsFinalDecision,
        provisionalDecision: issue.provisionalDecision,
        suggestedResearchActionZhTw: issue.suggestedResearchActionZhTw,
        lastResearchedAt: issue.lastResearchedAt?.toISOString() ?? null,
      })),
      missingDataSummaryZhTw: evaluation?.missingDataSummaryZhTw ?? "尚未產生資料缺口摘要。",
      reviewed: evaluation?.reviewed ?? false,
      updatedAt: evaluation?.generatedAt.toISOString() ?? null,
      pvpSummaryZhTw: evaluation?.pvpSummaryZhTw ?? "尚未評估",
      pveSummaryZhTw: evaluation?.pveSummaryZhTw ?? "尚未評估",
      rocketSummaryZhTw: evaluation?.rocketSummaryZhTw ?? "尚未評估",
      gymSummaryZhTw: evaluation?.gymSummaryZhTw ?? "尚未評估",
      gymRating: evaluation?.gymRating ?? "NOT_APPLICABLE",
      megaSummaryZhTw: evaluation?.megaSummaryZhTw ?? "尚未評估",
      maxBattleSummaryZhTw: evaluation?.maxBattleSummaryZhTw ?? "尚未評估",
      evolutionSummaryZhTw: evaluation?.evolutionSummaryZhTw ?? "尚未評估",
      requiredMovesSummaryZhTw: evaluation?.requiredMovesSummaryZhTw ?? "尚未評估",
      recommendedIvStrategyZhTw: evaluation?.recommendedIvStrategyZhTw ?? "尚未評估",
      ivRecommendations: ivRecommendations
        .filter((recommendation) => {
          if (recommendation.scopeType === "GLOBAL") return recommendation.scopeKey === "GLOBAL";
          if (recommendation.scopeType === "FAMILY") {
            return recommendation.scopeKey === variant.pokemonForm.species.familyKey;
          }
          if (recommendation.scopeType === "MEMBER") {
            return recommendation.scopeKey === variant.pokemonForm.species.id;
          }
          if (recommendation.scopeType === "POKEMON_FORM") {
            return recommendation.scopeKey === variant.pokemonForm.id;
          }
          return recommendation.scopeKey === variant.id;
        })
        .map((recommendation) => ({
          ...recommendation,
          createdAt: recommendation.createdAt.toISOString(),
          updatedAt: recommendation.updatedAt.toISOString(),
        })),
      reasonZhTw: evaluation?.reasonZhTw ?? "規則引擎尚未產生結論。",
      evaluationId: evaluation?.id ?? null,
      rulesVersion: evaluation?.rulesVersion ?? "—",
      reviewNotesZhTw: evaluation?.reviewNotesZhTw ?? "資料維護狀態尚未確認。",
      inheritance: {
        inheritsFromVariantId: variant.inheritsFromVariantId,
        inheritanceMode: variant.inheritanceMode,
        purificationCostModifier: variant.purificationCostModifier,
        hasReturnAccess: variant.hasReturnAccess,
        purificationRiskZhTw: variant.purificationRiskZhTw,
        purifiedOverrideRequired: variant.purifiedOverrideRequired,
      },
      categoryStatuses: variant.categoryEvaluations.map((category) => ({
        category: category.category,
        status: category.status,
        provenance: category.provenance,
        summaryZhTw: category.summaryZhTw,
        materialToDecision: category.materialToDecision,
        rocketRating: category.rocketRating,
        rocketRoles: parseArray(category.rocketRoles),
        maxTypeRank: category.maxTypeRank,
        maxTypeTier: category.maxTypeTier,
        maxTypeKey: category.maxTypeKey,
        maxOverallRating: category.maxOverallRating,
        maxInvestmentRating: category.maxInvestmentRating,
        maxUseCaseBreadth: category.maxUseCaseBreadth,
        checkedAt: category.checkedAt.toISOString(),
        sources: category.sourceReferences.map(({ source, usageZhTw }) => ({
          id: source.id,
          title: source.sourceTitleOriginal,
          url: source.sourceUrl,
          usageZhTw,
        })),
      })),
      raw: variant.rawEvaluationData.map((raw) => ({
        id: raw.id,
        category: raw.category,
        status: raw.status,
        league: raw.league,
        cup: raw.cup,
        pvpCategory: raw.pvpCategory,
        speciesKey: raw.speciesKey,
        formKey: raw.formKey,
        variantKey: raw.variantKey,
        rank: raw.rank,
        rating: raw.rating,
        score: raw.score,
        tier: raw.tier,
        recommendedMoves: parseArray(raw.recommendedMoves),
        rawNotes: raw.rawNotes,
        seasonOrVersion: raw.seasonOrVersion,
        extractionMethod: raw.extractionMethod,
        reproducible: raw.reproducible,
        migrationNote: raw.migrationNote,
        checkedAt: raw.checkedAt.toISOString(),
        source: {
          id: raw.source.id,
          name: raw.source.sourceName,
          title: raw.source.sourceTitleOriginal,
          url: raw.source.sourceUrl,
        },
      })),
      sources:
        evaluation?.evaluationSources.map(({ source, usageZhTw }) => ({
          id: source.id,
          name: source.sourceName,
          title: source.sourceTitleOriginal,
          url: source.sourceUrl,
          type: source.sourceType,
          accessedAt: source.accessedAt.toISOString(),
          usageZhTw,
        })) ?? [],
      traces:
        evaluation?.ruleTraces.map((trace) => ({
          ruleKey: trace.ruleKey,
          priority: trace.priority,
          matched: trace.matched,
          resultDecision: trace.resultDecision,
          explanationZhTw: trace.explanationZhTw,
        })) ?? [],
      moves: variant.variantMoves.map(({ availabilityType, sourceNotesZhTw, move }) => ({
        moveKey: move.moveKey,
        nameEn: move.nameEn,
        nameZhTw: move.nameZhTw,
        availabilityType,
        sourceNotesZhTw,
      })),
    };
  });
}

export type DashboardRow = Awaited<ReturnType<typeof getDashboardRows>>[number];

export async function getVariantDetailMeta(
  formId: string,
  variantId: string,
  evaluationId: string | null,
) {
  const entityIds = [formId, variantId, evaluationId].filter((value): value is string =>
    Boolean(value),
  );
  const [form, conflicts, changeLogs] = await Promise.all([
    prisma.pokemonForm.findUnique({
      where: { id: formId },
      include: {
        evolutionPathsFrom: {
          include: {
            fromForm: { include: { species: true } },
            toForm: { include: { species: true } },
          },
        },
        evolutionPathsTo: {
          include: {
            fromForm: { include: { species: true } },
            toForm: { include: { species: true } },
          },
        },
      },
    }),
    prisma.dataIssue.findMany({
      where: {
        issueType: "SOURCE_CONFLICT",
        status: "OPEN",
        OR: [{ pokemonFormId: formId }, { battleVariantId: variantId }],
      },
      orderBy: { detectedAt: "desc" },
    }),
    prisma.changeLog.findMany({
      where: { entityId: { in: entityIds } },
      include: { source: true },
      orderBy: { changedAt: "desc" },
    }),
  ]);

  const paths = [...(form?.evolutionPathsTo ?? []), ...(form?.evolutionPathsFrom ?? [])].map(
    (path) => ({
      id: path.id,
      fromFormId: path.fromFormId,
      fromNameZhTw: path.fromForm.species.nameZhTw,
      fromFormNameZhTw: path.fromForm.formNameZhTw,
      toFormId: path.toFormId,
      toNameZhTw: path.toForm.species.nameZhTw,
      toFormNameZhTw: path.toForm.formNameZhTw,
      evolutionMethodZhTw: path.evolutionMethodZhTw,
      availabilityNotesZhTw: path.availabilityNotesZhTw,
      requiresEvent: path.requiresEvent,
      verifiedAt: path.verifiedAt?.toISOString() ?? null,
    }),
  );

  return {
    paths,
    conflicts: conflicts.map((issue) => ({
      id: issue.id,
      messageZhTw: issue.messageZhTw,
      detectedAt: issue.detectedAt.toISOString(),
    })),
    changeLogs: changeLogs.map((log) => ({
      id: log.id,
      fieldName: log.fieldName,
      previousValue: log.previousValue,
      newValue: log.newValue,
      changeReasonZhTw: log.changeReasonZhTw,
      changedAt: log.changedAt.toISOString(),
      rulesVersion: log.rulesVersion,
      source: log.source
        ? { title: log.source.sourceTitleOriginal, url: log.source.sourceUrl }
        : null,
    })),
  };
}

export async function getReviewIssues() {
  const issues = await prisma.dataIssue.findMany({
    where: { status: "OPEN" },
    include: {
      pokemonForm: { include: { species: true } },
      battleVariant: {
        include: {
          categoryEvaluations: {
            include: { sourceReferences: { include: { source: true } } },
          },
        },
      },
    },
    orderBy: [{ detectedAt: "desc" }, { issueType: "asc" }],
  });
  return issues.map((issue) => ({
    id: issue.id,
    dexNumber: issue.pokemonForm?.species.dexNumber ?? null,
    nameZhTw: issue.pokemonForm?.species.nameZhTw ?? "未指定",
    formNameZhTw: issue.pokemonForm?.formNameZhTw ?? "未指定",
    variantKey: issue.battleVariant?.variantKey ?? "未指定",
    issueType: issue.issueType,
    status: issue.status,
    batchKey: issue.batchKey,
    messageZhTw: issue.messageZhTw,
    affectsFinalDecision: issue.affectsFinalDecision,
    suggestedActionZhTw: issue.suggestedActionZhTw,
    suggestedResearchActionZhTw: issue.suggestedResearchActionZhTw || issue.suggestedActionZhTw,
    provisionalDecision: issue.provisionalDecision,
    lastResearchedAt: (issue.lastResearchedAt ?? issue.detectedAt).toISOString(),
    relatedSources:
      issue.battleVariant?.categoryEvaluations.flatMap((category) =>
        category.sourceReferences.map(({ source }) => ({
          id: source.id,
          title: source.sourceTitleOriginal,
          url: source.sourceUrl,
        })),
      ) ?? [],
    detectedAt: issue.detectedAt.toISOString(),
  }));
}

export async function getSources() {
  const sources = await prisma.sourceReference.findMany({
    include: {
      rawEvaluationData: {
        include: { battleVariant: { include: { pokemonForm: { include: { species: true } } } } },
      },
      evaluationSources: {
        include: {
          evaluation: {
            include: {
              battleVariant: {
                include: { pokemonForm: { include: { species: true } } },
              },
            },
          },
        },
      },
      categoryEvaluationSources: {
        include: {
          categoryEvaluation: {
            include: {
              battleVariant: {
                include: { pokemonForm: { include: { species: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: { accessedAt: "desc" },
  });
  return sources.map((source) => {
    const referencedPokemon = Array.from(
      new Set(
        [
          ...source.rawEvaluationData.map((raw) => raw.battleVariant),
          ...source.evaluationSources.map((link) => link.evaluation.battleVariant),
          ...source.categoryEvaluationSources.map((link) => link.categoryEvaluation.battleVariant),
        ].map(
          (variant) =>
            `#${String(variant.pokemonForm.species.dexNumber).padStart(3, "0")} ${variant.pokemonForm.species.nameZhTw}`,
        ),
      ),
    );
    const allLinkedEvidence = Array.from(
      new Map(
        [
          ...source.evaluationSources.map((link) => ({
            kind: "保留結論",
            target: formatSourceTarget(link.evaluation.battleVariant),
            usageZhTw: link.usageZhTw,
          })),
          ...source.categoryEvaluationSources.map((link) => ({
            kind: "評估欄位",
            target: formatSourceTarget(link.categoryEvaluation.battleVariant),
            usageZhTw: link.usageZhTw,
          })),
        ].map((evidence) => [
          `${evidence.kind}|${evidence.target}|${evidence.usageZhTw}`,
          evidence,
        ]),
      ).values(),
    );
    const exposedEvidence = batchEvidenceSourceIds.has(source.id) ? allLinkedEvidence : [];
    return {
      id: source.id,
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      sourceType: source.sourceType,
      sourceTitleOriginal: source.sourceTitleOriginal,
      sourceLanguage: source.sourceLanguage,
      sourceSummaryZhTw: source.sourceSummaryZhTw,
      accessedAt: source.accessedAt.toISOString(),
      publishedAt: source.publishedAt?.toISOString() ?? null,
      dataVersion: source.dataVersion,
      notes: source.notes,
      evaluationCount: source.evaluationSources.length,
      referencedPokemon,
      linkedEvidenceCount: exposedEvidence.length,
      linkedEvidence: exposedEvidence.slice(0, 12),
    };
  });
}

export async function getChangeLogs() {
  const logs = await prisma.changeLog.findMany({
    include: { source: true },
    orderBy: { changedAt: "desc" },
  });
  return logs.map((log) => ({
    ...log,
    changedAt: log.changedAt.toISOString(),
    source: log.source
      ? { title: log.source.sourceTitleOriginal, url: log.source.sourceUrl }
      : null,
  }));
}

export type PrismaDashboardRow = Awaited<ReturnType<typeof getDashboardRows>>[number];
export type PrismaVariantDetailMeta = Awaited<ReturnType<typeof getVariantDetailMeta>>;
export type PrismaReviewIssue = Awaited<ReturnType<typeof getReviewIssues>>[number];
export type PrismaSourceRow = Awaited<ReturnType<typeof getSources>>[number];
export type PrismaChangeLogRow = Awaited<ReturnType<typeof getChangeLogs>>[number];
