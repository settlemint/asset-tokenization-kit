import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Base TypeBox schema for asset events
 */
export const AssetEventSchema = t.Object(
  {
    id: t.String({
      description: "Unique identifier for the event",
    }),
    emitter: t.Object(
      {
        id: t.EthereumAddress({
          description: "Address of the contract that emitted the event",
        }),
      },
      {
        description: "Information about the event emitter",
      }
    ),
    eventName: t.String({
      description: "Name of the event",
    }),
    timestamp: t.Timestamp({
      description: "When the event occurred",
    }),
    assetType: t.AssetType({
      description: "Type of asset involved in the event",
    }),
  },
  {
    description: "Base asset event data common to all event types",
  }
);

/**
 * Schema for AssetCreatedEvent
 */
export const AssetCreatedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("AssetCreatedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who created the asset",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
      },
      {
        description: "Event emitted when a new asset is created",
      }
    ),
  ],
  {
    description: "Asset creation event details",
  }
);

/**
 * Schema for ApprovalEvent
 */
export const ApprovalEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("ApprovalEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who initiated the approval",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        owner: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the token owner",
            }),
          },
          {
            description: "Information about the token owner",
          }
        ),
        spender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the approved spender",
            }),
          },
          {
            description: "Information about the spender",
          }
        ),
        value: t.String({
          description: "Amount of tokens approved",
        }),
      },
      {
        description: "Event emitted when a spending approval is granted",
      }
    ),
  ],
  {
    description: "Token approval event details",
  }
);

/**
 * Schema for BondMaturedEvent
 */
export const BondMaturedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("BondMaturedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description:
                "Address of the sender who initiated the maturity process",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
      },
      {
        description: "Event emitted when a bond reaches maturity",
      }
    ),
  ],
  {
    description: "Bond maturity event details",
  }
);

/**
 * Schema for BondRedeemedEvent
 */
export const BondRedeemedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("BondRedeemedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who initiated the redemption",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        bondAmount: t.String({
          description: "Amount of bond tokens redeemed",
        }),
        holder: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the bond holder",
            }),
          },
          {
            description: "Information about the bond holder",
          }
        ),
        underlyingAmount: t.String({
          description: "Amount of underlying assets received",
        }),
      },
      {
        description: "Event emitted when a bond is redeemed",
      }
    ),
  ],
  {
    description: "Bond redemption event details",
  }
);

/**
 * Schema for BurnEvent
 */
export const BurnEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("BurnEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who initiated the burn",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        from: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address from which tokens were burned",
            }),
          },
          {
            description: "Information about the token holder",
          }
        ),
        value: t.String({
          description: "Amount of tokens burned",
        }),
      },
      {
        description: "Event emitted when tokens are burned",
      }
    ),
  ],
  {
    description: "Token burn event details",
  }
);

/**
 * Schema for CollateralUpdatedEvent
 */
export const CollateralUpdatedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("CollateralUpdatedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who updated the collateral",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        newAmount: t.String({
          description: "New collateral amount",
        }),
        oldAmount: t.String({
          description: "Previous collateral amount",
        }),
      },
      {
        description: "Event emitted when collateral amount is updated",
      }
    ),
  ],
  {
    description: "Collateral update event details",
  }
);

/**
 * Schema for ManagementFeeCollectedEvent
 */
export const ManagementFeeCollectedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("ManagementFeeCollectedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who collected the fee",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        amount: t.String({
          description: "Amount of management fee collected",
        }),
      },
      {
        description: "Event emitted when management fees are collected",
      }
    ),
  ],
  {
    description: "Management fee collection event details",
  }
);

/**
 * Schema for MintEvent
 */
export const MintEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("MintEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who initiated the mint",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        to: t.Object(
          {
            id: t.EthereumAddress({
              description: "Recipient address of the minted tokens",
            }),
          },
          {
            description: "Information about the recipient",
          }
        ),
        value: t.String({
          description: "Amount of tokens minted",
        }),
      },
      {
        description: "Event emitted when new tokens are minted",
      }
    ),
  ],
  {
    description: "Token mint event details",
  }
);

/**
 * Schema for PausedEvent
 */
export const PausedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("PausedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who paused the contract",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
      },
      {
        description: "Event emitted when a contract is paused",
      }
    ),
  ],
  {
    description: "Contract pause event details",
  }
);

/**
 * Schema for PerformanceFeeCollectedEvent
 */
export const PerformanceFeeCollectedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("PerformanceFeeCollectedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who collected the fee",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        amount: t.String({
          description: "Amount of performance fee collected",
        }),
      },
      {
        description: "Event emitted when performance fees are collected",
      }
    ),
  ],
  {
    description: "Performance fee collection event details",
  }
);

/**
 * Schema for RoleAdminChangedEvent
 */
export const RoleAdminChangedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("RoleAdminChangedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who changed the role admin",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        newAdminRole: t.String({
          description: "New admin role",
        }),
        previousAdminRole: t.String({
          description: "Previous admin role",
        }),
        role: t.String({
          description: "The role being modified",
        }),
      },
      {
        description: "Event emitted when a role's admin is changed",
      }
    ),
  ],
  {
    description: "Role admin change event details",
  }
);

/**
 * Schema for RoleGrantedEvent
 */
export const RoleGrantedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("RoleGrantedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who granted the role",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        role: t.String({
          description: "The role being granted",
        }),
        account: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the account receiving the role",
            }),
          },
          {
            description: "Information about the account",
          }
        ),
      },
      {
        description: "Event emitted when a role is granted",
      }
    ),
  ],
  {
    description: "Role grant event details",
  }
);

/**
 * Schema for RoleRevokedEvent
 */
export const RoleRevokedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("RoleRevokedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who revoked the role",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        account: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the account losing the role",
            }),
          },
          {
            description: "Information about the account",
          }
        ),
        role: t.String({
          description: "The role being revoked",
        }),
      },
      {
        description: "Event emitted when a role is revoked",
      }
    ),
  ],
  {
    description: "Role revocation event details",
  }
);

/**
 * Schema for TokenWithdrawnEvent
 */
export const TokenWithdrawnEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("TokenWithdrawnEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who initiated the withdrawal",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        amount: t.String({
          description: "Amount of tokens withdrawn",
        }),
        to: t.Object(
          {
            id: t.EthereumAddress({
              description: "Recipient address of the withdrawn tokens",
            }),
          },
          {
            description: "Information about the recipient",
          }
        ),
        token: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the token contract",
            }),
            name: t.String({
              description: "Name of the token",
            }),
            symbol: t.AssetSymbol({
              description: "Symbol of the token",
            }),
          },
          {
            description: "Information about the token",
          }
        ),
      },
      {
        description: "Event emitted when tokens are withdrawn",
      }
    ),
  ],
  {
    description: "Token withdrawal event details",
  }
);

/**
 * Schema for TokensFrozenEvent
 */
export const TokensFrozenEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("TokensFrozenEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who froze the tokens",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        amount: t.String({
          description: "Amount of tokens frozen",
        }),
        user: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the user whose tokens were frozen",
            }),
          },
          {
            description: "Information about the user",
          }
        ),
      },
      {
        description: "Event emitted when tokens are frozen",
      }
    ),
  ],
  {
    description: "Token freeze event details",
  }
);

/**
 * Schema for TransferEvent
 */
export const TransferEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("TransferEvent"),
        to: t.Object(
          {
            id: t.EthereumAddress({
              description: "Recipient address of the transferred tokens",
            }),
          },
          {
            description: "Information about the recipient",
          }
        ),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who initiated the transfer",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        from: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address from which tokens were transferred",
            }),
          },
          {
            description: "Information about the source",
          }
        ),
        value: t.String({
          description: "Amount of tokens transferred",
        }),
      },
      {
        description: "Event emitted when tokens are transferred",
      }
    ),
  ],
  {
    description: "Token transfer event details",
  }
);

/**
 * Schema for UnpausedEvent
 */
export const UnpausedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UnpausedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who unpaused the contract",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
      },
      {
        description: "Event emitted when a contract is unpaused",
      }
    ),
  ],
  {
    description: "Contract unpause event details",
  }
);

/**
 * Schema for UserBlockedEvent
 */
export const UserBlockedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UserBlockedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who blocked the user",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        user: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the user who was blocked",
            }),
          },
          {
            description: "Information about the user",
          }
        ),
      },
      {
        description: "Event emitted when a user is blocked",
      }
    ),
  ],
  {
    description: "User block event details",
  }
);

/**
 * Schema for UserUnblockedEvent
 */
export const UserUnblockedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UserUnblockedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who unblocked the user",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        user: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the user who was unblocked",
            }),
          },
          {
            description: "Information about the unblocked user",
          }
        ),
      },
      {
        description: "Event emitted when a user is unblocked",
      }
    ),
  ],
  {
    description: "User unblocked event details",
  }
);

/**
 * Schema for UserAllowedEvent
 */
export const UserAllowedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UserAllowedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who allowed the user",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        user: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the user who was allowed",
            }),
          },
          {
            description: "Information about the allowed user",
          }
        ),
      },
      {
        description: "Event emitted when a user is allowed",
      }
    ),
  ],
  {
    description: "User allowed event details",
  }
);

/**
 * Schema for UserDisallowedEvent
 */
export const UserDisallowedEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UserDisallowedEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who disallowed the user",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
        user: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the user who was disallowed",
            }),
          },
          {
            description: "Information about the disallowed user",
          }
        ),
      },
      {
        description: "Event emitted when a user is disallowed",
      }
    ),
  ],
  {
    description: "User disallowed event details",
  }
);

/**
 * Schema for UnderlyingAssetTopUpEvent
 */
export const UnderlyingAssetTopUpEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UnderlyingAssetTopUpEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who topped up the asset",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
      },
      {
        description: "Event emitted when underlying assets are topped up",
      }
    ),
  ],
  {
    description: "Underlying asset top-up event details",
  }
);

/**
 * Schema for UnderlyingAssetWithdrawnEvent
 */
export const UnderlyingAssetWithdrawnEventSchema = t.Intersect(
  [
    AssetEventSchema,
    t.Object(
      {
        __typename: t.Literal("UnderlyingAssetWithdrawnEvent"),
        sender: t.Object(
          {
            id: t.EthereumAddress({
              description: "Address of the sender who withdrew the asset",
            }),
          },
          {
            description: "Information about the sender",
          }
        ),
      },
      {
        description: "Event emitted when underlying assets are withdrawn",
      }
    ),
  ],
  {
    description: "Underlying asset withdrawal event details",
  }
);

/**
 * Type definition exports for each specific event type
 */
export type AssetEvent = StaticDecode<typeof AssetEventSchema>;
export type AssetCreatedEvent = StaticDecode<typeof AssetCreatedEventSchema>;
export type ApprovalEvent = StaticDecode<typeof ApprovalEventSchema>;
export type BondMaturedEvent = StaticDecode<typeof BondMaturedEventSchema>;
export type BondRedeemedEvent = StaticDecode<typeof BondRedeemedEventSchema>;
export type BurnEvent = StaticDecode<typeof BurnEventSchema>;
export type CollateralUpdatedEvent = StaticDecode<
  typeof CollateralUpdatedEventSchema
>;
export type ManagementFeeCollectedEvent = StaticDecode<
  typeof ManagementFeeCollectedEventSchema
>;
export type MintEvent = StaticDecode<typeof MintEventSchema>;
export type PausedEvent = StaticDecode<typeof PausedEventSchema>;
export type PerformanceFeeCollectedEvent = StaticDecode<
  typeof PerformanceFeeCollectedEventSchema
>;
export type RoleAdminChangedEvent = StaticDecode<
  typeof RoleAdminChangedEventSchema
>;
export type RoleGrantedEvent = StaticDecode<typeof RoleGrantedEventSchema>;
export type RoleRevokedEvent = StaticDecode<typeof RoleRevokedEventSchema>;
export type TokenWithdrawnEvent = StaticDecode<
  typeof TokenWithdrawnEventSchema
>;
export type TokensFrozenEvent = StaticDecode<typeof TokensFrozenEventSchema>;
export type TransferEvent = StaticDecode<typeof TransferEventSchema>;
export type UnpausedEvent = StaticDecode<typeof UnpausedEventSchema>;
export type UserBlockedEvent = StaticDecode<typeof UserBlockedEventSchema>;
export type UserUnblockedEvent = StaticDecode<typeof UserUnblockedEventSchema>;
export type UserAllowedEvent = StaticDecode<typeof UserAllowedEventSchema>;
export type UserDisallowedEvent = StaticDecode<
  typeof UserDisallowedEventSchema
>;
export type UnderlyingAssetTopUpEvent = StaticDecode<
  typeof UnderlyingAssetTopUpEventSchema
>;
export type UnderlyingAssetWithdrawnEvent = StaticDecode<
  typeof UnderlyingAssetWithdrawnEventSchema
>;

/**
 * Union type representing all possible asset events
 */
export type Asset_Event =
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
  | UserAllowedEvent
  | UserDisallowedEvent
  | UnderlyingAssetTopUpEvent
  | UnderlyingAssetWithdrawnEvent;

/**
 * Interface for normalized asset event list items
 */
export const NormalizedEventsListItemSchema = t.Object(
  {
    event: t.String({
      description: "Human-readable event name",
    }),
    timestamp: t.String({
      description: "Formatted timestamp when the event occurred",
    }),
    asset: t.String({
      description: "Address of the asset contract",
    }),
    assetType: t.AssetType({
      description: "Type of asset involved in the event",
    }),
    sender: t.String({
      description: "Address of the transaction sender or 'System'",
    }),
    details: t.Any({
      description: "Complete event details",
    }),
    transactionHash: t.String({
      description: "Transaction hash for the event",
    }),
  },
  {
    description: "Normalized asset event data for display in UI",
  }
);

export type NormalizedEventsListItem = StaticDecode<
  typeof NormalizedEventsListItemSchema
>;
