import { formatDate } from '@/lib/date';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const AssetCreatedEventFragment = theGraphGraphqlStarterkits(`
  fragment AssetCreatedEventFragment on AssetCreatedEvent {
    __typename
    sender {
      id
    }
  }
`);

const ApprovalEventFragment = theGraphGraphqlStarterkits(`
  fragment ApprovalEventFragment on ApprovalEvent {
    __typename
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
`);

const BondMaturedEventFragment = theGraphGraphqlStarterkits(`
  fragment BondMaturedEventFragment on BondMaturedEvent {
    __typename
    sender {
      id
    }
  }
`);

const BondRedeemedEventFragment = theGraphGraphqlStarterkits(`
  fragment BondRedeemedEventFragment on BondRedeemedEvent {
    __typename
    sender {
      id
    }
    bondAmount
    holder {
      id
    }
    underlyingAmount
  }
`);

const BurnEventFragment = theGraphGraphqlStarterkits(`
  fragment BurnEventFragment on BurnEvent {
    __typename
    sender {
      id
    }
    from {
      id
    }
    value
  }
`);

const CollateralUpdatedEventFragment = theGraphGraphqlStarterkits(`
  fragment CollateralUpdatedEventFragment on CollateralUpdatedEvent {
    __typename
    sender {
      id
    }
    newAmount
    oldAmount
  }
`);

const ManagementFeeCollectedEventFragment = theGraphGraphqlStarterkits(`
  fragment ManagementFeeCollectedEventFragment on ManagementFeeCollectedEvent {
    __typename
    sender {
      id
    }
    amount
  }
`);

const MintEventFragment = theGraphGraphqlStarterkits(`
  fragment MintEventFragment on MintEvent {
    __typename
    sender {
      id
    }
    to {
      id
    }
    value
  }
`);

const PausedEventFragment = theGraphGraphqlStarterkits(`
  fragment PausedEventFragment on PausedEvent {
    __typename
    sender {
      id
    }
  }
`);

const PerformanceFeeCollectedEventFragment = theGraphGraphqlStarterkits(`
  fragment PerformanceFeeCollectedEventFragment on PerformanceFeeCollectedEvent {
    __typename
    sender {
      id
    }
    amount
  }
`);

const RoleAdminChangedEventFragment = theGraphGraphqlStarterkits(`
  fragment RoleAdminChangedEventFragment on RoleAdminChangedEvent {
    __typename
    sender {
      id
    }
    newAdminRole
    previousAdminRole
    role
  }
`);

const RoleGrantedEventFragment = theGraphGraphqlStarterkits(`
  fragment RoleGrantedEventFragment on RoleGrantedEvent {
    __typename
    sender {
      id
    }
    role
    account {
      id
    }
  }
`);

const RoleRevokedEventFragment = theGraphGraphqlStarterkits(`
  fragment RoleRevokedEventFragment on RoleRevokedEvent {
    __typename
    sender {
      id
    }
    account {
      id
    }
    role
  }
`);

const TokenWithdrawnEventFragment = theGraphGraphqlStarterkits(`
  fragment TokenWithdrawnEventFragment on TokenWithdrawnEvent {
    __typename
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
`);

const TokensFrozenEventFragment = theGraphGraphqlStarterkits(`
  fragment TokensFrozenEventFragment on TokensFrozenEvent {
    __typename
    sender {
      id
    }
    amount
    user {
      id
    }
  }
`);

const TokensUnfrozenEventFragment = theGraphGraphqlStarterkits(`
  fragment TokensUnfrozenEventFragment on TokensUnfrozenEvent {
    __typename
    sender {
      id
    }
    amount
    user {
      id
    }
  }
`);

const TransferEventFragment = theGraphGraphqlStarterkits(`
  fragment TransferEventFragment on TransferEvent {
    __typename
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
`);

const UnpausedEventFragment = theGraphGraphqlStarterkits(`
  fragment UnpausedEventFragment on UnpausedEvent {
    __typename
    sender {
      id
    }
  }
`);

const UserBlockedEventFragment = theGraphGraphqlStarterkits(`
  fragment UserBlockedEventFragment on UserBlockedEvent {
    __typename
    sender {
      id
    }
    user {
      id
    }
  }
`);

const UserUnblockedEventFragment = theGraphGraphqlStarterkits(`
  fragment UserUnblockedEventFragment on UserUnblockedEvent {
    __typename
    sender {
      id
    }
    user {
      id
    }
  }
`);

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
query TransactionsList {
  assetEvents(orderBy: timestamp, orderDirection: desc) {
    ...TransactionListFragment
  }
}
`,
  [TransactionListFragment]
);

// Types for each fragment
export type AssetCreatedEvent = FragmentOf<typeof AssetCreatedEventFragment>;
export type ApprovalEvent = FragmentOf<typeof ApprovalEventFragment>;
export type BondMaturedEvent = FragmentOf<typeof BondMaturedEventFragment>;
export type BondRedeemedEvent = FragmentOf<typeof BondRedeemedEventFragment>;
export type BurnEvent = FragmentOf<typeof BurnEventFragment>;
export type CollateralUpdatedEvent = FragmentOf<typeof CollateralUpdatedEventFragment>;
export type ManagementFeeCollectedEvent = FragmentOf<typeof ManagementFeeCollectedEventFragment>;
export type MintEvent = FragmentOf<typeof MintEventFragment>;
export type PausedEvent = FragmentOf<typeof PausedEventFragment>;
export type PerformanceFeeCollectedEvent = FragmentOf<typeof PerformanceFeeCollectedEventFragment>;
export type RoleAdminChangedEvent = FragmentOf<typeof RoleAdminChangedEventFragment>;
export type RoleGrantedEvent = FragmentOf<typeof RoleGrantedEventFragment>;
export type RoleRevokedEvent = FragmentOf<typeof RoleRevokedEventFragment>;
export type TokenWithdrawnEvent = FragmentOf<typeof TokenWithdrawnEventFragment>;
export type TokensFrozenEvent = FragmentOf<typeof TokensFrozenEventFragment>;
export type TokensUnfrozenEvent = FragmentOf<typeof TokensUnfrozenEventFragment>;
export type TransferEvent = FragmentOf<typeof TransferEventFragment>;
export type UnpausedEvent = FragmentOf<typeof UnpausedEventFragment>;
export type UserBlockedEvent = FragmentOf<typeof UserBlockedEventFragment>;
export type UserUnblockedEvent = FragmentOf<typeof UserUnblockedEventFragment>;

// Union type of all events
export type AssetEvent =
  | AssetCreatedEvent
  | ApprovalEvent
  | BondMaturedEvent
  | BondRedeemedEvent
  | BurnEvent
  | CollateralUpdatedEvent
  | ManagementFeeCollectedEvent
  | MintEvent
  | PausedEvent
  | PerformanceFeeCollectedEvent
  | RoleAdminChangedEvent
  | RoleGrantedEvent
  | RoleRevokedEvent
  | TokenWithdrawnEvent
  | TokensFrozenEvent
  | TokensUnfrozenEvent
  | TransferEvent
  | UnpausedEvent
  | UserBlockedEvent
  | UserUnblockedEvent;

export interface NormalizedTransactionListItem {
  event: string;
  timestamp: string;
  asset: string;
  sender: string;
  details: AssetEvent;
}

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
