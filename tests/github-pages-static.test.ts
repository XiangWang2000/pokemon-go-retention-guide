import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GITHUB_PAGES_BASE_PATH, sitePath, versionedAssetPath } from "@/config/site";
import { DATA_VERSION } from "@/config/release";

describe("GitHub Pages static export", () => {
  it("builds project-site paths and versioned JSON URLs", () => {
    expect(GITHUB_PAGES_BASE_PATH).toBe("/pokemon-go-retention-guide");
    expect(sitePath("/review", GITHUB_PAGES_BASE_PATH)).toBe("/pokemon-go-retention-guide/review");
    expect(versionedAssetPath("/exports/current.xlsx")).toContain(
      `v=${encodeURIComponent(DATA_VERSION)}`,
    );
  });

  it("uses GitHub Pages as the canonical deployment default", () => {
    const envExample = readFileSync(".env.example", "utf8");
    expect(envExample).toContain('NEXT_PUBLIC_BASE_PATH="/pokemon-go-retention-guide"');
    expect(envExample).toContain(
      'NEXT_PUBLIC_SITE_URL="https://xiangwang2000.github.io/pokemon-go-retention-guide/"',
    );
    expect(envExample).not.toContain("chatgpt.site");
    expect(existsSync(".openai/hosting.json")).toBe(false);
  });

  it("uses Pages-compatible commands as the default npm workflow", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.scripts.dev).toContain("next dev");
    expect(pkg.scripts.dev).toContain("snapshot:check");
    expect(pkg.scripts.build).toBe("npm run build:pages");
    expect(pkg.scripts.start).toBe("node scripts/pages/serve-pages.mjs");
    expect(pkg.scripts["release:snapshot"]).toContain("prepare-release-snapshot.ts");
    expect(pkg.scripts["snapshot:check"]).toContain("check-static-snapshot.ts");
    expect(pkg.scripts["snapshot:check"]).toContain("--database-url file:./rebuild-ci.db");
    expect(pkg.scripts["release:verify"]).toContain("--database-url file:./rebuild-ci.db");
    expect(Object.keys(pkg.scripts).some((name) => name.startsWith("sites:"))).toBe(false);
    expect(pkg.devDependencies).not.toHaveProperty("vinext");
    expect(pkg.devDependencies).not.toHaveProperty("wrangler");
    expect(pkg.devDependencies).not.toHaveProperty("@cloudflare/vite-plugin");
    expect(pkg.devDependencies).not.toHaveProperty("@vitejs/plugin-react");
    expect(pkg.devDependencies).not.toHaveProperty("@vitejs/plugin-rsc");
    expect(pkg.devDependencies).not.toHaveProperty("react-server-dom-webpack");
    expect(pkg.devDependencies).not.toHaveProperty("vite");
  });

  it("uses the Pages base path for Next static export", () => {
    const config = readFileSync("next.config.ts", "utf8");
    const buildScript = readFileSync("scripts/pages/build-pages.mjs", "utf8");
    expect(config).toContain('output: "export"');
    expect(config).toContain("NEXT_PUBLIC_BASE_PATH");
    expect(config).toContain("Boolean(process.env.NEXT_PUBLIC_BASE_PATH)");
    expect(config).not.toContain("NEXT_STATIC_EXPORT");
    expect(config).not.toContain("GITHUB_ACTIONS");
    expect(buildScript).not.toContain("NEXT_STATIC_EXPORT");
    expect(buildScript).toContain('const defaultBasePath = "/pokemon-go-retention-guide"');
    expect(buildScript).toContain(
      "NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? defaultBasePath",
    );
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
    expect(workflow).toContain("npm run build");
    expect(workflow).not.toContain("npm run build:pages");
    expect(workflow).toContain("actions/configure-pages@v5");
    expect(workflow).toContain("actions/upload-pages-artifact@v4");
    expect(workflow).toContain("path: ./out");
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).not.toContain("gh-pages");
  });

  it("does not retain the retired runtime or header artifact", () => {
    expect(existsSync("vite.config.ts")).toBe(false);
    expect(existsSync("worker/index.ts")).toBe(false);
    expect(existsSync("build/sites-vite-plugin.ts")).toBe(false);
    expect(existsSync("scripts/start-sites.mjs")).toBe(false);
    expect(existsSync("scripts/purge-sites-cache.mjs")).toBe(false);
    expect(existsSync("public/_headers")).toBe(false);
    if (existsSync("out")) expect(existsSync("out/_headers")).toBe(false);
    const manifest = JSON.parse(readFileSync("site-data/manifest.json", "utf8")) as {
      publicHeaders?: unknown;
    };
    expect(manifest).not.toHaveProperty("publicHeaders");
  });

  it("keeps the full verification path Pages-only", () => {
    const verifier = readFileSync("scripts/verify.ps1", "utf8");
    expect(verifier).toContain('Invoke-NpmScript "snapshot:check"');
    expect(verifier).toContain('Invoke-NpmScript "release:verify"');
    expect(verifier).not.toContain("sites:check");
    expect(verifier).not.toContain("sites:snapshot");
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

    const manifest = JSON.parse(readFileSync("site-data/manifest.json", "utf8")) as {
      excel: { path: string };
    };
    expect(manifest.excel.path.startsWith("public/")).toBe(true);
    const workbookArtifact = `out/${manifest.excel.path.slice("public/".length)}`;
    expect(existsSync(workbookArtifact)).toBe(true);
  });
});
