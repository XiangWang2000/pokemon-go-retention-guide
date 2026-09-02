import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeDataLoader } from "@/components/home-data-loader";

describe("首頁快速判定導覽", () => {
  it("先提供單隻搜尋，再把家族分類收在次要導覽", () => {
    const html = renderToStaticMarkup(createElement(HomeDataLoader));
    const expected = [
      ["KEEP_TARGETS", "有明確保留目標"],
      ["SELECTIVE_KEEP", "只留符合條件者"],
      ["MOSTLY_TRANSFER", "普通重複可傳"],
      ["HOLD_FOR_NOW", "資料不足，先不要傳"],
    ] as const;

    expect(html).toContain("這隻寶可夢可以傳嗎？");
    expect(html).toContain('aria-label="直接搜尋寶可夢保留結論"');
    expect(html).toContain('action="#evaluation-results"');
    expect(html).toContain('name="q"');
    expect(html).toContain("直接看結論");
    expect(html).toContain("<details");
    expect(html).toContain("依家族處理方式分類瀏覽");
    expect(html).toContain("縮寫與數字怎麼看");
    expect(html).toContain("Player versus Environment（玩家對環境）");
    expect(html).toContain("PvPoke 的物種排名是兩件事");
    expect(html).toContain("DPS／TDO");
    expect(html).toContain("Charged Move Priority");
    expect(html).toContain("Same-Type Attack Bonus");
    expect(html).toContain("極巨化／超極巨化");

    expect(html.indexOf('aria-label="直接搜尋寶可夢保留結論"')).toBeLessThan(
      html.indexOf("依家族處理方式分類瀏覽"),
    );

    for (const [decision, label] of expected) {
      expect(html).toContain(`href="?decision=${decision}#evaluation-results"`);
      expect(html).toContain(`aria-label="只看「${label}」的進化家族"`);
    }

    expect(html).not.toContain("選擇性保留");
    expect(html).not.toContain("大多可傳");
  });
});
