import type { NormalizedEventsListItem } from '@/components/blocks/asset-events-table/asset-events-fragments';
import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getTransactionHashFromEventId } from '@/lib/transaction-hash';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
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
query TransactionsList($first: Int, $skip: Int) {
  assetEvents(orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
    ...EventListFragment
  }
}
`,
  [EventListFragment]
);

const AssetTransactionsList = theGraphGraphqlStarterkits(
  `
query AssetTransactionsList($asset: String, $first: Int, $skip: Int) {
  assetEvents(orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip, where: { emitter: $asset }) {
    ...EventListFragment
  }
}
`,
  [EventListFragment]
);

export async function getEventsList({
  first,
  asset,
}: { first?: number; asset?: string }): Promise<NormalizedEventsListItem[]> {
  const assetEvents = await fetchData({ first, asset });

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

async function fetchDirect({ first, asset }: { first: number; asset?: string }) {
  if (asset) {
    const result = await theGraphClientStarterkits.request(AssetTransactionsList, {
      first,
      asset,
    });
    return result.assetEvents;
  }
  const result = await theGraphClientStarterkits.request(TransactionsList, {
    first,
  });
  return result.assetEvents;
}

function fetchPaginated({ asset }: { asset?: string }) {
  if (asset) {
    return fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(AssetTransactionsList, {
        first,
        skip,
        asset,
      });
      return result.assetEvents;
    });
  }
  return fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(TransactionsList, {
      first,
      skip,
    });
    return result.assetEvents;
  });
}

async function fetchData({ first, asset }: { first?: number; asset?: string }) {
  return typeof first === 'number' ? await fetchDirect({ first, asset }) : await fetchPaginated({ asset });
}
