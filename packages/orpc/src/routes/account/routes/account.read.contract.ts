import { baseContract } from "../../../procedures/base.contract";
import {
  AccountReadSchema,
  AccountSchema,
} from "./account.read.schema";

export const accountReadContract = baseContract
  .route({
    method: "GET",
    path: "/account/read",
    description: "Read account information including identity claims",
    successDescription: "Account information retrieved successfully",
    tags: ["account"],
  })
  .input(AccountReadSchema)
  .output(AccountSchema);
