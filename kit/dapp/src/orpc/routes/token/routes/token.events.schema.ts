import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumHash } from "@atk/zod/ethereum-hash";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * Schema for an event value (key-value pair within an event)
 */
export const EventValueSchema = z.object({
  id: z.string().describe("Unique identifier for the event value"),
  name: z.string().describe("Name of the event parameter"),
  value: z.string().describe("Value of the event parameter"),
});

/**
 * Schema for a token event
 */
export const EventSchema = z.object({
  id: z.string().describe("Unique identifier for the event"),
  eventName: z.string().describe("The name of the event"),
  txIndex: z.string().describe("Transaction index"),
  blockNumber: z.string().describe("Block number when the event occurred"),
  blockTimestamp: timestamp().describe("Timestamp when the event occurred"),
  transactionHash: ethereumHash.describe("Transaction hash"),
  emitter: z.object({
    id: ethereumAddress.describe(
      "Address of the contract that emitted the event"
    ),
  }),
  sender: z.object({
    id: ethereumAddress.describe(
      "Address of the account that triggered the event"
    ),
  }),
  values: z
    .array(EventValueSchema)
    .describe("Event parameter values")
    .optional(),
});

/**
 * Type representing a parsed event
 */
export type Event = z.infer<typeof EventSchema>;

/**
 * Input schema for token events query
 */
export const TokenEventsInputSchema = z.object({
  tokenAddress: ethereumAddress.describe("The token contract address"),
});

/**
 * Response schema for TheGraph query
 */
export const EventsResponseSchema = z.object({
  events: z.array(EventSchema),
});

/**
 * Type representing the events response
 */
export type EventsResponse = z.infer<typeof EventsResponseSchema>;
