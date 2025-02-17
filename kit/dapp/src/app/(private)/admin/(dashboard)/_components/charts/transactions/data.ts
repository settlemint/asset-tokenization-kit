import { portalClient, portalGraphql } from '@/lib/settlemint/portal';

const ProcessedTransactionsHistory = portalGraphql(`
  query ProcessedTransactionsHistory($processedAfter: String) {
    getProcessedTransactions(processedAfter: $processedAfter) {
      records {
        createdAt
      }
    }
  }
`);

export async function getTransactionsHistoryData({ processedAfter }: { processedAfter: Date }) {
  const data = await portalClient.request(ProcessedTransactionsHistory, {
    processedAfter: processedAfter.toISOString(),
  });

  return (
    data.getProcessedTransactions?.records
      .filter((record) => record.createdAt)
      .map((record) => ({
        timestamp: record.createdAt!,
        transactions: 1, // Each entry represents a single transaction
      })) ?? []
  );
}
