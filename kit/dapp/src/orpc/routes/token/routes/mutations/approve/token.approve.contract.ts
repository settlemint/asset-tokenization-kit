import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenApproveInputSchema } from "@/orpc/routes/token/routes/mutations/approve/token.approve.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenApproveContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/approve",
    description: "Approve an address to spend tokens on behalf of the owner",
    successDescription: "Token allowance approved successfully",
    tags: ["token"],
  })
  .input(TokenApproveInputSchema)
  .output(TokenSchema);
