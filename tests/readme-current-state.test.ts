import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README current-state contract", () => {
  const readme = readFileSync("README.md", "utf8");

  it("points maintainers at the current production and release sources of truth", () => {
    expect(readme).toContain("https://xiangwang2000.github.io/pokemon-go-retention-guide/");
    expect(readme).toContain("src/config/data-scope.ts");
    expect(readme).toContain("src/config/release.ts");
    expect(readme).toContain("site-data/manifest.json");
    expect(readme).toContain("src/iv/strategy.ts");
    expect(readme).toContain("npm run pages:verify");
  });

  it("does not advertise stale production or batch guidance", () => {
    expect(readme).not.toContain("目前 #001～#251");
    expect(readme).not.toContain("網站已改用 Sites 官方 Vinext");
    expect(readme).not.toContain("pokemon-go-retention-guide.wang890921.chatgpt.site");
  });

  it("documents the current PvE IV policy without a hard 15-attack cutoff", () => {
    expect(readme).toContain("15 攻是同種候選的優先條件，不是硬性淘汰門檻");
    expect(readme).toContain("14 攻的高整體 IV 個體仍可保留");
    expect(readme).toContain("暗影 PvE");
    expect(readme).toContain("不設硬性最低 IV");
  });
});
