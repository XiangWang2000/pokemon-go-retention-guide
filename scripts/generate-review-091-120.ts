import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues } from "../src/lib/data-prisma";
import { prisma } from "../src/lib/prisma";
import { buildFamilyOverviews } from "../src/presentation/family-overview";
import { buildFormOverviews } from "../src/presentation/form-overview";
import { RULES_VERSION } from "../src/rules/rules";

async function main() {
  const [allRows, allIssues] = await Promise.all([getDashboardRows(), getReviewIssues()]);
  const rows = allRows.filter((row) => row.dexNumber >= 91 && row.dexNumber <= 120);
  const families = buildFamilyOverviews(buildFormOverviews(allRows)).filter((family) =>
    family.members.some((member) => member.form.dexNumber >= 91 && member.form.dexNumber <= 120),
  );
  const issues = allIssues.filter((issue) => issue.batchKey === "091-120");
  const strategies = ["KEEP_TARGETS", "SELECTIVE_KEEP", "MOSTLY_TRANSFER", "HOLD_FOR_NOW"];
  const strategyCounts = Object.fromEntries(
    strategies.map((strategy) => [
      strategy,
      families.filter((family) => family.retentionStrategy === strategy).length,
    ]),
  );
  const shellder = families.find((family) =>
    family.members.some((member) => member.form.formId === "091-kanto"),
  );
  const gengar = rows.filter((row) => row.formId === "094-kanto");
  const payload = {
    batch: "091-120",
    updatedAt: "2026-08-03",
    dataVersion: "2026.08.03-r12",
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
  await mkdir("review", { recursive: true });
  await writeFile(
    "review/091-120.json",
    `${JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile("review/091-120.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log("已產生 review/091-120.md 與 review/091-120.json。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
