import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { getTranslations } from "next-intl/server";

export async function AssetActivitySkeleton() {
  const t = await getTranslations("admin.dashboard.charts");
  return (
    <ChartSkeleton
      title={t("asset-activity.title")}
      description={t("asset-activity.description")}
      variant="loading"
    />
  );
}
