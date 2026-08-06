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
    <div className="space-y-6">
      <section className="subtle-grid surface overflow-hidden rounded-3xl p-6 lg:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-[var(--primary)]">
            五批研究 · #001～#151
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            3 秒看懂：這隻寶可夢該不該留？
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            先看整個進化家族中該留哪個成員、用途與數字 IV 門檻；展開後再查看普通、暗影、淨化、Mega
            及 Max 版本。不同地區的進化路線分開呈現，來源與完整論證保留在第二層。
          </p>
          <p className="mt-3 text-xs font-semibold tracking-wide text-[var(--muted)]">
            資料更新日期：{DATA_VERSION_DATE_ZH_TW}（完整資料由瀏覽器載入）
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                <Icon aria-hidden size={17} />
                {label}
              </div>
              <p
                className="mt-2 font-mono text-3xl font-black"
                aria-label={value === null ? `${label}資料載入中` : undefined}
              >
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </section>
      {initialSummary ? (
        <section className="surface rounded-2xl p-5" aria-labelledby="home-summary-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="home-summary-title" className="text-xl font-black">
              首頁摘要
            </h2>
            <p className="text-sm font-semibold text-[var(--muted)]">
              {initialSummary.familyCount} 個進化家族 · 更新於 {DATA_VERSION_DATE_ZH_TW}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(initialSummary.pveCounts).map(([level, count]) => (
              <div key={level} className="rounded-xl border p-3">
                <p className="text-xs font-bold text-[var(--muted)]">
                  {level === "CORE_INVESTMENT"
                    ? "核心投資"
                    : level === "USABLE_OR_BUDGET"
                      ? "可用／預算型"
                      : level === "SPECIAL_USE"
                        ? "特殊用途"
                        : "無顯著用途"}
                </p>
                <p className="mt-1 font-mono text-2xl font-black">{count}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-5 text-lg font-black">重要家族速覽</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {initialSummary.importantFamilies.map((family) => (
              <li key={family.familyId} className="rounded-xl border p-4">
                <a href={family.href} className="font-black underline-offset-4 hover:underline">
                  {family.dexRangeZhTw} {family.familyNameZhTw}
                </a>
                <p className="mt-1 text-sm font-bold text-[var(--accent)]">
                  PvE：{family.pveLabel}
                  {family.pveDetail ? `（${family.pveDetail}）` : ""}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {family.handlingSummaryZhTw}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {loadError ? (
        <section className="surface rounded-2xl p-6 text-center">
          <p className="font-black">資料載入失敗</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            請重新整理頁面；保留指南資料不會因載入失敗而顯示錯誤清包結論。
          </p>
        </section>
      ) : home ? (
        <EvaluationBrowser
          families={families}
          referenceDate={home.dataAsOf ?? "2026-07-15T00:00:00+08:00"}
        />
      ) : (
        <section
          className="surface rounded-2xl p-6"
          aria-busy="true"
          aria-live="polite"
          data-testid="home-data-loading"
        >
          <p className="font-black">正在載入保留指南資料…</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            首頁已先顯示，家族資料載入後即可搜尋與篩選。
          </p>
        </section>
      )}
    </div>
  );
}
