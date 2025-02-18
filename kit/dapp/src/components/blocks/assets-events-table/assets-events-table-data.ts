import type { NormalizedEventsListItem } from '@/components/blocks/assets-events-table/assets-events-fragments';
import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getTransactionHashFromEventId } from '@/lib/transaction-hash';
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
} from './assets-events-fragments';

const TransactionListFragment = theGraphGraphqlStarterkits(
  `
  fragment TransactionListFragment on AssetEvent {
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
query TransactionsList($first: Int) {
  assetEvents(orderBy: timestamp, orderDirection: desc, first: $first) {
    ...TransactionListFragment
  }
}
`,
  [TransactionListFragment]
);

const AssetTransactionsList = theGraphGraphqlStarterkits(
  `
query AssetTransactionsList($first: Int, $asset: String) {
  assetEvents(orderBy: timestamp, orderDirection: desc, first: $first, where: { emitter: $asset }) {
    ...TransactionListFragment
  }
}
`,
  [TransactionListFragment]
);

export async function getEventsList({
  first,
  asset,
}: { first?: number; asset?: string }): Promise<NormalizedEventsListItem[]> {
  const theGraphData = asset
    ? await theGraphClientStarterkits.request(AssetTransactionsList, {
        first,
        asset,
      })
    : await theGraphClientStarterkits.request(TransactionsList, {
        first,
      });

  return theGraphData.assetEvents.map((event) => {
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
