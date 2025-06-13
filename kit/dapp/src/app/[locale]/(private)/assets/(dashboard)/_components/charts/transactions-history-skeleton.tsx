import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { getTranslations } from "@/i18n/translation";

export async function TransactionsHistorySkeleton() {
  const t = await getTranslations("admin.dashboard.charts");
  return (
    <ChartSkeleton
      title={t("transaction-history.title")}
      description={t("transaction-history.description")}
      variant="loading"
    />
  );
}
