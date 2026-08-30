import path from "node:path";

export const DEFAULT_DATABASE_URL = "file:./dev.db";
export const DISPOSABLE_DATABASE_FILENAME = "rebuild-ci.db";

export function getDatabaseUrl(env: Partial<NodeJS.ProcessEnv> = process.env) {
  const value = env.DATABASE_URL?.trim();
  return value || DEFAULT_DATABASE_URL;
}

function databaseFilePath(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Only SQLite file URLs are supported: ${databaseUrl}`);
  }

  const rawPath = databaseUrl.slice("file:".length).split("?", 1)[0];
  if (!rawPath) throw new Error("DATABASE_URL must include a SQLite file path.");

  if (rawPath.startsWith("//")) {
    const parsed = new URL(databaseUrl);
    let pathname = decodeURIComponent(parsed.pathname);
    if (process.platform === "win32" && /^\/[A-Za-z]:/.test(pathname)) {
      pathname = pathname.slice(1);
    }
    return pathname;
  }

  let filePath = decodeURIComponent(rawPath);
  if (process.platform === "win32" && /^\/[A-Za-z]:/.test(filePath)) {
    filePath = filePath.slice(1);
  }
  return filePath;
}

export interface DatabaseLocation {
  url: string;
  absolutePath: string;
  manifestPath: string;
}

export function resolveDatabaseLocation(
  databaseUrl = getDatabaseUrl(),
  root = process.cwd(),
): DatabaseLocation {
  const absolutePath = path.resolve(root, databaseFilePath(databaseUrl));
  const relativePath = path.relative(root, absolutePath);
  const isInsideRoot =
    relativePath !== "" &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath);

  return {
    url: databaseUrl,
    absolutePath,
    manifestPath: isInsideRoot
      ? relativePath.split(path.sep).join("/")
      : absolutePath.split(path.sep).join("/"),
  };
}

export function assertDisposableDatabase(
  databaseUrl = getDatabaseUrl(),
  env: { ALLOW_DESTRUCTIVE_REBUILD?: string } = {
    ALLOW_DESTRUCTIVE_REBUILD: process.env.ALLOW_DESTRUCTIVE_REBUILD,
  },
  root = process.cwd(),
) {
  const databasePath = resolveDatabaseLocation(databaseUrl, root).absolutePath;
  const disposablePath = resolveDatabaseLocation(
    `file:./${DISPOSABLE_DATABASE_FILENAME}`,
    root,
  ).absolutePath;
  const normalize = (value: string) => (process.platform === "win32" ? value.toLowerCase() : value);

  if (
    env.ALLOW_DESTRUCTIVE_REBUILD !== "1" ||
    normalize(databasePath) !== normalize(disposablePath)
  ) {
    throw new Error(
      `Destructive data operation requires ALLOW_DESTRUCTIVE_REBUILD=1 and DATABASE_URL=file:./${DISPOSABLE_DATABASE_FILENAME}.`,
    );
  }
}
