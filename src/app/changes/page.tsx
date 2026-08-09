"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileClock } from "lucide-react";
import { fetchStaticJson } from "@/config/site";
import type { StaticChangeLog } from "@/lib/static-data";

export default function ChangesPage() {
  const [logs, setLogs] = useState<StaticChangeLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchStaticJson<StaticChangeLog[]>("/data/changes.json")
      .then(setLogs)
      .catch(() => setError(true))
      .finally(() => setLoaded(true));
  }, []);

  if (error) {
    return <p className="surface rounded-2xl p-6">Change data failed to load. Please refresh.</p>;
  }
  if (!loaded) {
    return <p className="surface rounded-2xl p-6">Loading change data...</p>;
  }
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <FileClock aria-hidden size={28} className="text-[var(--primary)]" />
          <h1 className="text-3xl font-black">變更紀錄</h1>
        </div>
        <p className="mt-2 text-[var(--muted)]">每次欄位變動保留前後值、原因、來源與規則版本。</p>
      </header>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs text-[var(--muted)]">
            <tr>
              {["日期", "實體", "欄位", "修改前", "修改後", "來源", "修改原因", "規則版本"].map(
                (h) => (
                  <th key={h} className="border-b px-4 py-3">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(log.changedAt).toLocaleDateString("zh-TW")}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {log.entityType}
                  <br />
                  {log.entityId}
                </td>
                <td className="px-4 py-3 font-mono">{log.fieldName}</td>
                <td className="px-4 py-3">{log.previousValue ?? "—"}</td>
                <td className="px-4 py-3 font-bold">{log.newValue ?? "—"}</td>
                <td className="px-4 py-3">
                  {log.source ? (
                    <a
                      href={log.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex gap-1 text-[var(--accent)] hover:underline"
                    >
                      {log.source.title}
                      <ExternalLink aria-hidden size={13} />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-md px-4 py-3 leading-6">{log.changeReasonZhTw}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.rulesVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
