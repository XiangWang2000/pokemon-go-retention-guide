import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages build cache source", () => {
  it("keys both Pages workflows on the compact static route dataset", () => {
    for (const workflowPath of [
      ".github/workflows/verify-pages-pr.yml",
      ".github/workflows/deploy-pages.yml",
    ]) {
      const workflow = readFileSync(workflowPath, "utf8");
      expect(workflow).toContain("site-data/auditSummary.json");
      expect(workflow).not.toContain("site-data/dashboard.json");
    }
  });
});
