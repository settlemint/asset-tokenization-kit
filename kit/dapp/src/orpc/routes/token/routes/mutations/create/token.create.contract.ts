import { baseContract } from "@/orpc/procedures/base.contract";
import { transactionHash } from "@/lib/zod/validators/transaction-hash";
import { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";

export const tokenCreateContract = baseContract
  .route({
    method: "POST",
    path: "/token/create",
    description: "Create a new token (deposit, bond, etc.)",
    successDescription: "Token created successfully",
    tags: ["token"],
  })
  .input(TokenCreateSchema)
  .output(transactionHash);
