"use client";

import { useMemo, useState } from "react";
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
  suggestedActionZhTw: string;
  detectedAt: string;
}

export function ReviewTable({ issues }: { issues: Issue[] }) {
  const [type, setType] = useState("ALL");
  const [impact, setImpact] = useState("ALL");
  const [batch, setBatch] = useState("001-030");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("30");
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
  const control = "min-h-11 w-full rounded-lg border bg-[var(--surface)] px-3 text-sm";
  return (
    <div className="space-y-4">
      <div className="surface grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-sm">
          <span className="mb-1 block font-bold">問題類別</span>
          <select
            className={control}
            value={type}
            onChange={(event) => setType(event.target.value)}
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
          <span className="mb-1 block font-bold">影響最終結論</span>
          <select
            className={control}
            value={impact}
            onChange={(event) => setImpact(event.target.value)}
          >
            <option value="ALL">全部</option>
            <option value="true">會影響</option>
            <option value="false">不影響</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">研究批次</span>
          <select
            className={control}
            value={batch}
            onChange={(event) => setBatch(event.target.value)}
          >
            <option value="ALL">全部</option>
            <option value="001-030">001-030</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">圖鑑起點</span>
          <input
            className={control}
            inputMode="numeric"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold">圖鑑終點</span>
          <input
            className={control}
            inputMode="numeric"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <div className="flex items-end text-sm text-[var(--muted)]" aria-live="polite">
          顯示 {shown.length}／{issues.length} 筆
        </div>
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs text-[var(--muted)]">
            <tr>
              {[
                "圖鑑",
                "寶可夢",
                "型態",
                "戰鬥版本",
                "問題類別",
                "影響結論",
                "問題說明",
                "建議處理方式",
                "批次",
                "偵測日期",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((issue) => (
              <tr key={issue.id} className="border-b align-top">
                <td className="px-4 py-3 font-mono">
                  {issue.dexNumber ? `#${String(issue.dexNumber).padStart(3, "0")}` : "—"}
                </td>
                <td className="px-4 py-3 font-bold">{issue.nameZhTw}</td>
                <td className="px-4 py-3">{issue.formNameZhTw}</td>
                <td className="px-4 py-3">
                  {zhTw.variant[issue.variantKey as keyof typeof zhTw.variant] ?? issue.variantKey}
                </td>
                <td className="px-4 py-3 font-bold">{zhTw.issueType[issue.issueType]}</td>
                <td className="px-4 py-3 font-bold">
                  {issue.affectsFinalDecision ? "會" : "不會"}
                </td>
                <td className="max-w-lg px-4 py-3 leading-6 text-[var(--muted)]">
                  {issue.messageZhTw}
                </td>
                <td className="max-w-lg px-4 py-3 leading-6">{issue.suggestedActionZhTw}</td>
                <td className="px-4 py-3 font-mono">{issue.batchKey}</td>
                <td className="px-4 py-3">
                  {new Date(issue.detectedAt).toLocaleDateString("zh-TW")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
