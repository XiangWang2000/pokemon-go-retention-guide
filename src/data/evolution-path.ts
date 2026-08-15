import type { PrismaClient } from "../../generated/prisma/client";

export type EvolutionPathWrite = {
  id: string;
  fromFormId: string;
  toFormId: string;
  evolutionMethodZhTw: string;
  availabilityNotesZhTw: string;
  requiresEvent: boolean;
  verifiedAt: Date | null;
};

type EvolutionPathValues = Omit<EvolutionPathWrite, "id">;

/**
 * EvolutionPath storage IDs come from whichever importer first sees an edge.
 * The endpoint pair is the canonical identity, so an owning importer updates
 * an existing manifest edge instead of creating a second row.
 */
export async function upsertEvolutionPath(
  prisma: PrismaClient,
  path: EvolutionPathWrite,
) {
  const [byEndpoint, byId] = await Promise.all([
    prisma.evolutionPath.findMany({
      where: { fromFormId: path.fromFormId, toFormId: path.toFormId },
      select: { id: true },
    }),
    prisma.evolutionPath.findUnique({
      where: { id: path.id },
      select: { id: true, fromFormId: true, toFormId: true },
    }),
  ]);
  if (byEndpoint.length > 1) {
    throw new Error(
      `Multiple evolution paths already exist for ${path.fromFormId}->${path.toFormId}.`,
    );
  }
  if (
    byId &&
    (byId.fromFormId !== path.fromFormId || byId.toFormId !== path.toFormId)
  ) {
    throw new Error(`Evolution path ID collision: ${path.id}.`);
  }

  const values: EvolutionPathValues = {
    fromFormId: path.fromFormId,
    toFormId: path.toFormId,
    evolutionMethodZhTw: path.evolutionMethodZhTw,
    availabilityNotesZhTw: path.availabilityNotesZhTw,
    requiresEvent: path.requiresEvent,
    verifiedAt: path.verifiedAt,
  };
  const existingId = byEndpoint[0]?.id ?? byId?.id;
  if (existingId) {
    return prisma.evolutionPath.update({ where: { id: existingId }, data: values });
  }
  return prisma.evolutionPath.create({ data: path });
}
