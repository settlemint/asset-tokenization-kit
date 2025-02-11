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
      owner {
        id
      }
      spender {
        id
      }
      value
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
      bondAmount
      holder {
        id
      }
      underlyingAmount
    }
    ... on BurnEvent {
      sender {
        id
      }
      from {
        id
      }
      value
    }
    ... on CollateralUpdatedEvent {
      sender {
        id
      }
      newAmount
      oldAmount
    }
    ... on ManagementFeeCollectedEvent {
      sender {
        id
      }
      amount
    }
    ... on MintEvent {
      sender {
        id
      }
      to {
        id
      }
      value
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
      amount
    }
    ... on RoleAdminChangedEvent {
      sender {
        id
      }
      newAdminRole
      previousAdminRole
      role
    }
    ... on RoleGrantedEvent {
      sender {
        id
      }
      role
      account {
        id
      }
    }
    ... on RoleRevokedEvent {
      sender {
        id
      }
      account {
        id
      }
      role
    }
    ... on TokenWithdrawnEvent {
      sender {
        id
      }
      amount
      to {
        id
      }
      token {
        id
        name
        symbol
      }
    }
    ... on TokensFrozenEvent {
      sender {
        id
      }
      amount
      user {
        id
      }
    }
    ... on TokensUnfrozenEvent {
      sender {
        id
      }
      amount
      user {
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
      from {
        id
      }
      value
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
      user {
        id
      }
    }
    ... on UserUnblockedEvent {
      sender {
        id
      }
      user {
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
  details: Record<string, string>;
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
      details: {},
    };

    // Collect all fields that aren't part of the base normalized structure
    for (const [key, value] of Object.entries(event)) {
      // Skip fields that are already in the normalized structure
      if (['eventName', 'timestamp', 'emitter', 'sender'].includes(key)) {
        continue;
      }

      // Handle nested objects with 'id' field
      if (value && typeof value === 'object' && 'id' in value) {
        normalized.details[key] = (value as { id: string }).id;
        continue;
      }

      // Handle nested objects with name/symbol (like token)
      if (value && typeof value === 'object') {
        const objValue = value as Record<string, unknown>;
        if ('name' in objValue || 'symbol' in objValue) {
          if ('name' in objValue && typeof objValue.name === 'string') {
            normalized.details[`${key}Name`] = objValue.name;
          }
          if ('symbol' in objValue && typeof objValue.symbol === 'string') {
            normalized.details[`${key}Symbol`] = objValue.symbol;
          }
          if ('id' in objValue && typeof objValue.id === 'string') {
            normalized.details[key] = objValue.id;
          }
          continue;
        }
      }

      // Add all other fields directly to details
      if (value !== null && value !== undefined) {
        normalized.details[key] = String(value);
      }
    }

    results.push(normalized);
  }

  return results;
}
