import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumHash } from "@atk/zod/ethereum-hash";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

export const UserEventsInputSchema = z
  .object({
    limit: z.number().min(1).optional(),
    offset: z.number().min(0).optional(),
    orderBy: z.enum(["blockTimestamp", "eventName", "blockNumber"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
  })
  .optional();

export const UserEventValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

export type UserEventValue = z.infer<typeof UserEventValueSchema>;

export const UserEventSchema = z.object({
  id: z.string(),
  eventName: z.string(),
  txIndex: z.string(),
  blockNumber: z.string(),
  blockTimestamp: timestamp(),
  transactionHash: ethereumHash,
  emitter: z.object({
    id: ethereumAddress,
  }),
  sender: z.object({
    id: ethereumAddress,
  }),
  involved: z.array(
    z.object({
      id: ethereumAddress,
    })
  ),
  values: z.array(UserEventValueSchema).optional(),
});

export type UserEvent = z.infer<typeof UserEventSchema>;

export const UserEventsResponseSchema = z.object({
  events: z.array(UserEventSchema),
  total: z.number(),
});

export type UserEventsResponse = z.infer<typeof UserEventsResponseSchema>;
