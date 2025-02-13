import { TransactionListFragment } from '@/components/blocks/events/fragments';
import { formatDate } from '@/lib/date';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const AssetEvents = theGraphGraphqlStarterkits(
  `
  query AssetEvents {
    assetEvents(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      timestamp
      ...TransactionListFragment
    }
  }
`,
  [TransactionListFragment]
);

const PendingAndRecentlyProcessedTransactionsFragment = portalGraphql(`
fragment PendingAndRecentlyProcessedTransactionsFields on TransactionOutput {
  from
  createdAt
  transactionHash
  receipt {
    status
  }
}
`);

const PendingAndRecentlyProcessedTransactions = portalGraphql(
  `
  query PendingAndRecentlyProcessedTransactions {
    getPendingAndRecentlyProcessedTransactions(
      processedAfter: "0",
      pageSize: 10
    ) {
      records {
        ...PendingAndRecentlyProcessedTransactionsFields
      }
    }
  }
`,
  [PendingAndRecentlyProcessedTransactionsFragment]
);

export async function getAssetEvents() {
  const [theGraphData, portalData] = await Promise.all([
    theGraphClientStarterkits.request(AssetEvents),
    portalClient.request(PendingAndRecentlyProcessedTransactions),
  ]);

  const pendingAndFailedTransactions =
    portalData.getPendingAndRecentlyProcessedTransactions?.records.filter(
      (tx) => !tx.receipt || tx.receipt.status === 'Reverted'
    ) ?? [];

  return [
    ...pendingAndFailedTransactions.map((tx) => ({
      timestamp: tx.createdAt as string,
      status: tx.receipt ? ('failed' as const) : ('pending' as const),
      description: 'Transaction',
      transactionHash: tx.transactionHash,
      sender: tx.from,
    })),

    ...theGraphData.assetEvents.map((event) => ({
      timestamp: new Date(Number.parseInt(event.timestamp) * 1000).toISOString(),
      status: 'success' as const,
      description: event.eventName,
      transactionHash: event.id,
      sender: event.sender.id,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((event) => ({
      ...event,
      timestamp: formatDate(event.timestamp, { type: 'relative' }),
    }))
    .slice(0, 10);
}
