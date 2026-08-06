import { pveUseLevelLabelZhTw, type PveUseLevel } from "@/rules/battle-assessment";
import type { FamilyOverview, FamilyRetentionStrategy, FamilyValue } from "./family-overview";
import type { CompactOverview, OverviewTone } from "./form-overview";
import type { HomeSnapshot } from "./home-snapshot";

export const familyRetentionStrategies = [
  "KEEP_TARGETS",
  "SELECTIVE_KEEP",
  "MOSTLY_TRANSFER",
  "HOLD_FOR_NOW",
] as const satisfies readonly FamilyRetentionStrategy[];

export interface ImportantFamilySummary {
  familyId: string;
  familyNameZhTw: string;
  dexRangeZhTw: string;
  href: string;
  familyValue: FamilyValue;
  retentionStrategy: FamilyRetentionStrategy;
  pveLabel: string;
  pveDetail: string | null;
  primaryUses: string[];
  handlingSummaryZhTw: string;
}

export interface HomeSummary {
  schemaVersion: 1;
  dataAsOf: string | null;
  familyCount: number;
  strategyCounts: Record<FamilyRetentionStrategy, number>;
  pveCounts: Record<PveUseLevel, number>;
  importantFamilies: ImportantFamilySummary[];
}

const familyValueWeight: Record<FamilyValue, number> = {
  HIGH: 4,
  MEDIUM: 3,
  LOW: 1,
  UNKNOWN: 0,
};

const retentionWeight: Record<FamilyRetentionStrategy, number> = {
  HOLD_FOR_NOW: 5,
  KEEP_TARGETS: 4,
  SELECTIVE_KEEP: 3,
  MOSTLY_TRANSFER: 0,
};

const focusDexNumbers = new Set([81, 111, 114, 123, 125, 126]);
const pveLabelToLevel = new Map(
  Object.entries(pveUseLevelLabelZhTw).map(([level, label]) => [label, level as PveUseLevel]),
);

const overviewToneWeight: Record<OverviewTone, number> = {
  HIGH: 6,
  MEDIUM: 5,
  SPECIAL: 4,
  REVIEW: 3,
  LOW: 2,
  NONE: 1,
};

function strongestFamilyPve(family: FamilyOverview): CompactOverview {
  return [family.pve, ...family.members.map((member) => member.form.pve)].sort(
    (left, right) => overviewToneWeight[right.tone] - overviewToneWeight[left.tone],
  )[0]!;
}

function strategyCounts(families: FamilyOverview[]) {
  return Object.fromEntries(
    familyRetentionStrategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  ) as Record<FamilyRetentionStrategy, number>;
}

function pveCounts(families: FamilyOverview[]) {
  const counts = Object.fromEntries(
    Object.keys(pveUseLevelLabelZhTw).map((level) => [level, 0]),
  ) as Record<PveUseLevel, number>;
  for (const family of families) {
    const level = pveLabelToLevel.get(strongestFamilyPve(family).label) ?? "NO_SIGNIFICANT_USE";
    counts[level] += 1;
  }
  return counts;
}

function familyHref(family: FamilyOverview) {
  const target = family.primaryRetentionTargets[0];
  const targetMember = family.members.find((member) => member.form.formId === target?.formId);
  const targetVariant = targetMember?.form.variants.find((variant) =>
    target?.variantKeys.includes(variant.row.variantKey),
  );
  const fallbackVariant = family.members[0]?.form.variants[0];
  const variantId = targetVariant?.row.id ?? fallbackVariant?.row.id;
  return variantId ? `/pokemon/${encodeURIComponent(variantId)}` : "/";
}

function importantScore(family: FamilyOverview) {
  const focusBonus = focusDexNumbers.has(family.minDexNumber) ? 1000 : 0;
  const pve = strongestFamilyPve(family);
  const pveBonus = pve.tone === "HIGH" ? 8 : pve.tone === "MEDIUM" ? 4 : 0;
  const issueBonus = family.hasCriticalDataIssues ? 5 : 0;
  return (
    focusBonus +
    familyValueWeight[family.familyValue] * 10 +
    retentionWeight[family.retentionStrategy] * 3 +
    family.primaryUses.length * 2 +
    pveBonus +
    issueBonus
  );
}

function toImportantFamilySummary(family: FamilyOverview): ImportantFamilySummary {
  const pve = strongestFamilyPve(family);
  return {
    familyId: family.familyId,
    familyNameZhTw: family.familyNameZhTw,
    dexRangeZhTw: family.dexRangeZhTw,
    href: familyHref(family),
    familyValue: family.familyValue,
    retentionStrategy: family.retentionStrategy,
    pveLabel: pve.label,
    pveDetail: pve.detail ?? null,
    primaryUses: family.primaryUses.slice(0, 3),
    handlingSummaryZhTw: family.handlingSummaryZhTw,
  };
}

export function buildHomeSummary(home: HomeSnapshot): HomeSummary {
  const importantFamilies = [...home.families]
    .filter(
      (family) =>
        focusDexNumbers.has(family.minDexNumber) ||
        family.familyValue !== "LOW" ||
        family.primaryUses.length > 0 ||
        family.retentionStrategy === "HOLD_FOR_NOW",
    )
    .sort(
      (left, right) =>
        importantScore(right) - importantScore(left) || left.minDexNumber - right.minDexNumber,
    )
    .slice(0, 12)
    .map(toImportantFamilySummary);

  return {
    schemaVersion: 1,
    dataAsOf: home.dataAsOf,
    familyCount: home.families.length,
    strategyCounts: strategyCounts(home.families),
    pveCounts: pveCounts(home.families),
    importantFamilies,
  };
}
