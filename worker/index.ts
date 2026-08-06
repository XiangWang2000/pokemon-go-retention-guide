/** Cloudflare Worker entry point for the vinext-starter template. */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { DATA_VERSION } from "../src/config/release";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface EdgeCache {
  delete(request: Request): Promise<boolean>;
}

interface WorkerGlobals {
  caches?: { default?: EdgeCache };
}

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Surrogate-Control": "no-store",
  Pragma: "no-cache",
  "X-Data-Version": DATA_VERSION,
};

function isCacheSensitiveRequest(request: Request, url: URL) {
  if (request.method !== "GET") return false;
  if (url.pathname === "/data/home.json") return true;
  return url.pathname === "/" || (request.headers.get("accept") ?? "").includes("text/html");
}

async function purgeEdgeCache(request: Request, url: URL) {
  const edgeCache = (globalThis as typeof globalThis & WorkerGlobals).caches?.default;
  if (!edgeCache) return;
  await Promise.all([
    edgeCache.delete(request),
    edgeCache.delete(new Request(new URL(url.pathname, request.url))),
  ]);
}

function shouldPurgeCache(request: Request) {
  return request.headers.get("X-Site-Cache-Purge") === DATA_VERSION;
}

function addNoStoreHeaders(response: Response, clearSiteData = false) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(noStoreHeaders)) headers.set(name, value);
  if (clearSiteData) headers.set("Clear-Site-Data", '"cache"');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        allowedWidths,
      );
    }

    if (
      request.method === "GET" &&
      (url.pathname === "/api/home" || url.pathname === "/data/home.json")
    ) {
      if (shouldPurgeCache(request)) await purgeEdgeCache(request, url);
      const response = await env.ASSETS.fetch(
        new Request(
          new URL(url.pathname === "/api/home" ? "/data/home.json" : url.pathname, request.url),
        ),
      );
      return addNoStoreHeaders(response);
    }

    const response = await handler.fetch(request, env, ctx);
    if (!isCacheSensitiveRequest(request, url)) return response;

    if (shouldPurgeCache(request)) await purgeEdgeCache(request, url);
    return addNoStoreHeaders(response, url.pathname === "/");
  },
};

export default worker;
