import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import type { DashboardRow } from "@/lib/data";
import { zhTw } from "@/locales/zh-TW";
import { scopedCategoryDataNote } from "@/presentation/data-status";
import { EvaluationStatusBadge } from "./evaluation-status-badge";
import { RetentionDecisionBadge } from "./retention-decision-badge";
import { ReviewIssuePanel } from "./review-issue-panel";
import { SourcePopover } from "./source-popover";

function rank(row: DashboardRow, league: "GREAT" | "ULTRA" | "MASTER") {
  return row.raw.find((item) => item.category === "PVP" && item.league === league)?.rank ?? null;
}

function AuditDetails({ row }: { row: DashboardRow }) {
  return (
    <div className="grid gap-4 p-4 xl:grid-cols-2">
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h3 className="font-black">類別狀態</h3>
        <ul className="mt-3 space-y-3">
          {row.categoryStatuses.map((status) => (
            <li key={status.category} className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <strong>{zhTw.category[status.category]}</strong>
                <EvaluationStatusBadge status={status.status} />
                <span className="text-xs text-[var(--muted)]">
                  {zhTw.evaluationProvenance[status.provenance]} · 查核{" "}
                  {status.checkedAt?.slice(0, 10) ?? "待確認"}
                </span>
                {status.category === "PVE" && status.pveUseLevel ? (
                  <span className="font-bold text-[var(--accent)]">
                    {zhTw.pveUseLevel[status.pveUseLevel as keyof typeof zhTw.pveUseLevel]}
                  </span>
                ) : null}
                {status.assessmentDisposition ? (
                  <span className="text-xs text-[var(--muted)]">
                    {
                      zhTw.assessmentDisposition[
                        status.assessmentDisposition as keyof typeof zhTw.assessmentDisposition
                      ]
                    }
                  </span>
                ) : null}
                {scopedCategoryDataNote(status) ? (
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    {scopedCategoryDataNote(status)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 leading-6 text-[var(--muted)]">{status.summaryZhTw}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h3 className="font-black">原始資料與規則軌跡</h3>
        <ul className="mt-3 space-y-3">
          {row.raw.length ? (
            row.raw.map((raw) => (
              <li key={raw.id} className="rounded-lg bg-[var(--surface-muted)] p-3 text-sm">
                <strong>{zhTw.category[raw.category]}</strong>
                <span className="ml-2">
                  {raw.league === "NOT_APPLICABLE" ? "" : zhTw.league[raw.league]}
                  {raw.rank !== null ? ` #${raw.rank}` : ""}
                  {raw.tier ? ` · Tier ${raw.tier}` : ""}
                  {raw.rating ? ` · ${raw.rating}` : ""}
                </span>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  擷取方式：{raw.extractionMethod} · 查核 {raw.checkedAt.slice(0, 10)}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm text-[var(--muted)]">尚無可重現的原始排名或 Tier。</li>
          )}
        </ul>
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-bold">規則版本：{row.rulesVersion}</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
            {row.traces.map((trace) => (
              <li key={trace.ruleKey}>
                {trace.matched ? "✓" : "—"} {trace.explanationZhTw}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ReviewIssuePanel row={row} />
      <SourcePopover sources={row.sources} />
    </div>
  );
}

export function DataAuditTable({
  rows,
  expanded,
  onToggle,
  loading = false,
}: {
  rows: DashboardRow[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="surface rounded-2xl p-10 text-center" aria-busy="true" aria-live="polite">
        <p className="font-black">正在載入完整資料稽核列表…</p>
        <p className="mt-2 text-sm text-[var(--muted)]">首次開啟稽核模式需要額外載入資料。</p>
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="surface rounded-2xl p-10 text-center font-black">找不到符合條件的資料</div>
    );
  }
  return (
    <>
      <div className="space-y-3 lg:hidden" data-mobile-layout="audit-cards">
        {rows.map((row) => {
          const isExpanded = expanded.has(row.id);
          return (
            <article key={row.id} className="surface overflow-hidden rounded-2xl">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-[var(--primary)]">
                      #{String(row.dexNumber).padStart(3, "0")}
                    </p>
                    <h2 className="font-black">{row.nameZhTw}</h2>
                    <p className="text-xs text-[var(--muted)]">
                      {row.formNameZhTw} · {zhTw.variant[row.variantKey]}
                    </p>
                  </div>
                  <RetentionDecisionBadge decision={row.decision} />
                </div>
                <p className="mt-3 font-mono text-xs text-[var(--muted)]">
                  GL {rank(row, "GREAT") ?? "—"} · UL {rank(row, "ULTRA") ?? "—"} · ML{" "}
                  {rank(row, "MASTER") ?? "—"}
                </p>
                <button
                  type="button"
                  onClick={() => onToggle(row.id)}
                  aria-expanded={isExpanded}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border font-bold"
                >
                  {isExpanded ? (
                    <ChevronDown aria-hidden size={17} />
                  ) : (
                    <ChevronRight aria-hidden size={17} />
                  )}
                  {isExpanded ? "收合審核資料" : "展開審核資料"}
                </button>
              </div>
              {isExpanded ? <AuditDetails row={row} /> : null}
            </article>
          );
        })}
      </div>

      <div
        className="surface hidden overflow-x-auto rounded-2xl lg:block"
        data-testid="audit-table"
      >
        <table className="min-w-[1180px] border-collapse text-left text-sm">
          <thead className="sticky top-16 z-20 bg-[var(--surface-muted)] text-xs text-[var(--muted)]">
            <tr>
              {[
                "展開",
                "寶可夢",
                "型態／版本",
                "GL",
                "UL",
                "ML",
                "最終建議",
                "信心",
                "更新日期",
                "審核",
                "來源",
              ].map((heading) => (
                <th key={heading} className="border-b px-3 py-3 font-black">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpanded = expanded.has(row.id);
              return (
                <Fragment key={row.id}>
                  <tr className="border-b align-top hover:bg-[var(--surface-muted)]/55">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onToggle(row.id)}
                        aria-expanded={isExpanded}
                        className="inline-flex size-9 items-center justify-center rounded-lg border"
                      >
                        {isExpanded ? (
                          <ChevronDown aria-hidden size={16} />
                        ) : (
                          <ChevronRight aria-hidden size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <strong>
                        #{String(row.dexNumber).padStart(3, "0")} {row.nameZhTw}
                      </strong>
                      <p className="text-xs text-[var(--muted)]">{row.nameEn}</p>
                    </td>
                    <td className="px-3 py-3">
                      {row.formNameZhTw}／{zhTw.variant[row.variantKey]}
                    </td>
                    <td className="px-3 py-3 font-mono">{rank(row, "GREAT") ?? "—"}</td>
                    <td className="px-3 py-3 font-mono">{rank(row, "ULTRA") ?? "—"}</td>
                    <td className="px-3 py-3 font-mono">{rank(row, "MASTER") ?? "—"}</td>
                    <td className="px-3 py-3">
                      <RetentionDecisionBadge decision={row.decision} />
                    </td>
                    <td className="px-3 py-3">{zhTw.confidence[row.confidence]}</td>
                    <td className="px-3 py-3">{row.updatedAt?.slice(0, 10) ?? "待確認"}</td>
                    <td className="px-3 py-3">{row.reviewed ? "已確認" : "未確認"}</td>
                    <td className="px-3 py-3">{row.sources.length} 筆</td>
                  </tr>
                  {isExpanded ? (
                    <tr>
                      <td colSpan={11} className="border-b bg-[var(--surface-muted)]/45 p-0">
                        <AuditDetails row={row} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
