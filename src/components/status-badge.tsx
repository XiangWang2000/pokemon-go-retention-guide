import { AlertTriangle, CheckCircle2, CircleDot, Send } from "lucide-react";
import { zhTw } from "@/locales/zh-TW";

const styles = {
  KEEP: "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CONDITIONAL_KEEP: "border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  TRANSFER_CANDIDATE: "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  HOLD_FOR_NOW: "border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
} as const;

const icons = {
  KEEP: CheckCircle2,
  CONDITIONAL_KEEP: CircleDot,
  TRANSFER_CANDIDATE: Send,
  HOLD_FOR_NOW: AlertTriangle,
} as const;

export function StatusBadge({ decision }: { decision: keyof typeof styles }) {
  const Icon = icons[decision];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${styles[decision]}`}
    >
      <Icon aria-hidden size={14} />
      {zhTw.decision[decision]}
    </span>
  );
}
