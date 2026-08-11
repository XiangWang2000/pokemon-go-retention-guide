import type { Metadata } from "next";
import auditSummarySnapshot from "../../../../site-data/auditSummary.json";
import { PokemonDetailLoader } from "@/components/pokemon-detail-loader";
import type { AuditSummarySnapshot } from "@/lib/audit-data";
import { variantLabelZhTw } from "@/presentation/variant-label";
import { pageMetadata } from "../../seo-metadata";

const auditRows = (auditSummarySnapshot as unknown as AuditSummarySnapshot).rows;

export function generateStaticParams() {
  return auditRows.map((row) => ({ variantId: row.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variantId: string }>;
}): Promise<Metadata> {
  const { variantId } = await params;
  const decodedVariantId = decodeURIComponent(variantId);
  const row = auditRows.find((item) => item.id === decodedVariantId);
  if (!row) {
    return pageMetadata({
      title: "寶可夢詳細資料",
      pathname: `/pokemon/${encodeURIComponent(decodedVariantId)}/`,
    });
  }

  const variantLabel = variantLabelZhTw(row.variantKey, row.formId);
  return pageMetadata({
    title: `${row.nameZhTw}（${row.formNameZhTw}）· ${variantLabel}`,
    description: `${row.nameZhTw}（${row.formNameZhTw}）${variantLabel}的 Pokémon GO 保留評估，最終建議：${row.decision}。`,
    pathname: `/pokemon/${encodeURIComponent(row.id)}/`,
  });
}

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ variantId: string }>;
}) {
  const { variantId } = await params;
  return <PokemonDetailLoader variantId={decodeURIComponent(variantId)} />;
}
