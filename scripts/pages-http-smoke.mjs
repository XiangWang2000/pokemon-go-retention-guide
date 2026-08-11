function assert(condition, message) {
  if (!condition) throw new Error(message);
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

export async function smokePagesHttp(siteUrlValue) {
  const siteUrl = normalizeSiteUrl(siteUrlValue);
  const basePath = siteUrl.pathname.replace(/\/$/, "");

  const { body: homeHtml } = await check(siteUrl, "", "text/html");
  if (basePath) {
    assert(homeHtml.includes(basePath), `Home HTML does not contain the Pages base path ${basePath}.`);
  }

  await check(siteUrl, "review/", "text/html");
  await check(siteUrl, "pokemon/001-kanto-normal/", "text/html");

  const { body: homeJson } = await check(siteUrl, "data/home.json", "application/json");
  const payload = JSON.parse(homeJson);
  assert(payload.schemaVersion === 2, "Served home.json schemaVersion is unexpected.");
  assert(typeof payload.dataVersion === "string" && payload.dataVersion.length > 0, "Served home.json has no dataVersion.");

  const { body: sitemap } = await check(siteUrl, "sitemap.xml", "xml");
  assert(
    sitemap.includes(resolveUrl(siteUrl, "pokemon/001-kanto-normal/").toString()),
    "Served sitemap is missing the known Pokémon detail route.",
  );

  const missingUrl = resolveUrl(siteUrl, "does-not-exist/");
  const missing = await fetchWithRetry(missingUrl);
  assert(missing.status === 404, `${missingUrl} returned ${missing.status} instead of 404.`);

  return { dataVersion: payload.dataVersion, siteUrl: siteUrl.toString() };
}
