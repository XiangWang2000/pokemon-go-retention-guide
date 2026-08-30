import type { NextConfig } from "next";

const isStaticExport = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);
const basePath = isStaticExport ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  basePath,
  assetPrefix: basePath ? `${basePath.replace(/\/$/, "")}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
