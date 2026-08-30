import {
  buildLegacyReviewPayload,
  buildStrategyCounts,
  loadLegacyReviewContext,
  runLegacyReview,
  writeLegacyReview,
} from "./legacy-review-shared";

async function main() {
  const { rows, families, issues } = await loadLegacyReviewContext("091-120", 91, 120);
  const strategyCounts = buildStrategyCounts(families);
  const shellder = families.find((family) =>
    family.members.some((member) => member.form.formId === "091-kanto"),
  );
  const gengar = rows.filter((row) => row.formId === "094-kanto");
  const payload = buildLegacyReviewPayload("091-120", rows, families, issues, strategyCounts, {
    crossBatchIntegration: {
      familyKey: shellder?.familyKey,
      members: shellder?.members.map((member) => member.form.formId),
      isBatchTruncated: shellder?.isBatchTruncated,
      result:
        shellder?.members.map((member) => member.form.formId).join(",") === "090-kanto,091-kanto" &&
        !shellder.isBatchTruncated
          ? "PASS"
          : "FAIL",
    },
    versionBoundaries: {
      gengarVariants: gengar.map((row) => ({
        variantKey: row.variantKey,
        releaseStatus: row.releaseStatus,
        decision: row.decision,
      })),
      result: ["MEGA", "DYNAMAX", "GIGANTAMAX", "SHADOW"].every((variantKey) =>
        gengar.some((row) => row.variantKey === variantKey && row.releaseStatus === "RELEASED"),
      )
        ? "PASS"
        : "FAIL",
    },
  });
  const lines = [
    "# Pokémon GO Retention Guide #091～#120 製作與驗收報告",
    "",
    `- 資料版本：${payload.dataVersion}`,
    `- 規則版本：${payload.rulesVersion}`,
    `- 物種／型態／版本：${payload.counts.species}／${payload.counts.forms}／${payload.counts.battleVariants}`,
    `- 狀態：${payload.status}`,
    "",
    "## 已完成",
    "",
    "- #090 大舌貝已接回 #091 刺甲貝，舊 provisional HOLD／issue 不再覆蓋完整家族結論。",
    "- 地區型態、活動限定進化、普通、暗影、淨化、Mega、極巨與超極巨均分開。",
    "- 超級寶石海星只記為已公告、尚未開放；暗影海星星則依官方來源保留推出狀態。",
    "",
    "## 驗收",
    "",
    `- #090→#091 跨批整合：${payload.crossBatchIntegration.result}`,
    `- 耿鬼版本邊界：${payload.versionBoundaries.result}`,
    `- Scoped HOLD：${payload.scopedHolds.length} 個家族。`,
  ];
  await writeLegacyReview("091-120", payload, lines);
  console.log("已產生 review/091-120.md 與 review/091-120.json。");
}

runLegacyReview(main);
