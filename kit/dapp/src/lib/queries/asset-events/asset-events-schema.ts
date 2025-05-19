import { type StaticDecode, t } from "@/lib/utils/typebox";

export const AssetEventNameSchema = t.UnionEnum([
  "Transfer",
  "Mint",
  "Burn",
  "RoleGranted",
  "RoleRevoked",
  "RoleAdminChanged",
  "Approval",
  "Pause",
  "Unpause",
  "Clawback",
  "TokensFrozen",
  "UserBlocked",
  "UserUnblocked",
  "UserAllowed",
  "UserDisallowed",
  "TokenWithdrawn",
  "CollateralUpdated",
  "Matured",
  "Redeemed",
  "UnderlyingAssetTopUp",
  "UnderlyingAssetWithdrawn",
  "ManagementFeeCollected",
  "PerformanceFeeCollected",
  "YieldClaimed",
  "AssetCreated",
  "FixedYieldCreated",
  "XvPSettlementCreated",
  "XvPSettlementApproved",
  "XvPSettlementApprovalRevoked",
  "XvPSettlementClaimed",
  "XvPSettlementExecuted",
  "XvPSettlementCancelled",
  "Claimed",
  "Distribution",
  "BatchDistribution",
  "MerkleRootUpdated",
  "VaultCreated",
  "Deposit",
  "RequirementChanged",
  "SubmitTransaction",
  "SubmitERC20TransferTransaction",
  "SubmitContractCallTransaction",
  "ConfirmTransaction",
  "RevokeConfirmation",
  "ExecuteTransaction",
]);

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
    sender: t.Object(
      {
        id: t.EthereumAddress({
          description: "Address of the contract that emitted the event",
        }),
      },
      {
        description: "Information about the event emitter",
      }
    ),
    eventName: AssetEventNameSchema,
    blockTimestamp: t.Timestamp({
      description: "When the event occurred",
    }),
  },
  {
    description: "Asset event data",
  }
);

export type AssetEvent = StaticDecode<typeof AssetEventSchema>;

/**
 * TypeBox schema for asset event detail
 */
export const AssetEventDetailSchema = t.Object(
  {
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
    sender: t.Object(
      {
        id: t.EthereumAddress({
          description: "Address of the contract that emitted the event",
        }),
      },
      {
        description: "Information about the event emitter",
      }
    ),
    eventName: AssetEventNameSchema,
    blockTimestamp: t.Timestamp({
      description: "When the event occurred",
    }),
    blockNumber: t.StringifiedBigInt({
      description: "Block number of the event",
    }),
    transactionHash: t.Hash({
      description: "Transaction hash of the event",
    }),
    txIndex: t.StringifiedBigInt({
      description: "Transaction index of the event",
    }),
    values: t.Array(
      t.Object({
        name: t.String({
          description: "Name of the value",
        }),
        value: t.String({
          description: "Value of the value",
        }),
      })
    ),
  },
  {
    description: "Asset event detail",
  }
);

export type AssetEventDetail = StaticDecode<typeof AssetEventDetailSchema>;
