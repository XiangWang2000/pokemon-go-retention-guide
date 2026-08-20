import type { DashboardRow } from "./data-read-model";
import type { getChangeLogs, getReviewIssues, getSources, getVariantDetailMeta } from "./data";

export type StaticDashboardRow = DashboardRow;

export type StaticAuditPayload = StaticDashboardRow;

export type StaticVariantDetail = Awaited<ReturnType<typeof getVariantDetailMeta>>;
export type StaticReviewIssue = Awaited<ReturnType<typeof getReviewIssues>>[number];
export type StaticSource = Awaited<ReturnType<typeof getSources>>[number];
export type StaticChangeLog = Awaited<ReturnType<typeof getChangeLogs>>[number];
