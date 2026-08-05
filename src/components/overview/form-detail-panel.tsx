import type { FormOverview } from "@/presentation/form-overview";
import { zhTw } from "@/locales/zh-TW";
import { EvaluationStatusBadge } from "./evaluation-status-badge";
import { IvRecommendationDetails } from "./iv-recommendation";
import { RetentionDecisionBadge } from "./retention-decision-badge";
import { ReviewIssuePanel } from "./review-issue-panel";
import { SourcePopover } from "./source-popover";
import { VariantDetailCard } from "./variant-detail-card";

function rank(variant: FormOverview["variants"][number], league: string) {
  return (
    variant.row.raw.find((item) => item.category === "PVP" && item.league === league)?.rank ?? null
  );
}

export function FormDetailPanel({ form, panelId }: { form: FormOverview; panelId?: string }) {
  const sources = [
    ...new Map(
      form.variants.flatMap((variant) => variant.row.sources).map((source) => [source.id, source]),
    ).values(),
  ];

  return (
    <div
      id={panelId ?? `form-detail-${form.formId}`}
      className="space-y-4 p-4 lg:p-6"
      data-testid="form-detail-panel"
    >
      <section className="rounded-2xl border bg-[var(--surface-muted)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-black">保留摘要</h3>
          <RetentionDecisionBadge decision={form.decision} prominent />
        </div>
        <p className="mt-3 font-semibold leading-6">{form.decisionReason}</p>
        <div className="mt-3 max-w-3xl">
          <IvRecommendationDetails
            recommendations={form.ivRecommendations}
            fallbackLabel={form.ivShortLabels[0]}
            fallbackDetail={form.ivDirection}
          />
        </div>
      </section>

      <details open className="rounded-2xl border bg-[var(--surface)] p-4">
        <summary className="cursor-pointer text-base font-black">各戰鬥版本</summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {form.variants.map((variant) => (
            <VariantDetailCard key={variant.row.id} variant={variant} />
          ))}
        </div>
      </details>

      <div className="grid gap-4 xl:grid-cols-2">
        <details className="rounded-2xl border bg-[var(--surface)] p-4">
          <summary className="cursor-pointer font-black">PvP</summary>
          <div className="mt-3 space-y-3">
            {form.variants.map((variant) => (
              <div
                key={variant.row.id}
                className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm"
              >
                <p className="font-bold">{zhTw.variant[variant.row.variantKey]}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  GL {rank(variant, "GREAT") ?? "—"} · UL {rank(variant, "ULTRA") ?? "—"} · ML{" "}
                  {rank(variant, "MASTER") ?? "—"}
                </p>
                <p className="mt-2 leading-6">{variant.row.pvpSummaryZhTw}</p>
              </div>
            ))}
          </div>
        </details>
        <details className="rounded-2xl border bg-[var(--surface)] p-4">
          <summary className="cursor-pointer font-black">PvE 與火箭隊</summary>
          <div className="mt-3 space-y-3">
            {form.variants.map((variant) => (
              <div
                key={variant.row.id}
                className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6"
              >
                <p className="font-bold">{zhTw.variant[variant.row.variantKey]}</p>
                <p className="mt-1">PvE：{variant.row.pveSummaryZhTw}</p>
                <p className="mt-1">火箭隊：{variant.row.rocketSummaryZhTw}</p>
              </div>
            ))}
          </div>
        </details>
        <details className="rounded-2xl border bg-[var(--surface)] p-4">
          <summary className="cursor-pointer font-black">道館</summary>
          <div className="mt-3 space-y-3">
            {form.variants.map((variant) => (
              <div
                key={variant.row.id}
                className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6"
              >
                <p className="font-bold">
                  {zhTw.variant[variant.row.variantKey]} · {zhTw.gymRating[variant.row.gymRating]}
                </p>
                <p className="mt-1">{variant.row.gymSummaryZhTw}</p>
              </div>
            ))}
          </div>
        </details>
        <details className="rounded-2xl border bg-[var(--surface)] p-4">
          <summary className="cursor-pointer font-black">Mega／Max Battle</summary>
          <div className="mt-3 space-y-3">
            {form.variants.map((variant) => (
              <div
                key={variant.row.id}
                className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm leading-6"
              >
                <p className="font-bold">{zhTw.variant[variant.row.variantKey]}</p>
                <p className="mt-1">Mega：{variant.row.megaSummaryZhTw}</p>
                <p className="mt-1">Max：{variant.row.maxBattleSummaryZhTw}</p>
              </div>
            ))}
          </div>
        </details>
        <details className="rounded-2xl border bg-[var(--surface)] p-4">
          <summary className="cursor-pointer font-black">進化與招式</summary>
          <div className="mt-3 space-y-3 text-sm leading-6">
            {form.variants.map((variant) => (
              <div key={variant.row.id} className="rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="font-bold">{zhTw.variant[variant.row.variantKey]}</p>
                <p className="mt-1">進化：{variant.row.evolutionSummaryZhTw}</p>
                <p className="mt-1">招式：{variant.row.requiredMovesSummaryZhTw}</p>
              </div>
            ))}
          </div>
        </details>
        <details className="rounded-2xl border bg-[var(--surface)] p-4">
          <summary className="cursor-pointer font-black">來源與資料狀態</summary>
          <div className="mt-3 space-y-4">
            {form.variants.map((variant) => (
              <div key={variant.row.id} className="rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="font-bold">{zhTw.variant[variant.row.variantKey]}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variant.row.categoryStatuses.map((status) => (
                    <span key={status.category} className="inline-flex items-center gap-1 text-xs">
                      {zhTw.category[status.category]}{" "}
                      <EvaluationStatusBadge status={status.status} />
                      {status.category === "PVE" && status.pveUseLevel ? (
                        <span className="font-bold text-[var(--accent)]">
                          {zhTw.pveUseLevel[status.pveUseLevel as keyof typeof zhTw.pveUseLevel]}
                        </span>
                      ) : null}
                      {status.assessmentDisposition ? (
                        <span className="text-[var(--muted)]">
                          {zhTw.assessmentDisposition[
                            status.assessmentDisposition as keyof typeof zhTw.assessmentDisposition
                          ]}
                        </span>
                      ) : null}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  結論依據：{zhTw.evaluationProvenance[variant.row.provenance]} · 信心：
                  {zhTw.confidence[variant.row.confidence]} · 更新：
                  {variant.row.updatedAt?.slice(0, 10) ?? "待確認"}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  類別依據：
                  {variant.row.categoryStatuses
                    .map(
                      (status) =>
                        `${zhTw.category[status.category]}=${zhTw.evaluationProvenance[status.provenance]}`,
                    )
                    .join("、")}
                </p>
                <div className="mt-3">
                  <ReviewIssuePanel row={variant.row} />
                </div>
              </div>
            ))}
            <SourcePopover sources={sources} />
          </div>
        </details>
      </div>
      <p className="text-xs leading-5 text-[var(--muted)]">{zhTw.disclaimer}</p>
    </div>
  );
}
