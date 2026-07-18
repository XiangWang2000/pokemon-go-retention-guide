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
  decision: FormOverview["decision"];
  decisionReason: string;
  ivShortLabels: string[];
  ivRecommendations: IvRecommendation[];
  ivSummaryZhTw: string;
  primaryUses: string[];
  notices: string[];
  hasDataIssues: boolean;
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

const decisionWeight: Record<FormOverview["decision"], number> = {
  KEEP: 4,
  CONDITIONAL_KEEP: 3,
  HOLD_FOR_NOW: 2,
  TRANSFER_CANDIDATE: 1,
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
  MEGA_CANDIDATE: "Mega候選",
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
  const uses = new Set(form.variants.flatMap((variant) => variant.primaryUseKeys));
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
        ? `${form.nameZhTw}主要作進化素材；只保留符合目標進化結果數字門檻的個體。`
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
  const best = bestByTone(members, "pvp");
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
  const best = bestByTone(members, "pve");
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
  const best = bestByTone(members, "gym");
  if (!best || best.form.gym.tone === "NONE") return { label: "不適合", tone: "NONE" };
  return {
    label: best.form.gym.label,
    detail: `${best.form.nameZhTw}${best.form.gym.detail ? `・${best.form.gym.detail}` : ""}`,
    tone: best.form.gym.tone,
  };
}

export function buildFamilyMegaMaxOverview(members: FamilyMemberSummary[]): CompactOverview {
  const best = bestByTone(members, "megaMax");
  if (!best || best.form.megaMax.tone === "NONE") return { label: "—", tone: "NONE" };
  return {
    label: best.form.megaMax.label,
    detail: `${best.form.nameZhTw}適用；前階可進化為候選`,
    tone: best.form.megaMax.tone,
  };
}

export function buildFamilyRetentionDecision(members: FamilyMemberSummary[]) {
  const decisions = members.map((member) => member.form.decision);
  if (decisions.every((decision) => decision === "TRANSFER_CANDIDATE")) {
    return "TRANSFER_CANDIDATE" as const;
  }
  if (decisions.every((decision) => decision === "KEEP")) return "KEEP" as const;
  if (decisions.some((decision) => decision === "KEEP" || decision === "CONDITIONAL_KEEP")) {
    return "CONDITIONAL_KEEP" as const;
  }
  if (decisions.some((decision) => decision === "HOLD_FOR_NOW")) return "HOLD_FOR_NOW" as const;
  return [...members].sort(
    (a, b) => decisionWeight[b.form.decision] - decisionWeight[a.form.decision],
  )[0]!.form.decision;
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
  const members = buildFamilyMemberSummaries(graph);
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
  const decision = buildFamilyRetentionDecision(members);
  const iv = buildFamilyIvOverview(members);
  const valuableMembers = members.filter(
    (member) => member.form.decision === "KEEP" || member.hasIndependentUse,
  );
  const valuableNames = unique(valuableMembers.map((member) => member.form.nameZhTw)).slice(0, 3);
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
  if (heldNames.length) notices.push(`${unique(heldNames).join("、")}仍有暫時保留版本`);

  const decisionReason =
    decision === "TRANSFER_CANDIDATE"
      ? "家族目前缺乏明確PvP、PvE、道館、Mega、Max及進化用途；普通重複個體通常可傳送。"
      : decision === "HOLD_FOR_NOW"
        ? "關鍵用途可能改變保留結論；傳送不可逆，資料確認前先保留。"
        : `主要保留${valuableNames.join("、") || terminal.form.nameZhTw}；前階僅保留符合目標進化數字門檻的個體。`;

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
    decision,
    decisionReason,
    ivShortLabels: iv.shortLabels,
    ivRecommendations: iv.recommendations,
    ivSummaryZhTw: iv.summaryZhTw,
    primaryUses: unique(forms.flatMap((form) => form.primaryUses)),
    notices,
    hasDataIssues: forms.some((form) => form.hasDataIssues),
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
