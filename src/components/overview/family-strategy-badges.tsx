import { AlertTriangle, CheckCircle2, CircleDot, Send, Target } from "lucide-react";
import { zhTw } from "@/locales/zh-TW";
import type { FamilyRetentionStrategy, FamilyValue } from "@/presentation/family-overview";

const valueStyles: Record<FamilyValue, string> = {
  HIGH: "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  MEDIUM: "border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  LOW: "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  UNKNOWN: "border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
};

const strategyStyles: Record<FamilyRetentionStrategy, string> = {
  KEEP_TARGETS: "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  SELECTIVE_KEEP: "border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  MOSTLY_TRANSFER: "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  HOLD_FOR_NOW: "border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
};

const strategyIcons = {
  KEEP_TARGETS: CheckCircle2,
  SELECTIVE_KEEP: CircleDot,
  MOSTLY_TRANSFER: Send,
  HOLD_FOR_NOW: AlertTriangle,
} as const;

export function FamilyValueBadge({ value }: { value: FamilyValue }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold whitespace-nowrap ${valueStyles[value]}`}
    >
      <Target aria-hidden size={13} /> 家族價值：{zhTw.familyValue[value]}
    </span>
  );
}

export function FamilyRetentionStrategyBadge({
  strategy,
  prominent = false,
}: {
  strategy: FamilyRetentionStrategy;
  prominent?: boolean;
}) {
  const Icon = strategyIcons[strategy];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black whitespace-nowrap ${strategyStyles[strategy]} ${prominent ? "scale-105 origin-left" : ""}`}
    >
      <Icon aria-hidden size={14} /> {zhTw.familyRetentionStrategy[strategy]}
    </span>
  );
}
