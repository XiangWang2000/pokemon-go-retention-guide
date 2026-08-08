import type { DashboardRow } from "@/lib/data";
import type { FamilyOverview } from "./family-overview";
import { buildFamilyOverviews } from "./family-overview";
import { buildFormOverviews } from "./form-overview";

export interface HomeSnapshot {
  schemaVersion: 1;
  dataVersion: string;
  dataAsOf: string | null;
  families: FamilyOverview[];
}

export interface HomeRuntimeSnapshot {
  schemaVersion: 2;
  dataVersion: string;
  dataAsOf: string | null;
  families: FamilyOverview[];
}

export interface HomeFamilyDetailResponse {
  schemaVersion: 1;
  dataVersion: string;
  dataAsOf: string | null;
  family: FamilyOverview;
}

export function buildHomeSnapshot(
  rows: DashboardRow[],
  dataAsOf: string | null,
  dataVersion: string,
): HomeSnapshot {
  const families = buildFamilyOverviews(buildFormOverviews(rows)).map((family) => ({
    ...family,
    members: family.members.map((member) => ({
      ...member,
      form: {
        ...member.form,
        variants: member.form.variants.map((variant) => ({
          ...variant,
          row: {
            ...variant.row,
            // Resolved recommendations already live on the overview. Keeping every
            // global rule on every row duplicates about 1.6 MB in the initial payload.
            ivRecommendations: [],
            // These fields are not rendered on the overview. Detail routes retain them.
            moves: [],
            categoryStatuses: variant.row.categoryStatuses.map((status) => ({
              ...status,
              sources: [],
            })),
          },
        })),
      },
    })),
  }));

  return { schemaVersion: 1, dataVersion, dataAsOf, families };
}
