import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  pveEvidence417493,
  releasedNormalForms417493,
  specialVariants417493,
} from "@/data/batch-417-493";

type Manifest = {
  checkedAt: string;
  sources: Array<{ sourceUrl: string; supports: string[] }>;
};

function manifest(path: string) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as Manifest;
}

describe("Gen4 exact-variant PvE audit", () => {
  it("locks representative normal, Shadow, Mega and forme classifications", () => {
    expect(pveEvidence417493["430-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");

    expect(pveEvidence417493["445-sinnoh-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["445-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["445-sinnoh-mega"]?.level).toBe("CORE_INVESTMENT");

    expect(pveEvidence417493["448-sinnoh-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["448-sinnoh-mega"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["460-sinnoh-mega"]?.level).toBe("SPECIAL_USE");

    expect(pveEvidence417493["461-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["462-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["464-sinnoh-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["464-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");

    expect(pveEvidence417493["466-sinnoh-normal"]?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidence417493["466-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["467-sinnoh-shadow"]?.level).toBe("USABLE_OR_BUDGET");

    expect(pveEvidence417493["473-sinnoh-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["473-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["475-sinnoh-shadow"]?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidence417493["475-sinnoh-mega"]?.level).toBe("CORE_INVESTMENT");

    expect(pveEvidence417493["483-origin-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["484-origin-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["485-sinnoh-normal"]?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidence417493["485-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["486-sinnoh-normal"]?.level).toBe("SPECIAL_USE");
    expect(pveEvidence417493["486-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["487-origin-normal"]?.level).toBe("USABLE_OR_BUDGET");
    expect(pveEvidence417493["491-sinnoh-normal"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["491-sinnoh-shadow"]?.level).toBe("CORE_INVESTMENT");
    expect(pveEvidence417493["492-land-normal"]?.level).toBe("SPECIAL_USE");
    expect(pveEvidence417493["492-sky-normal"]?.level).toBe("USABLE_OR_BUDGET");
  });

  it("keeps every positive later-Gen4 PvE classification linked to the 2026-09-03 manifests", () => {
    const manifests = [
      manifest("research_notes/sources/pve-417-446.json"),
      manifest("research_notes/sources/pve-447-476.json"),
      manifest("research_notes/sources/pve-477-493.json"),
    ];
    expect(manifests.every((item) => item.checkedAt === "2026-09-03")).toBe(true);

    const supported = new Set(manifests.flatMap((item) => item.sources.flatMap((s) => s.supports)));
    const urls = new Set(manifests.flatMap((item) => item.sources.map((s) => s.sourceUrl)));

    for (const [variantId, evidence] of Object.entries(pveEvidence417493)) {
      expect(supported.has(variantId), variantId).toBe(true);
      expect(urls.has(evidence.sourceUrl), evidence.sourceUrl).toBe(true);
      expect(evidence.checkedAt).toBe("2026-09-03");
    }
  });

  it("locks important release boundaries independently of battle value", () => {
    expect(releasedNormalForms417493.has("489-sinnoh")).toBe(false);
    expect(releasedNormalForms417493.has("490-sinnoh")).toBe(false);
    for (const type of [
      "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying",
      "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock",
      "steel", "water",
    ]) {
      expect(releasedNormalForms417493.has(`493-${type}`)).toBe(false);
    }

    const releaseById = new Map(specialVariants417493.map((item) => [item.id, item.released]));
    expect(releaseById.get("478-sinnoh-mega")).toBe(false);
    expect(releaseById.get("485-sinnoh-mega")).toBe(false);
    expect(releaseById.get("491-sinnoh-mega")).toBe(false);
    expect(releaseById.get("428-sinnoh-mega")).toBe(true);
    expect(releaseById.get("445-sinnoh-mega")).toBe(true);
    expect(releaseById.get("448-sinnoh-mega")).toBe(true);
    expect(releaseById.get("460-sinnoh-mega")).toBe(true);
    expect(releaseById.get("475-sinnoh-mega")).toBe(true);
  });
});
