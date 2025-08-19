import { baseContract } from "../../../../../procedures/base.contract";
import { TokenTransferSchema } from "./token.transfer.schema";
import { TokenSchema } from "../../token.read.schema";

export const tokenTransferContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/transfer",
    description:
      "Transfer tokens (standard, transferFrom, or forced) to one or more addresses",
    successDescription: "Tokens transferred successfully",
    tags: ["token"],
  })
  .input(TokenTransferSchema)
  .output(TokenSchema);
