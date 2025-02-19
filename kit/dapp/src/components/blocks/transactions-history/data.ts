import { portalClient, portalGraphql } from '@/lib/settlemint/portal';

const ProcessedTransactionsHistory = portalGraphql(`
  query ProcessedTransactionsHistory($processedAfter: String, $from: String) {
    getProcessedTransactions(processedAfter: $processedAfter, from: $from) {
      records {
        createdAt
      }
    }
  }
`);

export async function getTransactionsHistoryData({ processedAfter, from }: { processedAfter: Date; from?: string }) {
  const data = await portalClient.request(ProcessedTransactionsHistory, {
    processedAfter: processedAfter.toISOString(),
    from: from,
  });

  return (
    data.getProcessedTransactions?.records
      .filter((record) => record.createdAt)
      .map((record) => ({
        timestamp: record.createdAt!,
        transaction: 1, // Each entry represents a single transaction
      })) ?? []
  );
}
