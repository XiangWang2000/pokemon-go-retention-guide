import { Fragment } from "react";
import { DatabaseZap } from "lucide-react";
import type { FormOverview } from "@/presentation/form-overview";
import { CompactRating } from "./compact-rating";
import { FormDetailPanel } from "./form-detail-panel";
import { IvRecommendationDetails } from "./iv-recommendation";
import { PokemonIdentityCell } from "./pokemon-identity-cell";
import { RetentionDecisionBadge } from "./retention-decision-badge";
import { SummaryCell } from "./summary-cell";
import { VariantBadges } from "./variant-badges";

function LazyDetailNotice() {
  return (
    <div
      className="border-t bg-[var(--surface-muted)]/45 p-4 text-sm text-[var(--muted)]"
      data-testid="lazy-detail-loading"
      aria-live="polite"
    >
      正在載入 IV、版本、來源與完整論證資料…
    </div>
  );
}

export function QuickOverview({
  forms,
  expanded,
  onToggle,
}: {
  forms: FormOverview[];
  expanded: Set<string>;
  onToggle: (formId: string) => void;
}) {
  if (!forms.length) {
    return (
      <div className="surface rounded-2xl p-10 text-center">
        <p className="font-black">找不到符合條件的寶可夢</p>
        <p className="mt-2 text-sm text-[var(--muted)]">請調整搜尋字詞或篩選條件。</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden" data-mobile-layout="cards">
        {forms.map((form) => {
          const isExpanded = expanded.has(form.formId);
          return (
            <article key={form.formId} className="surface overflow-hidden rounded-2xl">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <PokemonIdentityCell
                    form={form}
                    expanded={isExpanded}
                    onToggle={() => onToggle(form.formId)}
                    controlsId={`form-detail-mobile-${form.formId}`}
                  />
                  <div className="flex flex-col items-end gap-2">
                    <RetentionDecisionBadge decision={form.decision} prominent />
                    {form.hasDataIssues ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
                        <DatabaseZap aria-hidden size={13} />
                        部分資料待補
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4">
                  <VariantBadges variants={form.releasedVariantKeys} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[var(--surface-muted)] p-3">
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">PvP</p>
                    <CompactRating overview={form.pvp} />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">PvE</p>
                    <CompactRating overview={form.pve} />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">道館</p>
                    <CompactRating overview={form.gym} />
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <p className="w-20 shrink-0 text-xs font-bold text-[var(--muted)]">
                    Mega／Primal／Max
                  </p>
                  <CompactRating overview={form.megaMax} />
                </div>
                <div className="mt-4 border-t pt-4">
                  <SummaryCell text={form.decisionReason} />
                  <div className="mt-2">
                    <IvRecommendationDetails
                      recommendations={form.ivRecommendations}
                      fallbackLabel={form.ivShortLabels[0]}
                      fallbackDetail={form.ivDirection}
                      compact
                    />
                  </div>
                </div>
              </div>
              {isExpanded ? (
                form.detailsLoaded === false ? (
                  <LazyDetailNotice />
                ) : (
                  <FormDetailPanel form={form} panelId={`form-detail-mobile-${form.formId}`} />
                )
              ) : null}
            </article>
          );
        })}
      </div>

      <div
        className="surface hidden overflow-visible rounded-2xl lg:block"
        data-testid="quick-overview-table"
      >
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[13%]" />
            <col className="w-[9%]" />
            <col className="w-[12%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead className="sticky top-16 z-30 bg-[var(--surface-muted)] text-xs tracking-wide text-[var(--muted)]">
            <tr>
              {["寶可夢", "可用版本", "PvP", "PvE", "道館", "Mega／Primal／Max", "最終建議"].map(
                (heading, index) => (
                  <th
                    key={heading}
                    scope="col"
                    className={`border-b px-3 py-3 font-black ${index === 0 ? "sticky left-0 z-40 bg-[var(--surface-muted)]" : ""}`}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => {
              const isExpanded = expanded.has(form.formId);
              return (
                <Fragment key={form.formId}>
                  <tr className="h-[96px] border-b align-top hover:bg-[var(--surface-muted)]/55">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-[var(--surface)] px-3 py-2 group-hover:bg-[var(--surface-muted)]"
                    >
                      <PokemonIdentityCell
                        form={form}
                        expanded={isExpanded}
                        onToggle={() => onToggle(form.formId)}
                        controlsId={`form-detail-desktop-${form.formId}`}
                      />
                    </th>
                    <td className="px-3 py-2">
                      <VariantBadges variants={form.releasedVariantKeys} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={form.pvp} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={form.pve} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={form.gym} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={form.megaMax} />
                    </td>
                    <td className="px-3 py-2">
                      <RetentionDecisionBadge decision={form.decision} prominent />
                      <div className="mt-2">
                        <SummaryCell text={form.decisionReason} />
                      </div>
                      <div className="mt-1">
                        <IvRecommendationDetails
                          recommendations={form.ivRecommendations}
                          fallbackLabel={form.ivShortLabels[0]}
                          fallbackDetail={form.ivDirection}
                          compact
                        />
                      </div>
                      {form.hasDataIssues ? (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
                          <DatabaseZap aria-hidden size={13} />
                          部分資料待補
                        </p>
                      ) : null}
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr>
                      <td colSpan={7} className="border-b bg-[var(--surface-muted)]/45 p-0">
                        {form.detailsLoaded === false ? (
                          <LazyDetailNotice />
                        ) : (
                          <FormDetailPanel
                            form={form}
                            panelId={`form-detail-desktop-${form.formId}`}
                          />
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
