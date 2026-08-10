import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "./seo-metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
