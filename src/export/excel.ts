import ExcelJS from "exceljs";
import type { PrismaClient } from "../../generated/prisma/client";
import { zhTw } from "@/locales/zh-TW";

export const exportSheetNames = [
  "寶可夢型態",
  "評估總覽",
  "PvP原始資料",
  "PvE原始資料",
  "道館與Max Battle",
  "招式資料",
  "進化關係",
  "資料待補清單",
  "資料來源",
  "變更紀錄",
] as const;

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}
export interface ExportSheet {
  name: (typeof exportSheetNames)[number];
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
}

export function createExportWorkbook(sheets: ExportSheet[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pokémon GO Retention Guide";
  workbook.created = new Date("2026-07-15T00:00:00+08:00");
  for (const spec of sheets) {
    const sheet = workbook.addWorksheet(spec.name, { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = spec.columns.map((column) => ({ ...column, width: column.width ?? 18 }));
    sheet.addRows(spec.rows);
    sheet.autoFilter = { from: "A1", to: { row: 1, column: spec.columns.length } };
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).height = 24;
    sheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
    for (const row of sheet.getRows(2, Math.max(0, sheet.rowCount - 1)) ?? []) {
      row.alignment = { vertical: "top", wrapText: true };
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (cell.value instanceof Date) cell.numFmt = "yyyy-mm-dd";
      });
    }
  }
  return workbook;
}

function hyperlink(url: string, text: string) {
  return { text, hyperlink: url, tooltip: url };
}

export async function buildExportWorkbook(prisma: PrismaClient) {
  const [forms, variants, raw, moves, evolutions, issues, sources, changes] = await Promise.all([
    prisma.pokemonForm.findMany({ include: { species: true } }),
    prisma.battleVariant.findMany({
      include: {
        pokemonForm: { include: { species: true } },
        retentionEvaluations: { orderBy: { generatedAt: "desc" }, take: 1 },
        categoryEvaluations: true,
      },
    }),
    prisma.rawEvaluationData.findMany({
      include: {
        battleVariant: { include: { pokemonForm: { include: { species: true } } } },
        source: true,
      },
    }),
    prisma.variantMove.findMany({
      include: {
        battleVariant: { include: { pokemonForm: { include: { species: true } } } },
        move: true,
      },
    }),
    prisma.evolutionPath.findMany({
      include: { fromForm: { include: { species: true } }, toForm: { include: { species: true } } },
    }),
    prisma.dataIssue.findMany({
      where: { status: "OPEN" },
      include: { pokemonForm: { include: { species: true } }, battleVariant: true },
    }),
    prisma.sourceReference.findMany(),
    prisma.changeLog.findMany({ include: { source: true } }),
  ]);
  const sheets: ExportSheet[] = [
    {
      name: "寶可夢型態",
      columns: [
        { key: "id", header: "型態ID", width: 18 },
        { key: "dex", header: "圖鑑編號", width: 12 },
        { key: "zh", header: "繁體中文名稱", width: 18 },
        { key: "en", header: "英文名稱", width: 18 },
        { key: "formZh", header: "繁中型態", width: 14 },
        { key: "formEn", header: "英文型態", width: 14 },
        { key: "region", header: "regionKey", width: 12 },
        { key: "types", header: "屬性", width: 18 },
        { key: "released", header: "Pokémon GO已推出", width: 18 },
        { key: "verified", header: "推出狀態查核日", width: 16 },
      ],
      rows: forms.map((form) => ({
        id: form.id,
        dex: form.species.dexNumber,
        zh: form.species.nameZhTw,
        en: form.species.nameEn,
        formZh: form.formNameZhTw,
        formEn: form.formNameEn,
        region: form.regionKey,
        types: form.types,
        released: zhTw.releaseStatus[form.releaseStatus],
        verified: form.releaseVerifiedAt,
      })),
    },
    {
      name: "評估總覽",
      columns: [
        { key: "variantId", header: "戰鬥版本ID", width: 30 },
        { key: "dex", header: "圖鑑編號", width: 12 },
        { key: "pokemon", header: "寶可夢", width: 18 },
        { key: "form", header: "型態", width: 14 },
        { key: "variant", header: "variantKey", width: 16 },
        { key: "releaseStatus", header: "推出狀態", width: 16 },
        { key: "pvpStatus", header: "PvP資料狀態", width: 18 },
        { key: "pveStatus", header: "PvE資料狀態", width: 18 },
        { key: "rocketStatus", header: "火箭隊資料狀態", width: 20 },
        { key: "gymStatus", header: "道館資料狀態", width: 18 },
        { key: "megaStatus", header: "Mega資料狀態", width: 18 },
        { key: "maxStatus", header: "Max資料狀態", width: 18 },
        { key: "evolutionStatus", header: "後續進化資料狀態", width: 20 },
        { key: "decision", header: "最終分類", width: 18 },
        { key: "decisionEnum", header: "finalDecision Enum", width: 22 },
        { key: "provenanceLabel", header: "結論依據", width: 18 },
        { key: "provenance", header: "結論依據Enum", width: 22 },
        { key: "reason", header: "判斷理由", width: 48 },
        { key: "iv", header: "推薦IV方向", width: 44 },
        { key: "confidence", header: "信心程度", width: 12 },
        { key: "rules", header: "rulesVersion", width: 20 },
        { key: "updated", header: "更新日期", width: 14 },
        { key: "reviewed", header: "審核狀態", width: 14 },
        { key: "missing", header: "缺失資料摘要", width: 48 },
      ],
      rows: variants.map((variant) => {
        const item = variant.retentionEvaluations[0];
        return {
          variantId: variant.id,
          dex: variant.pokemonForm.species.dexNumber,
          pokemon: variant.pokemonForm.species.nameZhTw,
          form: variant.pokemonForm.formNameZhTw,
          variant: variant.variantKey,
          releaseStatus: zhTw.releaseStatus[variant.releaseStatus],
          pvpStatus: localizedDataStatus(variant.categoryEvaluations, "PVP"),
          pveStatus: localizedDataStatus(variant.categoryEvaluations, "PVE"),
          rocketStatus: localizedDataStatus(variant.categoryEvaluations, "ROCKET"),
          gymStatus: localizedDataStatus(variant.categoryEvaluations, "GYM"),
          megaStatus: localizedDataStatus(variant.categoryEvaluations, "MEGA"),
          maxStatus: localizedDataStatus(variant.categoryEvaluations, "MAX_BATTLE"),
          evolutionStatus: localizedDataStatus(variant.categoryEvaluations, "EVOLUTION_VALUE"),
          decision: item ? zhTw.decision[item.finalDecision] : zhTw.decision.HOLD_FOR_NOW,
          decisionEnum: item?.finalDecision ?? "HOLD_FOR_NOW",
          provenanceLabel: item
            ? zhTw.evaluationProvenance[item.provenance]
            : zhTw.evaluationProvenance.DATA_UNAVAILABLE,
          provenance: item?.provenance ?? "DATA_UNAVAILABLE",
          reason: item?.reasonZhTw ?? "尚未評估",
          iv: item?.recommendedIvStrategyZhTw ?? "尚未評估",
          confidence: item ? zhTw.confidence[item.confidence] : "低",
          rules: item?.rulesVersion ?? "—",
          updated: item?.generatedAt ?? null,
          reviewed: item ? zhTw.reviewStatus[item.reviewStatus] : "部分資料待補",
          missing: item?.missingDataSummaryZhTw ?? "尚未產生資料缺口摘要。",
        };
      }),
    },
    {
      name: "PvP原始資料",
      columns: rawColumns(),
      rows: raw.filter((item) => item.category === "PVP").map(rawRow),
    },
    {
      name: "PvE原始資料",
      columns: rawColumns(),
      rows: raw.filter((item) => item.category === "PVE" || item.category === "MEGA").map(rawRow),
    },
    {
      name: "道館與Max Battle",
      columns: rawColumns(),
      rows: [
        ...raw
          .filter((item) => item.category === "GYM" || item.category === "MAX_BATTLE")
          .map(rawRow),
        ...variants.flatMap((variant) =>
          variant.categoryEvaluations
            .filter((item) => ["ROCKET", "GYM", "MAX_BATTLE"].includes(item.category))
            .map((item) => ({
              id: item.id,
              variantId: variant.id,
              dex: variant.pokemonForm.species.dexNumber,
              pokemon: variant.pokemonForm.species.nameZhTw,
              category: item.category,
              status: item.status,
              provenance: item.provenance,
              rocketRating: item.rocketRating,
              rocketRoles: item.rocketRoles,
              maxTypeRank: item.maxTypeRank,
              maxTypeTier: item.maxTypeTier,
              maxTypeKey: item.maxTypeKey,
              maxOverallRating: item.maxOverallRating,
              maxInvestmentRating: item.maxInvestmentRating,
              maxUseCaseBreadth: item.maxUseCaseBreadth,
              checked: item.checkedAt,
              notes: item.summaryZhTw,
            })),
        ),
      ],
    },
    {
      name: "招式資料",
      columns: [
        { key: "variantId", header: "戰鬥版本ID", width: 28 },
        { key: "dex", header: "圖鑑編號", width: 12 },
        { key: "pokemon", header: "寶可夢", width: 16 },
        { key: "moveId", header: "招式ID", width: 22 },
        { key: "moveKey", header: "moveKey", width: 24 },
        { key: "zh", header: "繁中招式名稱", width: 18 },
        { key: "en", header: "英文招式名稱", width: 20 },
        { key: "availability", header: "取得方式Enum", width: 20 },
        { key: "migrationNote", header: "遷移備註", width: 48 },
        { key: "notes", header: "來源備註", width: 44 },
        { key: "verified", header: "查核日", width: 14 },
      ],
      rows: moves.map((item) => ({
        variantId: item.battleVariantId,
        dex: item.battleVariant.pokemonForm.species.dexNumber,
        pokemon: item.battleVariant.pokemonForm.species.nameZhTw,
        moveId: item.moveId,
        moveKey: item.move.moveKey,
        zh: item.move.nameZhTw,
        en: item.move.nameEn,
        availability: item.availabilityType,
        notes: item.sourceNotesZhTw,
        verified: item.verifiedAt,
      })),
    },
    {
      name: "進化關係",
      columns: [
        { key: "id", header: "進化路徑ID", width: 34 },
        { key: "fromId", header: "進化前型態ID", width: 18 },
        { key: "from", header: "進化前", width: 16 },
        { key: "toId", header: "進化後型態ID", width: 18 },
        { key: "to", header: "進化後", width: 16 },
        { key: "method", header: "進化方式", width: 28 },
        { key: "notes", header: "取得與條件備註", width: 44 },
        { key: "event", header: "需要活動", width: 12 },
        { key: "verified", header: "查核日", width: 14 },
      ],
      rows: evolutions.map((item) => ({
        id: item.id,
        fromId: item.fromFormId,
        from: item.fromForm.species.nameZhTw,
        toId: item.toFormId,
        to: item.toForm.species.nameZhTw,
        method: item.evolutionMethodZhTw,
        notes: item.availabilityNotesZhTw,
        event: item.requiresEvent ? "是" : "否",
        verified: item.verifiedAt,
      })),
    },
    {
      name: "資料待補清單",
      columns: [
        { key: "id", header: "問題ID", width: 34 },
        { key: "dex", header: "圖鑑編號", width: 12 },
        { key: "pokemon", header: "寶可夢", width: 16 },
        { key: "variantId", header: "戰鬥版本ID", width: 28 },
        { key: "type", header: "問題類型Enum", width: 24 },
        { key: "message", header: "繁中說明", width: 48 },
        { key: "affects", header: "影響最終結論", width: 16 },
        { key: "provisional", header: "目前暫定建議", width: 20 },
        { key: "provisionalEnum", header: "provisionalDecision Enum", width: 24 },
        { key: "action", header: "下一步研究行動", width: 48 },
        { key: "batch", header: "研究批次", width: 12 },
        { key: "status", header: "狀態Enum", width: 12 },
        { key: "detected", header: "最後研究日期", width: 14 },
      ],
      rows: issues.map((item) => ({
        id: item.id,
        dex: item.pokemonForm?.species.dexNumber ?? null,
        pokemon: item.pokemonForm?.species.nameZhTw ?? "未指定",
        variantId: item.battleVariantId,
        type: item.issueType,
        message: item.messageZhTw,
        affects: item.affectsFinalDecision ? "會" : "不會",
        provisional: zhTw.decision[item.provisionalDecision],
        provisionalEnum: item.provisionalDecision,
        action: item.suggestedResearchActionZhTw || item.suggestedActionZhTw,
        batch: item.batchKey,
        status: item.status,
        detected: item.lastResearchedAt ?? item.detectedAt,
      })),
    },
    {
      name: "資料來源",
      columns: [
        { key: "id", header: "來源ID", width: 34 },
        { key: "name", header: "來源名稱", width: 24 },
        { key: "title", header: "原始頁面標題", width: 48 },
        { key: "url", header: "網址", width: 48 },
        { key: "type", header: "來源類型Enum", width: 18 },
        { key: "language", header: "原始語言", width: 12 },
        { key: "published", header: "發布日期", width: 14 },
        { key: "accessed", header: "查閱日期", width: 14 },
        { key: "version", header: "資料版本", width: 30 },
        { key: "summary", header: "中文摘要", width: 48 },
      ],
      rows: sources.map((item) => ({
        id: item.id,
        name: item.sourceName,
        title: item.sourceTitleOriginal,
        url: hyperlink(item.sourceUrl, item.sourceUrl),
        type: item.sourceType,
        language: item.sourceLanguage,
        published: item.publishedAt,
        accessed: item.accessedAt,
        version: item.dataVersion,
        summary: item.sourceSummaryZhTw,
      })),
    },
    {
      name: "變更紀錄",
      columns: [
        { key: "id", header: "變更ID", width: 36 },
        { key: "date", header: "日期", width: 14 },
        { key: "entity", header: "實體類型", width: 22 },
        { key: "entityId", header: "實體ID", width: 34 },
        { key: "field", header: "修改欄位", width: 20 },
        { key: "before", header: "修改前", width: 22 },
        { key: "after", header: "修改後", width: 22 },
        { key: "source", header: "來源", width: 42 },
        { key: "reason", header: "修改原因", width: 48 },
        { key: "rules", header: "rulesVersion", width: 20 },
      ],
      rows: changes.map((item) => ({
        id: item.id,
        date: item.changedAt,
        entity: item.entityType,
        entityId: item.entityId,
        field: item.fieldName,
        before: item.previousValue,
        after: item.newValue,
        source: item.source
          ? hyperlink(item.source.sourceUrl, item.source.sourceTitleOriginal)
          : null,
        reason: item.changeReasonZhTw,
        rules: item.rulesVersion,
      })),
    },
  ];
  return createExportWorkbook(sheets);
}

function localizedDataStatus(
  categories: Array<{ category: string; status: keyof typeof zhTw.evaluationDataStatus }>,
  category: string,
) {
  const status = categories.find((item) => item.category === category)?.status;
  return status ? zhTw.evaluationDataStatus[status] : "尚未建立狀態";
}

function rawColumns(): ExportColumn[] {
  return [
    { key: "id", header: "原始資料ID", width: 40 },
    { key: "variantId", header: "戰鬥版本ID", width: 28 },
    { key: "dex", header: "圖鑑編號", width: 12 },
    { key: "pokemon", header: "寶可夢", width: 16 },
    { key: "category", header: "category Enum", width: 18 },
    { key: "status", header: "資料狀態 Enum", width: 22 },
    { key: "provenance", header: "評估依據 Enum", width: 22 },
    { key: "league", header: "league Enum", width: 18 },
    { key: "cup", header: "賽制／盃別", width: 16 },
    { key: "pvpCategory", header: "PvP分類 Enum", width: 18 },
    { key: "speciesKey", header: "speciesKey", width: 24 },
    { key: "formKey", header: "formKey", width: 22 },
    { key: "variantKey", header: "variantKey", width: 18 },
    { key: "rocketRating", header: "火箭隊定性評價", width: 20 },
    { key: "rocketRoles", header: "火箭隊角色", width: 28 },
    { key: "maxTypeRank", header: "Max屬性內名次", width: 18 },
    { key: "maxTypeTier", header: "Max屬性 Tier", width: 18 },
    { key: "maxTypeKey", header: "Max屬性", width: 16 },
    { key: "maxOverallRating", header: "Max整體評價", width: 18 },
    { key: "maxInvestmentRating", header: "Max投資優先度", width: 18 },
    { key: "maxUseCaseBreadth", header: "Max用途廣度", width: 18 },
    { key: "rank", header: "物種排名", width: 12 },
    { key: "rating", header: "評分", width: 16 },
    { key: "tier", header: "Tier", width: 14 },
    { key: "moves", header: "推薦招式", width: 34 },
    { key: "version", header: "賽季／版本", width: 30 },
    { key: "method", header: "擷取方式", width: 42 },
    { key: "reproducible", header: "可重現", width: 12 },
    { key: "checked", header: "查核日", width: 14 },
    { key: "sourceId", header: "來源ID", width: 30 },
    { key: "source", header: "來源網址", width: 46 },
    { key: "notes", header: "原始備註", width: 48 },
  ];
}

function rawRow(
  item: Awaited<ReturnType<PrismaClient["rawEvaluationData"]["findMany"]>>[number] & {
    battleVariant: { pokemonForm: { species: { dexNumber: number; nameZhTw: string } } };
    source: { sourceUrl: string; sourceTitleOriginal: string };
  },
) {
  return {
    id: item.id,
    variantId: item.battleVariantId,
    dex: item.battleVariant.pokemonForm.species.dexNumber,
    pokemon: item.battleVariant.pokemonForm.species.nameZhTw,
    category: item.category,
    status: item.status,
    provenance: item.reproducible ? "SOURCE_VERIFIED" : "MANUAL_CURATED",
    league: item.league,
    cup: item.cup,
    pvpCategory: item.pvpCategory,
    speciesKey: item.speciesKey,
    formKey: item.formKey,
    variantKey: item.variantKey,
    rank: item.rank,
    rating: item.rating,
    tier: item.tier,
    moves: item.recommendedMoves,
    version: item.seasonOrVersion,
    method: item.extractionMethod,
    reproducible: item.reproducible ? "是" : "否",
    checked: item.checkedAt,
    sourceId: item.sourceId,
    source: hyperlink(item.source.sourceUrl, item.source.sourceTitleOriginal),
    migrationNote: item.migrationNote,
    notes: item.rawNotes,
  };
}
