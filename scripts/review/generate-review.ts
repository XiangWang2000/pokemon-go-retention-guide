import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows, getReviewIssues, getSources } from "../../src/lib/data-prisma";
import { prisma } from "../../src/lib/prisma";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../../src/config/release";
import { zhTw } from "../../src/locales/zh-TW";
import { RULES_VERSION } from "../../src/rules/rules";

async function main() {
  const [allRows, allIssues, allSources] = await Promise.all([
    getDashboardRows(),
    getReviewIssues(),
    getSources(),
  ]);
  const rows = allRows.filter((row) => row.dexNumber >= 1 && row.dexNumber <= 30);
  const issues = allIssues.filter((issue) => issue.batchKey === "001-030");
  const sources = allSources.filter((source) =>
    source.referencedPokemon.some((label) => {
      const dexNumber = Number(label.slice(1, 4));
      return dexNumber >= 1 && dexNumber <= 30;
    }),
  );
  const forms = Array.from(new Map(rows.map((row) => [row.formId, row])).values());
  const decisions = Object.keys(zhTw.decision) as Array<keyof typeof zhTw.decision>;
  const payload = {
    batch: "001-030",
    updatedAt: DATA_VERSION_DATE_ISO,
    dataVersion: DATA_VERSION,
    rulesVersion: RULES_VERSION,
    counts: {
      species: new Set(rows.map((row) => row.dexNumber)).size,
      forms: forms.length,
      battleVariants: rows.length,
      sources: sources.length,
      openReviewIssues: issues.length,
    },
    forms: forms.map((row) => ({
      dexNumber: row.dexNumber,
      formId: row.formId,
      nameEn: row.nameEn,
      nameZhTw: row.nameZhTw,
      formNameEn: row.formNameEn,
      formNameZhTw: row.formNameZhTw,
      variants: rows
        .filter((item) => item.formId === row.formId)
        .map((item) => ({
          variantKey: item.variantKey,
          isReleased: item.isReleased,
          releaseStatus: item.releaseStatus,
          categoryStatuses: item.categoryStatuses,
          decision: item.decision,
          confidence: item.confidence,
          reasonZhTw: item.reasonZhTw,
        })),
    })),
    decisions: Object.fromEntries(
      decisions.map((decision) => [
        decision,
        rows
          .filter((row) => row.decision === decision)
          .map((row) => ({
            id: row.id,
            dexNumber: row.dexNumber,
            nameZhTw: row.nameZhTw,
            formNameZhTw: row.formNameZhTw,
            variantKey: row.variantKey,
            reasonZhTw: row.reasonZhTw,
          })),
      ]),
    ),
    sourceConflicts: issues.filter((issue) => issue.issueType === "SOURCE_CONFLICT"),
    missingData: issues.filter((issue) =>
      [
        "MISSING_SOURCE",
        "MATERIAL_DATA_GAP",
        "MISSING_PRIMARY_SOURCE",
        "UNKNOWN_RELEASE_STATUS",
      ].includes(issue.issueType),
    ),
    highRiskJudgments: rows
      .filter((row) => row.confidence === "LOW" && row.decision !== "HOLD_FOR_NOW")
      .map((row) => ({ id: row.id, decision: row.decision, reasonZhTw: row.reasonZhTw })),
    dataResearchQueue: issues,
    sources: sources.map((source) => ({
      id: source.id,
      sourceName: source.sourceName,
      title: source.sourceTitleOriginal,
      url: source.sourceUrl,
      accessedAt: source.accessedAt,
      dataVersion: source.dataVersion,
    })),
  };
  const lines = [
    "# 第一批資料與保留決策報告：#001～#030",
    "",
    `- 本批圖鑑範圍：#001～#030`,
    `- 寶可夢型態：${payload.counts.forms}`,
    `- 戰鬥版本：${payload.counts.battleVariants}`,
    `- 來源：${payload.counts.sources}`,
    `- 資料待補項目：${payload.counts.openReviewIssues}`,
    `- 本批資料更新日期：${payload.updatedAt}`,
    `- rulesVersion：${payload.rulesVersion}`,
    "",
    "## 包含的所有型態與版本狀態",
    "",
    ...payload.forms.map(
      (form) =>
        `- #${String(form.dexNumber).padStart(3, "0")} ${form.nameZhTw}（${form.formNameZhTw}）：${form.variants.map((variant) => `${zhTw.variant[variant.variantKey]}=${zhTw.releaseStatus[variant.releaseStatus]}`).join("、")}`,
    ),
    "",
    ...decisions.flatMap((decision) => [
      `## ${decision}：${zhTw.decision[decision]}`,
      "",
      ...(
        payload.decisions[decision] as Array<{
          id: string;
          nameZhTw: string;
          formNameZhTw: string;
          variantKey: keyof typeof zhTw.variant;
          reasonZhTw: string;
        }>
      ).map(
        (item) =>
          `- ${item.nameZhTw}（${item.formNameZhTw}／${zhTw.variant[item.variantKey]}）：${item.reasonZhTw}`,
      ),
      "",
    ]),
    "## 來源衝突",
    "",
    ...(payload.sourceConflicts.length
      ? payload.sourceConflicts.map(
          (item) =>
            `- ${item.nameZhTw}（${item.formNameZhTw}／${item.variantKey}）：${item.messageZhTw}`,
        )
      : ["- 無已記錄衝突。"]),
    "",
    "## 缺失資料與高風險判斷",
    "",
    `- 缺少來源或推出狀態證據：${payload.missingData.length} 項。`,
    `- 低信心但非暫時保留：${payload.highRiskJudgments.length} 項，資料維護者應優先核對。`,
    "- 火箭隊缺少可在本批逐物種、逐版本重現的當季整體排名，不以 PvP 或 PvE 排名代替。",
    "- Pokebattler 動態表格出現物種錯置風險，本批未匯入無法穩定重現的全域排名。",
    "- Purified 缺少普遍可用的獨立物種排名；Return 需求必須逐筆確認。",
    "- #030 的後續進化 #031 超出本批研究範圍，沒有自動進入下一批。",
    "",
    "## 資料待補項目",
    "",
    ...issues
      .slice(0, 120)
      .map(
        (item) =>
          `- #${item.dexNumber ? String(item.dexNumber).padStart(3, "0") : "---"} ${item.nameZhTw}（${item.formNameZhTw}／${item.variantKey}）：${zhTw.issueType[item.issueType]}－${item.messageZhTw}（影響最終結論：${item.affectsFinalDecision ? "會" : "不會"}；建議：${item.suggestedActionZhTw}）`,
      ),
    ...(issues.length > 120
      ? [`- 其餘 ${issues.length - 120} 項請見 review/001-030.json 與網站資料待補清單。`]
      : []),
    "",
    "## 使用的來源",
    "",
    ...sources.map(
      (source) =>
        `- [${source.sourceTitleOriginal ?? source.sourceName}](${source.sourceUrl})－${source.sourceName}，查閱 ${source.accessedAt.slice(0, 10)}。`,
    ),
    "",
    "> 本報告只評估一般戰鬥與實用價值；異色、特殊造型、活動背卡、紀念與個人收藏價值另行判斷。",
  ];
  await mkdir("review", { recursive: true });
  const jsonReport = JSON.stringify(payload, null, 2).replace(/\r?\n/g, "\r\n");
  await writeFile("review/001-030.json", `${jsonReport}\r\n`, "utf8");
  await writeFile("review/001-030.md", `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(
    `審核報告已產生：review/001-030.md 與 review/001-030.json（${rows.length} 筆評估）。`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
