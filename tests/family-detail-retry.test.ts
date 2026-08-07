import { readFile } from "node:fs/promises";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { FamilyMemberPanel } from "@/components/overview/family-member-panel";
import { FamilyOverview as FamilyOverviewComponent } from "@/components/overview/family-overview";
import { getDashboardRows } from "@/lib/data";
import { buildFamilyOverviews } from "@/presentation/family-overview";
import { buildFormOverviews } from "@/presentation/form-overview";

const rows = await getDashboardRows();
const families = buildFamilyOverviews(buildFormOverviews(rows));

function findElement(
  node: ReactNode,
  predicate: (element: ReactElement) => boolean,
): ReactElement | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  if (predicate(node)) return node;
  const props = node.props as { children?: ReactNode };
  return findElement(props.children, predicate);
}

describe("家族詳細資料重試", () => {
  it("HomeDataLoader 會把同一個 loader 傳給重試按鈕，點擊後再次呼叫 detail API", async () => {
    const loaderSource = await readFile("src/components/home-data-loader.tsx", "utf8");
    expect(loaderSource).toContain("onRetryFamilyDetails={loadFamilyDetails}");
    expect(loaderSource).toContain(
      "fetch(`/api/home?scope=family&familyId=${encodeURIComponent(familyId)}`",
    );

    const family = { ...families[0]!, detailsLoaded: false };
    const onRetryFamilyDetails = vi.fn();
    const familyOverviewTree = FamilyOverviewComponent({
      families: [family],
      expandedFamilies: new Set([family.familyId]),
      expandedForms: new Set(),
      onToggleFamily: vi.fn(),
      onToggleForm: vi.fn(),
      familyDetailErrors: { [family.familyId]: true },
      onRetryFamilyDetails,
    });
    const familyPanel = findElement(
      familyOverviewTree,
      (element) => element.type === FamilyMemberPanel,
    );
    expect(familyPanel).toBeDefined();
    await Promise.resolve(
      (
        familyPanel!.props as {
          onRetryFamilyDetails?: () => void;
        }
      ).onRetryFamilyDetails?.(),
    );
    expect(onRetryFamilyDetails).toHaveBeenCalledWith(family.familyId);

    const detailApi = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce({ family });
    await detailApi(family.familyId).catch(() => undefined);

    const panelProps = {
      ...(familyPanel!.props as {
        family: typeof family;
        expandedForms: Set<string>;
        onToggleForm: (formId: string) => void;
        layoutPrefix: "mobile" | "desktop";
        familyDetailError: boolean;
      }),
      onRetryFamilyDetails: () => {
        onRetryFamilyDetails(family.familyId);
        void detailApi(family.familyId);
      },
    };

    const retryButton = findElement(
      FamilyMemberPanel(panelProps),
      (element) => element.type === "button",
    );
    expect(retryButton).toBeDefined();
    await Promise.resolve((retryButton!.props as { onClick: () => unknown }).onClick());

    expect(onRetryFamilyDetails).toHaveBeenCalledWith(family.familyId);
    expect(detailApi).toHaveBeenCalledTimes(2);
    expect(detailApi).toHaveBeenLastCalledWith(family.familyId);
  });
});
