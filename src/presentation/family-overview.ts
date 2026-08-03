import type { IvRecommendation } from "@/iv/strategy";
import type { CompactOverview, FormOverview, OverviewTone } from "./form-overview";

export type MemberRoleKey =
  | "EVOLUTION_MATERIAL"
  | "INDEPENDENT_PVP"
  | "INDEPENDENT_PVE"
  | "GYM_DEFENDER"
  | "MEGA_CANDIDATE"
  | "MAX_CANDIDATE"
  | "COLLECTION_ONLY"
  | "NO_DISTINCT_USE";

export type FamilyValue = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type FamilyRetentionStrategy =
  "KEEP_TARGETS" | "SELECTIVE_KEEP" | "MOSTLY_TRANSFER" | "HOLD_FOR_NOW";

export interface FamilyRetentionTarget {
  formId: string;
  memberNameZhTw: string;
  displayNameZhTw: string;
  useKeys: string[];
  variantKeys: FormOverview["variants"][number]["row"]["variantKey"][];
  variantSpecificOnly: boolean;
}

export interface IndependentMemberUse {
  formId: string;
  memberNameZhTw: string;
  useKeys: string[];
}

export interface VariantSpecificUse {
  formId: string;
  memberNameZhTw: string;
  variantKey: FormOverview["variants"][number]["row"]["variantKey"];
  useKeys: string[];
}

export interface FamilyMemberSummary {
  form: FormOverview;
  roles: MemberRoleKey[];
  roleLabelsZhTw: string[];
  mainUseZhTw: string;
  memberSummaryZhTw: string;
  ivShortLabels: string[];
  ivRecommendations: IvRecommendation[];
  isRoot: boolean;
  isIntermediate: boolean;
  isTerminal: boolean;
  hasIndependentUse: boolean;
}

export interface FamilyOverview {
  familyId: string;
  familyKey: string;
  familyNameZhTw: string;
  dexRangeZhTw: string;
  regionHintZhTw: string | null;
  branchCount: number;
  isBatchTruncated: boolean;
  members: FamilyMemberSummary[];
  releasedVariantKeys: FormOverview["releasedVariantKeys"];
  pvp: CompactOverview;
  pve: CompactOverview;
  gym: CompactOverview;
  megaMax: CompactOverview;
  familyValue: FamilyValue;
  retentionStrategy: FamilyRetentionStrategy;
  primaryRetentionTargets: FamilyRetentionTarget[];
  primaryTargetSummaryZhTw: string;
  preEvolutionActionZhTw: string;
  handlingSummaryZhTw: string;
  actionSummaryZhTw: string;
  ivShortLabels: string[];
  ivRecommendations: IvRecommendation[];
  ivSummaryZhTw: string;
  primaryUses: string[];
  notices: string[];
  hasDataIssues: boolean;
  hasCriticalDataIssues: boolean;
  updatedAt: string | null;
  minDexNumber: number;
  maxDexNumber: number;
}

const toneWeight: Record<OverviewTone, number> = {
  HIGH: 6,
  MEDIUM: 5,
  SPECIAL: 4,
  REVIEW: 3,
  LOW: 2,
  NONE: 1,
};

const regionLabel: Record<string, string> = {
  KANTO: "關都",
  ALOLA: "阿羅拉",
  GALAR: "伽勒爾",
  HISUI: "洗翠",
  PALDEA: "帕底亞",
  OTHER: "其他",
};

const roleLabel: Record<MemberRoleKey, string> = {
  EVOLUTION_MATERIAL: "進化素材",
  INDEPENDENT_PVP: "獨立PvP用途",
  INDEPENDENT_PVE: "獨立PvE用途",
  GYM_DEFENDER: "道館守軍",
  MEGA_CANDIDATE: "Mega 候選",
  MAX_CANDIDATE: "Max候選",
  COLLECTION_ONLY: "僅收藏",
  NO_DISTINCT_USE: "無獨立用途",
};

interface ComponentGraph {
  forms: FormOverview[];
  outgoing: Map<string, Set<string>>;
  incoming: Map<string, Set<string>>;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function bestByTone(members: FamilyMemberSummary[], key: "pvp" | "pve" | "gym" | "megaMax") {
  return [...members].sort(
    (a, b) => toneWeight[b.form[key].tone] - toneWeight[a.form[key].tone],
  )[0];
}

const pvpUseKeys = new Set(["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"]);
const pveUseKeys = new Set(["PVE", "SHADOW_PVE"]);
const megaMaxUseKeys = new Set(["MEGA", "MAX_ATTACK", "MAX_TANK", "MAX_SUPPORT", "MAX_FLEX"]);

function bestByConfirmedUse(
  members: FamilyMemberSummary[],
  overviewKey: "pvp" | "pve" | "gym" | "megaMax",
  useKeys: Set<string>,
) {
  const confirmed = members.filter((member) =>
    member.form.variants.some(
      (variant) =>
        isUsefulVariant(variant) && variant.primaryUseKeys.some((key) => useKeys.has(key)),
    ),
  );
  return confirmed.length ? bestByTone(confirmed, overviewKey) : undefined;
}

function descendantIds(formId: string, outgoing: Map<string, Set<string>>) {
  const result = new Set<string>();
  const queue = [...(outgoing.get(formId) ?? [])];
  while (queue.length) {
    const id = queue.shift()!;
    if (result.has(id)) continue;
    result.add(id);
    queue.push(...(outgoing.get(id) ?? []));
  }
  return result;
}

function memberRoles(form: FormOverview, outgoing: Map<string, Set<string>>): MemberRoleKey[] {
  const roles: MemberRoleKey[] = [];
  const uses = new Set(
    form.variants.filter(isUsefulVariant).flatMap((variant) => variant.primaryUseKeys),
  );
  if (outgoing.get(form.formId)?.size) roles.push("EVOLUTION_MATERIAL");
  if (["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"].some((use) => uses.has(use as never))) {
    roles.push("INDEPENDENT_PVP");
  }
  if (uses.has("PVE") || uses.has("SHADOW_PVE")) roles.push("INDEPENDENT_PVE");
  if (uses.has("GYM_DEFENSE")) roles.push("GYM_DEFENDER");
  if (uses.has("MEGA")) roles.push("MEGA_CANDIDATE");
  if (["MAX_ATTACK", "MAX_TANK", "MAX_SUPPORT", "MAX_FLEX"].some((use) => uses.has(use as never))) {
    roles.push("MAX_CANDIDATE");
  }
  if (form.variants.some(isSpecialAcquisitionVariant)) roles.push("COLLECTION_ONLY");
  if (!roles.length) roles.push("NO_DISTINCT_USE");
  return roles;
}

function orderForms(graph: ComponentGraph) {
  const roots = graph.forms.filter((form) => !graph.incoming.get(form.formId)?.size);
  const depth = new Map<string, number>();
  const queue = roots.map((form) => ({ id: form.formId, depth: 0 }));
  while (queue.length) {
    const current = queue.shift()!;
    const previous = depth.get(current.id);
    if (previous !== undefined && previous <= current.depth) continue;
    depth.set(current.id, current.depth);
    for (const next of graph.outgoing.get(current.id) ?? []) {
      queue.push({ id: next, depth: current.depth + 1 });
    }
  }
  return [...graph.forms].sort(
    (a, b) =>
      (depth.get(a.formId) ?? 999) - (depth.get(b.formId) ?? 999) ||
      a.dexNumber - b.dexNumber ||
      a.formId.localeCompare(b.formId),
  );
}

export function buildFamilyMemberSummaries(graph: ComponentGraph): FamilyMemberSummary[] {
  const ordered = orderForms(graph);
  const byId = new Map(ordered.map((form) => [form.formId, form]));
  return ordered.map((form) => {
    const roles = memberRoles(form, graph.outgoing);
    const isRoot = !graph.incoming.get(form.formId)?.size;
    const isTerminal = !graph.outgoing.get(form.formId)?.size;
    const isIntermediate = !isRoot && !isTerminal;
    const hasIndependentUse = roles.some(
      (role) => role !== "EVOLUTION_MATERIAL" && role !== "NO_DISTINCT_USE",
    );
    let ivRecommendations = form.ivRecommendations;
    if (!ivRecommendations.length && graph.outgoing.get(form.formId)?.size) {
      const descendants = descendantIds(form.formId, graph.outgoing);
      ivRecommendations = [
        ...new Map(
          [...descendants]
            .flatMap((id) => byId.get(id)?.ivRecommendations ?? [])
            .map((item) => [`${item.primaryUseKey}:${item.ivStrategyKey}`, item]),
        ).values(),
      ];
    }
    const ivShortLabels = unique(ivRecommendations.map((item) => item.shortIvLabelZhTw));
    const mainUseZhTw = roles.map((role) => roleLabel[role]).join("、");
    const memberSummaryZhTw = hasIndependentUse
      ? `${form.nameZhTw}具有${roles
          .filter((role) => role !== "EVOLUTION_MATERIAL" && role !== "NO_DISTINCT_USE")
          .map((role) => roleLabel[role])
          .join("、")}；請依用途分開挑選個體。`
      : roles.includes("EVOLUTION_MATERIAL")
        ? `${form.nameZhTw}本體沒有獨立用途；前階主要作符合條件的進化候選。`
        : `${form.nameZhTw}目前沒有獨立戰鬥用途，100%也不會自動改變物種結論。`;
    return {
      form,
      roles,
      roleLabelsZhTw: roles.map((role) => roleLabel[role]),
      mainUseZhTw,
      memberSummaryZhTw,
      ivShortLabels,
      ivRecommendations,
      isRoot,
      isIntermediate,
      isTerminal,
      hasIndependentUse,
    };
  });
}

export function buildFamilyPvpOverview(members: FamilyMemberSummary[]): CompactOverview {
  const best = bestByConfirmedUse(members, "pvp", pvpUseKeys);
  if (!best || best.form.pvp.tone === "NONE") return { label: "無明確用途", tone: "NONE" };
  const independentMiddle = members.find(
    (member) => member.isIntermediate && member.roles.includes("INDEPENDENT_PVP"),
  );
  const independentSmall = members.find(
    (member) => member.isRoot && member.roles.includes("INDEPENDENT_PVP"),
  );
  return {
    label: best.form.pvp.label,
    detail: independentMiddle
      ? `中間進化${independentMiddle.form.nameZhTw}有獨立PvP用途`
      : independentSmall
        ? `小個體${independentSmall.form.nameZhTw}有獨立PvP用途`
        : `${best.form.nameZhTw}${best.form.pvp.detail ? `・${best.form.pvp.detail}` : ""}`,
    tone: best.form.pvp.tone,
  };
}

export function buildFamilyPveOverview(members: FamilyMemberSummary[]): CompactOverview {
  const best = bestByConfirmedUse(members, "pve", pveUseKeys);
  if (!best || best.form.pve.tone === "NONE") return { label: "無明確用途", tone: "NONE" };
  const shadow = best.form.variants.some(
    (variant) =>
      variant.row.variantKey === "SHADOW" && variant.primaryUseKeys.includes("SHADOW_PVE"),
  );
  return {
    label: shadow ? `暗影${best.form.nameZhTw}有價值` : best.form.pve.label,
    detail: best.isTerminal ? "最終進化為主要投資目標" : `${best.form.nameZhTw}有獨立用途`,
    tone: best.form.pve.tone,
  };
}

export function buildFamilyGymOverview(members: FamilyMemberSummary[]): CompactOverview {
  const best = bestByConfirmedUse(members, "gym", new Set(["GYM_DEFENSE"]));
  if (!best || best.form.gym.tone === "NONE") {
    return { label: "未列為主要保留理由", tone: "NONE" };
  }
  return {
    label: best.form.gym.label,
    detail: `${best.form.nameZhTw}${best.form.gym.detail ? `・${best.form.gym.detail}` : ""}`,
    tone: best.form.gym.tone,
  };
}

export function buildFamilyMegaMaxOverview(members: FamilyMemberSummary[]): CompactOverview {
  const best = bestByConfirmedUse(members, "megaMax", megaMaxUseKeys);
  if (!best) return { label: "—", tone: "NONE" };
  if (best.form.megaMax.tone === "NONE") {
    return {
      label: "Max：限定用途",
      detail: `${best.form.nameZhTw}有獨立Max用途`,
      tone: "SPECIAL",
    };
  }
  if (best.form.megaMax.label.includes("超極巨")) {
    return {
      label: best.form.megaMax.label,
      detail: `${best.form.nameZhTw}的超極巨版本須直接取得；極巨前階只能進化為極巨候選`,
      tone: best.form.megaMax.tone,
    };
  }
  return {
    label: best.form.megaMax.label,
    detail: `${best.form.nameZhTw}適用；前階可進化為候選`,
    tone: best.form.megaMax.tone,
  };
}

const specialVariantKeys = new Set(["SHADOW", "MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"]);

function isSpecialAcquisitionVariant(variant: FormOverview["variants"][number]) {
  return variant.row.traces.some(
    (trace) => trace.matched && trace.ruleKey === "SPECIAL_ACQUISITION",
  );
}

function isUsefulVariant(variant: FormOverview["variants"][number]) {
  return (
    (variant.primaryUseKeys.length > 0 || isSpecialAcquisitionVariant(variant)) &&
    (variant.row.decision === "KEEP" || variant.row.decision === "CONDITIONAL_KEEP")
  );
}

function normalizedUseKey(useKey: string) {
  if (["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"].includes(useKey)) return "PVP";
  if (["PVE", "SHADOW_PVE"].includes(useKey)) return "PVE";
  if (useKey === "GYM_DEFENSE") return "GYM";
  if (useKey === "MEGA") return "MEGA";
  if (["MAX_ATTACK", "MAX_TANK", "MAX_SUPPORT", "MAX_FLEX"].includes(useKey)) return "MAX";
  return useKey;
}

export function findIndependentMemberUses(members: FamilyMemberSummary[]): IndependentMemberUse[] {
  return members.flatMap((member) => {
    const useKeys = unique(
      member.form.variants
        .filter(isUsefulVariant)
        .flatMap((variant) => [
          ...variant.primaryUseKeys,
          ...(isSpecialAcquisitionVariant(variant) ? ["SPECIAL_ACQUISITION"] : []),
        ]),
    );
    return useKeys.length
      ? [{ formId: member.form.formId, memberNameZhTw: member.form.nameZhTw, useKeys }]
      : [];
  });
}

export function findVariantSpecificUses(members: FamilyMemberSummary[]): VariantSpecificUse[] {
  return members.flatMap((member) =>
    member.form.variants
      .filter(
        (variant) => specialVariantKeys.has(variant.row.variantKey) && isUsefulVariant(variant),
      )
      .map((variant) => ({
        formId: member.form.formId,
        memberNameZhTw: member.form.nameZhTw,
        variantKey: variant.row.variantKey,
        useKeys: [...variant.primaryUseKeys],
      })),
  );
}

function targetDisplayName(
  memberNameZhTw: string,
  variants: FormOverview["variants"],
  variantSpecificOnly: boolean,
) {
  if (!variantSpecificOnly) return memberNameZhTw;
  const keys = new Set(variants.map((variant) => variant.row.variantKey));
  if ([...keys].some((key) => ["MEGA", "MEGA_X", "MEGA_Y"].includes(key))) {
    return `${memberNameZhTw}（Mega 候選）`;
  }
  if (keys.has("GIGANTAMAX")) return `超極巨${memberNameZhTw}`;
  if (keys.has("DYNAMAX")) return `極巨${memberNameZhTw}`;
  if (keys.has("SHADOW")) return `暗影${memberNameZhTw}`;
  return memberNameZhTw;
}

export function findPrimaryRetentionTargets(
  members: FamilyMemberSummary[],
): FamilyRetentionTarget[] {
  return members.flatMap((member) => {
    const usefulVariants = member.form.variants.filter(isUsefulVariant);
    if (!usefulVariants.length) return [];
    const variantSpecificOnly = usefulVariants.every((variant) =>
      specialVariantKeys.has(variant.row.variantKey),
    );
    return [
      {
        formId: member.form.formId,
        memberNameZhTw: member.form.nameZhTw,
        displayNameZhTw: targetDisplayName(
          member.form.nameZhTw,
          usefulVariants,
          variantSpecificOnly,
        ),
        useKeys: unique(
          usefulVariants.flatMap((variant) => [
            ...variant.primaryUseKeys,
            ...(isSpecialAcquisitionVariant(variant) ? ["SPECIAL_ACQUISITION"] : []),
          ]),
        ),
        variantKeys: unique(usefulVariants.map((variant) => variant.row.variantKey)),
        variantSpecificOnly,
      },
    ];
  });
}

function materialIssueMessages(members: FamilyMemberSummary[]) {
  return unique(
    members.flatMap((member) =>
      member.form.variants.flatMap((variant) => {
        const hasKnownUse = variant.primaryUseKeys.length > 0;
        const isPotentialMegaOrMax = ["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(
          variant.row.variantKey,
        );
        return (variant.row.reviewIssues ?? [])
          .filter(
            (issue) =>
              issue.affectsFinalDecision &&
              [
                "SOURCE_CONFLICT",
                "POSSIBLE_SPECIES_MISMATCH",
                "UNKNOWN_RELEASE_STATUS",
                "RULE_NOT_COVERED",
              ].includes(issue.issueType) &&
              (hasKnownUse || issue.issueType !== "UNKNOWN_RELEASE_STATUS" || isPotentialMegaOrMax),
          )
          .map((issue) => issue.messageZhTw);
      }),
    ),
  );
}

export function calculateFamilyValue(
  members: FamilyMemberSummary[],
  options: { isBatchTruncated?: boolean } = {},
): FamilyValue {
  const targets = findPrimaryRetentionTargets(members);
  const materialIssues = materialIssueMessages(members);
  if (materialIssues.length || (options.isBatchTruncated && !targets.length)) return "UNKNOWN";
  if (!targets.length) return "LOW";
  if (members.some((member) => member.form.variants.some(isSpecialAcquisitionVariant))) {
    return "HIGH";
  }

  const independentUses = findIndependentMemberUses(members);
  const normalizedUses = new Set(
    members.flatMap((member) =>
      member.form.variants.filter(isUsefulVariant).flatMap((variant) => {
        if (["MEGA", "MEGA_X", "MEGA_Y"].includes(variant.row.variantKey)) return ["MEGA"];
        if (["DYNAMAX", "GIGANTAMAX"].includes(variant.row.variantKey)) return ["MAX"];
        if (variant.row.variantKey === "SHADOW") return ["SHADOW"];
        return variant.primaryUseKeys.map(normalizedUseKey);
      }),
    ),
  );
  const hasHighNormalPve = members.some(
    (member) =>
      member.form.pve.tone === "HIGH" &&
      member.form.variants.some(
        (variant) =>
          variant.row.variantKey === "NORMAL" &&
          isUsefulVariant(variant) &&
          variant.primaryUseKeys.some((key) => normalizedUseKey(key) === "PVE"),
      ),
  );

  if (hasHighNormalPve || normalizedUses.size >= 2 || independentUses.length >= 2) {
    return "HIGH";
  }
  return "MEDIUM";
}

export function calculateFamilyRetentionStrategy(
  familyValue: FamilyValue,
): FamilyRetentionStrategy {
  if (familyValue === "HIGH") return "KEEP_TARGETS";
  if (familyValue === "MEDIUM") return "SELECTIVE_KEEP";
  if (familyValue === "LOW") return "MOSTLY_TRANSFER";
  return "HOLD_FOR_NOW";
}

function buildPreEvolutionActionZhTw(
  members: FamilyMemberSummary[],
  targets: FamilyRetentionTarget[],
) {
  const materials = members.filter(
    (member) => member.roles.includes("EVOLUTION_MATERIAL") && !member.hasIndependentUse,
  );
  if (!materials.length) return "沒有僅作進化素材的前階成員。";
  if (!targets.length) return "前階不因可以進化而自動保留。";
  return "前階主要作符合條件的進化候選。";
}

export function buildMemberActionSummaryZhTw(
  member: FamilyMemberSummary,
  targets: FamilyRetentionTarget[],
) {
  const target = targets.find((item) => item.formId === member.form.formId);
  if (target) {
    if (target.useKeys.includes("SPECIAL_ACQUISITION")) {
      return `主要保留${target.displayNameZhTw}；特殊取得個體不以 IV 作傳送門檻。`;
    }
    const iv = member.ivShortLabels.length
      ? `IV以${member.ivShortLabels.slice(0, 3).join("、")}為準。`
      : "依該用途的具體條件篩選。";
    return `主要保留${target.displayNameZhTw}；${iv}`;
  }
  if (member.roles.includes("EVOLUTION_MATERIAL")) {
    if (targets.length) {
      return `${member.form.nameZhTw}本體沒有獨立用途；前階主要作符合條件的進化候選。`;
    }
    return `${member.form.nameZhTw}雖可進化，但目前沒有已確認的主要保留目標；普通重複個體大多可傳。`;
  }
  return `${member.form.nameZhTw}沒有獨立用途；普通重複個體大多可傳。`;
}

export function buildFamilyActionSummaryZhTw({
  members,
  targets,
  strategy,
  ivShortLabels,
  isBatchTruncated,
}: {
  members: FamilyMemberSummary[];
  targets: FamilyRetentionTarget[];
  strategy: FamilyRetentionStrategy;
  ivShortLabels: string[];
  isBatchTruncated: boolean;
}) {
  const targetNames = targets.map((target) => target.displayNameZhTw).join("、");
  const preEvolution = buildPreEvolutionActionZhTw(members, targets);
  const hasGigantamaxOnlyTarget = targets.some(
    (target) =>
      target.variantSpecificOnly &&
      target.variantKeys.length > 0 &&
      target.variantKeys.every((key) => key === "GIGANTAMAX"),
  );
  const variantBoundary = hasGigantamaxOnlyTarget
    ? "超極巨個體不能由普通或極巨前階進化取得；須保留超極巨版本本身。"
    : "";
  const iv = ivShortLabels.length ? `IV：${ivShortLabels.slice(0, 3).join("；")}。` : "";
  if (strategy === "KEEP_TARGETS") {
    return `主要保留${targetNames}；${preEvolution}${variantBoundary}${iv}`;
  }
  if (strategy === "SELECTIVE_KEEP") {
    return `主要保留${targetNames}；價值集中於特定版本或條件。${preEvolution}${variantBoundary}其餘普通重複個體大多可傳。${iv}`;
  }
  if (strategy === "MOSTLY_TRANSFER") {
    return "家族目前沒有明確主要PvP、PvE、Mega、Max或道館用途；排除收藏價值後，普通重複個體大多可傳。";
  }
  const issueMessages = materialIssueMessages(members);
  if (issueMessages.length) {
    return `關鍵資料可能改變保留策略，目前暫時保留：${issueMessages.join("；")}`;
  }
  if (isBatchTruncated) {
    const currentMembers = members.map((member) => member.form.nameZhTw).join("、");
    return `暫時處理：${currentMembers}各保留 1 隻最佳候選；補齊末階進化評估前，暫不依 IV 大量篩除。`;
  }
  return "存在可能改變保留策略的關鍵不確定性，補齊資料前暫時保留。";
}

function targetHandlingParts(target: FamilyRetentionTarget, members: FamilyMemberSummary[]) {
  const uses = new Set(target.useKeys);
  const variants = new Set(target.variantKeys);
  const parts: string[] = [];
  const member = members.find((item) => item.form.formId === target.formId);
  const leagueRecommendations = ["GREAT_LEAGUE", "ULTRA_LEAGUE"]
    .filter((useKey) => uses.has(useKey))
    .map((useKey) => {
      const recommendation = member?.ivRecommendations.find(
        (item) => item.primaryUseKey === useKey,
      );
      return (
        recommendation?.shortIvLabelZhTw.replace("：", " ") ??
        (useKey === "GREAT_LEAGUE" ? "GL 排名佳" : "UL 排名佳")
      );
    })
    .filter((value): value is string => Boolean(value));

  if (leagueRecommendations.length) {
    parts.push(`PvP（${leagueRecommendations.join("、")}）`);
  }
  if (uses.has("MASTER_LEAGUE")) parts.push("ML 高 IV 投資候選");
  if (uses.has("PVE") || uses.has("SHADOW_PVE")) parts.push("PvE 實戰候選");
  if (uses.has("GYM_DEFENSE")) parts.push("道館防守候選");
  if (uses.has("SPECIAL_ACQUISITION")) parts.push("特殊取得，應保留");
  if ([...variants].some((key) => ["MEGA", "MEGA_X", "MEGA_Y"].includes(key))) {
    parts.push("Mega 候選");
  }
  if (variants.has("DYNAMAX")) parts.push("極巨候選");
  if (variants.has("GIGANTAMAX")) parts.push("超極巨版本本身");
  if (variants.has("SHADOW")) parts.push("有用途的暗影版");

  return `${target.memberNameZhTw}（${parts.join("、") || "符合條件個體"}）`;
}

export function buildFamilyHandlingSummaryZhTw({
  members,
  targets,
  strategy,
  isBatchTruncated,
}: {
  members: FamilyMemberSummary[];
  targets: FamilyRetentionTarget[];
  strategy: FamilyRetentionStrategy;
  isBatchTruncated: boolean;
}) {
  if (strategy === "MOSTLY_TRANSFER") {
    return "沒有明確實戰保留目標；排除異色、造型與收藏需求後，普通重複可直接傳送。";
  }
  if (strategy === "HOLD_FOR_NOW") {
    if (isBatchTruncated) {
      return "先不要大量傳送；目前每個成員至少留 1 隻最佳候選，補齊末階進化評估後再判斷。";
    }
    return "先不要大量傳送；保留現有最佳候選，待影響結論的關鍵資料補齊後再判斷。";
  }

  const targetText = targets.map((target) => targetHandlingParts(target, members)).join("，以及");
  if (targets.some((target) => target.useKeys.includes("SPECIAL_ACQUISITION"))) {
    return `保留${targetText}；特殊取得個體不以 IV 作傳送門檻。`;
  }
  const hasEvolutionOnlyMember = members.some(
    (member) => member.roles.includes("EVOLUTION_MATERIAL") && !member.hasIndependentUse,
  );
  const clauses = [`保留${targetText}`];
  if (hasEvolutionOnlyMember) clauses.push("前階只留能進化成上述用途的候選");
  clauses.push("其餘不符合上述用途的普通重複個體可傳");
  return `${clauses.join("；")}。`;
}

export function buildFamilyIvOverview(members: FamilyMemberSummary[]) {
  const recommendations = [
    ...new Map(
      members
        .flatMap((member) => member.ivRecommendations)
        .map((item) => [`${item.primaryUseKey}:${item.ivStrategyKey}`, item]),
    ).values(),
  ];
  const shortLabels = unique(recommendations.map((item) => item.shortIvLabelZhTw));
  return {
    recommendations,
    shortLabels,
    summaryZhTw:
      shortLabels.length > 1
        ? `依成員用途分開保留：${shortLabels.join("；")}`
        : (shortLabels[0] ?? "IV不構成額外保留理由"),
  };
}

function connectedComponents(forms: FormOverview[]) {
  const byId = new Map(forms.map((form) => [form.formId, form]));
  const adjacency = new Map(forms.map((form) => [form.formId, new Set<string>()]));
  const outgoing = new Map(forms.map((form) => [form.formId, new Set<string>()]));
  const incoming = new Map(forms.map((form) => [form.formId, new Set<string>()]));
  const edgeKeys = new Set<string>();
  for (const form of forms) {
    for (const path of form.evolutionPaths) {
      if (!byId.has(path.fromFormId) || !byId.has(path.toFormId)) continue;
      const edgeKey = `${path.fromFormId}->${path.toFormId}`;
      if (edgeKeys.has(edgeKey)) continue;
      edgeKeys.add(edgeKey);
      adjacency.get(path.fromFormId)!.add(path.toFormId);
      adjacency.get(path.toFormId)!.add(path.fromFormId);
      outgoing.get(path.fromFormId)!.add(path.toFormId);
      incoming.get(path.toFormId)!.add(path.fromFormId);
    }
  }
  const seen = new Set<string>();
  const components: ComponentGraph[] = [];
  for (const form of forms) {
    if (seen.has(form.formId)) continue;
    const ids = new Set<string>();
    const queue = [form.formId];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      ids.add(id);
      queue.push(...(adjacency.get(id) ?? []));
    }
    components.push({
      forms: [...ids].map((id) => byId.get(id)!),
      outgoing,
      incoming,
    });
  }
  return components;
}

export function buildFamilyOverview(graph: ComponentGraph, familyKey: string): FamilyOverview {
  let members = buildFamilyMemberSummaries(graph);
  const forms = members.map((member) => member.form);
  const roots = members.filter((member) => member.isRoot);
  const terminals = members.filter((member) => member.isTerminal);
  const minDexNumber = Math.min(...forms.map((form) => form.dexNumber));
  const maxDexNumber = Math.max(...forms.map((form) => form.dexNumber));
  const isBatchTruncated = forms.some((form) =>
    /範圍外|可繼續進化/.test(form.evolutionFamilyNotesZhTw),
  );
  const regionKeys = unique(forms.map((form) => form.regionKey));
  const regionHintZhTw =
    regionKeys.length === 1 && regionKeys[0] !== "KANTO" ? regionLabel[regionKeys[0]!] : null;
  const root = roots[0] ?? members[0];
  const terminal = terminals[0] ?? members.at(-1)!;
  const baseName = isBatchTruncated
    ? `${root.form.nameZhTw}家族（本批至${terminal.form.nameZhTw}）`
    : terminals.length > 1
      ? `${root.form.nameZhTw}進化家族`
      : `${terminal.form.nameZhTw}家族`;
  const familyNameZhTw = regionHintZhTw ? `${baseName}（${regionHintZhTw}）` : baseName;
  const iv = buildFamilyIvOverview(members);
  const primaryRetentionTargets = findPrimaryRetentionTargets(members);
  const familyValue = calculateFamilyValue(members, { isBatchTruncated });
  const retentionStrategy = calculateFamilyRetentionStrategy(familyValue);
  const preEvolutionActionZhTw = buildPreEvolutionActionZhTw(members, primaryRetentionTargets);
  const actionSummaryZhTw = buildFamilyActionSummaryZhTw({
    members,
    targets: primaryRetentionTargets,
    strategy: retentionStrategy,
    ivShortLabels: iv.shortLabels,
    isBatchTruncated,
  });
  const handlingSummaryZhTw = buildFamilyHandlingSummaryZhTw({
    members,
    targets: primaryRetentionTargets,
    strategy: retentionStrategy,
    isBatchTruncated,
  });
  members = members.map((member) => ({
    ...member,
    memberSummaryZhTw: buildMemberActionSummaryZhTw(member, primaryRetentionTargets),
  }));
  const heldNames = members
    .filter((member) =>
      member.form.variants.some((variant) => variant.row.decision === "HOLD_FOR_NOW"),
    )
    .map((member) => member.form.nameZhTw);
  const notices: string[] = [];
  const independentSmall = members.find(
    (member) => member.isRoot && member.roles.includes("INDEPENDENT_PVP"),
  );
  const independentMiddle = members.find(
    (member) => member.isIntermediate && member.roles.includes("INDEPENDENT_PVP"),
  );
  if (independentSmall) notices.push("小個體有獨立PvP用途，不要將最好的個體全部進化");
  if (independentMiddle) notices.push("中間進化有獨立PvP用途，不要將最好的個體全部進化");
  if (terminals.length > 1) notices.push(`具有${terminals.length}個進化分支，應分別保留目標個體`);
  if (
    primaryRetentionTargets.some(
      (target) =>
        target.variantSpecificOnly &&
        target.variantKeys.length > 0 &&
        target.variantKeys.every((key) => key === "GIGANTAMAX"),
    )
  ) {
    notices.push("超極巨個體不能由普通或極巨前階替代，必須保留超極巨版本本身");
  }
  if (heldNames.length) notices.push(`${unique(heldNames).join("、")}仍有暫時保留版本`);

  return {
    familyId: `${familyKey}:${roots
      .map((member) => member.form.formId)
      .sort()
      .join("+")}`,
    familyKey,
    familyNameZhTw,
    dexRangeZhTw:
      minDexNumber === maxDexNumber
        ? `#${String(minDexNumber).padStart(3, "0")}`
        : `#${String(minDexNumber).padStart(3, "0")}～#${String(maxDexNumber).padStart(3, "0")}`,
    regionHintZhTw,
    branchCount: terminals.length,
    isBatchTruncated,
    members,
    releasedVariantKeys: unique(forms.flatMap((form) => form.releasedVariantKeys)),
    pvp: buildFamilyPvpOverview(members),
    pve: buildFamilyPveOverview(members),
    gym: buildFamilyGymOverview(members),
    megaMax: buildFamilyMegaMaxOverview(members),
    familyValue,
    retentionStrategy,
    primaryRetentionTargets,
    primaryTargetSummaryZhTw: primaryRetentionTargets.length
      ? primaryRetentionTargets.map((target) => target.displayNameZhTw).join("、")
      : "無主要保留目標",
    preEvolutionActionZhTw,
    handlingSummaryZhTw,
    actionSummaryZhTw,
    ivShortLabels: iv.shortLabels,
    ivRecommendations: iv.recommendations,
    ivSummaryZhTw: iv.summaryZhTw,
    primaryUses: unique(forms.flatMap((form) => form.primaryUses)),
    notices,
    hasDataIssues: forms.some((form) => form.hasDataIssues),
    hasCriticalDataIssues: materialIssueMessages(members).length > 0,
    updatedAt:
      forms
        .map((form) => form.updatedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? null,
    minDexNumber,
    maxDexNumber,
  };
}

export function buildFamilyOverviews(forms: FormOverview[]) {
  const byFamily = new Map<string, FormOverview[]>();
  for (const form of forms) {
    const group = byFamily.get(form.familyKey) ?? [];
    group.push(form);
    byFamily.set(form.familyKey, group);
  }
  return [...byFamily.entries()]
    .flatMap(([familyKey, familyForms]) =>
      connectedComponents(familyForms).map((component) =>
        buildFamilyOverview(component, familyKey),
      ),
    )
    .sort(
      (a, b) =>
        a.minDexNumber - b.minDexNumber ||
        (a.regionHintZhTw ?? "").localeCompare(b.regionHintZhTw ?? "") ||
        a.familyId.localeCompare(b.familyId),
    );
}
