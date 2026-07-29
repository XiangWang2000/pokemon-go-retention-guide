import manifestSnapshot from "../../site-data/manifest.json";
import type {
  PrismaChangeLogRow,
  PrismaDashboardRow,
  PrismaReviewIssue,
  PrismaSourceRow,
  PrismaVariantDetailMeta,
} from "./data-prisma";

export const siteSnapshotManifest = manifestSnapshot;

export async function getDashboardRows() {
  const { default: snapshot } = await import("../../site-data/dashboard.json");
  return snapshot as unknown as PrismaDashboardRow[];
}

export type DashboardRow = PrismaDashboardRow;

export async function getVariantDetailMeta(
  _formId: string,
  variantId: string,
  _evaluationId: string | null,
) {
  void _formId;
  void _evaluationId;
  const { default: snapshot } = await import("../../site-data/details.json");
  const details = snapshot as unknown as Record<string, PrismaVariantDetailMeta>;
  return details[variantId] ?? { paths: [], conflicts: [], changeLogs: [] };
}

export async function getReviewIssues() {
  const { default: snapshot } = await import("../../site-data/review.json");
  return snapshot as unknown as PrismaReviewIssue[];
}

export async function getSources() {
  const { default: snapshot } = await import("../../site-data/sources.json");
  return snapshot as unknown as PrismaSourceRow[];
}

export async function getChangeLogs() {
  const { default: snapshot } = await import("../../site-data/changes.json");
  return snapshot as unknown as PrismaChangeLogRow[];
}
