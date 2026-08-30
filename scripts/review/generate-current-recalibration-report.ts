import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows } from "../../src/lib/data-prisma";
import { CURRENT_RELEASE_CONTRACT } from "../../src/config/release-contract";
import { RULES_VERSION } from "../../src/rules/rules";
import { readIntegerFlag } from "../../src/lib/command-line";

function increment(target: Record<string, number>, key: string | null | undefined) {
  const normalized = key ?? "UNSPECIFIED";
  target[normalized] = (target[normalized] ?? 0) + 1;
}

async function main() {
  const dexMax = readIntegerFlag(process.argv.slice(2), "--max", CURRENT_RELEASE_CONTRACT.maxDex);
  if (!Number.isInteger(dexMax) || dexMax < 1 || dexMax > CURRENT_RELEASE_CONTRACT.maxDex) {
    throw new Error(
      `Invalid --max value ${dexMax}; published maximum is ${CURRENT_RELEASE_CONTRACT.maxDex}.`,
    );
  }

  const rows = (await getDashboardRows()).filter(
    (row) => row.dexNumber >= CURRENT_RELEASE_CONTRACT.minDex && row.dexNumber <= dexMax,
  );
  const reportScope = `${String(CURRENT_RELEASE_CONTRACT.minDex).padStart(3, "0")}-${String(
    dexMax,
  ).padStart(3, "0")}`;
  const reportScopeValue = `${CURRENT_RELEASE_CONTRACT.minDex}-${dexMax}`;
  const reportScopeLabel = `${String(CURRENT_RELEASE_CONTRACT.minDex).padStart(3, "0")}～#${String(
    dexMax,
  ).padStart(3, "0")}`;
  const decisions: Record<string, number> = {};
  const dispositions: Record<string, number> = {};
  const pveUseLevels: Record<string, number> = {};
  for (const row of rows) {
    increment(decisions, row.decision);
    increment(dispositions, row.assessmentDisposition);
    const pve = row.categoryStatuses.find((category) => category.category === "PVE");
    increment(pveUseLevels, pve?.pveUseLevel);
  }

  const trueDataPending = rows
    .filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING")
    .map((row) => ({
      id: row.id,
      formId: row.formId,
      variantKey: row.variantKey,
    }));
  const generatedAt = new Date(`${CURRENT_RELEASE_CONTRACT.dataAsOf}T00:00:00+08:00`).toISOString();
  const report = {
    scope: reportScopeValue,
    dataVersion: CURRENT_RELEASE_CONTRACT.dataVersion,
    updatedAt: CURRENT_RELEASE_CONTRACT.dataAsOf,
    generatedAt,
    rulesVersion: RULES_VERSION,
    counts: {
      variants: rows.length,
      decisions,
      dispositions,
      pveUseLevels,
      changedFields: 0,
    },
    trueDataPending,
  };

  const lines = [
    `# Pokémon GO Retention Guide #${reportScopeLabel} 已發布資料狀態報告`,
    "",
    `- 資料版本：${CURRENT_RELEASE_CONTRACT.dataVersion}`,
    `- 規則版本：${RULES_VERSION}`,
    `- 戰鬥版本：${rows.length}`,
    `- KEEP／CONDITIONAL／HOLD／TRANSFER：${decisions.KEEP ?? 0}／${decisions.CONDITIONAL_KEEP ?? 0}／${decisions.HOLD_FOR_NOW ?? 0}／${decisions.TRANSFER_CANDIDATE ?? 0}`,
    `- 真正待補資料：${trueDataPending.length}；只有這些版本顯示「無法判斷，暫時不要傳」`,
    `- PvE 四級：核心投資 ${pveUseLevels.CORE_INVESTMENT ?? 0}、可用／預算型 ${pveUseLevels.USABLE_OR_BUDGET ?? 0}、特殊用途 ${pveUseLevels.SPECIAL_USE ?? 0}、無顯著用途 ${pveUseLevels.NO_SIGNIFICANT_USE ?? 0}`,
    "",
    "本檔只彙整已完成研究與匯入後的目前發布狀態，不會重新計算或覆寫任何 BattleVariant 評估。",
  ];

  const outputDirectory = dexMax === CURRENT_RELEASE_CONTRACT.maxDex ? "review" : "review/history";
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    `${outputDirectory}/${reportScope}-recalibration.json`,
    `${JSON.stringify(report, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile(
    `${outputDirectory}/${reportScope}-recalibration.md`,
    `${lines.join("\r\n")}\r\n`,
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        scope: report.scope,
        dataVersion: CURRENT_RELEASE_CONTRACT.dataVersion,
        variants: rows.length,
        trueDataPending: trueDataPending.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
