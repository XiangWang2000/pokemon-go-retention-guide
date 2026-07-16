import { spawn } from "node:child_process";
import { resolve } from "node:path";

const wrangler = resolve("node_modules", "wrangler", "bin", "wrangler.js");
const persistTo = resolve(".wrangler", "state");
const child = spawn(
  process.execPath,
  [
    wrangler,
    "dev",
    "--config",
    "dist/server/wrangler.json",
    "--persist-to",
    persistTo,
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      MINIFLARE_REGISTRY_PATH: ".wrangler/registry",
      WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
      WRANGLER_WRITE_LOGS: "false",
    },
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
