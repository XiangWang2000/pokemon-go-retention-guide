import dashboardSnapshot from "../../../../site-data/dashboard.json";
import { PokemonDetailLoader } from "@/components/pokemon-detail-loader";
import type { StaticDashboardRow } from "@/lib/static-data";

const dashboardRows = dashboardSnapshot as unknown as StaticDashboardRow[];

export function generateStaticParams() {
  return dashboardRows.map((row) => ({ variantId: row.id }));
}

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ variantId: string }>;
}) {
  const { variantId } = await params;
  return <PokemonDetailLoader variantId={decodeURIComponent(variantId)} />;
}
