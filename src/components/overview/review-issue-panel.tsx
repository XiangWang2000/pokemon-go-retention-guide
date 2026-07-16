import type { DashboardRow } from "@/lib/data";
import { zhTw } from "@/locales/zh-TW";
import { EvaluationStatusBadge } from "./evaluation-status-badge";

export function ReviewIssuePanel({ row }: { row: DashboardRow }) {
  const issues = row.categoryStatuses.filter((item) =>
    ["DATA_UNAVAILABLE", "SOURCE_MISSING", "SOURCE_CONFLICT", "UNKNOWN_RELEASE_STATUS"].includes(
      item.status,
    ),
  );
  if (!issues.length && row.reviewed) {
    return <p className="text-sm text-[var(--muted)]">此版本沒有待處理的關鍵審核問題。</p>;
  }
  return (
    <div className="rounded-xl border border-amber-600/30 bg-amber-500/5 p-3">
      <p className="text-sm font-black">需要檢查</p>
      {!row.reviewed ? <p className="mt-1 text-sm">尚未完成人工確認。</p> : null}
      <ul className="mt-2 space-y-2">
        {issues.map((issue) => (
          <li key={issue.category} className="flex flex-wrap items-start gap-2 text-sm">
            <strong>{zhTw.category[issue.category]}</strong>
            <EvaluationStatusBadge status={issue.status} />
            <span className="text-[var(--muted)]">{issue.summaryZhTw}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
