import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenApproveInputSchema } from "@/orpc/routes/token/routes/mutations/approve/token.approve.schema";
import { MutationOutputSchema as TokenTransactionOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { eventIterator } from "@orpc/server";

export const tokenApproveContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/approve",
    description: "Approve an address to spend tokens on behalf of the owner",
    successDescription: "Token allowance approved successfully",
    tags: ["token"],
  })
  .input(TokenApproveInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
