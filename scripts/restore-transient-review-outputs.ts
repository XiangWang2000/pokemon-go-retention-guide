import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { expectedReleaseReviewPaths } from "../src/config/release-contract";

const root = process.cwd();

function git(args: string[]) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" })
    .split(/\r?\n/)
    .map((filePath) => filePath.trim().replaceAll("\\", "/"))
    .filter(Boolean);
}

const trackedChanges = git(["diff", "--name-only", "--", "review"]);
const untrackedChanges = git(["ls-files", "--others", "--exclude-standard", "--", "review"]);
const changed = [...new Set([...trackedChanges, ...untrackedChanges])];
const expected = expectedReleaseReviewPaths();
const transient = changed.filter(
  (filePath) => filePath.startsWith("review/") && !expected.has(filePath),
);
const trackedTransient = transient.filter((filePath) => trackedChanges.includes(filePath));
if (trackedTransient.length) {
  execFileSync("git", ["restore", "--worktree", "--", ...trackedTransient], {
    cwd: root,
    stdio: "inherit",
  });
}

for (const filePath of transient.filter((candidate) => !trackedChanges.includes(candidate))) {
  const absolutePath = path.resolve(root, filePath);
  const relativePath = path.relative(path.join(root, "review"), absolutePath);
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Refusing to remove a review path outside review/: ${filePath}.`);
  }
  await rm(absolutePath, { force: true });
}

if (transient.length) {
  console.log(`Restored ${transient.length} transient review output(s).`);
}
