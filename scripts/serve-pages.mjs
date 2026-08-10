import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const out = path.resolve(root, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "/pokemon-go-retention-guide").replace(/\/$/, "");
const port = Number(process.env.PORT || 3000);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
]);

function send(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

function stripBasePath(pathname) {
  if (!basePath) return pathname;
  if (pathname === basePath || pathname === `${basePath}/`) return "/";
  if (!pathname.startsWith(`${basePath}/`)) return null;
  return pathname.slice(basePath.length);
}

async function resolveArtifactPath(pathname) {
  const relativePath = stripBasePath(pathname);
  if (relativePath === null) return null;

  const decoded = decodeURIComponent(relativePath);
  const candidate = path.resolve(out, `.${decoded}`);
  if (candidate !== out && !candidate.startsWith(`${out}${path.sep}`)) return null;

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) return path.join(candidate, "index.html");
    if (info.isFile()) return candidate;
  } catch {
    // Try Next's trailing-slash export form below.
  }

  if (!path.extname(candidate)) {
    const indexCandidate = path.join(candidate, "index.html");
    try {
      if ((await stat(indexCandidate)).isFile()) return indexCandidate;
    } catch {
      return null;
    }
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    send(response, 405, "Method Not Allowed");
    return;
  }

  try {
    const url = new URL(request.url || "/", "http://localhost");
    const filePath = await resolveArtifactPath(url.pathname);
    if (!filePath) {
      send(response, 404, "Not Found");
      return;
    }

    const info = await stat(filePath);
    const contentType = mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    response.writeHead(200, {
      "Content-Length": info.size,
      "Content-Type": contentType,
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error(error);
    send(response, 500, "Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Serving GitHub Pages artifact at http://localhost:${port}${basePath || "/"}`);
});
