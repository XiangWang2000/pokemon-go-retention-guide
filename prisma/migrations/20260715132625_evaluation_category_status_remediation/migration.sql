-- CreateTable
CREATE TABLE "CategoryEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleVariantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summaryZhTw" TEXT NOT NULL,
    "materialToDecision" BOOLEAN NOT NULL DEFAULT false,
    "rocketRating" TEXT,
    "rocketRoles" TEXT NOT NULL DEFAULT '[]',
    "maxTypeRank" INTEGER,
    "maxTypeTier" TEXT,
    "maxTypeKey" TEXT,
    "maxOverallRating" TEXT,
    "maxInvestmentRating" TEXT,
    "maxUseCaseBreadth" TEXT,
    "checkedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CategoryEvaluation_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoryEvaluationSource" (
    "categoryEvaluationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "usageZhTw" TEXT NOT NULL,

    PRIMARY KEY ("categoryEvaluationId", "sourceId"),
    CONSTRAINT "CategoryEvaluationSource_categoryEvaluationId_fkey" FOREIGN KEY ("categoryEvaluationId") REFERENCES "CategoryEvaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategoryEvaluationSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceReference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BattleVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonFormId" TEXT NOT NULL,
    "variantKey" TEXT NOT NULL,
    "isReleased" BOOLEAN,
    "releaseStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "releaseVerifiedAt" DATETIME,
    "notesZhTw" TEXT NOT NULL,
    "inheritsFromVariantId" TEXT,
    "inheritanceMode" TEXT NOT NULL DEFAULT 'NONE',
    "purificationCostModifier" REAL,
    "hasReturnAccess" BOOLEAN NOT NULL DEFAULT false,
    "purificationRiskZhTw" TEXT NOT NULL DEFAULT '',
    "purifiedOverrideRequired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BattleVariant_pokemonFormId_fkey" FOREIGN KEY ("pokemonFormId") REFERENCES "PokemonForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleVariant_inheritsFromVariantId_fkey" FOREIGN KEY ("inheritsFromVariantId") REFERENCES "BattleVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BattleVariant" ("id", "isReleased", "notesZhTw", "pokemonFormId", "releaseVerifiedAt", "variantKey") SELECT "id", "isReleased", "notesZhTw", "pokemonFormId", "releaseVerifiedAt", "variantKey" FROM "BattleVariant";
DROP TABLE "BattleVariant";
ALTER TABLE "new_BattleVariant" RENAME TO "BattleVariant";
CREATE INDEX "BattleVariant_pokemonFormId_idx" ON "BattleVariant"("pokemonFormId");
CREATE UNIQUE INDEX "BattleVariant_pokemonFormId_variantKey_key" ON "BattleVariant"("pokemonFormId", "variantKey");
CREATE TABLE "new_DataIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonFormId" TEXT,
    "battleVariantId" TEXT,
    "issueType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "batchKey" TEXT NOT NULL,
    "messageZhTw" TEXT NOT NULL,
    "affectsFinalDecision" BOOLEAN NOT NULL DEFAULT true,
    "suggestedActionZhTw" TEXT NOT NULL DEFAULT '',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "DataIssue_pokemonFormId_fkey" FOREIGN KEY ("pokemonFormId") REFERENCES "PokemonForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataIssue_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DataIssue" ("batchKey", "battleVariantId", "detectedAt", "id", "issueType", "messageZhTw", "pokemonFormId", "resolvedAt", "status") SELECT "batchKey", "battleVariantId", "detectedAt", "id", "issueType", "messageZhTw", "pokemonFormId", "resolvedAt", "status" FROM "DataIssue";
DROP TABLE "DataIssue";
ALTER TABLE "new_DataIssue" RENAME TO "DataIssue";
CREATE INDEX "DataIssue_batchKey_status_idx" ON "DataIssue"("batchKey", "status");
CREATE TABLE "new_PokemonForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speciesId" TEXT NOT NULL,
    "formKey" TEXT NOT NULL,
    "formNameEn" TEXT NOT NULL,
    "formNameZhTw" TEXT NOT NULL,
    "regionKey" TEXT NOT NULL,
    "types" TEXT NOT NULL,
    "searchAliases" TEXT NOT NULL,
    "evolvesFromFormId" TEXT,
    "evolutionFamilyNotesZhTw" TEXT NOT NULL,
    "isReleasedInPokemonGo" BOOLEAN,
    "releaseStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "releaseVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PokemonForm_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PokemonSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PokemonForm_evolvesFromFormId_fkey" FOREIGN KEY ("evolvesFromFormId") REFERENCES "PokemonForm" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PokemonForm" ("createdAt", "evolutionFamilyNotesZhTw", "evolvesFromFormId", "formKey", "formNameEn", "formNameZhTw", "id", "isReleasedInPokemonGo", "regionKey", "releaseVerifiedAt", "searchAliases", "speciesId", "types", "updatedAt") SELECT "createdAt", "evolutionFamilyNotesZhTw", "evolvesFromFormId", "formKey", "formNameEn", "formNameZhTw", "id", "isReleasedInPokemonGo", "regionKey", "releaseVerifiedAt", "searchAliases", "speciesId", "types", "updatedAt" FROM "PokemonForm";
DROP TABLE "PokemonForm";
ALTER TABLE "new_PokemonForm" RENAME TO "PokemonForm";
CREATE INDEX "PokemonForm_speciesId_idx" ON "PokemonForm"("speciesId");
CREATE UNIQUE INDEX "PokemonForm_speciesId_formKey_key" ON "PokemonForm"("speciesId", "formKey");
CREATE TABLE "new_RawEvaluationData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleVariantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PARTIALLY_VERIFIED',
    "league" TEXT NOT NULL,
    "cup" TEXT,
    "pvpCategory" TEXT,
    "speciesKey" TEXT,
    "formKey" TEXT,
    "variantKey" TEXT,
    "rank" INTEGER,
    "rating" TEXT,
    "score" REAL,
    "tier" TEXT,
    "recommendedMoves" TEXT NOT NULL,
    "rawNotes" TEXT NOT NULL,
    "seasonOrVersion" TEXT NOT NULL,
    "extractionMethod" TEXT,
    "reproducible" BOOLEAN NOT NULL DEFAULT false,
    "fastMoveKey" TEXT,
    "chargedMoveKey" TEXT,
    "bossKey" TEXT,
    "simulationLevel" TEXT,
    "weather" TEXT,
    "friendship" TEXT,
    "rankingMethod" TEXT,
    "estimator" REAL,
    "timeToWin" REAL,
    "deaths" REAL,
    "migrationNote" TEXT,
    "sourceId" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawEvaluationData_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RawEvaluationData_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceReference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RawEvaluationData" ("battleVariantId", "category", "checkedAt", "createdAt", "id", "league", "rank", "rating", "rawNotes", "recommendedMoves", "score", "seasonOrVersion", "sourceId", "tier") SELECT "battleVariantId", "category", "checkedAt", "createdAt", "id", "league", "rank", "rating", "rawNotes", "recommendedMoves", "score", "seasonOrVersion", "sourceId", "tier" FROM "RawEvaluationData";
DROP TABLE "RawEvaluationData";
ALTER TABLE "new_RawEvaluationData" RENAME TO "RawEvaluationData";
CREATE INDEX "RawEvaluationData_battleVariantId_category_league_idx" ON "RawEvaluationData"("battleVariantId", "category", "league");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CategoryEvaluation_status_category_idx" ON "CategoryEvaluation"("status", "category");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryEvaluation_battleVariantId_category_key" ON "CategoryEvaluation"("battleVariantId", "category");
