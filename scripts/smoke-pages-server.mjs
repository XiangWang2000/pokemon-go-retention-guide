import { spawn } from "node:child_process";
import {
  readExpectedPagesDataVersion,
  smokePagesHttp,
} from "./pages-http-smoke.mjs";

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

async function main() {
  try {
    await waitForServer();
    const expectedDataVersion = await readExpectedPagesDataVersion();
    const result = await smokePagesHttp(`${origin}${basePath}/`, { expectedDataVersion });

    const outsideBasePath = await fetch(`${origin}/review/`);
    if (outsideBasePath.status !== 404) {
      throw new Error(`Route outside base path returned ${outsideBasePath.status} instead of 404.`);
    }

    console.log(`Pages local server smoke check passed for data version ${result.dataVersion}.`);
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
