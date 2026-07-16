import { ExternalLink } from "lucide-react";
import type { DashboardRow } from "@/lib/data";

export function SourcePopover({ sources }: { sources: DashboardRow["sources"] }) {
  if (!sources.length) return <span className="text-sm text-[var(--muted)]">待補資料</span>;
  return (
    <details className="group rounded-xl border bg-[var(--surface)] p-3">
      <summary className="cursor-pointer text-sm font-bold">查看 {sources.length} 筆來源</summary>
      <ul className="mt-3 space-y-3">
        {sources.map((source) => (
          <li key={source.id} className="text-sm leading-5">
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-start gap-1 font-bold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {source.title}
              <ExternalLink aria-hidden className="mt-0.5 shrink-0" size={14} />
            </a>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {source.name} · 查閱 {source.accessedAt.slice(0, 10)}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{source.usageZhTw}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
