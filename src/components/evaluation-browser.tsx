"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { freshnessDays } from "@/config/freshness";
import type { DashboardRow } from "@/lib/data";
import { matchesPokemonGeneration, pokemonGenerationRanges } from "@/lib/pokemon-taxonomy";
import { matchesPokemonSearch } from "@/lib/search";
import { zhTw } from "@/locales/zh-TW";
import type { FamilyOverview } from "@/presentation/family-overview";
import type { FormOverview } from "@/presentation/form-overview";
import { DataAuditTable } from "./overview/data-audit-table";
import { FamilyOverview as FamilyOverviewTable } from "./overview/family-overview";
import { QuickOverview } from "./overview/quick-overview";

export type ViewMode = "FAMILY" | "POKEDEX" | "AUDIT";

const regionLabels: Record<string, string> = {
  KANTO: "關都",
  ALOLA: "阿羅拉",
  GALAR: "伽勒爾",
  HISUI: "洗翠",
  PALDEA: "帕底亞",
  OTHER: "其他",
};

const useLabels: Record<string, string> = {
  PVP: "PvP",
  PVE: "PvE",
  ROCKET: "火箭隊",
  GYM: "道館防守",
  MEGA: "Mega／Primal",
  MAX: "Max Battle",
  EVOLUTION: "後續進化",
};

const meaningfulTones = new Set(["HIGH", "MEDIUM", "SPECIAL", "REVIEW"]);
const rocketRatings = new Set(["HIGHLY_RECOMMENDED", "USEFUL", "NICHE"]);

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
  return (
    matchesPokemonSearch(
      {
        dexNumber: family.minDexNumber,
        nameEn: family.familyNameZhTw,
        nameZhTw: family.familyNameZhTw,
        formNameEn: "",
        formNameZhTw: "",
        aliases: family.primaryUses,
        evolutionNames: [],
      },
      query,
    ) || family.members.some((member) => matchesForm(member.form, query))
  );
}

function matchesRegion(regionKey: string, region: string) {
  return region === "ALL" || regionKey === region;
}

function hasRocketUse(row: DashboardRow) {
  return row.categoryStatuses.some(
    (status) => status.category === "ROCKET" && rocketRatings.has(status.rocketRating ?? ""),
  );
}

function matchesVariantUse(variant: FormOverview["variants"][number], use: string) {
  if (use === "ALL") return true;
  const keys = variant.primaryUseKeys as readonly string[];
  if (use === "PVP") {
    return ["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"].some((key) => keys.includes(key));
  }
  if (use === "PVE") {
    return keys.some((key) => ["PVE", "SHADOW_PVE"].includes(key));
  }
  if (use === "ROCKET") return variant.primaryUses.includes("火箭隊") || hasRocketUse(variant.row);
  if (use === "GYM") return keys.includes("GYM_DEFENSE");
  if (use === "MEGA") {
    return variant.row.variantKey.startsWith("MEGA") || keys.includes("MEGA");
  }
  if (use === "MAX") {
    return (
      ["DYNAMAX", "GIGANTAMAX"].includes(variant.row.variantKey) ||
      keys.some((key) => key.startsWith("MAX_"))
    );
  }
  if (use === "EVOLUTION") {
    return (
      variant.primaryUses.includes("後續進化") ||
      variant.row.evolutionSummaryZhTw.includes("後續進化")
    );
  }
  return false;
}

function matchesFormUse(form: FormOverview, use: string) {
  if (use === "ALL") return true;
  if (form.variants.some((variant) => matchesVariantUse(variant, use))) return true;
  if (use === "PVE") return meaningfulTones.has(form.pve.tone);
  if (use === "GYM") return meaningfulTones.has(form.gym.tone);
  if (use === "MEGA" || use === "MAX") return meaningfulTones.has(form.megaMax.tone);
  if (use === "EVOLUTION") return form.primaryUses.includes("後續進化");
  return false;
}

function matchesRowUse(row: DashboardRow, use: string) {
  if (use === "ALL") return true;
  if (use === "PVP") return row.raw.some((raw) => raw.category === "PVP");
  if (use === "PVE") {
    return row.categoryStatuses.some(
      (status) =>
        status.category === "PVE" &&
        ["CORE_INVESTMENT", "USABLE_OR_BUDGET", "SPECIAL_USE"].includes(status.pveUseLevel ?? ""),
    );
  }
  if (use === "ROCKET") return hasRocketUse(row);
  if (use === "GYM") return ["HIGH", "MEDIUM", "SPECIAL_CASE"].includes(row.gymRating);
  if (use === "MEGA") return row.variantKey.startsWith("MEGA");
  if (use === "MAX") return ["DYNAMAX", "GIGANTAMAX"].includes(row.variantKey);
  if (use === "EVOLUTION") return row.evolutionSummaryZhTw.includes("後續進化");
  return false;
}

function PaginationControls({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="結果分頁" className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="min-h-11 rounded-lg border px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
      >
        上一頁
      </button>
      <span className="min-w-20 text-center text-sm font-bold text-[var(--muted)]">
        第 {page}／{pageCount} 頁
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="min-h-11 rounded-lg border px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
      >
        下一頁
      </button>
    </nav>
  );
}

export function EvaluationBrowser({
  families,
  referenceDate,
  initialMode = "FAMILY",
  loading = false,
}: {
  families: FamilyOverview[];
  referenceDate: string;
  initialMode?: ViewMode;
  loading?: boolean;
}) {
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState("ALL");
  const [variant, setVariant] = useState("ALL");
  const [valueFilter, setValueFilter] = useState("ALL");
  const [generation, setGeneration] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [freshness, setFreshness] = useState("ALL");
  const [reviewed, setReviewed] = useState("ALL");
  const [sort, setSort] = useState("DEX_ASC");
  const [page, setPage] = useState(1);
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

  const regionOptions = useMemo(
    () =>
      [...new Set([...Object.keys(regionLabels), ...forms.map((form) => form.regionKey)])].sort(
        (left, right) => (regionLabels[left] ?? left).localeCompare(regionLabels[right] ?? right),
      ),
    [forms],
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
            family.members.some((member) =>
              member.form.variants.some((item) => item.row.variantKey === variant),
            ),
        )
        .filter((family) =>
          family.members.some(
            (member) =>
              matchesPokemonGeneration(member.form.dexNumber, generation) &&
              matchesRegion(member.form.regionKey, region),
          ),
        )
        .filter((family) =>
          family.members.some((member) => matchesFormUse(member.form, valueFilter)),
        )
        .sort((a, b) => {
          if (sort === "DEX_DESC") return b.minDexNumber - a.minDexNumber;
          if (sort === "DECISION") return a.retentionStrategy.localeCompare(b.retentionStrategy);
          if (sort === "UPDATED") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
          return a.minDexNumber - b.minDexNumber || a.familyId.localeCompare(b.familyId);
        }),
    [decision, familySearchMatches, generation, region, sort, valueFilter, variant],
  );

  const quickForms = useMemo(
    () =>
      searchMatches
        .filter((form) => decision === "ALL" || form.decision === decision)
        .filter(
          (form) =>
            variant === "ALL" || form.variants.some((item) => item.row.variantKey === variant),
        )
        .filter(
          (form) =>
            matchesPokemonGeneration(form.dexNumber, generation) &&
            matchesRegion(form.regionKey, region),
        )
        .filter((form) => matchesFormUse(form, valueFilter))
        .sort((a, b) => {
          if (sort === "DEX_DESC") return b.dexNumber - a.dexNumber;
          if (sort === "DECISION") return a.decision.localeCompare(b.decision);
          if (sort === "UPDATED") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
          return a.dexNumber - b.dexNumber || a.formId.localeCompare(b.formId);
        }),
    [decision, generation, region, searchMatches, sort, valueFilter, variant],
  );

  const auditRows = useMemo(() => {
    const now = Date.parse(referenceDate);
    return searchMatches
      .flatMap((form) =>
        form.variants.map((variantOverview) => ({ form, row: variantOverview.row })),
      )
      .filter(({ row }) => decision === "ALL" || row.decision === decision)
      .filter(({ row }) => variant === "ALL" || row.variantKey === variant)
      .filter(({ form }) => matchesPokemonGeneration(form.dexNumber, generation))
      .filter(({ form }) => matchesRegion(form.regionKey, region))
      .filter(({ form, row }) => {
        const variantOverview = form.variants.find((item) => item.row.id === row.id);
        return variantOverview
          ? matchesVariantUse(variantOverview, valueFilter)
          : matchesRowUse(row, valueFilter);
      })
      .filter(({ row }) => reviewed === "ALL" || row.reviewed === (reviewed === "YES"))
      .filter(({ row }) => {
        if (freshness === "ALL") return true;
        const stale =
          !row.updatedAt ||
          now - new Date(row.updatedAt).getTime() > freshnessDays.PVP * 86_400_000;
        return freshness === "STALE" ? stale : !stale;
      })
      .sort(({ row: left }, { row: right }) => {
        if (sort === "DEX_DESC") return right.dexNumber - left.dexNumber;
        if (sort === "DECISION") return left.decision.localeCompare(right.decision);
        if (sort === "UPDATED") return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
        return left.dexNumber - right.dexNumber || left.formId.localeCompare(right.formId);
      })
      .map(({ row }) => row);
  }, [
    decision,
    freshness,
    generation,
    referenceDate,
    region,
    reviewed,
    searchMatches,
    sort,
    valueFilter,
    variant,
  ]);

  const totalItems =
    mode === "FAMILY"
      ? familyRows.length
      : mode === "POKEDEX"
        ? quickForms.length
        : auditRows.length;
  const pageSize = mode === "FAMILY" ? 12 : mode === "POKEDEX" ? 24 : 40;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(page, pageCount);
  const start = (activePage - 1) * pageSize;
  const visibleFamilyRows = familyRows.slice(start, start + pageSize);
  const visibleQuickForms = quickForms.slice(start, start + pageSize);
  const visibleAuditRows = auditRows.slice(start, start + pageSize);

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
    setPage(1);
  }

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  const selectClass =
    "min-h-11 w-full rounded-lg border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]";
  const totalLabel =
    mode === "FAMILY" ? "個進化家族" : mode === "POKEDEX" ? "個寶可夢型態" : "個戰鬥版本";

  return (
    <section aria-labelledby="evaluations-heading" className="space-y-4">
      <div className="surface rounded-2xl p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
              ? "先看家族要留／可傳，再展開成員、型態與來源。"
              : mode === "POKEDEX"
                ? "依圖鑑型態逐隻查看精簡結論。"
                : "檢查各戰鬥版本的資料狀態與判斷軌跡。"}
          </p>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-8">
          <label className="relative md:col-span-2 xl:col-span-2">
            <span className="sr-only">搜尋圖鑑</span>
            <Search
              aria-hidden
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={query}
              onChange={(event) => changeFilter(setQuery, event.target.value)}
              placeholder="搜尋編號、名稱、型態或進化名稱"
              className="min-h-11 w-full rounded-lg border bg-[var(--surface)] pl-10 pr-3 text-base"
            />
          </label>
          <label>
            <span className="sr-only">保留狀態</span>
            <select
              value={decision}
              onChange={(event) => changeFilter(setDecision, event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有保留狀態</option>
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
            <span className="sr-only">世代</span>
            <select
              value={generation}
              onChange={(event) => changeFilter(setGeneration, event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有世代</option>
              {pokemonGenerationRanges.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">地區</span>
            <select
              value={region}
              onChange={(event) => changeFilter(setRegion, event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有地區</option>
              {regionOptions.map((key) => (
                <option key={key} value={key}>
                  {regionLabels[key] ?? key}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">用途</span>
            <select
              value={valueFilter}
              onChange={(event) => changeFilter(setValueFilter, event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有用途</option>
              {Object.entries(useLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">型態／版本</span>
            <select
              value={variant}
              onChange={(event) => changeFilter(setVariant, event.target.value)}
              className={selectClass}
            >
              <option value="ALL">所有型態／版本</option>
              {Object.entries(zhTw.variantShort).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">排序</span>
            <select
              value={sort}
              onChange={(event) => changeFilter(setSort, event.target.value)}
              className={selectClass}
            >
              <option value="DEX_ASC">圖鑑編號升冪</option>
              <option value="DEX_DESC">圖鑑編號降冪</option>
              <option value="UPDATED">最近更新</option>
              <option value="DECISION">保留狀態</option>
            </select>
          </label>
        </div>

        {mode === "AUDIT" ? (
          <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 xl:max-w-xl">
            <label>
              <span className="sr-only">資料新鮮度</span>
              <select
                value={freshness}
                onChange={(event) => changeFilter(setFreshness, event.target.value)}
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
                onChange={(event) => changeFilter(setReviewed, event.target.value)}
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
            {loading ? (
              "正在讀取資料…"
            ) : (
              <>
                顯示 <strong className="text-[var(--foreground)]">{totalItems}</strong>／
                {mode === "FAMILY"
                  ? families.length
                  : mode === "POKEDEX"
                    ? forms.length
                    : forms.flatMap((form) => form.variants).length}{" "}
                {totalLabel}
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PaginationControls page={activePage} pageCount={pageCount} onPageChange={setPage} />
            <a
              href="/exports/pokemon-go-retention-001-151.xlsx"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-contrast)] transition hover:brightness-95"
            >
              <Download aria-hidden size={17} />
              匯出 Excel
            </a>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{zhTw.disclaimer}</p>
      </div>

      {loading ? (
        <section
          className="surface rounded-2xl p-6"
          aria-busy="true"
          aria-live="polite"
          data-testid="home-data-loading"
        >
          <p className="font-black">正在載入保留指南資料…</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            搜尋與篩選框已可先使用，家族資料載入後會顯示結果。
          </p>
        </section>
      ) : mode === "FAMILY" ? (
        <FamilyOverviewTable
          families={visibleFamilyRows}
          expandedFamilies={expandedFamilies}
          expandedForms={expandedItems}
          onToggleFamily={toggleFamily}
          onToggleForm={toggleItem}
        />
      ) : mode === "POKEDEX" ? (
        <QuickOverview forms={visibleQuickForms} expanded={expandedItems} onToggle={toggleItem} />
      ) : (
        <DataAuditTable rows={visibleAuditRows} expanded={expandedItems} onToggle={toggleItem} />
      )}
    </section>
  );
}
