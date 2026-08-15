import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const workflowPath = new URL("../.github/workflows/deploy-pages.yml", import.meta.url);

async function workflow() {
  const contents = await readFile(workflowPath, "utf8");
  return contents.replace(/\r\n?/g, "\n");
}

describe("GitHub Pages production workflow security", () => {
  it("keeps deployment write permissions scoped to the deploy job", async () => {
    const contents = await workflow();

    expect(contents).toContain("permissions:\n  contents: read\n");
    expect(contents).not.toMatch(
      /permissions:\n\s+contents: read\n\s+pages: write\n\s+id-token: write\n\nconcurrency:/,
    );
    expect(contents).toMatch(
      /deploy:\n[\s\S]*?permissions:\n\s+pages: write\n\s+id-token: write\n/,
    );
  });

  it("bounds build, deploy, and smoke jobs with explicit timeouts", async () => {
    const contents = await workflow();

    expect(contents).toMatch(/build:\n\s+runs-on: ubuntu-latest\n\s+timeout-minutes: 15/);
    expect(contents).toMatch(/deploy:\n[\s\S]*?timeout-minutes: 5/);
    expect(contents).toMatch(/smoke:\n[\s\S]*?timeout-minutes: 5/);
  });
});
