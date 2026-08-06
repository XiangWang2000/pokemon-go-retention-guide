import { HomeDataLoader } from "@/components/home-data-loader";
import { getDashboardRows, siteSnapshotManifest } from "@/lib/data";
import { buildHomeSnapshot } from "@/presentation/home-snapshot";
import { buildHomeSummary } from "@/presentation/home-summary";

export default async function HomePage() {
  const rows = await getDashboardRows();
  const home = buildHomeSnapshot(rows, siteSnapshotManifest.dataAsOf ?? null);
  return <HomeDataLoader initialSummary={buildHomeSummary(home)} />;
}
