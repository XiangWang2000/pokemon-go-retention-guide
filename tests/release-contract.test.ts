import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BATCH_REGISTRY, assertBatchRegistry } from "@/config/batch-registry";
import {
  CURRENT_RELEASE_CONTRACT,
  expectedReleaseReviewPaths,
  isExpectedReleaseGeneratedPath,
} from "@/config/release-contract";
import { CURRENT_DATA_SCOPE } from "@/config/data-scope";
import { DATA_VERSION } from "@/config/release";
import { assertSafeReleasePublishRef } from "../scripts/release/verify-release-ref";
import {
  promoteSnapshot,
  SNAPSHOT_PROMOTION_TARGETS,
} from "../scripts/release/prepare-release-snapshot";

async function writeFixture(root: string, relativePath: string, value: string) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, "utf8");
}

describe("current release contract", () => {
  it("derives scope and review outputs from the ordered Batch Registry", () => {
    assertBatchRegistry();
    expect(CURRENT_RELEASE_CONTRACT.minDex).toBe(BATCH_REGISTRY[0]?.minDex);
    expect(CURRENT_RELEASE_CONTRACT.maxDex).toBe(BATCH_REGISTRY.at(-1)?.maxDex);
    expect(CURRENT_RELEASE_CONTRACT.scope).toBe(CURRENT_DATA_SCOPE);
    expect(CURRENT_RELEASE_CONTRACT.dataVersion).toBe(DATA_VERSION);
    expect(CURRENT_RELEASE_CONTRACT.snapshot.databaseUrl).toBe("file:./rebuild-ci.db");

    const expectedReviewPaths = expectedReleaseReviewPaths();
    expect(expectedReviewPaths.size).toBe(BATCH_REGISTRY.length * 2 + 2);
    for (const entry of BATCH_REGISTRY) {
      expect(expectedReviewPaths.has(entry.review.jsonPath)).toBe(true);
      expect(expectedReviewPaths.has(entry.review.markdownPath)).toBe(true);
      expect(isExpectedReleaseGeneratedPath(entry.review.jsonPath)).toBe(true);
      expect(isExpectedReleaseGeneratedPath(entry.review.markdownPath)).toBe(true);
    }
    expect(isExpectedReleaseGeneratedPath(CURRENT_RELEASE_CONTRACT.snapshot.exportPath)).toBe(true);
    expect(isExpectedReleaseGeneratedPath("public/_headers")).toBe(false);
  });

  it("rejects stale, unrelated, and escaping generated paths", () => {
    expect(isExpectedReleaseGeneratedPath("review/001-417-recalibration.json")).toBe(false);
    expect(isExpectedReleaseGeneratedPath("review/unexpected.json")).toBe(false);
    expect(isExpectedReleaseGeneratedPath("public/data-old/home.json")).toBe(false);
    expect(isExpectedReleaseGeneratedPath("../site-data/manifest.json")).toBe(false);
    expect(isExpectedReleaseGeneratedPath("C:/outside/site-data/manifest.json")).toBe(false);
  });

  it("keeps active release workflows current-scope driven", async () => {
    for (const workflow of [
      ".github/workflows/prepare-release-snapshot.yml",
      ".github/workflows/deploy-pages.yml",
      ".github/workflows/verify-research-rebuild-pr.yml",
    ]) {
      const contents = await readFile(workflow, "utf8");
      expect(contents).toContain("release");
      expect(contents).not.toContain("Gen4");
      expect(contents).not.toContain("#416");
      expect(contents).not.toContain("r24");
      expect(contents).not.toContain("agent/publish-387-416");
      expect(contents).not.toContain("retrigger");
    }
  });

  it("retains historical integrity checks outside the release contract", async () => {
    const pagesWorkflow = await readFile(".github/workflows/verify-pages-pr.yml", "utf8");
    const prepareWorkflow = await readFile(
      ".github/workflows/prepare-release-snapshot.yml",
      "utf8",
    );
    const rebuildWorkflow = await readFile(
      ".github/workflows/verify-research-rebuild-pr.yml",
      "utf8",
    );

    expect(pagesWorkflow).toContain("Historical importer adapter integrity");
    expect(pagesWorkflow).toContain("npm run data:verify:gen4");
    expect(prepareWorkflow).toContain("npm run data:verify:published-integrity");
    expect(rebuildWorkflow).toContain("npm run data:verify:published-integrity");
    expect(rebuildWorkflow).not.toContain("verify-gen4-publication-candidate");
  });

  it("retains the validated database and manifest as a downloadable artifact", async () => {
    const workflow = await readFile(".github/workflows/prepare-release-snapshot.yml", "utf8");
    expect(workflow).toContain("uses: actions/upload-artifact@v4");
    expect(workflow).toContain("name: canonical-release-database-${{ github.run_id }}");
    expect(workflow).toContain("rebuild-ci.db");
    expect(workflow).toContain("site-data/manifest.json");
    expect(workflow).toContain("if-no-files-found: error");
    expect(workflow).toContain("compression-level: 0");
    expect(workflow).toContain("retention-days: 90");
    const pagesVerification = workflow.indexOf("- name: Build and verify GitHub Pages artifact");
    const upload = workflow.indexOf("- name: Upload canonical release database");
    const removal = workflow.indexOf("- name: Remove disposable rebuild outputs");
    expect(upload).toBeGreaterThan(pagesVerification);
    expect(removal).toBeGreaterThan(upload);
  });
});

describe("release publication ref guard", () => {
  it("allows a non-default branch and rejects main, tags, and mismatched refs", () => {
    expect(() =>
      assertSafeReleasePublishRef({
        ref: "refs/heads/agent/release",
        refType: "branch",
        refName: "agent/release",
        defaultBranch: "main",
      }),
    ).not.toThrow();
    expect(() =>
      assertSafeReleasePublishRef({
        ref: "refs/heads/main",
        refType: "branch",
        refName: "main",
        defaultBranch: "main",
      }),
    ).toThrow(/default branch/);
    expect(() =>
      assertSafeReleasePublishRef({
        ref: "refs/tags/r24",
        refType: "tag",
        refName: "r24",
        defaultBranch: "main",
      }),
    ).toThrow(/branch ref/);
    expect(() =>
      assertSafeReleasePublishRef({
        ref: "refs/heads/main",
        refType: "branch",
        refName: "agent/release",
        defaultBranch: "main",
      }),
    ).toThrow(/not a branch ref/);
  });

  it("makes the release workflow use the guarded branch ref for publication", async () => {
    const workflow = await readFile(".github/workflows/prepare-release-snapshot.yml", "utf8");
    expect(workflow).toContain("run: npx tsx scripts/release/verify-release-ref.ts");
    expect(workflow).toContain('git push origin "HEAD:refs/heads/${GITHUB_REF_NAME}"');
    expect(workflow).toContain("RELEASE_REF_TYPE: ${{ github.ref_type }}");
    expect(workflow).toContain("DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}");
  });
});

describe("release snapshot promotion", () => {
  it("promotes the complete validated target set", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pokemon-release-promote-"));
    const staging = path.join(root, "staging");
    const target = path.join(root, "target");
    try {
      for (const relativePath of SNAPSHOT_PROMOTION_TARGETS) {
        await writeFixture(staging, path.join(relativePath, "payload.txt"), "new");
      }
      for (const relativePath of SNAPSHOT_PROMOTION_TARGETS) {
        await writeFixture(target, path.join(relativePath, "payload.txt"), "old");
      }

      await promoteSnapshot(staging, target);

      for (const relativePath of SNAPSHOT_PROMOTION_TARGETS) {
        await expect(
          readFile(path.join(target, relativePath, "payload.txt"), "utf8"),
        ).resolves.toBe("new");
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rolls back when the staged target set is incomplete", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pokemon-release-rollback-"));
    const staging = path.join(root, "staging");
    const target = path.join(root, "target");
    try {
      await writeFixture(staging, "site-data/payload.txt", "new");
      await writeFixture(target, "site-data/payload.txt", "old");
      await writeFixture(target, "public/data/payload.txt", "old data");

      await expect(promoteSnapshot(staging, target)).rejects.toThrow(
        /Staged snapshot is missing public\/data\./,
      );
      await expect(readFile(path.join(target, "site-data/payload.txt"), "utf8")).resolves.toBe(
        "old",
      );
      await expect(readFile(path.join(target, "public/data/payload.txt"), "utf8")).resolves.toBe(
        "old data",
      );
      await expect(readFile(path.join(staging, "site-data/payload.txt"), "utf8")).resolves.toBe(
        "new",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
