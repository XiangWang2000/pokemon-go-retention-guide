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
  throw new Error("site-data/manifest.json is missing dataVersion");
}
const expectedHome = await readFile(new URL("../public/data/home.json", import.meta.url));
const expectedHomeHash = createHash("sha256").update(expectedHome).digest("hex");

const paths = ["/", `/data/home.json?v=${encodeURIComponent(dataVersion)}`];
for (const pathname of paths) {
  const response = await fetch(`${siteUrl}${pathname}`, {
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
      "User-Agent": "pokemon-go-retention-guide-cache-check/1.0",
    },
  });
  const body = await response.arrayBuffer();
  const bodyHash = createHash("sha256").update(Buffer.from(body)).digest("hex");
  const versionMatches = pathname === "/" || bodyHash === expectedHomeHash;
  if (!response.ok || !versionMatches) {
    throw new Error(
      `${pathname} cache check failed: HTTP ${response.status}, contentHash=${bodyHash}, expected=${expectedHomeHash}`,
    );
  }
  console.log(
    JSON.stringify({
      pathname,
      status: response.status,
      bytes: body.byteLength,
      dataVersion,
      contentHash: bodyHash,
      cacheControl: response.headers.get("cache-control"),
    }),
  );
}

console.log(`Sites cache check passed for ${dataVersion}.`);
