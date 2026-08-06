import type { NextConfig } from "next";
import { DATA_VERSION } from "./src/config/release";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    const cacheHeaders = [
      { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
      { key: "CDN-Cache-Control", value: "no-store" },
      { key: "Pragma", value: "no-cache" },
      { key: "X-Data-Version", value: DATA_VERSION },
    ];
    return [
      { source: "/", headers: [...cacheHeaders, { key: "Clear-Site-Data", value: '"cache"' }] },
      { source: "/data/home.json", headers: cacheHeaders },
      { source: "/review", headers: cacheHeaders },
      { source: "/sources", headers: cacheHeaders },
      { source: "/changes", headers: cacheHeaders },
      { source: "/pokemon/:variantId", headers: cacheHeaders },
    ];
  },
};

export default nextConfig;
