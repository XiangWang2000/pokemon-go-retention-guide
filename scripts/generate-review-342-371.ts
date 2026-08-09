import { runReview } from "./generate-review-gen3";

runReview("342-371").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
