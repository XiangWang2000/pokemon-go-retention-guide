import type { DashboardRow } from "@/lib/data";
import { zhTw } from "@/locales/zh-TW";

export function ReviewIssuePanel({ row }: { row: DashboardRow }) {
  const issues = row.reviewIssues;
  if (!issues.length) {
    return <p className="text-sm text-[var(--muted)]">此版本目前沒有資料待補項目。</p>;
  }
  return (
    <div className="rounded-xl border border-amber-600/30 bg-amber-500/5 p-3">
      <p className="text-sm font-black">部分資料待補</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        這是資料維護事項，不要求使用者自行判斷保留價值。
      </p>
      <ul className="mt-2 space-y-2">
        {issues.map((issue) => (
          <li key={issue.id} className="flex flex-wrap items-start gap-2 text-sm">
            <strong>{zhTw.issueType[issue.issueType]}</strong>
            <span>{issue.affectsFinalDecision ? "會影響目前建議" : "不影響目前建議"}</span>
            <span className="text-[var(--muted)]">{issue.messageZhTw}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
