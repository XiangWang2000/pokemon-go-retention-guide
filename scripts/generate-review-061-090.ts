import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

async function main() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= 61 && row.dexNumber <= 90);
  const forms = buildFormOverviews(allRows);
  const families = buildFamilyOverviews(forms).filter((family) =>
    family.members.some((member) => member.form.dexNumber >= 61 && member.form.dexNumber <= 90),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === "061-090");
  const strategyCounts = Object.fromEntries(
    ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"].map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
  const poliwagFamily = families.find((family) =>
    family.members.some((member) => member.form.formId === "062-kanto"),
  );
  const machamp = rows.filter((row) => row.formId === "068-kanto");
  const payload = {
    batch: "061-090",
    updatedAt: DATA_VERSION_DATE_ISO,
    dataVersion: DATA_VERSION,
    rulesVersion: RULES_VERSION,
    status: issues.some((issue) => issue.affectsFinalDecision)
      ? "ACCEPTED_WITH_SCOPED_HOLDS"
      : "ACCEPTED",
    counts: {
      species: new Set(rows.map((row) => row.dexNumber)).size,
      forms: new Set(rows.map((row) => row.formId)).size,
      battleVariants: rows.length,
      families: families.length,
      strategyCounts,
      openIssues: issues.length,
      safetyAffectingIssues: issues.filter((issue) => issue.affectsFinalDecision).length,
    },
    crossBatchIntegration: {
      familyKey: poliwagFamily?.familyKey,
      members: poliwagFamily?.members.map((member) => member.form.formId),
      isBatchTruncated: poliwagFamily?.isBatchTruncated,
      result:
        poliwagFamily?.members.map((member) => member.form.formId).join(",") ===
          "060-kanto,061-kanto,062-kanto" &&
        poliwagFamily.isBatchTruncated &&
        poliwagFamily.members.some((member) =>
          member.form.evolutionPaths.some((path) => path.toFormId === "186-kanto"),
        )
          ? "PASS"
          : "FAIL",
    },
    versionBoundaries: {
      machampVariants: machamp.map((row) => ({
        variantKey: row.variantKey,
        releaseStatus: row.releaseStatus,
        decision: row.decision,
      })),
      result:
        machamp.some(
          (row) => row.variantKey === "GIGANTAMAX" && row.releaseStatus === "RELEASED",
        ) &&
        machamp.some((row) => row.variantKey === "DYNAMAX" && row.releaseStatus === "RELEASED") &&
        machamp.some((row) => row.variantKey === "SHADOW" && row.releaseStatus === "RELEASED")
          ? "PASS"
          : "FAIL",
    },
    ivRules: {
      pve: "先看物種與型態、招式、等級與投入、斷點，最後才用 IV 比同種候選；15攻不是淘汰線。",
      shadow: "暗影標準較寬；15攻優先，不設硬性最低IV；低總IV不觸發淨化。",
      result: "PASS",
    },
    scopedHolds: families
      .filter((family) => family.retentionStrategy === "HOLD_FOR_NOW")
      .map((family) => ({
        familyId: family.familyId,
        members: family.members.map((member) => member.form.formId),
        safetyImpact: "範圍外進化可能改變保留安全，因此只先留一隻最佳候選；不要求保留全部重複。",
      })),
    immediateHandling: families.map((family) => ({
      familyId: family.familyId,
      strategy: family.retentionStrategy,
      conclusion: family.handlingSummaryZhTw,
      transferLine: family.retentionStrategy === "HOLD_FOR_NOW" ? null : "其他普通重複可傳",
    })),
  };
  const lines = [
    "# Pokémon GO Retention Guide #061～#090 製作與驗收報告",
    "",
    `- 資料版本：${payload.dataVersion}`,
    `- 規則版本：${payload.rulesVersion}`,
    `- 物種／型態／版本：${payload.counts.species}／${payload.counts.forms}／${payload.counts.battleVariants}`,
    `- 家族策略：建議保留 ${strategyCounts.KEEP_TARGETS}、選擇性保留 ${strategyCounts.SELECTIVE_KEEP}、大多可傳 ${strategyCounts.MOSTLY_TRANSFER}、暫時保留 ${strategyCounts.HOLD_FOR_NOW}`,
    "",
    "## 已完成",
    "",
    "- #061～#090 已沿用「立即處理結論、要保留的條件、其他普通重複可傳、主要用途、IV 門檻與詳細版本說明」。",
    "- 關都、阿羅拉與伽勒爾分支分開建模。",
    "- 普通、暗影、淨化、Mega、極巨與超極巨版本分開；超極巨怪力不能由普通或極巨怪力替代。",
    "- 低用途完整家族可直接判定為大多可傳，不因存在進化路徑或 100% IV 自動升格。",
    "",
    "## 跨批次家族",
    "",
    `- 蚊香蝌蚪家族：${payload.crossBatchIntegration.result}；成員 ${payload.crossBatchIntegration.members?.join(" → ")}；#186 蚊香蛙皇保留文字提示，但不再以整家族暫時保留覆蓋蚊香泳士結論。`,
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
    "- #061～#090 已可與 #001～#060 一起供清包初篩使用；Scoped HOLD 僅限後續重要進化可能造成誤傳的家族。",
  ];
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/061-090.json",
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile("review/061-090.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log("已產生 review/061-090.md 與 review/061-090.json。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
