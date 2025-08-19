import { baseContract } from "@/procedures/base.contract";
import { EventsResponseSchema, TokenEventsInputSchema } from "./token.events.schema";

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
