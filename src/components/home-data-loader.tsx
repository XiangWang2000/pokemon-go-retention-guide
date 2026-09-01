"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDot, Search, Send } from "lucide-react";
import { EvaluationBrowser } from "@/components/evaluation-browser";
import { CURRENT_DATA_MAX_DEX } from "@/config/data-scope";
import { DATA_VERSION_DATE_ISO, DATA_VERSION_DATE_ZH_TW } from "@/config/release";
import { auditDataFileName, familyDataFileName } from "@/lib/site-data-paths";
import { fetchStaticJson } from "@/config/site";
import {
  filterAuditRows,
  type AuditPageResponse,
  type AuditQuery,
  type AuditSummarySnapshot,
} from "@/lib/audit-data";
import type { DashboardRow } from "@/lib/data";
import { zhTw } from "@/locales/zh-TW";
import type { FamilyOverview } from "@/presentation/family-overview";
import type { HomeRuntimeSnapshot } from "@/presentation/home-snapshot";

export function HomeDataLoader() {
  const [homeQuery, setHomeQuery] = useState("");
  const [home, setHome] = useState<HomeRuntimeSnapshot | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(false);
  const [familyDetails, setFamilyDetails] = useState<Record<string, FamilyOverview>>({});
  const [familyDetailLoading, setFamilyDetailLoading] = useState<Set<string>>(new Set());
  const [familyDetailErrors, setFamilyDetailErrors] = useState<Record<string, boolean>>({});
  const [auditPage, setAuditPage] = useState<AuditPageResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(false);
  const [auditDetails, setAuditDetails] = useState<Record<string, DashboardRow>>({});
  const [auditDetailLoading, setAuditDetailLoading] = useState<Set<string>>(new Set());
  const [auditDetailErrors, setAuditDetailErrors] = useState<Record<string, boolean>>({});
  const homeRequestRef = useRef(0);
  const auditRequestRef = useRef(0);
  const auditQueryRef = useRef<AuditQuery | null>(null);
  const auditSummaryRef = useRef<AuditSummarySnapshot | null>(null);

  const loadHome = useCallback(() => {
    const requestId = ++homeRequestRef.current;
    setHomeLoading(true);
    setHomeError(false);
    fetchStaticJson<HomeRuntimeSnapshot>("/data/home.json")
      .then((payload) => {
        if (requestId !== homeRequestRef.current) return;
        setHome(payload);
      })
      .catch(() => {
        if (requestId === homeRequestRef.current) setHomeError(true);
      })
      .finally(() => {
        if (requestId === homeRequestRef.current) setHomeLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadHome, 0);
    return () => window.clearTimeout(timer);
  }, [loadHome]);

  useEffect(() => {
    const syncHomeQuery = () => {
      setHomeQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    };
    syncHomeQuery();
    window.addEventListener("popstate", syncHomeQuery);
    return () => window.removeEventListener("popstate", syncHomeQuery);
  }, []);

  const families = useMemo(
    () => home?.families.map((family) => familyDetails[family.familyId] ?? family) ?? [],
    [familyDetails, home],
  );

  const loadFamilyDetails = useCallback(
    (familyId: string) => {
      const family = home?.families.find((item) => item.familyId === familyId);
      if (!family || familyDetails[familyId] || familyDetailLoading.has(familyId)) return;
      setFamilyDetailErrors((current) => ({ ...current, [familyId]: false }));
      setFamilyDetailLoading((current) => new Set(current).add(familyId));
      fetchStaticJson<FamilyOverview>(
        `/data/families/${encodeURIComponent(familyDataFileName(familyId))}`,
      )
        .then((family) => {
          setFamilyDetails((current) => ({ ...current, [familyId]: family }));
        })
        .catch(() => {
          setFamilyDetailErrors((current) => ({ ...current, [familyId]: true }));
        })
        .finally(() => {
          setFamilyDetailLoading((current) => {
            const next = new Set(current);
            next.delete(familyId);
            return next;
          });
        });
    },
    [familyDetailLoading, familyDetails, home],
  );

  const loadAuditPage = useCallback((query: AuditQuery) => {
    const requestId = ++auditRequestRef.current;
    auditQueryRef.current = query;
    setAuditPage(null);
    setAuditLoading(true);
    setAuditError(false);
    const load = async () => {
      const snapshot =
        auditSummaryRef.current ??
        (await fetchStaticJson<AuditSummarySnapshot>("/data/audit-summary.json"));
      auditSummaryRef.current = snapshot;
      const filtered = filterAuditRows(snapshot.rows, query, snapshot.dataAsOf);
      const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
      const page = Math.min(query.page, pageCount);
      const start = (page - 1) * query.pageSize;
      return {
        schemaVersion: 1 as const,
        dataAsOf: snapshot.dataAsOf,
        rows: filtered.slice(start, start + query.pageSize),
        total: filtered.length,
        overallTotal: snapshot.rows.length,
        page,
        pageSize: query.pageSize,
      } satisfies AuditPageResponse;
    };
    load()
      .then((payload) => {
        if (requestId === auditRequestRef.current) setAuditPage(payload);
      })
      .catch(() => {
        if (requestId === auditRequestRef.current) setAuditError(true);
      })
      .finally(() => {
        if (requestId === auditRequestRef.current) setAuditLoading(false);
      });
  }, []);

  const retryAudit = useCallback(() => {
    if (auditQueryRef.current) loadAuditPage(auditQueryRef.current);
  }, [loadAuditPage]);

  const loadAuditDetail = useCallback(
    (rowId: string) => {
      if (auditDetails[rowId] || auditDetailLoading.has(rowId)) return;
      setAuditDetailErrors((current) => ({ ...current, [rowId]: false }));
      setAuditDetailLoading((current) => new Set(current).add(rowId));
      fetchStaticJson<DashboardRow>(`/data/audit/${encodeURIComponent(auditDataFileName(rowId))}`)
        .then((payload) => {
          setAuditDetails((current) => ({ ...current, [rowId]: payload }));
        })
        .catch(() => {
          setAuditDetailErrors((current) => ({ ...current, [rowId]: true }));
        })
        .finally(() => {
          setAuditDetailLoading((current) => {
            const next = new Set(current);
            next.delete(rowId);
            return next;
          });
        });
    },
    [auditDetailLoading, auditDetails],
  );

  const isLoading = homeLoading;
  const stats = [
    {
      strategy: "KEEP_TARGETS",
      label: zhTw.familyRetentionStrategy.KEEP_TARGETS,
      value: home
        ? families.filter((family) => family.retentionStrategy === "KEEP_TARGETS").length
        : null,
      icon: CheckCircle2,
    },
    {
      strategy: "SELECTIVE_KEEP",
      label: zhTw.familyRetentionStrategy.SELECTIVE_KEEP,
      value: home
        ? families.filter((family) => family.retentionStrategy === "SELECTIVE_KEEP").length
        : null,
      icon: CircleDot,
    },
    {
      strategy: "MOSTLY_TRANSFER",
      label: zhTw.familyRetentionStrategy.MOSTLY_TRANSFER,
      value: home
        ? families.filter((family) => family.retentionStrategy === "MOSTLY_TRANSFER").length
        : null,
      icon: Send,
    },
    {
      strategy: "HOLD_FOR_NOW",
      label: zhTw.familyRetentionStrategy.HOLD_FOR_NOW,
      value: home
        ? families.filter((family) => family.retentionStrategy === "HOLD_FOR_NOW").length
        : null,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="subtle-grid surface overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-[var(--primary)]">
            資料範圍 · #001～#{CURRENT_DATA_MAX_DEX}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            這隻寶可夢可以傳嗎？
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            輸入名稱或圖鑑編號，先看每隻與版本的「要留／符合條件才留／普通重複可傳」。
          </p>
          <p className="mt-2 text-xs font-semibold tracking-wide text-[var(--muted)]">
            資料更新日期：{DATA_VERSION_DATE_ZH_TW}（完整資料由瀏覽器載入）
          </p>
        </div>
        <form
          action="#evaluation-results"
          method="get"
          aria-label="直接搜尋寶可夢保留結論"
          className="mt-4 rounded-2xl border bg-[var(--surface)] p-3 shadow-sm sm:p-4"
        >
          <label htmlFor="home-pokemon-search" className="text-sm font-black">
            搜尋你剛抓到的寶可夢
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                size={20}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                id="home-pokemon-search"
                name="q"
                type="search"
                enterKeyHint="search"
                value={homeQuery}
                onChange={(event) => setHomeQuery(event.target.value)}
                placeholder="例如：妙蛙種子、皮卡丘或 025"
                className="min-h-12 w-full rounded-xl border bg-[var(--surface)] pl-11 pr-3 text-base"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-contrast)] transition hover:brightness-95"
            >
              直接看結論
            </button>
          </div>
        </form>
        <details className="mt-3 rounded-xl border bg-[var(--surface)] px-3 py-2.5">
          <summary className="cursor-pointer text-sm font-bold text-[var(--muted)]">
            依家族處理方式分類瀏覽
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map(({ strategy, label, value, icon: Icon }) => (
              <a
                key={strategy}
                href={`?decision=${strategy}#evaluation-results`}
                aria-label={`只看「${label}」的進化家族`}
                className="rounded-xl border bg-[var(--surface)] px-3 py-2.5 transition hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
                  <Icon aria-hidden size={15} />
                  {label}
                </div>
                <p
                  className="mt-1 font-mono text-xl font-black"
                  aria-label={value === null ? `${label}資料載入中` : undefined}
                >
                  {value ?? "—"}
                </p>
              </a>
            ))}
          </div>
        </details>
      </section>
      {homeError ? (
        <section className="surface rounded-2xl p-6 text-center">
          <p className="font-black">首頁資料載入失敗</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            搜尋與篩選介面仍可使用，請只重試首頁資料。
          </p>
          <button
            type="button"
            onClick={loadHome}
            className="mt-4 min-h-11 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-contrast)]"
          >
            重試首頁資料
          </button>
        </section>
      ) : null}
      <EvaluationBrowser
        families={families}
        referenceDate={home?.dataAsOf ?? `${DATA_VERSION_DATE_ISO}T00:00:00+08:00`}
        loading={isLoading}
        familyDetailErrors={familyDetailErrors}
        onLoadFamilyDetails={loadFamilyDetails}
        onRetryFamilyDetails={loadFamilyDetails}
        auditPage={auditPage}
        auditLoading={auditLoading}
        auditError={auditError}
        onLoadAuditPage={loadAuditPage}
        onRetryAudit={retryAudit}
        auditDetails={auditDetails}
        auditDetailLoading={auditDetailLoading}
        auditDetailErrors={auditDetailErrors}
        onLoadAuditDetail={loadAuditDetail}
      />
    </div>
  );
}
