import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TokenCreateOutputSchema,
  TokenCreateSchema,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { eventIterator } from "@orpc/server";

export const tokenCreateContract = baseContract
  .route({
    method: "POST",
    path: "/token/create",
    description: "Create a new token (deposit, bond, etc.)",
    successDescription: "Token created successfully",
    tags: ["token"],
  })
  .input(TokenCreateSchema)
  .output(eventIterator(TokenCreateOutputSchema));
