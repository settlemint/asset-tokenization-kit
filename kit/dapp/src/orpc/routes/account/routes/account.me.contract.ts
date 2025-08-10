import { baseContract } from "@/orpc/procedures/base.contract";
import { AccountSchema } from "@/orpc/routes/account/routes/account.read.schema";

export const accountMeContract = baseContract
  .route({
    method: "GET",
    path: "/account/me",
    description: "Read account information for the authenticated user",
    successDescription: "Account information retrieved successfully",
    tags: ["account"],
  })
  .output(AccountSchema.nullable());
