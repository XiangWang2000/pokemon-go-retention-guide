import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "/pokemon-go-retention-guide").replace(/\/$/, "");
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

function expectedUrl(pathname) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteOrigin}${basePath}${normalized}`;
}

function canonicalFromHtml(html, relativePath) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  assert(match, `${relativePath} has no canonical link.`);
  return match[1];
}

async function main() {
  assert(await exists(out), "Pages output directory does not exist. Run npm run build:pages first.");

  const routeExpectations = new Map([
    ["index.html", expectedUrl("/")],
    ["review/index.html", expectedUrl("/review/")],
    ["sources/index.html", expectedUrl("/sources/")],
    ["changes/index.html", expectedUrl("/changes/")],
  ]);
  for (const relativePath of routeExpectations.keys()) await requireFile(relativePath);

  const home = await requireJson("data/home.json");
  assert(home.schemaVersion === 2, "Pages home.json schemaVersion is unexpected.");
  assert(typeof home.dataVersion === "string" && home.dataVersion.length > 0, "Pages home.json has no dataVersion.");

  const auditSummary = await requireJson("data/audit-summary.json");
  assert(Array.isArray(auditSummary.rows) && auditSummary.rows.length > 0, "Pages audit summary is empty.");

  await requireFile("data/review.json");
  await requireFile("data/sources.json");
  await requireFile("data/changes.json");
  await requireFile("exports/pokemon-go-retention-001-386.xlsx");

  const pokemonDir = path.join(out, "pokemon");
  const pokemonEntries = (await readdir(pokemonDir, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  assert(pokemonEntries.length > 0, "No statically generated Pokémon detail routes were found.");
  const samplePokemon = pokemonEntries[0].name;
  const samplePokemonHtml = path.join("pokemon", samplePokemon, "index.html");
  await requireFile(samplePokemonHtml);
  routeExpectations.set(samplePokemonHtml, expectedUrl(`/pokemon/${samplePokemon}/`));

  for (const [relativePath, expectedCanonical] of routeExpectations) {
    const html = await readFile(path.join(out, relativePath), "utf8");
    assert(!html.includes(legacySiteHost), `${relativePath} still references the legacy ChatGPT Site host.`);
    assert(html.includes(basePath), `${relativePath} does not contain the GitHub Pages base path ${basePath}.`);
    assert(
      canonicalFromHtml(html, relativePath) === expectedCanonical,
      `${relativePath} canonical does not match ${expectedCanonical}.`,
    );
  }

  const sitemap = await readFile(await requireFile("sitemap.xml"), "utf8");
  assert(sitemap.includes(expectedUrl("/")), "sitemap.xml is missing the home URL.");
  assert(sitemap.includes(expectedUrl("/review/")), "sitemap.xml is missing the review URL.");
  assert(
    sitemap.includes(expectedUrl(`/pokemon/${samplePokemon}/`)),
    "sitemap.xml is missing a generated Pokémon detail URL.",
  );
  assert(!sitemap.includes(legacySiteHost), "sitemap.xml references the legacy ChatGPT Site host.");

  const robots = await readFile(await requireFile("robots.txt"), "utf8");
  assert(robots.includes(expectedUrl("/sitemap.xml")), "robots.txt does not advertise the Pages sitemap.");
  assert(!robots.includes(legacySiteHost), "robots.txt references the legacy ChatGPT Site host.");

  console.log(
    `Pages artifact verified: ${routeExpectations.size} canonical routes, ${auditSummary.rows.length} audit rows, data version ${home.dataVersion}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
