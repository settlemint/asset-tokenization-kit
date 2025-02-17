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

export async function getTransactionsHistoryData() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const data = await portalClient.request(ProcessedTransactionsHistory, {
    processedAfter: sevenDaysAgo.toISOString(),
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
