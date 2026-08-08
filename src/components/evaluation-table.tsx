"use client";

import { ChevronDown, ChevronRight, Download, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CURRENT_DATA_SCOPE } from "@/config/data-scope";
import { freshnessDays } from "@/config/freshness";
import type { DashboardRow } from "@/lib/data";
import { matchesPokemonSearch } from "@/lib/search";
import { zhTw } from "@/locales/zh-TW";
import { scopedCategoryDataNote } from "@/presentation/data-status";
import { StatusBadge } from "./status-badge";

function rank(row: DashboardRow, league: "GREAT" | "ULTRA" | "MASTER") {
  return row.raw.find((raw) => raw.category === "PVP" && raw.league === league)?.rank ?? null;
}

function compact(text: string) {
  return text.length > 76 ? `${text.slice(0, 76)}…` : text;
}

function categoryStatus(row: DashboardRow, category: string) {
  return row.categoryStatuses.find((item) => item.category === category);
}

function categoryText(row: DashboardRow, category: string, summary: string) {
  const item = categoryStatus(row, category);
  const status = item
    ? zhTw.evaluationDataStatus[item.status as keyof typeof zhTw.evaluationDataStatus]
    : "尚未建立狀態";
  const level =
    category === "PVE" && item?.pveUseLevel
      ? zhTw.pveUseLevel[item.pveUseLevel as keyof typeof zhTw.pveUseLevel]
      : null;
  const disposition = item?.assessmentDisposition
    ? zhTw.assessmentDisposition[
        item.assessmentDisposition as keyof typeof zhTw.assessmentDisposition
      ]
    : null;
  const pendingNote = item ? scopedCategoryDataNote(item) : null;
  return `【${[level, disposition, status].filter(Boolean).join("／")}】${pendingNote ? `${pendingNote}；` : ""}${summary}`;
}

export function EvaluationTable({
  rows,
  referenceDate,
}: {
  rows: DashboardRow[];
  referenceDate: string;
}) {
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState("ALL");
  const [variant, setVariant] = useState("ALL");
  const [valueFilter, setValueFilter] = useState("ALL");
  const [freshness, setFreshness] = useState("ALL");
  const [reviewed, setReviewed] = useState("ALL");
  const [sort, setSort] = useState("DEX_ASC");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const now = Date.parse(referenceDate);
    return rows
      .filter((row) =>
        matchesPokemonSearch(
          {
            dexNumber: row.dexNumber,
            nameEn: row.nameEn,
            nameZhTw: row.nameZhTw,
            formNameEn: row.formNameEn,
            formNameZhTw: row.formNameZhTw,
            aliases: row.aliases,
            evolutionNames: row.evolutionNames,
          },
          query,
        ),
      )
      .filter((row) => decision === "ALL" || row.decision === decision)
      .filter((row) => variant === "ALL" || row.variantKey === variant)
      .filter((row) => reviewed === "ALL" || row.reviewed === (reviewed === "YES"))
      .filter((row) => {
        if (valueFilter === "PVP") return row.raw.some((raw) => raw.category === "PVP");
        if (valueFilter === "PVE") return row.raw.some((raw) => raw.category === "PVE");
        if (valueFilter === "GYM") return row.gymRating !== "NOT_APPLICABLE";
        return true;
      })
      .filter((row) => {
        if (freshness === "ALL") return true;
        const stale =
          !row.updatedAt ||
          now - new Date(row.updatedAt).getTime() > freshnessDays.PVP * 86_400_000;
        return freshness === "STALE" ? stale : !stale;
      })
      .sort((a, b) => {
        if (sort === "DEX_DESC") return b.dexNumber - a.dexNumber;
        if (sort === "DECISION") return a.decision.localeCompare(b.decision);
        if (sort === "UPDATED") {
          return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
        }
        return a.dexNumber - b.dexNumber || a.formId.localeCompare(b.formId);
      });
  }, [decision, freshness, query, referenceDate, reviewed, rows, sort, valueFilter, variant]);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectClass =
    "min-h-11 rounded-lg border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]";

  return (
    <section aria-labelledby="evaluations-heading" className="space-y-4">
      <div className="surface rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <label className="relative md:col-span-2 xl:col-span-2">
            <span className="sr-only">搜尋圖鑑</span>
            <Search
              aria-hidden
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋編號、中英文名稱、型態或進化名稱"
              className="min-h-11 w-full rounded-lg border bg-[var(--surface)] pl-10 pr-3 text-base"
            />
          </label>
          <label>
            <span className="sr-only">最終分類</span>
            <select
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有分類</option>
              {Object.entries(zhTw.decision).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">戰鬥版本</span>
            <select
              value={variant}
              onChange={(event) => setVariant(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有戰鬥版本</option>
              {Object.entries(zhTw.variant).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">用途資料</span>
            <select
              value={valueFilter}
              onChange={(event) => setValueFilter(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有用途</option>
              <option value="PVP">有 PvP 原始資料</option>
              <option value="PVE">有 PvE 原始資料</option>
              <option value="GYM">有道館評價</option>
            </select>
          </label>
          <label>
            <span className="sr-only">資料新鮮度</span>
            <select
              value={freshness}
              onChange={(event) => setFreshness(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有新鮮度</option>
              <option value="FRESH">90 天內更新</option>
              <option value="STALE">可能已過期</option>
            </select>
          </label>
          <label>
            <span className="sr-only">審核狀態</span>
            <select
              value={reviewed}
              onChange={(event) => setReviewed(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有審核狀態</option>
              <option value="YES">資料已確認</option>
              <option value="NO">部分資料待補</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <p id="evaluations-heading" className="text-sm text-[var(--muted)]" aria-live="polite">
            顯示 <strong className="text-[var(--foreground)]">{filtered.length}</strong>／
            {rows.length} 個戰鬥版本
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-[var(--muted)]">
              排序：{" "}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className={selectClass}
              >
                <option value="DEX_ASC">圖鑑編號升冪</option>
                <option value="DEX_DESC">圖鑑編號降冪</option>
                <option value="UPDATED">最近更新</option>
                <option value="DECISION">最終分類</option>
              </select>
            </label>
            <a
              href={`/exports/pokemon-go-retention-${CURRENT_DATA_SCOPE}.xlsx`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-contrast)] transition hover:brightness-95"
            >
              <Download aria-hidden size={17} />
              匯出 Excel
            </a>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center">
          <h2 className="text-lg font-bold">找不到符合條件的資料</h2>
          <p className="mt-2 text-[var(--muted)]">請縮短搜尋文字或清除部分篩選器。</p>
        </div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {filtered.map((row) => (
          <article key={row.id} className="surface rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-[var(--muted)]">
                  #{String(row.dexNumber).padStart(3, "0")}
                </p>
                <h2 className="text-lg font-bold">{row.nameZhTw}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {row.nameEn} · {row.formNameZhTw} · {zhTw.variant[row.variantKey]}
                </p>
              </div>
              <StatusBadge decision={row.decision} />
            </div>
            <p className="mt-4 text-sm leading-6">{row.reasonZhTw}</p>
            <button
              type="button"
              onClick={() => toggle(row.id)}
              className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-bold"
              aria-expanded={expanded.has(row.id)}
            >
              {expanded.has(row.id) ? (
                <ChevronDown aria-hidden size={17} />
              ) : (
                <ChevronRight aria-hidden size={17} />
              )}
              {expanded.has(row.id) ? "收合資料" : "展開資料"}
            </button>
            {expanded.has(row.id) ? <ExpandedContent row={row} /> : null}
          </article>
        ))}
      </div>

      <div className="surface hidden max-h-[72dvh] overflow-auto rounded-2xl md:block">
        <table className="min-w-[2600px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-20 bg-[var(--surface-muted)] text-xs tracking-wide text-[var(--muted)]">
            <tr>
              {[
                "展開",
                "圖鑑編號",
                "寶可夢",
                "型態",
                "戰鬥版本",
                "PvP 超級聯盟",
                "PvP 高級聯盟",
                "PvP 大師聯盟",
                "PvE 團體戰",
                "火箭隊",
                "道館防守",
                "Mega／Primal",
                "Max Battle",
                "後續進化",
                "必要招式",
                "推薦 IV 方向",
                "最終分類",
                "判斷理由",
                "信心程度",
                "更新日期",
                "審核狀態",
              ].map((heading) => (
                <th key={heading} className="border-b px-3 py-3 font-bold whitespace-nowrap">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <FragmentRow
                key={row.id}
                row={row}
                open={expanded.has(row.id)}
                toggle={() => toggle(row.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FragmentRow({
  row,
  open,
  toggle,
}: {
  row: DashboardRow;
  open: boolean;
  toggle: () => void;
}) {
  return (
    <>
      <tr className="border-b align-top hover:bg-[var(--surface-muted)]/70">
        <td className="px-3 py-3">
          <button
            type="button"
            onClick={toggle}
            className="grid size-11 cursor-pointer place-items-center rounded-lg border"
            aria-expanded={open}
            aria-label={`${open ? "收合" : "展開"}${row.nameZhTw}${zhTw.variant[row.variantKey]}資料`}
          >
            {open ? <ChevronDown aria-hidden size={18} /> : <ChevronRight aria-hidden size={18} />}
          </button>
        </td>
        <td className="px-3 py-3 font-mono">#{String(row.dexNumber).padStart(3, "0")}</td>
        <td className="px-3 py-3">
          <Link
            href={`/pokemon/${encodeURIComponent(row.id)}`}
            className="font-bold text-[var(--accent)] hover:underline"
          >
            {row.nameZhTw}
          </Link>
          <div className="text-xs text-[var(--muted)]">{row.nameEn}</div>
        </td>
        <td className="px-3 py-3">
          {row.formNameZhTw}
          <div className="text-xs text-[var(--muted)]">{row.formNameEn}</div>
        </td>
        <td className="px-3 py-3 font-semibold">
          {zhTw.variant[row.variantKey]}
          <div className="text-xs text-[var(--muted)]">{zhTw.releaseStatus[row.releaseStatus]}</div>
        </td>
        <RankCell value={rank(row, "GREAT")} />
        <RankCell value={rank(row, "ULTRA")} />
        <RankCell value={rank(row, "MASTER")} />
        <TextCell text={categoryText(row, "PVE", row.pveSummaryZhTw)} />
        <TextCell text={categoryText(row, "ROCKET", row.rocketSummaryZhTw)} />
        <td className="max-w-48 px-3 py-3">
          <strong>{zhTw.gymRating[row.gymRating]}</strong>
          <div className="mt-1 text-xs text-[var(--muted)]">
            {compact(categoryText(row, "GYM", row.gymSummaryZhTw))}
          </div>
        </td>
        <TextCell text={categoryText(row, "MEGA", row.megaSummaryZhTw)} />
        <TextCell text={categoryText(row, "MAX_BATTLE", row.maxBattleSummaryZhTw)} />
        <TextCell text={categoryText(row, "EVOLUTION_VALUE", row.evolutionSummaryZhTw)} />
        <TextCell text={row.requiredMovesSummaryZhTw} />
        <TextCell text={row.recommendedIvStrategyZhTw} />
        <td className="px-3 py-3">
          <StatusBadge decision={row.decision} />
        </td>
        <TextCell text={row.reasonZhTw} />
        <td className="px-3 py-3">{zhTw.confidence[row.confidence]}</td>
        <td className="px-3 py-3 font-mono text-xs">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString("zh-TW") : "—"}
        </td>
        <td className="px-3 py-3">{row.reviewed ? "已確認" : "尚未確認"}</td>
      </tr>
      {open ? (
        <tr className="border-b bg-[var(--surface-muted)]">
          <td colSpan={21} className="p-5">
            <ExpandedContent row={row} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RankCell({ value }: { value: number | null }) {
  return <td className="px-3 py-3 font-mono font-bold">{value ? `#${value}` : "—"}</td>;
}

function TextCell({ text }: { text: string }) {
  return <td className="max-w-48 px-3 py-3 leading-5 text-[var(--muted)]">{compact(text)}</td>;
}

function ExpandedContent({ row }: { row: DashboardRow }) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border bg-[var(--surface)] p-4 lg:col-span-3">
        <h3 className="font-bold">各類別資料狀態</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {row.categoryStatuses.map((item) => (
            <div key={item.category} className="rounded-lg border p-3 text-sm">
              <strong>{item.category}</strong>
              <span className="ml-2">
                {zhTw.evaluationDataStatus[item.status as keyof typeof zhTw.evaluationDataStatus]}
              </span>
              {item.category === "PVE" && item.pveUseLevel ? (
                <span className="ml-2 font-bold text-[var(--accent)]">
                  {zhTw.pveUseLevel[item.pveUseLevel as keyof typeof zhTw.pveUseLevel]}
                </span>
              ) : null}
              {item.assessmentDisposition ? (
                <span className="ml-2 text-xs text-[var(--muted)]">
                  {
                    zhTw.assessmentDisposition[
                      item.assessmentDisposition as keyof typeof zhTw.assessmentDisposition
                    ]
                  }
                </span>
              ) : null}
              <p className="mt-1 text-xs text-[var(--muted)]">
                {item.materialToDecision ? "會影響最終結論" : "不會單獨阻止正式結論"}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h3 className="font-bold">原始資料</h3>
        {row.raw.length ? (
          <ul className="mt-3 space-y-3">
            {row.raw.map((raw) => (
              <li key={raw.id} className="text-sm leading-6">
                <strong>
                  {raw.category}／{raw.league}
                </strong>
                ：{raw.rank ? `物種排名 #${raw.rank}` : (raw.tier ?? raw.rating ?? "摘要資料")}
                <br />
                <span className="text-[var(--muted)]">{raw.rawNotes}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            沒有可驗證的原始資料，已加入資料待補清單。
          </p>
        )}
      </section>
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h3 className="font-bold">資料來源</h3>
        {row.sources.length ? (
          <ul className="mt-3 space-y-3">
            {row.sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1 text-sm font-bold text-[var(--accent)] hover:underline"
                >
                  {source.title}
                  <ExternalLink aria-hidden size={14} className="mt-1 shrink-0" />
                </a>
                <p className="text-xs text-[var(--muted)]">
                  查閱：{new Date(source.accessedAt).toLocaleDateString("zh-TW")} ·{" "}
                  {source.usageZhTw}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            此結論尚無完整外部來源；若已有人工整理或繼承依據，仍可保留正式建議並降低信心。
          </p>
        )}
      </section>
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h3 className="font-bold">規則引擎判斷</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">版本：{row.rulesVersion}</p>
        <ul className="mt-3 space-y-2">
          {row.traces.map((trace) => (
            <li key={trace.ruleKey} className="flex gap-2 text-sm">
              <span aria-hidden>{trace.matched ? "●" : "○"}</span>
              <span>
                <strong>{trace.ruleKey}</strong>（優先序 {trace.priority}）<br />
                <span className="text-[var(--muted)]">{trace.explanationZhTw}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={`/pokemon/${encodeURIComponent(row.id)}`}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold text-[var(--accent)] hover:bg-[var(--surface-muted)]"
        >
          查看完整詳細頁 <ChevronRight aria-hidden size={17} />
        </Link>
      </section>
      <p className="text-xs leading-5 text-[var(--muted)] lg:col-span-3">{zhTw.disclaimer}</p>
    </div>
  );
}
