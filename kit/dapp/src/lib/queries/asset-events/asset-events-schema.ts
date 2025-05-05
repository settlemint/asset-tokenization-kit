import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * Base TypeBox schema for asset events
 */
export const AssetEventListSchema = t.Object(
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
    eventName: t.String({
      description: "Name of the event",
    }),
    blockTimestamp: t.Timestamp({
      description: "When the event occurred",
    }),
  },
  {
    description: "Asset event data",
  }
);

export type AssetEventListItem = StaticDecode<typeof AssetEventListSchema>;

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
    eventName: t.String({
      description: "Name of the event",
    }),
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
