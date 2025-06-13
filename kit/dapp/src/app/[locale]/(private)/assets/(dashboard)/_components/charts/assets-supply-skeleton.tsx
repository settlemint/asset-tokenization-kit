import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { getTranslations } from "@/i18n/translation";

export async function AssetsSupplySkeleton() {
  const t = await getTranslations("admin.dashboard.charts");
  return (
    <ChartSkeleton
      title={t("assets-supply.title")}
      description={t("assets-supply.description")}
      variant="loading"
    />
  );
}
