import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/back-to-top.tsx", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

describe("mobile back-to-top control", () => {
  it("mounts globally but stays limited to smaller screens", () => {
    expect(layout).toContain('import { BackToTop } from "@/components/back-to-top"');
    expect(layout).toContain("<BackToTop />");
    expect(source).toContain("lg:hidden");
    expect(source).toContain('aria-label="回到頁面頂端"');
  });

  it("uses passive scroll observation and respects motion preferences", () => {
    expect(source).toContain('addEventListener("scroll", updateVisibility, { passive: true })');
    expect(source).toContain("BACK_TO_TOP_THRESHOLD = 640");
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain('behavior: reduceMotion ? "auto" : "smooth"');
  });

  it("keeps the floating control above the mobile safe area", () => {
    expect(source).toContain("env(safe-area-inset-bottom)");
    expect(source).toContain("size-11");
  });
});
