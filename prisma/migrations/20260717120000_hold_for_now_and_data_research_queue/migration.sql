-- Preserve the previous outcome in ChangeLog before removing NEEDS_REVIEW from the live enum.
INSERT OR IGNORE INTO "ChangeLog" (
  "id",
  "entityType",
  "entityId",
  "fieldName",
  "previousValue",
  "newValue",
  "sourceId",
  "changeReasonZhTw",
  "changedAt",
  "rulesVersion"
)
SELECT
  'migration-hold-' || "id",
  'RetentionEvaluation',
  "id",
  'decision',
  'NEEDS_REVIEW',
  'HOLD_FOR_NOW',
  NULL,
  'NEEDS_REVIEW 不再作為使用者最終建議；原值保存於變更紀錄，並由 v4 規則引擎重新計算。',
  '2026-07-17T04:00:00.000Z',
  '2026.07.17-v4'
FROM "RetentionEvaluation"
WHERE "decision" = 'NEEDS_REVIEW';

UPDATE "RetentionEvaluation"
SET "decision" = 'HOLD_FOR_NOW'
WHERE "decision" = 'NEEDS_REVIEW';

UPDATE "EvaluationRuleTrace"
SET "resultDecision" = 'HOLD_FOR_NOW'
WHERE "resultDecision" = 'NEEDS_REVIEW';

-- NEEDS_REVIEW was a workflow label, not a data-quality issue type.
UPDATE "DataIssue"
SET "issueType" = 'RULE_NOT_COVERED'
WHERE "issueType" = 'NEEDS_REVIEW';

ALTER TABLE "RetentionEvaluation"
ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'DATA_PENDING';

ALTER TABLE "RetentionEvaluation"
ADD COLUMN "missingDataSummaryZhTw" TEXT NOT NULL DEFAULT '';

ALTER TABLE "DataIssue"
ADD COLUMN "provisionalDecision" TEXT NOT NULL DEFAULT 'HOLD_FOR_NOW';

ALTER TABLE "DataIssue"
ADD COLUMN "suggestedResearchActionZhTw" TEXT NOT NULL DEFAULT '';

ALTER TABLE "DataIssue"
ADD COLUMN "lastResearchedAt" DATETIME;

UPDATE "DataIssue"
SET
  "suggestedResearchActionZhTw" = "suggestedActionZhTw",
  "lastResearchedAt" = "detectedAt";
