import { runImport } from "./import-gen3";

runImport("252-281").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
