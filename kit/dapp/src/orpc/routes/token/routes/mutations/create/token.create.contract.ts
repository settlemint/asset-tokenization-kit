import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenCreateContract = baseContract
  .route({
    method: "POST",
    path: "/token/create",
    description:
      "Create a new token (deposit, bond, equity, fund, or stablecoin) and deploy it to the blockchain",
    successDescription:
      "Token created successfully with all contract details and user permissions",
    tags: ["token"],
  })
  .input(TokenCreateSchema)
  .output(TokenSchema);
