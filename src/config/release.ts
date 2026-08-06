export const DATA_VERSION = "2026.08.06-r15";
export const DATA_VERSION_DATE_ZH_TW = "2026/08/06";
export const DATA_VERSION_QUERY = "20260806-r15";

export function withDataVersion(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${DATA_VERSION_QUERY}`;
}
