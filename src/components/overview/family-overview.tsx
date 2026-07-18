import { Fragment } from "react";
import { DatabaseZap } from "lucide-react";
import type { FamilyOverview as FamilyOverviewModel } from "@/presentation/family-overview";
import { CompactRating } from "./compact-rating";
import { FamilyIdentityCell } from "./family-identity-cell";
import { FamilyMemberPanel } from "./family-member-panel";
import { IvRecommendationDetails } from "./iv-recommendation";
import { RetentionDecisionBadge } from "./retention-decision-badge";
import { VariantBadges } from "./variant-badges";

export function FamilyOverview({
  families,
  expandedFamilies,
  expandedForms,
  onToggleFamily,
  onToggleForm,
}: {
  families: FamilyOverviewModel[];
  expandedFamilies: Set<string>;
  expandedForms: Set<string>;
  onToggleFamily: (familyId: string) => void;
  onToggleForm: (formId: string) => void;
}) {
  if (!families.length) {
    return (
      <div className="surface rounded-2xl p-10 text-center">
        <p className="font-black">目前沒有符合條件的進化家族</p>
        <p className="mt-2 text-sm text-[var(--muted)]">請調整搜尋或篩選條件。</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 xl:hidden" data-mobile-layout="family-cards">
        {families.map((family) => {
          const expanded = expandedFamilies.has(family.familyId);
          const controlsId = `family-mobile-${family.familyId}`;
          return (
            <article key={family.familyId} className="surface overflow-hidden rounded-2xl">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <FamilyIdentityCell
                    family={family}
                    expanded={expanded}
                    onToggle={() => onToggleFamily(family.familyId)}
                    controlsId={controlsId}
                  />
                  <RetentionDecisionBadge decision={family.decision} prominent />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  {family.members.map((member) => (
                    <span key={member.form.formId} className="rounded-full border px-2 py-1">
                      {member.form.nameZhTw}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <VariantBadges variants={family.releasedVariantKeys} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-muted)] p-3">
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">PvP</p>
                    <CompactRating overview={family.pvp} />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">PvE</p>
                    <CompactRating overview={family.pve} />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">道館</p>
                    <CompactRating overview={family.gym} />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">Mega／Max</p>
                    <CompactRating overview={family.megaMax} />
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6">
                  {family.decisionReason}
                </p>
                <div className="mt-3">
                  <IvRecommendationDetails
                    recommendations={family.ivRecommendations}
                    summaryLabel={
                      family.ivShortLabels.length > 1
                        ? "依成員用途分開保留"
                        : family.ivShortLabels[0]
                    }
                    fallbackLabel={family.ivShortLabels[0]}
                    fallbackDetail={family.ivSummaryZhTw}
                    compact
                  />
                </div>
                {family.hasDataIssues ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
                    <DatabaseZap aria-hidden size={13} /> 部分資料待補
                  </p>
                ) : null}
              </div>
              {expanded ? (
                <FamilyMemberPanel
                  family={family}
                  expandedForms={expandedForms}
                  onToggleForm={onToggleForm}
                  layoutPrefix="mobile"
                />
              ) : null}
            </article>
          );
        })}
      </div>

      <div
        className="surface hidden overflow-visible rounded-2xl xl:block"
        data-testid="family-overview-table"
      >
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[23%]" />
          </colgroup>
          <thead className="sticky top-16 z-30 bg-[var(--surface-muted)] text-xs tracking-wide text-[var(--muted)]">
            <tr>
              {["家族", "成員", "可用版本", "PvP", "PvE", "道館", "Mega／Max", "最終建議／IV"].map(
                (heading, index) => (
                  <th
                    key={heading}
                    scope="col"
                    className={`border-b px-3 py-3 font-black ${
                      index === 0 ? "sticky left-0 z-40 bg-[var(--surface-muted)]" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {families.map((family) => {
              const expanded = expandedFamilies.has(family.familyId);
              const controlsId = `family-desktop-${family.familyId}`;
              return (
                <Fragment key={family.familyId}>
                  <tr className="h-[104px] border-b align-top hover:bg-[var(--surface-muted)]/55">
                    <th scope="row" className="sticky left-0 z-10 bg-[var(--surface)] px-3 py-3">
                      <FamilyIdentityCell
                        family={family}
                        expanded={expanded}
                        onToggle={() => onToggleFamily(family.familyId)}
                        controlsId={controlsId}
                      />
                    </th>
                    <td className="px-3 py-3">
                      <p className="line-clamp-3 text-xs font-bold leading-5">
                        {family.members.map((member) => member.form.nameZhTw).join("、")}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <VariantBadges variants={family.releasedVariantKeys} />
                    </td>
                    <td className="px-3 py-3">
                      <CompactRating overview={family.pvp} />
                    </td>
                    <td className="px-3 py-3">
                      <CompactRating overview={family.pve} />
                    </td>
                    <td className="px-3 py-3">
                      <CompactRating overview={family.gym} />
                    </td>
                    <td className="px-3 py-3">
                      <CompactRating overview={family.megaMax} />
                    </td>
                    <td className="px-3 py-3">
                      <RetentionDecisionBadge decision={family.decision} prominent />
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5">
                        {family.decisionReason}
                      </p>
                      <div className="mt-2">
                        <IvRecommendationDetails
                          recommendations={family.ivRecommendations}
                          summaryLabel={
                            family.ivShortLabels.length > 1
                              ? "依成員用途分開保留"
                              : family.ivShortLabels[0]
                          }
                          fallbackLabel={family.ivShortLabels[0]}
                          fallbackDetail={family.ivSummaryZhTw}
                          compact
                        />
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr>
                      <td colSpan={8} className="border-b bg-[var(--surface-muted)]/45 p-0">
                        <FamilyMemberPanel
                          family={family}
                          expandedForms={expandedForms}
                          onToggleForm={onToggleForm}
                          layoutPrefix="desktop"
                        />
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
