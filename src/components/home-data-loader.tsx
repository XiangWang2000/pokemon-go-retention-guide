"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDot, Send } from "lucide-react";
import { EvaluationBrowser } from "@/components/evaluation-browser";
import { DATA_VERSION_DATE_ZH_TW } from "@/config/release";
import type { HomeSnapshot } from "@/presentation/home-snapshot";
import type { HomeSummary } from "@/presentation/home-summary";

const strategyLabels = {
  KEEP_TARGETS: "建議保留",
  SELECTIVE_KEEP: "選擇性保留",
  MOSTLY_TRANSFER: "大多可傳",
  HOLD_FOR_NOW: "暫時保留",
} as const;

export function HomeDataLoader({ initialSummary }: { initialSummary?: HomeSummary | null }) {
  const [home, setHome] = useState<HomeSnapshot | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/home", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<HomeSnapshot>;
      })
      .then((payload) => {
        setHome(payload);
        setLoadError(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(true);
      });
    return () => controller.abort();
  }, []);
  const families = home?.families ?? [];
  const isLoading = !home && !loadError;
  const initialCounts = initialSummary?.strategyCounts;
  const stats = [
    {
      label: strategyLabels.KEEP_TARGETS,
      value: home
        ? families.filter((family) => family.retentionStrategy === "KEEP_TARGETS").length
        : (initialCounts?.KEEP_TARGETS ?? null),
      icon: CheckCircle2,
    },
    {
      label: strategyLabels.SELECTIVE_KEEP,
      value: home
        ? families.filter((family) => family.retentionStrategy === "SELECTIVE_KEEP").length
        : (initialCounts?.SELECTIVE_KEEP ?? null),
      icon: CircleDot,
    },
    {
      label: strategyLabels.MOSTLY_TRANSFER,
      value: home
        ? families.filter((family) => family.retentionStrategy === "MOSTLY_TRANSFER").length
        : (initialCounts?.MOSTLY_TRANSFER ?? null),
      icon: Send,
    },
    {
      label: strategyLabels.HOLD_FOR_NOW,
      value: home
        ? families.filter((family) => family.retentionStrategy === "HOLD_FOR_NOW").length
        : (initialCounts?.HOLD_FOR_NOW ?? null),
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="subtle-grid surface overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-[var(--primary)]">
            五批研究 · #001～#151
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            搜尋後直接看保留結論
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            先看家族的「要留／可傳」；型態、IV、來源與完整論證收在展開內容。
          </p>
          <p className="mt-2 text-xs font-semibold tracking-wide text-[var(--muted)]">
            資料更新日期：{DATA_VERSION_DATE_ZH_TW}（完整資料由瀏覽器載入）
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-[var(--surface)] px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
                <Icon aria-hidden size={15} />
                {label}
              </div>
              <p
                className="mt-1 font-mono text-2xl font-black"
                aria-label={value === null ? `${label}資料載入中` : undefined}
              >
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </section>
      {loadError ? (
        <section className="surface rounded-2xl p-6 text-center">
          <p className="font-black">資料載入失敗</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            請重新整理頁面；保留指南資料不會因載入失敗而顯示錯誤清包結論。
          </p>
        </section>
      ) : null}
      <EvaluationBrowser
        families={families}
        referenceDate={home?.dataAsOf ?? initialSummary?.dataAsOf ?? "2026-08-06T00:00:00+08:00"}
        loading={isLoading}
      />
    </div>
  );
}
