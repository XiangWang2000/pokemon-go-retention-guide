import { runImport } from "./import-gen3";

runImport("312-386").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
