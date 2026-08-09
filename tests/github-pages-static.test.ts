import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  GITHUB_PAGES_BASE_PATH,
  sitePath,
  versionedAssetPath,
  versionedDataPath,
} from "@/config/site";
import { DATA_VERSION } from "@/config/release";

describe("GitHub Pages static export", () => {
  it("builds project-site paths and versioned JSON URLs", () => {
    expect(GITHUB_PAGES_BASE_PATH).toBe("/pokemon-go-retention-guide");
    expect(sitePath("/review", GITHUB_PAGES_BASE_PATH)).toBe("/pokemon-go-retention-guide/review");
    expect(versionedDataPath("/data/home.json")).toContain(`v=${encodeURIComponent(DATA_VERSION)}`);
    expect(versionedAssetPath("/exports/current.xlsx")).toContain(
      `v=${encodeURIComponent(DATA_VERSION)}`,
    );
  });

  it("uses Next static export without response headers", () => {
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).toContain('output: "export"');
    expect(config).toContain("NEXT_STATIC_EXPORT");
    expect(config).toContain("trailingSlash: true");
    expect(config).toContain("basePath");
    expect(config).toContain("assetPrefix");
    expect(config).not.toContain("headers()");
    expect(existsSync("src/app/api/home/route.ts")).toBe(false);
    expect(existsSync("src/app/api/export/route.ts")).toBe(false);
  });

  it("publishes only the static output directory from the Pages workflow", () => {
    const workflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run build:pages");
    expect(workflow).toContain("actions/configure-pages@v5");
    expect(workflow).toContain("actions/upload-pages-artifact@v3");
    expect(workflow).toContain("path: ./out");
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).not.toContain("gh-pages");
  });

  it("keeps the legacy Sites Excel redirect outside the Pages artifact", () => {
    const worker = readFileSync("worker/index.ts", "utf8");
    expect(worker).toContain('url.pathname === "/api/export"');
    expect(worker).toContain("Response.redirect(target, 307)");
    expect(worker).toContain("CURRENT_DATA_SCOPE");
  });

  it("records hashes for browser-loaded supplemental data", () => {
    const manifest = JSON.parse(readFileSync("site-data/manifest.json", "utf8")) as {
      runtimeStaticData: Record<string, { path: string; bytes: number; sha256: string }>;
    };
    for (const file of Object.values(manifest.runtimeStaticData)) {
      expect(existsSync(file.path)).toBe(true);
      const content = readFileSync(file.path);
      expect(content.byteLength).toBe(file.bytes);
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it("keeps a project-site deep-route artifact when a Pages build is present", () => {
    if (!existsSync("out")) return;

    const detailHtmlPath = "out/pokemon/001-kanto-normal/index.html";
    expect(existsSync(detailHtmlPath)).toBe(true);
    const html = readFileSync(detailHtmlPath, "utf8");
    expect(html.includes(`${GITHUB_PAGES_BASE_PATH}/`) || html.includes('href="/"')).toBe(true);
    expect(html).not.toContain("/api/home");
    expect(existsSync("out/data/home.json")).toBe(true);
    expect(existsSync("out/exports/pokemon-go-retention-001-386.xlsx")).toBe(true);
  });
});
