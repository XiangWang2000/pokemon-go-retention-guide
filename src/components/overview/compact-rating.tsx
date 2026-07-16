import type { CompactOverview } from "@/presentation/form-overview";

const toneClass: Record<CompactOverview["tone"], string> = {
  HIGH: "border-emerald-600/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  MEDIUM: "border-blue-600/35 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  LOW: "border-slate-500/35 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  SPECIAL: "border-violet-600/35 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  NONE: "border-transparent bg-transparent text-[var(--muted)]",
  REVIEW: "border-amber-600/35 bg-amber-500/10 text-amber-800 dark:text-amber-200",
};

export function CompactRating({ overview }: { overview: CompactOverview }) {
  return (
    <div className="min-w-0" title={[overview.label, overview.detail].filter(Boolean).join("｜")}>
      <span
        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-black ${toneClass[overview.tone]}`}
      >
        {overview.label}
      </span>
      {overview.detail ? (
        <p className="mt-1 line-clamp-2 text-xs leading-4 text-[var(--muted)]">{overview.detail}</p>
      ) : null}
    </div>
  );
}
