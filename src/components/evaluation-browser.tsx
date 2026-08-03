"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { freshnessDays } from "@/config/freshness";
import type { DashboardRow } from "@/lib/data";
import { matchesPokemonSearch } from "@/lib/search";
import { zhTw } from "@/locales/zh-TW";
import type { FamilyOverview } from "@/presentation/family-overview";
import type { FormOverview } from "@/presentation/form-overview";
import { DataAuditTable } from "./overview/data-audit-table";
import { FamilyOverview as FamilyOverviewTable } from "./overview/family-overview";
import { QuickOverview } from "./overview/quick-overview";

export type ViewMode = "FAMILY" | "POKEDEX" | "AUDIT";

function matchesForm(form: FormOverview, query: string) {
  return matchesPokemonSearch(
    {
      dexNumber: form.dexNumber,
      nameEn: form.nameEn,
      nameZhTw: form.nameZhTw,
      formNameEn: form.formNameEn,
      formNameZhTw: form.formNameZhTw,
      aliases: form.aliases,
      evolutionNames: form.evolutionNames,
    },
    query,
  );
}

export function matchesFamilySearch(family: FamilyOverview, query: string) {
  return family.members.some((member) => matchesForm(member.form, query));
}

export function EvaluationBrowser({
  families,
  referenceDate,
  initialMode = "FAMILY",
}: {
  families: FamilyOverview[];
  referenceDate: string;
  initialMode?: ViewMode;
}) {
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState("ALL");
  const [variant, setVariant] = useState("ALL");
  const [valueFilter, setValueFilter] = useState("ALL");
  const [freshness, setFreshness] = useState("ALL");
  const [reviewed, setReviewed] = useState("ALL");
  const [sort, setSort] = useState("DEX_ASC");
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const forms = useMemo(
    () => [
      ...new Map(
        families.flatMap((family) =>
          family.members.map((member) => [member.form.formId, member.form] as const),
        ),
      ).values(),
    ],
    [families],
  );

  const searchMatches = useMemo(
    () => forms.filter((form) => matchesForm(form, query)),
    [forms, query],
  );

  const familySearchMatches = useMemo(
    () => families.filter((family) => matchesFamilySearch(family, query)),
    [families, query],
  );

  const familyRows = useMemo(
    () =>
      familySearchMatches
        .filter((family) => decision === "ALL" || family.retentionStrategy === decision)
        .filter(
          (family) =>
            variant === "ALL" ||
            family.releasedVariantKeys.includes(variant as DashboardRow["variantKey"]),
        )
        .filter((family) => {
          if (valueFilter === "PVP") return ["HIGH", "MEDIUM", "SPECIAL"].includes(family.pvp.tone);
          if (valueFilter === "PVE") return ["HIGH", "MEDIUM"].includes(family.pve.tone);
          if (valueFilter === "GYM") return ["HIGH", "MEDIUM", "SPECIAL"].includes(family.gym.tone);
          if (valueFilter === "MEGA_MAX") return family.megaMax.tone !== "NONE";
          return true;
        })
        .sort((a, b) => {
          if (sort === "DEX_DESC") return b.minDexNumber - a.minDexNumber;
          if (sort === "DECISION") {
            return a.retentionStrategy.localeCompare(b.retentionStrategy);
          }
          if (sort === "UPDATED") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
          return a.minDexNumber - b.minDexNumber || a.familyId.localeCompare(b.familyId);
        }),
    [decision, familySearchMatches, sort, valueFilter, variant],
  );

  const quickForms = useMemo(
    () =>
      searchMatches
        .filter((form) => decision === "ALL" || form.decision === decision)
        .filter(
          (form) =>
            variant === "ALL" ||
            form.releasedVariantKeys.includes(variant as DashboardRow["variantKey"]),
        )
        .filter((form) => {
          if (valueFilter === "PVP") return ["HIGH", "MEDIUM", "SPECIAL"].includes(form.pvp.tone);
          if (valueFilter === "PVE") return ["HIGH", "MEDIUM"].includes(form.pve.tone);
          if (valueFilter === "GYM") return ["HIGH", "MEDIUM", "SPECIAL"].includes(form.gym.tone);
          if (valueFilter === "MEGA_MAX") return form.megaMax.tone !== "NONE";
          return true;
        })
        .sort((a, b) => {
          if (sort === "DEX_DESC") return b.dexNumber - a.dexNumber;
          if (sort === "DECISION") return a.decision.localeCompare(b.decision);
          if (sort === "UPDATED") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
          return a.dexNumber - b.dexNumber || a.formId.localeCompare(b.formId);
        }),
    [decision, searchMatches, sort, valueFilter, variant],
  );

  const auditRows = useMemo(() => {
    const now = Date.parse(referenceDate);
    return searchMatches
      .flatMap((form) => form.variants.map((variantOverview) => variantOverview.row))
      .filter((row) => decision === "ALL" || row.decision === decision)
      .filter((row) => variant === "ALL" || row.variantKey === variant)
      .filter((row) => reviewed === "ALL" || row.reviewed === (reviewed === "YES"))
      .filter((row) => {
        if (valueFilter === "PVP") return row.raw.some((raw) => raw.category === "PVP");
        if (valueFilter === "PVE") return row.raw.some((raw) => raw.category === "PVE");
        if (valueFilter === "GYM") return row.gymRating !== "NOT_APPLICABLE";
        if (valueFilter === "MEGA_MAX") {
          return ["MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"].includes(row.variantKey);
        }
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
        if (sort === "UPDATED") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
        return a.dexNumber - b.dexNumber || a.formId.localeCompare(b.formId);
      });
  }, [decision, freshness, referenceDate, reviewed, searchMatches, sort, valueFilter, variant]);

  function toggleItem(id: string) {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFamily(id: string) {
    setExpandedFamilies((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeMode(nextMode: ViewMode) {
    setMode(nextMode);
    setDecision("ALL");
  }

  const selectClass =
    "min-h-11 w-full rounded-lg border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]";

  return (
    <section aria-labelledby="evaluations-heading" className="space-y-4">
      <div className="surface rounded-2xl p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div
            className="inline-flex w-fit flex-wrap rounded-xl border bg-[var(--surface-muted)] p-1"
            aria-label="顯示模式"
          >
            <button
              type="button"
              aria-pressed={mode === "FAMILY"}
              onClick={() => changeMode("FAMILY")}
              className={`min-h-11 rounded-lg px-4 text-sm font-black ${mode === "FAMILY" ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"}`}
            >
              家族總覽
            </button>
            <button
              type="button"
              aria-pressed={mode === "POKEDEX"}
              onClick={() => changeMode("POKEDEX")}
              className={`min-h-11 rounded-lg px-4 text-sm font-black ${mode === "POKEDEX" ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"}`}
            >
              單隻圖鑑
            </button>
            <button
              type="button"
              aria-pressed={mode === "AUDIT"}
              onClick={() => changeMode("AUDIT")}
              className={`min-h-11 rounded-lg px-4 text-sm font-black ${mode === "AUDIT" ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"}`}
            >
              資料審核
            </button>
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">
            {mode === "FAMILY"
              ? "先看家族保留結論，再展開成員與普通、暗影、Mega 及 Max 版本。"
              : mode === "POKEDEX"
                ? "依圖鑑型態逐隻查看精簡結論，所有地區型態維持分開。"
                : "逐一檢查各戰鬥版本的排名、狀態、來源與判斷軌跡。"}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
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
            <span className="sr-only">最終建議</span>
            <select
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有建議</option>
              {Object.entries(mode === "FAMILY" ? zhTw.familyRetentionStrategy : zhTw.decision).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            <span className="sr-only">戰鬥版本</span>
            <select
              value={variant}
              onChange={(event) => setVariant(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有可用版本</option>
              {Object.entries(zhTw.variantShort).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">主要用途</span>
            <select
              value={valueFilter}
              onChange={(event) => setValueFilter(event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有用途</option>
              <option value="PVP">PvP</option>
              <option value="PVE">PvE</option>
              <option value="GYM">道館</option>
              <option value="MEGA_MAX">Mega／Max</option>
            </select>
          </label>
          <label>
            <span className="sr-only">排序</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={selectClass}
            >
              <option value="DEX_ASC">圖鑑編號升冪</option>
              <option value="DEX_DESC">圖鑑編號降冪</option>
              <option value="UPDATED">最近更新</option>
              <option value="DECISION">最終建議</option>
            </select>
          </label>
        </div>

        {mode === "AUDIT" ? (
          <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 xl:max-w-xl">
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
              <span className="sr-only">資料維護狀態</span>
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
        ) : null}

        <h2 id="evaluations-heading" className="sr-only">
          寶可夢保留評估
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            顯示{" "}
            <strong className="text-[var(--foreground)]">
              {mode === "FAMILY"
                ? familyRows.length
                : mode === "POKEDEX"
                  ? quickForms.length
                  : auditRows.length}
            </strong>
            ／
            {mode === "FAMILY"
              ? families.length
              : mode === "POKEDEX"
                ? forms.length
                : forms.flatMap((form) => form.variants).length}{" "}
            {mode === "FAMILY" ? "個進化家族" : mode === "POKEDEX" ? "個寶可夢型態" : "個戰鬥版本"}
          </p>
          <a
            href="/exports/pokemon-go-retention-001-151.xlsx"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-contrast)] transition hover:brightness-95"
          >
            <Download aria-hidden size={17} />
            匯出 Excel
          </a>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{zhTw.disclaimer}</p>
      </div>

      {mode === "FAMILY" ? (
        <FamilyOverviewTable
          families={familyRows}
          expandedFamilies={expandedFamilies}
          expandedForms={expandedItems}
          onToggleFamily={toggleFamily}
          onToggleForm={toggleItem}
        />
      ) : mode === "POKEDEX" ? (
        <QuickOverview forms={quickForms} expanded={expandedItems} onToggle={toggleItem} />
      ) : (
        <DataAuditTable rows={auditRows} expanded={expandedItems} onToggle={toggleItem} />
      )}
    </section>
  );
}
