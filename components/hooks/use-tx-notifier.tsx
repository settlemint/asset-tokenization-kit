import { portalClient, portalGraphql } from "@/lib/settlemint/clientside/portal";
import { useQuery } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const GetProcessedTransactions = portalGraphql(`
  query GetProcessedTransactions($from: String, $processedAfter: String!) {
    getProcessedTransactions(from: $from, processedAfter: $processedAfter) {
      records {
        transactionHash
        receipt {
          status
        }
      }
    }
  }
  `);

export function useTxNotifier({ from, refetchInterval }: { from?: string; refetchInterval?: number }) {
  const [previousPollTime, setPreviousPollTime] = useState<Date>(new Date());

  const { data: processedTx } = useQuery({
    queryKey: ["updatetx", from],
    queryFn: async () => {
      const response = await portalClient.request(GetProcessedTransactions, {
        from: from,
        processedAfter: formatISO(previousPollTime),
      });
      setPreviousPollTime(new Date());
      return response.getProcessedTransactions;
    },
    refetchInterval: refetchInterval ?? 1000,
  });

  useEffect(() => {
    for (const tx of processedTx?.records ?? []) {
      if (tx.receipt?.status === "Success") {
        toast.success(`Transaction ${tx.transactionHash} has been confirmed`);
      } else {
        toast.error(`Transaction ${tx.transactionHash} has failed`);
      }
    }
  }, [processedTx]);
}
