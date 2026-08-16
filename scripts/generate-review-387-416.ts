import { generateGen4Review } from "./generate-review-gen4";

generateGen4Review("387-416").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
