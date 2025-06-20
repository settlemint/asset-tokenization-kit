import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { getTranslations } from "next-intl/server";

export async function UsersHistorySkeleton() {
  const t = await getTranslations("admin.dashboard.charts");
  return (
    <ChartSkeleton
      title={t("users-history.title")}
      description={t("users-history.description")}
      variant="loading"
    />
  );
}
