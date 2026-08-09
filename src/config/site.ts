import { DATA_VERSION } from "./release";

export const GITHUB_PAGES_BASE_PATH = "/pokemon-go-retention-guide";

export function resolveSiteBasePath(env: Record<string, string | undefined>) {
  return env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function sitePath(pathname: string, basePath = SITE_BASE_PATH) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!basePath) return normalizedPath;
  return `${basePath.replace(/\/$/, "")}${normalizedPath}`;
}

export function versionedAssetPath(pathname: string) {
  const separator = pathname.includes("?") ? "&" : "?";
  return `${sitePath(pathname)}${separator}v=${encodeURIComponent(DATA_VERSION)}`;
}

export function versionedDataPath(pathname: string) {
  return versionedAssetPath(pathname);
}

export async function fetchStaticJson<T>(pathname: string) {
  const response = await fetch(versionedDataPath(pathname), { cache: "force-cache" });
  if (!response.ok) throw new Error(`Static data request failed: ${response.status}`);
  return (await response.json()) as T;
}
