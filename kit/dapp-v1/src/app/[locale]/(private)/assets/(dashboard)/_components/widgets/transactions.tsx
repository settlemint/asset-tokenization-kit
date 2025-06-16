import { getProcessedAndRecentTransactionsCount } from "@/lib/queries/transactions/transactions-processed";
import { startOfDay, subDays } from "date-fns";
import { getTranslations } from "next-intl/server";
import { Widget } from "./widget";

export async function TransactionsWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const { total, recentCount } = await getProcessedAndRecentTransactionsCount({
    processedAfter: sevenDaysAgo,
  });

  // Ensure we're using a string value
  const displayValue = total.toLocaleString();

  return (
    <Widget
      label={t("transactions.label")}
      value={displayValue}
      subtext={t("transactions.subtext", { count: recentCount, days: 7 })}
    />
  );
}
