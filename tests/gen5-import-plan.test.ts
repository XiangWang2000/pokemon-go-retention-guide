import { describe, expect, it } from "vitest";
import { getGen5BatchDefinition, type Gen5BatchDefinition } from "../src/data/batch-gen5";
import { buildGen5ImportPlan, type Gen5RankingSnapshots } from "../src/data/gen5-import-plan";

const noRankings: Gen5RankingSnapshots = { GREAT: [], ULTRA: [], MASTER: [] };
const batch = getGen5BatchDefinition("614-643");

function row(id: string, definition = batch, rankings = noRankings) {
  const result = buildGen5ImportPlan(definition, rankings).find((entry) => entry.id === id);
  if (!result) throw new Error(`Missing test variant ${id}`);
  return result;
}

function releaseOverride(formId: string, status: "UNKNOWN" | "UNRELEASED"): Gen5BatchDefinition {
  return {
    ...batch,
    releaseEvidenceForVariant: (id, variant) => id === formId
      ? { status, sourceIds: [], evidenceMode: status === "UNKNOWN" ? "UNKNOWN" : "EXPLICIT_UNRELEASED", notesZhTw: "test boundary" }
      : batch.releaseEvidenceForVariant(id, variant),
  };
}

describe("Gen5 retention import plan", () => {
  it.each(["normal", "shadow", "dynamax"])("keeps Deino %s for its exact released evolution without importing Hydreigon's own value", (variant) => {
    const result = row(`633-unova-${variant}`);
    expect(result.initialDecision).toBe("CONDITIONAL_KEEP");
    expect(result.initialDisposition).toBe("LIMITED_USE");
    expect(result.pveEvidence).toBeNull();
    expect(result.maxEvidence).toBeNull();
    expect(result.bestPvpRank).toBeNull();
    expect(result.evolutionCandidates).toEqual([
      expect.objectContaining({
        targetVariantId: `635-unova-${variant}`,
        targetFormId: "635-unova",
        pathFormIds: ["633-unova", "634-unova", "635-unova"],
      }),
    ]);
    expect(result.evolutionCandidates[0]!.sourceUrls).not.toHaveLength(0);
    expect(result.evolutionCandidates[0]!.conditionsZhTw).toContain(variant === "dynamax" ? "Max Darkness" : "Brutal Swing");
  });

  it("keeps Dynamax Zweilous and Larvesta as conditional evolution candidates", () => {
    expect(row("634-unova-dynamax").evolutionCandidates[0]?.targetVariantId).toBe("635-unova-dynamax");
    const larvesta = row("636-unova-normal");
    expect(larvesta.initialDecision).toBe("CONDITIONAL_KEEP");
    expect(larvesta.evolutionCandidates[0]?.targetVariantId).toBe("637-unova-normal");
    expect(larvesta.evolutionCandidates[0]?.conditionsZhTw).toContain("400 糖果");
    expect(larvesta.pveEvidence).toBeNull();
    expect(row("637-unova-normal").initialDecision).toBe("KEEP");
  });

  it("does not borrow Normal or Shadow battle evidence for Purified evolution", () => {
    expect(row("633-unova-purified").evolutionCandidates).toEqual([]);
    expect(row("633-unova-purified").initialDisposition).toBe("TRUE_DATA_PENDING");
  });

  it("blocks unknown and unreleased intermediate evolution steps", () => {
    for (const status of ["UNKNOWN", "UNRELEASED"] as const) {
      const result = row("633-unova-dynamax", releaseOverride("634-unova", status));
      expect(result.evolutionCandidates).toEqual([]);
      expect(result.initialDecision).toBe("HOLD_FOR_NOW");
    }
  });

  it("blocks positive but unreleased descendants", () => {
    const result = row("636-unova-normal", releaseOverride("637-unova", "UNRELEASED"));
    expect(result.evolutionCandidates).toEqual([]);
    expect(result.initialDecision).toBe("HOLD_FOR_NOW");
  });

  it("keeps unknown release separate from positively unreleased despite positive combat evidence", () => {
    const unknown = row("637-unova-normal", releaseOverride("637-unova", "UNKNOWN"));
    expect(unknown.pveEvidence?.level).toBe("CORE_INVESTMENT");
    expect(unknown.initialDecision).toBe("HOLD_FOR_NOW");
    expect(unknown.initialDisposition).toBe("TRUE_DATA_PENDING");
    const unreleased = row("637-unova-normal", releaseOverride("637-unova", "UNRELEASED"));
    expect(unreleased.initialDecision).toBe("TRANSFER_CANDIDATE");
    expect(unreleased.initialDisposition).toBe("NOT_APPLICABLE_OR_UNRELEASED");
  });

  it("does not turn missing evidence or an out-of-threshold rank into a verified negative", () => {
    const ranks = Array.from({ length: 251 }, (_, index) => ({ speciesId: `other-${index}` }));
    ranks.push({ speciesId: batch.pvpMappingForForm({ id: "615-unova" }).normal });
    const result = row("615-unova-normal", batch, { ...noRankings, GREAT: ranks });
    expect(result.bestPvpRank).toBe(252);
    expect(result.initialDecision).toBe("HOLD_FOR_NOW");
    expect(result.initialDisposition).toBe("TRUE_DATA_PENDING");
  });

  it("does not hold a row with its own confirmed positive PvP purpose because PvE is missing", () => {
    const result = row("615-unova-normal", batch, {
      ...noRankings, GREAT: [{ speciesId: batch.pvpMappingForForm({ id: "615-unova" }).normal }],
    });
    expect(result.initialDecision).toBe("KEEP");
    expect(result.initialDisposition).toBe("CLEAR_USE");
  });

  it("resolves explicit cross-batch edges from the owning batch", () => {
    const earlier = getGen5BatchDefinition("584-613");
    const later: Gen5BatchDefinition = {
      ...batch,
      pveEvidenceForVariant: (id) => id === "614-unova-normal"
        ? batch.pveEvidenceForVariant("637-unova-normal") : null,
    };
    const result = buildGen5ImportPlan(earlier, noRankings, [earlier, later])
      .find((entry) => entry.id === "613-unova-normal")!;
    expect(result.evolutionCandidates).toEqual([
      expect.objectContaining({ targetVariantId: "614-unova-normal", pathFormIds: ["613-unova", "614-unova"] }),
    ]);
    expect(result.initialDecision).toBe("CONDITIONAL_KEEP");
  });

  it("does not borrow Fusion or Change Form outputs from a shared species or family", () => {
    const definition = getGen5BatchDefinition("644-649");
    for (const id of ["646-unova-normal", "647-ordinary-normal", "647-resolute-normal"]) {
      expect(row(id, definition).evolutionCandidates).toEqual([]);
    }
    expect(row("642-incarnate-normal").evolutionCandidates).toEqual([]);
  });

  it("keeps seasonal evolution endpoints exact rather than merging family forms", () => {
    const definition = getGen5BatchDefinition("584-613");
    const evidence = batch.pveEvidenceForVariant("637-unova-normal");
    const changed: Gen5BatchDefinition = {
      ...definition,
      pveEvidenceForVariant: (id) => id === "586-summer-normal" ? evidence : null,
    };
    expect(row("585-spring-normal", changed).evolutionCandidates).toEqual([]);
    expect(row("585-summer-normal", changed).evolutionCandidates[0]?.targetVariantId).toBe("586-summer-normal");
  });
});
