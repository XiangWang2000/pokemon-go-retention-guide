import { AlertTriangle, Database, Layers3, ShieldCheck } from "lucide-react";
import { EvaluationBrowser } from "@/components/evaluation-browser";
import { getDashboardRows, siteSnapshotManifest } from "@/lib/data";
import { buildFormOverviews } from "@/presentation/form-overview";

export default async function HomePage() {
  const rows = await getDashboardRows();
  const forms = buildFormOverviews(rows);
  const stats = [
    { label: "圖鑑物種", value: new Set(forms.map((form) => form.dexNumber)).size, icon: Database },
    { label: "獨立型態", value: forms.length, icon: Layers3 },
    {
      label: "建議或條件保留",
      value: forms.filter(
        (form) => form.decision === "KEEP" || form.decision === "CONDITIONAL_KEEP",
      ).length,
      icon: ShieldCheck,
    },
    {
      label: "暫時保留版本",
      value: rows.filter((row) => row.decision === "HOLD_FOR_NOW").length,
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
            3 秒看懂：這隻寶可夢該不該留？
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            先看值得保留的版本、主要用途與 IV 方向；排名、來源及完整論證收進展開內容與資料審核模式。
            不同地區型態仍分開，所有 BattleVariant 評估也完整保留。
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
      <EvaluationBrowser
        forms={forms}
        referenceDate={siteSnapshotManifest.dataAsOf ?? "2026-07-15T00:00:00+08:00"}
      />
    </div>
  );
}
