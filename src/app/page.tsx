import { AlertTriangle, Database, Layers3, ShieldCheck } from "lucide-react";
import { EvaluationBrowser } from "@/components/evaluation-browser";
import { getDashboardRows, siteSnapshotManifest } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";

export default async function HomePage() {
  const rows = await getDashboardRows();
  const forms = buildFormOverviews(rows);
  const families = buildFamilyOverviews(forms);
  const stats = [
    { label: "進化家族", value: families.length, icon: Database },
    { label: "家族成員型態", value: forms.length, icon: Layers3 },
    {
      label: "建議保留家族",
      value: families.filter((family) => family.retentionStrategy === "KEEP_TARGETS").length,
      icon: ShieldCheck,
    },
    {
      label: "暫時保留家族",
      value: families.filter((family) => family.retentionStrategy === "HOLD_FOR_NOW").length,
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
            先看整個進化家族中該留哪個成員、版本與數字 IV 門檻；展開後再查看每個成員及
            BattleVariant。不同地區進化路徑仍分開，來源與完整論證保留在第二層。
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
        families={families}
        forms={forms}
        referenceDate={siteSnapshotManifest.dataAsOf ?? "2026-07-15T00:00:00+08:00"}
      />
    </div>
  );
}
