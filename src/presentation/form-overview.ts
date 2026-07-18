import type { DashboardRow } from "@/lib/data";
import { resolveIvRecommendation, type IvRecommendation, type PrimaryUseKey } from "@/iv/strategy";
import { zhTw } from "@/locales/zh-TW";

export type OverviewTone = "HIGH" | "MEDIUM" | "LOW" | "SPECIAL" | "NONE" | "REVIEW";

export interface CompactOverview {
  label: string;
  detail?: string;
  tone: OverviewTone;
}

export interface VariantOverview {
  row: DashboardRow;
  primaryUses: string[];
  primaryUseKeys: PrimaryUseKey[];
  ivRecommendations: IvRecommendation[];
  ivShortLabels: string[];
  ivDirection: string;
  shortReason: string;
}

export interface FormOverview {
  formId: string;
  speciesId: string;
  familyKey: string;
  dexNumber: number;
  nameEn: string;
  nameZhTw: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: string;
  evolvesFromFormId: string | null;
  evolutionFamilyNotesZhTw: string;
  evolutionPaths: DashboardRow["evolutionPaths"];
  types: string[];
  aliases: string[];
  evolutionNames: string[];
  variants: VariantOverview[];
  releasedVariantKeys: DashboardRow["variantKey"][];
  pvp: CompactOverview;
  pve: CompactOverview;
  gym: CompactOverview;
  megaMax: CompactOverview;
  decision: DashboardRow["decision"];
  decisionReason: string;
  ivRecommendations: IvRecommendation[];
  ivShortLabels: string[];
  ivDirection: string;
  primaryUses: string[];
  hasDataIssues: boolean;
  reviewed: boolean;
  updatedAt: string | null;
}

const variantOrder: Record<string, number> = {
  NORMAL: 0,
  SHADOW: 1,
  PURIFIED: 2,
  MEGA: 3,
  MEGA_X: 4,
  MEGA_Y: 5,
  DYNAMAX: 6,
  GIGANTAMAX: 7,
};

const regionOrder: Record<string, number> = {
  KANTO: 0,
  ALOLA: 1,
  GALAR: 2,
  HISUI: 3,
  PALDEA: 4,
  OTHER: 5,
};

const reviewStatuses = new Set([
  "DATA_UNAVAILABLE",
  "SOURCE_MISSING",
  "SOURCE_CONFLICT",
  "UNKNOWN_RELEASE_STATUS",
]);

function category(row: DashboardRow, key: string) {
  return row.categoryStatuses.find((item) => item.category === key);
}

function assessmentRows(rows: DashboardRow[]) {
  const released = rows.filter((row) => row.isReleased && row.releaseStatus === "RELEASED");
  const heldUnknown = rows.filter(
    (row) => row.decision === "HOLD_FOR_NOW" && row.releaseStatus !== "UNRELEASED",
  );
  return released.length
    ? [...released, ...heldUnknown.filter((row) => !released.includes(row))]
    : rows;
}

function isWorthKeeping(row: DashboardRow) {
  return row.decision === "KEEP" || row.decision === "CONDITIONAL_KEEP";
}

function matchedRule(row: DashboardRow, ruleKey: string) {
  return row.traces.some((trace) => trace.ruleKey === ruleKey && trace.matched);
}

function hasEvolutionValue(rows: DashboardRow[]) {
  return rows.some((row) => matchedRule(row, "VALUABLE_EVOLUTION"));
}

function hasDirectBattleValue(rows: DashboardRow[]) {
  return rows.some((row) => matchedRule(row, "MAJOR_BATTLE_VALUE"));
}

function hasReviewGap(rows: DashboardRow[], key: string) {
  return rows.some((row) => {
    const status = category(row, key)?.status;
    return status ? reviewStatuses.has(status) : false;
  });
}

function tierTone(value: string | null | undefined): OverviewTone | null {
  const tier = (value ?? "").trim().toUpperCase();
  if (!tier) return null;
  if (tier === "LIMITED") return "SPECIAL";
  if (["SS", "S+", "S", "A+", "A", "TOP"].includes(tier)) return "HIGH";
  if (["B+", "B", "BUDGET_ONLY"].includes(tier)) return "MEDIUM";
  if (["C", "D", "F", "LOW", "NOT_RANKED"].includes(tier)) return "LOW";
  return null;
}

function bestRank(rows: DashboardRow[]) {
  return rows
    .flatMap((row) =>
      row.raw
        .filter(
          (item) =>
            item.category === "PVP" && item.rank !== null && item.league !== "NOT_APPLICABLE",
        )
        .map((item) => ({ row, raw: item })),
    )
    .sort(
      (a, b) => (a.raw.rank ?? Number.MAX_SAFE_INTEGER) - (b.raw.rank ?? Number.MAX_SAFE_INTEGER),
    )[0];
}

function bestPveEntry(rows: DashboardRow[]) {
  const weight: Record<OverviewTone, number> = {
    HIGH: 5,
    MEDIUM: 4,
    SPECIAL: 3,
    LOW: 2,
    REVIEW: 1,
    NONE: 0,
  };
  return rows
    .flatMap((row) =>
      row.raw
        .filter((item) => item.category === "PVE")
        .map((raw) => ({
          row,
          raw,
          tone: tierTone(raw.tier ?? raw.rating) ?? ("LOW" as OverviewTone),
        })),
    )
    .sort((a, b) => weight[b.tone] - weight[a.tone])[0];
}

function maxVariantTone(row: DashboardRow): OverviewTone {
  const status = category(row, "MAX_BATTLE");
  if (status && reviewStatuses.has(status.status)) return "REVIEW";
  const explicit = tierTone(status?.maxOverallRating);
  if (explicit) return explicit;
  const raw = row.raw.find((item) => item.category === "MAX_BATTLE");
  return tierTone(raw?.tier ?? raw?.rating) ?? "NONE";
}

function megaVariantTone(row: DashboardRow): OverviewTone {
  const status = category(row, "MEGA");
  if (status && reviewStatuses.has(status.status)) return "REVIEW";
  const raw = row.raw.find((item) => item.category === "PVE" || item.category === "MEGA");
  return (
    tierTone(raw?.tier ?? raw?.rating) ?? (matchedRule(row, "MAJOR_BATTLE_VALUE") ? "HIGH" : "NONE")
  );
}

export function compactDataStatus(status: string) {
  return zhTw.overviewDataStatus[status as keyof typeof zhTw.overviewDataStatus] ?? "待確認";
}

export function buildPvpOverview(rows: DashboardRow[]): CompactOverview {
  const assessed = assessmentRows(rows).filter(
    (row) => !["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(row.variantKey),
  );
  const ranked = bestRank(assessed);
  if (ranked) {
    const rank = ranked.raw.rank ?? Number.MAX_SAFE_INTEGER;
    const league = zhTw.league[ranked.raw.league as keyof typeof zhTw.league] ?? "主要聯盟";
    const variant =
      ranked.row.variantKey === "NORMAL" ? "" : `${zhTw.variantShort[ranked.row.variantKey]}版`;
    if (ranked.raw.league === "SPECIAL_CUP") {
      return {
        label: "特殊盃",
        detail: variant ? `${variant}限定` : "限定用途",
        tone: "SPECIAL",
      };
    }
    if (rank <= 100) {
      return { label: "高", detail: `${league}${variant ? `｜${variant}` : ""}`, tone: "HIGH" };
    }
    if (rank <= 250) {
      return { label: "中", detail: `${league}${variant ? `｜${variant}` : ""}`, tone: "MEDIUM" };
    }
    return { label: "低", detail: league, tone: "LOW" };
  }

  const special = assessed.find(
    (row) =>
      matchedRule(row, "CONDITIONAL_USE") &&
      (row.pvpSummaryZhTw.includes("特殊盃") || row.pvpSummaryZhTw.includes("限定")),
  );
  if (special) {
    return {
      label: "特殊盃",
      detail:
        special.variantKey === "NORMAL"
          ? "限定用途"
          : `${zhTw.variantShort[special.variantKey]}版限定`,
      tone: "SPECIAL",
    };
  }
  if (hasReviewGap(assessed, "PVP")) return { label: "待確認", tone: "REVIEW" };
  return { label: "無明確用途", tone: "NONE" };
}

export function buildPveOverview(rows: DashboardRow[]): CompactOverview {
  const assessed = assessmentRows(rows).filter(
    (row) => !["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey),
  );
  const best = bestPveEntry(assessed);
  if (best?.tone === "HIGH") {
    if (best.row.variantKey === "SHADOW") {
      return { label: "頂級屬性暗影打手", tone: "HIGH" };
    }
    if (best.row.variantKey.startsWith("MEGA")) return { label: "Mega 候選", tone: "HIGH" };
    return { label: "高價值屬性攻擊手", tone: "HIGH" };
  }
  if (best?.tone === "MEDIUM") return { label: "過渡打手", tone: "MEDIUM" };

  const evolutionOnly = hasEvolutionValue(assessed) && !hasDirectBattleValue(assessed);
  if (evolutionOnly) return { label: "進化後有價值", tone: "MEDIUM" };
  if (best?.tone === "LOW") return { label: "無明確用途", tone: "LOW" };
  if (hasReviewGap(assessed, "PVE")) return { label: "缺少關鍵資料", tone: "REVIEW" };
  return { label: "無明確用途", tone: "NONE" };
}

export function buildGymOverview(rows: DashboardRow[]): CompactOverview {
  const assessed = assessmentRows(rows).filter(
    (row) => !["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(row.variantKey),
  );
  const order = { HIGH: 4, SPECIAL_CASE: 3, MEDIUM: 2, LOW: 1, NOT_APPLICABLE: 0 } as const;
  const best = [...assessed].sort(
    (a, b) =>
      (order[b.gymRating as keyof typeof order] ?? 0) -
      (order[a.gymRating as keyof typeof order] ?? 0),
  )[0];
  if (best?.gymRating === "HIGH") return { label: "高", detail: "僅需少量守軍", tone: "HIGH" };
  if (best?.gymRating === "MEDIUM") return { label: "中", detail: "有需要再保留", tone: "MEDIUM" };
  if (best?.gymRating === "SPECIAL_CASE") {
    const slowDecay = best.gymSummaryZhTw.includes("低 CP") || best.gymSummaryZhTw.includes("慢");
    return {
      label: "特殊用途",
      detail: slowDecay ? "低 CP 慢衰減" : "只需保留一隻",
      tone: "SPECIAL",
    };
  }
  if (best?.gymRating === "LOW") return { label: "低", tone: "LOW" };
  if (hasReviewGap(assessed, "GYM")) return { label: "資料有限", tone: "REVIEW" };
  return { label: "—", tone: "NONE" };
}

function toneLabel(tone: OverviewTone) {
  return {
    HIGH: "高",
    MEDIUM: "中",
    LOW: "低",
    SPECIAL: "限定用途",
    REVIEW: "待確認",
    NONE: "—",
  }[tone];
}

function strongestTone(tones: OverviewTone[]) {
  const order: OverviewTone[] = ["HIGH", "MEDIUM", "SPECIAL", "REVIEW", "LOW", "NONE"];
  return order.find((tone) => tones.includes(tone)) ?? "NONE";
}

export function buildMegaMaxOverview(rows: DashboardRow[]): CompactOverview {
  const released = rows.filter((row) => row.isReleased && row.releaseStatus === "RELEASED");
  const megaRows = released.filter((row) => row.variantKey.startsWith("MEGA"));
  const maxRows = released.filter((row) => ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey));
  const megaTones = megaRows.map(megaVariantTone);
  const maxTones = maxRows.map(maxVariantTone);
  const lines: string[] = [];

  if (megaRows.length) lines.push(`Mega：${toneLabel(strongestTone(megaTones))}`);
  if (maxRows.length) {
    const label = maxRows.some((row) => row.variantKey === "GIGANTAMAX") ? "超極巨" : "極巨";
    lines.push(`${label}：${toneLabel(strongestTone(maxTones))}`);
  }
  if (!lines.length) {
    const hasUnreleasedMega = rows.some(
      (row) => row.variantKey.startsWith("MEGA") && row.releaseStatus === "UNRELEASED",
    );
    return hasUnreleasedMega
      ? { label: "Mega：尚未推出", tone: "NONE" }
      : { label: "—", tone: "NONE" };
  }
  return {
    label: lines[0],
    detail: lines[1],
    tone: strongestTone([...megaTones, ...maxTones]),
  };
}

function buildVariantPrimaryUses(row: DashboardRow) {
  const uses: string[] = [];
  const pvp = bestRank([row]);
  if (pvp && ((pvp.raw.rank ?? 9999) <= 250 || pvp.raw.league === "SPECIAL_CUP")) uses.push("PvP");
  const pveTone = bestPveEntry([row])?.tone;
  if (pveTone === "HIGH" || pveTone === "MEDIUM") uses.push("PvE");
  if (["HIGH", "MEDIUM", "SPECIAL_CASE"].includes(row.gymRating)) uses.push("道館");
  if (
    row.variantKey.startsWith("MEGA") &&
    ["HIGH", "MEDIUM", "SPECIAL"].includes(megaVariantTone(row))
  ) {
    uses.push("Mega");
  }
  if (
    ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey) &&
    ["HIGH", "MEDIUM", "SPECIAL"].includes(maxVariantTone(row))
  ) {
    uses.push("Max Battle");
  }
  if (matchedRule(row, "VALUABLE_EVOLUTION")) uses.push("後續進化");
  return [...new Set(uses)];
}

function hasSpeciesLeagueUse(row: DashboardRow, league: string) {
  return row.raw.some(
    (item) =>
      item.category === "PVP" && item.league === league && item.rank !== null && item.rank <= 250,
  );
}

function maxPrimaryUse(row: DashboardRow): PrimaryUseKey {
  const text = [
    row.maxBattleSummaryZhTw,
    ...row.raw
      .filter((item) => item.category === "MAX_BATTLE")
      .flatMap((item) => [item.rating, item.tier, item.rawNotes]),
    ...row.categoryStatuses
      .filter((item) => item.category === "MAX_BATTLE")
      .flatMap((item) => [item.summaryZhTw, item.maxOverallRating, item.maxTypeTier]),
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
  if (/TANK|DEFEN|坦克|耐久/.test(text)) return "MAX_TANK";
  if (/SUPPORT|支援|輔助/.test(text)) return "MAX_SUPPORT";
  if (/ATTACK|攻擊|輸出/.test(text)) return "MAX_ATTACK";
  return "MAX_FLEX";
}

function buildVariantIvUseKeys(row: DashboardRow): PrimaryUseKey[] {
  const uses: PrimaryUseKey[] = [];
  if (hasSpeciesLeagueUse(row, "GREAT")) uses.push("GREAT_LEAGUE");
  if (hasSpeciesLeagueUse(row, "ULTRA")) uses.push("ULTRA_LEAGUE");
  if (hasSpeciesLeagueUse(row, "MASTER")) uses.push("MASTER_LEAGUE");

  const pveTone = bestPveEntry([row])?.tone;
  if (pveTone === "HIGH" || pveTone === "MEDIUM") {
    uses.push(row.variantKey === "SHADOW" ? "SHADOW_PVE" : "PVE");
  }
  if (
    row.variantKey.startsWith("MEGA") &&
    ["HIGH", "MEDIUM", "SPECIAL"].includes(megaVariantTone(row))
  ) {
    uses.push("MEGA");
  }
  if (["HIGH", "MEDIUM", "SPECIAL_CASE"].includes(row.gymRating)) {
    uses.push("GYM_DEFENSE");
  }
  if (
    ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey) &&
    ["HIGH", "MEDIUM", "SPECIAL"].includes(maxVariantTone(row))
  ) {
    uses.push(maxPrimaryUse(row));
  }
  return [...new Set(uses)];
}

function buildVariantIvRecommendations(row: DashboardRow, uses: PrimaryUseKey[]) {
  const available = row.ivRecommendations as unknown as IvRecommendation[];
  const context = {
    familyKey: row.familyKey,
    speciesId: row.speciesId,
    pokemonFormId: row.formId,
    battleVariantId: row.id,
  };
  return uses
    .map((use) => resolveIvRecommendation(available, context, use))
    .filter((item): item is IvRecommendation => Boolean(item));
}

function buildIvDirection(row: DashboardRow, recommendations: IvRecommendation[]) {
  if (recommendations.length) {
    return recommendations.map((item) => item.ivRecommendationZhTw).join("；");
  }
  if (hasEvolutionValue([row])) {
    return "依目標進化結果套用 GL／UL 個體Rank、PvE／Mega攻擊IV或Max角色門檻。";
  }
  if (row.decision === "HOLD_FOR_NOW") return "先保留一隻；關鍵用途確認前不以IV篩除。";
  if (row.decision === "TRANSFER_CANDIDATE") {
    return "即使100%，也不能在物種缺乏戰鬥用途時單靠IV成為保留理由。";
  }
  return "目前沒有會改變保留結論的通用IV門檻。";
}

function directWorthRows(rows: DashboardRow[]) {
  return rows.filter((row) => isWorthKeeping(row) && matchedRule(row, "MAJOR_BATTLE_VALUE"));
}

function buildFormDecision(rows: DashboardRow[]) {
  const assessed = assessmentRows(rows);
  const direct = directWorthRows(assessed);
  if (direct.some((row) => row.variantKey === "NORMAL")) return "KEEP" as const;
  if (direct.length) return "CONDITIONAL_KEEP" as const;
  if (hasEvolutionValue(assessed)) return "CONDITIONAL_KEEP" as const;
  if (assessed.some((row) => isWorthKeeping(row) && matchedRule(row, "CONDITIONAL_USE"))) {
    return "CONDITIONAL_KEEP" as const;
  }
  if (assessed.some((row) => row.decision === "HOLD_FOR_NOW")) return "HOLD_FOR_NOW" as const;
  return "TRANSFER_CANDIDATE" as const;
}

function buildRetentionReason(rows: DashboardRow[], decision: DashboardRow["decision"]) {
  const assessed = assessmentRows(rows);
  const direct = directWorthRows(assessed);
  const normal = assessed.find((row) => row.variantKey === "NORMAL");
  const evolutionOnly = hasEvolutionValue(assessed) && !direct.length;
  const onlyShadow = direct.length > 0 && direct.every((row) => row.variantKey === "SHADOW");
  const onlyMega = direct.length > 0 && direct.every((row) => row.variantKey.startsWith("MEGA"));
  const onlyMax =
    direct.length > 0 && direct.every((row) => ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey));
  const pvp = buildPvpOverview(assessed);
  const pve = buildPveOverview(assessed);
  const holdRows = assessed.filter((row) => row.decision === "HOLD_FOR_NOW");

  if (decision === "HOLD_FOR_NOW") return "關鍵用途仍有不確定性，傳送不可逆，目前先保留。";
  if (holdRows.length) {
    const heldVariants = [
      ...new Set(holdRows.map((row) => zhTw.variantShort[row.variantKey])),
    ].join("、");
    return evolutionOnly
      ? `保留適合進化的個體；${heldVariants}版本推出狀態未確認，先暫時保留。`
      : `依已確認用途挑選個體；${heldVariants}版本關鍵資料未確認，先暫時保留。`;
  }
  if (decision === "TRANSFER_CANDIDATE") return "一般重複個體通常可傳送。";
  if (onlyShadow) return "普通版用途有限；暗影版以攻擊13以上為保留線，15攻優先。";
  if (onlyMega) return "普通重複個體通常可傳送；留一隻15攻／96%以上個體作 Mega。";
  if (onlyMax) return "只留可極巨版本；一般舊個體不具 Max 能力。";
  if (evolutionOnly) return "本體用途有限；依目標進化結果的數字門檻保留個體。";
  if (
    normal?.decision === "TRANSFER_CANDIDATE" &&
    direct.some((row) => row.variantKey !== "NORMAL")
  ) {
    return `普通重複個體通常可傳送；優先留${direct
      .filter((row) => row.variantKey !== "NORMAL")
      .map((row) => zhTw.variantShort[row.variantKey])
      .join("、")}版。`;
  }
  const hasPvp = ["HIGH", "MEDIUM", "SPECIAL"].includes(pvp.tone);
  const hasPve = ["HIGH", "MEDIUM"].includes(pve.tone);
  if (hasPvp && hasPve) return "PvP看目標聯盟個體Rank≤100；PvE以15攻／96%以上優先。";
  if (hasPvp) return "只保留目標聯盟個體PvP IV Rank≤100或PR≥97.5%的優先候選。";
  if (hasPve) return "具有PvE用途時，以15攻／96%以上及正確招式優先。";
  if (assessed.some((row) => ["HIGH", "MEDIUM", "SPECIAL_CASE"].includes(row.gymRating))) {
    return "僅需保留一隻作道館守軍。";
  }
  return "依各戰鬥版本的數字IV門檻留少量個體。";
}

function buildVariantShortReason(row: DashboardRow, uses: string[]) {
  if (row.decision === "HOLD_FOR_NOW") return "關鍵資料補齊前先保留一隻，不要大量投入資源。";
  if (row.decision === "TRANSFER_CANDIDATE") return "目前沒有足以支持囤積的主要戰鬥用途。";
  if (uses.includes("後續進化") && uses.length === 1) return "主要價值來自後續進化，不是本體戰力。";
  if (row.variantKey === "SHADOW") return "暗影版需獨立判斷，淨化前先確認用途。";
  if (row.variantKey.startsWith("MEGA"))
    return "作為 Mega 候選，通常只需保留一隻15攻／96%以上個體。";
  if (["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey)) {
    return "只有具 Max 能力的個體適用，一般舊個體不能替代。";
  }
  return uses.length ? `主要用途：${uses.join("、")}。` : "用途有限，只需依個人需求少量保留。";
}

export function buildFormOverview(rows: DashboardRow[]): FormOverview {
  if (!rows.length) throw new Error("buildFormOverview 至少需要一個 BattleVariant。");
  const sorted = [...rows].sort(
    (a, b) => (variantOrder[a.variantKey] ?? 99) - (variantOrder[b.variantKey] ?? 99),
  );
  const base = sorted[0];
  const assessed = assessmentRows(sorted);
  const decision = buildFormDecision(sorted);
  const variants = sorted.map((row) => {
    const primaryUses = buildVariantPrimaryUses(row);
    const primaryUseKeys = buildVariantIvUseKeys(row);
    const ivRecommendations = buildVariantIvRecommendations(row, primaryUseKeys);
    return {
      row,
      primaryUses,
      primaryUseKeys,
      ivRecommendations,
      ivShortLabels: ivRecommendations.map((item) => item.shortIvLabelZhTw),
      ivDirection: buildIvDirection(row, ivRecommendations),
      shortReason: buildVariantShortReason(row, primaryUses),
    };
  });
  const ivRecommendations = [
    ...new Map(
      variants
        .flatMap((variant) => variant.ivRecommendations)
        .map((item) => [`${item.primaryUseKey}:${item.ivStrategyKey}`, item]),
    ).values(),
  ];
  return {
    formId: base.formId,
    speciesId: base.speciesId,
    familyKey: base.familyKey,
    dexNumber: base.dexNumber,
    nameEn: base.nameEn,
    nameZhTw: base.nameZhTw,
    formNameEn: base.formNameEn,
    formNameZhTw: base.formNameZhTw,
    regionKey: base.regionKey,
    evolvesFromFormId: base.evolvesFromFormId,
    evolutionFamilyNotesZhTw: base.evolutionFamilyNotesZhTw,
    evolutionPaths: [
      ...new Map(
        sorted.flatMap((row) => row.evolutionPaths).map((path) => [path.id, path]),
      ).values(),
    ],
    types: base.types,
    aliases: [...new Set(sorted.flatMap((row) => row.aliases))],
    evolutionNames: [...new Set(sorted.flatMap((row) => row.evolutionNames))],
    variants,
    releasedVariantKeys: sorted
      .filter((row) => row.isReleased && row.releaseStatus === "RELEASED")
      .map((row) => row.variantKey),
    pvp: buildPvpOverview(sorted),
    pve: buildPveOverview(sorted),
    gym: buildGymOverview(sorted),
    megaMax: buildMegaMaxOverview(sorted),
    decision,
    decisionReason: buildRetentionReason(sorted, decision),
    ivRecommendations,
    ivShortLabels: ivRecommendations.map((item) => item.shortIvLabelZhTw),
    ivDirection:
      ivRecommendations.length > 0
        ? ivRecommendations.map((item) => item.ivRecommendationZhTw).join("；")
        : (variants.find((variant) => isWorthKeeping(variant.row))?.ivDirection ??
          "即使100%，也不能在物種缺乏戰鬥用途時單靠IV成為保留理由。"),
    primaryUses: [...new Set(variants.flatMap((variant) => variant.primaryUses))],
    hasDataIssues: sorted.some((row) => (row.reviewIssues?.length ?? 0) > 0),
    reviewed: assessed.every((row) => row.reviewed),
    updatedAt:
      assessed
        .map((row) => row.updatedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? null,
  };
}

export function buildFormOverviews(rows: DashboardRow[]) {
  const grouped = new Map<string, DashboardRow[]>();
  for (const row of rows) {
    const group = grouped.get(row.formId) ?? [];
    group.push(row);
    grouped.set(row.formId, group);
  }
  return [...grouped.values()]
    .map(buildFormOverview)
    .sort(
      (a, b) =>
        a.dexNumber - b.dexNumber ||
        (regionOrder[a.regionKey] ?? 99) - (regionOrder[b.regionKey] ?? 99) ||
        a.formId.localeCompare(b.formId),
    );
}
