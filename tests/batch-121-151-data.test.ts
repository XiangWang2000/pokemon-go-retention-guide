import { describe, expect, it } from "vitest";
import {
  announcedUnreleasedMegaForms121151,
  conditionalKeepOverrides121151,
  evolutionPairs121151,
  forms121151,
  releasedDynamaxForms121151,
  releasedGigantamaxForms121151,
  releasedMegaForms121151,
  releasedMegaXForms121151,
  releasedMegaYForms121151,
  releasedShadowForms121151,
  specialAcquisitionForms121151,
  specialVariants121151,
  species121151,
} from "@/data/batch-121-151";

describe("#121～#151 批次來源資料", () => {
  it("涵蓋 31 個物種、39 個獨立型態與 165 個版本", () => {
    expect(species121151.map((species) => species.dexNumber)).toEqual(
      Array.from({ length: 31 }, (_, index) => index + 121),
    );
    expect(forms121151).toHaveLength(39);
    expect(new Set(forms121151.map((form) => form.id)).size).toBe(39);
    expect(forms121151.length * 4 + specialVariants121151.length).toBe(165);
    expect(specialVariants121151).toHaveLength(9);
  });

  it("把 #120 海星星接到 #121 寶石海星，Mega 仍為已公告但未開放", () => {
    expect(evolutionPairs121151).toContainEqual(["120-kanto", "121-kanto"]);
    expect(announcedUnreleasedMegaForms121151.get("121-kanto")).toBe("2026-08-22");
    expect(specialVariants121151).toContainEqual(
      expect.objectContaining({ id: "121-kanto-mega", variantKey: "MEGA", released: false }),
    );
  });

  it("四種肯泰羅型態彼此分開，且全數沒有 Shadow／Purified 推出依據", () => {
    const tauros = forms121151.filter((form) => form.dexNumber === 128);
    expect(tauros.map((form) => form.id)).toEqual([
      "128-kanto",
      "128-paldea-combat",
      "128-paldea-blaze",
      "128-paldea-aqua",
    ]);
    for (const form of tauros) {
      expect(releasedShadowForms121151.has(form.id), `${form.id}-shadow`).toBe(false);
      expect(releasedShadowForms121151.has(form.id), `${form.id}-purified`).toBe(false);
    }
  });

  it("維持 Dmax、Gmax、Mega 與超夢 X／Y 的靜態邊界", () => {
    expect([...releasedDynamaxForms121151]).toEqual([
      "133-kanto",
      "134-kanto",
      "135-kanto",
      "136-kanto",
      "144-kanto",
      "145-kanto",
      "146-kanto",
    ]);
    expect([...releasedGigantamaxForms121151]).toEqual(["131-kanto", "143-kanto"]);
    expect([...releasedMegaForms121151]).toEqual([
      "127-kanto",
      "130-kanto",
      "142-kanto",
      "149-kanto",
    ]);
    expect([...releasedMegaXForms121151]).toEqual(["150-kanto"]);
    expect([...releasedMegaYForms121151]).toEqual(["150-kanto"]);
    expect(specialVariants121151).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "150-kanto-mega-x", variantKey: "MEGA_X" }),
        expect.objectContaining({ id: "150-kanto-mega-y", variantKey: "MEGA_Y" }),
      ]),
    );
  });

  it("裝甲超夢不繼承 Mega，夢幻以一次性特殊取得保留", () => {
    expect(forms121151).toContainEqual(
      expect.objectContaining({ id: "150-armored", formKey: "ARMORED" }),
    );
    expect(specialVariants121151.some((variant) => variant.formId === "150-armored")).toBe(false);
    expect(specialAcquisitionForms121151.has("151-kanto")).toBe(true);
    expect(conditionalKeepOverrides121151.get("151-kanto-normal")?.ruleKey).toBe(
      "SPECIAL_ACQUISITION",
    );
  });
});
