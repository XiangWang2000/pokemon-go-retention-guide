/** Cloudflare Worker entry point for the vinext-starter template. */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { DATA_VERSION, DATA_VERSION_QUERY } from "../src/config/release";

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
  "X-Data-Version-Query": DATA_VERSION_QUERY,
};

function isCacheSensitiveRequest(request: Request, url: URL) {
  if (request.method !== "GET") return false;
  if (url.pathname === "/data/home.json") return true;
  return url.pathname === "/" || (request.headers.get("accept") ?? "").includes("text/html");
}

function purgeEdgeCache(request: Request, url: URL, ctx: ExecutionContext) {
  const edgeCache = (globalThis as typeof globalThis & WorkerGlobals).caches?.default;
  if (!edgeCache) return;
  ctx.waitUntil(edgeCache.delete(request));
  ctx.waitUntil(edgeCache.delete(new Request(new URL(url.pathname, request.url))));
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

    if (url.pathname === "/api/home") {
      const assetUrl = new URL("/data/home.json", request.url);
      assetUrl.search = url.search;
      const response = await env.ASSETS.fetch(new Request(assetUrl));
      purgeEdgeCache(request, url, ctx);
      return addNoStoreHeaders(response);
    }

    const response = await handler.fetch(request, env, ctx);
    if (!isCacheSensitiveRequest(request, url)) return response;

    purgeEdgeCache(request, url, ctx);
    return addNoStoreHeaders(response, url.pathname === "/");
  },
};

export default worker;
