import { Fragment } from "react";
import { AlertTriangle } from "lucide-react";
import type { FamilyOverview as FamilyOverviewModel } from "@/presentation/family-overview";
import { CompactRating } from "./compact-rating";
import { FamilyIdentityCell } from "./family-identity-cell";
import { FamilyMemberPanel } from "./family-member-panel";
import { FamilyRetentionStrategyBadge, FamilyValueBadge } from "./family-strategy-badges";
import { VariantBadges } from "./variant-badges";

const useLabels: Record<string, string> = {
  GREAT_LEAGUE: "GL",
  ULTRA_LEAGUE: "UL",
  MASTER_LEAGUE: "ML",
  PVE: "PvE",
  SHADOW_PVE: "暗影 PvE",
  GYM_DEFENSE: "道館",
  MEGA: "Mega",
  MAX_ATTACK: "Max 攻擊",
  MAX_TANK: "Max 坦克",
  MAX_SUPPORT: "Max 支援",
  MAX_FLEX: "Max",
};

const variantLabels: Record<string, string> = {
  NORMAL: "普通",
  SHADOW: "暗影",
  MEGA: "Mega 候選",
  MEGA_X: "Mega 候選",
  MEGA_Y: "Mega 候選",
  DYNAMAX: "極巨",
  GIGANTAMAX: "超極巨",
};

function primaryUseSummary(family: FamilyOverviewModel) {
  if (!family.primaryRetentionTargets.length) return "未列為主要保留理由";
  return family.primaryRetentionTargets
    .map(
      (target) =>
        `${target.displayNameZhTw}：${target.useKeys.map((key) => useLabels[key] ?? key).join("／")}`,
    )
    .join("；");
}

function familyIvItems(family: FamilyOverviewModel) {
  return [
    ...new Map(
      family.members.flatMap((member) =>
        member.form.ivRecommendations.map((item) => {
          const versions = [
            ...new Set(
              member.form.variants
                .filter(
                  (variant) =>
                    ["KEEP", "CONDITIONAL_KEEP"].includes(variant.row.decision) &&
                    variant.primaryUseKeys.includes(item.primaryUseKey),
                )
                .map((variant) => variantLabels[variant.row.variantKey] ?? variant.row.variantKey),
            ),
          ];
          const label = `${member.form.nameZhTw}（${versions.join("／") || "指定版本"}）${item.shortIvLabelZhTw}`;
          return [
            `${member.form.formId}:${item.primaryUseKey}:${item.ivStrategyKey}`,
            { label, detail: item.ivRecommendationZhTw },
          ] as const;
        }),
      ),
    ).values(),
  ];
}

function FamilyIvSummary({ family }: { family: FamilyOverviewModel }) {
  const items = familyIvItems(family);
  if (!items.length) return <p className="text-sm font-bold">不構成額外保留理由</p>;
  const shown = items.slice(0, 3).map((item) => item.label);
  const hidden = items.length - shown.length;
  return (
    <details data-testid="iv-recommendation-details" className="group/iv">
      <summary className="cursor-pointer list-none rounded-lg font-bold leading-6 text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
        {shown.join("；")}
        {hidden > 0 ? `；另有 ${hidden} 項` : ""}
        <span className="ml-1 text-[var(--primary)]" aria-hidden>
          ＋
        </span>
      </summary>
      <div className="mt-3 space-y-3 border-t pt-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-sm font-black">{item.label}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

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
      <div className="space-y-4 lg:hidden" data-mobile-layout="family-cards">
        {families.map((family) => {
          const expanded = expandedFamilies.has(family.familyId);
          const controlsId = `family-mobile-${family.familyId}`;
          return (
            <article key={family.familyId} className="surface overflow-hidden rounded-2xl">
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <FamilyIdentityCell
                    family={family}
                    expanded={expanded}
                    onToggle={() => onToggleFamily(family.familyId)}
                    controlsId={controlsId}
                  />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <FamilyValueBadge value={family.familyValue} />
                    <FamilyRetentionStrategyBadge strategy={family.retentionStrategy} prominent />
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                    <dt className="text-xs font-black text-[var(--muted)]">主要留</dt>
                    <dd className="mt-1 text-base font-black">{family.primaryTargetSummaryZhTw}</dd>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                    <dt className="text-xs font-black text-[var(--muted)]">用途</dt>
                    <dd className="mt-1 text-sm font-bold leading-6">
                      {primaryUseSummary(family)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3 lg:col-span-2">
                    <dt className="text-xs font-black text-[var(--muted)]">數字 IV 門檻</dt>
                    <dd className="mt-1">
                      <FamilyIvSummary family={family} />
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-sm font-semibold leading-6">{family.actionSummaryZhTw}</p>
                {family.hasCriticalDataIssues ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300">
                    <AlertTriangle aria-hidden size={15} /> 關鍵資料待確認
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => onToggleFamily(family.familyId)}
                  aria-expanded={expanded}
                  aria-controls={controlsId}
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-black transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  {expanded ? "收合完整用途與版本" : "查看完整用途與版本"}
                </button>
              </div>

              {expanded ? (
                <div className="border-t bg-[var(--surface-muted)]/45">
                  <FamilyMemberPanel
                    family={family}
                    expandedForms={expandedForms}
                    onToggleForm={onToggleForm}
                    layoutPrefix="mobile"
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div
        className="surface hidden overflow-visible rounded-2xl lg:block"
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
                    className={`border-b px-3 py-3 font-black ${index === 0 ? "sticky left-0 z-40 bg-[var(--surface-muted)]" : ""}`}
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
                  <tr className="h-[96px] border-b align-top hover:bg-[var(--surface-muted)]/55">
                    <th scope="row" className="sticky left-0 z-10 bg-[var(--surface)] px-3 py-2">
                      <FamilyIdentityCell
                        family={family}
                        expanded={expanded}
                        onToggle={() => onToggleFamily(family.familyId)}
                        controlsId={controlsId}
                      />
                    </th>
                    <td className="px-3 py-2">
                      <p className="line-clamp-3 text-xs font-bold leading-5">
                        {family.members.map((member) => member.form.nameZhTw).join("、")}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <VariantBadges variants={family.releasedVariantKeys} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={family.pvp} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={family.pve} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={family.gym} />
                    </td>
                    <td className="px-3 py-2">
                      <CompactRating overview={family.megaMax} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        <FamilyValueBadge value={family.familyValue} />
                        <FamilyRetentionStrategyBadge
                          strategy={family.retentionStrategy}
                          prominent
                        />
                      </div>
                      <p className="mt-2 text-[11px] font-black text-[var(--muted)]">
                        主要保留：{family.primaryTargetSummaryZhTw}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5">
                        {family.actionSummaryZhTw}
                      </p>
                      <div className="mt-2">
                        <FamilyIvSummary family={family} />
                      </div>
                      {family.hasCriticalDataIssues ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-black text-amber-700 dark:text-amber-300">
                          <AlertTriangle aria-hidden size={13} /> 關鍵資料待確認
                        </p>
                      ) : null}
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
