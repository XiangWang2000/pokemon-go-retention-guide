import type { Metadata } from "next";
import dashboardSnapshot from "../../../../site-data/dashboard.json";
import { PokemonDetailLoader } from "@/components/pokemon-detail-loader";
import type { StaticDashboardRow } from "@/lib/static-data";
import { variantLabelZhTw } from "@/presentation/variant-label";
import { pageMetadata } from "../../seo-metadata";

const dashboardRows = dashboardSnapshot as unknown as StaticDashboardRow[];

export function generateStaticParams() {
  return dashboardRows.map((row) => ({ variantId: row.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variantId: string }>;
}): Promise<Metadata> {
  const { variantId } = await params;
  const decodedVariantId = decodeURIComponent(variantId);
  const row = dashboardRows.find((item) => item.id === decodedVariantId);
  if (!row) {
    return pageMetadata({
      title: "寶可夢詳細資料",
      pathname: `/pokemon/${encodeURIComponent(decodedVariantId)}/`,
    });
  }

  const variantLabel = variantLabelZhTw(row.variantKey, row.formId);
  return pageMetadata({
    title: `${row.nameZhTw}（${row.formNameZhTw}）· ${variantLabel}`,
    description: `${row.reasonZhTw} 最終建議：${row.decision}。`,
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
