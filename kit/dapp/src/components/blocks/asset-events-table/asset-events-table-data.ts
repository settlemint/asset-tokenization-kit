import type { NormalizedEventsListItem } from '@/components/blocks/asset-events-table/asset-events-fragments';
import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getTransactionHashFromEventId } from '@/lib/transaction-hash';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { VariablesOf } from '@settlemint/sdk-thegraph';
import type { Address } from 'viem';
import {
  ApprovalEventFragment,
  AssetCreatedEventFragment,
  type AssetEvent,
  BondMaturedEventFragment,
  BondRedeemedEventFragment,
  BurnEventFragment,
  CollateralUpdatedEventFragment,
  ManagementFeeCollectedEventFragment,
  MintEventFragment,
  PausedEventFragment,
  PerformanceFeeCollectedEventFragment,
  RoleAdminChangedEventFragment,
  RoleGrantedEventFragment,
  RoleRevokedEventFragment,
  TokenWithdrawnEventFragment,
  TokensFrozenEventFragment,
  TokensUnfrozenEventFragment,
  TransferEventFragment,
  UnderlyingAssetTopUpEventFragment,
  UnderlyingAssetWithdrawnEventFragment,
  UnpausedEventFragment,
  UserBlockedEventFragment,
  UserUnblockedEventFragment,
} from './asset-events-fragments';

const EventListFragment = theGraphGraphqlStarterkits(
  `
  fragment EventListFragment on AssetEvent {
    id
    emitter {
      id
    }
    eventName
    timestamp
    ...AssetCreatedEventFragment
    ...ApprovalEventFragment
    ...BondMaturedEventFragment
    ...BondRedeemedEventFragment
    ...BurnEventFragment
    ...CollateralUpdatedEventFragment
    ...ManagementFeeCollectedEventFragment
    ...MintEventFragment
    ...PausedEventFragment
    ...PerformanceFeeCollectedEventFragment
    ...RoleAdminChangedEventFragment
    ...RoleGrantedEventFragment
    ...RoleRevokedEventFragment
    ...TokenWithdrawnEventFragment
    ...TokensFrozenEventFragment
    ...TokensUnfrozenEventFragment
    ...TransferEventFragment
    ...UnpausedEventFragment
    ...UserBlockedEventFragment
    ...UserUnblockedEventFragment
    ...UnderlyingAssetTopUpEventFragment
    ...UnderlyingAssetWithdrawnEventFragment
  }
`,
  [
    AssetCreatedEventFragment,
    ApprovalEventFragment,
    BondMaturedEventFragment,
    BondRedeemedEventFragment,
    BurnEventFragment,
    CollateralUpdatedEventFragment,
    ManagementFeeCollectedEventFragment,
    MintEventFragment,
    PausedEventFragment,
    PerformanceFeeCollectedEventFragment,
    RoleAdminChangedEventFragment,
    RoleGrantedEventFragment,
    RoleRevokedEventFragment,
    TokenWithdrawnEventFragment,
    TokensFrozenEventFragment,
    TokensUnfrozenEventFragment,
    TransferEventFragment,
    UnpausedEventFragment,
    UserBlockedEventFragment,
    UserUnblockedEventFragment,
    UnderlyingAssetTopUpEventFragment,
    UnderlyingAssetWithdrawnEventFragment,
  ]
);

const TransactionsList = theGraphGraphqlStarterkits(
  `
query TransactionsList($first: Int, $skip: Int, $where: AssetEvent_filter) {
  assetEvents(
    orderBy: timestamp,
    orderDirection: desc,
    first: $first,
    skip: $skip,
    where: $where
  ) {
    ...EventListFragment
  }
}
`,
  [EventListFragment]
);

type TransactionsListVariables = VariablesOf<typeof TransactionsList>;

export type EventsListVariables = {
  first?: number;
  skip?: number;
  asset?: Address;
  sender?: Address;
};

export async function getEventsList(variables?: EventsListVariables): Promise<NormalizedEventsListItem[]> {
  const { first, skip, asset, sender } = variables ?? {};
  const where: TransactionsListVariables['where'] = {};
  if (asset) {
    where.emitter = asset;
  }
  if (sender) {
    where.sender = sender;
  }

  const assetEvents = await fetchData({ first, skip, where });

  return assetEvents.map((event) => {
    return {
      event: event.eventName,
      timestamp: formatDate(event.timestamp, { type: 'relative' }),
      asset: event.emitter.id,
      sender: event.sender.id,
      details: event as unknown as AssetEvent,
      transactionHash: getTransactionHashFromEventId(event.id),
    };
  });
}

async function fetchDirect(variables: TransactionsListVariables) {
  const result = await theGraphClientStarterkits.request(TransactionsList, variables);
  return result.assetEvents;
}

function fetchPaginated(variables: TransactionsListVariables) {
  return fetchAllTheGraphPages(async () => {
    const result = await theGraphClientStarterkits.request(TransactionsList, variables);
    return result.assetEvents;
  });
}

async function fetchData(variables: TransactionsListVariables) {
  return typeof variables.first === 'number' ? await fetchDirect(variables) : await fetchPaginated(variables);
}
