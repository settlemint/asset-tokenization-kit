import { baseContract } from "../../../../../procedures/base.contract";
import { TokenUnpauseInputSchema } from "./token.unpause.schema";
import { TokenSchema } from "../../token.read.schema";

export const tokenUnpauseContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/unpause",
    description: "Unpause token transfers",
    successDescription: "Token unpaused successfully",
    tags: ["token"],
  })
  .input(TokenUnpauseInputSchema)
  .output(TokenSchema);
