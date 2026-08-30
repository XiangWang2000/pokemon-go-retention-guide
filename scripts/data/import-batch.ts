import { spawn } from "node:child_process";
import { BATCH_REGISTRY, batchImportArgs, getBatchByKey } from "../../src/config/batch-registry";
import { assertDisposableDatabase, getDatabaseUrl } from "../../src/lib/database";

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

export function getBatchImportInvocation(batch: string) {
  const entry = getBatchByKey(batch);
  return { entry, args: batchImportArgs(entry) };
}

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: process.env,
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

async function main() {
  assertDisposableDatabase(getDatabaseUrl());
  const batch = process.argv[2];
  if (!batch || process.argv.length > 3) {
    throw new Error(
      `Usage: tsx scripts/data/import-batch.ts <batch>; expected one of ${BATCH_REGISTRY.map((entry) => entry.key).join(", ")}.`,
    );
  }

  const { entry, args } = getBatchImportInvocation(batch);
  console.log(`Importing batch ${entry.key} with ${entry.import.adapter} adapter.`);
  await run(npx, args);
}

const scriptPath = process.argv[1]?.replaceAll("\\", "/");
if (scriptPath?.endsWith("/scripts/data/import-batch.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
