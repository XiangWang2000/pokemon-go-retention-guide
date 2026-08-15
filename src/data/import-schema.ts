import { z } from "zod";
import { REGION_KEYS } from "./region-key";

export const importEntityNames = [
  "PokemonSpecies",
  "PokemonForm",
  "BattleVariant",
  "EvolutionPath",
  "Move",
  "VariantMove",
  "RawEvaluationData",
  "SourceReference",
] as const;

export type ImportEntityName = (typeof importEntityNames)[number];

const id = z.string().trim().min(1, "穩定 ID 不可空白");
const optionalDate = z.union([z.iso.datetime({ offset: true }), z.iso.date(), z.null()]).optional();
const requiredDate = z.union([z.iso.datetime({ offset: true }), z.iso.date()]);

const schemas = {
  PokemonSpecies: z.object({
    id,
    dexNumber: z.coerce.number().int().min(1).max(9999),
    nameEn: z.string().trim().min(1, "缺少英文名稱"),
    nameZhTw: z.string().trim().min(1, "缺少繁體中文名稱"),
    generation: z.coerce.number().int().min(1),
    familyKey: id,
  }),
  PokemonForm: z.object({
    id: z.string().regex(/^\d{3,4}-[a-z0-9-]+$/, "PokemonForm ID 格式錯誤"),
    speciesId: id,
    formKey: id,
    formNameEn: z.string().trim().min(1, "缺少英文型態名稱"),
    formNameZhTw: z.string().trim().min(1, "缺少繁中型態名稱"),
    regionKey: z.enum(REGION_KEYS),
    types: z.union([z.string(), z.array(z.string())]),
    searchAliases: z.union([z.string(), z.array(z.string())]),
    evolvesFromFormId: z.string().nullable().optional(),
    evolutionFamilyNotesZhTw: z.string().default(""),
    isReleasedInPokemonGo: z.boolean().nullable(),
    releaseStatus: z.enum(["RELEASED", "UNRELEASED", "UNKNOWN"]).optional(),
    releaseVerifiedAt: optionalDate,
  }),
  BattleVariant: z.object({
    id,
    pokemonFormId: id,
    variantKey: z.enum([
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "MEGA",
      "MEGA_X",
      "MEGA_Y",
      "DYNAMAX",
      "GIGANTAMAX",
    ]),
    isReleased: z.boolean().nullable(),
    releaseStatus: z.enum(["RELEASED", "UNRELEASED", "UNKNOWN"]).optional(),
    releaseVerifiedAt: optionalDate,
    notesZhTw: z.string().default(""),
    inheritsFromVariantId: z.string().nullable().optional(),
    inheritanceMode: z.enum(["NONE", "NORMAL_BASE", "NORMAL_BASE_WITH_OVERRIDE"]).optional(),
    purificationCostModifier: z.coerce.number().positive().nullable().optional(),
    hasReturnAccess: z.boolean().optional(),
    purificationRiskZhTw: z.string().optional(),
    purifiedOverrideRequired: z.boolean().optional(),
  }),
  EvolutionPath: z
    .object({
      id,
      fromFormId: id,
      toFormId: id,
      evolutionMethodZhTw: z.string().trim().min(1),
      availabilityNotesZhTw: z.string().default(""),
      requiresEvent: z.boolean(),
      verifiedAt: optionalDate,
    })
    .refine((value) => value.fromFormId !== value.toFormId, "進化起點與終點不可相同"),
  Move: z.object({
    id,
    moveKey: id,
    nameEn: z.string().trim().min(1),
    nameZhTw: z.string().trim().min(1),
    moveType: id,
    moveCategory: z.enum(["FAST", "CHARGED", "MAX"]),
    isLegacy: z.boolean(),
    isEliteTmAvailable: z.boolean(),
    notesZhTw: z.string().default(""),
    verifiedAt: optionalDate,
  }),
  VariantMove: z.object({
    id,
    battleVariantId: id,
    moveId: id,
    availabilityType: z.enum([
      "NORMAL",
      "LEGACY",
      "EVENT_EVOLUTION",
      "ELITE_TM",
      "RAID_EXCLUSIVE",
      "COMMUNITY_DAY",
      "UNKNOWN",
    ]),
    sourceNotesZhTw: z.string().default(""),
    verifiedAt: optionalDate,
  }),
  RawEvaluationData: z
    .object({
      id,
      battleVariantId: id,
      category: z.enum(["PVP", "PVE", "ROCKET", "GYM", "MEGA", "MAX_BATTLE", "EVOLUTION_VALUE"]),
      status: z
        .enum([
          "VERIFIED",
          "PARTIALLY_VERIFIED",
          "UNRANKED",
          "NOT_APPLICABLE",
          "DATA_UNAVAILABLE",
          "SOURCE_MISSING",
          "SOURCE_CONFLICT",
          "UNRELEASED",
          "UNKNOWN_RELEASE_STATUS",
        ])
        .optional(),
      league: z.enum(["GREAT", "ULTRA", "MASTER", "SPECIAL_CUP", "NOT_APPLICABLE"]),
      cup: z.string().nullable().optional(),
      pvpCategory: z
        .enum(["OVERALL", "LEAD", "CLOSER", "SWITCH", "CHARGER", "ATTACKER", "CONSISTENCY"])
        .nullable()
        .optional(),
      speciesKey: z.string().nullable().optional(),
      formKey: z.string().nullable().optional(),
      variantKey: z
        .enum(["NORMAL", "SHADOW", "PURIFIED", "MEGA", "MEGA_X", "MEGA_Y", "DYNAMAX", "GIGANTAMAX"])
        .nullable()
        .optional(),
      rank: z.coerce.number().int().positive().nullable().optional(),
      rating: z.string().nullable().optional(),
      score: z.coerce.number().nullable().optional(),
      tier: z.string().nullable().optional(),
      recommendedMoves: z.union([z.string(), z.array(z.string())]),
      rawNotes: z.string().default(""),
      seasonOrVersion: z.string().trim().min(1),
      extractionMethod: z.string().nullable().optional(),
      reproducible: z.boolean().optional(),
      fastMoveKey: z.string().nullable().optional(),
      chargedMoveKey: z.string().nullable().optional(),
      bossKey: z.string().nullable().optional(),
      simulationLevel: z.string().nullable().optional(),
      weather: z.string().nullable().optional(),
      friendship: z.string().nullable().optional(),
      rankingMethod: z.string().nullable().optional(),
      estimator: z.coerce.number().nullable().optional(),
      timeToWin: z.coerce.number().nullable().optional(),
      deaths: z.coerce.number().nullable().optional(),
      migrationNote: z.string().nullable().optional(),
      sourceId: id,
      checkedAt: requiredDate,
    })
    .superRefine((value, context) => {
      if (value.category !== "PVP" || value.rank == null) return;
      const required = [
        value.cup,
        value.pvpCategory,
        value.speciesKey,
        value.formKey,
        value.variantKey,
        value.extractionMethod,
      ];
      if (!value.reproducible || required.some((item) => !item)) {
        context.addIssue({
          code: "custom",
          message:
            "PvP 精確 rank 必須附完整 league、cup、category、species/form/variant、擷取方法及 reproducible=true。",
        });
      }
    }),
  SourceReference: z.object({
    id,
    sourceName: z.string().trim().min(1),
    sourceUrl: z
      .string()
      .url("來源網址格式錯誤")
      .refine((value) => /^https?:\/\//.test(value), "來源網址必須使用 http 或 https"),
    sourceType: z.enum(["OFFICIAL", "PVP", "PVE", "GYM", "MAX_BATTLE", "SECONDARY", "COMMUNITY"]),
    sourceTitleOriginal: z.string().trim().min(1, "缺少原始頁面標題"),
    sourceLanguage: z.string().trim().min(2),
    sourceSummaryZhTw: z.string().default(""),
    accessedAt: requiredDate,
    publishedAt: optionalDate,
    dataVersion: z.string().nullable().optional(),
    notes: z.string().default(""),
  }),
} satisfies Record<ImportEntityName, z.ZodType>;

export interface ValidatedImportBatch {
  entity: ImportEntityName;
  records: Record<string, unknown>[];
}

export function validateImportBatch(entity: ImportEntityName, records: unknown[]) {
  const errors: string[] = [];
  const parsed: Record<string, unknown>[] = [];
  const ids = new Set<string>();
  records.forEach((record, index) => {
    const result = schemas[entity].safeParse(record);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`第 ${index + 1} 筆 ${issue.path.join(".") || "記錄"}：${issue.message}`);
      }
      return;
    }
    const normalized = result.data as Record<string, unknown>;
    const recordId = String(normalized.id);
    if (ids.has(recordId)) errors.push(`第 ${index + 1} 筆：ID ${recordId} 重複`);
    ids.add(recordId);
    parsed.push(normalized);
  });
  if (entity === "SourceReference") {
    const urls = new Set<string>();
    parsed.forEach((record, index) => {
      const key = `${String(record.sourceUrl)}|${String(record.accessedAt)}`;
      if (urls.has(key)) errors.push(`第 ${index + 1} 筆：同一來源網址與查閱日期重複`);
      urls.add(key);
    });
  }
  return { success: errors.length === 0, errors, data: { entity, records: parsed } };
}

export function toStoredJson(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function toDate(value: unknown) {
  return value
    ? new Date(String(value).length === 10 ? `${String(value)}T00:00:00Z` : String(value))
    : null;
}
