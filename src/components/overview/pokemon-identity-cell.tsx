import { ChevronDown, ChevronRight } from "lucide-react";
import type { FormOverview } from "@/presentation/form-overview";

export function PokemonIdentityCell({
  form,
  expanded,
  onToggle,
  controlsId,
}: {
  form: FormOverview;
  expanded: boolean;
  onToggle: () => void;
  controlsId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controlsId ?? `form-detail-${form.formId}`}
      aria-label={`${expanded ? "收合" : "展開"}${form.nameZhTw}詳細資料`}
      className="group flex min-w-0 items-start gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border bg-[var(--surface)] text-[var(--muted)] transition group-hover:border-[var(--primary)] group-hover:text-[var(--foreground)]">
        {expanded ? <ChevronDown aria-hidden size={17} /> : <ChevronRight aria-hidden size={17} />}
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-xs font-bold text-[var(--primary)]">
          #{String(form.dexNumber).padStart(3, "0")}
        </span>
        <span className="block truncate text-base font-black transition group-hover:text-[var(--primary)]">
          {form.nameZhTw}
        </span>
        <span className="block truncate text-xs text-[var(--muted)]">{form.nameEn}</span>
        <span className="mt-1 block text-xs font-bold text-[var(--muted)]">
          {form.formNameZhTw}
        </span>
      </span>
    </button>
  );
}
