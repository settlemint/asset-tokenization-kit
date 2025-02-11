import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const TransactionListFragment = theGraphGraphqlStarterkits(`
  fragment TransactionListFragment on AssetEvent {
   emitter {
      id
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

export interface NormalizedTransactionListItem {
  event: string;
  timestamp: string;
  asset: string;
  sender: string;
  details: Record<string, string>;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
function normalizeField(key: string, value: unknown): [string, string] | null {
  // Skip base fields
  if (['eventName', 'timestamp', 'emitter', 'sender'].includes(key)) {
    return null;
  }

  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Handle objects with ID
  if (typeof value === 'object' && value && 'id' in value) {
    return [key, (value as { id: string }).id];
  }

  // Handle token objects
  if (typeof value === 'object' && value) {
    const obj = value as Record<string, unknown>;
    if ('name' in obj || 'symbol' in obj) {
      const details: [string, string][] = [];
      if (typeof obj.name === 'string') {
        details.push([`${key}Name`, obj.name]);
      }
      if (typeof obj.symbol === 'string') {
        details.push([`${key}Symbol`, obj.symbol]);
      }
      if (typeof obj.id === 'string') {
        details.push([key, obj.id]);
      }
      return details[0] ?? null;
    }
  }

  // Handle primitive values
  return [key, String(value)];
}

export async function getTransactionsList(): Promise<NormalizedTransactionListItem[]> {
  const theGraphData = await theGraphClientStarterkits.request(TransactionsList);

  return theGraphData.assetEvents.map((event) => {
    const details: Record<string, string> = {};

    for (const [key, value] of Object.entries(event)) {
      const normalized = normalizeField(key, value);
      if (normalized) {
        const [normalizedKey, normalizedValue] = normalized;
        details[normalizedKey] = normalizedValue;
      }
    }

    return {
      event: event.eventName,
      timestamp: formatDate(event.timestamp, { relative: true }),
      asset: event.emitter.id,
      sender: event.sender.id,
      details,
    };
  });
}
