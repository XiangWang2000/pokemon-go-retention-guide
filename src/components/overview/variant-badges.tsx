import { zhTw } from "@/locales/zh-TW";
import type { FormOverview } from "@/presentation/form-overview";

export function VariantBadges({ variants }: { variants: FormOverview["releasedVariantKeys"] }) {
  if (!variants.length) return <span className="text-sm text-[var(--muted)]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="已推出戰鬥版本">
      {variants.map((variant) => (
        <span
          key={variant}
          className="inline-flex rounded-full border bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-bold whitespace-nowrap"
        >
          {zhTw.variantShort[variant]}
        </span>
      ))}
    </div>
  );
}
