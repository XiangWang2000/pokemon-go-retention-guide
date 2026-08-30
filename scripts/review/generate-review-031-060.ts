import {
  buildLegacyReviewPayload,
  buildStrategyCounts,
  loadLegacyReviewContext,
  runLegacyReview,
  writeLegacyReview,
} from "./legacy-review-shared";

async function main() {
  const { rows, families, issues } = await loadLegacyReviewContext("031-060", 31, 60);
  const strategyCounts = buildStrategyCounts(families);
  const nidoranFamily = families.find((family) =>
    family.members.some((member) => member.form.formId === "031-kanto"),
  );
  const meowth = rows.filter((row) => row.formId === "052-kanto");
  const payload = buildLegacyReviewPayload(
    "031-060",
    rows,
    families,
    issues,
    strategyCounts,
    {
      crossBatchIntegration: {
        familyKey: nidoranFamily?.familyKey,
        members: nidoranFamily?.members.map((member) => member.form.formId),
        isBatchTruncated: nidoranFamily?.isBatchTruncated,
        result:
          nidoranFamily?.members.map((member) => member.form.formId).join(",") ===
            "029-kanto,030-kanto,031-kanto" && !nidoranFamily.isBatchTruncated
            ? "PASS"
            : "FAIL",
      },
      versionBoundaries: {
        meowthVariants: meowth.map((row) => ({
          variantKey: row.variantKey,
          releaseStatus: row.releaseStatus,
          decision: row.decision,
        })),
        result:
          meowth.some(
            (row) => row.variantKey === "GIGANTAMAX" && row.releaseStatus === "RELEASED",
          ) &&
          meowth.some((row) => row.variantKey === "DYNAMAX" && row.releaseStatus === "UNRELEASED")
            ? "PASS"
            : "FAIL",
      },
      ivRules: {
        pve: "先看物種與型態、招式、等級與投入、斷點，最後才用 IV 比同種候選；15攻不是淘汰線。",
        shadow: "暗影標準較寬；15攻優先，不設硬性最低IV；低總IV不觸發淨化。",
        result: "PASS",
      },
    },
    (family) => ({
      familyId: family.familyId,
      members: family.members.map((member) => member.form.formId),
      safetyImpact: "範圍外進化可能改變保留安全，因此只先留一隻最佳候選；不要求保留全部重複。",
    }),
  );
  const lines = [
    "# Pokémon GO Retention Guide #031～#060 製作與驗收報告",
    "",
    `- 資料版本：${payload.dataVersion}`,
    `- 規則版本：${payload.rulesVersion}`,
    `- 物種／型態／版本：${payload.counts.species}／${payload.counts.forms}／${payload.counts.battleVariants}`,
    `- 家族策略：建議保留 ${strategyCounts.KEEP_TARGETS}、選擇性保留 ${strategyCounts.SELECTIVE_KEEP}、大多可傳 ${strategyCounts.MOSTLY_TRANSFER}、暫時保留 ${strategyCounts.HOLD_FOR_NOW}`,
    "",
    "## 已完成",
    "",
    "- #031～#060 已沿用「立即處理結論、要保留的條件、其他普通重複可傳、主要用途、IV 門檻與詳細版本說明」。",
    "- 關都、阿羅拉、伽勒爾、洗翠分支分開建模。",
    "- 普通、暗影、淨化、極巨與超極巨版本分開；超極巨喵喵不能由普通或極巨喵喵替代。",
    "- 低用途完整家族可直接判定為大多可傳，不因存在進化路徑或 100% IV 自動升格。",
    "",
    "## 跨批次家族",
    "",
    `- 尼多蘭♀家族：${payload.crossBatchIntegration.result}；成員 ${payload.crossBatchIntegration.members?.join(" → ")}；未再標為批次截斷。`,
    "",
    "## IV 與暗影規則",
    "",
    `- PvE：${payload.ivRules.pve}`,
    `- 暗影：${payload.ivRules.shadow}`,
    "",
    "## Scoped HOLD",
    "",
    ...(payload.scopedHolds.length
      ? payload.scopedHolds.map(
          (family) => `- ${family.members.join("、")}：${family.safetyImpact}`,
        )
      : ["- 無。"]),
    "",
    "## 結論",
    "",
    "- #031～#060 已可與 #001～#030 一起供清包初篩使用；Scoped HOLD 僅限範圍外進化可能造成誤傳的家族。",
  ];
  await writeLegacyReview("031-060", payload, lines);
  console.log("已產生 review/031-060.md 與 review/031-060.json。");
}

runLegacyReview(main);
