import { runImport } from "./import-gen3";

async function main() {
  for (const batch of ["312-341", "342-371", "372-386"] as const) {
    await runImport(batch);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
