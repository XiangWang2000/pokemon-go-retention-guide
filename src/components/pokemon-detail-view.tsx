"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import { DomainGlossary } from "@/components/domain-glossary";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { variantLabelZhTw } from "@/presentation/variant-label";
import { zhTw } from "@/locales/zh-TW";
import { scopedCategoryDataNote } from "@/presentation/data-status";
import { buildFormOverview } from "@/presentation/form-overview";
import type { StaticDashboardRow, StaticVariantDetail } from "@/lib/static-data";

type PokemonDetailViewProps = {
  row: StaticDashboardRow;
  siblings: StaticDashboardRow[];
  detail: StaticVariantDetail;
  variantOverview: ReturnType<typeof buildFormOverview>["variants"][number];
};

export function PokemonDetailView({
  row,
  siblings,
  detail,
  variantOverview,
}: PokemonDetailViewProps) {
  const sections = [
    ["PvP 評估", row.pvpSummaryZhTw],
    ["PvE 團體戰", row.pveSummaryZhTw],
    ["火箭隊", row.rocketSummaryZhTw],
    ["道館防守", `${zhTw.gymRating[row.gymRating]}：${row.gymSummaryZhTw}`],
    ["Mega／Primal", row.megaSummaryZhTw],
    ["Max Battle", row.maxBattleSummaryZhTw],
    ["後續進化", row.evolutionSummaryZhTw],
    ["必要招式", row.requiredMovesSummaryZhTw],
    ["推薦 IV 方向", variantOverview.ivDirection],
  ] as const;
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold hover:bg-[var(--surface-muted)]"
      >
        <ArrowLeft aria-hidden size={17} />
        返回圖鑑評估
      </Link>
      <header className="surface rounded-3xl p-6 lg:p-8">
        <p className="font-mono text-sm text-[var(--muted)]">
          #{String(row.dexNumber).padStart(3, "0")} · {row.formId}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              {row.nameZhTw}（{row.formNameZhTw}）
            </h1>
            <p className="mt-1 text-[var(--muted)]">
              {row.nameEn} · {row.formNameEn} · {variantLabelZhTw(row.variantKey, row.formId)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {row.types.map((type) => (
                <span key={type} className="rounded-full border px-2 py-1 font-mono text-xs">
                  {zhTw.pokemonType[type as keyof typeof zhTw.pokemonType] ?? type}
                </span>
              ))}
            </div>
          </div>
          <StatusBadge decision={row.decision} />
        </div>
        <p className="mt-5 max-w-4xl text-lg leading-8">{row.reasonZhTw}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          信心程度：{zhTw.confidence[row.confidence]} · 規則版本：{row.rulesVersion} ·{" "}
          {zhTw.reviewStatus[row.reviewStatus]}
        </p>
        <p className="mt-2 text-sm font-bold text-[var(--accent)]">
          資料處置：
          {
            zhTw.assessmentDisposition[
              row.assessmentDisposition as keyof typeof zhTw.assessmentDisposition
            ]
          }
        </p>
        <p className="mt-2 text-sm font-bold">
          結論依據：{zhTw.evaluationProvenance[row.provenance]}
          {row.provenance === "MANUAL_CURATED"
            ? "（人工整理代表資料來源類型，不要求使用者自行判斷）"
            : ""}
        </p>
        <p className="mt-2 text-sm font-bold">推出狀態：{zhTw.releaseStatus[row.releaseStatus]}</p>
      </header>
      <section className="surface rounded-2xl p-5">
        <h2 className="text-xl font-black">各類別資料狀態</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {row.categoryStatuses.map((item) => (
            <article key={item.category} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black">
                  {zhTw.category[item.category as keyof typeof zhTw.category] ?? item.category}
                </h3>
                <span className="rounded-full border px-2 py-1 text-xs font-bold">
                  {zhTw.evaluationDataStatus[item.status as keyof typeof zhTw.evaluationDataStatus]}
                </span>
                {item.category === "PVE" && item.pveUseLevel ? (
                  <span className="rounded-full border border-[var(--accent)] px-2 py-1 text-xs font-bold text-[var(--accent)]">
                    {zhTw.pveUseLevel[item.pveUseLevel as keyof typeof zhTw.pveUseLevel]}
                  </span>
                ) : null}
              </div>
              {item.assessmentDisposition ? (
                <p className="mt-2 text-xs font-bold text-[var(--muted)]">
                  {
                    zhTw.assessmentDisposition[
                      item.assessmentDisposition as keyof typeof zhTw.assessmentDisposition
                    ]
                  }
                </p>
              ) : null}
              <p className="mt-2 text-xs font-bold text-[var(--muted)]">
                資料依據：{zhTw.evaluationProvenance[item.provenance]}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summaryZhTw}</p>
              {scopedCategoryDataNote(item) ? (
                <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  {scopedCategoryDataNote(item)}
                </p>
              ) : null}
              <p className="mt-2 text-xs font-bold">
                {item.materialToDecision
                  ? "此類別納入保留判斷；資料缺口會降低信心，但不會自動覆蓋結論"
                  : "此類別為補充資料，不會單獨阻止正式結論"}
              </p>
              {item.category === "MAX_BATTLE" && item.maxTypeTier ? (
                <p className="mt-2 text-xs leading-5">
                  屬性：
                  {item.maxTypeKey
                    ? (zhTw.pokemonType[item.maxTypeKey as keyof typeof zhTw.pokemonType] ??
                      item.maxTypeKey)
                    : "—"}
                  ；屬性內名次：
                  {item.maxTypeRank ? `#${item.maxTypeRank}` : "未提供"}；屬性 Tier：
                  {item.maxTypeTier}；整體評價：
                  {item.maxOverallRating
                    ? (zhTw.maxOverallRating[
                        item.maxOverallRating as keyof typeof zhTw.maxOverallRating
                      ] ?? item.maxOverallRating)
                    : "未提供"}
                  ；投資優先度：
                  {item.maxInvestmentRating
                    ? (zhTw.maxInvestmentRating[
                        item.maxInvestmentRating as keyof typeof zhTw.maxInvestmentRating
                      ] ?? item.maxInvestmentRating)
                    : "未提供"}
                  ；用途廣度：
                  {item.maxUseCaseBreadth
                    ? (zhTw.maxUseCaseBreadth[
                        item.maxUseCaseBreadth as keyof typeof zhTw.maxUseCaseBreadth
                      ] ?? item.maxUseCaseBreadth)
                    : "未提供"}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        {row.variantKey === "PURIFIED" ? (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6">
            <strong>淨化版本繼承：</strong>{" "}
            {zhTw.inheritanceMode[
              row.inheritance.inheritanceMode as keyof typeof zhTw.inheritanceMode
            ] ?? row.inheritance.inheritanceMode}
            ；基礎版本：
            {row.inheritance.inheritsFromVariantId ?? "未設定"}；報恩：
            {row.inheritance.hasReturnAccess ? "可取得" : "不可取得"}。
            <br />
            {row.inheritance.purificationRiskZhTw}
          </div>
        ) : null}
      </section>
      <DomainGlossary compact />
      <section className="surface rounded-2xl p-5">
        <h2 className="text-xl font-black">所有戰鬥版本</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {siblings.map((item) => (
            <Link
              key={item.id}
              href={`/pokemon/${encodeURIComponent(item.id)}`}
              className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-bold ${item.id === row.id ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "hover:bg-[var(--surface-muted)]"}`}
            >
              {variantLabelZhTw(item.variantKey, item.formId)} · {zhTw.decision[item.decision]}
            </Link>
          ))}
        </div>
      </section>
      <section className="surface rounded-2xl p-5">
        <h2 className="text-xl font-black">進化關係</h2>
        {detail.paths.length ? (
          <ul className="mt-4 space-y-3">
            {detail.paths.map((path) => (
              <li key={path.id} className="rounded-xl border p-4">
                <p className="font-bold">
                  {path.fromNameZhTw}（{path.fromFormNameZhTw}） → {path.toNameZhTw}（
                  {path.toFormNameZhTw}）
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{path.evolutionMethodZhTw}</p>
                <p className="mt-1 text-sm">{path.availabilityNotesZhTw}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {path.requiresEvent ? "需要活動條件" : "不需要活動條件"} · 驗證日期：
                  {path.verifiedAt
                    ? new Date(path.verifiedAt).toLocaleDateString("zh-TW")
                    : "尚待資料維護確認"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[var(--muted)]">本型態沒有已建立的進化路徑。</p>
        )}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map(([title, body]) => (
          <section key={title} className="surface rounded-2xl p-5">
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{body}</p>
          </section>
        ))}
      </div>
      <section className="surface rounded-2xl p-5">
        <h2 className="text-xl font-black">原始資料</h2>
        {row.raw.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)]">
                <tr>
                  {["類別", "聯盟", "排名／Tier", "推薦招式", "版本", "查閱日期", "原始備註"].map(
                    (h) => (
                      <th key={h} className="border-b px-3 py-2">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {row.raw.map((raw) => (
                  <tr key={raw.id} className="border-b align-top">
                    <td className="px-3 py-3">
                      {zhTw.category[raw.category as keyof typeof zhTw.category] ?? raw.category}
                    </td>
                    <td className="px-3 py-3">
                      {zhTw.league[raw.league as keyof typeof zhTw.league] ?? raw.league}
                    </td>
                    <td className="px-3 py-3 font-bold">
                      {raw.rank ? `#${raw.rank}` : (raw.tier ?? raw.rating ?? "—")}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {raw.recommendedMoves.join("／") || "—"}
                    </td>
                    <td className="px-3 py-3">{raw.seasonOrVersion}</td>
                    <td className="px-3 py-3">
                      {new Date(raw.checkedAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="max-w-md px-3 py-3 leading-6">{raw.rawNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-[var(--muted)]">
            目前沒有可驗證的原始資料；系統會依不可逆風險原則顯示暫定建議，並將缺口列入資料待補清單。
          </p>
        )}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface rounded-2xl p-5">
          <h2 className="text-xl font-black">資料來源</h2>
          <ul className="mt-4 space-y-4">
            {row.sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1 font-bold text-[var(--accent)] hover:underline"
                >
                  {source.title}
                  <ExternalLink aria-hidden size={15} className="mt-1" />
                </a>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {source.name} ·
                  {zhTw.sourceType[source.type as keyof typeof zhTw.sourceType] ?? source.type} ·
                  查閱 {new Date(source.accessedAt).toLocaleDateString("zh-TW")}
                </p>
                <p className="mt-1 text-sm">{source.usageZhTw}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="surface rounded-2xl p-5">
          <h2 className="text-xl font-black">規則引擎追蹤</h2>
          <ul className="mt-4 space-y-3">
            {row.traces.map((trace) => (
              <li key={trace.ruleKey} className="rounded-xl border p-3">
                <div className="flex justify-between gap-3">
                  <strong>{trace.ruleKey}</strong>
                  <span>{trace.matched ? "符合" : "不符合"}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  優先序 {trace.priority} · {trace.explanationZhTw}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface rounded-2xl p-5">
          <h2 className="text-xl font-black">資料衝突</h2>
          {detail.conflicts.length ? (
            <ul className="mt-4 space-y-3">
              {detail.conflicts.map((conflict) => (
                <li key={conflict.id} className="rounded-xl border p-3">
                  <p>{conflict.messageZhTw}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    偵測日期：{new Date(conflict.detectedAt).toLocaleDateString("zh-TW")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[var(--muted)]">目前沒有已記錄的來源衝突。</p>
          )}
        </section>
        <section className="surface rounded-2xl p-5">
          <h2 className="text-xl font-black">變更紀錄</h2>
          {detail.changeLogs.length ? (
            <ul className="mt-4 space-y-3">
              {detail.changeLogs.map((log) => (
                <li key={log.id} className="rounded-xl border p-3">
                  <p className="font-bold">
                    {log.fieldName}：{log.previousValue ?? "（無）"} → {log.newValue ?? "（無）"}
                  </p>
                  <p className="mt-1 text-sm">{log.changeReasonZhTw}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(log.changedAt).toLocaleDateString("zh-TW")} · {log.rulesVersion}
                  </p>
                  {log.source ? (
                    <a
                      href={log.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm font-bold text-[var(--accent)] hover:underline"
                    >
                      {log.source.title}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[var(--muted)]">目前沒有此型態或戰鬥版本的變更紀錄。</p>
          )}
        </section>
      </div>
      <aside className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6">
        {zhTw.disclaimer}
      </aside>
    </div>
  );
}
