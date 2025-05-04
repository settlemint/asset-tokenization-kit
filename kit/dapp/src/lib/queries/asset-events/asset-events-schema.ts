import { t } from "@/lib/utils/typebox";

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
