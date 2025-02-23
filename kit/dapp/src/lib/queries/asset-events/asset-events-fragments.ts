import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * Base GraphQL fragment for asset events
 *
 * @remarks
 * Contains common fields shared by all asset events
 */
export const AssetEventFragment = theGraphGraphqlStarterkits(`
  fragment AssetEventFragment on AssetEvent {
    id
    emitter {
      id
    }
    eventName
    timestamp
  }
`);

/**
 * Zod schema for validating base asset event data
 *
 * @property {string} id - Unique identifier for the event
 * @property {Object} emitter - The contract that emitted the event
 * @property {string} eventName - The name of the event
 * @property {number} timestamp - When the event occurred
 */
export const AssetEventFragmentSchema = z.object({
  id: z.string(),
  emitter: z.object({
    id: z.address(),
  }),
  eventName: z.string(),
  timestamp: z.timestamp(),
});

/**
 * GraphQL fragment for asset creation events
 */
export const AssetCreatedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that created the asset
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
export const ApprovalEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that sent the transaction
 * @property {Object} owner - The account that owns the tokens
 * @property {Object} spender - The account approved to spend tokens
 * @property {bigint} value - The amount approved to spend
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
  value: z.bigDecimal(),
});

/**
 * GraphQL fragment for bond matured events
 */
export const BondMaturedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that triggered the maturity
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
export const BondRedeemedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that sent the transaction
 * @property {bigint} bondAmount - The amount of bonds redeemed
 * @property {Object} holder - The account that held the bonds
 * @property {bigint} underlyingAmount - The amount of underlying assets received
 */
export const BondRedeemedEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('BondRedeemedEvent'),
  sender: z.object({
    id: z.address(),
  }),
  bondAmount: z.bigDecimal(),
  holder: z.object({
    id: z.address(),
  }),
  underlyingAmount: z.bigDecimal(),
});

/**
 * GraphQL fragment for burn events
 */
export const BurnEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that sent the transaction
 * @property {Object} from - The account whose tokens were burned
 * @property {bigint} value - The amount of tokens burned
 */
export const BurnEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('BurnEvent'),
  sender: z.object({
    id: z.address(),
  }),
  from: z.object({
    id: z.address(),
  }),
  value: z.bigDecimal(),
});

/**
 * GraphQL fragment for collateral update events
 */
export const CollateralUpdatedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that updated the collateral
 * @property {bigint} newAmount - The new collateral amount
 * @property {bigint} oldAmount - The previous collateral amount
 */
export const CollateralUpdatedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('CollateralUpdatedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    newAmount: z.bigDecimal(),
    oldAmount: z.bigDecimal(),
  });

/**
 * GraphQL fragment for management fee collection events
 */
export const ManagementFeeCollectedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that collected the fee
 * @property {bigint} amount - The amount of fees collected
 */
export const ManagementFeeCollectedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('ManagementFeeCollectedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    amount: z.bigDecimal(),
  });

/**
 * GraphQL fragment for mint events
 */
export const MintEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that sent the transaction
 * @property {Object} to - The recipient of the minted tokens
 * @property {bigint} value - The amount of tokens minted
 */
export const MintEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('MintEvent'),
  sender: z.object({
    id: z.address(),
  }),
  to: z.object({
    id: z.address(),
  }),
  value: z.bigDecimal(),
});

/**
 * GraphQL fragment for paused events
 */
export const PausedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that paused the contract
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
export const PerformanceFeeCollectedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that collected the fee
 * @property {bigint} amount - The amount of fees collected
 */
export const PerformanceFeeCollectedEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('PerformanceFeeCollectedEvent'),
    sender: z.object({
      id: z.address(),
    }),
    amount: z.bigDecimal(),
  });

/**
 * GraphQL fragment for role admin change events
 */
export const RoleAdminChangedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that changed the role admin
 * @property {string} newAdminRole - The new admin role
 * @property {string} previousAdminRole - The previous admin role
 * @property {string} role - The role being modified
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
export const RoleGrantedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that granted the role
 * @property {string} role - The role that was granted
 * @property {Object} account - The account that received the role
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
export const RoleRevokedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that revoked the role
 * @property {Object} account - The account that lost the role
 * @property {string} role - The role that was revoked
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
export const TokenWithdrawnEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that initiated the withdrawal
 * @property {bigint} amount - The amount of tokens withdrawn
 * @property {Object} to - The recipient of the withdrawn tokens
 * @property {Object} token - Information about the token that was withdrawn
 */
export const TokenWithdrawnEventFragmentSchema =
  AssetEventFragmentSchema.extend({
    __typename: z.literal('TokenWithdrawnEvent'),
    sender: z.object({
      id: z.address(),
    }),
    amount: z.bigDecimal(),
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
export const TokensFrozenEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that froze the tokens
 * @property {bigint} amount - The amount of tokens frozen
 * @property {Object} user - The account whose tokens were frozen
 */
export const TokensFrozenEventFragmentSchema = AssetEventFragmentSchema.extend({
  __typename: z.literal('TokensFrozenEvent'),
  sender: z.object({
    id: z.address(),
  }),
  amount: z.bigDecimal(),
  user: z.object({
    id: z.address(),
  }),
});

/**
 * GraphQL fragment for transfer events
 */
export const TransferEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} to - The recipient of the tokens
 * @property {Object} sender - The account that sent the transaction
 * @property {Object} from - The sender of the tokens
 * @property {bigint} value - The amount of tokens transferred
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
  value: z.bigDecimal(),
});

/**
 * GraphQL fragment for unpaused events
 */
export const UnpausedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that unpaused the contract
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
export const UserBlockedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that blocked the user
 * @property {Object} user - The account that was blocked
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
export const UserUnblockedEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that unblocked the user
 * @property {Object} user - The account that was unblocked
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
export const UnderlyingAssetTopUpEventFragment = theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that topped up the underlying asset
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
export const UnderlyingAssetWithdrawnEventFragment =
  theGraphGraphqlStarterkits(`
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
 * @property {string} __typename - Type discriminator for the event
 * @property {Object} sender - The account that withdrew the underlying asset
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
 * @property {string} event - The name of the event
 * @property {string} timestamp - When the event occurred
 * @property {string} asset - The address of the asset contract
 * @property {string} sender - The address of the transaction sender
 * @property {AssetEvent} details - The detailed event data
 * @property {string} transactionHash - The hash of the transaction
 */
export interface NormalizedEventsListItem {
  event: string;
  timestamp: string;
  asset: string;
  sender: string;
  details: AssetEvent;
  transactionHash: string;
}

/**
 * Type definition for the base asset event fragment
 */
export type AssetEventFrag = ZodInfer<typeof AssetEventFragmentSchema>;
