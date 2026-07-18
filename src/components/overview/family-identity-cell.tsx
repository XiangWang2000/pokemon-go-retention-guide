import { ChevronDown, ChevronRight } from "lucide-react";
import type { FamilyOverview } from "@/presentation/family-overview";

export function FamilyIdentityCell({
  family,
  expanded,
  onToggle,
  controlsId,
}: {
  family: FamilyOverview;
  expanded: boolean;
  onToggle: () => void;
  controlsId: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={controlsId}
        aria-label={`${expanded ? "收合" : "展開"}${family.familyNameZhTw}成員`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      >
        {expanded ? <ChevronDown aria-hidden size={18} /> : <ChevronRight aria-hidden size={18} />}
      </button>
      <div className="min-w-0">
        <p className="text-base font-black leading-5">{family.familyNameZhTw}</p>
        <p className="mt-1 font-mono text-xs font-bold text-[var(--primary)]">
          {family.dexRangeZhTw}
        </p>
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          {family.branchCount > 1 ? `${family.branchCount}個分支` : "單一路徑"}
          {family.isBatchTruncated ? " · 本批資料未涵蓋完整末階" : ""}
        </p>
      </div>
    </div>
  );
}
