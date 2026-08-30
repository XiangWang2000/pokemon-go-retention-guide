import { spawn } from "node:child_process";
import { resolve } from "node:path";

const next = resolve("node_modules", "next", "dist", "bin", "next");
const defaultBasePath = "/pokemon-go-retention-guide";
const child = spawn(process.execPath, [next, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? defaultBasePath,
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
