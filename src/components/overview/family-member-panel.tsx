import { ChevronDown, ChevronRight } from "lucide-react";
import type { FamilyOverview } from "@/presentation/family-overview";
import { CompactRating } from "./compact-rating";
import { FormDetailPanel } from "./form-detail-panel";
import { IvRecommendationDetails } from "./iv-recommendation";
import { RetentionDecisionBadge } from "./retention-decision-badge";
import { VariantBadges } from "./variant-badges";

export function FamilyMemberPanel({
  family,
  expandedForms,
  onToggleForm,
  layoutPrefix,
  familyDetailError = false,
  onRetryFamilyDetails,
}: {
  family: FamilyOverview;
  expandedForms: Set<string>;
  onToggleForm: (formId: string) => void;
  layoutPrefix: "mobile" | "desktop";
  familyDetailError?: boolean;
  onRetryFamilyDetails?: () => void;
}) {
  return (
    <div
      id={`family-${layoutPrefix}-${family.familyId}`}
      className="space-y-3 p-4 lg:p-5"
      data-testid="family-member-panel"
    >
      {family.notices.length ? (
        <div className="rounded-xl border border-[var(--accent)]/35 bg-[var(--accent)]/10 p-3">
          <p className="text-xs font-black text-[var(--accent)]">成員例外</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {family.notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {family.detailsLoaded === false && familyDetailError ? (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm"
          data-testid="family-detail-error"
          aria-live="polite"
        >
          <p className="font-black">家族詳細資料載入失敗</p>
          <p className="mt-1 text-[var(--muted)]">其他家族不受影響，可單獨重試這個家族。</p>
          <button
            type="button"
            onClick={onRetryFamilyDetails}
            className="mt-3 min-h-11 rounded-lg border border-current px-3 text-sm font-bold"
          >
            重試家族詳細資料
          </button>
        </div>
      ) : null}

      {family.detailsLoaded === false && !familyDetailError ? (
        <div
          className="rounded-xl border bg-[var(--surface)] p-4 text-sm text-[var(--muted)]"
          data-testid="family-detail-loading"
          aria-live="polite"
        >
          正在載入 IV、版本、來源與完整論證資料…
        </div>
      ) : null}

      <div className="grid gap-3">
        {family.members.map((member) => {
          const form = member.form;
          const expanded = expandedForms.has(form.formId);
          const detailId = `member-${layoutPrefix}-${family.familyId}-${form.formId}`;
          return (
            <article
              key={form.formId}
              className="overflow-hidden rounded-2xl border bg-[var(--surface)]"
            >
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleForm(form.formId)}
                      aria-expanded={expanded}
                      aria-controls={detailId}
                      aria-label={`${expanded ? "收合" : "展開"}${form.nameZhTw}完整資料`}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                      {expanded ? (
                        <ChevronDown aria-hidden size={18} />
                      ) : (
                        <ChevronRight aria-hidden size={18} />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-[var(--primary)]">
                        #{String(form.dexNumber).padStart(3, "0")}
                      </p>
                      <h3 className="text-base font-black">
                        {form.nameZhTw}
                        {form.formNameZhTw !== "關都" ? `（${form.formNameZhTw}）` : ""}
                      </h3>
                      <p className="text-xs text-[var(--muted)]">{form.nameEn}</p>
                    </div>
                  </div>
                  <RetentionDecisionBadge decision={form.decision} prominent />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {member.roleLabelsZhTw.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-bold"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_1fr_1fr_1fr]">
                  <div>
                    <p className="text-[11px] font-bold text-[var(--muted)]">可用版本</p>
                    <div className="mt-1">
                      <VariantBadges variants={form.releasedVariantKeys} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--muted)]">PvP</p>
                    <CompactRating overview={form.pvp} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--muted)]">PvE／道館</p>
                    <p className="text-sm font-bold">
                      {form.pve.label} · {form.gym.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--muted)]">IV建議</p>
                    <div className="mt-1">
                      <IvRecommendationDetails
                        recommendations={member.ivRecommendations}
                        fallbackLabel={member.ivShortLabels[0]}
                        fallbackDetail={form.ivDirection}
                        compact
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {member.memberSummaryZhTw}
                </p>
              </div>
              {expanded && family.detailsLoaded !== false ? (
                <FormDetailPanel form={form} panelId={detailId} />
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
