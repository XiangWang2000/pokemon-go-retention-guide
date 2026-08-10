import { spawn } from "node:child_process";

const port = 4173;
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "/pokemon-go-retention-guide").replace(/\/$/, "");
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve-pages.mjs"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(port), NEXT_PUBLIC_BASE_PATH: basePath },
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Pages server exited before smoke checks.\n${output}`);
    }
    try {
      const response = await fetch(`${origin}${basePath}/`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Pages server did not become ready.\n${output}`);
}

async function check(pathname, expectedType) {
  const response = await fetch(`${origin}${pathname}`);
  assert(response.status === 200, `${pathname} returned ${response.status}.`);
  const contentType = response.headers.get("content-type") || "";
  assert(contentType.includes(expectedType), `${pathname} returned unexpected Content-Type: ${contentType}`);
  const body = await response.text();
  assert(body.length > 0, `${pathname} returned an empty body.`);
  return body;
}

async function main() {
  try {
    await waitForServer();
    const homeHtml = await check(`${basePath}/`, "text/html");
    assert(homeHtml.includes(basePath), "Home HTML does not contain the Pages base path.");
    await check(`${basePath}/review/`, "text/html");
    await check(`${basePath}/pokemon/001-kanto-normal/`, "text/html");
    const homeJson = await check(`${basePath}/data/home.json`, "application/json");
    const payload = JSON.parse(homeJson);
    assert(payload.schemaVersion === 2, "Served home.json schemaVersion is unexpected.");

    const missing = await fetch(`${origin}${basePath}/does-not-exist/`);
    assert(missing.status === 404, `Missing route returned ${missing.status} instead of 404.`);

    const outsideBasePath = await fetch(`${origin}/review/`);
    assert(outsideBasePath.status === 404, `Route outside base path returned ${outsideBasePath.status} instead of 404.`);

    console.log("Pages local server smoke check passed.");
  } finally {
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await new Promise((resolve) => server.once("exit", resolve));
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
