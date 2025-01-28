'use server';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
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
  const data = await portalClient.request(ProcessedTransactions, {
    processedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    totalTransactions: data.total?.count ?? 0,
    transactionsInLast24Hours: data.last24Hours?.count ?? 0,
  };
}
