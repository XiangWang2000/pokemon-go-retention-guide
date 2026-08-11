import type { NextConfig } from "next";
import { GITHUB_PAGES_BASE_PATH } from "./src/config/site";

const isStaticExport =
  process.env.NEXT_STATIC_EXPORT === "true" ||
  process.env.NEXT_PUBLIC_BASE_PATH === GITHUB_PAGES_BASE_PATH;
const basePath = isStaticExport ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  basePath,
  assetPrefix: basePath ? `${basePath.replace(/\/$/, "")}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
