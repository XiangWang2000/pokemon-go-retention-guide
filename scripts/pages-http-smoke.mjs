import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function representativeDetailPathnames(rows) {
  assert(Array.isArray(rows) && rows.length > 0, "Audit summary has no rows for smoke sampling.");
  assert(
    rows.every((row) => typeof row?.id === "string" && row.id.length > 0),
    "Audit summary contains a row without an id.",
  );
  const indexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  return indexes.map((index) => `pokemon/${encodeURIComponent(rows[index].id)}/`);
}

export async function readExpectedPagesSmokeContract() {
  const manifest = JSON.parse(
    await readFile(new URL("../site-data/manifest.json", import.meta.url), "utf8"),
  );
  const auditSummary = JSON.parse(
    await readFile(new URL("../site-data/auditSummary.json", import.meta.url), "utf8"),
  );
  assert(
    typeof manifest.dataVersion === "string" && manifest.dataVersion.length > 0,
    "Snapshot manifest has no dataVersion.",
  );
  assert(
    typeof manifest.excel?.path === "string" && manifest.excel.path.startsWith("public/"),
    "Snapshot manifest Excel path must be inside public/.",
  );
  assert(
    Number.isInteger(manifest.excel.bytes) && manifest.excel.bytes > 0,
    "Snapshot manifest Excel byte size is invalid.",
  );
  assert(
    typeof manifest.excel.sha256 === "string" && /^[a-f0-9]{64}$/.test(manifest.excel.sha256),
    "Snapshot manifest Excel SHA256 is invalid.",
  );
  assert(
    Array.isArray(auditSummary.rows) && auditSummary.rows.length === manifest.counts?.auditSummaryRows,
    "Audit summary row count does not match the snapshot manifest.",
  );
  return {
    dataVersion: manifest.dataVersion,
    detailPathnames: representativeDetailPathnames(auditSummary.rows),
    workbook: {
      pathname: manifest.excel.path.slice("public/".length),
      bytes: manifest.excel.bytes,
      sha256: manifest.excel.sha256,
    },
  };
}

function normalizeSiteUrl(value) {
  const url = new URL(value);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  url.search = "";
  url.hash = "";
  return url;
}

function resolveUrl(siteUrl, pathname) {
  return new URL(pathname.replace(/^\//, ""), siteUrl);
}

async function fetchWithRetry(url, { attempts = 6, timeoutMs = 10_000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status >= 500 && attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

async function check(siteUrl, pathname, expectedType) {
  const url = resolveUrl(siteUrl, pathname);
  const response = await fetchWithRetry(url);
  assert(response.status === 200, `${url} returned ${response.status}.`);
  const contentType = response.headers.get("content-type") || "";
  assert(contentType.includes(expectedType), `${url} returned unexpected Content-Type: ${contentType}`);
  const body = await response.text();
  assert(body.length > 0, `${url} returned an empty body.`);
  return { body, url };
}

async function checkWorkbook(siteUrl, expectedWorkbook) {
  const url = resolveUrl(siteUrl, expectedWorkbook.pathname);
  const response = await fetchWithRetry(url);
  assert(response.status === 200, `${url} returned ${response.status}.`);
  const workbook = Buffer.from(await response.arrayBuffer());
  assert(workbook.length === expectedWorkbook.bytes, `${url} returned ${workbook.length} bytes instead of ${expectedWorkbook.bytes}.`);
  assert(workbook[0] === 0x50 && workbook[1] === 0x4b, `${url} is not a ZIP/XLSX payload.`);
  const sha256 = createHash("sha256").update(workbook).digest("hex");
  assert(sha256 === expectedWorkbook.sha256, `${url} SHA256 ${sha256} does not match expected ${expectedWorkbook.sha256}.`);
}

export async function smokePagesHttp(
  siteUrlValue,
  { expectedDataVersion, expectedWorkbook, expectedDetailPathnames = [] } = {},
) {
  const siteUrl = normalizeSiteUrl(siteUrlValue);
  const basePath = siteUrl.pathname.replace(/\/$/, "");

  const { body: homeHtml } = await check(siteUrl, "", "text/html");
  if (basePath) {
    assert(homeHtml.includes(basePath), `Home HTML does not contain the Pages base path ${basePath}.`);
  }

  await check(siteUrl, "review/", "text/html");
  await check(siteUrl, "sources/", "text/html");
  await check(siteUrl, "changes/", "text/html");
  for (const pathname of expectedDetailPathnames) {
    await check(siteUrl, pathname, "text/html");
  }

  const { body: homeJson } = await check(siteUrl, "data/home.json", "application/json");
  const payload = JSON.parse(homeJson);
  assert(payload.schemaVersion === 2, "Served home.json schemaVersion is unexpected.");
  assert(typeof payload.dataVersion === "string" && payload.dataVersion.length > 0, "Served home.json has no dataVersion.");
  if (expectedDataVersion) {
    assert(
      payload.dataVersion === expectedDataVersion,
      `Served home.json dataVersion ${payload.dataVersion} does not match expected ${expectedDataVersion}.`,
    );
  }

  const { body: sitemap } = await check(siteUrl, "sitemap.xml", "xml");
  for (const pathname of expectedDetailPathnames) {
    const detailPath = `${siteUrl.pathname}${pathname}`;
    assert(
      sitemap.includes(detailPath),
      `Served sitemap is missing the representative Pokémon detail path ${detailPath}.`,
    );
  }

  const { body: robots } = await check(siteUrl, "robots.txt", "text/plain");
  const sitemapPath = `${siteUrl.pathname}sitemap.xml`;
  assert(
    robots.includes(sitemapPath),
    `Served robots.txt is missing the sitemap path ${sitemapPath}.`,
  );

  if (expectedWorkbook) {
    await checkWorkbook(siteUrl, expectedWorkbook);
  }

  const missingUrl = resolveUrl(siteUrl, "does-not-exist/");
  const missing = await fetchWithRetry(missingUrl);
  assert(missing.status === 404, `${missingUrl} returned ${missing.status} instead of 404.`);

  return { dataVersion: payload.dataVersion, siteUrl: siteUrl.toString() };
}
