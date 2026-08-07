import auditSummarySnapshot from "../../../../site-data/auditSummary.json";
import { DATA_VERSION } from "@/config/release";
import {
  filterAuditRows,
  normalizeAuditQuery,
  type AuditRowSummary,
  type AuditSummarySnapshot,
} from "@/lib/audit-data";
import { auditDataFileName, familyDataFileName } from "@/lib/site-data-paths";
import type { FamilyOverview } from "@/presentation/family-overview";
import siteSnapshotManifest from "../../../../site-data/manifest.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreHeaders() {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Surrogate-Control", "no-store");
  headers.set("Pragma", "no-cache");
  headers.set("X-Data-Version", DATA_VERSION);
  return headers;
}

function markFamilyLoaded(family: FamilyOverview): FamilyOverview {
  return {
    ...family,
    detailsLoaded: true,
    members: family.members.map((member) => ({
      ...member,
      form: { ...member.form, detailsLoaded: true },
    })),
  };
}

async function proxyJson(request: Request, pathname: string) {
  const sourceUrl = new URL(pathname, request.url);
  const source = await fetch(sourceUrl, { cache: "no-store" });
  return new Response(await source.text(), {
    status: source.status,
    statusText: source.statusText,
    headers: noStoreHeaders(),
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const scope = requestUrl.searchParams.get("scope");

  if (scope === "family") {
    const familyId = requestUrl.searchParams.get("familyId");
    if (!familyId) {
      return new Response(JSON.stringify({ error: "Family not found" }), {
        status: 404,
        headers: noStoreHeaders(),
      });
    }
    const response = await proxyJson(
      request,
      `/data/families/${encodeURIComponent(familyDataFileName(familyId))}`,
    );
    if (!response.ok) return response;
    const family = (await response.json()) as FamilyOverview;
    return new Response(
      JSON.stringify({
        schemaVersion: 1,
        dataAsOf: siteSnapshotManifest.dataAsOf ?? null,
        family: markFamilyLoaded(family),
      }),
      { headers: noStoreHeaders() },
    );
  }

  if (scope === "audit") {
    const snapshot = auditSummarySnapshot as unknown as AuditSummarySnapshot;
    const query = normalizeAuditQuery(requestUrl.searchParams);
    const filtered = filterAuditRows(snapshot.rows as AuditRowSummary[], query, snapshot.dataAsOf);
    const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const start = (page - 1) * query.pageSize;
    const payload = {
      schemaVersion: 1,
      dataAsOf: snapshot.dataAsOf,
      rows: filtered.slice(start, start + query.pageSize),
      total: filtered.length,
      overallTotal: snapshot.rows.length,
      page,
      pageSize: query.pageSize,
    };
    return new Response(JSON.stringify(payload), { headers: noStoreHeaders() });
  }

  if (scope === "audit-row") {
    const rowId = requestUrl.searchParams.get("rowId");
    if (!rowId) {
      return new Response(JSON.stringify({ error: "Audit row not found" }), {
        status: 404,
        headers: noStoreHeaders(),
      });
    }
    return proxyJson(request, `/data/audit/${encodeURIComponent(auditDataFileName(rowId))}`);
  }

  return proxyJson(request, "/data/home.json");
}
