"use client";

import { useEffect, useState } from "react";
import { fetchStaticJson } from "@/config/site";
import { PokemonDetailView } from "@/components/pokemon-detail-view";
import { auditDataFileName, familyDataFileName } from "@/lib/site-data-paths";
import type {
  StaticAuditPayload,
  StaticDashboardRow,
  StaticVariantDetail,
} from "@/lib/static-data";
import { buildFormOverview } from "@/presentation/form-overview";
import type { FamilyOverview } from "@/presentation/family-overview";

export function PokemonDetailLoader({ variantId }: { variantId: string }) {
  const [payload, setPayload] = useState<StaticAuditPayload | null>(null);
  const [family, setFamily] = useState<FamilyOverview | null>(null);
  const [detail, setDetail] = useState<StaticVariantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedVariantId, setLoadedVariantId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextPayload = await fetchStaticJson<StaticAuditPayload>(
          `/data/audit/${encodeURIComponent(auditDataFileName(variantId))}`,
        );
        if (cancelled) return;
        setPayload(nextPayload);

        const [familyIndex, nextDetail] = await Promise.all([
          fetchStaticJson<Record<string, string>>("/data/family-index.json"),
          fetchStaticJson<StaticVariantDetail>(
            `/data/details/${encodeURIComponent(auditDataFileName(variantId))}`,
          ),
        ]);
        const familyId = familyIndex[nextPayload.formId];
        if (!familyId) throw new Error("Family mapping is missing");

        const nextFamily = await fetchStaticJson<FamilyOverview>(
          `/data/families/${encodeURIComponent(familyDataFileName(familyId))}`,
        );
        if (!cancelled) {
          setFamily(nextFamily);
          setDetail(nextDetail);
          setError(null);
          setLoadedVariantId(variantId);
        }
      } catch {
        if (!cancelled) {
          setError("Static Pokémon detail data failed to load.");
          setLoadedVariantId(variantId);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [variantId]);

  if (loadedVariantId === variantId && error) {
    return (
      <section className="surface rounded-2xl p-8 text-center">
        <h1 className="text-xl font-black">Detail data failed to load</h1>
        <p className="mt-2 text-[var(--muted)]">{error}</p>
        <button
          type="button"
          className="mt-4 min-h-11 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-contrast)]"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </section>
    );
  }

  if (loadedVariantId !== variantId || !payload || !family || !detail) {
    return (
      <section className="surface rounded-2xl p-8 text-center" aria-live="polite">
        Loading Pokémon detail data...
      </section>
    );
  }

  const row = payload as StaticDashboardRow;
  const siblings = family.members.flatMap((member) =>
    member.form.variants.map((variant) => variant.row),
  );
  const sameFormRows = siblings.filter((item) => item.formId === row.formId);
  const formOverview = buildFormOverview(sameFormRows);
  const variantOverview = formOverview.variants.find((item) => item.row.id === row.id);
  if (!variantOverview) {
    return (
      <section className="surface rounded-2xl p-8 text-center">
        This form detail is unavailable.
      </section>
    );
  }

  return (
    <PokemonDetailView
      row={row}
      siblings={sameFormRows}
      detail={detail}
      variantOverview={variantOverview}
    />
  );
}
