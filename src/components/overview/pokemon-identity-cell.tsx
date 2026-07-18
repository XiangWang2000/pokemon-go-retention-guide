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
    <div className="flex min-w-0 items-start gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={controlsId ?? `form-detail-${form.formId}`}
        aria-label={`${expanded ? "收合" : "展開"}${form.nameZhTw}詳細資料`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      >
        {expanded ? <ChevronDown aria-hidden size={17} /> : <ChevronRight aria-hidden size={17} />}
      </button>
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold text-[var(--primary)]">
          #{String(form.dexNumber).padStart(3, "0")}
        </p>
        <p className="truncate text-base font-black">{form.nameZhTw}</p>
        <p className="truncate text-xs text-[var(--muted)]">{form.nameEn}</p>
        <p className="mt-1 text-xs font-bold text-[var(--muted)]">{form.formNameZhTw}</p>
      </div>
    </div>
  );
}
