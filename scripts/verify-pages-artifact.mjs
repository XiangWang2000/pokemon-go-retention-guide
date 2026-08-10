import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "/pokemon-go-retention-guide").replace(/\/$/, "");
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

async function main() {
  assert(await exists(out), "Pages output directory does not exist. Run npm run build:pages first.");

  const htmlFiles = ["index.html", "review/index.html", "sources/index.html", "changes/index.html"];
  for (const relativePath of htmlFiles) await requireFile(relativePath);

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
  await requireFile(path.join("pokemon", samplePokemon, "index.html"));

  for (const relativePath of [...htmlFiles, path.join("pokemon", samplePokemon, "index.html")]) {
    const html = await readFile(path.join(out, relativePath), "utf8");
    assert(!html.includes(legacySiteHost), `${relativePath} still references the legacy ChatGPT Site host.`);
    assert(
      html.includes(basePath) || relativePath === "index.html",
      `${relativePath} does not contain the GitHub Pages base path ${basePath}.`,
    );
  }

  console.log(
    `Pages artifact verified: ${htmlFiles.length + 1} HTML routes, ${auditSummary.rows.length} audit rows, data version ${home.dataVersion}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
