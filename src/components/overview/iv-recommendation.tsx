import type { IvRecommendation } from "@/iv/strategy";

export function IvRecommendationDetails({
  recommendations,
  summaryLabel,
  fallbackLabel,
  fallbackDetail,
  compact = false,
}: {
  recommendations: IvRecommendation[];
  summaryLabel?: string;
  fallbackLabel?: string;
  fallbackDetail?: string;
  compact?: boolean;
}) {
  const labels = [...new Set(recommendations.map((item) => item.shortIvLabelZhTw))];
  const summary =
    summaryLabel ?? (labels.length ? labels.join(" ・ ") : (fallbackLabel ?? "IV 尚無具體建議"));
  return (
    <details className="group/iv" data-testid="iv-recommendation-details">
      <summary
        className={`cursor-pointer list-none rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          compact ? "px-2 py-1 text-[11px] leading-4" : "min-h-11 px-3 py-2 text-sm"
        }`}
      >
        {summary}
        <span className="ml-1 text-[var(--muted)]" aria-hidden>
          ＋
        </span>
      </summary>
      <div className="mt-2 space-y-2 rounded-xl border bg-[var(--surface)] p-3 text-xs leading-5">
        {recommendations.length ? (
          recommendations.map((item) => (
            <div key={`${item.primaryUseKey}-${item.ivStrategyKey}`}>
              <p className="font-black">{item.shortIvLabelZhTw}</p>
              <p className="mt-1 text-[var(--muted)]">{item.ivRecommendationZhTw}</p>
              {item.speciesSpecificOverride && item.overrideReasonZhTw ? (
                <p className="mt-1 font-bold text-[var(--accent)]">
                  物種覆寫：{item.overrideReasonZhTw}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-[var(--muted)]">
            {fallbackDetail ?? "即使100%，也不能在物種缺乏戰鬥用途時單靠IV成為保留理由。"}
          </p>
        )}
      </div>
    </details>
  );
}
