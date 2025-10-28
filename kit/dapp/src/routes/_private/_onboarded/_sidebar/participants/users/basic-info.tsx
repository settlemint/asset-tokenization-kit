import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TileDetailLayout } from "@/components/tile/tile-detail";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const parentRouteId =
  "/_private/_onboarded/_sidebar/participants/users/$userId" as const;

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/basic-info"
)({
  errorComponent: DefaultCatchBoundary,
  component: BasicInfoDetail,
});

function BasicInfoDetail() {
  const { t } = useTranslation(["user", "common"]);
  const { user } = useLoaderData({ from: parentRouteId });

  return (
    <TileDetailLayout
      title={t("user:tiles.basicInfo.title", { defaultValue: "Basic Info" })}
      subtitle={user.email ?? undefined}
      description={t("user:tiles.basicInfo.detailDescription", {
        defaultValue:
          "This detailed view is a placeholder. Populate it with user-specific information and actions.",
      })}
    >
      <div className="space-y-3">
        <p>
          {t("user:tiles.basicInfo.detailBody", {
            defaultValue:
              "Use this area to surface extended data for the selected tile. Highlight timelines, audit histories, or deeper metadata that does not fit within the overview tile.",
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("common:generic.example", {
            defaultValue:
              "Example: include components, forms, or data visualizations that support the tile's objective.",
          })}
        </p>
      </div>
    </TileDetailLayout>
  );
}
