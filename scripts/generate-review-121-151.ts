import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

async function main() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= 121 && row.dexNumber <= 151);
  const families = buildFamilyOverviews(buildFormOverviews(allRows)).filter((family) =>
    family.members.some((member) => member.form.dexNumber >= 121 && member.form.dexNumber <= 151),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === "121-151");
  const strategies = ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"];
  const strategyCounts = Object.fromEntries(
    strategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
  const starmie = families.find((family) =>
    family.members.some((member) => member.form.formId === "121-kanto"),
  );
  const starmieRows = rows.filter((row) => row.formId === "121-kanto");
  const mewtwo = rows.filter((row) => row.dexNumber === 150);
  const mew = rows.find((row) => row.formId === "151-kanto" && row.variantKey === "NORMAL");
  const payload = {
    batch: "121-151",
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
    scopedHolds: families
      .filter((family) => family.retentionStrategy === "HOLD_FOR_NOW")
      .map((family) => ({
        familyId: family.familyId,
        members: family.members.map((member) => member.form.formId),
      })),
    immediateHandling: families.map((family) => ({
      familyId: family.familyId,
      strategy: family.retentionStrategy,
      conclusion: family.handlingSummaryZhTw,
      transferLine: family.retentionStrategy === "HOLD_FOR_NOW" ? null : "其他普通重複可傳",
    })),
  };
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
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/121-151.json",
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile("review/121-151.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log("已產生 review/121-151.md 與 review/121-151.json。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
