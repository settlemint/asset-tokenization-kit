import { baseContract } from "../../../../../procedures/base.contract";
import { TokenApproveInputSchema } from "./token.approve.schema";
import { TokenSchema } from "../../token.read.schema";

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
