import { baseContract } from "@/orpc/procedures/base.contract";
import {
  EventsResponseSchema,
  TokenEventsInputSchema,
} from "@/orpc/routes/token/routes/token.events.schema";

export const tokenEventsContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/events",
    description: "Get token events history",
    successDescription: "List of token events with details",
    tags: ["token"],
  })
  .input(TokenEventsInputSchema)
  .output(EventsResponseSchema);
