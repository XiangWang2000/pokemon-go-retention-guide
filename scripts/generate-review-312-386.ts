import { runReview } from "./generate-review-gen3";

async function main() {
  for (const batch of ["312-341", "342-371", "372-386"] as const) {
    await runReview(batch);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
