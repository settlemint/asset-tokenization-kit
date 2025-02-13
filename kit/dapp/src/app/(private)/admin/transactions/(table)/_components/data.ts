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
  type NormalizedTransactionListItem,
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
} from '@/components/blocks/events/fragments';
import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const TransactionListFragment = theGraphGraphqlStarterkits(
  `
  fragment TransactionListFragment on AssetEvent {
    emitter {
      id
    }
    eventName
    timestamp
    ...ApprovalEventFragment
    ...AssetCreatedEventFragment
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
query TransactionsList {
  assetEvents(orderBy: timestamp, orderDirection: desc) {
    ...TransactionListFragment
  }
}
`,
  [TransactionListFragment]
);

export async function getTransactionsList(): Promise<NormalizedTransactionListItem[]> {
  const theGraphData = await theGraphClientStarterkits.request(TransactionsList);

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
