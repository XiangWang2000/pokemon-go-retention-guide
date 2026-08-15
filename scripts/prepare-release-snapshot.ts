import { access, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { CURRENT_RELEASE_CONTRACT } from "../src/config/release-contract";
import { verifyRelease } from "./verify-release";

export const SNAPSHOT_PROMOTION_TARGETS = [
  ...CURRENT_RELEASE_CONTRACT.snapshot.generatedRoots,
] as const;

const root = process.cwd();
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runSnapshotGenerator(stagingRoot: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(npx, ["tsx", "scripts/generate-static-snapshot.ts"], {
      cwd: root,
      env: { ...process.env, SNAPSHOT_OUTPUT_ROOT: stagingRoot },
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Snapshot generation exited with ${String(code)}.`)),
    );
  });
}

export async function promoteSnapshot(stagingRoot: string, targetRoot = process.cwd()) {
  const staging = path.resolve(stagingRoot);
  const target = path.resolve(targetRoot);
  await mkdir(path.join(target, ".tmp"), { recursive: true });
  const backupRoot = await mkdtemp(path.join(target, ".tmp", "snapshot-backup-"));
  const moved: string[] = [];

  try {
    for (const relativePath of SNAPSHOT_PROMOTION_TARGETS) {
      const stagedPath = path.join(staging, relativePath);
      if (!(await exists(stagedPath))) {
        throw new Error(`Staged snapshot is missing ${relativePath}.`);
      }

      const targetPath = path.join(target, relativePath);
      const backupPath = path.join(backupRoot, relativePath);
      moved.push(relativePath);
      if (await exists(targetPath)) {
        await mkdir(path.dirname(backupPath), { recursive: true });
        await rename(targetPath, backupPath);
      }
      await mkdir(path.dirname(targetPath), { recursive: true });
      await rename(stagedPath, targetPath);
    }
  } catch (error) {
    for (const relativePath of moved.reverse()) {
      const targetPath = path.join(target, relativePath);
      const backupPath = path.join(backupRoot, relativePath);
      await rm(targetPath, { recursive: true, force: true });
      if (await exists(backupPath)) await rename(backupPath, targetPath);
    }
    throw error;
  } finally {
    await rm(backupRoot, { recursive: true, force: true });
  }
}

async function main() {
  await mkdir(path.join(root, ".tmp"), { recursive: true });
  const stagingRoot = await mkdtemp(path.join(root, ".tmp", "release-snapshot-"));
  try {
    await runSnapshotGenerator(stagingRoot);
    await verifyRelease({
      snapshotRoot: stagingRoot,
      reviewRoot: root,
      databaseRoot: root,
    });
    await promoteSnapshot(stagingRoot, root);
    console.log("Release snapshot validated and promoted.");
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/prepare-release-snapshot.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
