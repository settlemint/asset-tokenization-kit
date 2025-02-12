import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const AssetEventsFragment = theGraphGraphqlStarterkits(`
  fragment AssetEventFields on AssetEvent {
    id
    timestamp
    eventName
    emitter {
      id
    }
  }
`);

const AssetEvents = theGraphGraphqlStarterkits(
  `
  query AssetEvents {
    assetEvents(first: 10) {
      ...AssetEventFields
    }
  }
`,
  [AssetEventsFragment]
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
      processedAfter: "0"
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
      date: new Date(tx.createdAt as string),
      status: tx.receipt ? ('failed' as const) : ('pending' as const),
      description: 'Transaction',
      transactionHash: tx.transactionHash,
      from: tx.from,
    })),

    ...theGraphData.assetEvents.map((event) => ({
      date: new Date(Number.parseInt(event.timestamp) * 1000), // Convert unix timestamp to Date
      status: 'success' as const,
      description: event.eventName,
      transactionHash: event.id,
      from: event.emitter.id,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
}
