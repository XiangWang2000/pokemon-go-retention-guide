import homeSnapshot from "../../../../site-data/home.json";
import { DATA_VERSION } from "@/config/release";
import { getDashboardRows } from "@/lib/data";
import type { FamilyOverview } from "@/presentation/family-overview";
import type { HomeSnapshot } from "@/presentation/home-snapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fullHome = homeSnapshot as unknown as HomeSnapshot;

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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const scope = requestUrl.searchParams.get("scope");

  if (scope === "family") {
    const familyId = requestUrl.searchParams.get("familyId");
    const family = familyId ? fullHome.families.find((item) => item.familyId === familyId) : null;
    if (!family) {
      return new Response(JSON.stringify({ error: "Family not found" }), {
        status: 404,
        headers: noStoreHeaders(),
      });
    }
    return new Response(
      JSON.stringify({
        schemaVersion: 1,
        dataAsOf: fullHome.dataAsOf,
        family: markFamilyLoaded(family),
      }),
      { headers: noStoreHeaders() },
    );
  }

  if (scope === "audit") {
    const rows = await getDashboardRows();
    return new Response(JSON.stringify(rows), { headers: noStoreHeaders() });
  }

  const sourceUrl = new URL("/data/home.json", request.url);
  const source = await fetch(sourceUrl, { cache: "no-store" });
  return new Response(await source.text(), {
    status: source.status,
    statusText: source.statusText,
    headers: noStoreHeaders(),
  });
}
