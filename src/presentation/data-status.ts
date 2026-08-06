const nonMaterialStatuses = new Set([
  "PARTIALLY_VERIFIED",
  "UNRANKED",
  "DATA_UNAVAILABLE",
  "SOURCE_MISSING",
  "SOURCE_CONFLICT",
  "POSSIBLE_SPECIES_MISMATCH",
  "STALE",
  "UNKNOWN_RELEASE_STATUS",
]);

export function scopedCategoryDataNote(status: { status: string; materialToDecision: boolean }) {
  return !status.materialToDecision && nonMaterialStatuses.has(status.status)
    ? "此欄位待補，但不影響普通個體結論"
    : null;
}
