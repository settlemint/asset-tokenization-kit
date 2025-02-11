import { formatDate } from '@/lib/date';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { unstable_cache } from 'next/cache';
import { getAddress } from 'viem';

const TransactionListFragment = theGraphGraphqlStarterkits(`
  fragment TransactionListFragment on AssetEvent {
    emitter {
      id
      name
      symbol
    }
    eventName
    timestamp
    ... on AssetCreatedEvent {
      sender {
        id
      }
    }
    ... on ApprovalEvent {
      sender {
        id
      }
    }
    ... on BondMaturedEvent {
      sender {
        id
      }
    }
    ... on BondRedeemedEvent {
      sender {
        id
      }
    }
    ... on BurnEvent {
      sender {
        id
      }
    }
    ... on CollateralUpdatedEvent {
      sender {
        id
      }
    }
    ... on ManagementFeeCollectedEvent {
      sender {
        id
      }
    }
    ... on MintEvent {
      sender {
        id
      }
    }
    ... on PausedEvent {
      sender {
        id
      }
    }
    ... on PerformanceFeeCollectedEvent {
      sender {
        id
      }
    }
    ... on RoleAdminChangedEvent {
      sender {
        id
      }
    }
    ... on RoleGrantedEvent {
      sender {
        id
      }
    }
    ... on RoleRevokedEvent {
      sender {
        id
      }
    }
    ... on TokenWithdrawnEvent {
      sender {
        id
      }
    }
    ... on TokensFrozenEvent {
      sender {
        id
      }
    }
    ... on TokensUnfrozenEvent {
      sender {
        id
      }
    }
    ... on TransferEvent {
      to {
        id
      }
      sender {
        id
      }
    }
    ... on UnpausedEvent {
      sender {
        id
      }
    }
    ... on UserBlockedEvent {
      sender {
        id
      }
    }
    ... on UserUnblockedEvent {
      sender {
        id
      }
    }
  }
`);

const TransactionsList = theGraphGraphqlStarterkits(
  `
query TransactionsList {
  assetEvents(orderBy: timestamp, orderDirection: desc) {
    ...TransactionListFragment
  }
}
`,
  [TransactionListFragment]
);

const TransactionUser = hasuraGraphql(`
  query TransactionUser($id: String!) {
    user(where: { wallet: { _eq: $id } }) {
      name
    }
  }
`);

const getUserName = unstable_cache(
  async (walletAddress: string) => {
    const user = await hasuraClient.request(TransactionUser, {
      id: walletAddress,
    });
    return user.user[0]?.name;
  },
  ['user-name'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['user-name'],
  }
);

export interface NormalizedTransactionListItem {
  event: string;
  timestamp: string;
  asset: string;
  emitterName: string;
  emitterSymbol: string;
  sender: string;
  senderName?: string;
}

export async function getTransactionsList(): Promise<NormalizedTransactionListItem[]> {
  const theGraphData = await theGraphClientStarterkits.request(TransactionsList);
  const results: NormalizedTransactionListItem[] = [];

  for (const event of theGraphData.assetEvents) {
    const walletAddress = getAddress(event.sender.id);
    const userName = await getUserName(walletAddress);

    const normalized: NormalizedTransactionListItem = {
      event: event.eventName,
      timestamp: formatDate(event.timestamp),
      asset: event.emitter.id,
      emitterName: event.emitter.name,
      emitterSymbol: event.emitter.symbol,
      sender: event.sender.id,
      senderName: userName,
    };
    results.push(normalized);
  }

  return results;
}
