import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("review validation CI contract", () => {
  it("validates committed snapshots without a runtime database", () => {
    const validator = readFileSync("scripts/validate-review-consistency.ts", "utf8");

    expect(validator).toContain('"site-data/dashboard.json"');
    expect(validator).toContain('"site-data/review.json"');
    expect(validator).not.toContain("data-prisma");
    expect(validator).not.toContain("../src/lib/prisma");
  });

  it("runs the shared release verification contract in PR and production build workflows", () => {
    for (const path of [
      ".github/workflows/verify-pages-pr.yml",
      ".github/workflows/deploy-pages.yml",
    ]) {
      const workflow = readFileSync(path, "utf8");
      expect(workflow).toContain("- name: Release verification contract");
      expect(workflow).toContain("run: npm run release:verify");
      expect(workflow).not.toContain("npm run review:validate");
    }
  });
});
