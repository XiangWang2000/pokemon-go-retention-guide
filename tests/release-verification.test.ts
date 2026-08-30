import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteSnapshotManifest } from "@/lib/data";
import { CURRENT_RELEASE_CONTRACT, expectedReleaseReviewPaths } from "@/config/release-contract";
import type { SnapshotManifest } from "../scripts/release/check-static-snapshot";

const { verifyStaticSnapshot } = vi.hoisted(() => ({
  verifyStaticSnapshot: vi.fn(),
}));
const { validateReviewConsistency } = vi.hoisted(() => ({
  validateReviewConsistency: vi.fn(),
}));

vi.mock("../scripts/release/check-static-snapshot", () => ({ verifyStaticSnapshot }));
vi.mock("../scripts/review/validate-review-consistency", () => ({ validateReviewConsistency }));

import { verifyRelease } from "../scripts/release/verify-release";

async function writeFixture(root: string, relativePath: string, value: string) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, "utf8");
}

async function writeReleaseReviewFixture(root: string) {
  await writeFixture(
    root,
    "site-data/dashboard.json",
    JSON.stringify([{ dexNumber: CURRENT_RELEASE_CONTRACT.minDex }]),
  );
  for (const reviewPath of expectedReleaseReviewPaths()) {
    await writeFixture(root, reviewPath, "{}");
  }
}

describe("release verification layers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the typed artifact manifest returned by the snapshot checker", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pokemon-release-verify-"));
    try {
      const manifest: SnapshotManifest = siteSnapshotManifest;
      await writeReleaseReviewFixture(root);

      verifyStaticSnapshot.mockResolvedValueOnce(manifest);
      validateReviewConsistency.mockResolvedValueOnce({
        trueDataPending: CURRENT_RELEASE_CONTRACT.expectedCounts.trueDataPending,
      });

      const result = await verifyRelease({
        snapshotRoot: root,
        reviewRoot: root,
        databaseRoot: root,
      });

      expect(result.manifest).toBe(manifest);
      expect(verifyStaticSnapshot).toHaveBeenCalledWith({
        snapshotRoot: root,
        databaseRoot: root,
      });
      expect(validateReviewConsistency).toHaveBeenCalledWith({
        dataRoot: root,
        reviewRoot: root,
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps current scope policy in the release verifier", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pokemon-release-verify-"));
    try {
      const manifest: SnapshotManifest = { ...siteSnapshotManifest, batch: "001-416" };
      await writeReleaseReviewFixture(root);
      verifyStaticSnapshot.mockResolvedValueOnce(manifest);
      validateReviewConsistency.mockResolvedValueOnce({
        trueDataPending: CURRENT_RELEASE_CONTRACT.expectedCounts.trueDataPending,
      });

      await expect(
        verifyRelease({ snapshotRoot: root, reviewRoot: root, databaseRoot: root }),
      ).rejects.toThrow("Release snapshot scope is stale.");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps current dataVersion policy in the release verifier", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pokemon-release-verify-"));
    try {
      const manifest: SnapshotManifest = {
        ...siteSnapshotManifest,
        dataVersion: "2026.08.15-r24",
      };
      await writeReleaseReviewFixture(root);
      verifyStaticSnapshot.mockResolvedValueOnce(manifest);
      validateReviewConsistency.mockResolvedValueOnce({
        trueDataPending: CURRENT_RELEASE_CONTRACT.expectedCounts.trueDataPending,
      });

      await expect(
        verifyRelease({ snapshotRoot: root, reviewRoot: root, databaseRoot: root }),
      ).rejects.toThrow("Release snapshot dataVersion is stale.");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
