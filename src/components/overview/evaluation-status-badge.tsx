import { compactDataStatus } from "@/presentation/form-overview";

export function EvaluationStatusBadge({ status }: { status: string }) {
  const label = compactDataStatus(status);
  const review = [
    "DATA_UNAVAILABLE",
    "SOURCE_MISSING",
    "SOURCE_CONFLICT",
    "UNKNOWN_RELEASE_STATUS",
  ].includes(status);
  return (
    <span
      title={label}
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${
        review
          ? "border-amber-600/35 bg-amber-500/10 text-amber-800 dark:text-amber-200"
          : "bg-[var(--surface-muted)] text-[var(--muted)]"
      }`}
    >
      {label}
    </span>
  );
}
