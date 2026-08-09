import { spawn } from "node:child_process";
import { resolve } from "node:path";

const next = resolve("node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [next, "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_STATIC_EXPORT: "true" },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
