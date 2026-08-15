import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { BATCH_REGISTRY } from "../src/config/batch-registry";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(" ")} exited with ${code}.`)),
    );
  });
}

async function assertReviewOutput(entry: (typeof BATCH_REGISTRY)[number]) {
  const path = entry.review.jsonPath;
  if (!existsSync(path) || !existsSync(entry.review.markdownPath)) {
    throw new Error(`Review generator did not produce the configured outputs for ${entry.key}.`);
  }
  const payload = JSON.parse(await readFile(path, "utf8")) as { batch?: unknown };
  if (payload.batch !== entry.key) {
    throw new Error(`${path}: expected batch ${entry.key}, received ${String(payload.batch)}.`);
  }
}

async function main() {
  for (const entry of BATCH_REGISTRY) {
    const { key: batch, review } = entry;
    const generator = review.generator;
    if (!existsSync(generator)) {
      throw new Error(`Missing review generator for ${batch}: ${generator}`);
    }

    console.log(`Generating review batch ${batch} with ${generator}`);
    await run(npmCommand, ["exec", "--", "tsx", generator]);
    await assertReviewOutput(entry);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
