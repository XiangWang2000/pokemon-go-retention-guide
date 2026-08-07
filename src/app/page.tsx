import homeSummarySnapshot from "../../site-data/homeSummary.json";
import { HomeDataLoader } from "@/components/home-data-loader";
import type { HomeSummary } from "@/presentation/home-summary";

export default function HomePage() {
  return <HomeDataLoader initialSummary={homeSummarySnapshot as unknown as HomeSummary} />;
}
