-- Preserve legacy booleans while backfilling the new three-state release model.
UPDATE "PokemonForm"
SET "releaseStatus" = CASE
  WHEN "isReleasedInPokemonGo" = 1 THEN 'RELEASED'
  WHEN "isReleasedInPokemonGo" = 0 THEN 'UNRELEASED'
  ELSE 'UNKNOWN'
END;

UPDATE "BattleVariant"
SET "releaseStatus" = CASE
  WHEN "isReleased" = 1 THEN 'RELEASED'
  WHEN "isReleased" = 0 THEN 'UNRELEASED'
  ELSE 'UNKNOWN'
END;

-- Existing raw rows are retained verbatim. Their status stays conservative until
-- the remediation process verifies extraction metadata and source identity.
UPDATE "RawEvaluationData"
SET "status" = 'PARTIALLY_VERIFIED',
    "migrationNote" = 'Migrated from the pre-category-status schema; original rank, text, source, and checkedAt were preserved.'
WHERE "migrationNote" IS NULL;