import manifestSnapshot from "../../site-data/manifest.json";
import type { DashboardRow } from "./data-read-model";
import type {
  PrismaChangeLogRow,
  PrismaReviewIssue,
  PrismaSourceRow,
  PrismaVariantDetailMeta,
} from "./data-prisma";

export type { DashboardRow } from "./data-read-model";

export const siteSnapshotManifest = manifestSnapshot;

type SerializedDashboardIvRecommendation = DashboardRow["ivRecommendations"][number] & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type SerializedDashboardRow = Omit<DashboardRow, "ivRecommendations"> & {
  ivRecommendations: SerializedDashboardIvRecommendation[];
};

/**
 * Older snapshots may still carry persistence-only IV audit timestamps. The
 * static reader removes them at this single JSON adapter boundary.
 */
function normalizeDashboardRows(value: unknown): DashboardRow[] {
  const rows = value as SerializedDashboardRow[];
  return rows.map(({ ivRecommendations, ...row }) => ({
    ...row,
    ivRecommendations: ivRecommendations.map(({ createdAt, updatedAt, ...recommendation }) => {
      void createdAt;
      void updatedAt;
      return recommendation;
    }),
  }));
}

export async function getDashboardRows(): Promise<DashboardRow[]> {
  const { default: snapshot } = await import("../../site-data/dashboard.json");
  return normalizeDashboardRows(snapshot);
}

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
