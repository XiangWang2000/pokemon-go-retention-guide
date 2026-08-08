import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { getDatabaseUrl, resolveDatabaseLocation } from "@/lib/database";

describe("database provenance", () => {
  it("resolves DATABASE_URL to the temporary SQLite fixture path", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "pokemon-provenance-"));
    const fixturePath = path.join(root, "fixture.db");
    const fixture = new Database(fixturePath);
    fixture.pragma("user_version = 19");
    fixture.close();

    try {
      expect(getDatabaseUrl({})).toBe("file:./dev.db");
      expect(getDatabaseUrl({ DATABASE_URL: "file:./fixture.db" })).toBe("file:./fixture.db");
      expect(resolveDatabaseLocation(getDatabaseUrl({ DATABASE_URL: "file:./fixture.db" }), root)).toMatchObject({
        url: "file:./fixture.db",
        absolutePath: fixturePath,
        manifestPath: "fixture.db",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps the default path deterministic without reading the real database", () => {
    expect(getDatabaseUrl({})).toBe("file:./dev.db");
    expect(resolveDatabaseLocation("file:./fixture.db", "C:\\fixture-root")).toMatchObject({
      url: "file:./fixture.db",
      absolutePath: path.resolve("C:\\fixture-root", "fixture.db"),
      manifestPath: "fixture.db",
    });
  });
});
