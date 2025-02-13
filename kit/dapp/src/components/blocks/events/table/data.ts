import {
  type AssetEvent,
  type NormalizedTransactionListItem,
  TransactionListFragment,
} from '@/components/blocks/events/fragments';
import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const TransactionsList = theGraphGraphqlStarterkits(
  `
query TransactionsList($first: Int) {
  assetEvents(orderBy: timestamp, orderDirection: desc, first: $first) {
    ...TransactionListFragment
  }
}
`,
  [TransactionListFragment]
);

export async function getTransactionsList(first?: number): Promise<NormalizedTransactionListItem[]> {
  const theGraphData = await theGraphClientStarterkits.request(TransactionsList, {
    first,
  });

  return theGraphData.assetEvents.map((event) => {
    return {
      event: event.eventName,
      timestamp: formatDate(event.timestamp, { type: 'relative' }),
      asset: event.emitter.id,
      sender: event.sender.id,
      details: event as unknown as AssetEvent,
    };
  });
}
