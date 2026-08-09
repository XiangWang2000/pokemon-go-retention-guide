import { runReview } from "./generate-review-gen3";

runReview("282-311").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
