"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { zhTw } from "@/locales/zh-TW";

interface Issue {
  id: string;
  dexNumber: number | null;
  nameZhTw: string;
  formNameZhTw: string;
  variantKey: string;
  issueType: keyof typeof zhTw.issueType;
  status: string;
  batchKey: string;
  messageZhTw: string;
  affectsFinalDecision: boolean;
  provisionalDecision: keyof typeof zhTw.decision;
  suggestedResearchActionZhTw: string;
  lastResearchedAt: string;
  relatedSources: Array<{ id: string; title: string; url: string }>;
}

export function ReviewTable({ issues }: { issues: Issue[] }) {
  const pageSize = 20;
  const batches = useMemo(
    () => [...new Set(issues.map((issue) => issue.batchKey))].sort(),
    [issues],
  );
  const [type, setType] = useState("ALL");
  const [impact, setImpact] = useState("true");
  const [batch, setBatch] = useState("ALL");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("151");
  const [page, setPage] = useState(1);
  const shown = useMemo(
    () =>
      issues.filter((issue) => {
        const dex = issue.dexNumber ?? 0;
        return (
          (type === "ALL" || issue.issueType === type) &&
          (impact === "ALL" || String(issue.affectsFinalDecision) === impact) &&
          (batch === "ALL" || issue.batchKey === batch) &&
          dex >= Number(from || 0) &&
          dex <= Number(to || 9999)
        );
      }),
    [batch, from, impact, issues, to, type],
  );
  const totalPages = Math.max(1, Math.ceil(shown.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleIssues = shown.slice((safePage - 1) * pageSize, safePage * pageSize);
  const control = "min-h-11 w-full rounded-lg border bg-[var(--surface)] px-3 text-sm";

  return (
    <div className="space-y-4">
      <div className="surface grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-sm">
          <span className="mb-1 block font-bold">問題類別</span>
          <select
            className={control}
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">全部</option>
            {Object.entries(zhTw.issueType).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">影響層級</span>
          <select
            className={control}
            value={impact}
            onChange={(event) => {
              setImpact(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">全部</option>
            <option value="true">影響家族總結</option>
            <option value="false">僅版本或不影響</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">研究批次</span>
          <select
            className={control}
            value={batch}
            onChange={(event) => {
              setBatch(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">全部</option>
            {batches.map((batchKey) => (
              <option key={batchKey} value={batchKey}>
                {batchKey}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">圖鑑起點</span>
          <input
            className={control}
            inputMode="numeric"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">圖鑑終點</span>
          <input
            className={control}
            inputMode="numeric"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="flex items-end text-sm text-[var(--muted)]" aria-live="polite">
          顯示 {shown.length}／{issues.length} 筆
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleIssues.map((issue) => (
          <article key={issue.id} className="surface rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[var(--muted)]">
                  {issue.dexNumber ? `#${String(issue.dexNumber).padStart(3, "0")}` : "—"} ·{" "}
                  {issue.batchKey}
                </p>
                <h2 className="mt-1 text-lg font-black">
                  {issue.nameZhTw}（{issue.formNameZhTw}）
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {zhTw.variant[issue.variantKey as keyof typeof zhTw.variant] ?? issue.variantKey}
                </p>
              </div>
              <StatusBadge decision={issue.provisionalDecision} />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                <dt className="font-bold">缺少什麼資料</dt>
                <dd className="mt-1 leading-6 text-[var(--muted)]">
                  {zhTw.issueType[issue.issueType]}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                <dt className="font-bold">影響層級</dt>
                <dd className="mt-1 leading-6 text-[var(--muted)]">
                  {issue.affectsFinalDecision
                    ? "影響家族總結"
                    : issue.issueType === "UNKNOWN_RELEASE_STATUS"
                      ? "僅影響此版本，不影響家族總結"
                      : "不影響目前建議"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold">為什麼無法自動確認</dt>
                <dd className="mt-1 leading-6 text-[var(--muted)]">{issue.messageZhTw}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold">下一步應搜尋或驗證</dt>
                <dd className="mt-1 leading-6">{issue.suggestedResearchActionZhTw}</dd>
              </div>
              <div>
                <dt className="font-bold">最後研究日期</dt>
                <dd className="mt-1 text-[var(--muted)]">
                  {new Date(issue.lastResearchedAt).toLocaleDateString("zh-TW")}
                </dd>
              </div>
              <div>
                <dt className="font-bold">相關來源</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {issue.relatedSources.length ? (
                    issue.relatedSources.slice(0, 3).map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-[var(--primary)] underline underline-offset-4"
                      >
                        {source.title}
                        <ExternalLink aria-hidden size={13} />
                      </a>
                    ))
                  ) : (
                    <span className="text-[var(--muted)]">尚無可引用來源</span>
                  )}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <nav
        aria-label="資料待補清單分頁"
        className="surface flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
      >
        <p className="text-sm text-[var(--muted)]">
          第 {safePage}／{totalPages} 頁 · 每頁最多 {pageSize} 筆
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="min-h-11 rounded-lg border px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            上一頁
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            下一頁
          </button>
        </div>
      </nav>
    </div>
  );
}
