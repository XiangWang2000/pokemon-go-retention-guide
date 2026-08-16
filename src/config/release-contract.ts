import { BATCH_REGISTRY } from "./batch-registry";
import { CURRENT_DATA_SCOPE } from "./data-scope";
import { DATA_VERSION, DATA_VERSION_DATE_ISO } from "./release";

function scopeNumber(value: number) {
  return String(value).padStart(3, "0");
}

const registryMinDex = BATCH_REGISTRY[0]?.minDex;
const registryMaxDex = BATCH_REGISTRY.at(-1)?.maxDex;
if (registryMinDex === undefined || registryMaxDex === undefined) {
  throw new Error("The published batch registry must not be empty.");
}

const registryScope = `${scopeNumber(registryMinDex)}-${scopeNumber(registryMaxDex)}`;
if (registryScope !== CURRENT_DATA_SCOPE) {
  throw new Error(
    `Current data scope ${CURRENT_DATA_SCOPE} does not match the published registry ${registryScope}.`,
  );
}

const recalibrationBase = `review/${registryScope}-recalibration`;

export const CURRENT_RELEASE_CONTRACT = {
  scope: registryScope,
  minDex: registryMinDex,
  maxDex: registryMaxDex,
  dataVersion: DATA_VERSION,
  dataAsOf: DATA_VERSION_DATE_ISO,
  expectedCounts: {
    battleVariants: 2344,
    families: 318,
    ivRecommendations: 13,
    trueDataPending: 0,
  },
  snapshot: {
    manifestPath: "site-data/manifest.json",
    exportPath: `public/exports/pokemon-go-retention-${registryScope}.xlsx`,
    generatedRoots: ["site-data", "public/data", "public/exports"] as const,
  },
  review: {
    batchJsonPaths: BATCH_REGISTRY.map((entry) => entry.review.jsonPath),
    batchMarkdownPaths: BATCH_REGISTRY.map((entry) => entry.review.markdownPath),
    recalibrationJsonPath: `${recalibrationBase}.json`,
    recalibrationMarkdownPath: `${recalibrationBase}.md`,
  },
} as const;

export function expectedReleaseReviewPaths() {
  return new Set<string>([
    ...CURRENT_RELEASE_CONTRACT.review.batchJsonPaths,
    ...CURRENT_RELEASE_CONTRACT.review.batchMarkdownPaths,
    CURRENT_RELEASE_CONTRACT.review.recalibrationJsonPath,
    CURRENT_RELEASE_CONTRACT.review.recalibrationMarkdownPath,
  ]);
}

export function isExpectedReleaseGeneratedPath(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");
  const segments = normalized.split("/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    return false;
  }
  if (
    CURRENT_RELEASE_CONTRACT.snapshot.generatedRoots.some((root) =>
      normalized.startsWith(`${root}/`),
    )
  ) {
    return true;
  }
  if (normalized === CURRENT_RELEASE_CONTRACT.snapshot.exportPath) return true;
  return expectedReleaseReviewPaths().has(normalized);
}
