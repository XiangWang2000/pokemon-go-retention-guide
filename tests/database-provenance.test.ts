import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDatabaseUrl, resolveDatabaseLocation } from "@/lib/database";
import manifest from "../site-data/manifest.json";

describe("database provenance", () => {
  it("resolves the default and explicit DATABASE_URL to one SQLite path", () => {
    const root = path.resolve("provenance-test-root");
    expect(getDatabaseUrl({})).toBe("file:./dev.db");
    expect(resolveDatabaseLocation("file:./rebuild-r19.db", root)).toMatchObject({
      url: "file:./rebuild-r19.db",
      absolutePath: path.join(root, "rebuild-r19.db"),
      manifestPath: "rebuild-r19.db",
    });
  });

  it("matches the snapshot provenance to the database used by the current environment", () => {
    const location = resolveDatabaseLocation();
    expect(manifest.sourceDatabase.path).toBe(location.manifestPath);

    const database = readFileSync(location.absolutePath);
    expect(database.byteLength).toBe(manifest.sourceDatabase.bytes);
    expect(createHash("sha256").update(database).digest("hex")).toBe(
      manifest.sourceDatabase.sha256,
    );
  });
});
