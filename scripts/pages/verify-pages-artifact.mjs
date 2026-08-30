import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "/pokemon-go-retention-guide").replace(
  /\/$/,
  "",
);
const siteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://xiangwang2000.github.io/pokemon-go-retention-guide/",
).origin;
const legacySiteHost = "pokemon-go-retention-guide.wang890921.chatgpt.site";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function requireFile(relativePath) {
  const filePath = path.join(out, relativePath);
  assert(await exists(filePath), `Missing Pages artifact: ${relativePath}`);
  return filePath;
}

async function requireJson(relativePath) {
  const filePath = await requireFile(relativePath);
  const payload = JSON.parse(await readFile(filePath, "utf8"));
  assert(payload !== null, `Invalid empty JSON artifact: ${relativePath}`);
  return payload;
}

async function jsonFileCount(relativeDirectory) {
  const entries = await readdir(path.join(out, relativeDirectory), { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).length;
}

function expectedUrl(pathname) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteOrigin}${basePath}${normalized}`;
}

function canonicalFromHtml(html, relativePath) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  assert(match, `${relativePath} has no canonical link.`);
  return match[1];
}

async function verifyCanonical(relativePath, expectedCanonical) {
  const html = await readFile(await requireFile(relativePath), "utf8");
  assert(
    !html.includes(legacySiteHost),
    `${relativePath} still references the legacy ChatGPT Site host.`,
  );
  assert(
    html.includes(basePath),
    `${relativePath} does not contain the GitHub Pages base path ${basePath}.`,
  );
  assert(
    canonicalFromHtml(html, relativePath) === expectedCanonical,
    `${relativePath} canonical does not match ${expectedCanonical}.`,
  );
}

async function main() {
  assert(
    await exists(out),
    "Pages output directory does not exist. Run npm run build:pages first.",
  );

  const manifest = JSON.parse(
    await readFile(path.join(root, "site-data", "manifest.json"), "utf8"),
  );
  assert(
    typeof manifest.dataVersion === "string" && manifest.dataVersion.length > 0,
    "Pages snapshot manifest has no dataVersion.",
  );
  assert(
    typeof manifest.excel?.path === "string" && manifest.excel.path.startsWith("public/"),
    "Pages snapshot manifest Excel path must be inside public/.",
  );
  const excelArtifactPath = manifest.excel.path.slice("public/".length);

  const staticRouteExpectations = new Map([
    ["index.html", expectedUrl("/")],
    ["review/index.html", expectedUrl("/review/")],
    ["sources/index.html", expectedUrl("/sources/")],
    ["changes/index.html", expectedUrl("/changes/")],
  ]);
  for (const [relativePath, expectedCanonical] of staticRouteExpectations) {
    await verifyCanonical(relativePath, expectedCanonical);
  }

  const home = await requireJson("data/home.json");
  assert(home.schemaVersion === 2, "Pages home.json schemaVersion is unexpected.");
  assert(
    typeof home.dataVersion === "string" && home.dataVersion.length > 0,
    "Pages home.json has no dataVersion.",
  );
  assert(
    home.dataVersion === manifest.dataVersion,
    `Pages home.json dataVersion ${home.dataVersion} does not match manifest ${manifest.dataVersion}.`,
  );
  assert(
    Array.isArray(home.families) && home.families.length > 0,
    "Pages home.json has no families.",
  );

  const auditSummary = await requireJson("data/audit-summary.json");
  assert(
    Array.isArray(auditSummary.rows) && auditSummary.rows.length > 0,
    "Pages audit summary is empty.",
  );
  assert(
    auditSummary.rows.every((row) => typeof row?.id === "string" && row.id.length > 0),
    "Pages audit summary contains a row without an id.",
  );

  await requireFile("data/review.json");
  await requireFile("data/sources.json");
  await requireFile("data/changes.json");
  await requireFile(excelArtifactPath);

  assert(
    (await jsonFileCount("data/families")) === home.families.length,
    "Pages family data file count does not match home.json.",
  );
  assert(
    (await jsonFileCount("data/audit")) === auditSummary.rows.length,
    "Pages audit detail file count does not match audit-summary.json.",
  );
  assert(
    (await jsonFileCount("data/details")) === auditSummary.rows.length,
    "Pages supplemental detail file count does not match audit-summary.json.",
  );

  const pokemonDir = path.join(out, "pokemon");
  const pokemonEntries = (await readdir(pokemonDir, { withFileTypes: true })).filter((entry) =>
    entry.isDirectory(),
  );
  assert(
    pokemonEntries.length === auditSummary.rows.length,
    `Generated Pokémon route count ${pokemonEntries.length} does not match audit row count ${auditSummary.rows.length}.`,
  );

  const sitemap = await readFile(await requireFile("sitemap.xml"), "utf8");
  assert(sitemap.includes(expectedUrl("/")), "sitemap.xml is missing the home URL.");
  assert(sitemap.includes(expectedUrl("/review/")), "sitemap.xml is missing the review URL.");
  assert(!sitemap.includes(legacySiteHost), "sitemap.xml references the legacy ChatGPT Site host.");

  for (const row of auditSummary.rows) {
    const routeId = encodeURIComponent(row.id);
    const relativePath = path.join("pokemon", routeId, "index.html");
    const canonical = expectedUrl(`/pokemon/${routeId}/`);
    await verifyCanonical(relativePath, canonical);
    assert(sitemap.includes(canonical), `sitemap.xml is missing Pokémon route ${row.id}.`);
  }

  const robots = await readFile(await requireFile("robots.txt"), "utf8");
  assert(
    robots.includes(expectedUrl("/sitemap.xml")),
    "robots.txt does not advertise the Pages sitemap.",
  );
  assert(!robots.includes(legacySiteHost), "robots.txt references the legacy ChatGPT Site host.");

  console.log(
    `Pages artifact verified: ${staticRouteExpectations.size + auditSummary.rows.length} canonical routes, ${home.families.length} families, ${auditSummary.rows.length} audit/detail records, data version ${home.dataVersion}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
