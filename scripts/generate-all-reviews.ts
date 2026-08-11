import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { REVIEW_BATCH_FILES, reviewBatchGeneratorPath } from "../src/config/review-batches";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

for (const [batch] of REVIEW_BATCH_FILES) {
  const generator = reviewBatchGeneratorPath(batch);
  if (!existsSync(generator)) {
    throw new Error(`Missing review generator for ${batch}: ${generator}`);
  }

  console.log(`Generating review batch ${batch} with ${generator}`);
  const result = spawnSync(npmCommand, ["exec", "--", "tsx", generator], {
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
