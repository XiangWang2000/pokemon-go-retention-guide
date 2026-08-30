import {
  buildLegacyReviewPayload,
  buildStrategyCounts,
  loadLegacyReviewContext,
  runLegacyReview,
  writeLegacyReview,
} from "./legacy-review-shared";

async function main() {
  const { rows, families, issues } = await loadLegacyReviewContext("121-151", 121, 151);
  const strategyCounts = buildStrategyCounts(families);
  const starmie = families.find((family) =>
    family.members.some((member) => member.form.formId === "121-kanto"),
  );
  const starmieRows = rows.filter((row) => row.formId === "121-kanto");
  const mewtwo = rows.filter((row) => row.dexNumber === 150);
  const mew = rows.find((row) => row.formId === "151-kanto" && row.variantKey === "NORMAL");
  const payload = buildLegacyReviewPayload("121-151", rows, families, issues, strategyCounts, {
    crossBatchIntegration: {
      familyKey: starmie?.familyKey,
      members: starmie?.members.map((member) => member.form.formId),
      isBatchTruncated: starmie?.isBatchTruncated,
      result:
        starmie?.members.map((member) => member.form.formId).join(",") === "120-kanto,121-kanto" &&
        !starmie.isBatchTruncated
          ? "PASS"
          : "FAIL",
    },
    versionBoundaries: {
      megaStarmieUnreleased: starmieRows.some(
        (row) => row.variantKey === "MEGA" && row.releaseStatus === "UNRELEASED",
      ),
      megaMewtwoXReleased: mewtwo.some(
        (row) =>
          row.formId === "150-kanto" &&
          row.variantKey === "MEGA_X" &&
          row.releaseStatus === "RELEASED",
      ),
      megaMewtwoYReleased: mewtwo.some(
        (row) =>
          row.formId === "150-kanto" &&
          row.variantKey === "MEGA_Y" &&
          row.releaseStatus === "RELEASED",
      ),
      armoredMewtwoHasNoMega: !mewtwo.some(
        (row) => row.formId === "150-armored" && row.variantKey.startsWith("MEGA"),
      ),
    },
    specialAcquisition: {
      mewDecision: mew?.decision,
      result: mew?.decision === "KEEP" ? "PASS" : "FAIL",
    },
  });
  const versionResult = Object.values(payload.versionBoundaries).every(Boolean) ? "PASS" : "FAIL";
  const lines = [
    "# Pokémon GO Retention Guide #121～#151 製作與驗收報告",
    "",
    `- 資料版本：${payload.dataVersion}`,
    `- 規則版本：${payload.rulesVersion}`,
    `- 物種／型態／版本：${payload.counts.species}／${payload.counts.forms}／${payload.counts.battleVariants}`,
    `- 狀態：${payload.status}`,
    "",
    "## 已完成",
    "",
    "- #120 海星星已接回 #121 寶石海星；超級寶石海星維持已公告但未開放。",
    "- 四種肯泰羅、三組地區鳥、裝甲超夢、超級超夢 X／Y 與所有 Mega／Max 版本均分開。",
    "- 已開放 Mega 的普通基底只保留實際用途候選，其餘普通重複可傳；夢幻依一次性特殊取得保留。",
    "- 水伊布、雷伊布與火伊布本體結論不受伊布後續分支 scoped HOLD 覆蓋。",
    "",
    "## 驗收",
    "",
    `- #120→#121 跨批整合：${payload.crossBatchIntegration.result}`,
    `- Mega／型態邊界：${versionResult}`,
    `- 夢幻特殊取得：${payload.specialAcquisition.result}`,
    `- Scoped HOLD：${payload.scopedHolds.length} 個家族。`,
  ];
  await writeLegacyReview("121-151", payload, lines);
  console.log("已產生 review/121-151.md 與 review/121-151.json。");
}

runLegacyReview(main);
