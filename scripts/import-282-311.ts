import { runImport } from "./import-gen3";

runImport("282-311").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
