import changesSnapshot from "../../site-data/changes.json";
import dashboardSnapshot from "../../site-data/dashboard.json";
import detailsSnapshot from "../../site-data/details.json";
import manifestSnapshot from "../../site-data/manifest.json";
import reviewSnapshot from "../../site-data/review.json";
import sourcesSnapshot from "../../site-data/sources.json";
import type {
  PrismaChangeLogRow,
  PrismaDashboardRow,
  PrismaReviewIssue,
  PrismaSourceRow,
  PrismaVariantDetailMeta,
} from "./data-prisma";

const dashboard = dashboardSnapshot as unknown as PrismaDashboardRow[];
const details = detailsSnapshot as unknown as Record<string, PrismaVariantDetailMeta>;
const review = reviewSnapshot as unknown as PrismaReviewIssue[];
const sources = sourcesSnapshot as unknown as PrismaSourceRow[];
const changes = changesSnapshot as unknown as PrismaChangeLogRow[];

export const siteSnapshotManifest = manifestSnapshot;

export async function getDashboardRows() {
  return dashboard;
}

export type DashboardRow = PrismaDashboardRow;

export async function getVariantDetailMeta(
  _formId: string,
  variantId: string,
  _evaluationId: string | null,
) {
  void _formId;
  void _evaluationId;
  return details[variantId] ?? { paths: [], conflicts: [], changeLogs: [] };
}

export async function getReviewIssues() {
  return review;
}

export async function getSources() {
  return sources;
}

export async function getChangeLogs() {
  return changes;
}
