import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { forms650679 } from "@/data/candidates/gen6-650-679";
import { forms680709 } from "@/data/candidates/gen6-680-709";
import { forms710721 } from "@/data/candidates/gen6-710-721";
import {
  candidateReleaseEvidence650679,
  releasedMegaForms650679,
  releasedNormalForms650679,
  releasedPurifiedForms650679,
  releasedShadowForms650679,
} from "@/data/candidates/gen6-release-650-679";
import {
  candidateReleaseEvidence680709,
  explicitlyUnreleasedMegaForms680709,
  explicitlyUnreleasedNormalForms680709,
  releasedDynamaxForms680709,
  releasedMegaForms680709,
  releasedNormalForms680709,
  releasedPurifiedForms680709,
  releasedShadowForms680709,
  unknownNormalForms680709,
} from "@/data/candidates/gen6-release-680-709";
import {
  candidateReleaseEvidence710721,
  releasedMegaForms710721,
  releasedNormalForms710721,
  releasedPurifiedForms710721,
  releasedShadowForms710721,
} from "@/data/candidates/gen6-release-710-721";

const variantKeys = ["NORMAL", "SHADOW", "PURIFIED", "MEGA", "DYNAMAX", "GIGANTAMAX"] as const;

describe("Gen6 exact-form release evidence", () => {
  it("covers every one of the 161 candidate forms without using battle presence as release proof", () => {
    expect(forms650679).toHaveLength(106);
    expect(forms680709).toHaveLength(33);
    expect(forms710721).toHaveLength(22);

    for (const form of forms650679) {
      for (const variant of variantKeys) expect(() => candidateReleaseEvidence650679(form.id, variant)).not.toThrow();
    }
    for (const form of forms680709) {
      for (const variant of variantKeys) expect(() => candidateReleaseEvidence680709(form.id, variant)).not.toThrow();
    }
    for (const form of forms710721) {
      for (const variant of variantKeys) expect(() => candidateReleaseEvidence710721(form.id, variant)).not.toThrow();
    }
  });

  it("records #650-#679 ordinary forms as released while limiting Shadow/Purified and Mega to positive evidence", () => {
    expect(releasedNormalForms650679).toHaveLength(106);
    expect(releasedShadowForms650679).toHaveLength(14);
    expect(releasedPurifiedForms650679).toHaveLength(14);
    expect(releasedMegaForms650679).toEqual(new Set(["652-kalos", "655-kalos", "658-kalos"]));
    expect(candidateReleaseEvidence650679("664-ocean", "NORMAL").status).toBe("RELEASED");
    expect(candidateReleaseEvidence650679("676-heart", "NORMAL").status).toBe("RELEASED");
    expect(candidateReleaseEvidence650679("668-female", "MEGA").status).toBe("UNKNOWN");
    expect(candidateReleaseEvidence650679("650-kalos", "SHADOW").status).toBe("RELEASED");
    expect(candidateReleaseEvidence650679("664-ocean", "SHADOW").status).toBe("UNKNOWN");
  });

  it("keeps Aegislash and Hisuian Sliggoo/Goodra release states exact in #680-#709", () => {
    expect(releasedNormalForms680709).toHaveLength(31);
    expect(explicitlyUnreleasedNormalForms680709).toEqual(new Set(["706-hisui"]));
    expect(unknownNormalForms680709).toEqual(new Set(["705-hisui"]));
    expect(candidateReleaseEvidence680709("681-shield", "NORMAL").status).toBe("RELEASED");
    expect(candidateReleaseEvidence680709("681-blade", "NORMAL").status).toBe("RELEASED");
    expect(candidateReleaseEvidence680709("705-kalos", "NORMAL").status).toBe("RELEASED");
    expect(candidateReleaseEvidence680709("705-hisui", "NORMAL").status).toBe("UNKNOWN");
    expect(candidateReleaseEvidence680709("706-hisui", "NORMAL").status).toBe("UNRELEASED");
  });

  it("records only positive Shadow/Max evidence and explicit exact-compatible Mega negatives in #680-#709", () => {
    expect(releasedShadowForms680709).toHaveLength(8);
    expect(releasedPurifiedForms680709).toHaveLength(8);
    expect(releasedMegaForms680709).toEqual(new Set(["687-kalos"]));
    expect(explicitlyUnreleasedMegaForms680709).toEqual(new Set(["689-kalos", "691-kalos", "701-kalos"]));
    expect(releasedDynamaxForms680709).toEqual(new Set(["686-kalos", "687-kalos", "700-kalos"]));
    expect(candidateReleaseEvidence680709("687-kalos", "MEGA").status).toBe("RELEASED");
    expect(candidateReleaseEvidence680709("689-kalos", "MEGA").status).toBe("UNRELEASED");
    expect(candidateReleaseEvidence680709("686-kalos", "DYNAMAX").status).toBe("RELEASED");
    expect(candidateReleaseEvidence680709("705-hisui", "DYNAMAX").status).toBe("UNKNOWN");
  });

  it("keeps all #710-#721 normal forms released without cross-form Zygarde/Hoopa/size borrowing", () => {
    expect(releasedNormalForms710721).toHaveLength(22);
    for (const formId of [
      "710-small", "710-average", "710-large", "710-super",
      "711-small", "711-average", "711-large", "711-super",
      "713-hisui",
      "718-10-percent", "718-50-percent", "718-complete",
      "720-confined", "720-unbound",
    ]) {
      expect(candidateReleaseEvidence710721(formId, "NORMAL").status).toBe("RELEASED");
    }
  });

  it("limits late-Gen6 Shadow/Purified to Noibat line and Mega to Diancie", () => {
    expect(releasedShadowForms710721).toEqual(new Set(["714-kalos", "715-kalos"]));
    expect(releasedPurifiedForms710721).toEqual(new Set(["714-kalos", "715-kalos"]));
    expect(releasedMegaForms710721).toEqual(new Set(["719-kalos"]));
    expect(candidateReleaseEvidence710721("719-kalos", "MEGA").status).toBe("RELEASED");
    expect(candidateReleaseEvidence710721("718-50-percent", "MEGA").status).toBe("UNKNOWN");
    expect(candidateReleaseEvidence710721("718-complete", "DYNAMAX").status).toBe("UNKNOWN");
  });

  it("keeps every Gen6 Gigantamax state UNKNOWN and never treats roster absence as an explicit negative", () => {
    for (const form of forms650679) expect(candidateReleaseEvidence650679(form.id, "GIGANTAMAX").status).toBe("UNKNOWN");
    for (const form of forms680709) expect(candidateReleaseEvidence680709(form.id, "GIGANTAMAX").status).toBe("UNKNOWN");
    for (const form of forms710721) expect(candidateReleaseEvidence710721(form.id, "GIGANTAMAX").status).toBe("UNKNOWN");
  });

  it("stores audited source manifests with the same conservative boundaries", () => {
    const first = JSON.parse(readFileSync("research_notes/sources/release-650-679.json", "utf8")) as { confirmed: Record<string, unknown>; boundary: string };
    const middle = JSON.parse(readFileSync("research_notes/sources/release-680-709.json", "utf8")) as { confirmed: Record<string, unknown>; boundary: string };
    const last = JSON.parse(readFileSync("research_notes/sources/release-710-721.json", "utf8")) as { confirmed: Record<string, unknown>; boundary: string };
    expect(first.confirmed).toMatchObject({ normalReleasedCount: 106, shadowReleasedCount: 14, purifiedReleasedCount: 14 });
    expect(middle.confirmed).toMatchObject({ formCount: 33, normalReleasedCount: 31, shadowReleasedCount: 8, purifiedReleasedCount: 8 });
    expect(last.confirmed).toMatchObject({ formCount: 22, normalReleasedCount: 22 });
    expect(`${first.boundary} ${middle.boundary} ${last.boundary}`).toContain("UNKNOWN");
  });
});
