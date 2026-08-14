import { mkdir, writeFile } from "node:fs/promises";
import { getDashboardRows } from "../src/lib/data-prisma";
import { CURRENT_DATA_MAX_DEX } from "../src/config/data-scope";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "../src/config/release";
import { RULES_VERSION } from "../src/rules/rules";
import { readIntegerFlag } from "../src/lib/command-line";

function increment(target: Record<string, number>, key: string | null | undefined) {
  const normalized = key ?? "UNSPECIFIED";
  target[normalized] = (target[normalized] ?? 0) + 1;
}

async function main() {
  const dexMax = readIntegerFlag(process.argv.slice(2), "--max", CURRENT_DATA_MAX_DEX);
  if (!Number.isInteger(dexMax) || dexMax < 1 || dexMax > CURRENT_DATA_MAX_DEX) {
    throw new Error(`Invalid --max value ${dexMax}; published maximum is ${CURRENT_DATA_MAX_DEX}.`);
  }

  const rows = (await getDashboardRows()).filter(
    (row) => row.dexNumber >= 1 && row.dexNumber <= dexMax,
  );
  const decisions: Record<string, number> = {};
  const dispositions: Record<string, number> = {};
  const pveUseLevels: Record<string, number> = {};
  for (const row of rows) {
    increment(decisions, row.decision);
    increment(dispositions, row.assessmentDisposition);
    increment(pveUseLevels, row.pveUseLevel);
  }

  const trueDataPending = rows
    .filter((row) => row.assessmentDisposition === "TRUE_DATA_PENDING")
    .map((row) => ({
      id: row.id,
      formId: row.formId,
      variantKey: row.variantKey,
    }));
  const generatedAt = new Date(`${DATA_VERSION_DATE_ISO}T00:00:00+08:00`).toISOString();
  const report = {
    scope: `1-${dexMax}`,
    dataVersion: DATA_VERSION,
    updatedAt: DATA_VERSION_DATE_ISO,
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
    `# Pokémon GO Retention Guide #001～#${String(dexMax).padStart(3, "0")} 已發布資料狀態報告`,
    "",
    `- 資料版本：${DATA_VERSION}`,
    `- 規則版本：${RULES_VERSION}`,
    `- 戰鬥版本：${rows.length}`,
    `- KEEP／CONDITIONAL／HOLD／TRANSFER：${decisions.KEEP ?? 0}／${decisions.CONDITIONAL_KEEP ?? 0}／${decisions.HOLD_FOR_NOW ?? 0}／${decisions.TRANSFER_CANDIDATE ?? 0}`,
    `- 真正待補資料：${trueDataPending.length}；只有這些版本顯示「無法判斷，暫時不要傳」`,
    `- PvE 四級：核心投資 ${pveUseLevels.CORE_INVESTMENT ?? 0}、可用／預算型 ${pveUseLevels.USABLE_OR_BUDGET ?? 0}、特殊用途 ${pveUseLevels.SPECIAL_USE ?? 0}、無顯著用途 ${pveUseLevels.NO_SIGNIFICANT_USE ?? 0}`,
    "",
    "本檔只彙整已完成研究與匯入後的目前發布狀態，不會重新計算或覆寫任何 BattleVariant 評估。",
  ];

  await mkdir("review", { recursive: true });
  await writeFile(
    `review/001-${dexMax}-recalibration.json`,
    `${JSON.stringify(report, null, 2).replace(/\r?\n/g, "\r\n")}\r\n`,
    "utf8",
  );
  await writeFile(
    `review/001-${dexMax}-recalibration.md`,
    `${lines.join("\r\n")}\r\n`,
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        scope: report.scope,
        dataVersion: DATA_VERSION,
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
