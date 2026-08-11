import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/overview/pokemon-identity-cell.tsx", "utf8");

describe("Pokémon identity disclosure", () => {
  it("uses one accessible button for the icon and identity text", () => {
    expect(source.match(/<button/g)?.length).toBe(1);
    expect(source).toContain("onClick={onToggle}");
    expect(source).toContain("aria-expanded={expanded}");
    expect(source).toContain('aria-controls={controlsId ?? `form-detail-${form.formId}`}');
    expect(source).toContain('aria-label={`${expanded ? "收合" : "展開"}${form.nameZhTw}詳細資料`}');
  });

  it("keeps the 44 px disclosure icon target while making the name area clickable", () => {
    expect(source).toContain("group flex min-w-0 items-start gap-2");
    expect(source).toContain("inline-flex size-11 shrink-0");
    expect(source).toContain("{form.nameZhTw}");
    expect(source).toContain("group-hover:text-[var(--primary)]");
  });
});
