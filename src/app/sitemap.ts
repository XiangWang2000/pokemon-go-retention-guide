import type { MetadataRoute } from "next";
import auditSummarySnapshot from "../../site-data/auditSummary.json";
import { DATA_VERSION_DATE_ISO } from "@/config/release";
import type { AuditSummarySnapshot } from "@/lib/audit-data";
import { absoluteSiteUrl } from "./seo-metadata";

export const dynamic = "force-static";

const auditRows = (auditSummarySnapshot as unknown as AuditSummarySnapshot).rows;
const lastModified = new Date(`${DATA_VERSION_DATE_ISO}T00:00:00+08:00`);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteSiteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteSiteUrl("/review/"), lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteSiteUrl("/sources/"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteSiteUrl("/changes/"), lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];

  const pokemonRoutes: MetadataRoute.Sitemap = auditRows.map((row) => ({
    url: absoluteSiteUrl(`/pokemon/${encodeURIComponent(row.id)}/`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...pokemonRoutes];
}
