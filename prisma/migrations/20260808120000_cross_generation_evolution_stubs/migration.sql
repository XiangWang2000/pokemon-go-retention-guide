-- Keep later-generation evolution targets in the graph before their full battle data is imported.
ALTER TABLE "PokemonForm" ADD COLUMN "isEvolutionStub" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PokemonForm" ADD COLUMN "evolutionTargetUseLevel" TEXT;
ALTER TABLE "PokemonForm" ADD COLUMN "evolutionTargetNotesZhTw" TEXT;
