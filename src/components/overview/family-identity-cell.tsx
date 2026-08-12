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
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={`${expanded ? "收合" : "展開"}${family.familyNameZhTw}成員`}
      className="group flex min-w-0 items-start gap-2 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--muted)] transition group-hover:border-[var(--primary)] group-hover:text-[var(--foreground)]">
        {expanded ? <ChevronDown aria-hidden size={18} /> : <ChevronRight aria-hidden size={18} />}
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black leading-5 transition group-hover:text-[var(--primary)]">
          {family.familyNameZhTw}
        </span>
        <span className="mt-1 block font-mono text-xs font-bold text-[var(--primary)]">
          {family.dexRangeZhTw}
        </span>
        <span className="mt-1 block text-[11px] text-[var(--muted)]">
          {family.branchCount > 1 ? `${family.branchCount}個分支` : "單一路徑"}
          {family.isBatchTruncated ? " · 本批資料未涵蓋完整末階" : ""}
        </span>
      </span>
    </button>
  );
}
