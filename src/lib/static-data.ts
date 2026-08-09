import type {
  PrismaChangeLogRow,
  PrismaDashboardRow,
  PrismaReviewIssue,
  PrismaSourceRow,
  PrismaVariantDetailMeta,
} from "./data-prisma";

export type StaticDashboardRow = PrismaDashboardRow;

export type StaticAuditPayload = StaticDashboardRow;

export type StaticVariantDetail = PrismaVariantDetailMeta;
export type StaticReviewIssue = PrismaReviewIssue;
export type StaticSource = PrismaSourceRow;
export type StaticChangeLog = PrismaChangeLogRow;
