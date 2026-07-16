import { AlertTriangle, Database, Layers3, ShieldCheck } from "lucide-react";
import { EvaluationTable } from "@/components/evaluation-table";
import { getDashboardRows, siteSnapshotManifest } from "@/lib/data";

export default async function HomePage() {
  const rows = await getDashboardRows();
  const stats = [
    { label: "圖鑑物種", value: new Set(rows.map((row) => row.dexNumber)).size, icon: Database },
    { label: "獨立型態", value: new Set(rows.map((row) => row.formId)).size, icon: Layers3 },
    {
      label: "建議或條件保留",
      value: rows.filter((row) => row.decision === "KEEP" || row.decision === "CONDITIONAL_KEEP")
        .length,
      icon: ShieldCheck,
    },
    {
      label: "需要重新確認",
      value: rows.filter((row) => row.decision === "NEEDS_REVIEW").length,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="subtle-grid surface overflow-hidden rounded-3xl p-6 lg:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-[var(--primary)]">
            第一批研究 · #001～#030
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Pokémon GO 寶可夢保留價值指南
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            以型態與戰鬥版本為單位，分開保存原始資料、來源及規則推導結論。第一版不讀取個人背包，也不因漂亮
            IV 自動判定保留。
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                <Icon aria-hidden size={17} />
                {label}
              </div>
              <p className="mt-2 font-mono text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <EvaluationTable
        rows={rows}
        referenceDate={siteSnapshotManifest.dataAsOf ?? "2026-07-15T00:00:00+08:00"}
      />
    </div>
  );
}
