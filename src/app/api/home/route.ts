import { DATA_VERSION } from "@/config/release";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const sourceUrl = new URL("/data/home.json", request.url);
  const source = await fetch(sourceUrl, { cache: "no-store" });
  const headers = new Headers(source.headers);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Surrogate-Control", "no-store");
  headers.set("Pragma", "no-cache");
  headers.set("X-Data-Version", DATA_VERSION);
  return new Response(source.body, {
    status: source.status,
    statusText: source.statusText,
    headers,
  });
}
