'use server';

import { TRANSACTIONS_QUERY_KEY } from '@/app/(private)/admin/(dashboard)/_components/dashboard-metrics/transactions/consts';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { unstable_cache } from 'next/cache';
const ProcessedTransactions = portalGraphql(`
  query ProcessedTransactions($processedAfter: String) {
    total: getProcessedTransactions {
      count
    }
    last24Hours: getProcessedTransactions(processedAfter: $processedAfter) {
      count
    }
  }
`);

export type ProcessedTransactionsData = {
  totalTransactions: number;
  transactionsInLast24Hours: number;
};

export async function getProcessedTransactions(): Promise<ProcessedTransactionsData> {
  const data = await unstable_cache(
    async () => {
      return await portalClient.request(ProcessedTransactions, {
        processedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });
    },
    [TRANSACTIONS_QUERY_KEY],
    {
      revalidate: 60,
      tags: [TRANSACTIONS_QUERY_KEY],
    }
  )();

  return {
    totalTransactions: data.total?.count ?? 0,
    transactionsInLast24Hours: data.last24Hours?.count ?? 0,
  };
}
