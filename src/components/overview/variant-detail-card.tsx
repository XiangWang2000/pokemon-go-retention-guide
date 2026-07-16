import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { zhTw } from "@/locales/zh-TW";
import type { VariantOverview } from "@/presentation/form-overview";
import { RetentionDecisionBadge } from "./retention-decision-badge";

export function VariantDetailCard({ variant }: { variant: VariantOverview }) {
  const { row } = variant;
  return (
    <article className="rounded-2xl border bg-[var(--surface)] p-4" data-variant-id={row.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-black">{zhTw.variant[row.variantKey]}</h4>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {row.isReleased ? "已推出" : "尚未推出／待確認"}
          </p>
        </div>
        <RetentionDecisionBadge decision={row.decision} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-bold text-[var(--muted)]">主要用途</dt>
          <dd className="mt-1">{variant.primaryUses.join("、") || "無明確用途"}</dd>
        </div>
        <div>
          <dt className="font-bold text-[var(--muted)]">IV 方向</dt>
          <dd className="mt-1">{variant.ivDirection}</dd>
        </div>
        <div>
          <dt className="font-bold text-[var(--muted)]">一句理由</dt>
          <dd className="mt-1 leading-6">{variant.shortReason}</dd>
        </div>
      </dl>
      <Link
        href={`/pokemon/${row.id}`}
        className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-lg border px-3 text-sm font-bold text-[var(--accent)] hover:bg-[var(--surface-muted)]"
      >
        完整詳細資料 <ArrowUpRight aria-hidden size={15} />
      </Link>
    </article>
  );
}
