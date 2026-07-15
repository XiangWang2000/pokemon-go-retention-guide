import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Prisma SQLite 資料模型", () => {
  it("同編號多型態可同時存在且不互相覆蓋", async () => {
    const forms = await prisma.pokemonForm.findMany({ where: { species: { dexNumber: 19 } } });
    expect(forms.map((item) => item.id).sort()).toEqual(["019-alola", "019-kanto"]);
  });
  it("Mega X 與 Y 可分開", async () => {
    const variants = await prisma.battleVariant.findMany({
      where: { pokemonFormId: "006-kanto", variantKey: { in: ["MEGA_X", "MEGA_Y"] } },
    });
    expect(variants).toHaveLength(2);
  });
  it("Dynamax 與普通版本可分開", async () => {
    const variants = await prisma.battleVariant.findMany({
      where: { pokemonFormId: "001-kanto", variantKey: { in: ["NORMAL", "DYNAMAX"] } },
    });
    expect(new Set(variants.map((item) => item.variantKey))).toEqual(
      new Set(["NORMAL", "DYNAMAX"]),
    );
  });
  it("同一招式模型可被多個型態引用", async () => {
    const moveId = "test-shared-move";
    await prisma.move.deleteMany({ where: { id: moveId } });
    try {
      await prisma.move.create({
        data: {
          id: moveId,
          moveKey: moveId,
          nameEn: "Shared Test Move",
          nameZhTw: "共用測試招式",
          moveType: "NORMAL",
          moveCategory: "FAST",
          notesZhTw: "僅供資料模型測試。",
        },
      });
      await prisma.variantMove.createMany({
        data: [
          {
            id: "test-shared-move-bulbasaur",
            battleVariantId: "001-kanto-normal",
            moveId,
            availabilityType: "NORMAL",
            sourceNotesZhTw: "測試資料",
          },
          {
            id: "test-shared-move-ivysaur",
            battleVariantId: "002-kanto-normal",
            moveId,
            availabilityType: "NORMAL",
            sourceNotesZhTw: "測試資料",
          },
        ],
      });
      expect(await prisma.variantMove.count({ where: { moveId } })).toBe(2);
    } finally {
      await prisma.move.deleteMany({ where: { id: moveId } });
    }
  });
});

afterAll(async () => prisma.$disconnect());
