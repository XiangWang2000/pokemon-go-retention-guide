import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const siteUrl = (
  process.env.SITE_URL ?? "https://pokemon-go-retention-guide.wang890921.chatgpt.site"
).replace(/\/$/u, "");
const manifest = JSON.parse(
  await readFile(new URL("../site-data/manifest.json", import.meta.url), "utf8"),
);
const dataVersion = manifest.dataVersion;
if (typeof dataVersion !== "string" || !dataVersion) {
  throw new Error("site-data/manifest.json 缺少 dataVersion，停止 purge。");
}
const expectedHome = await readFile(new URL("../public/data/home.json", import.meta.url));
const expectedHomeHash = createHash("sha256").update(expectedHome).digest("hex");

const paths = ["/", "/api/home", "/data/home.json"];
for (const pathname of paths) {
  const response = await fetch(`${siteUrl}${pathname}`, {
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
      "X-Site-Cache-Purge": dataVersion,
      "User-Agent": "pokemon-go-retention-guide-cache-purge/1.0",
    },
  });
  const body = await response.arrayBuffer();
  const bodyHash = createHash("sha256").update(Buffer.from(body)).digest("hex");
  const responseVersion = response.headers.get("x-data-version");
  const versionMatches =
    responseVersion === dataVersion ||
    (pathname === "/data/home.json" && bodyHash === expectedHomeHash);
  if (!response.ok || !versionMatches) {
    throw new Error(
      `${pathname} purge 驗證失敗：HTTP ${response.status}，X-Data-Version=${responseVersion ?? "<missing>"}，contentHash=${bodyHash}，預期版本 ${dataVersion}。`,
    );
  }
  console.log(
    JSON.stringify({
      pathname,
      status: response.status,
      bytes: body.byteLength,
      dataVersion: responseVersion,
      contentHash: bodyHash,
      cacheControl: response.headers.get("cache-control"),
      cdnCacheControl: response.headers.get("cdn-cache-control"),
    }),
  );
}

console.log(`Sites CDN purge 驗證完成：${dataVersion}。`);
