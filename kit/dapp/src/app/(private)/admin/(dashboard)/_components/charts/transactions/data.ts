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

export function getTransactionsHistoryData() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return portalClient.request(ProcessedTransactionsHistory, {
    processedAfter: sevenDaysAgo.toISOString(),
  });
}
