import { runReview342371Current } from "./generate-review-342-371-current";

runReview342371Current().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
