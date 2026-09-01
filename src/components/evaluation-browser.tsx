"use client";

import { ChevronDown, Download, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CURRENT_DATA_SCOPE } from "@/config/data-scope";
import { versionedAssetPath } from "@/config/site";
import type { AuditPageResponse, AuditQuery } from "@/lib/audit-data";
import type { DashboardRow } from "@/lib/data";
import {
  clearedEvaluationFilterState,
  countActiveAdvancedEvaluationControls,
  countActiveEvaluationFilters,
} from "@/lib/evaluation-filter-state";
import {
  decisionFilterValues,
  familyDecisionFilterValues,
  freshnessFilterValues,
  generationFilterValues,
  normalizeFilterValue,
  regionFilterValues,
  reviewedFilterValues,
  sortFilterValues,
  useFilterValues,
  variantFilterValues,
} from "@/lib/evaluation-filters";
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
  JOHTO: "城都",
  HOENN: "豐緣",
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
  const useKeys = new Set<string>(form.primaryUseKeys);
  if (use === "PVP") {
    return (
      ["GREAT_LEAGUE", "ULTRA_LEAGUE", "MASTER_LEAGUE"].some((key) => useKeys.has(key)) ||
      form.variants.some((variant) => matchesVariantUse(variant, use))
    );
  }
  if (use === "PVE") {
    return (
      ["PVE", "SHADOW_PVE"].some((key) => useKeys.has(key)) || meaningfulTones.has(form.pve.tone)
    );
  }
  if (use === "ROCKET")
    return form.hasRocketUse || form.variants.some((variant) => matchesVariantUse(variant, use));
  if (use === "GYM") return useKeys.has("GYM_DEFENSE") || meaningfulTones.has(form.gym.tone);
  if (use === "MEGA") return useKeys.has("MEGA") || meaningfulTones.has(form.megaMax.tone);
  if (use === "MAX") {
    return (
      ["MAX_ATTACK", "MAX_TANK", "MAX_SUPPORT", "MAX_FLEX"].some((key) => useKeys.has(key)) ||
      meaningfulTones.has(form.megaMax.tone)
    );
  }
  if (use === "EVOLUTION") return form.hasEvolutionUse || form.primaryUses.includes("後續進化");
  return false;
}

type BrowserUrlState = {
  mode: ViewMode;
  query: string;
  decision: string;
  variant: string;
  valueFilter: string;
  generation: string;
  region: string;
  freshness: string;
  reviewed: string;
  sort: string;
  page: number;
};

const managedUrlKeys = [
  "mode",
  "q",
  "decision",
  "variant",
  "use",
  "generation",
  "region",
  "freshness",
  "reviewed",
  "sort",
  "page",
] as const;

function readBrowserUrlState(initialMode: ViewMode): BrowserUrlState {
  const defaults: BrowserUrlState = {
    mode: initialMode,
    query: "",
    decision: "ALL",
    variant: "ALL",
    valueFilter: "ALL",
    generation: "ALL",
    region: "ALL",
    freshness: "ALL",
    reviewed: "ALL",
    sort: "DEX_ASC",
    page: 1,
  };
  if (typeof window === "undefined") return defaults;
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode")?.toUpperCase();
  const safeMode =
    mode === "POKEDEX" || mode === "AUDIT" || mode === "FAMILY" ? mode : defaults.mode;
  const page = Number(params.get("page"));
  return {
    mode: safeMode,
    query: params.get("q") ?? defaults.query,
    decision: normalizeFilterValue(
      params.get("decision"),
      safeMode === "FAMILY" ? familyDecisionFilterValues : decisionFilterValues,
      defaults.decision,
    ),
    variant: normalizeFilterValue(params.get("variant"), variantFilterValues, defaults.variant),
    valueFilter: normalizeFilterValue(params.get("use"), useFilterValues, defaults.valueFilter),
    generation: normalizeFilterValue(
      params.get("generation"),
      generationFilterValues,
      defaults.generation,
    ),
    region: normalizeFilterValue(params.get("region"), regionFilterValues, defaults.region),
    freshness: normalizeFilterValue(
      params.get("freshness"),
      freshnessFilterValues,
      defaults.freshness,
    ),
    reviewed: normalizeFilterValue(params.get("reviewed"), reviewedFilterValues, defaults.reviewed),
    sort: normalizeFilterValue(params.get("sort"), sortFilterValues, defaults.sort),
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : defaults.page,
  };
}

function writeBrowserUrl(state: BrowserUrlState, replace: boolean) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const key of managedUrlKeys) url.searchParams.delete(key);
  if (state.mode !== "FAMILY") url.searchParams.set("mode", state.mode.toLowerCase());
  if (state.query) url.searchParams.set("q", state.query);
  if (state.decision !== "ALL") url.searchParams.set("decision", state.decision);
  if (state.variant !== "ALL") url.searchParams.set("variant", state.variant);
  if (state.valueFilter !== "ALL") url.searchParams.set("use", state.valueFilter);
  if (state.generation !== "ALL") url.searchParams.set("generation", state.generation);
  if (state.region !== "ALL") url.searchParams.set("region", state.region);
  if (state.freshness !== "ALL") url.searchParams.set("freshness", state.freshness);
  if (state.reviewed !== "ALL") url.searchParams.set("reviewed", state.reviewed);
  if (state.sort !== "DEX_ASC") url.searchParams.set("sort", state.sort);
  if (state.page > 1) url.searchParams.set("page", String(state.page));
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  if (replace) window.history.replaceState({}, "", nextUrl);
  else window.history.pushState({}, "", nextUrl);
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
  initialMode = "FAMILY",
  loading = false,
  auditPage = null,
  auditLoading = false,
  auditError = false,
  onLoadAuditPage,
  onRetryAudit,
  auditDetails = {},
  auditDetailLoading = new Set<string>(),
  auditDetailErrors = {},
  onLoadAuditDetail,
  familyDetailErrors = {},
  onRetryFamilyDetails,
  onLoadFamilyDetails,
}: {
  families: FamilyOverview[];
  referenceDate: string;
  initialMode?: ViewMode;
  loading?: boolean;
  auditPage?: AuditPageResponse | null;
  auditLoading?: boolean;
  auditError?: boolean;
  onLoadAuditPage?: (query: AuditQuery) => void;
  onRetryAudit?: () => void;
  auditDetails?: Record<string, DashboardRow>;
  auditDetailLoading?: Set<string>;
  auditDetailErrors?: Record<string, boolean>;
  onLoadAuditDetail?: (rowId: string) => void;
  familyDetailErrors?: Record<string, boolean>;
  onRetryFamilyDetails?: (familyId: string) => void;
  onLoadFamilyDetails?: (familyId: string) => void;
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
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const urlReadyRef = useRef(false);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(1);

  const updateUrl = useCallback(
    (overrides: Partial<BrowserUrlState>, replace = true) => {
      if (!urlReadyRef.current) return;
      writeBrowserUrl(
        {
          mode,
          query,
          decision,
          variant,
          valueFilter,
          generation,
          region,
          freshness,
          reviewed,
          sort,
          page,
          ...overrides,
        },
        replace,
      );
    },
    [
      decision,
      freshness,
      generation,
      mode,
      page,
      query,
      region,
      reviewed,
      sort,
      valueFilter,
      variant,
    ],
  );

  useEffect(() => {
    const applyUrlState = () => {
      const next = readBrowserUrlState(initialMode);
      setMode(next.mode);
      setQuery(next.query);
      setDecision(next.decision);
      setVariant(next.variant);
      setValueFilter(next.valueFilter);
      setGeneration(next.generation);
      setRegion(next.region);
      setFreshness(next.freshness);
      setReviewed(next.reviewed);
      setSort(next.sort);
      setPage(next.page);
      setFiltersExpanded(
        countActiveAdvancedEvaluationControls(
          {
            variant: next.variant,
            valueFilter: next.valueFilter,
            generation: next.generation,
            region: next.region,
            freshness: next.freshness,
            reviewed: next.reviewed,
            sort: next.sort,
          },
          next.mode,
        ) > 0,
      );
      setExpandedFamilies(new Set());
      setExpandedItems(new Set());
      if (urlReadyRef.current) writeBrowserUrl(next, true);
    };

    applyUrlState();
    urlReadyRef.current = true;
    writeBrowserUrl(readBrowserUrlState(initialMode), true);
    window.addEventListener("popstate", applyUrlState);
    return () => window.removeEventListener("popstate", applyUrlState);
  }, [initialMode]);

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

  const formFamilyIds = useMemo(
    () =>
      new Map(
        families.flatMap((family) =>
          family.members.map((member) => [member.form.formId, family.familyId] as const),
        ),
      ),
    [families],
  );
  const formDetailErrors = useMemo(
    () =>
      Object.fromEntries(
        forms.map((form) => [
          form.formId,
          familyDetailErrors[formFamilyIds.get(form.formId) ?? ""] === true,
        ]),
      ),
    [formFamilyIds, forms, familyDetailErrors],
  );

  const retryFormDetails = useCallback(
    (formId: string) => {
      const familyId = formFamilyIds.get(formId);
      if (familyId) onRetryFamilyDetails?.(familyId);
    },
    [formFamilyIds, onRetryFamilyDetails],
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
            family.members.some((member) => member.form.variantKeys.some((key) => key === variant)),
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
        .filter((form) => variant === "ALL" || form.variantKeys.some((key) => key === variant))
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

  const totalItems =
    mode === "FAMILY"
      ? familyRows.length
      : mode === "POKEDEX"
        ? quickForms.length
        : (auditPage?.total ?? 0);
  const pageSize = mode === "FAMILY" ? 12 : mode === "POKEDEX" ? 24 : 40;
  const pageCount =
    mode === "AUDIT" && !auditPage
      ? Math.max(1, page)
      : Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = mode === "AUDIT" && !auditPage ? page : Math.min(page, pageCount);
  const start = (activePage - 1) * pageSize;
  const visibleFamilyRows = familyRows.slice(start, start + pageSize);
  const visibleQuickForms = quickForms.slice(start, start + pageSize);
  const visibleAuditRows = auditPage?.rows ?? [];
  const activeFilterCount = countActiveEvaluationFilters(
    { query, decision, variant, valueFilter, generation, region, freshness, reviewed },
    mode,
  );
  const activeAdvancedControlCount = countActiveAdvancedEvaluationControls(
    { variant, valueFilter, generation, region, freshness, reviewed, sort },
    mode,
  );

  const auditQuery = useMemo<AuditQuery>(
    () => ({
      query,
      decision,
      variant,
      use: valueFilter,
      generation,
      region,
      freshness,
      reviewed,
      sort,
      page: activePage,
      pageSize: 40,
    }),
    [
      activePage,
      decision,
      freshness,
      generation,
      query,
      region,
      reviewed,
      sort,
      valueFilter,
      variant,
    ],
  );
  const auditQueryKey = JSON.stringify(auditQuery);
  const lastAuditQueryRef = useRef("");

  useEffect(() => {
    if (mode !== "AUDIT" || !onLoadAuditPage || lastAuditQueryRef.current === auditQueryKey) {
      return;
    }
    lastAuditQueryRef.current = auditQueryKey;
    onLoadAuditPage(auditQuery);
  }, [auditQuery, auditQueryKey, mode, onLoadAuditPage]);

  useEffect(() => {
    if (previousPageRef.current !== activePage) {
      previousPageRef.current = activePage;
      resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (urlReadyRef.current && page !== activePage) {
      updateUrl({ page: activePage });
    }
  }, [activePage, page, updateUrl]);

  function resetExpandedState() {
    setExpandedFamilies(new Set());
    setExpandedItems(new Set());
  }

  function toggleItem(id: string) {
    if (mode === "AUDIT") {
      if (!auditDetails[id]) onLoadAuditDetail?.(id);
      setExpandedItems((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
    const form = forms.find((item) => item.formId === id);
    if (form?.detailsLoaded === false) {
      const family = families.find((item) =>
        item.members.some((member) => member.form.formId === id),
      );
      if (family) onLoadFamilyDetails?.(family.familyId);
    }
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFamily(id: string) {
    const family = families.find((item) => item.familyId === id);
    setExpandedFamilies((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (family?.detailsLoaded === false) onLoadFamilyDetails?.(id);
      }
      return next;
    });
  }

  function changePage(nextPage: number) {
    const safePage = Math.max(1, Math.min(pageCount, nextPage));
    if (safePage === activePage) return;
    setPage(safePage);
    resetExpandedState();
    updateUrl({ page: safePage }, false);
  }

  function changeMode(nextMode: ViewMode) {
    setMode(nextMode);
    setDecision("ALL");
    setPage(1);
    if (
      countActiveAdvancedEvaluationControls(
        { variant, valueFilter, generation, region, freshness, reviewed, sort },
        nextMode,
      ) > 0
    ) {
      setFiltersExpanded(true);
    }
    resetExpandedState();
    updateUrl({ mode: nextMode, decision: "ALL", page: 1 }, false);
  }

  function changeFilter(
    setter: (value: string) => void,
    key: Exclude<keyof BrowserUrlState, "mode" | "page">,
    value: string,
  ) {
    setter(value);
    setPage(1);
    resetExpandedState();
    updateUrl({ [key]: value, page: 1 }, key === "query");
  }

  function clearFilters() {
    const cleared = clearedEvaluationFilterState;
    setQuery(cleared.query);
    setDecision(cleared.decision);
    setVariant(cleared.variant);
    setValueFilter(cleared.valueFilter);
    setGeneration(cleared.generation);
    setRegion(cleared.region);
    setFreshness(cleared.freshness);
    setReviewed(cleared.reviewed);
    setPage(1);
    setFiltersExpanded(sort !== "DEX_ASC");
    resetExpandedState();
    updateUrl({ ...cleared, page: 1 }, false);
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
              onChange={(event) => changeFilter(setQuery, "query", event.target.value)}
              placeholder="搜尋編號、名稱、型態或進化名稱"
              className="min-h-11 w-full rounded-lg border bg-[var(--surface)] pl-10 pr-3 text-base"
            />
          </label>
          <label>
            <span className="sr-only">保留狀態</span>
            <select
              value={decision}
              onChange={(event) => changeFilter(setDecision, "decision", event.target.value)}
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
          <button
            type="button"
            aria-expanded={filtersExpanded}
            aria-controls={
              mode === "AUDIT"
                ? "evaluation-advanced-filters evaluation-audit-filters"
                : "evaluation-advanced-filters"
            }
            onClick={() => setFiltersExpanded((current) => !current)}
            className="flex min-h-11 items-center justify-between rounded-lg border bg-[var(--surface)] px-3 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] md:hidden"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden size={17} />
              篩選與排序
            </span>
            <span className="flex items-center gap-2">
              {activeAdvancedControlCount > 0 ? (
                <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-xs text-[var(--muted)]">
                  {activeAdvancedControlCount}
                </span>
              ) : null}
              <ChevronDown
                aria-hidden
                size={17}
                className={`transition-transform ${filtersExpanded ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          <div
            id="evaluation-advanced-filters"
            className={`${filtersExpanded ? "contents" : "hidden"} md:contents`}
          >
            <label>
              <span className="sr-only">世代</span>
              <select
                value={generation}
                onChange={(event) => changeFilter(setGeneration, "generation", event.target.value)}
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
                onChange={(event) => changeFilter(setRegion, "region", event.target.value)}
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
                onChange={(event) =>
                  changeFilter(setValueFilter, "valueFilter", event.target.value)
                }
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
                onChange={(event) => changeFilter(setVariant, "variant", event.target.value)}
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
                onChange={(event) => changeFilter(setSort, "sort", event.target.value)}
                className={selectClass}
              >
                <option value="DEX_ASC">圖鑑編號升冪</option>
                <option value="DEX_DESC">圖鑑編號降冪</option>
                <option value="UPDATED">最近更新</option>
                <option value="DECISION">保留狀態</option>
              </select>
            </label>
          </div>
        </div>

        {mode === "AUDIT" ? (
          <div
            id="evaluation-audit-filters"
            className={`${filtersExpanded ? "mt-3 grid" : "hidden"} gap-3 border-t pt-3 sm:grid-cols-2 md:mt-3 md:grid xl:max-w-xl`}
          >
            <label>
              <span className="sr-only">資料新鮮度</span>
              <select
                value={freshness}
                onChange={(event) => changeFilter(setFreshness, "freshness", event.target.value)}
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
                onChange={(event) => changeFilter(setReviewed, "reviewed", event.target.value)}
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
            ) : mode === "AUDIT" && !auditPage ? (
              auditError ? (
                "資料審核載入失敗"
              ) : (
                "正在載入資料…"
              )
            ) : (
              <>
                顯示 <strong className="text-[var(--foreground)]">{totalItems}</strong>／
                {mode === "FAMILY"
                  ? families.length
                  : mode === "POKEDEX"
                    ? forms.length
                    : (auditPage?.overallTotal ?? 0)}{" "}
                {totalLabel}
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                aria-label={`清除 ${activeFilterCount} 個篩選條件`}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-[var(--surface)] px-3 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
              >
                <RotateCcw aria-hidden size={16} />
                清除篩選
                <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-xs text-[var(--muted)]">
                  {activeFilterCount}
                </span>
              </button>
            ) : null}
            <PaginationControls page={activePage} pageCount={pageCount} onPageChange={changePage} />
            <a
              href={versionedAssetPath(`/exports/pokemon-go-retention-${CURRENT_DATA_SCOPE}.xlsx`)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-contrast)] transition hover:brightness-95"
            >
              <Download aria-hidden size={17} />
              匯出 Excel
            </a>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{zhTw.disclaimer}</p>
      </div>

      <div id="evaluation-results" ref={resultsTopRef} className="scroll-mt-24">
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
            familyDetailErrors={familyDetailErrors}
            onRetryFamilyDetails={onRetryFamilyDetails}
          />
        ) : mode === "POKEDEX" ? (
          <QuickOverview
            forms={visibleQuickForms}
            expanded={expandedItems}
            onToggle={toggleItem}
            detailErrors={formDetailErrors}
            onRetryDetail={retryFormDetails}
          />
        ) : (
          <DataAuditTable
            rows={visibleAuditRows}
            expanded={expandedItems}
            onToggle={toggleItem}
            loading={auditLoading || (!auditPage && !auditError)}
            error={auditError && !auditPage}
            onRetry={onRetryAudit}
            details={auditDetails}
            detailLoading={auditDetailLoading}
            detailErrors={auditDetailErrors}
            onRetryDetail={(id) => onLoadAuditDetail?.(id)}
          />
        )}
      </div>
      {pageCount > 1 ? (
        <div className="flex justify-center border-t pt-4">
          <PaginationControls page={activePage} pageCount={pageCount} onPageChange={changePage} />
        </div>
      ) : null}
    </section>
  );
}
