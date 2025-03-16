import { theGraphGraphqlKit } from '@/lib/settlemint/the-graph';
import { type ZodInfer, z } from '@/lib/utils/zod';

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
 * Zod schema for validating base asset event data
 *
 */
export const AssetEventFragmentSchema = z.object({
  id: z.string(),
  emitter: z.object({
    id: z.address(),
  }),
  eventName: z.string(),
  timestamp: z.timestamp(),
  assetType: z.assetType(),
});

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
 * Zod schema for validating asset creation events
 *
 */
export const AssetCreatedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('AssetCreatedEvent'),
  sender: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating approval events
 *
 */
export const ApprovalEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('ApprovalEvent'),
  sender: z.object({
    id: z.address(),
  }),
  owner: z.object({
    id: z.address(),
  }),
  spender: z.object({
    id: z.address(),
  }),
  value: z.string(),
});

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
 * Zod schema for validating bond matured events
 *
 */
export const BondMaturedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('BondMaturedEvent'),
  sender: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating bond redemption events
 *
 */
export const BondRedeemedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('BondRedeemedEvent'),
  sender: z.object({
    id: z.address(),
  }),
  bondAmount: z.string(),
  holder: z.object({
    id: z.address(),
  }),
  underlyingAmount: z.string(),
});

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
 * Zod schema for validating burn events
 *
 */
export const BurnEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('BurnEvent'),
  sender: z.object({
    id: z.address(),
  }),
  from: z.object({
    id: z.address(),
  }),
  value: z.string(),
});

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
 * Zod schema for validating collateral update events
 *
 */
export const CollateralUpdatedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('CollateralUpdatedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    newAmount: z.string(),
    oldAmount: z.string(),
  });

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
 * Zod schema for validating management fee collection events
 *
 */
export const ManagementFeeCollectedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('ManagementFeeCollectedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    amount: z.string(),
  });

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
 * Zod schema for validating mint events
 *
 */
export const MintEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('MintEvent'),
  sender: z.object({
    id: z.address(),
  }),
  to: z.object({
    id: z.address(),
  }),
  value: z.string(),
});

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
 * Zod schema for validating paused events
 *
 */
export const PausedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('PausedEvent'),
  sender: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating performance fee collection events
 *
 */
export const PerformanceFeeCollectedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('PerformanceFeeCollectedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    amount: z.string(),
  });

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
 * Zod schema for validating role admin change events
 *
 */
export const RoleAdminChangedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('RoleAdminChangedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    newAdminRole: z.string(),
    previousAdminRole: z.string(),
    role: z.string(),
  });

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
 * Zod schema for validating role granted events
 *
 */
export const RoleGrantedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('RoleGrantedEvent'),
  sender: z.object({
    id: z.address(),
  }),
  role: z.string(),
  account: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating role revoked events
 *
 */
export const RoleRevokedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('RoleRevokedEvent'),
  sender: z.object({
    id: z.address(),
  }),
  account: z.object({
    id: z.address(),
  }),
  role: z.string(),
});

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
 * Zod schema for validating token withdrawal events
 *
 */
export const TokenWithdrawnEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('TokenWithdrawnEvent'),
    sender: z.object({
      id: z.address(),
    }),
    amount: z.string(),
    to: z.object({
      id: z.address(),
    }),
    token: z.object({
      id: z.address(),
      name: z.string(),
      symbol: z.symbol(),
    }),
  });

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
 * Zod schema for validating token freezing events
 *
 */
export const TokensFrozenEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('TokensFrozenEvent'),
  sender: z.object({
    id: z.address(),
  }),
  amount: z.string(),
  user: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating transfer events
 *
 */
export const TransferEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('TransferEvent'),
  to: z.object({
    id: z.address(),
  }),
  sender: z.object({
    id: z.address(),
  }),
  from: z.object({
    id: z.address(),
  }),
  value: z.string(),
});

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
 * Zod schema for validating unpaused events
 *
 */
export const UnpausedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('UnpausedEvent'),
  sender: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating user blocked events
 *
 */
export const UserBlockedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('UserBlockedEvent'),
  sender: z.object({
    id: z.address(),
  }),
  user: z.object({
    id: z.address(),
  }),
});

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
 * Zod schema for validating user unblocked events
 *
 */
export const UserUnblockedEventFragmentSchema = AssetEventFragmentSchema.extend(
  {
    __typename: z.literal('UserUnblockedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    user: z.object({
      id: z.address(),
    }),
  }
);

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
 * Zod schema for validating underlying asset top-up events
 *
 */
export const UnderlyingAssetTopUpEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('UnderlyingAssetTopUpEvent'),
    sender: z.object({
      id: z.address(),
    }),
  });

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

/**
 * Zod schema for validating underlying asset withdrawal events
 *
 */
export const UnderlyingAssetWithdrawnEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('UnderlyingAssetWithdrawnEvent'),
    sender: z.object({
      id: z.address(),
    }),
  });

/**
 * Type definitions for each specific event type
 */
// Types for each fragment
export type AssetCreatedEvent = ZodInfer<
  typeof AssetCreatedEventFragmentSchema
>;
export type ApprovalEvent = ZodInfer<typeof ApprovalEventFragmentSchema>;
export type BondMaturedEvent = ZodInfer<typeof BondMaturedEventFragmentSchema>;
export type BondRedeemedEvent = ZodInfer<
  typeof BondRedeemedEventFragmentSchema
>;
export type BurnEvent = ZodInfer<typeof BurnEventFragmentSchema>;
export type CollateralUpdatedEvent = ZodInfer<
  typeof CollateralUpdatedEventFragmentSchema
>;
export type ManagementFeeCollectedEvent = ZodInfer<
  typeof ManagementFeeCollectedEventFragmentSchema
>;
export type MintEvent = ZodInfer<typeof MintEventFragmentSchema>;
export type PausedEvent = ZodInfer<typeof PausedEventFragmentSchema>;
export type PerformanceFeeCollectedEvent = ZodInfer<
  typeof PerformanceFeeCollectedEventFragmentSchema
>;
export type RoleAdminChangedEvent = ZodInfer<
  typeof RoleAdminChangedEventFragmentSchema
>;
export type RoleGrantedEvent = ZodInfer<typeof RoleGrantedEventFragmentSchema>;
export type RoleRevokedEvent = ZodInfer<typeof RoleRevokedEventFragmentSchema>;
export type TokenWithdrawnEvent = ZodInfer<
  typeof TokenWithdrawnEventFragmentSchema
>;
export type TokensFrozenEvent = ZodInfer<
  typeof TokensFrozenEventFragmentSchema
>;
export type TransferEvent = ZodInfer<typeof TransferEventFragmentSchema>;
export type UnpausedEvent = ZodInfer<typeof UnpausedEventFragmentSchema>;
export type UserBlockedEvent = ZodInfer<typeof UserBlockedEventFragmentSchema>;
export type UserUnblockedEvent = ZodInfer<
  typeof UserUnblockedEventFragmentSchema
>;
export type UnderlyingAssetTopUpEvent = ZodInfer<
  typeof UnderlyingAssetTopUpEventFragmentSchema
>;
export type UnderlyingAssetWithdrawnEvent = ZodInfer<
  typeof UnderlyingAssetWithdrawnEventFragmentSchema
>;

/**
 * Union type representing all possible asset events
 *
 * @remarks
 * This type is used for discriminated union pattern with the __typename field
 */
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
  | TransferEvent
  | UnpausedEvent
  | UserBlockedEvent
  | UserUnblockedEvent
  | UnderlyingAssetTopUpEvent
  | UnderlyingAssetWithdrawnEvent;

/**
 * Interface for normalized asset event list items
 *
 */
export interface NormalizedEventsListItem {
  event: string;
  timestamp: string;
  asset: string;
  assetType:
    | 'bond'
    | 'cryptocurrency'
    | 'equity'
    | 'fund'
    | 'stablecoin'
    | 'tokenizeddeposit';
  sender: string;
  details: AssetEvent;
  transactionHash: string;
}

/**
 * Type definition for the base asset event fragment
 */
export type AssetEventFrag = ZodInfer<typeof AssetEventFragmentSchema>;
