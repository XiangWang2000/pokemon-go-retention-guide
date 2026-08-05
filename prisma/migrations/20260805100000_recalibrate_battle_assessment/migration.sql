-- Persist the shared PvE levels and per-variant data disposition.
ALTER TABLE "CategoryEvaluation" ADD COLUMN "pveUseLevel" TEXT;
ALTER TABLE "CategoryEvaluation" ADD COLUMN "assessmentDisposition" TEXT;
ALTER TABLE "RetentionEvaluation" ADD COLUMN "assessmentDisposition" TEXT NOT NULL DEFAULT 'TRUE_DATA_PENDING';
