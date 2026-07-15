-- CreateTable
CREATE TABLE "PokemonSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dexNumber" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZhTw" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "familyKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PokemonForm" (
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
    "releaseVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PokemonForm_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PokemonSpecies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PokemonForm_evolvesFromFormId_fkey" FOREIGN KEY ("evolvesFromFormId") REFERENCES "PokemonForm" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BattleVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonFormId" TEXT NOT NULL,
    "variantKey" TEXT NOT NULL,
    "isReleased" BOOLEAN,
    "releaseVerifiedAt" DATETIME,
    "notesZhTw" TEXT NOT NULL,
    CONSTRAINT "BattleVariant_pokemonFormId_fkey" FOREIGN KEY ("pokemonFormId") REFERENCES "PokemonForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvolutionPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromFormId" TEXT NOT NULL,
    "toFormId" TEXT NOT NULL,
    "evolutionMethodZhTw" TEXT NOT NULL,
    "availabilityNotesZhTw" TEXT NOT NULL,
    "requiresEvent" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    CONSTRAINT "EvolutionPath_fromFormId_fkey" FOREIGN KEY ("fromFormId") REFERENCES "PokemonForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvolutionPath_toFormId_fkey" FOREIGN KEY ("toFormId") REFERENCES "PokemonForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moveKey" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZhTw" TEXT NOT NULL,
    "moveType" TEXT NOT NULL,
    "moveCategory" TEXT NOT NULL,
    "isLegacy" BOOLEAN NOT NULL DEFAULT false,
    "isEliteTmAvailable" BOOLEAN NOT NULL DEFAULT false,
    "notesZhTw" TEXT NOT NULL,
    "verifiedAt" DATETIME
);

-- CreateTable
CREATE TABLE "VariantMove" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleVariantId" TEXT NOT NULL,
    "moveId" TEXT NOT NULL,
    "availabilityType" TEXT NOT NULL,
    "sourceNotesZhTw" TEXT NOT NULL,
    "verifiedAt" DATETIME,
    CONSTRAINT "VariantMove_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VariantMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SourceReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceTitleOriginal" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "sourceSummaryZhTw" TEXT NOT NULL,
    "accessedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "dataVersion" TEXT,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RawEvaluationData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleVariantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "rank" INTEGER,
    "rating" TEXT,
    "score" REAL,
    "tier" TEXT,
    "recommendedMoves" TEXT NOT NULL,
    "rawNotes" TEXT NOT NULL,
    "seasonOrVersion" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawEvaluationData_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RawEvaluationData_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceReference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RetentionEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleVariantId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "pvpSummaryZhTw" TEXT NOT NULL,
    "pveSummaryZhTw" TEXT NOT NULL,
    "rocketSummaryZhTw" TEXT NOT NULL,
    "gymSummaryZhTw" TEXT NOT NULL,
    "gymRating" TEXT NOT NULL,
    "megaSummaryZhTw" TEXT NOT NULL,
    "maxBattleSummaryZhTw" TEXT NOT NULL,
    "evolutionSummaryZhTw" TEXT NOT NULL,
    "requiredMovesSummaryZhTw" TEXT NOT NULL,
    "recommendedIvStrategyZhTw" TEXT NOT NULL,
    "reasonZhTw" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "rulesVersion" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" DATETIME,
    "reviewNotesZhTw" TEXT NOT NULL,
    CONSTRAINT "RetentionEvaluation_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationSource" (
    "evaluationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "usageZhTw" TEXT NOT NULL,

    PRIMARY KEY ("evaluationId", "sourceId"),
    CONSTRAINT "EvaluationSource_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "RetentionEvaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvaluationSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceReference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationRuleTrace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluationId" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "resultDecision" TEXT,
    "explanationZhTw" TEXT NOT NULL,
    CONSTRAINT "EvaluationRuleTrace_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "RetentionEvaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChangeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "sourceId" TEXT,
    "changeReasonZhTw" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL,
    "rulesVersion" TEXT NOT NULL,
    CONSTRAINT "ChangeLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceReference" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pokemonFormId" TEXT,
    "battleVariantId" TEXT,
    "issueType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "batchKey" TEXT NOT NULL,
    "messageZhTw" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "DataIssue_pokemonFormId_fkey" FOREIGN KEY ("pokemonFormId") REFERENCES "PokemonForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataIssue_battleVariantId_fkey" FOREIGN KEY ("battleVariantId") REFERENCES "BattleVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PokemonSpecies_dexNumber_key" ON "PokemonSpecies"("dexNumber");

-- CreateIndex
CREATE INDEX "PokemonForm_speciesId_idx" ON "PokemonForm"("speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonForm_speciesId_formKey_key" ON "PokemonForm"("speciesId", "formKey");

-- CreateIndex
CREATE INDEX "BattleVariant_pokemonFormId_idx" ON "BattleVariant"("pokemonFormId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleVariant_pokemonFormId_variantKey_key" ON "BattleVariant"("pokemonFormId", "variantKey");

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionPath_fromFormId_toFormId_evolutionMethodZhTw_key" ON "EvolutionPath"("fromFormId", "toFormId", "evolutionMethodZhTw");

-- CreateIndex
CREATE UNIQUE INDEX "Move_moveKey_key" ON "Move"("moveKey");

-- CreateIndex
CREATE UNIQUE INDEX "VariantMove_battleVariantId_moveId_availabilityType_key" ON "VariantMove"("battleVariantId", "moveId", "availabilityType");

-- CreateIndex
CREATE UNIQUE INDEX "SourceReference_sourceUrl_accessedAt_key" ON "SourceReference"("sourceUrl", "accessedAt");

-- CreateIndex
CREATE INDEX "RawEvaluationData_battleVariantId_category_league_idx" ON "RawEvaluationData"("battleVariantId", "category", "league");

-- CreateIndex
CREATE INDEX "RetentionEvaluation_battleVariantId_generatedAt_idx" ON "RetentionEvaluation"("battleVariantId", "generatedAt");

-- CreateIndex
CREATE INDEX "ChangeLog_entityType_entityId_idx" ON "ChangeLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DataIssue_batchKey_status_idx" ON "DataIssue"("batchKey", "status");
