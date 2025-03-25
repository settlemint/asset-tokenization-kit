import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import type {
  ApprovalEvent,
  AssetCreatedEvent,
  AssetEvent,
  BondMaturedEvent,
  BondRedeemedEvent,
  BurnEvent,
  CollateralUpdatedEvent,
  ManagementFeeCollectedEvent,
  MintEvent,
  NormalizedEventsListItem,
  PausedEvent,
  PerformanceFeeCollectedEvent,
  RoleAdminChangedEvent,
  RoleGrantedEvent,
  RoleRevokedEvent,
  TokenWithdrawnEvent,
  TokensFrozenEvent,
  TransferEvent,
  UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawnEvent,
  UnpausedEvent,
  UserAllowedEvent,
  UserBlockedEvent,
  UserDisallowedEvent,
  UserUnblockedEvent,
} from "./asset-events-schema";

/**
 * Base GraphQL fragment for asset events
 *
 * @remarks
 * Contains common fields shared by all asset events
 */
export const AssetEventFragment = theGraphGraphqlKit(`
  fragment AssetEventFragment on AssetEvent {
    id
    emitter {
      id
    }
    eventName
    timestamp
    assetType
  }
`);

/**
 * GraphQL fragment for asset creation events
 */
export const AssetCreatedEventFragment = theGraphGraphqlKit(`
  fragment AssetCreatedEventFragment on AssetCreatedEvent {
    __typename
    sender {
      id
    }
  }
`);

/**
 * GraphQL fragment for approval events
 */
export const ApprovalEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for bond matured events
 */
export const BondMaturedEventFragment = theGraphGraphqlKit(`
  fragment BondMaturedEventFragment on BondMaturedEvent {
    __typename
    sender {
      id
    }
  }
`);

/**
 * GraphQL fragment for bond redemption events
 */
export const BondRedeemedEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for burn events
 */
export const BurnEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for collateral update events
 */
export const CollateralUpdatedEventFragment = theGraphGraphqlKit(`
  fragment CollateralUpdatedEventFragment on CollateralUpdatedEvent {
    __typename
    sender {
      id
    }
    newAmount
    oldAmount
  }
`);

/**
 * GraphQL fragment for management fee collection events
 */
export const ManagementFeeCollectedEventFragment = theGraphGraphqlKit(`
  fragment ManagementFeeCollectedEventFragment on ManagementFeeCollectedEvent {
    __typename
    sender {
      id
    }
    amount
  }
`);

/**
 * GraphQL fragment for mint events
 */
export const MintEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for paused events
 */
export const PausedEventFragment = theGraphGraphqlKit(`
  fragment PausedEventFragment on PausedEvent {
    __typename
    sender {
      id
    }
  }
`);

/**
 * GraphQL fragment for performance fee collection events
 */
export const PerformanceFeeCollectedEventFragment = theGraphGraphqlKit(`
  fragment PerformanceFeeCollectedEventFragment on PerformanceFeeCollectedEvent {
    __typename
    sender {
      id
    }
    amount
  }
`);

/**
 * GraphQL fragment for role admin change events
 */
export const RoleAdminChangedEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for role granted events
 */
export const RoleGrantedEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for role revoked events
 */
export const RoleRevokedEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for token withdrawal events
 */
export const TokenWithdrawnEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for token freezing events
 */
export const TokensFrozenEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for transfer events
 */
export const TransferEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for unpaused events
 */
export const UnpausedEventFragment = theGraphGraphqlKit(`
  fragment UnpausedEventFragment on UnpausedEvent {
    __typename
    sender {
      id
    }
  }
`);

/**
 * GraphQL fragment for user blocked events
 */
export const UserBlockedEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for user unblocked events
 */
export const UserUnblockedEventFragment = theGraphGraphqlKit(`
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

/**
 * GraphQL fragment for user allowed events
 */
export const UserAllowedEventFragment = theGraphGraphqlKit(`
  fragment UserAllowedEventFragment on UserAllowedEvent {
    __typename
    sender {
      id
    }
    user {
      id
    }
  }
`);

/**
 * GraphQL fragment for user disallowed events
 */
export const UserDisallowedEventFragment = theGraphGraphqlKit(`
  fragment UserDisallowedEventFragment on UserDisallowedEvent {
    __typename
    sender {
      id
    }
    user {
      id
    }
  }
`);

/**
 * GraphQL fragment for underlying asset top-up events
 */
export const UnderlyingAssetTopUpEventFragment = theGraphGraphqlKit(`
  fragment UnderlyingAssetTopUpEventFragment on UnderlyingAssetTopUpEvent {
    __typename
    sender {
      id
    }
  }
`);

/**
 * GraphQL fragment for underlying asset withdrawal events
 */
export const UnderlyingAssetWithdrawnEventFragment = theGraphGraphqlKit(`
  fragment UnderlyingAssetWithdrawnEventFragment on UnderlyingAssetWithdrawnEvent {
    __typename
    sender {
      id
    }
  }
`);

// Re-export all types
export type {
  ApprovalEvent,
  AssetCreatedEvent,
  AssetEvent,
  BondMaturedEvent,
  BondRedeemedEvent,
  BurnEvent,
  CollateralUpdatedEvent,
  ManagementFeeCollectedEvent,
  MintEvent,
  NormalizedEventsListItem,
  PausedEvent,
  PerformanceFeeCollectedEvent,
  RoleAdminChangedEvent,
  RoleGrantedEvent,
  RoleRevokedEvent,
  TokenWithdrawnEvent,
  TokensFrozenEvent,
  TransferEvent,
  UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawnEvent,
  UnpausedEvent,
  UserAllowedEvent,
  UserBlockedEvent,
  UserDisallowedEvent,
  UserUnblockedEvent,
};
