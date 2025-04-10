import { TransactionsHistory } from "@/components/blocks/transactions-table/transactions-history";
import { getTransactionsTimeline } from "@/lib/queries/transactions/transactions-timeline";
import { startOfDay, subMonths } from "date-fns";
import type { Address } from "viem";

interface TransactionsChartProps {
  walletAddress: Address;
}

export async function TransactionsChart({
  walletAddress,
}: TransactionsChartProps) {
  const oneMonthAgo = startOfDay(subMonths(new Date(), 1));
  const transactionsData = await getTransactionsTimeline({
    timelineStartDate: oneMonthAgo,
    granularity: "DAY",
    from: walletAddress,
  });

  return (
    <TransactionsHistory
      data={transactionsData}
      chartOptions={{
        intervalType: "month",
        intervalLength: 1,
        granularity: "day",
      }}
    />
  );
}
