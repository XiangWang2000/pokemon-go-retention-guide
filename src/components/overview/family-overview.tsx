import { Fragment } from "react";
import { AlertTriangle, CircleCheckBig, CirclePause, SearchCheck, Send } from "lucide-react";
import type { FamilyOverview as FamilyOverviewModel } from "@/presentation/family-overview";
import { CompactRating } from "./compact-rating";
import { FamilyIdentityCell } from "./family-identity-cell";
import { FamilyMemberPanel } from "./family-member-panel";
import { VariantBadges } from "./variant-badges";

const useLabels: Record<string, string> = {
  GREAT_LEAGUE: "GL（超級聯盟）",
  ULTRA_LEAGUE: "UL（高級聯盟）",
  MASTER_LEAGUE: "ML（大師聯盟）",
  PVE: "PvE（團體戰）",
  SHADOW_PVE: "暗影 PvE（團體戰）",
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

const handlingMeta = {
  KEEP_TARGETS: {
    label: "先留再篩",
    icon: CircleCheckBig,
    containerClass: "border-emerald-600 bg-emerald-500/10",
    labelClass: "text-emerald-700 dark:text-emerald-300",
  },
  SELECTIVE_KEEP: {
    label: "只留符合條件者",
    icon: SearchCheck,
    containerClass: "border-blue-600 bg-blue-500/10",
    labelClass: "text-blue-700 dark:text-blue-300",
  },
  MOSTLY_TRANSFER: {
    label: "可直接清理",
    icon: Send,
    containerClass: "border-slate-500 bg-slate-500/10",
    labelClass: "text-slate-700 dark:text-slate-200",
  },
  HOLD_FOR_NOW: {
    label: "先不要傳",
    icon: CirclePause,
    containerClass: "border-amber-600 bg-amber-500/10",
    labelClass: "text-amber-800 dark:text-amber-200",
  },
} as const;

function FamilyHandlingConclusion({
  family,
  compact = false,
}: {
  family: FamilyOverviewModel;
  compact?: boolean;
}) {
  const { label, icon: Icon, containerClass, labelClass } = handlingMeta[family.retentionStrategy];
  const isMultiUseFamily = family.retentionStrategy === "KEEP_TARGETS";
  const summaryClauses = family.handlingSummaryZhTw.replace(/。$/, "").split("；");
  const transferClause = isMultiUseFamily ? summaryClauses.pop() : null;
  const keepClause = summaryClauses.join("；");
  const transferLabel = transferClause?.includes("特殊取得個體不以 IV 作傳送門檻")
    ? "特殊取得不可傳"
    : "其他普通重複可傳";
  return (
    <section
      data-testid="family-handling-summary"
      aria-label={`${family.familyNameZhTw}處理結論`}
      className={`rounded-xl border-l-4 p-3 ${containerClass}`}
    >
      <p className={`flex items-center gap-1.5 text-xs font-black tracking-wide ${labelClass}`}>
        <Icon aria-hidden size={16} />
        立即處理結論
        <span aria-hidden>｜</span>
        {label}
      </p>
      {isMultiUseFamily ? (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-[auto_1fr] sm:gap-2">
            <span className="w-fit rounded-md bg-emerald-700 px-2 py-0.5 text-xs font-black text-white">
              要保留的條件
            </span>
            <p
              data-testid="family-keep-condition"
              className={`font-black text-[var(--foreground)] ${
                compact ? "text-[15px] leading-6" : "text-lg leading-7"
              }`}
            >
              {keepClause}
            </p>
          </div>
          <div className="grid grid-cols-1 items-start gap-1.5 rounded-lg border border-slate-500/40 bg-[var(--surface)] px-2.5 py-2 sm:grid-cols-[auto_1fr] sm:gap-2">
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-black text-white">
              <Send aria-hidden size={13} />
              {transferLabel}
            </span>
            <p
              data-testid="family-transfer-condition"
              className={`font-black text-[var(--foreground)] ${
                compact ? "text-[13px] leading-5" : "text-base leading-6"
              }`}
            >
              {transferClause}
            </p>
          </div>
        </div>
      ) : (
        <p
          className={`mt-1 font-black text-[var(--foreground)] ${
            compact ? "text-[15px] leading-6" : "text-lg leading-7"
          }`}
        >
          {family.handlingSummaryZhTw}
        </p>
      )}
    </section>
  );
}

function FamilyTermGlossary() {
  const terms = [
    ["GL", "超級聯盟，CP 上限 1500"],
    ["UL", "高級聯盟，CP 上限 2500"],
    ["Rank", "同物種同聯盟的 IV 排名，數字越小越前"],
    ["PvE", "團體戰與道館攻擊"],
  ];
  return (
    <aside
      aria-label="常用術語速查"
      data-testid="family-term-glossary"
      className="surface rounded-2xl px-4 py-3"
    >
      <p className="text-xs font-black text-[var(--muted)]">術語速查</p>
      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5">
        {terms.map(([term, meaning]) => (
          <div key={term} className="flex gap-1.5">
            <dt className="font-black text-[var(--foreground)]">{term}</dt>
            <dd className="text-[var(--muted)]">＝{meaning}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

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
      <FamilyTermGlossary />

      <div className="mt-4 space-y-4 lg:hidden" data-mobile-layout="family-cards">
        {families.map((family) => {
          const expanded = expandedFamilies.has(family.familyId);
          const controlsId = `family-mobile-${family.familyId}`;
          return (
            <article key={family.familyId} className="surface overflow-hidden rounded-2xl">
              <div className="p-4 sm:p-5">
                <FamilyHandlingConclusion family={family} />

                <div className="mt-4">
                  <FamilyIdentityCell
                    family={family}
                    expanded={expanded}
                    onToggle={() => onToggleFamily(family.familyId)}
                    controlsId={controlsId}
                  />
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
        className="surface mt-4 hidden overflow-visible rounded-2xl lg:block"
        data-testid="family-overview-table"
      >
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[10%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead className="sticky top-16 z-30 bg-[var(--surface-muted)] text-xs tracking-wide text-[var(--muted)]">
            <tr>
              {[
                "家族",
                "成員",
                "可用版本",
                "PvP",
                "PvE",
                "道館",
                "Mega／Max",
                "先怎麼處理／IV",
              ].map((heading, index) => (
                <th
                  key={heading}
                  scope="col"
                  className={`border-b px-3 py-3 font-black ${index === 0 ? "sticky left-0 z-40 bg-[var(--surface-muted)]" : ""}`}
                >
                  {heading}
                </th>
              ))}
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
                      <FamilyHandlingConclusion family={family} compact />
                      <p className="mt-2 text-[11px] font-black text-[var(--muted)]">
                        主要保留：{family.primaryTargetSummaryZhTw}
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
