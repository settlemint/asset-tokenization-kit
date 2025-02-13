import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
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
  UnpausedEventFragment,
  UserBlockedEventFragment,
  UserUnblockedEventFragment,
} from '../fragments';

const TransactionListFragment = theGraphGraphqlStarterkits(
  `
  fragment TransactionListFragment on AssetEvent {
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
