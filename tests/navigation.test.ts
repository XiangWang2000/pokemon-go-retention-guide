import { describe, expect, it } from "vitest";
import {
  isPrimaryNavigationActive,
  normalizeNavigationPathname,
} from "@/lib/navigation";

const basePath = "/pokemon-go-retention-guide";

describe("primary site navigation", () => {
  it("normalizes project-site and trailing-slash paths", () => {
    expect(normalizeNavigationPathname(`${basePath}/review/`, basePath)).toBe("/review");
    expect(normalizeNavigationPathname(basePath, basePath)).toBe("/");
    expect(normalizeNavigationPathname("/sources/")).toBe("/sources");
  });

  it("keeps the Pokédex navigation active on the home and Pokémon detail routes", () => {
    expect(isPrimaryNavigationActive(`${basePath}/`, "/", basePath)).toBe(true);
    expect(
      isPrimaryNavigationActive(`${basePath}/pokemon/001-kanto-normal/`, "/", basePath),
    ).toBe(true);
    expect(isPrimaryNavigationActive(`${basePath}/review/`, "/", basePath)).toBe(false);
  });

  it("matches each secondary section without matching neighboring routes", () => {
    expect(isPrimaryNavigationActive(`${basePath}/review/`, "/review", basePath)).toBe(true);
    expect(isPrimaryNavigationActive(`${basePath}/sources/`, "/sources", basePath)).toBe(true);
    expect(isPrimaryNavigationActive(`${basePath}/changes/`, "/changes", basePath)).toBe(true);
    expect(isPrimaryNavigationActive(`${basePath}/sources/`, "/review", basePath)).toBe(false);
  });
});
